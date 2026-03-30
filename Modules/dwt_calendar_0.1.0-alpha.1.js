// name:        dwt_calendar.js
// version:     0.1.0-alpha.1
// description: Campaign Calendar module (unified with Core UI). Ensures/updates 'Campaign Calendar' handout,
//              mirrors state to dwt_mule, consolidates navigation under --calendar, exposes _ns for Core.
//
// NOTE!!!      Regarding the Show Calendar link that is displayed in the unified menu:
//				Roll20 constrains us here: Handouts can store HTML, but no JS. 
//              Interactivity is designed to come from clickable links that fire chat messages.
//              We work around the standard href restrictions with (very sensitive) hrefAttr / Meta-Toolbox plumbing.
//              The calendar’s nav buttons are basically:
//
//              <a href="!dwt --calendar back 1m">back</a>
//              <a href="!dwt --calendar today"><b>today</b></a>
//              <a href="!dwt --calendar forward 1m">forward</a>
//
//              Those live inside the handout/config HTML and just fire normal !dwt commands when clicked. The magic is:
//              The buttons themselves are just <a href="!dwt --calendar back 1m">…</a>.
//              The calendar module knows how to interpret:
//
//              --calendar back 1m
//              --calendar forward 1m
//              --calendar today
//
//              The Meta-Toolbox plumbing (ZeroFrame + hrefAttr) makes sure those links survive Roll20’s HTML sanitizing
//              and actually fire as API commands instead of getting mangled.
//
// depends:     Meta-Toolbox (APILogic + Muler)
// provides:    !dwt --calendar today | --calendar back <#d/m/y> | --calendar forward <#d/m/y> | --calendar set <hour|timeofday|day|month/festival|season|year> <value> | --calendar show <hour|timeofday|day|month/festival|season|year>
// author:      tcm (AI-assisted)
// Semantic Versioning (SemVer) Policy:
// - DWT uses SemVer in the form MAJOR.MINOR.PATCH[-PRERELEASE].
// - Pre-release versions stay in 0.y.z. Anything may change and the API is not yet considered stable.
// - Increment PATCH for backward-compatible bug fixes.
// - Increment MINOR for new backward-compatible functionality.
// - Increment MAJOR only when the public API becomes stable and/or incompatible breaking changes are introduced.
// - Pre-release labels such as alpha, beta, or rc mark unstable builds and sort lower than the matching normal release.
// - Once a version is released, its contents must not be changed; further edits require a new version.
// - Header comments, internal VERSION constants, filenames, generated module text, and documentation references must stay aligned.
// - Dependency notes should use SemVer-friendly wording such as ">= 0.1.0-alpha.1" rather than informal forms like "5.1.0+".

