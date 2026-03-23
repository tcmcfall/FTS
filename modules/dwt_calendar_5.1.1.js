// name:        dwt_calendar.js
// version:     5.1.1
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

var dwt_calendar = dwt_calendar || (function () {
  'use strict';

  /* ========== Intro ========== */
  var RT = (typeof globalThis!=='undefined') ? globalThis
         : (typeof window!=='undefined')     ? window
         : (typeof self!=='undefined')       ? self
         : (typeof global!=='undefined')     ? global
         : this;

  var VERSION='5.1.1', HANDOUT_NAME='Campaign Calendar', DWT_MULE='dwt_mule';
  var MIN_Y=1300, MAX_Y=1600;
  var _registered=false;

  var MONTHS=[{name:'Hammer (Deepwinter)',short:'Hammer'},{name:'Alturiak (The Claw of Winter)',short:'Alturiak'},
              {name:'Ches (The Claw of Sunsets)',short:'Ches'},{name:'Tarsakh (The Claw of Storms)',short:'Tarsakh'},
              {name:'Mirtul (The Melting)',short:'Mirtul'},{name:'Kythorn (The Time of Flowers)',short:'Kythorn'},
              {name:'Flamerule (Summertide)',short:'Flamerule'},{name:'Eleasis (Highsun)',short:'Eleasis'},
              {name:'Eleint (The Fading)',short:'Eleint'},{name:'Marpenoth (Leafall)',short:'Marpenoth'},
              {name:'Uktar (The Rotting)',short:'Uktar'},{name:'Nightal (The Drawing Down)',short:'Nightal'}];

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


  // >>> SET FESTIVAL “QUIP” OVERLAY TEXT HERE <<<
  var FESTIVAL_QUIP = {
    midwinter:      'The longest night; the hearth burns brighter.',
    greengrass:     'Old oaths awaken in new leaves.',
    midsummer:      'Sun at its crown—nothing stays hidden.',
    shieldmeet:     'Once in four years, the world holds its breath.',
    highharvestide: 'The reaping comes; so do the debts.',
    feastofthemoon: 'The moon counts what mortals misplace.'
  };

  // >>> ADJUST IMAGE DARKENING (OPACITY) HERE <<<
  // Range: 0.00 (no darkening) to 0.80+ (very dark). Increase for readability.
  var FESTIVAL_BG_DARKEN = {
    midwinter:      0.50,  // <-- ADJUST OPACITY HERE
    greengrass:     0.25,  // <-- ADJUST OPACITY HERE
    midsummer:      0.20,  // <-- ADJUST OPACITY HERE
    shieldmeet:     0.25,  // <-- ADJUST OPACITY HERE
    highharvestide: 0.30,  // <-- ADJUST OPACITY HERE
    feastofthemoon: 0.35   // <-- ADJUST OPACITY HERE
  };

  function festivalBgUrl(key){
    var nk = normFestivalKey(key);
    return FESTIVAL_BG_URL[nk] || '';
  }
  function festivalQuip(key){
    var nk = normFestivalKey(key);
    return FESTIVAL_QUIP[nk] || '';
  }
  function festivalDarken(key){
    var nk = normFestivalKey(key);
    var v = FESTIVAL_BG_DARKEN[nk];
    return (typeof v === 'number' && v >= 0 && v <= 0.95) ? v : 0.28;
  }


  // =============================================================
  // Festival Quips (Functional Test)
  // -------------------------------------------------------------
  // Goal: display a RANDOM long quip for each festival.
  // Order of precedence:
  //  1) If dwt_quips is loaded, use: dwt_quips.getQuips('quips.festival.<key>.long')
  //  2) Otherwise, fall back to 4 calendar-local long quips per festival (below)
  //  3) Otherwise, fall back to 4 generic long quips
  //
  // NOTE: This is intentionally "thin" integration. Navigation logic is untouched.
  // =============================================================

  // >>> DEFAULT (FALLBACK) LONG FESTIVAL QUIPS HERE <<<
  // Maintainers: Edit the arrays below (4 per festival). These are used ONLY if dwt_quips is not loaded
  // or if it returns no usable pool for the requested path.
  var FESTIVAL_QUIP_FALLBACK_LONG = {
    midwinter: [
      'The longest night; the hearth burns brighter.\nEven old grudges thaw a little when the door is shut.\nIf you must make a vow, make it softly.\nTomorrow is earned by staying warm tonight.',
      'Ice in the gutters, fire in the bones.\nA shared cup counts for more than a shared sword.\nSpeak the names you miss, then let them rest.\nThe year turns when the last ember refuses to die.',
      'Snow keeps counsel and shutters keep secrets.\nBread is broken, not promises.\nThe brave endure the dark by tending light.\nMidwinter teaches patience to all who listen.',
	        'When the wind howls, the city leans inward.\nA table becomes a fortress, laughter its guard.\nLet the cold take what it can—never your kindness.\nMidwinter passes; what you keep remains.'
    ],
    greengrass: [
      'New leaves, old oaths.\nWhat slept beneath the frost remembers how to rise.\nPlant one honest thing and guard it well.\nGreengrass rewards the patient hand.',
      'The ground softens, and so do hard hearts.\nEven stone streets smell faintly of green.\nBegin small; the year will carry it.\nGreengrass is permission to try again.',
      'Rains rinse the soot from winter’s edges.\nPromises sprout where doubt once sat.\nShare seed, share story, share time.\nGreengrass makes room for mercy.',
      'A bud is a bargain with the future.\nYou do not need certainty to begin.\nTie your hopes to living things.\nGreengrass will do the rest.'
    ],
    midsummer: [
      'Sun at its crown—nothing stays hidden.\nLanterns and laughter crowd out careful silence.\nSpend your joy while the night is long.\nMidsummer remembers those who dared to dance.',
      'Torches flare, and shadows surrender.\nThe city forgets its measured pace for one bright span.\nSay what you mean before dawn returns.\nMidsummer does not wait for permission.',
      'Heat hangs thick, but spirits run light.\nA kiss can be a treaty for a night.\nLet the music carry what words cannot.\nMidsummer makes boldness feel easy.',
      'The longest day lends courage to fools and sages alike.\nDrink deep, then tell the truth.\nJoy is a kind of strength when shared.\nMidsummer proves it.'
    ],
    shieldmeet: [
      'Once in four years, the world holds its breath.\nCharters are read where all may hear.\nA promise spoken plainly is a shield.\nShieldmeet weighs the city’s soul.',
      'No feast outruns the law tonight.\nHands are raised, not blades.\nLegitimacy is built in daylight.\nShieldmeet remembers who stood accountable.',
      'The bells ring, and the crowd answers—steady, not loud.\nJustice prefers clear words over sharp steel.\nChoose carefully; the year will quote you.\nShieldmeet binds what you decide.',
      'Open doors, open records, open eyes.\nPower is safest when it can be questioned.\nLet governance be seen to be believed.\nShieldmeet makes the hidden visible.'
    ],
    highharvestide: [
      'The reaping comes; so do the debts.\nCount what you gained and what it cost.\nSet aside a share for storms you cannot name.\nHighharvestide honors honest accounting.',
      'Full barns, full hearts—if you keep them that way.\nGratitude is measured in portions given away.\nClose the ledgers with clean hands.\nHighharvestide rewards restraint.',
      'Bread on the table is victory enough.\nThe year was heavy; let the harvest be kind.\nPay your tithes, then feed your neighbors.\nHighharvestide steadies the coming cold.',
      'Markets quiet after the last tally.\nYou cannot eat coin, but you can share food.\nStore wisely; celebrate gently.\nHighharvestide teaches the difference.'
    ],
    feastofthemoon: [
      'The moon counts what mortals misplace.\nSet a chair for those who will not return.\nTell their stories until they feel near again.\nThe Feast of the Moon is gentleness made ritual.',
      'A quiet table holds more than a loud hall.\nNames are spoken like prayers and passed like bread.\nGrief sits down, and comfort follows.\nThe Feast of the Moon keeps families whole.',
      'Candlelight does not banish loss, but it makes room to breathe.\nShare what you remember, not what you regret.\nLet the sea keep its secrets; keep your love.\nThe Feast of the Moon asks nothing more.',
      'Moonlight on the floor, warm hands in the dark.\nNo bargains tonight—only belonging.\nThe year slows long enough to listen.\nThe Feast of the Moon is that pause.'
    ],
    uktar: [
      'Rot settles in where warmth once lay.\nThe year exhales its final breath without apology.\nWhat spoils now will feed what comes next.\nUktar teaches endings without cruelty.',
      'Fog thickens, cellars dampen, and patience becomes a skill.\nDo not curse decay; it is honest work.\nClear what must be cleared before the frost.\nUktar makes room for renewal.',
      'Leaves collapse to paste and roads turn slick.\nThe world shows its under-side: worms, mold, and root.\nPrepare, preserve, and do not pretend.\nUktar is truth in brown and gray.',
      'Nothing stays sweet forever.\nThe wise learn when to seal the jar and bank the fire.\nDecay is a messenger, not a verdict.\nUktar’s lesson is readiness.'
    ],
    midwinters_eve: [
      'A breath between what was and will.\nNo oaths demanded, no banners raised.\nRelease the old year gently and keep only what matters.\nMidwinter’s Eve lets the turning happen.',
      'The lamps burn low and the city listens.\nForgive what you can; remember what you must.\nTomorrow arrives whether invited or not.\nYear’s Turning is humility made visible.',
      'Time pauses long enough to be felt.\nSet down the weight you carried and pick up something kinder.\nThe circle closes, then begins.\nMidwinter’s Eve is the hinge.',
      'The old year steps back without ceremony.\nThe new year waits without a name.\nBetween them lies one quiet night to breathe.\nYear’s Turning belongs to everyone.'
    ]
  };

  // Generic fallback: used if an unknown festival key is passed in.
  var FESTIVAL_QUIP_FALLBACK_DEFAULT = [
    'The calendar turns, and the world turns with it.\nSome nights are for noise; some are for noticing.\nHold what matters and let the rest pass.\nThe year will make room.',
    'A festival is a stitch in time.\nIt holds the days together when they threaten to fray.\nShare a word, share a fire, share a moment.\nThat is enough.',
    'Old seasons end; new ones arrive.\nRitual gives shape to change.\nStand with others and breathe through the turning.\nThe world continues.',
    'Whether the streets roar or the hearth whispers, the meaning is the same.\nRemember, repair, rejoice, renew.\nThe day is marked because you marked it.\nCarry that forward.'
  ];

  function _pickRandom(arr){
    if(!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function _getQuipsModule(){
    // Global object name per project convention: dwt_quips
    // Safe read only; no dependency required.
    return RT && RT.dwt_quips ? RT.dwt_quips : null;
  }

  function resolveFestivalLongQuip(key){
    var nk = normFestivalKey(key);

    // 1) Prefer dwt_quips module if present.
    var Q = _getQuipsModule();
    if(Q && typeof Q.getQuips === 'function'){
      try{
        var path = 'quips.festival.' + nk + '.medium';
        var pool = Q.getQuips(path);
        if(Array.isArray(pool) && pool.length){
          return _pickRandom(pool);
        }
      }catch(e){
        // Fall through to calendar-local fallback.
      }
    }

    // 2) Calendar-local festival fallback pools (4 per festival).
    var fb = FESTIVAL_QUIP_FALLBACK_LONG[nk];
    if(Array.isArray(fb) && fb.length){
      return _pickRandom(fb);
    }

    // 3) Generic fallback.
    return _pickRandom(FESTIVAL_QUIP_FALLBACK_DEFAULT);
  }

  // >>> SET FESTIVAL MINIMUM CELL HEIGHT HERE <<<
  // This preserves stable handout sizing when switching Month ↔ Festival views.
  // Value is pixels.
  var FESTIVAL_MIN_CELL_HEIGHT_PX = 100;  // <-- ADJUST MIN HEIGHT HERE


  /* ========== Sequencing/Render ========== */
  function gmId(){
    var ps=findObjs({_type:'player'})||[];
    for(var i=0;i<ps.length;i++){
      try{ if(playerIsGM(ps[i].id)) return ps[i].id; }catch(e){}
    }
    return null;
  }

  function sendAsGM(line){
    var gid=gmId();
    sendChat(gid?('player|'+gid):'dwt',line);
  }

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
  function renderMonthTable(year, month, highlightDay){
    var v=cssVars(), built=headerCal(MONTHS[month-1].name);

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
    var quip  = resolveFestivalLongQuip(key);
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

    // Render quips as enforced 4-line blocks (Option A):
    // - Normalize arrays-of-lines -> single string
    // - Convert literal "\\n" sequences -> real newlines
    // - Split into lines BEFORE escaping, then render each line as a block element
    // This avoids Roll20 newline/whitespace collapsing behavior.
    function renderFestivalQuipBlocks(q){
      try{
        if(q === null || q === undefined) return '';
        if(Array.isArray(q)) { q = q.join('\n'); }
        q = ''+q;
        // Convert literal "\n" to real newlines without regex literals (Roll20-sandbox safe).
        if(q.indexOf('\\n') !== -1){ q = q.split('\\n').join('\n'); }
        // Split on CRLF / CR / LF and Unicode line separators.
        var reSplit = new RegExp('\\r\\n|\\r|\\n|\\u2028|\\u2029');
        var lines = q.split(reSplit);
        var out = '';
        for(var i=0;i<lines.length;i++){
          var line = lines[i];
          // Preserve intentional blank lines if present.
          out += '<div style="display:block;margin:0;padding:0;line-height:1.50;">' + esc(line) + '</div>';
        }
        return out;
      }catch(e){
        // Fail safe: return escaped text
        return esc((''+q));
      }
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
    var mule = findObjs({_type:'character', name:DWT_MULE})[0];
    if(!mule){
      mule = createObj('character', { name:DWT_MULE, archived:false, inplayerjournals:'', controlledby:'' });
    }
    return mule;
  }
  function upsertAbility(character, name, action){
    if(!character) return;
    var ability = findObjs({_type:'ability', _characterid:character.id, name:name})[0];
    if(ability) ability.set({action:String(action||'')});
    else createObj('ability',{characterid:character.id,name:name,action:String(action||''),istokenaction:false});
  }
  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = findObjs({_type:'ability', _characterid:character.id, name:name})[0];
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
      return {year:y,index:idxForFest(seq,'midsummer')};
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
      var startDay = (v.year===now.year && tok.m===now.month) ? now.day : 1;
      built = renderMonthTable(v.year, tok.m, startDay);
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
      var y = now.year; while(ord<=0){ y--; ord += yearLen(y); }
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
      var y = now.year; while(ord>yearLen(y)){ ord -= yearLen(y); y++; }
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
    _dateLine: currentDateLine
  };
}());

on('ready', function(){ dwt_calendar.init(); });

on('change:player:_online', function(p){
  try{ if(p && p.id){ dwt_calendar._refreshView(); } }catch(e){ log('calendar login refresh err: '+e); }
});