var dwt_calendar = dwt_calendar || (function () {
  'use strict';

  /* ========== Intro ========== */
  var RT = (typeof globalThis!=='undefined') ? globalThis
         : (typeof window!=='undefined')     ? window
         : (typeof self!=='undefined')       ? self
         : (typeof global!=='undefined')     ? global
         : this;

  var VERSION='0.1.0-alpha.1', HANDOUT_NAME='Campaign Calendar', DWT_MULE='dwt_mule';
  var MIN_Y=1300, MAX_Y=1600;
  var _registered=false;

  var MONTHS=[{name:'Hammer (Deepwinter)',short:'Hammer'},{name:'Alturiak (The Claw of Winter)',short:'Alturiak'},
              {name:'Ches (The Claw of Sunsets)',short:'Ches'},{name:'Tarsakh (The Claw of Storms)',short:'Tarsakh'},
              {name:'Mirtul (The Melting)',short:'Mirtul'},{name:'Kythorn (The Time of Flowers)',short:'Kythorn'},
              {name:'Flamerule (Summertide)',short:'Flamerule'},{name:'Eleasis (Highsun)',short:'Eleasis'},
              {name:'Eleint (The Fading)',short:'Eleint'},{name:'Marpenoth (Leafall)',short:'Marpenoth'},
              {name:'Uktar (The Rotting)',short:'Uktar'},{name:'Nightal (The Drawing Down)',short:'Nightal'}];
  var MONTH_KEYS=['hammer','alturiak','ches','tarsakh','mirtul','kythorn','flamerule','eleasis','eleint','marpenoth','uktar','nightal'];

  var BETWEEN=[{key:'midwinter',afterMonth:1,label:'Midwinter (between Hammer & Alturiak)'},
               {key:'greengrass',afterMonth:4,label:'Greengrass (between Tarsakh & Mirtul)'},
               {key:'midsummer',afterMonth:7,label:'Midsummer (between Flamerule & Eleasis)'},
               {key:'shieldmeet',afterMonth:7,label:'Shieldmeet (day after Midsummer — leap years only)',leap:true},
               {key:'highharvestide',afterMonth:9,label:'Highharvestide (between Eleint & Marpenoth)'},
               {key:'feastofthemoon',afterMonth:11,label:'Feast of the Moon (between Uktar & Nightal)'}];

  // Solstices/Equinoxes are fixed by Harptos date, year-independent.
  var WITHIN=[{month:3,day:19,name:'Spring Equinox',season:'spring'},
              {month:6,day:20,name:'Summer Solstice',season:'summer'},
              {month:9,day:21,name:'Autumn Equinox',season:'autumn'},
              {month:12,day:20,name:'Winter Solstice',season:'winter'}];

  /* ========== Utils/State ========== */
  function isLeap(y){ return (y%4)===0; }
  function clamp(y){ return Math.max(MIN_Y, Math.min(MAX_Y, y)); }
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function hrefAttr(s){return String(s||'').replace(/"/g,'&quot;');}
  function cssVars(){ return (RT.dwt && typeof RT.dwt.cssVars==='function') ? RT.dwt.cssVars() : {
    container:'', title:'', card:'', link:'', btn:'', table:'', th:'', td:function(){return ''}, dayLine:'', dot:''
  };}

  function ensureCalendarState(){
    if(!state.dwt) state.dwt={};
    // Core owns palette only; units removed from all modules as of 2.7.x.
    if(!state.dwt.ui) state.dwt.ui={ palette:'parchment' };
    if(!state.dwt.now){
      // Default campaign date for mule mirrors: 0000 hours, early predawn, 1 Hammer, Winter 1492.
      // Season is derived at mirror time; hour/minute tracked for timeofday display.
      state.dwt.now={ year:1492, month:1, day:1, hour:0, minute:0, timeofday:'early morning', festival:'' };
    }
    if(!state.dwt.view){
      var t=todayIndex(); state.dwt.view={ year:t.year, index:t.index };
    }
  }

  /* ============================================================
   * FESTIVAL ART CONFIG  (MAINTAINERS: EDIT HERE)
   * ============================================================
   * Use HTTPS URLs from your Roll20 Art Library (“Copy Image Address”).
   *
   * KEY NORMALIZATION:
   * - We normalize festival keys by lowercasing and removing non-alphanumerics.
   * - So "Feast of the Moon" becomes "feastofthemoon".
   * ============================================================ */

  function normFestivalKey(k){
    return String(k || '').toLowerCase().replace(/[^a-z0-9]/g,'');
  }

  // >>> SET FESTIVAL BACKGROUND IMAGE URLS HERE <<<
  var FESTIVAL_BG_URL = {
    midwinter:      'https://imgur.com/osk3DGn.png',    // <-- SET URL HERE
    greengrass:     'https://imgur.com/osk3DGn.png',    // <-- SET URL HERE
    midsummer:      'https://imgur.com/osk3DGn.png',    // <-- SET URL HERE
    shieldmeet:     'https://imgur.com/osk3DGn.png',    // <-- SET URL HERE
    highharvestide: 'https://imgur.com/osk3DGn.png',    // <-- SET URL HERE
    feastofthemoon: 'https://imgur.com/osk3DGn.png'     // <-- SET URL HERE
  };


/* ============================================================
 * FESTIVAL ART LAYOUT  (MAINTAINERS: EDIT HERE)
 * ============================================================
 * These settings control how the festival background image is displayed
 * inside the single spanning festival cell.
 *
 * WHY THIS EXISTS:
 * - FESTIVAL_BG_URL must remain a pure URL map (string -> string).
  * - Layout overrides are defined separately to avoid breaking assumptions
 *   elsewhere in the calendar renderer.
 *
 * WHAT YOU CAN CONTROL:
 * - size:       CSS background-size. Examples: 'cover', 'contain', '850px 215px'
 * - posX/posY:  CSS background-position X/Y. Examples: '50%', 'center', '60%'
 * - repeat:     CSS background-repeat. Usually 'no-repeat'
 * - padTop/Right/Bottom/Left:
 *              "Padding" around the image by drawing it only within the
 *              content-box (background-clip/origin). This creates an inset
 *              frame without changing the table scaffold.
 * - minHeightPx:
 *              Optional per-festival override of FESTIVAL_MIN_CELL_HEIGHT_PX.
 *
 * NOTE:
 * - If you want true x/y shifting, use posX/posY.
 * - If you want an inset margin around the image, use pad* (content-box clip).
 * ============================================================ */

// >>> SET FESTIVAL IMAGE SIZE / POSITION / PADDING HERE <<<
var FESTIVAL_BG_LAYOUT = {
  // Defaults used when a festival key has no explicit entry below.
  'default': {
    size: '100%',
    posX: '50%',
    posY: '50%',
    repeat: 'no-repeat',
    padTop: '0px',
    padRight: '0px',
    padBottom: '0px',
    padLeft: '0px',
    minHeightPx: null,
      heightPx: null
  },

  // Per-festival overrides (edit as needed)
//  midwinter:      { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null },
//  greengrass:     { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null },
//  midsummer:      { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null },
//  shieldmeet:     { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null },
//  highharvestide: { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null },
//  feastofthemoon: { size:'cover',  posX:'50%', posY:'50%', repeat:'no-repeat', padTop:'0px', padRight:'0px', padBottom:'0px', padLeft:'0px', minHeightPx:null, heightPx:null }
};

function festivalBgLayout(key){
  var nk = normFestivalKey(key);
  var base = FESTIVAL_BG_LAYOUT['default'] || {};
  var ov = FESTIVAL_BG_LAYOUT[nk] || {};
  // Shallow merge with defaults; keep strings as-is.
  return {
    size: (typeof ov.size === 'string' && ov.size) ? ov.size : (base.size || 'cover'),
    posX: (typeof ov.posX === 'string' && ov.posX) ? ov.posX : (base.posX || '50%'),
    posY: (typeof ov.posY === 'string' && ov.posY) ? ov.posY : (base.posY || '50%'),
    repeat: (typeof ov.repeat === 'string' && ov.repeat) ? ov.repeat : (base.repeat || 'no-repeat'),
    padTop: (typeof ov.padTop === 'string') ? ov.padTop : (base.padTop || '0px'),
    padRight: (typeof ov.padRight === 'string') ? ov.padRight : (base.padRight || '0px'),
    padBottom: (typeof ov.padBottom === 'string') ? ov.padBottom : (base.padBottom || '0px'),
    padLeft: (typeof ov.padLeft === 'string') ? ov.padLeft : (base.padLeft || '0px'),
    minHeightPx: (typeof ov.minHeightPx === 'number') ? ov.minHeightPx : (base.minHeightPx || null),
    heightPx: (typeof ov.heightPx === 'number') ? ov.heightPx : (base.heightPx || null)
    };
}

  function festivalBgUrl(key){
    var nk = normFestivalKey(key);
    return FESTIVAL_BG_URL[nk] || '';
  }
  function _pickRandom(arr){
    if(!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function makeQuips(entries){
    var out = [];
    entries = Array.isArray(entries) ? entries : [];
    for(var i=0;i<entries.length;i++){
      var text = String(entries[i] || '').split('|').join('\n').trim();
      if(text) out.push(text);
    }
    return out;
  }

  function makeCalendarQuipSet(shortEntries, mediumEntries, longEntries){
    return {
      short:makeQuips(shortEntries),
      medium:makeQuips(mediumEntries),
      long:makeQuips(longEntries)
    };
  }

  function normalizeQuipPool(arr){
    var out = [];
    arr = Array.isArray(arr) ? arr : [];
    for(var i=0;i<arr.length;i++){
      var text = String(arr[i] || '').trim();
      if(text) out.push(text);
    }
    return out;
  }

  function splitQuipLines(q){
    if(q === null || q === undefined) return [];
    if(Array.isArray(q)) q = q.join('\n');
    q = String(q).replace(/\\n/g, '\n');
    var parts = q.split(/\r\n|\r|\n|\u2028|\u2029/);
    var out = [];
    for(var i=0;i<parts.length;i++){
      var line = String(parts[i] || '').trim();
      if(line) out.push(line);
    }
    return out;
  }

  function renderQuipBlocks(q, lineStyle){
    var lines = splitQuipLines(q);
    var out = '';
    lineStyle = String(lineStyle || 'display:block;margin:0;padding:0;line-height:1.50;');
    for(var i=0;i<lines.length;i++){
      out += '<div style="' + lineStyle + '">' + esc(lines[i]) + '</div>';
    }
    return out;
  }

  function flattenShortQuipInline(q){
    return splitQuipLines(q).join(', ');
  }

  function normalizeQuipLength(length){
    length = String(length || '').toLowerCase().trim();
    if(length === 'medium' || length === 'long') return length;
    return 'short';
  }

  function monthKeyFromValue(value){
    if(typeof value === 'string' && /^[a-z]+$/i.test(String(value || '').trim())){
      var idx = monthIndexFromToken(value);
      if(idx >= 1 && idx <= 12) return MONTH_KEYS[idx - 1];
    }
    var n = parseInt(value, 10);
    if(!isNaN(n) && n >= 1 && n <= 12) return MONTH_KEYS[n - 1];
    return '';
  }

  function festivalMonthFallback(key){
    key = normFestivalKey(key);
    for(var i=0;i<BETWEEN.length;i++){
      if(normFestivalKey(BETWEEN[i].key) === key) return BETWEEN[i].afterMonth;
    }
    return 1;
  }

  function currentMonthIndexForQuips(now){
    now = now || ((state.dwt && state.dwt.now) || {});
    var month = parseInt(now.month, 10);
    if(!isNaN(month) && month >= 1 && month <= 12) return month;
    if(now.festival) return festivalMonthFallback(now.festival);
    return 1;
  }

  function appendQuips(out, arr){
    var pool = normalizeQuipPool(arr);
    for(var i=0;i<pool.length;i++) out.push(pool[i]);
  }

  function loadCalendarRegionEntries(){
    var raw = String(getAbilityAction(getOrCreateMule(), 'regions') || '').trim();
    if(!raw) return [];
    try{
      var parsed = JSON.parse(raw);
      var regions = (parsed && parsed.regions && typeof parsed.regions === 'object' && !Array.isArray(parsed.regions)) ? parsed.regions : {};
      var out = [];
      var keys = Object.keys(regions);
      for(var i=0;i<keys.length;i++){
        var entry = regions[keys[i]];
        if(entry && typeof entry === 'object' && !Array.isArray(entry)) out.push(entry);
      }
      return out;
    }catch(e){
      return [];
    }
  }

  var CALENDAR_QUIPS = {
    months:{
      hammer:makeCalendarQuipSet([
        "Hammer shuts the harbor tight with glassy night|Still watch-bells call the quay to lantern light",
        "Deepwinter locks the pilings fast in iron frost|Yet captains grin and swear no honest tide is lost",
        "The nets hang stiff as chapel boards in salted white|But Saint Velen keeps a coal for every boat tonight"
      ],[
        "Hammer locks the harbor stones|with pilings rimed in white|a dockhand cups Saint Velen's coal|and swears the frost burns bright",
        "Deepwinter leans on quay and bell|and hushes half the town|yet every tavern window glows|when blue dusk settles down",
        "The gulls stand still on frozen rope|as if they feared the sky|a ferryman just grins at them|and lets the black tide sigh"
      ],[
        "Hammer comes with iron dawn|and pilings glazed in white|the chapel bell sounds small and thin|yet hearths answer bright|a ferryman with frozen beard|still blesses stew and flame|for Deepwinter may tax the bones|but never tame his name",
        "The nets hang hard as chapel boards|beneath a moon of glass|a watchman walks the harbor wall|and hears the night-wind pass|inside the inn the kettles hum|beside the patient fire|so Hammer teaches weathered souls|the worth of small desire",
        "By dawn the harbor stones are blue|by noon the sea is lead|Saint Velen's shrine wears candles thick|for crews the ice might dread|a widow spreads her woolen shawl|across the bench for three|for Hammer tells the whole cold coast|that kindness outlasts sea"
      ]),
      alturiak:makeCalendarQuipSet([
        "Alturiak bites the knuckles raw on rope and rail|Yet crews still hum to keep some heart inside the gale",
        "The Claw of Winter scrapes the surf with sleet and spray|And every tavern swears the storm will spend itself by day",
        "Cold moon on frozen casks, cold stars on harbor black|Still smugglers bless a silent oar and pray the tide turns back"
      ],[
        "Alturiak claws mast and cheek|with sleet against the pane|a captain knots his scarf once more|and dares the cutting rain",
        "The Claw of Winter scrapes the bay|with iron on the pane|a tavern maid bars one more door|then laughs to hear the rain",
        "Black water heaves below the wharf|while north winds comb the foam|a smuggler smiles through salted teeth|and rows the hard tide home"
      ],[
        "Alturiak comes claw in hand|with sleet against the pane|the piers go black, the rigging sings|and ropes drink iron rain|a captain pulls his collar high|and trusts his boat and prayer|for Winter's Claw respects no pride|but yields to patient care",
        "The harbor shrinks to lamp and hood|beneath a needling sky|the gulls fly low above the surf|as if they would not cry|inside the inn the dice roll warm|and cider runs like gold|so Alturiak learns the quay|still carries hearts too bold",
        "By dawn the stairs are glass with sleet|by dusk the wind is steel|a ferryman still takes his pole|and says the cold is real|Saint Velen's shrine wears wool and wax|against the black and salted foam|for in the Claw of Winter folk|make stubborn weather home"
      ]),
      ches:makeCalendarQuipSet([
        "In Ches the thaw runs brown with bark along the pier|And every gull cries news of trade and brighter weather near",
        "The river shrugs its winter skin and starts to shine|So coopers roll their freshest casks and call the season fine",
        "Soft rain on roof and rope, soft light on mud and mast|A sailor says the kindest wind's the one that comes at last"
      ],[
        "In Ches the thaw begins to talk|beneath the eaves with rain|a cooper rolls his empty casks|and blesses mud again",
        "Brown water runs from roof to quay|and softens all the clay|a fishwife lifts her sleeves and laughs|for spring has found the bay",
        "The river shrugs its winter coat|and starts to shine at noon|a dockhand says the kindest winds|arrive a little soon"
      ],[
        "Ches arrives in dripping shoes|with mud along the lane|the ice lets go the harbor stairs|and roofs begin to rain|a cooper rolls the casks outside|to taste the softer air|for Ches reminds the working coast|that spring is almost there",
        "The river wakes from winter sleep|and shoulders brown with foam|the gulls return to louder work|and make the wharves their home|a chandlers' boy forgets his scarf|to watch the sunlit mast|for Ches can make a cautious heart|believe in thaw at last",
        "In Ches the chapel steps grow slick|with rain and tracked-in clay|the harbor smells of rope and bark|instead of frost all day|a widow puts geranium seeds|beside the kitchen stone|for Ches persuades the coldest soul|not to remain alone"
      ]),
      tarsakh:makeCalendarQuipSet([
        "Tarsakh sends a drum of rain on shingle, sail, and slate|Yet every child along the docks still dares the thunder gate",
        "The storm month snaps the pennants hard above the foam|Then leaves a washed and shining quay that almost looks like home",
        "Saint bells ring through weather black and lantern-yellow dark|While ferrymen make jokes at squalls and nose from mark to mark"
      ],[
        "Tarsakh beats the rooftops hard|with thunder over slate|a harbor boy runs bare of hood|and calls the weather great",
        "The storm month snaps the pennants straight|and salts the chapel door|a ferryman just squints at squalls|and rows the louder roar",
        "Rain writes its quick gray scripture down|on shingle, mast, and rail|a tavern maid lights every lamp|to spite the storming gale"
      ],[
        "Tarsakh comes on drumming feet|with thunder over slate|the harbor ropes all leap at once|as if they heard their fate|a ferryman with rain-blind eyes|still laughs against the gale|for Storm Month teaches every quay|to bend and yet not fail",
        "The gutters roar, the signboards swing|beneath a bruised sky|the sea throws white against the wall|and gulls forget to fly|inside the inn the candles bow|but keep their stubborn flame|for Tarsakh tests the harbor hard|yet cannot shame its name",
        "By dusk the town is washed to tar|by dawn it shines like glass|the squalls have worried every mast|and let no sleeper pass|a child counts seconds after thunder|from the window seat|for Tarsakh makes the fiercest dark|feel wild and oddly sweet"
      ]),
      mirtul:makeCalendarQuipSet([
        "Mirtul smells of wet green rope and markets after rain|The sort of month that coaxes luck through every crack again",
        "The pilings steam at dawn awhile, the tide runs clean and bright|And even old men at the wharf talk kindly in the light",
        "New grass beyond the seawall shines like cloth beside the bay|A dockhand says the year's gone soft enough to earn its pay"
      ],[
        "Mirtul smells of wet green rope|and pilings after rain|an old man on the harbor bench|decides the year seems sane",
        "New grass beyond the seawall shines|with light enough for play|a fishwife wipes her hands and smiles|to see the brighter bay",
        "Warm drizzle beads the market awns|and darkens cart and mast|a sailor says the kindest wind|is often one that lasts"
      ],[
        "Mirtul comes in polished rain|with green beyond the wall|the pilings steam at break of day|the gulls grow keen and call|a dockhand lingers by the slips|to watch the clean tide pass|for Mirtul makes a weathered town|feel washed like chapel glass",
        "The gardens climb the harbor steps|in herb and daisy leaf|the sea goes mild, the roofs go bright|the inns mislay their grief|a cooper leaves his shutters wide|to taste the greener air|for Mirtul teaches even toil|that gentler days are there",
        "By noon the quay smells half of tar|and half of growing thyme|the ferry ropes lie dark and soft|and seem to keep good time|a widow sets her laundry out|and watches white sheets fly|for Mirtul coaxes hope from boards|beneath a rinsed blue sky"
      ]),
      kythorn:makeCalendarQuipSet([
        "Kythorn hangs flowers from the eaves and salt upon the breeze|The harbor keeps one tune for saints and one for easy seas",
        "Warm mornings find the trawlers out before the bells can chime|And lovers linger by the slips as if the tide kept time",
        "The Time of Flowers sweetens tar, wet planks, and open ale|Till even hard-eyed harbor wives look pleased to watch a sail"
      ],[
        "Kythorn hangs flowers from the eaves|and salt upon the breeze|the harbor keeps one hymn for saints|and one for easy seas",
        "Warm mornings spill from Kythorn's bells|through blossom, foam, and light|a trawler leaves before the noon|while sweethearts linger bright",
        "The Time of Flowers softens tar|and coaxes ale to cheer|even the hardest harbor wife|looks pleased to watch sails near"
      ],[
        "Kythorn comes garlanded in bloom|with salt upon the breeze|the harbor sings two different songs|for saints and easy seas|a florist pins white bells to rope|above a painted door|for Time of Flowers makes the quay|look younger than before",
        "Warm dawn goes gold on fisher sails|and roses on the wall|the market smells of pears and tar|the swifts dip low and call|a lover waits beside the slips|pretending not to care|for Kythorn makes the patient heart|believe that luck is fair",
        "By dusk the lanterns bloom like fruit|along the mooring posts|the ale runs cool, the air runs soft|the sea forgets its boasts|a widow laughs to hear the fiddles|under the clear sky|for Kythorn lets the sternest soul|remember how to sigh"
      ]),
      flamerule:makeCalendarQuipSet([
        "Flamerule lays copper heat on cobble, rope, and spar|The beer goes thin, the tempers quick, the gossip carries far",
        "At noon the harbor blinks like brass beneath a brazen sky|Then evening cools the lantern glass and draws the singers nigh",
        "Hot wind and bright salt make the masts hum low at noon|A sailor swears the moon will rise as red as copper soon"
      ],[
        "Flamerule lays a copper hand|on cobble, rope, and spar|a barkeep thins the tavern ale|because the day burns far",
        "At noon the harbor blinks like brass|beneath a brazen sky|a captain seeks the narrow shade|and lets the gulls go by",
        "Hot wind makes all the rigging hum|and stills the dogs at noon|yet evening brings one cooler breath|and every bench fills soon"
      ],[
        "Flamerule comes with copper noon|on cobble, rope, and spar|the harbor blinks in molten light|the tavern talk drifts far|a barkeep keeps the ale half-cool|with cloth around the cask|for Summertide can wilt a town|before men drop the mask",
        "The awnings droop above the quay|the dogs lie still in shade|the gulls wheel slow beyond the masts|as if the heat were made|to test the patient and the proud|until the sun sits low|then evening spills a softer wind|and lets the whole town glow",
        "Hot weather hums through every line|and turns the tar to scent|a ferryman poles carefully|as if the day were bent|but when the moon comes up at last|above the darkening bar|Flamerule gives the night a breeze|and mends the temper's scar"
      ]),
      eleasis:makeCalendarQuipSet([
        "Eleasis ripens figs and rumors by the quay|The sort of month when every smile looks honest for a day",
        "Highsun turns tar to velvet black and shutters half the town|Till sunset wakes the dice again and spills the laughter down",
        "The gulls grow lazy in the blaze, the bells ring soft at noon|And every captain prays for wind to reach the harbor soon"
      ],[
        "Eleasis ripens fig and grape|and shutters half the square|the gulls grow lazy over foam|and noon sits heavy there",
        "Highsun turns every cobble bright|and every rumor sweet|a merchant fans his ledger slow|while dogs dream in the heat",
        "The harbor waits for evening wind|through bells gone soft and small|then laughter wakes with candlelight|and spills from every wall"
      ],[
        "Eleasis ripens quay and vine|beneath a white-hot sky|the gulls drift slow above the masts|too drowsy yet to cry|a merchant shades his careful books|with one embroidered fan|for Highsun teaches even greed|to soften where it can",
        "By noon the harbor lanes go still|except for sandals, flies|the figs grow dark, the shutters close|against the glaring skies|but evening brings the dice awake|and cools the market glow|so Eleasis proves that heat|must always soften slow",
        "The sea lies bright as polished tin|the roofs lie pale as bone|a fishwife keeps her awning low|and leaves the shade alone|then after dusk the fiddles start|beneath a patient moon|for Highsun makes the longest tales|wait kindly until soon"
      ]),
      eleint:makeCalendarQuipSet([
        "Eleint puts an amber edge on rope, leaf, wave, and field|A gentle warning summer's purse has nearly made its yield",
        "The Fading teaches tavern fires to matter after dusk|And sends the first keen weather through the nets with apple musk",
        "Cool dawn along the harbor wall, cool wine in shaded stone|A sailor counts the quieter birds and feels the year turn bone"
      ],[
        "Eleint lays amber on the ropes|and cool along the lane|a sailor counts the quieter gulls|and feels the year begin to wane",
        "The Fading wakes the tavern fires|a little after dusk|and sends one sharper weather note|through net, through leaf, through musk",
        "First apples scent the harbor carts|and first geese cross the foam|a dockhand says the autumn wind|already thinks of home"
      ],[
        "Eleint comes trimmed in amber light|with cool upon the lane|the gulls grow fewer on the roofs|the nights remember rain|a tavern lights its hearth too soon|and no one calls it wrong|for Fading teaches summer's end|in smoke and slower song",
        "The apples reach the harbor carts|the nets smell leaf and musk|the sea stays blue by afternoon|and silver after dusk|a sailor lingers by the wall|to watch the swallows roam|for Eleint makes the whole wide world|lean gently toward home",
        "By dawn the quay smells sweet with pears|by dusk the light turns thin|the first brown leaves ride through the slips|where summer lately had been|a widow folds one woolen shawl|beside the chapel door|for Eleint tells the weathered heart|to gather in once more"
      ]),
      marpenoth:makeCalendarQuipSet([
        "Marpenoth shakes the yellow leaves through rigging, lane, and yard|The tide grows stern, the shutters early, and the bread grows hard",
        "Leafall comes whispering over roofs with chimney smoke and rain|And every inn keeps closer chairs against the dark again",
        "The harbor ducks its head a bit beneath the cawing crows|As if the whole long coast already hears the winter blows"
      ],[
        "Marpenoth shakes the yellow leaves|through rigging, lane, and yard|the tide grows stern, the shutters early|and the bread grows hard",
        "Leafall comes whispering with smoke|and crows above the quay|an innkeeper brings closer chairs|and lights the lamps by three",
        "Rain worries roof and harbor wall|while dark arrives too soon|a sailor blesses mulled black ale|and any honest room"
      ],[
        "Marpenoth comes with leaf and smoke|through rigging, lane, and yard|the tide turns stern, the bread turns crust|the benches all grow hard|an innkeep pulls the chairs in close|before the crows can call|for Leafall teaches every town|to gather from the squall",
        "Yellow leaves skate across the quay|and stick to tar and rain|the chimneys start their evening work|before the bells again|a sailor warms his hands on stew|and watches dusk draw near|for Marpenoth makes comfort seem|a wiser thing than cheer",
        "By noon the harbor smells of wood|by dusk of soup and clove|the gulls all quarrel over scraps|while crows patrol above|a widow bars the weather side|of every rattling door|for Leafall says the long cold road|is closer than before"
      ]),
      uktar:makeCalendarQuipSet([
        "Uktar bruises fruit and reed and turns the earth to brown|Yet soup smells rich in every court where evening settles down",
        "The Rotting month puts honest rot in apple, leaf, and net|A wise one mends what still can mend and pays the debts unmet",
        "Wet fog along the quay at dawn, wet mud along the lane|And every merchant counts his casks, then counts them all again"
      ],[
        "Uktar bruises leaf and reed|and turns the path to brown|yet every kitchen by the quay|smells twice as rich by sundown",
        "The Rotting month puts honest rot|in apple, leaf, and lane|a wise one mends what still may last|before the soaking rain",
        "Wet fog along the harbor stairs|turns every bell half-blind|a fishwife laughs and stirs the pot|for cold is close behind"
      ],[
        "Uktar comes with bruised brown leaves|and fog along the quay|the apples sink, the net cords stink|the crows all disagree|a merchant checks his cellar latch|before the dark and rain|for Rotting teaches prudent souls|to count their stores again",
        "The roads grow slick, the gardens soft|the last pears lose their shine|the harbor smells of dampened rope|and soup with clove and wine|a widow dries the herbs inside|above the kitchen stone|for Uktar says what keeps through cold|must now be kept alone",
        "By dawn the fog has taken half|the masts along the bar|by dusk the lamps glow thicker there|and warmer than they are|a ferryman mends oar and hook|before the frost comes near|for Uktar tells the wise to mend|what winter soon will wear"
      ]),
      nightal:makeCalendarQuipSet([
        "Nightal draws the lantern close and leaves the harbor spare|The sea grows black as widow silk, the saints feel nearer there",
        "Cold stars above the anchored masts, cold lamps below the pale|Yet every window by the docks keeps faith against the gale",
        "The Drawing Down pulls voices low in chapel, inn, and yard|But those who share a fire and song can face the dark unscarred"
      ],[
        "Nightal draws the lantern close|and sets the sea to glass|the saints feel near beyond the dark|while black tides whisper past",
        "Cold stars above the anchored masts|look sharp as chapel nails|a tavern girl feeds cedar fire|against the outside gales",
        "The Drawing Down makes voices low|in chapel, inn, and yard|yet those who share a fire and song|find winter less hard"
      ],[
        "Nightal comes with lantern hands|and stars like frozen nails|the harbor blackens into silk|beneath the chanting gales|a chapel keeps its candles trim|against the outer foam|for Drawing Down reminds the lost|how warm one room is home",
        "The sea goes dark as widow cloth|the bells go thin and clear|the shutters take the weather's knock|as winter edges near|inside the inn the benches fill|with clove and cedar smoke|for Nightal makes a tender feast|of every kindly joke",
        "By dusk the quay is mostly lamp|by dawn the roofs are white|a ferryman still checks the chain|and thanks the stubborn light|Saint Velen's shrine keeps watchful wax|beside the harbor flame|for Drawing Down can deepen dark|but never take its name"
      ])
    },
    festivals:{
      midwinter:makeCalendarQuipSet([
        "Midwinter heaps the hearth with flame against the night|And every oath sounds warmer said by ember light",
        "The longest dark makes cider dear and kin seem right|Even grudges lose a little edge by candlelight",
        "Snow at the sill, song in the hall, and shutters tight|A good cup makes the year turn softer by the light"
      ],[
        "Midwinter draws the benches near|And heaps the hearth with light|Even old grudges thaw a little there|When cups go warm all night",
        "The longest dark sits at the door|But candles answer bright|A wise one keeps the gentlest vows|Upon a winter night",
        "Snow hushes lane and harbor roof|The saints seem close in frost|Midwinter teaches quiet hearts|What kindness weather costs"
      ],[
        "Midwinter lays its longest dark|Against the shuttered pane|But hearthlight makes the benches glow|And warms the room again|An old man names the dead with care|Then fills the waiting cup|For winter turns most gentle when|The living gather up",
        "Snow settles white on rope and sill|And stills the harbor bell|The wind may worry roof and eave|But indoors all is well|A baker shares the final loaf|A widow shares the wine|For Midwinter reminds a town|That kindness outlasts time",
        "When Midwinter comes to quay and court|The lamps are trimmed with care|Even grudges lose their sharpest edge|In such a firelit air|A promise spoken softly then|Can hold through frost and foam|For on the longest night of all|Warm hearts make truer home"
      ]),
      greengrass:makeCalendarQuipSet([
        "Greengrass lifts the harbor weed and paints the hedges green|The world looks washed and willing as if sorrow had not been",
        "Fresh leaves on shrine and fisher skiff, fresh mud along the lane|A kindly spring can make a hard heart bloom again",
        "Greengrass puts blossom on the wall and hope in every hand|Even the tide comes in tonight as though it knew the land"
      ],[
        "Greengrass wakes the harbor wall|With blossom, mud, and rain|A hard heart feels its hinges lift|And tries for spring again",
        "Fresh leaves on shrine and fisher skiff|Hang bright above the lane|A neighbor who said little all of winter|Finds room for speech again",
        "The first soft weather on the bay|Coaxes weeds along the quay|Greengrass reminds the careful soul|That mercy learns to stay"
      ],[
        "Greengrass comes with tender rain|And green along the stones|The harbor wall takes root in cracks|The winter leaves its bones|A child hangs blossoms on a shrine|A sailor mends his net|For spring can ask a wounded world|To risk beginning yet",
        "Fresh leaves appear on yard and hedge|And mud returns the lane|The gulls grow loud, the grass grows bold|And hope grows back again|A fishwife laughs to smell the earth|Beneath the salt and spray|For Greengrass tells the doubting heart|Not all dead things must stay",
        "When Greengrass stirs the harbor weed|And paints the hedges new|Even the oldest dockside oath|Feels easier to renew|A ferryman sets out young herbs|Beside his weathered door|For spring does not erase the scars|But teaches something more"
      ]),
      midsummer:makeCalendarQuipSet([
        "Midsummer crowns the quay with fire and fiddlers after noon|The dark comes late and leaves the town still singing to the moon",
        "Bright lanterns swing from mast to mast till even rogues look fair|A warm night makes old widows smile and salt seem sweet as air",
        "On Midsummer the bells ring bold and every cup runs bright|You tell the truth or kiss a lie before the end of night"
      ],[
        "Midsummer crowns the harbor masts|With lantern, song, and fire|A timid heart will risk the truth|When fiddles climb the higher",
        "The longest day refuses hush|And makes the shoreline bright|Even careful widows smile a bit|At such a reckless night",
        "On Midsummer the bells ring bold|And torches gild the foam|A lie may kiss before it slips away|But truth walks laughing home"
      ],[
        "Midsummer lifts the lantern poles|And fires the harbor bright|The fiddles chase the dark away|Though dawn delays the night|A shy man dares a truer word|A widow dares a dance|For under such a brazen moon|Even caution grants a chance",
        "The longest day leans toward the sea|And will not quickly die|The torches answer mast to mast|Beneath a copper sky|A rogue looks honest in that light|A saint looks young and warm|For Midsummer can gild a town|Beyond its weekday form",
        "When Midsummer bells shake the quay|And cups go gold with flame|The bold kiss truth, the shy kiss luck|And both speak love's near name|A captain leaves his ledgers closed|A fishwife leaves her stall|For on that hot and laughing night|Joy makes the measure small"
      ]),
      shieldmeet:makeCalendarQuipSet([
        "Shieldmeet sets the charter out where all can read the ink|A wise lord fears the silent room far more than alehouse drink",
        "Once in four years the market stops and even captains wait|For law to stand in open sun and speak the weight of state",
        "On Shieldmeet every promise wants a witness in the square|A city keeps its honor best when all can see it there"
      ],[
        "Shieldmeet lays the charter plain|Beneath the open sun|A city's honor grows the most|When public work is done",
        "Once in four years the market stills|So law may take the square|A promise sounds most solid then|When witnesses are there",
        "No lord looks grand on Shieldmeet long|If questions crowd the gate|The feast belongs to honest speech|And daylight over state"
      ],[
        "Shieldmeet sets the charter forth|Where all the square may read|No whispered law nor shuttered room|Can serve a public need|A promise weighed in open day|Will either stand or fail|For cities keep their honor best|When sunlight tips the scale",
        "Once in four years the market waits|And gathers in the square|The feast is less for song and ale|Than witness gathered there|A lord may wear his richest cloak|Yet still speak plain and straight|For Shieldmeet loves the honest tongue|More than the pomp of state",
        "The bells ring out for Shieldmeet day|And shutters open wide|Accounts are read, old questions asked|And none may safely hide|A city learns what strength it owns|When every eye may see|For law grows stoutest in the sun|Not in secrecy"
      ]),
      highharvestide:makeCalendarQuipSet([
        "Highharvestide fills net and cart and bids the cellar swell|A richer table counts for less if neighbors hunger well",
        "The granary smells of grain and dust, the presses stain the floor|You thank the year by sharing bread and locking no one's door",
        "At harvest even harbor men look kindly on the field|For salt and soil both earn a purse when honest hands will yield"
      ],[
        "Highharvestide fills cart and loft|With grain, with fruit, with cheer|Yet bread tastes best when shared abroad|Before the lean draws near",
        "The granary smells of dust and wheat|The presses stain the floor|A harvest is a blessing only|If no one bars the door",
        "At Highharvestide the ledgers close|And soup begins to steam|The wise give thanks in loaves and ale|Not in a trader's dream"
      ],[
        "Highharvestide fills cart and loft|With grain and apples red|The presses stain the cellar floor|The ovens scent with bread|A prudent hand counts what was gained|Then sets a portion wide|For harvest thanks ring truest where|No hungry folk are denied",
        "The granary smells of dust and wheat|The vines run thick with stain|The market hums with tally and laugh|After the labor's pain|A farmer lifts a loaf and cup|A sailor lifts the same|For Highharvestide joins salt and soil|At one forgiving flame",
        "When Highharvestide meets the quay|The barns are full and sound|Even harbor folk look kindly then|On every inland ground|A merchant closes careful books|A widow stirs the stew|For autumn's richest blessing is|Enough to share with you"
      ]),
      feastofthemoon:makeCalendarQuipSet([
        "Feast of the Moon lays quiet plates beside the lamplit room|And every name we speak with love pushes a little at the gloom",
        "The tide runs hush, the candles low, the bread is passed in grace|Loss sits close, yet so does love, and neither leaves its place",
        "Moonlight on the empty chair, warm hands around the spoon|The dead feel near and gentle on the Feast beneath the moon"
      ],[
        "Feast of the Moon sets quiet plates|In lamplit room and hall|The dead come nearest when the living|Speak their names with all",
        "Moonlight rests on empty chairs|And candles keep the room|A gentle tale can hold back grief|Though not entirely the gloom",
        "The tide runs hush beyond the wall|While bread goes hand to hand|The ones we miss sit close that night|As if they understand"
      ],[
        "Feast of the Moon sets quiet chairs|Beside the lamplit room|The living speak the missing names|And push against the gloom|A child asks after one long gone|An elder tells the tale|For moonlit grief grows easier borne|When memory does not fail",
        "Moonlight lies on empty bowls|And silver on the floor|The hands that pass the bread that night|Remember who passed before|A widow smiles through patient tears|A sailor bows his head|For Feast of the Moon keeps love alive|Among the living and dead",
        "The tide runs hush beyond the wall|The candles bend but low|Each story told for absent kin|Makes warmer all the glow|No bargain's struck, no boast is made|Only the names are sown|For on that tender autumn feast|No heart need grieve alone"
      ])
    }
  };

  function builtinCalendarQuips(kind, key, length){
    kind = (String(kind || '').toLowerCase() === 'festival') ? 'festival' : 'month';
    length = normalizeQuipLength(length);
    key = (kind === 'festival') ? normFestivalKey(key) : monthKeyFromValue(key);
    var out = [];
    var bucketName = (kind === 'festival') ? 'festivals' : 'months';
    var bucket = (CALENDAR_QUIPS[bucketName] && CALENDAR_QUIPS[bucketName][key]) || null;
    if(bucket && Array.isArray(bucket[length])) appendQuips(out, bucket[length]);
    return out;
  }

  function regionCalendarQuips(kind, key, length){
    kind = (String(kind || '').toLowerCase() === 'festival') ? 'festival' : 'month';
    length = normalizeQuipLength(length);
    key = (kind === 'festival') ? normFestivalKey(key) : monthKeyFromValue(key);
    var out = [];
    var bucketName = (kind === 'festival') ? 'festivals' : 'months';
    var regions = loadCalendarRegionEntries();
    for(var i=0;i<regions.length;i++){
      var quips = (((regions[i] || {}).quips || {}).calendar || {});
      var bucket = (((quips[bucketName] || {})[key]) || {});
      appendQuips(out, bucket[length]);
    }
    return out;
  }

  function collectCalendarQuips(kind, key, length){
    var out = builtinCalendarQuips(kind, key, length);
    var extra = regionCalendarQuips(kind, key, length);
    for(var i=0;i<extra.length;i++) out.push(extra[i]);
    return out;
  }

  function resolveMonthQuip(month, length){
    return _pickRandom(collectCalendarQuips('month', month, length));
  }

  function resolveFestivalQuip(key, length){
    return _pickRandom(collectCalendarQuips('festival', key, length));
  }

  // >>> SET FESTIVAL MINIMUM CELL HEIGHT HERE <<<
  // This preserves stable handout sizing when switching Month ↔ Festival views.
  // Value is pixels.
  var FESTIVAL_MIN_CELL_HEIGHT_PX = 100;  // <-- ADJUST MIN HEIGHT HERE


  /* ========== Sequencing/Render ========== */
  function playerDisplayName(pid){
    try{
      var player = getObj('player', pid);
      if(!player) return 'GM';
      return String(player.get('_displayname') || player.get('displayname') || 'GM');
    }catch(e){
      return 'GM';
    }
  }

  function whisperToPlayer(pid, line){
    var target = String(playerDisplayName(pid) || 'GM').replace(/"/g, '\\"');
    sendChat('DWT', '/w "' + target + '" ' + line);
  }

  function buildSeq(y){
    var seq=[];
    for(var m=1;m<=12;m++){
      seq.push({t:'month',m:m});
      for(var i=0;i<BETWEEN.length;i++){
        var b=BETWEEN[i];
        if(b.afterMonth===m && (!b.leap || isLeap(y))){
          seq.push({t:'festival',key:b.key,label:b.label});
		          }
      }
    }
    return seq;
  }
  function idxForMonth(seq,m){
    for(var i=0;i<seq.length;i++){ if(seq[i].t==='month' && seq[i].m===m) return i; }
    return 0;
  }
  function idxForFest(seq,k){
    for(var i=0;i<seq.length;i++){ if(seq[i].t==='festival' && seq[i].key===k) return i; }
    return -1;
  }

  function seasonTintFor(pal,season){
    if(pal==='parchment'){
      return season==='spring'?'#e8f5e9':season==='summer'?'#ffe8e0':season==='autumn'?'#f7ecd9':season==='winter'?'#e7eef7':'';
    }else if(pal==='powder'){
      return season==='spring'?'#e2f5e3':season==='summer'?'#f9e0e0':season==='autumn'?'#faecd7':season==='winter'?'#e0ecfb':'';
    }else if(pal==='mint'){
      return season==='spring'?'#dbf5e2':season==='summer'?'#f6e6e0':season==='autumn'?'#f3ecd7':season==='winter'?'#e0f2f4':'';
    }else if(pal==='rosebud'){
      return season==='spring'?'#ffe8ee':season==='summer'?'#ffe0e4':season==='autumn'?'#ffe9dc':season==='winter'?'#f1ecff':'';
    }else if(pal==='dark'){
      return season==='spring'?'#2d3f2d':season==='summer'?'#3f2d2d':season==='autumn'?'#3f372c':season==='winter'?'#2c3643':'';
    }
    return '';
  }

  function headerCal(title){
    var v=cssVars(); return '<div'+(v.container?(' style="'+v.container+'"'):'')+'><div'+(v.title?(' style="'+v.title+'"'):'')+'>'+esc(title)+'</div>';
  }
  function endPanel(){return'</div>';}

  function navBar(){
    var v = cssVars(), pad='margin:0 12px 8px 0;';
    return '<div style="margin-top:10px;text-align:center;">'
         + '<a href="'+esc('!dwt --calendar back 1m')+'" '+(v.btn?('style="'+v.btn+pad+'"'):'style="'+pad+'"')+'>&#9664; back</a>'
         + '<a href="'+esc('!dwt --calendar today')+'" '+(v.btn?('style="'+v.btn+pad+'"'):'style="'+pad+'"')+'><b>today</b></a>'
         + '<a href="'+esc('!dwt --calendar forward 1m')+'" '+(v.btn?('style="'+v.btn+pad+'"'):'style="'+pad+'"')+'>forward &#9654;</a>'
         + '</div>';
  }

  function withinInfo(month,day){
    for(var i=0;i<WITHIN.length;i++){ var w=WITHIN[i]; if(w.month===month && w.day===day) return w; }
    return null;
  }

  // Only tint the specific Solstice/Equinox day cell (not the whole month)
  function renderMonthTable(year, month){
    var v=cssVars(), built=headerCal(MONTHS[month-1].name);
    var monthQuip = flattenShortQuipInline(resolveMonthQuip(month, 'short'));
    if(monthQuip){
      built+='<div style="margin:8px 0;"><span style="font-style:italic;">'+esc(monthQuip)+'</span></div>';
    }

    // SECOND LINE: show season + year, e.g. "Spring 1492 DR" instead of "Mirtul — 1492 DR"
    var seasonKey = seasonKeyFromMonth(month);
    var seasonLabel = seasonKey ? (seasonKey.charAt(0).toUpperCase()+seasonKey.slice(1)) : '';
    var headerLine = seasonLabel ? (seasonLabel+' '+year+' DR') : ((MONTHS[month-1].short)+' '+year+' DR');
    built+='<div><span style="font-weight:bold;">'+esc(headerLine)+'</span></div>';

    var btnBg = (function(){ var m=(v.btn||'').match(/background:\s*([^;]+)/i); return m?m[1].trim():'#555'; })();
    var btnText = (function(){ var m=(v.btn||'').match(/color:\s*([^;]+)/i); return m?m[1].trim():'#fff'; })();
    var thStyle = (v.th? v.th : 'border:1px solid #555;padding:0;text-align:center;height:8px;') + 'background:'+btnBg+';color:'+btnText+';';

    built+='<table'+(v.table?(' style="'+v.table+'"'):'')+'><thead><tr>';
    for(var c=0;c<10;c++){ built+='<th style="'+thStyle+'"></th>'; }
    built+='</tr></thead><tbody>';

    var d=1;
    for(var r=0;r<3;r++){
      built+='<tr>';
      for(var c2=0;c2<10;c2++){
        var meta=withinInfo(month,d); // solstice/equinox day?
        var isToday=(state.dwt && state.dwt.now && year===state.dwt.now.year && month===state.dwt.now.month && d===state.dwt.now.day);
        var tdStyle = (typeof v.td==='function') ? v.td(isToday) : 'border:1px solid #555;text-align:center;padding:12px 16px;vertical-align:top;';
        if(meta){
          var pal=((state.dwt.ui||{}).palette)||'parchment';
          var tint=seasonTintFor(pal, meta.season||'');
          if(tint){ tdStyle += 'background:'+tint+';'; }
        }
        var tdTitle = meta ? ' title="'+esc(meta.name)+'"' : '';
        built+='<td style="'+tdStyle+'"'+tdTitle+'>';
        built+='<span'+(v.dayLine?(' style="'+v.dayLine+'"'):'')+'">'+d+'</span>';

        if(meta){
          var dotStyle = v.dot
            ? (' style="'+v.dot+'"')
            : ' style="display:inline-block;margin-left:4px;font-size:12px;line-height:1;"';
          built+='<span'+dotStyle+'>&#8226;</span>';
        }

        built+='</td>';
        d++;
      }
      built+='</tr>';
    }
    built+='</tbody></table>';
    built+=navBar();
    built+='<div style="margin-top:4px;text-align:center;">'+esc(currentDateLine())+'</div>';
    built+=endPanel();
    return built;
  }

  function renderFestival(year, key, label){
  try{
    var v = cssVars();

    // Handout title already displays festival label; do NOT repeat inside the cell.
    var built = headerCal(label || key || 'Festival');
    built += '<div><span style="font-weight:bold;">'+esc(year+' DR')+'</span></div>';

    var bgUrl = festivalBgUrl(key);
    var quip  = resolveFestivalQuip(key, 'short');
    var bgLayout = festivalBgLayout(key);
    var _minH = (bgLayout && typeof bgLayout.minHeightPx === 'number') ? bgLayout.minHeightPx : FESTIVAL_MIN_CELL_HEIGHT_PX;
// IMPORTANT: Preserve month-table scaffold to avoid fragile sanitizer/nav regressions.
    // We keep <thead> and 10 columns, but make it visually disappear.
    // Also: force-remove borders so the festival view is borderless.
    var invisibleThStyle =
      'display:none;border:0!important;padding:0!important;margin:0!important;'
    + 'height:0!important;line-height:0!important;font-size:0!important;'
    + 'background:transparent!important;color:transparent!important;';
	
    // Use the normal td style generator for sizing (if any), then aggressively override borders/background.
    var baseTd = (typeof v.td === 'function')
      ? v.td(false)
      : 'text-align:center;vertical-align:top;';

    // Cell style: transparent by default; no gradient overlays; background image only if specified.
    // Borders are explicitly removed to eliminate the thin outline and thicker top line.
    var cellStyle = baseTd
      + 'border:0!important;outline:0!important;box-shadow:none!important;'
      + 'padding:0!important;'
      + 'vertical-align:middle!important;'
      + 'text-align:center!important;'
      + 'background:transparent!important;';

    if(bgUrl){
      // >>> MAINTAINERS: SET/CHANGE FESTIVAL IMAGE URLS IN FESTIVAL_BG_URL MAP <<<
      // This renderer only *uses* the URL. Layout is controlled in FESTIVAL_BG_LAYOUT.
      var lay = bgLayout || festivalBgLayout(key);

      // Optional "padding" around the image by clipping the background to the content-box.
      // This creates an inset frame without altering the table scaffold.
      var padTop    = (lay && lay.padTop)    ? lay.padTop    : '0px';
      var padRight  = (lay && lay.padRight)  ? lay.padRight  : '0px';
      var padBottom = (lay && lay.padBottom) ? lay.padBottom : '0px';
      var padLeft   = (lay && lay.padLeft)   ? lay.padLeft   : '0px';

      // Apply padding LAST so it overrides earlier 'padding:0!important' in cellStyle.
      cellStyle +=
        "padding:"+padTop+" "+padRight+" "+padBottom+" "+padLeft+" !important;"
      + "background-origin:content-box;"
      + "background-clip:content-box;"
      + "background-image:url('"+esc(bgUrl)+"');"
      + "background-size:"+(lay && lay.size ? lay.size : "cover")+";"
      + "background-position:"+(lay && lay.posX ? lay.posX : "50%")+" "+(lay && lay.posY ? lay.posY : "50%")+";"
      + "background-repeat:"+(lay && lay.repeat ? lay.repeat : "no-repeat")+";";

      // Optional explicit cell height (rare; prefer min-height).
      if(lay && typeof lay.heightPx === 'number' && lay.heightPx > 0){
        cellStyle += "height:"+lay.heightPx+"px !important;";
      }
    }

    // Table style: inherit canonical sizing from v.table, but remove all borders/spacing.
    var tableStyle = (v.table || '')
      + 'border:0!important;outline:0!important;box-shadow:none!important;'
      + 'border-collapse:collapse!important;border-spacing:0!important;'
      + 'background:transparent!important;';

    built += '<table style="'+tableStyle+'">';

    // Keep THEAD to preserve structure, but visually remove it.
    built += '<thead style="display:none!important;"><tr>';
    for(var c=0;c<10;c++){ built += '<th style="'+invisibleThStyle+'"></th>'; }
    built += '</tr></thead>';

    built += '<tbody style="border:0!important;">';

    // Single spanning cell preserves the exact month footprint (10 cols x 3 rows).
    built += '<tr><td colspan="10" rowspan="3" style="'+cellStyle+'">';

    // Quip only, centered. No title, no overlay panels.

    // Render the selected festival quip as explicit line blocks so Roll20 preserves the stanza layout.
    function renderFestivalQuipBlocks(q){
      return renderQuipBlocks(q, 'display:block;margin:0;padding:0;line-height:1.50;');
    }

    // Minimum height keeps the pop-up stable across month ↔ festival.
    built += '<div style="'
          + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
          + 'width:100%;height:100%;'
          + 'min-height:'+_minH+'px;'
          + 'padding:20px 0px 0px 0px;'
          + 'font-style:italic;'
          + 'white-space:pre-line;'
          + 'background:transparent!important;'
          + '">'
          + (quip ? renderFestivalQuipBlocks(quip) : '')
          + '</div>';

    built += '</td></tr>';

    // Keep the remaining rows to match the month table’s 3-row body.
    built += '<tr></tr><tr></tr>';

    built += '</tbody></table>';

    built += navBar();
    built += '<div style="margin-top:4px;text-align:center;">'+esc(currentDateLine())+'</div>';
    built += endPanel();
    return built;

  }catch(e){
    // Never allow festival rendering failure to “fall through” navigation.
    try{
      var built2 = headerCal(label || key || 'Festival');
	        built2 += '<div><span style="font-weight:bold;">'+String(year)+' DR</span></div>';
      built2 += navBar();
      built2 += '<div style="margin-top:4px;text-align:center;">'+String(currentDateLine())+'</div>';
      built2 += endPanel();
      return built2;
    }catch(_e){
      return '';
    }
  }
}

  function handout(){
    return findObjs({_type:'handout', name:HANDOUT_NAME})[0] || null;
  }

  function getOrCreateMule(){
    try{
      if(RT.dwt && typeof RT.dwt.ensureMule === 'function'){
        return RT.dwt.ensureMule();
      }
    }catch(e){}
    var matches = findObjs({_type:'character', name:DWT_MULE}) || [];
    var mule = null;
    var bestScore = -1;
    for(var i=0;i<matches.length;i++){
      var score = muleScore(matches[i]);
      if(score > bestScore){
        bestScore = score;
        mule = matches[i];
      }
    }
    if(!mule){
      mule = createObj('character', { name:DWT_MULE, archived:false, inplayerjournals:'', controlledby:'' });
    }
    return mule;
  }
  function abilityActionLength(ability){
    try{ return String((ability && ability.get('action')) || '').length; }catch(e){ return 0; }
  }
  function abilityText(ability){
    try{ return String((ability && ability.get('action')) || ''); }catch(e){ return ''; }
  }
  function normalizeAbilityName(name){
    return String(name || '').toLowerCase().replace(/\s+/g,'');
  }
  function safeParseJSON(text){
    try{ return JSON.parse(String(text || '')); }catch(e){ return null; }
  }
  function regionsRootQuality(text){
    var parsed = safeParseJSON(text);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = (parsed.schema === 'dwt.regions.root.v1') ? 50 : 0;
    var regions = parsed.regions;
    if(!regions || typeof regions !== 'object' || Array.isArray(regions)) return score;
    var keys = Object.keys(regions);
    score += keys.length * 5;
    for(var i=0;i<keys.length;i++){
      var payload = regions[keys[i]];
      if(!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      if(payload.schema === 'dwt.region.v4') score += 200;
      if(payload.weather && typeof payload.weather === 'object' && !Array.isArray(payload.weather)) score += 100;
      if(payload.region) score += 10;
      if(payload.locales) score += 10;
    }
    return score;
  }
  function abilitySortScore(name, ability){
    var text = abilityText(ability);
    var key = normalizeAbilityName(name || (ability && ability.get && ability.get('name')) || '');
    var base = abilityActionLength(ability);
    if(key === 'regions') return regionsRootQuality(text) * 1000000 + base;
    return base;
  }
  function muleScore(character){
    if(!character) return -1;
    var abilities = findObjs({_type:'ability', _characterid:character.id}) || [];
    var score = abilities.length;
    for(var i=0;i<abilities.length;i++){
      var ability = abilities[i];
      var name = '';
      try{ name = normalizeAbilityName(ability.get('name') || ''); }catch(e){}
      var weighted = abilitySortScore(name, ability);
      score += weighted;
      if(name === 'mapmeta') score += weighted;
      else if(name === 'version' || name === 'core') score += Math.max(0, weighted);
    }
    return score;
  }
  function namedAbilities(character, name){
    if(!character) return [];
    var list = findObjs({_type:'ability', _characterid:character.id, name:name}) || [];
    list.sort(function(a, b){ return abilitySortScore(name, b) - abilitySortScore(name, a); });
    return list;
  }
  function upsertAbility(character, name, action){
    if(!character) return;
    var abilities = namedAbilities(character, name);
    if(abilities.length){
      for(var i=0;i<abilities.length;i++){
        try{ abilities[i].set({action:String(action||'')}); }catch(e){}
      }
    }else{
      createObj('ability',{characterid:character.id,name:name,action:String(action||''),istokenaction:false});
    }
  }
  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = namedAbilities(character, name)[0];
    return ability ? (ability.get('action')||'') : '';
  }
  function parseVersionRoot(raw){
    var root = {};
    var lines = String(raw || '').split('\n');
    var i, line, eq, key, value;
    for(i=0;i<lines.length;i++){
      line = String(lines[i] || '').trim();
      if(!line) continue;
      eq = line.indexOf('=');
      if(eq <= 0) continue;
      key = line.slice(0, eq).trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
      value = line.slice(eq + 1).trim();
      if(!key || !/^[a-z][a-z0-9]*$/.test(key)) continue;
      if(!value) continue;
      root[key] = value;
    }
    return root;
  }
  function serializeVersionRoot(root){
    var keys = Object.keys(root || {}).filter(function(k){
      return /^[a-z][a-z0-9]*$/.test(String(k || '')) && typeof root[k] === 'string' && root[k];
    }).sort();
    return keys.map(function(k){ return k + '=' + root[k]; }).join('\n');
  }
  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    var key = String(moduleKey || '').toLowerCase().replace(/[^a-z0-9]+/g,'');
    var version = String(moduleVersion || '').trim();
    root[key] = version;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }


  function upsertHandout(html, gmnotes){
    var h = handout();

    if(!h){
      // Viewable by all players, editable only by GM.
      h = createObj('handout', {
        name: HANDOUT_NAME,
        inplayerjournals: 'all',
        controlledby: ''
      });
    }else{
      // Enforce viewable-by-all, GM-editable policy on existing handout.
      try{
        h.set({ inplayerjournals:'all', controlledby:'' });
      }catch(e){}
    }

    if(html!=null){
      try{ h.set('notes', html); }catch(e){}
    }
    if(gmnotes!=null){
      try{ h.set('gmnotes', gmnotes); }catch(e){}
    }

    return h;
  }

  function todayIndex(){
    var now=state.dwt.now, y=now.year, seq=buildSeq(y);
    if(now.festival){
      var i=idxForFest(seq, now.festival); if(i>=0) return {year:y,index:i};
      return {year:y,index:idxForMonth(seq, currentMonthIndexForQuips(now))};
    }
    return {year:y,index:idxForMonth(seq, now.month)};
  }

  function updateHandout(forceToday){
    var v=state.dwt.view, now=state.dwt.now;
    if(forceToday){
      var T=todayIndex(); v.year=T.year; v.index=T.index;
    }
    var seq=buildSeq(v.year);
    var i=v.index; if(i<0||i>=seq.length) i=idxForMonth(seq, now.month);
    var tok=seq[i], built;
    if(tok.t==='month'){
      built = renderMonthTable(v.year, tok.m);
    }else{
      built = renderFestival(v.year, tok.key, tok.label);
    }
    var h = upsertHandout(built);
    state.dwt.view.index = i;
    return h;
}

  function commitCalendarState(forceToday){
    if(forceToday !== false){
      var T = todayIndex();
      state.dwt.view.year = T.year;
      state.dwt.view.index = T.index;
    }
    updateHandout(forceToday !== false);
    mirrorToMule();
  }

  /* ========== Mule sync ========== */
  function mirrorToMule(){
    try{
      var now = state.dwt.now || { year:1492, month:1, day:1, timeofday:'early morning', festival:'' };

      var year = now.year || 1492;
      var month = now.month || 1;
      var day = now.day || 1;
      var fest = now.festival || '';
      var timeofday = now.timeofday || 'early morning';

      function seasonFromMonth(m){
        if(m===12 || m===1 || m===2) return 'Winter';
        if(m===3 || m===4 || m===5) return 'Spring';
        if(m===6 || m===7 || m===8) return 'Summer';
        return 'Autumn';
      }

      function isBetweenMonthFestival(key){
        var s = String(key||'').toLowerCase();
        for(var i=0;i<BETWEEN.length;i++){
          if(String(BETWEEN[i].key||'').toLowerCase()===s){ return true; }
        }
        return false;
      }

      var season = seasonFromMonth(month);
      var monthForMacro = isBetweenMonthFestival(fest) ? 'none' : month;
      var currentHour = (typeof now.hour==='number' && now.hour>=0 && now.hour<24) ? now.hour : 0;
      var mule = getOrCreateMule();
      if(!mule) return;

      mergeVersionEntry(mule, 'calendar', VERSION);
      upsertAbility(mule, 'calendar', JSON.stringify({
        meta: { version: VERSION },
        currentyear: year,
        currentseason: season,
        currentmonth: monthForMacro,
        currentfestival: fest,
        currentday: day,
        currenttimeofday: timeofday,
        currenthour: currentHour
      }));
    }catch(e){}
  }

  /* ========== Step parsing & navigation ========== */

  function yearLen(y){ return isLeap(y) ? 366 : 365; }

  function nowToOrd(now){
    // Based on existing Harptos calendar logic from prior versions; unchanged.
    // 1 Hammer is ordinal 1, festivals interleave via BETWEEN order.
    var y = now.year;
    var seq = buildSeq(y);
    var ord = 0;
    for(var i=0;i<seq.length;i++){
      var tok = seq[i];
      if(tok.t==='month'){
        if(tok.m===now.month){
          ord += (now.day||1);
          break;
        }else{
          ord += 30;
        }
      }else if(tok.t==='festival'){
        if(tok.key===now.festival){
          ord += 1;
          break;
        }else{
          ord += 1;
        }
      }
    }
    return ord;
  }

  function ordToNow(y, ord){
    var seq = buildSeq(y);
    var pos = ord;
    var out = { year:y, month:1, day:1, hour:0, minute:0, timeofday:'early morning', festival:'' };
    for(var i=0;i<seq.length;i++){
      var tok = seq[i];
      if(tok.t==='month'){
        if(pos<=30){
          out.month = tok.m;
          out.day   = pos;
          out.festival = '';
          return out;
        }
        pos -= 30;
      }else if(tok.t==='festival'){
        if(pos<=1){
          out.month = 0;
          out.day   = 0;
          out.festival = tok.key;
          return out;
        }
        pos -= 1;
      }
    }
    return out;
  }

  function dwt_parseStep(val){
    var m = String(val||'').match(/^(\d+)\s*([dmy])$/i);
    if(!m) return null;
    var n = parseInt(m[1],10);
    var u = m[2].toLowerCase();
    if(isNaN(n) || n<=0) return null;
    if(u==='d'){ return {days:n}; }
    if(u==='m'){ return {months:n}; }
    if(u==='y'){ return {years:n}; }
    return null;
  }

  function handleBack(val){
    var st = dwt_parseStep(val||'1m'); if(!st) return;
    if (st.days){
      var now = state.dwt.now;
      var ord = nowToOrd(now) - Math.abs(st.days);
      var y = now.year;
      while(ord<=0){
        if(y<=MIN_Y){
          y = MIN_Y;
          ord = 1;
          break;
        }
        y--;
        ord += yearLen(y);
      }
      var nextNow = ordToNow(y, ord);
      nextNow.hour = (typeof now.hour === 'number') ? now.hour : 0;
      nextNow.minute = (typeof now.minute === 'number') ? now.minute : 0;
      nextNow.timeofday = now.timeofday || timeofdayFromHM(nextNow.hour, nextNow.minute);
      state.dwt.now = nextNow;
      commitCalendarState(true);
      return;
    }
    if (st.months){
      var v=state.dwt.view, seq=buildSeq(v.year), n=Math.abs(st.months);
      while(n--){
        if(v.index>0){ v.index--; } else if(v.year>MIN_Y){ v.year--; v.index=buildSeq(v.year).length-1; }
      }
      updateHandout(); mirrorToMule(); return;
    }
    if (st.years){
      var v2=state.dwt.view; v2.year=clamp(v2.year-Math.abs(st.years));
      v2.index=0; updateHandout(); mirrorToMule(); return;
    }
  }
  function handleForward(val){
    var st = dwt_parseStep(val||'1m'); if(!st) return;
    if (st.days){
      var now = state.dwt.now;
      var ord = nowToOrd(now) + Math.abs(st.days);
      var y = now.year;
      while(ord>yearLen(y)){
        if(y>=MAX_Y){
          y = MAX_Y;
          ord = yearLen(y);
          break;
        }
        ord -= yearLen(y);
        y++;
      }
      var nextNow = ordToNow(y, ord);
      nextNow.hour = (typeof now.hour === 'number') ? now.hour : 0;
      nextNow.minute = (typeof now.minute === 'number') ? now.minute : 0;
      nextNow.timeofday = now.timeofday || timeofdayFromHM(nextNow.hour, nextNow.minute);
      state.dwt.now = nextNow;
      commitCalendarState(true);
      return;
    }
    if (st.months){
      var v=state.dwt.view, seq=buildSeq(v.year), n=Math.abs(st.months);
      while(n--){
        if(v.index<seq.length-1){ v.index++; } else if(v.year<MAX_Y){ v.year++; v.index=0; seq=buildSeq(v.year); }
      }
      updateHandout(); mirrorToMule(); return;
    }
    if (st.years){
      var v2=state.dwt.view; v2.year=clamp(v2.year+Math.abs(st.years));
      v2.index=0; updateHandout(); mirrorToMule(); return;
    }
  }

  function handleToday(){
    commitCalendarState(true);
  }

  function handleCalendarNamespace(expr, pid){
    var s = String(expr||'').trim();
    if(!s){ return; }

    var low = s.toLowerCase();

    // today
    if(low === 'today'){
      handleToday();
      return;
    }

    // back / forward (default 1m)
    var nav = low.match(/^(back|forward)\s*(\d+\s*[dmy])?$/i);
    if(nav && nav[1]){
      var dir = nav[1].toLowerCase();
      var val = (nav[2] ? String(nav[2]).replace(/\s+/g,'') : '1m');
      if(dir === 'back') handleBack(val);
      else handleForward(val);
      return;
    }

    if(/^show\b/i.test(s)){
      var restShow = s.replace(/^show\b/i, '').trim();
      var showFields = parseCalendarFieldList(restShow);
      if(!showFields.length){
        if(restShow){
          whisperToPlayer(pid, '<b>Calendar</b><br>' + esc('Use !dwt --calendar show hour | timeofday | day | month/festival | season | year.'));
        }else{
          whisperToPlayer(pid, '<b>Calendar</b><br>' + esc(currentDateLine()));
        }
        return;
      }
      var showLines = [];
      for(var sf=0; sf<showFields.length; sf++){
        showLines.push(formatCalendarFieldLine(showFields[sf]));
      }
      whisperToPlayer(pid, '<b>Calendar</b><br>' + showLines.map(esc).join('<br>'));
      return;
    }

    // set (GM only)
    if(/^set\b/i.test(s)){
      try{
        if(pid && typeof playerIsGM === 'function' && !playerIsGM(pid)){
          return;
        }
      }catch(e){}

      var rest = s.replace(/^set\b/i,'').trim();
      if(!rest){ return; }

      var assigns = parseCalendarAssignments(rest);

      var errs = [];

      var changed = false;
      for(var a=0; a<assigns.length; a++){
        var k = assigns[a].k;
        var v = assigns[a].v;
        var r = setCalendarField(k, v, { deferCommit:true });
        if(r && r.error){ errs.push(r.error); }
        else if(r && r.ok && k !== 'season'){ changed = true; }
      }

      if(changed){
        commitCalendarState(true);
      }

      if(typeof sendChat === 'function'){
        if(errs.length){
          sendChat('DWT','/w gm <b>Calendar:</b> set failed — ' + errs.join(' | '));
        }else{
          try{
            var line = currentDateLine();
            sendChat('DWT','/w gm '+line);
            }catch(e){
            sendChat('DWT','/w gm <b>Calendar:</b> updated.');
          }
        }
      }
      return;
    }
  }



  /* ========== Calendar field setters from GM commands ========== */

  // Normalize arbitrary user input to a lowercase, spaceless token (letters and digits only).
  function canonicalToken(s){
    return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  }

  // Timeofday helpers for early/late predawn, morning, afternoon, and evening.
  // early predawn   : 0000–0259
  // late predawn    : 0300–0559
  // early morning   : 0600–0859
  // late morning    : 0900–1159
  // early afternoon : 1200–1459
  // late afternoon  : 1500–1759
  // early evening   : 1800–2059
  // late evening    : 2100–2359
  function timeofdayFromHM(hh, mm){
    hh = (typeof hh==='number' && hh>=0 && hh<24) ? hh : 0;
    mm = (typeof mm==='number' && mm>=0 && mm<60) ? mm : 0;
    if(hh < 3)  return 'early predawn';
    if(hh < 6)  return 'late predawn';
    if(hh < 9)  return 'early morning';
    if(hh < 12) return 'late morning';
    if(hh < 15) return 'early afternoon';
    if(hh < 18) return 'late afternoon';
    if(hh < 21) return 'early evening';
    return 'late evening';
  }

  function timeofdayLabelFromToken(tok){
    var c = canonicalToken(tok);
    if(c==='earlypredawn')    return 'early predawn';
    if(c==='latepredawn')     return 'late predawn';
    if(c==='earlymorning')    return 'early morning';
    if(c==='latemorning')     return 'late morning';
    if(c==='earlyafternoon')  return 'early afternoon';
    if(c==='lateafternoon')   return 'late afternoon';
    if(c==='earlyevening')    return 'early evening';
    if(c==='lateevening')     return 'late evening';
    return null;
  }

  // First minute of each timeofday band, as HH:MM.
  function timeofdayStartHM(label){
    if(label==='early predawn')    return { hour:0,  minute:0 };
    if(label==='late predawn')     return { hour:3,  minute:0 };
    if(label==='early morning')    return { hour:6,  minute:0 };
    if(label==='late morning')     return { hour:9,  minute:0 };
    if(label==='early afternoon')  return { hour:12, minute:0 };
    if(label==='late afternoon')   return { hour:15, minute:0 };
    if(label==='early evening')    return { hour:18, minute:0 };
    if(label==='late evening')     return { hour:21, minute:0 };
    return { hour:0, minute:0 };
  }

  function seasonKeyFromMonth(m){
    if(m===12 || m===1 || m===2) return 'winter';
    if(m===3 || m===4 || m===5) return 'spring';
    if(m===6 || m===7 || m===8) return 'summer';
    return 'autumn';
  }

  function seasonKeyFromFestival(key){
    var k = String(key||'').toLowerCase();
    if(k==='midwinter') return 'winter';
    if(k==='greengrass') return 'spring';
    if(k==='midsummer') return 'summer';
    if(k==='shieldmeet') return 'summer';
    if(k==='highharvestide') return 'autumn';
    if(k==='feastofthemoon') return 'winter'; // updated: official start of winter
    return null;
  }

  function monthIndexFromToken(tok){
    var raw = String(tok||'').trim();
    if(!raw){ return 0; }
    // Allow numeric month 1-12.
    var n = parseInt(raw,10);
    if(!isNaN(n) && n>=1 && n<=12){ return n; }
	    // Normalize month text and compare against MONTHS by short and first-word full name.
    var v = canonicalToken(raw);
    if(!v){ return 0; }
    for(var i=0;i<MONTHS.length;i++){
      var shortName = canonicalToken(MONTHS[i].short||'');
      if(shortName===v){ return i+1; }
      var full = canonicalToken((MONTHS[i].name||'').split(/\s+/)[0]);
      if(full===v){ return i+1; }
    }
    return 0;
  }

  function festivalKeyFromToken(tok){
    var c = canonicalToken(tok);
    if(!c){ return null; }
    // Canonical forms.
    var mapping = {
      'midwinter':'midwinter',
      'greengrass':'greengrass',
      'midsummer':'midsummer',
      'shieldmeet':'shieldmeet',
      'highharvestide':'highharvestide',
      'feastofthemoon':'feastofthemoon',
      // Accept common free-form variants for Feast of the Moon.
      'feastofmoon':'feastofthemoon',
      'feastofthemoonfestival':'feastofthemoon'
    };
    if(mapping[c]){ return mapping[c]; }

    // Also accept exact BETWEEN keys by canonical form.
    for(var i=0;i<BETWEEN.length;i++){
      var key = BETWEEN[i].key||'';
      if(c===canonicalToken(key)){ return BETWEEN[i].key; }
    }
    return null;
  }

  function parseHourStringHHMM(str){
    var s = String(str||'').trim();
    var m = s.match(/^(\d{2})(\d{2})$/);
    if(!m){ return null; }
    var hh = parseInt(m[1],10);
    var mm = parseInt(m[2],10);
    if(isNaN(hh) || isNaN(mm)){ return null; }
    if(hh<0 || hh>23){ return null; }
    if(mm<0 || mm>59){ return null; }
    return { hour:hh, minute:mm };
  }

  function calendarFieldKeys(){
    return {
      'hour':1,
      'timeofday':1,
      'day':1,
      'month':1,
      'festival':1,
      'monthfestival':1,
      'season':1,
      'year':1
    };
  }

  function canonicalCalendarFieldToken(tok){
    var c = canonicalToken(tok);
    return c === 'monthfestival' ? 'monthfestival' : c;
  }

  function isCalendarFieldToken(tok){
    return !!calendarFieldKeys()[canonicalCalendarFieldToken(tok)];
  }

  function parseCalendarAssignments(raw){
    var parts = String(raw||'').trim().split(/\s+/g).filter(function(x){ return !!x; });
    var assigns = [];
    var i = 0;
    while(i < parts.length){
      var fTok = parts[i++];
      if(!isCalendarFieldToken(fTok)){ break; }

      var key = canonicalCalendarFieldToken(fTok);
      var vToks = [];
      while(i < parts.length && !isCalendarFieldToken(parts[i])){
        vToks.push(parts[i++]);
      }
      assigns.push({k:key, v:vToks.join(' ')});
    }
    return assigns;
  }

  function parseCalendarFieldList(raw){
    var parts = String(raw||'').trim().split(/\s+/g).filter(function(x){ return !!x; });
    var fields = [];
    for(var i=0;i<parts.length;i++){
      if(!isCalendarFieldToken(parts[i])) break;
      fields.push(canonicalCalendarFieldToken(parts[i]));
    }
    return fields;
  }

  function festivalDisplayName(key){
    var k = String(key||'').toLowerCase();
    if(!k){ return ''; }
    if(k==='midwinter') return 'Midwinter';
    if(k==='greengrass') return 'Greengrass';
    if(k==='midsummer') return 'Midsummer';
    if(k==='shieldmeet') return 'Shieldmeet';
    if(k==='highharvestide') return 'Highharvestide';
    if(k==='feastofthemoon') return 'Feast of the Moon';
    return k.charAt(0).toUpperCase()+k.slice(1);
  }

  function formatTimestampLine(now){
    now = now || {};
    var hh = (typeof now.hour==='number' && now.hour>=0 && now.hour<24) ? now.hour : 0;
    var mm = (typeof now.minute==='number' && now.minute>=0 && now.minute<60) ? now.minute : 0;
    var hhmm = (hh<10?'0':'')+hh+''+(mm<10?'0':'')+mm;
    var timeofday = timeofdayFromHM(hh, mm);
    var datePart;
    if(now.festival){
      datePart = festivalDisplayName(now.festival)+', '+(now.year||1492)+' DR.';
    }else{
      var mIdx = (now.month||1)-1;
      var shortName = (MONTHS[mIdx] && MONTHS[mIdx].short) ? MONTHS[mIdx].short : '';
      datePart = (now.day||1)+' '+shortName+', '+(now.year||1492)+' DR.';
    }
    return 'It is currently '+hhmm+' ('+timeofday+') on '+datePart;
  }


  function currentDateLine(){
    ensureCalendarState();
    var now = state.dwt.now || { year:1492, month:1, day:1, hour:0, minute:0, timeofday:'early morning', festival:'' };
    var timeofday = timeofdayFromHM(now.hour||0, now.minute||0);
    var line;
    if(now.festival){
      line = 'It is currently '+timeofday+' on '+festivalDisplayName(now.festival)+', '+now.year+' DR.';
    }else{
      var mIdx = (now.month||1)-1;
      var shortName = (MONTHS[mIdx] && MONTHS[mIdx].short) ? MONTHS[mIdx].short : '';
      line = 'It is currently '+timeofday+' on '+now.day+' '+shortName+', '+now.year+' DR.';
    }
    return line;
  }

  function formatCalendarFieldLine(kind){
    ensureCalendarState();
    var now = state.dwt.now || { year:1492, month:1, day:1, hour:0, minute:0, timeofday:'early morning', festival:'' };
    var hh = (typeof now.hour==='number' && now.hour>=0 && now.hour<24) ? now.hour : 0;
    var mm = (typeof now.minute==='number' && now.minute>=0 && now.minute<60) ? now.minute : 0;
    var hhmm = (hh<10?'0':'')+hh+''+(mm<10?'0':'')+mm;
    var timeofday = timeofdayFromHM(hh, mm);
    var monthName = '';
    if(now.month>=1 && now.month<=12 && MONTHS[now.month-1]){
      monthName = MONTHS[now.month-1].name || MONTHS[now.month-1].short || '';
    }
    kind = canonicalCalendarFieldToken(kind);

    if(kind === 'hour') return 'Hour: ' + hhmm;
    if(kind === 'timeofday') return 'Timeofday: ' + timeofday;
    if(kind === 'day') return now.festival ? 'Day: festival date in progress' : ('Day: ' + now.day);
    if(kind === 'month') return now.festival ? 'Month: festival date in progress' : ('Month: ' + monthName + ' (' + now.month + ')');
    if(kind === 'festival') return 'Festival: ' + (now.festival ? festivalDisplayName(now.festival) : 'none');
    if(kind === 'monthfestival') return now.festival
      ? ('Month/Festival: ' + festivalDisplayName(now.festival))
      : ('Month/Festival: ' + monthName + ' (' + now.month + ')');
    if(kind === 'season'){
      var season = now.festival ? seasonKeyFromFestival(now.festival) : seasonKeyFromMonth(now.month);
      return 'Season: ' + season.charAt(0).toUpperCase() + season.slice(1);
    }
    if(kind === 'year') return 'Year: ' + now.year;
    return currentDateLine();
  }

  function setCalendarField(kind, raw, opts){
    ensureCalendarState();
    opts = opts || {};
    var now = state.dwt.now || { year:1492, month:1, day:1, hour:0, minute:0, timeofday:'early morning', festival:'' };
    var newNow = {
      year: now.year,
      month: now.month,
      day: now.day,
      hour: (typeof now.hour==='number'? now.hour : 0),
      minute: (typeof now.minute==='number'? now.minute : 0),
      timeofday: now.timeofday || 'early morning',
      festival: now.festival || ''
    };
    var v = String(raw||'').trim();

    if(kind==='year'){
      if(!v){ return { error:'Year requires a numeric value.' }; }
      var y = parseInt(v,10);
      if(isNaN(y)){ return { error:'Year must be numeric.' }; }
      y = clamp(y);
      // Shieldmeet sanity: existing Shieldmeet must remain valid.
      if(newNow.festival && String(newNow.festival).toLowerCase()==='shieldmeet' && !isLeap(y)){
        return { error:'Shieldmeet can only be specified in leap years. Change the festival before setting this year.' };
      }
      newNow.year = y;

    }else if(kind==='month'){
	      if(!v){ return { error:'Month requires a value (name or 1-12).' }; }
      var mIdx = monthIndexFromToken(v);
      if(!mIdx){ return { error:'Unknown month: '+v }; }
      newNow.month = mIdx;
      newNow.festival = '';
      // If current day is invalid (for example, 0 when coming from a festival),
      // normalize it to 1 so that stacked commands like --setMonth X --setDay Y
      // can be applied in a single !dwt invocation.
      if(newNow.day<1 || newNow.day>30){
        newNow.day = 1;
      }

    }else if(kind==='day'){
      if(!v){ return { error:'Day requires a numeric value.' }; }
      var d = parseInt(v,10);
      if(isNaN(d) || d<1 || d>30){
        return { error:'Day must be between 1 and 30.' };
      }
      // Cannot set a day while a between-month festival is active.
      if(newNow.festival){
        return { error:'Cannot set a day while a festival is currently specified. Clear the festival or set a month first.' };
      }
      if(newNow.month<1 || newNow.month>12){
        return { error:'Cannot set a day when month is not defined.' };
      }
      newNow.day = d;

    }else if(kind==='festival'){
      if(!v){ return { error:'Festival requires a value.' }; }
      var festKey = festivalKeyFromToken(v);
      if(!festKey){ return { error:'Unknown festival: '+v }; }
      // Shieldmeet sanity against current year.
      if(festKey==='shieldmeet' && !isLeap(newNow.year)){
        return { error:'Shieldmeet can only be specified in leap years.' };
      }
      newNow.festival = festKey;
      newNow.month = 0;
      newNow.day = 0;


    }else if(kind==='monthfestival'){
      // Unified setter: attempts month first (by number or name), otherwise festival.
      if(!v){ return { error:'Month/festival requires a value.' }; }
      var mIdx2 = monthIndexFromToken(v);
      if(mIdx2){
        newNow.month = mIdx2;
        newNow.festival = '';
        if(newNow.day<1 || newNow.day>30){ newNow.day = 1; }
      }else{
        var festKey2 = festivalKeyFromToken(v);
        if(!festKey2){ return { error:'Unknown month/festival: '+v }; }
        if(festKey2==='shieldmeet' && !isLeap(newNow.year)){
          return { error:'Shieldmeet can only be specified in leap years.' };
        }
        newNow.festival = festKey2;
        newNow.month = 0;
        newNow.day = 0;
      }

    }else if(kind==='season'){
      if(!v){ return { error:'Season requires a value (winter/spring/summer/autumn).' }; }
      var sKey = canonicalToken(v);
      if(!({winter:1,spring:1,summer:1,autumn:1}[sKey])){
        return { error:'Unknown season: '+v };
      }
      var expectedSeason = newNow.festival
        ? seasonKeyFromFestival(newNow.festival)
        : seasonKeyFromMonth(newNow.month);
      if(expectedSeason && sKey!==expectedSeason){
        return { error:'Season '+v+' does not match the current date (month/festival).' };
      }
      // Season is derived; nothing to change, but return a confirmation.
      return { ok:true, text: 'Season '+expectedSeason.charAt(0).toUpperCase()+expectedSeason.slice(1)+' confirmed for current date.' };

    }else if(kind==='hour'){
      if(!v){ return { error:'Hour requires HHMM 24-hour input.' }; }
      var hm = parseHourStringHHMM(v);
      if(!hm){
        return { error:'Hour must be in HHMM 24-hour format (e.g. 0450).' };
      }
      newNow.hour = hm.hour;
      newNow.minute = hm.minute;
      newNow.timeofday = timeofdayFromHM(hm.hour, hm.minute);

    }else if(kind==='timeofday'){
      if(!v){ return { error:'Timeofday requires one of: early predawn, late predawn, early morning, late morning, early afternoon, late afternoon, early evening, late evening.' }; }
      var timeofdayLabel = timeofdayLabelFromToken(v);
      if(!timeofdayLabel){
        return { error:'Unknown timeofday: '+v };
      }
      var hm2 = timeofdayStartHM(timeofdayLabel);
      newNow.timeofday = timeofdayLabel;
      newNow.hour = hm2.hour;
      newNow.minute = hm2.minute;

    }else{
      return { error:'Unknown calendar field: '+kind };
    }

    state.dwt.now = newNow;
    if(!opts.deferCommit){
      commitCalendarState(true);
    }

    return { ok:true, text: formatTimestampLine(state.dwt.now) };
  }

  /* ========== Help block into unified panel ========== */

  function renderConfigHTML(){
    var v=cssVars(), now=state.dwt.now, h=handout();
    var timeofday = timeofdayFromHM(now.hour||0, now.minute||0);
    var line;
    if(now.festival){
      line = 'It is currently '+timeofday+' on '+festivalDisplayName(now.festival)+', '+now.year+' DR.';
    }else{
      var mIdx = (now.month||1)-1;
      var shortName = (MONTHS[mIdx] && MONTHS[mIdx].short) ? MONTHS[mIdx].short : '';
      line = 'It is currently '+timeofday+' on '+now.day+' '+shortName+', '+now.year+' DR.';
    }
    var btn = (h && h.id)
      ? '<a role="button" href="'+hrefAttr('https://journal.roll20.net/handout/'+h.id)+'" '+(v.btn?('style="'+v.btn+'"'):'')+' target="_blank"><span style="font-weight:bold;">Show Calendar</span></a>'
      : '';
    return '<div>'+esc(line)+'</div><div style="margin-top:12px;">'+btn+'</div>';
  }

  /* ========== Router / Integration ========== */
  function registerWithCore(){
    if(_registered) return;
    try{
      if(RT.dwt && typeof RT.dwt.addLogCard==='function' && typeof RT.dwt.addHelpSection==='function'){
        RT.dwt.addLogCard(5, function(pid){
          try{ updateHandout(true); }catch(e){}
          return renderConfigHTML();
        });
        RT.dwt.addHelpSection(10,'Calendar',function(){ return [
           'Calendar',
           'Calendar navigation: !dwt --calendar today | back | forward <value as #d/m/y>',
           '(day/month/year : !dwt --calendar back 4m would move calendar view back 4 months)',
           '',
           'Set current date/timeofday (GM only): !dwt --calendar set hour | timeofday | day | month/festival | season | year <value>',
           'Show current date/timeofday fields: !dwt --calendar show hour | timeofday | day | month/festival | season | year',
           '',
           'Inputs are normalized to lower-case, no spaces (e.g. "Feast of the Moon" -> feastofthemoon).',
           'Months can be specified either by name or number. (!dwt --calendar set month 1 | hammer | Deep WinTER would all be acceptable).',
           ''
         ];});
        _registered=true;
      }
    }catch(e){}
  }

    function calendarStartup(){
    ensureCalendarState();
    updateHandout(true);
    mirrorToMule();
  }

  function init(){
    calendarStartup();
    // NOTE: calendar no longer binds its own !dwt listener; Core routes --calendar here.
    registerWithCore();
    try{
      RT.dwtQ = RT.dwtQ || [];
      RT.dwtQ.push(function(dwt){
        try{
          if(dwt && typeof dwt.registerStartup === 'function'){
            dwt.registerStartup('calendar', function(mule, reason){
              try{ calendarStartup(); }catch(e){}
            });
          }
          registerWithCore();
        }catch(e){}
      });
      if (RT.dwt && typeof RT.dwt.registerStartup === 'function'){
        RT.dwt.registerStartup('calendar', function(mule, reason){
          try{ calendarStartup(); }catch(e){}
        });
      }
    }catch(e){}
  }

  return {
    init:init,
    _ns:handleCalendarNamespace,
    _refreshView:function(){ try{ updateHandout(true); mirrorToMule(); }catch(e){} },
    _setField:setCalendarField,
    _dateLine: currentDateLine,
    _pickMonthQuip: resolveMonthQuip,
    _pickFestivalQuip: resolveFestivalQuip,
    _pickCurrentMonthQuip: function(length){
      return resolveMonthQuip(currentMonthIndexForQuips(), normalizeQuipLength(length));
    }
  };
}());

on('ready', function(){ dwt_calendar.init(); });

on('change:player:_online', function(p){
  try{ if(p && p.id){ dwt_calendar._refreshView(); } }catch(e){ log('calendar login refresh err: '+e); }
});

