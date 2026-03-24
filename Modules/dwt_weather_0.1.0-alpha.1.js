// name:        dwt_weather.js
// version:     0.1.0-alpha.1
// description: Core-aware weather engine for the DWT (Date-Weather-Trade) Roll20 API suite.
//              - Stores weather settings, metadata, current weather, and history beneath a single
//                root dwt_mule ability named weather.
//              - Writes the module version to the root dwt_mule ability named version.
//              - Updates weather in Harptos timeofday segments (early/late predawn, morning, afternoon, evening).
//              - Loads regional profiles from the shared dwt_mule ability named regions.
//              - Provides !dwt --weather controls and injects a weather line + short quip into the unified Campaign Log.
// depends:     dwt_core >= 0.1.0-alpha.1, dwt_calendar >= 0.1.0-alpha.1 (state.dwt.now), Roll20 API.
// author:      TC McFall (AI-assisted)
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

var dwt_weather = dwt_weather || (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '0.1.0-alpha.1';
  var MODULE_KEY = 'weather';
  var MULE_NAME = 'dwt_mule';
  var REGION_PROFILE_SCHEMA = 'dwt.region.v4';
  var WEATHER_ROOT_SCHEMA = 'dwt.weather.root.v2';
  var WEATHER_CURRENT_SCHEMA = 'dwt.weather.current.v3';
  var WEATHER_TICK_SCHEMA = 'dwt.harptos.tick.v2';
  var HARPTOS_BASE_YEAR = 1300;

  // ---------------------------------------------------------------------------
  // Active-page windsock token (multi-sided + rotation)
  // ---------------------------------------------------------------------------
  // Token name: dwt_windsock
  // Side order (by index) MUST be:
  //   0: dead_calm
  //   1: 20%
  //   2: 40%
  //   3: 60%
  //   4: 80%
  //   5: 100%
  //   6: crit_light
  //   7: crit_moderate
  //   8: crit_heavy
  //   9: crit_severe
  //   10: uw_dead_calm
  //   11: uw_20%
  //   12: uw_40%
  //   13: uw_60%
  //   14: uw_80%
  //   15: uw_100%
  //   16: uw_crit_light
  //   17: uw_crit_moderate
  //   18: uw_crit_heavy
  //   19: uw_crit_severe
  //   20: ud_dead_calm
  //   21: ud_20%
  //   22: ud_40%
  //   23: ud_60%
  //   24: ud_80%
  //   25: ud_100%
  //   26: ud_crit_light
  //   27: ud_crit_moderate
  //   28: ud_crit_heavy
  //   29: ud_crit_severe
  //
  // Animation cadence: milliseconds per step for BOTH rotation and side changes.
  // Requested default: 0.05 seconds per step.
  var WINDSOCK_NAME = 'dwt_windsock';
  var WINDSOCK_STEP_MS = 50; // Milliseconds between rotation/side animation steps.
  var WINDSOCK_SIDE_MAX = 29;
  var WINDSOCK_SIDES = {
    dead_calm: 0,
    surface_20: 1,
    surface_40: 2,
    surface_60: 3,
    surface_80: 4,
    surface_100: 5,
    surface_crit_light: 6,
    surface_crit_moderate: 7,
    surface_crit_heavy: 8,
    surface_crit_severe: 9,
    uw_dead_calm: 10,
    uw_20: 11,
    uw_40: 12,
    uw_60: 13,
    uw_80: 14,
    uw_100: 15,
    uw_crit_light: 16,
    uw_crit_moderate: 17,
    uw_crit_heavy: 18,
    uw_crit_severe: 19,
    ud_dead_calm: 20,
    ud_20: 21,
    ud_40: 22,
    ud_60: 23,
    ud_80: 24,
    ud_100: 25,
    ud_crit_light: 26,
    ud_crit_moderate: 27,
    ud_crit_heavy: 28,
    ud_crit_severe: 29
  };

  var COMPASS_16 = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  var COMPASS_WORDS_16 = {
    'N':'north','NNE':'north-northeast','NE':'northeast','ENE':'east-northeast',
    'E':'east','ESE':'east-southeast','SE':'southeast','SSE':'south-southeast',
    'S':'south','SSW':'south-southwest','SW':'southwest','WSW':'west-southwest',
    'W':'west','WNW':'west-northwest','NW':'northwest','NNW':'north-northwest'
  };

  var _windsockAnim = {}; // pageId -> { timers:[] }

  function _wsClear(pageId){
    var st = _windsockAnim[pageId];
    if(!st || !st.timers) return;
    for(var i=0;i<st.timers.length;i++){
      try{ clearTimeout(st.timers[i]); }catch(e){}
    }
    st.timers = [];
  }

  function _wsLater(pageId, fn, delay){
    var t = setTimeout(fn, delay);
    if(!_windsockAnim[pageId]) _windsockAnim[pageId] = { timers:[] };
    _windsockAnim[pageId].timers.push(t);
    return t;
  }
  function _activePageId(pid){
    // Prefer the invoking player's current page if set; otherwise use the active player page.
    // This makes testing on a GM ribbon page work while still defaulting to the player page.
    try{
      var c = Campaign();
      if(pid){
        var psp = c.get('playerspecificpages') || {};
        if(psp && psp[pid]) return psp[pid];
      }
      return c.get('playerpageid');
    }catch(e){ return null; }
  }

  function _findWindsockToken(pageId){
    try{
      var toks = findObjs({_type:'graphic', _pageid:pageId, name:WINDSOCK_NAME}) || [];
      if(!toks.length) return null;
      // Prefer map layer, but accept any layer (portable).
      for(var i=0;i<toks.length;i++){
        if(String(toks[i].get('layer')||'') === 'map') return toks[i];
      }
      return toks[0];
    }catch(e){ return null; }
  }

  function _dirToIdx16(dir){
    dir = String(dir||'').trim().toUpperCase();
    if(!dir) return 0;

    var i = COMPASS_16.indexOf(dir);
    if(i >= 0) return i;

    // degrees
    var deg = parseFloat(dir);
    if(!isNaN(deg)){
      deg = (((deg % 360) + 360) % 360);
      return Math.round(deg / 22.5) % 16;
    }

    // words (northwest, north-west, north west, etc.)
    var s = dir.replace(/[^A-Z]/g,'');
    // normalize common full-words collapsed forms
    s = s.replace(/NORTH/g,'N').replace(/SOUTH/g,'S').replace(/EAST/g,'E').replace(/WEST/g,'W');
    // After collapse we may have NNW, SW, etc.
    i = COMPASS_16.indexOf(s);
    return (i >= 0) ? i : 0;
  }

  function dirToWords16(dir){
    dir = String(dir||'').trim().toUpperCase();
    return COMPASS_WORDS_16[dir] || dirToWords(dir);
  }

  function _stepDir16(cur, target){
    var diff = (target - cur + 16) % 16;
    if(diff === 0) return 0;
    return (diff <= 8) ? 1 : -1;
  }

  function _wsDecodeSideUrl(u){
    // Roll20 stores token.sides as a pipe-delimited list of URI-encoded URLs. Decode before use.
    try{ return decodeURIComponent(String(u||'')); }catch(e){ return String(u||''); }
  }

  function _wsToThumb(u){
    // Ensure Roll20-friendly thumb image URL (max/med/original can fail on set('imgsrc')).
    u = String(u||'');
    // Convert image size segment to /thumb.
    u = u.replace(/\/(med|max|original)\./, '/thumb.');
    // If no size segment exists, leave as-is.
    return u;
  }
  function _wsAnimate(pageId, tok, fromDirIdx, toDirIdx, fromSideIdx, toSideIdx){
    _wsClear(pageId);

    var curDir = clamp(+fromDirIdx||0, 0, 15);
    var curSide = clamp(+fromSideIdx||0, 0, WINDSOCK_SIDE_MAX);
    toDirIdx = clamp(+toDirIdx||0, 0, 15);
    toSideIdx = clamp(+toSideIdx||0, 0, WINDSOCK_SIDE_MAX);

    function stepDir(){
      if(curDir === toDirIdx) return;
      curDir = (curDir + _stepDir16(curDir, toDirIdx) + 16) % 16;
      try{ tok.set('rotation', curDir * 22.5); }catch(e){}
      _wsLater(pageId, stepDir, WINDSOCK_STEP_MS);
    }

    function stepSide(){
      if(curSide === toSideIdx) return;
      curSide += (curSide < toSideIdx) ? 1 : -1;

      try{ tok.set('currentSide', curSide); }catch(e){}

      // Roll20 can sometimes fail to visually refresh a multi-sided token when only currentSide is set,
      // especially for rollable-table tokens. If we can see the sides list, also set imgsrc to force refresh.
      try{
        var sidesStr = String(tok.get('sides')||'');
        if(sidesStr){
          var parts = sidesStr.split('|');
          if(curSide >= 0 && curSide < parts.length && parts[curSide]){
            tok.set('imgsrc', _wsToThumb(_wsDecodeSideUrl(parts[curSide])));
          }
        }
      }catch(e2){}

      _wsLater(pageId, stepSide, WINDSOCK_STEP_MS);
    }

    _wsLater(pageId, stepDir, 0);
    _wsLater(pageId, stepSide, 0);
  }

  function _wsApplyImmediate(tok, dirIdx, sideIdx){
    dirIdx = clamp(+dirIdx||0, 0, 15);
    sideIdx = clamp(+sideIdx||0, 0, WINDSOCK_SIDE_MAX);
    try{ tok.set('rotation', dirIdx * 22.5); }catch(e){}
    try{ tok.set('currentSide', sideIdx); }catch(e2){}
    try{
      var sidesStr = String(tok.get('sides')||'');
      if(sidesStr){
        var parts = sidesStr.split('|');
        if(sideIdx >= 0 && sideIdx < parts.length && parts[sideIdx]){
          tok.set('imgsrc', _wsToThumb(_wsDecodeSideUrl(parts[sideIdx])));
        }
      }
    }catch(e3){}
  }



  var LOCALES = ['offshore','coastal','inland','underwater','underdark'];
  var DEEP_LOCALES = {
    underwater:{ includeFathoms:true },
    underdark:{ includeFathoms:false }
  };
  var SEASONS = ['winter','spring','summer','autumn'];
  var CURRENT_SAMPLE_KEYS = ['surface','shallow','mid','deep'];
  var DEFAULT_WATER_SAMPLE_FRACTIONS = { shallow:0.2, mid:0.6, deep:0.8 };
  var DEFAULT_WATER_SAMPLE_FATHOMS = { shallow:1, mid:5, deep:10 };
  var DEFAULT_WATER_PROFILES = {
    offshore:{
      bodyType:'open_ocean',
      totalDepthFeet:600,
      sampleMode:'fixed_fathoms',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    coastal:{
      bodyType:'coastline',
      totalDepthFeet:90,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    underwater:{
      bodyType:'reef',
      totalDepthFeet:90,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    lake:{
      bodyType:'lake',
      totalDepthFeet:60,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    river:{
      bodyType:'river',
      totalDepthFeet:18,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    }
  };
  // NOAA light-depth zones are adapted by body type using Kd490-style clarity guidance so
  // underwater pages can darken faster in turbid water without changing the region schema.
  var UNDERWATER_VISIBILITY_MODELS = {
    open_ocean:{ sunlitMaxMeters:200, twilightMaxMeters:1000, baseRangeMeters:30, bodyLabel:'open-ocean water' },
    reef:{ sunlitMaxMeters:140, twilightMaxMeters:500, baseRangeMeters:20, bodyLabel:'reef water' },
    coastline:{ sunlitMaxMeters:100, twilightMaxMeters:300, baseRangeMeters:12, bodyLabel:'coastal water' },
    lake:{ sunlitMaxMeters:60, twilightMaxMeters:180, baseRangeMeters:8, bodyLabel:'lake water' },
    river:{ sunlitMaxMeters:20, twilightMaxMeters:60, baseRangeMeters:4, bodyLabel:'river water' }
  };
  var PERIOD_ORDER = [
    'hammer','midwinter','alturiak','ches','tarsakh','greengrass','mirtul','kythorn',
    'flamerule','midsummer','shieldmeet','eleasis','eleint','highharvestide',
    'marpenoth','uktar','feastofthemoon','nightal'
  ];
  var PERIOD_INFO = {
    hammer:{ label:'Hammer', season:'winter', month:1 },
    midwinter:{ label:'Midwinter', season:'winter', festival:true },
    alturiak:{ label:'Alturiak', season:'winter', month:2 },
    ches:{ label:'Ches', season:'spring', month:3 },
    tarsakh:{ label:'Tarsakh', season:'spring', month:4 },
    greengrass:{ label:'Greengrass', season:'spring', festival:true },
    mirtul:{ label:'Mirtul', season:'spring', month:5 },
    kythorn:{ label:'Kythorn', season:'summer', month:6 },
    flamerule:{ label:'Flamerule', season:'summer', month:7 },
    midsummer:{ label:'Midsummer', season:'summer', festival:true },
    shieldmeet:{ label:'Shieldmeet', season:'summer', festival:true },
    eleasis:{ label:'Eleasis', season:'summer', month:8 },
    eleint:{ label:'Eleint', season:'autumn', month:9 },
    highharvestide:{ label:'Highharvestide', season:'autumn', festival:true },
    marpenoth:{ label:'Marpenoth', season:'autumn', month:10 },
    uktar:{ label:'Uktar', season:'autumn', month:11 },
    feastofthemoon:{ label:'Feast of the Moon', season:'autumn', festival:true },
    nightal:{ label:'Nightal', season:'winter', month:12 }
  };
  var MONTH_TO_PERIOD = {
    1:'hammer',
    2:'alturiak',
    3:'ches',
    4:'tarsakh',
    5:'mirtul',
    6:'kythorn',
    7:'flamerule',
    8:'eleasis',
    9:'eleint',
    10:'marpenoth',
    11:'uktar',
    12:'nightal'
  };
  var HARPTOS_BETWEEN_FESTIVALS = [
    { key:'midwinter', afterMonth:1 },
    { key:'greengrass', afterMonth:4 },
    { key:'midsummer', afterMonth:7 },
    { key:'shieldmeet', afterMonth:7, leap:true },
    { key:'highharvestide', afterMonth:9 },
    { key:'feastofthemoon', afterMonth:11 }
  ];
  var HARPTOS_YEAR_DAY_CACHE = {};
  var DEFAULT_LOCALE_DEFINITIONS = {
    offshore:{
      key:'offshore',
      label:'Offshore',
      token:'Offshore',
      environment:'surface',
      biome:'ocean',
      climateMode:'offset',
      inherits:'region',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.offshore
    },
    coastal:{
      key:'coastal',
      label:'Coastal',
      token:'Coastal',
      environment:'surface',
      biome:'coastline',
      climateMode:'offset',
      inherits:'region',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.coastal
    },
    inland:{
      key:'inland',
      label:'Inland',
      token:'Inland',
      environment:'surface',
      biome:'plains',
      climateMode:'offset',
      inherits:'region',
      useSeasonalCurrent:false
    },
    underwater:{
      key:'underwater',
      label:'Underwater',
      token:'Underwater',
      environment:'underwater',
      biome:'reef',
      climateMode:'offset',
      inherits:'region',
      useSeasonalCurrent:true,
      includeFathoms:true,
      waterProfile:DEFAULT_WATER_PROFILES.underwater
    },
    underdark:{
      key:'underdark',
      label:'Underdark',
      token:'Underdark',
      environment:'subterranean',
      biome:'caverns',
      climateMode:'offset',
      inherits:'region',
      useSeasonalCurrent:false,
      includeFathoms:false
    }
  };
  var BUILTIN_CRITICAL_EVENTS = {
    blizzard:{
      name:'Blizzard',
      category:'storm',
      environments:['surface'],
      summary:'Driving snow and biting wind choke roads and sightlines.',
      severities:{
        light:{ durationSegments:2, rangeMiles:3, saveDc:12, damage:'1d4', damageTypes:['cold'], motionPercent:85, tempDeltaF:-10, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain'] },
        moderate:{ durationSegments:4, rangeMiles:6, saveDc:14, damage:'1d6', damageTypes:['cold'], motionPercent:90, tempDeltaF:-15, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain','navigation at disadvantage'] },
        heavy:{ durationSegments:6, rangeMiles:10, saveDc:15, damage:'2d6', damageTypes:['cold'], motionPercent:95, tempDeltaF:-20, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain','travel pace reduced'] },
        severe:{ durationSegments:8, rangeMiles:15, saveDc:17, damage:'3d6', damageTypes:['cold'], motionPercent:100, tempDeltaF:-25, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain','travel pace reduced','exposed creatures risk exhaustion'] }
      }
    },
    ice_storm:{
      name:'Ice Storm',
      category:'storm',
      environments:['surface'],
      summary:'Freezing hail and sleet turn open ground treacherous.',
      severities:{
        light:{ durationSegments:2, rangeMiles:2, saveDc:12, damage:'1d4', damageTypes:['cold','bludgeoning'], motionPercent:85, tempDeltaF:-6, rainfall:'moderate', skies:'stormy', environmentalEffects:['slippery ground','lightly obscured'] },
        moderate:{ durationSegments:3, rangeMiles:4, saveDc:14, damage:'1d6', damageTypes:['cold','bludgeoning'], motionPercent:90, tempDeltaF:-8, rainfall:'heavy', skies:'stormy', environmentalEffects:['slippery ground','lightly obscured','difficult terrain'] },
        heavy:{ durationSegments:4, rangeMiles:7, saveDc:15, damage:'2d6', damageTypes:['cold','bludgeoning'], motionPercent:95, tempDeltaF:-10, rainfall:'heavy', skies:'stormy', environmentalEffects:['slippery ground','difficult terrain','visibility reduced'] },
        severe:{ durationSegments:6, rangeMiles:10, saveDc:17, damage:'3d6', damageTypes:['cold','bludgeoning'], motionPercent:100, tempDeltaF:-12, rainfall:'heavy', skies:'stormy', environmentalEffects:['slippery ground','difficult terrain','visibility reduced','structures take icing stress'] }
      }
    },
    winter_gale:{
      name:'Winter Gale',
      category:'storm',
      environments:['surface','underwater'],
      summary:'Hard cold wind or current slams exposed travelers and vessels.',
      severities:{
        light:{ durationSegments:2, rangeMiles:5, saveDc:12, damage:'1d4', damageTypes:['bludgeoning'], motionPercent:85, tempDeltaF:-5, rainfall:'light', skies:'overcast', environmentalEffects:['strong wind','fog dispersed'] },
        moderate:{ durationSegments:4, rangeMiles:10, saveDc:14, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:90, tempDeltaF:-8, rainfall:'moderate', skies:'stormy', environmentalEffects:['strong wind','ranged attacks at disadvantage'] },
        heavy:{ durationSegments:6, rangeMiles:15, saveDc:15, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:95, tempDeltaF:-10, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','ranged attacks at disadvantage','small craft endangered'] },
        severe:{ durationSegments:8, rangeMiles:25, saveDc:17, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:100, tempDeltaF:-12, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','ranged attacks at disadvantage','small craft endangered','travel halted in exposed terrain'] }
      }
    },
    thunderstorm:{
      name:'Thunderstorm',
      category:'storm',
      environments:['surface'],
      summary:'Thunder, lightning, and hard rain sweep across the region.',
      severities:{
        light:{ durationSegments:2, rangeMiles:4, saveDc:12, damage:'1d4', damageTypes:['lightning'], motionPercent:85, tempDeltaF:-2, rainfall:'moderate', skies:'stormy', environmentalEffects:['lightly obscured','Perception at disadvantage'] },
        moderate:{ durationSegments:4, rangeMiles:8, saveDc:14, damage:'1d6', damageTypes:['lightning','thunder'], motionPercent:90, tempDeltaF:-4, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','Perception at disadvantage','open flames extinguished'] },
        heavy:{ durationSegments:5, rangeMiles:12, saveDc:15, damage:'2d6', damageTypes:['lightning','thunder'], motionPercent:95, tempDeltaF:-6, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','open flames extinguished','ranged attacks at disadvantage'] },
        severe:{ durationSegments:7, rangeMiles:18, saveDc:17, damage:'3d6', damageTypes:['lightning','thunder'], motionPercent:100, tempDeltaF:-8, rainfall:'heavy', skies:'stormy', environmentalEffects:['lightly obscured','open flames extinguished','ranged attacks at disadvantage','flash flooding possible'] }
      }
    },
    sea_storm:{
      name:'Sea Storm',
      category:'storm',
      environments:['surface','underwater'],
      summary:'Heavy seas and violent weather punish coastlines and open water.',
      severities:{
        light:{ durationSegments:2, rangeMiles:6, saveDc:12, damage:'1d4', damageTypes:['bludgeoning'], motionPercent:85, tempDeltaF:-2, rainfall:'moderate', skies:'stormy', environmentalEffects:['rough seas','lightly obscured'] },
        moderate:{ durationSegments:4, rangeMiles:12, saveDc:14, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:90, tempDeltaF:-4, rainfall:'heavy', skies:'stormy', environmentalEffects:['rough seas','lightly obscured','small craft endangered'] },
        heavy:{ durationSegments:6, rangeMiles:20, saveDc:15, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:95, tempDeltaF:-6, rainfall:'heavy', skies:'stormy', environmentalEffects:['heavy seas','lightly obscured','small craft endangered'] },
        severe:{ durationSegments:8, rangeMiles:30, saveDc:17, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:100, tempDeltaF:-8, rainfall:'heavy', skies:'stormy', environmentalEffects:['heavy seas','lightly obscured','small craft endangered','capsize risk'] }
      }
    },
    rogue_wave:{
      name:'Rogue Wave',
      category:'marine',
      environments:['surface','underwater'],
      summary:'A sudden wall of water smashes through ships, reefs, and shallows.',
      severities:{
        light:{ durationSegments:1, rangeMiles:1, saveDc:12, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:85, rainfall:'light', skies:'overcast', environmentalEffects:['creatures knocked prone','deck footing hazardous'] },
        moderate:{ durationSegments:1, rangeMiles:2, saveDc:14, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:90, rainfall:'moderate', skies:'stormy', environmentalEffects:['creatures knocked prone','deck footing hazardous','small craft swamped'] },
        heavy:{ durationSegments:2, rangeMiles:3, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:95, rainfall:'heavy', skies:'stormy', environmentalEffects:['creatures knocked prone','small craft swamped','wreckage creates difficult terrain'] },
        severe:{ durationSegments:2, rangeMiles:5, saveDc:17, damage:'4d6', damageTypes:['bludgeoning'], motionPercent:100, rainfall:'heavy', skies:'stormy', environmentalEffects:['creatures knocked prone','small craft swamped','wreckage creates difficult terrain','capsize risk'] }
      }
    },
    hurricane:{
      name:'Hurricane',
      category:'storm',
      environments:['surface'],
      summary:'A massive rotating storm devastates coastlines and sea lanes.',
      severities:{
        light:{ durationSegments:4, rangeMiles:25, saveDc:13, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:85, tempDeltaF:-4, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','lightly obscured','storm surge risk'] },
        moderate:{ durationSegments:6, rangeMiles:40, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:90, tempDeltaF:-6, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','lightly obscured','storm surge risk','travel pace reduced'] },
        heavy:{ durationSegments:8, rangeMiles:60, saveDc:16, damage:'4d6', damageTypes:['bludgeoning'], motionPercent:95, tempDeltaF:-8, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','lightly obscured','storm surge risk','travel pace reduced','structures damaged'] },
        severe:{ durationSegments:10, rangeMiles:90, saveDc:18, damage:'6d6', damageTypes:['bludgeoning'], motionPercent:100, tempDeltaF:-10, rainfall:'heavy', skies:'stormy', environmentalEffects:['strong wind','lightly obscured','storm surge risk','travel pace reduced','structures damaged','coastal flooding'] }
      }
    },
    tornado:{
      name:'Tornado',
      category:'storm',
      environments:['surface'],
      summary:'A violent funnel tears across the ground with little warning.',
      severities:{
        light:{ durationSegments:1, rangeMiles:1, saveDc:13, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:85, rainfall:'light', skies:'stormy', environmentalEffects:['flying debris','creatures knocked prone'] },
        moderate:{ durationSegments:1, rangeMiles:2, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:90, rainfall:'moderate', skies:'stormy', environmentalEffects:['flying debris','creatures knocked prone','difficult terrain from wreckage'] },
        heavy:{ durationSegments:2, rangeMiles:3, saveDc:16, damage:'4d6', damageTypes:['bludgeoning'], motionPercent:95, rainfall:'moderate', skies:'stormy', environmentalEffects:['flying debris','creatures knocked prone','structures damaged'] },
        severe:{ durationSegments:2, rangeMiles:5, saveDc:18, damage:'6d6', damageTypes:['bludgeoning'], motionPercent:100, rainfall:'heavy', skies:'stormy', environmentalEffects:['flying debris','creatures knocked prone','structures destroyed','difficult terrain from wreckage'] }
      }
    },
    sandstorm:{
      name:'Sandstorm',
      category:'storm',
      environments:['surface'],
      summary:'Blasting grit erodes sight, breath, and exposed skin.',
      severities:{
        light:{ durationSegments:2, rangeMiles:3, saveDc:12, damage:'1d4', damageTypes:['slashing'], motionPercent:85, tempDeltaF:4, rainfall:'none', skies:'overcast', environmentalEffects:['lightly obscured','Perception at disadvantage'] },
        moderate:{ durationSegments:4, rangeMiles:6, saveDc:14, damage:'1d6', damageTypes:['slashing'], motionPercent:90, tempDeltaF:6, rainfall:'none', skies:'overcast', environmentalEffects:['lightly obscured','Perception at disadvantage','difficult terrain'] },
        heavy:{ durationSegments:6, rangeMiles:10, saveDc:15, damage:'2d6', damageTypes:['slashing'], motionPercent:95, tempDeltaF:8, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain','ranged attacks at disadvantage'] },
        severe:{ durationSegments:8, rangeMiles:15, saveDc:17, damage:'3d6', damageTypes:['slashing'], motionPercent:100, tempDeltaF:10, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','difficult terrain','ranged attacks at disadvantage','travel halted in open desert'] }
      }
    },
    heat_wave:{
      name:'Heat Wave',
      category:'temperature',
      environments:['surface','subterranean'],
      summary:'Oppressive heat drains water, stamina, and concentration.',
      severities:{
        light:{ durationSegments:4, rangeMiles:10, saveDc:10, damage:'0', damageTypes:[], motionPercent:null, tempDeltaF:10, rainfall:'none', skies:'clear', environmentalEffects:['extreme heat exposure'] },
        moderate:{ durationSegments:6, rangeMiles:20, saveDc:12, damage:'0', damageTypes:[], motionPercent:null, tempDeltaF:15, rainfall:'none', skies:'clear', environmentalEffects:['extreme heat exposure','water demand increased'] },
        heavy:{ durationSegments:8, rangeMiles:30, saveDc:14, damage:'1d4', damageTypes:['fire'], motionPercent:null, tempDeltaF:20, rainfall:'none', skies:'clear', environmentalEffects:['extreme heat exposure','water demand increased','travel pace reduced'] },
        severe:{ durationSegments:10, rangeMiles:50, saveDc:16, damage:'1d6', damageTypes:['fire'], motionPercent:null, tempDeltaF:25, rainfall:'none', skies:'clear', environmentalEffects:['extreme heat exposure','water demand increased','travel pace reduced','wildfire risk'] }
      }
    },
    flash_flood:{
      name:'Flash Flood',
      category:'water',
      environments:['surface'],
      summary:'A sudden rush of water swallows roads, ravines, and camps.',
      severities:{
        light:{ durationSegments:1, rangeMiles:1, saveDc:12, damage:'1d4', damageTypes:['bludgeoning'], motionPercent:85, rainfall:'heavy', skies:'stormy', environmentalEffects:['difficult terrain','low crossings blocked'] },
        moderate:{ durationSegments:2, rangeMiles:3, saveDc:14, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:90, rainfall:'heavy', skies:'stormy', environmentalEffects:['difficult terrain','low crossings blocked','creatures may be swept away'] },
        heavy:{ durationSegments:3, rangeMiles:5, saveDc:15, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:95, rainfall:'heavy', skies:'stormy', environmentalEffects:['difficult terrain','creatures may be swept away','roads washed out'] },
        severe:{ durationSegments:4, rangeMiles:8, saveDc:17, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:100, rainfall:'heavy', skies:'stormy', environmentalEffects:['difficult terrain','creatures may be swept away','roads washed out','settlements flooded'] }
      }
    },
    wildfire:{
      name:'Wildfire',
      category:'fire',
      environments:['surface'],
      summary:'Wind-driven flame and smoke race through dry terrain.',
      severities:{
        light:{ durationSegments:3, rangeMiles:2, saveDc:12, damage:'1d6', damageTypes:['fire'], motionPercent:85, tempDeltaF:8, rainfall:'none', skies:'overcast', environmentalEffects:['smoke lightly obscures','difficult terrain'] },
        moderate:{ durationSegments:5, rangeMiles:4, saveDc:14, damage:'2d6', damageTypes:['fire'], motionPercent:90, tempDeltaF:10, rainfall:'none', skies:'overcast', environmentalEffects:['smoke lightly obscures','difficult terrain','open flames spread'] },
        heavy:{ durationSegments:7, rangeMiles:7, saveDc:15, damage:'3d6', damageTypes:['fire'], motionPercent:95, tempDeltaF:12, rainfall:'none', skies:'stormy', environmentalEffects:['smoke lightly obscures','difficult terrain','open flames spread','travel route blocked'] },
        severe:{ durationSegments:9, rangeMiles:12, saveDc:17, damage:'4d6', damageTypes:['fire'], motionPercent:100, tempDeltaF:15, rainfall:'none', skies:'stormy', environmentalEffects:['smoke lightly obscures','difficult terrain','open flames spread','travel route blocked','settlements threatened'] }
      }
    },
    earthquake:{
      name:'Earthquake',
      category:'geologic',
      environments:['surface','subterranean','underwater'],
      summary:'The ground heaves, splits, and topples weakened structures.',
      severities:{
        light:{ durationSegments:1, rangeMiles:1, saveDc:12, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['creatures may fall prone','minor cracks and slides'] },
        moderate:{ durationSegments:1, rangeMiles:2, saveDc:14, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['creatures may fall prone','minor fissures','loose stone becomes difficult terrain'] },
        heavy:{ durationSegments:2, rangeMiles:4, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['creatures may fall prone','fissures open','cave-ins or landslides possible'] },
        severe:{ durationSegments:2, rangeMiles:8, saveDc:17, damage:'5d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['creatures may fall prone','fissures open','structures collapse','cave-ins or landslides possible'] }
      }
    },
    volcanic_eruption:{
      name:'Volcanic Eruption',
      category:'geologic',
      environments:['surface'],
      summary:'Ash, lava, and shockwaves transform the local terrain.',
      severities:{
        light:{ durationSegments:3, rangeMiles:2, saveDc:13, damage:'1d6', damageTypes:['fire'], motionPercent:85, tempDeltaF:12, rainfall:'none', skies:'overcast', environmentalEffects:['ash lightly obscures','difficult terrain from ash'] },
        moderate:{ durationSegments:5, rangeMiles:5, saveDc:15, damage:'2d6', damageTypes:['fire','poison'], motionPercent:90, tempDeltaF:15, rainfall:'none', skies:'stormy', environmentalEffects:['ash lightly obscures','difficult terrain from ash','air becomes hazardous'] },
        heavy:{ durationSegments:7, rangeMiles:10, saveDc:16, damage:'4d6', damageTypes:['fire','poison'], motionPercent:95, tempDeltaF:20, rainfall:'none', skies:'stormy', environmentalEffects:['ash lightly obscures','difficult terrain from ash','air becomes hazardous','lava channels block routes'] },
        severe:{ durationSegments:10, rangeMiles:20, saveDc:18, damage:'6d6', damageTypes:['fire','poison'], motionPercent:100, tempDeltaF:25, rainfall:'none', skies:'stormy', environmentalEffects:['ash lightly obscures','difficult terrain from ash','air becomes hazardous','lava channels block routes','settlements threatened'] }
      }
    },
    ashfall:{
      name:'Ashfall',
      category:'geologic',
      environments:['surface'],
      summary:'Volcanic ash chokes the air and smothers visibility.',
      severities:{
        light:{ durationSegments:2, rangeMiles:3, saveDc:11, damage:'0', damageTypes:[], motionPercent:85, tempDeltaF:2, rainfall:'none', skies:'overcast', environmentalEffects:['lightly obscured','surfaces slick with ash'] },
        moderate:{ durationSegments:4, rangeMiles:6, saveDc:13, damage:'1d4', damageTypes:['poison'], motionPercent:90, tempDeltaF:4, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','surfaces slick with ash','breathing is difficult'] },
        heavy:{ durationSegments:6, rangeMiles:10, saveDc:15, damage:'1d6', damageTypes:['poison'], motionPercent:95, tempDeltaF:6, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','surfaces slick with ash','breathing is difficult','difficult terrain'] },
        severe:{ durationSegments:8, rangeMiles:15, saveDc:17, damage:'2d6', damageTypes:['poison'], motionPercent:100, tempDeltaF:8, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','surfaces slick with ash','breathing is difficult','difficult terrain','roofs risk collapse under ash'] }
      }
    },
    cave_in:{
      name:'Cave-In',
      category:'geologic',
      environments:['subterranean'],
      summary:'Stone and dust crash down, blocking passages and bruising bodies.',
      severities:{
        light:{ durationSegments:1, rangeMiles:0.2, saveDc:12, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['passage partly blocked','dust lightly obscures'] },
        moderate:{ durationSegments:1, rangeMiles:0.5, saveDc:14, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['passage blocked','dust lightly obscures','difficult terrain'] },
        heavy:{ durationSegments:2, rangeMiles:1, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['passage blocked','dust lightly obscures','difficult terrain','secondary collapse risk'] },
        severe:{ durationSegments:2, rangeMiles:2, saveDc:17, damage:'5d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['passage blocked','dust lightly obscures','difficult terrain','secondary collapse risk','routes must be rerouted'] }
      }
    },
    sinkhole:{
      name:'Sinkhole',
      category:'geologic',
      environments:['surface','subterranean'],
      summary:'The ground suddenly drops away beneath roads, camps, and fields.',
      severities:{
        light:{ durationSegments:1, rangeMiles:0.2, saveDc:12, damage:'1d4', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['small depression forms','ground unstable'] },
        moderate:{ durationSegments:1, rangeMiles:0.5, saveDc:14, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['ground unstable','difficult terrain'] },
        heavy:{ durationSegments:2, rangeMiles:1, saveDc:15, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['ground unstable','difficult terrain','travel route cut'] },
        severe:{ durationSegments:2, rangeMiles:2, saveDc:17, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:null, rainfall:null, skies:null, environmentalEffects:['ground unstable','difficult terrain','travel route cut','structures collapse into sinkhole'] }
      }
    },
    toxic_fog:{
      name:'Toxic Fog',
      category:'atmospheric',
      environments:['surface','subterranean'],
      summary:'A choking vapor cloud blankets the area.',
      severities:{
        light:{ durationSegments:2, rangeMiles:1, saveDc:11, damage:'1d4', damageTypes:['poison'], motionPercent:85, rainfall:'none', skies:'overcast', environmentalEffects:['lightly obscured','breathing is difficult'] },
        moderate:{ durationSegments:4, rangeMiles:2, saveDc:13, damage:'1d6', damageTypes:['poison'], motionPercent:90, rainfall:'none', skies:'overcast', environmentalEffects:['lightly obscured','breathing is difficult','difficult terrain'] },
        heavy:{ durationSegments:6, rangeMiles:3, saveDc:15, damage:'2d6', damageTypes:['poison'], motionPercent:95, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','breathing is difficult','difficult terrain','open flames sputter'] },
        severe:{ durationSegments:8, rangeMiles:5, saveDc:17, damage:'3d6', damageTypes:['poison'], motionPercent:100, rainfall:'none', skies:'stormy', environmentalEffects:['lightly obscured','breathing is difficult','difficult terrain','routes become impassable without protection'] }
      }
    },
    maelstrom:{
      name:'Maelstrom',
      category:'marine',
      environments:['surface','underwater'],
      summary:'A violent whirlpool drags ships and swimmers toward its heart.',
      severities:{
        light:{ durationSegments:1, rangeMiles:0.5, saveDc:12, damage:'1d6', damageTypes:['bludgeoning'], motionPercent:85, rainfall:'light', skies:'overcast', environmentalEffects:['forced movement toward center','rough water'] },
        moderate:{ durationSegments:2, rangeMiles:1, saveDc:14, damage:'2d6', damageTypes:['bludgeoning'], motionPercent:90, rainfall:'moderate', skies:'stormy', environmentalEffects:['forced movement toward center','rough water','small craft endangered'] },
        heavy:{ durationSegments:3, rangeMiles:2, saveDc:15, damage:'3d6', damageTypes:['bludgeoning'], motionPercent:95, rainfall:'heavy', skies:'stormy', environmentalEffects:['forced movement toward center','rough water','small craft endangered','visibility reduced underwater'] },
        severe:{ durationSegments:4, rangeMiles:3, saveDc:17, damage:'4d6', damageTypes:['bludgeoning'], motionPercent:100, rainfall:'heavy', skies:'stormy', environmentalEffects:['forced movement toward center','rough water','small craft endangered','visibility reduced underwater','capsize risk'] }
      }
    }
  };
  var TIMEOFDAY_SEGMENTS = ['early predawn','late predawn','early morning','late morning','early afternoon','late afternoon','early evening','late evening'];
  var TIMEOFDAY_SEGMENT_KEYS = ['earlypredawn','latepredawn','earlymorning','latemorning','earlyafternoon','lateafternoon','earlyevening','lateevening'];
  var DEFAULT_TIMEOFDAY_SEGMENT_DRIFT = {
    earlypredawn:{ temperatureSwingPct:-100, temperatureDelta:-1, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-10, directionChangePct:15 },
    latepredawn:{ temperatureSwingPct:-67, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-5, directionChangePct:18 },
    earlymorning:{ temperatureSwingPct:-17, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:0, directionChangePct:22 },
    latemorning:{ temperatureSwingPct:17, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:5, directionChangePct:26 },
    earlyafternoon:{ temperatureSwingPct:67, temperatureDelta:1, precipitationDelta:0, skiesDelta:0, windDelta:1, windStrengthDeltaPct:10, directionChangePct:32 },
    lateafternoon:{ temperatureSwingPct:50, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:1, windStrengthDeltaPct:8, directionChangePct:30 },
    earlyevening:{ temperatureSwingPct:0, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:2, directionChangePct:24 },
    lateevening:{ temperatureSwingPct:-33, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-5, directionChangePct:20 }
  };
  var DEFAULT_CLIMATE_CONTROL = {
    diurnal:{
      lowTimeHHMM:'0559',
      highTimeHHMM:'1400',
      riseCurve:2.0,
      fallCurve:1.2
    },
    governor:{
      temperatureMaxDeltaF:3,
      rainMaxStep:1,
      skyMaxStep:1,
      windMaxStep:1,
      currentStrengthMaxDeltaPct:12,
      currentTemperatureMaxDeltaF:3,
      currentDirectionMaxStep:2,
      interpolateWindStrength:true,
      interpolateCurrentStrength:true,
      interpolateCurrentTemperature:true
    },
    activation:{
      skyLeadMinutes:{ min:30, max:90 },
      precipitationDurationMinutes:{ min:45, max:165 },
      eventStartOffsetMinutes:{ min:10, max:45 },
      eventTailBufferMinutes:{ min:10, max:30 }
    }
  };
  var HISTORY_ENTRY_LIMIT = 160;

  // Built-in fallback weather quips. These provide a minimal usable pool when no quip module or mule data is present:
  // one editable default array per region.locale. More specific quips can still be
  // supplied through the quips mule/module using season and weather-specific paths.
  var FALLBACK_WEATHER_QUIPS = {
    'quips.weather.frozenfar.offshore': [
      'Pack ice grinds through dark water and the wind bites through every layer.'
    ],
    'quips.weather.frozenfar.coastal': [
      'Snow crusts the shore, smoke hangs low, and the cold reaches straight through stone.'
    ],
    'quips.weather.frozenfar.inland': [
      'Hard frost grips the road, the pines creak, and every breath comes out white.'
    ],
    'quips.weather.frozenfar.underwater': [
      'Ice-muted water presses in from every side, and every current feels sharper than the last.'
    ],
    'quips.weather.frozenfar.underdark': [
      'Stone sweats in the dark, distant drafts move through the tunnels, and the cold never truly leaves.'
    ],

    'quips.weather.swordcoastnorth.offshore': [
      'Cold gray swells roll under a sharp salt wind and the horizon stays iron-colored.'
    ],
    'quips.weather.swordcoastnorth.coastal': [
      'Wet wind drives in from the sea and the harbor smells of rain, rope, and cold timber.'
    ],
    'quips.weather.swordcoastnorth.inland': [
      'Chill air moves through the high country and the weather turns fast between pine, rock, and road.'
    ],
    'quips.weather.swordcoastnorth.underwater': [
      'The water is dark, cold, and restless, with currents that feel stronger than they look.'
    ],
    'quips.weather.swordcoastnorth.underdark': [
      'Deep passages breathe damp air through old stone, and every echo makes the caverns feel larger.'
    ],

    'quips.weather.swordcoast.offshore': [
      'Sea mist rides the swells, gulls wheel overhead, and the weather never feels settled for long.'
    ],
    'quips.weather.swordcoast.coastal': [
      'Salt air and harbor noise carry on the breeze while clouds gather and break without warning.'
    ],
    'quips.weather.swordcoast.inland': [
      'Rolling fields and trade roads sit under broad skies where rain and wind arrive in steady turns.'
    ],
    'quips.weather.swordcoast.underwater': [
      'Green water shifts around wreck-stone and reef, and the tide carries a constant uneasy pull.'
    ],
    'quips.weather.swordcoast.underdark': [
      'The deep air is still but never dead, carrying mineral damp and the hint of unseen chambers ahead.'
    ],

    'quips.weather.moonshaes.offshore': [
      'Restless green water, fast weather, and hard wind make every sail feel one gust from trouble.'
    ],
    'quips.weather.moonshaes.coastal': [
      'Rain-dark stone and brine-soaked air frame a shore where the sea is never quiet for long.'
    ],
    'quips.weather.moonshaes.inland': [
      'The hills stay damp, the woods hold mist, and the weather feels old and heavy with rain.'
    ],
    'quips.weather.moonshaes.underwater': [
      'Kelp-dark water folds over rock and ruin while the current tugs at everything not anchored fast.'
    ],
    'quips.weather.moonshaes.underdark': [
      'The deep earth holds a wet chill here, with drifting mist and cavern winds that never quite settle.'
    ],

    'quips.weather.landsofintrigue.offshore': [
      'Warm bright water flashes under the sun until a sudden squall sweeps over it.'
    ],
    'quips.weather.landsofintrigue.coastal': [
      'Sea wind carries heat, spice, and dust through ports where sunshine and storms share the same sky.'
    ],
    'quips.weather.landsofintrigue.inland': [
      'Dry heat settles over courtyards and roads until the air shifts and distant thunder promises relief.'
    ],
    'quips.weather.landsofintrigue.underwater': [
      'Warm water lies heavy over the shelf, hazed by silt and bright with sudden shifts in the current.'
    ],
    'quips.weather.landsofintrigue.underdark': [
      'The heat softens in the deep, but the stone still holds a dry pressure broken by rare cool drafts.'
    ]
  };

  // ----------------------------
  // Helpers
  // ----------------------------
  function esc(s){
    return String(s||'').replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[c] || c;
    });
  }
  function lower(s){ return String(s||'').toLowerCase(); }


  function dirToWords(dir){
    dir = String(dir||'').toUpperCase();
    var map = {
      'N':'north','NNE':'north-northeast','NE':'northeast','ENE':'east-northeast',
      'E':'east','ESE':'east-southeast','SE':'southeast','SSE':'south-southeast',
      'S':'south','SSW':'south-southwest','SW':'southwest','WSW':'west-southwest',
      'W':'west','WNW':'west-northwest','NW':'northwest','NNW':'north-northwest'
    };
    return map[dir] || lower(dir);
  }

  function clamp(n,a,b){ n=+n; if(isNaN(n)) n=a; return Math.max(a, Math.min(b,n)); }
  function r1_100(){ return Math.floor(Math.random()*100)+1; }

  function isGM(pid){ try{ return !!playerIsGM(pid); }catch(e){ return false; } }

  function playerName(pid){
    try{ var p=getObj('player',pid); return p ? (p.get('displayname')||'GM') : 'GM'; }catch(e){ return 'GM'; }
  }

  function whisper(pid, html){
    try{
      if(RT.dwt && typeof RT.dwt.whisper==='function'){
        RT.dwt.whisper(pid, html);
        return;
      }
    }catch(e){}
    try{ sendChat('dwt_weather','/w "'+playerName(pid)+'" '+html); }catch(e2){}
  }

  function whisperGM(html){
    try{ sendChat('dwt_weather','/w gm '+html); }catch(e){}
  }

  function whisperGMOnce(key, html){
    var S = ensureStateRoot();
    if(!S.regionWarnings) S.regionWarnings = {};
    if(S.regionWarnings[key]) return;
    S.regionWarnings[key] = true;
    whisperGM(html);
  }

  function ensureMule(){
    try{ if(RT.dwt && typeof RT.dwt.ensureMule==='function'){ return RT.dwt.ensureMule(); } }catch(e){}
    var matches = findObjs({_type:'character', name:MULE_NAME}) || [];
    var ch = null;
    var bestScore = -1;
    for(var i=0;i<matches.length;i++){
      var abilities = findObjs({_type:'ability', _characterid:matches[i].id}) || [];
      var score = abilities.length;
      for(var ai=0;ai<abilities.length;ai++){
        var ability = abilities[ai];
        var name = '';
        try{ name = normalizeAbilityName(ability.get('name') || ''); }catch(e0){}
        var weighted = abilitySortScore(name, ability);
        score += weighted;
        if(name === 'mapmeta') score += weighted;
        else if(name === 'version' || name === 'core') score += Math.max(0, weighted);
      }
      if(score > bestScore){
        bestScore = score;
        ch = matches[i];
      }
    }
    if(!ch){
      ch = createObj('character',{ name:MULE_NAME, inplayerjournals:'', controlledby:'', archived:false });
    }
    return ch;
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
      if(payload.schema === REGION_PROFILE_SCHEMA) score += 200;
      if(payload.weather && typeof payload.weather === 'object' && !Array.isArray(payload.weather)) score += 100;
      if(payload.region) score += 10;
      if(payload.locales) score += 10;
    }
    return score;
  }

  function weatherRootQuality(text){
    var parsed = safeParseJSON(text);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = 0;
    if(parsed.meta && parsed.meta.rootSchema === WEATHER_ROOT_SCHEMA) score += 200;
    if(parsed.settings && (parsed.settings.units === 'imperial' || parsed.settings.units === 'metric')) score += 25;
    if(parsed.current && typeof parsed.current === 'object' && !Array.isArray(parsed.current)) score += 25;
    if(parsed.history && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) score += 25;
    return score;
  }

  function abilitySortScore(name, ability){
    var text = abilityText(ability);
    var key = normalizeAbilityName(name || (ability && ability.get && ability.get('name')) || '');
    var base = abilityActionLength(ability);
    if(key === 'regions') return regionsRootQuality(text) * 1000000 + base;
    if(key === 'weather') return weatherRootQuality(text) * 1000000 + base;
    return base;
  }

  function namedAbilities(character, name){
    if(!character) return [];
    var list = findObjs({_type:'ability', _characterid:character.id, name:name}) || [];
    list.sort(function(a, b){ return abilitySortScore(name, b) - abilitySortScore(name, a); });
    return list;
  }

  function upsertAbility(character, name, action){
    if(!character) return null;
    var abilities = namedAbilities(character, name);
    if(abilities.length){
      for(var i=0;i<abilities.length;i++){
        try{ abilities[i].set('action', String(action||'')); }catch(e){}
      }
      return abilities[0];
    }
    try{
      return createObj('ability',{
        name:name, characterid:character.id, action:String(action||''), istokenaction:false
      });
    }catch(e2){ return null; }
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ab = namedAbilities(character, name)[0];
    try{ return ab ? (ab.get('action')||'') : ''; }catch(e){ return ''; }
  }

  function deepCloneJSON(v){
    return JSON.parse(JSON.stringify(v));
  }

  function ensureStateRoot(){
    if(!state.dwt) state.dwt = {};
    if(!state.dwt.weather) state.dwt.weather = {};
    return state.dwt.weather;
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

  function defaultWeatherMeta(){
    return { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'', tickSchema:WEATHER_TICK_SCHEMA };
  }

  function defaultWeatherSettings(){
    return { schema:'dwt.weather.settings.v1', units:'imperial' };
  }

  function normalizeWeatherRoot(root){
    var changed = false;

    if(!root || typeof root !== 'object' || Array.isArray(root)){
      root = {};
      changed = true;
    }

    if(!root.meta || root.meta.schema !== 'dwt.weather.meta.v1'){
      root.meta = defaultWeatherMeta();
      changed = true;
    }else{
      if(!root.meta.hasOwnProperty('lastTick')){
        root.meta.lastTick = null;
        changed = true;
      }
      if(!root.meta.hasOwnProperty('lastStamp')){
        root.meta.lastStamp = '';
        changed = true;
      }
      if(!root.meta.hasOwnProperty('tickSchema')){
        root.meta.tickSchema = '';
        changed = true;
      }
    }

    if(!root.settings || root.settings.schema !== 'dwt.weather.settings.v1'){
      root.settings = defaultWeatherSettings();
      changed = true;
    }
    if(root.settings.units !== 'imperial' && root.settings.units !== 'metric'){
      root.settings.units = 'imperial';
      changed = true;
    }
    if(root.settings.override){
      delete root.settings.override;
      changed = true;
    }

    if(!root.current || typeof root.current !== 'object' || Array.isArray(root.current)){
      root.current = {};
      changed = true;
    }
    if(!root.history || typeof root.history !== 'object' || Array.isArray(root.history)){
      root.history = {};
      changed = true;
    }

    // Windsock visuals are derived from the live token state, so persisted windsock snapshots are removed.
    if(Object.prototype.hasOwnProperty.call(root, 'windsock')){
      delete root.windsock;
      changed = true;
    }
    if(Object.prototype.hasOwnProperty.call(root, 'events')){
      delete root.events;
      changed = true;
    }

    if(root.meta.version !== VERSION){
      root.meta.version = VERSION;
      changed = true;
    }
    if(root.meta.rootSchema !== WEATHER_ROOT_SCHEMA){
      root.meta.rootSchema = WEATHER_ROOT_SCHEMA;
      root.meta.lastTick = null;
      root.meta.lastStamp = '';
      root.current = {};
      root.history = {};
      changed = true;
    }
    if(root.meta.tickSchema !== WEATHER_TICK_SCHEMA){
      root.meta.tickSchema = WEATHER_TICK_SCHEMA;
      root.meta.lastTick = null;
      root.meta.lastStamp = '';
      root.current = {};
      root.history = {};
      changed = true;
    }

    return { root:root, changed:changed };
  }

  // ----------------------------
  // Single-root weather storage helpers
  // ----------------------------
  function loadWeatherRootDirect(mule){
    var raw = (getAbilityAction(mule, 'weather')||'').trim();
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }

  function saveWeatherRootDirect(mule, root){
    upsertAbility(mule, 'weather', JSON.stringify(root));
  }

  function ensureWeatherRoot(mule){
    var normalized = normalizeWeatherRoot(loadWeatherRootDirect(mule));
    if(normalized.changed) saveWeatherRootDirect(mule, normalized.root);
    return normalized.root;
  }

  function weatherPathGet(root, path){
    var parts = String(path||'').split('.');
    var cur = root;
    for(var i=0;i<parts.length;i++){
      if(!cur || typeof cur !== 'object') return null;
      cur = cur[parts[i]];
    }
    return (cur===undefined) ? null : cur;
  }

  function weatherPathSet(root, path, value){
    var parts = String(path||'').split('.');
    var cur = root;
    for(var i=0;i<parts.length-1;i++){
      var p = parts[i];
      if(!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length-1]] = value;
  }

  function getJSON(mule, logicalPath){
    try{
      var root = ensureWeatherRoot(mule);
      var path = String(logicalPath||'');
      if(path.indexOf('weather.') === 0) path = path.slice(8);
      if(path === 'weather') return deepCloneJSON(root);
      var val = weatherPathGet(root, path);
      return (val===null) ? null : deepCloneJSON(val);
    }catch(e){ return null; }
  }

  function setJSON(mule, logicalPath, obj){
    var root = ensureWeatherRoot(mule);
    var path = String(logicalPath||'');
    if(path.indexOf('weather.') === 0) path = path.slice(8);
    if(!path || path === 'weather'){
      root = (obj && typeof obj === 'object') ? deepCloneJSON(obj) : {};
      saveWeatherRootDirect(mule, normalizeWeatherRoot(root).root);
      return;
    }
    weatherPathSet(root, path, deepCloneJSON(obj));
    saveWeatherRootDirect(mule, normalizeWeatherRoot(root).root);
  }

  function normalizeQuipArray(arr){
    if(!Array.isArray(arr)) return [];
    var out = [];
    for(var i=0;i<arr.length;i++){
      var line = String(arr[i]||'').trim();
      if(line) out.push(line);
    }
    return out;
  }

  function getQuipsArray(path){
    path = String(path||'').trim().toLowerCase();
    if(!path) return [];
    try{
      if(RT.dwt_quips && typeof RT.dwt_quips.getQuips === 'function'){
        var fromModule = RT.dwt_quips.getQuips(path);
        fromModule = normalizeQuipArray(fromModule);
        if(fromModule.length) return fromModule;
      }
    }catch(e){}
    try{
      var mule = ensureMule();
      var rawRoot = (getAbilityAction(mule, 'quips') || '').trim();
      if(rawRoot){
        var parsedRoot = JSON.parse(rawRoot);
        if(parsedRoot && parsedRoot.data && Array.isArray(parsedRoot.data[path])){
          var fromMule = normalizeQuipArray(parsedRoot.data[path]);
          if(fromMule.length) return fromMule;
        }
      }
    }catch(e2){}
    var fallback = normalizeQuipArray(FALLBACK_WEATHER_QUIPS[path]);
    if(fallback.length) return fallback;
    var raw = getJSON(ensureMule(), path);
    return normalizeQuipArray(raw);
  }

  function canonicalKey(s){
    return lower(s).replace(/[^a-z]/g,'');
  }

  function titleCaseWords(s){
    return String(s||'').replace(/\b([a-z])/g, function(m){ return m.toUpperCase(); });
  }

  function now(){
    try{ if(state && state.dwt && state.dwt.now){ return state.dwt.now; } }catch(e){}
    return { year:1492, month:1, day:1, hour:6, minute:0, timeofday:'early morning', festival:'' };
  }

  function timeofdayIndex(tf){
    tf = lower(String(tf||'')).replace(/\s+/g,' ').trim();
    if(tf==='early predawn') return 0;
    if(tf==='late predawn') return 1;
    if(tf==='early morning') return 2;
    if(tf==='late morning') return 3;
    if(tf==='early afternoon') return 4;
    if(tf==='late afternoon') return 5;
    if(tf==='early evening') return 6;
    if(tf==='late evening') return 7;
    return 2;
  }

  function timeofdayKey(tf){
    return TIMEOFDAY_SEGMENT_KEYS[timeofdayIndex(tf)] || 'earlymorning';
  }

  function pad2(n){
    n = Math.max(0, Math.round(+n||0));
    return (n < 10 ? '0' : '') + String(n);
  }

  function normalizeHHMM(value, fallback){
    var text = String(value == null ? '' : value).replace(/[^0-9]/g, '');
    if(text.length === 3) text = '0' + text;
    if(text.length !== 4){
      text = String(fallback == null ? '0000' : fallback).replace(/[^0-9]/g, '');
      if(text.length === 3) text = '0' + text;
      if(text.length !== 4) text = '0000';
    }
    var hh = clamp(Math.floor((+text.slice(0, 2) || 0)), 0, 23);
    var mm = clamp(Math.floor((+text.slice(2) || 0)), 0, 59);
    return pad2(hh) + pad2(mm);
  }

  function hhmmToMinutes(value, fallback){
    var hhmm = normalizeHHMM(value, fallback);
    return ((+hhmm.slice(0, 2) || 0) * 60) + (+hhmm.slice(2) || 0);
  }

  function minutesToHHMM(value){
    var minutes = Math.round(+value||0) % 1440;
    if(minutes < 0) minutes += 1440;
    return pad2(Math.floor(minutes / 60)) + pad2(minutes % 60);
  }

  function clockMinutesFromNow(nw){
    nw = nw || now();
    return clamp((Math.round(+((nw && nw.hour) || 0)) * 60) + Math.round(+((nw && nw.minute) || 0)), 0, 1439);
  }

  function bandWindowForNow(nw){
    nw = nw || now();
    var idx = timeofdayIndex((nw && nw.timeofday) || '');
    var startMinutes = idx * 180;
    var endMinutes = Math.min(1439, startMinutes + 179);
    return {
      startMinutes:startMinutes,
      endMinutes:endMinutes,
      startHHMM:minutesToHHMM(startMinutes),
      endHHMM:minutesToHHMM(endMinutes)
    };
  }

  function copyNowAtHHMM(nw, hhmm){
    nw = deepCloneJSON(nw || now());
    hhmm = normalizeHHMM(hhmm, '0000');
    nw.hour = +hhmm.slice(0, 2) || 0;
    nw.minute = +hhmm.slice(2) || 0;
    return nw;
  }

  function ratioBetween(currentMinutes, startMinutes, endMinutes){
    currentMinutes = clamp(Math.round(+currentMinutes||0), 0, 1439);
    startMinutes = clamp(Math.round(+startMinutes||0), 0, 1439);
    endMinutes = clamp(Math.round(+endMinutes||0), 0, 1439);
    if(endMinutes <= startMinutes) return currentMinutes >= endMinutes ? 1 : 0;
    if(currentMinutes <= startMinutes) return 0;
    if(currentMinutes >= endMinutes) return 1;
    return (currentMinutes - startMinutes) / Math.max(1, endMinutes - startMinutes);
  }

  function lerpNumber(a, b, t){
    a = +a || 0;
    b = +b || 0;
    t = clamp(+t || 0, 0, 1);
    return a + ((b - a) * t);
  }

  function wrappedDistance(startMinutes, endMinutes){
    startMinutes = clamp(Math.round(+startMinutes||0), 0, 1439);
    endMinutes = clamp(Math.round(+endMinutes||0), 0, 1439);
    return (endMinutes - startMinutes + 1440) % 1440;
  }

  function randInt(minValue, maxValue){
    minValue = Math.round(+minValue||0);
    maxValue = Math.round(+maxValue||0);
    if(maxValue < minValue){
      var swap = minValue;
      minValue = maxValue;
      maxValue = swap;
    }
    return minValue + Math.floor(Math.random() * (maxValue - minValue + 1));
  }

  function normalizeWaterProfile(raw, fallback){
    var base = (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) ? fallback : {};
    var profile = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var sampleModeKey = canonicalKey(profile.sampleMode || base.sampleMode || 'fractionaldepth');
    var sampleMode = (sampleModeKey === 'fixedfathoms') ? 'fixed_fathoms' : 'fractional_depth';
    var out = {
      bodyType: canonicalKey(profile.bodyType || base.bodyType || 'water') || 'water',
      totalDepthFeet: Math.max(0.5, Math.round(+((profile.totalDepthFeet != null) ? profile.totalDepthFeet : base.totalDepthFeet || 60))),
      sampleMode: sampleMode,
      sampleFractions:{
        shallow: +((((profile.sampleFractions||{}).shallow != null) ? profile.sampleFractions.shallow : ((base.sampleFractions||{}).shallow != null ? base.sampleFractions.shallow : DEFAULT_WATER_SAMPLE_FRACTIONS.shallow))),
        mid: +((((profile.sampleFractions||{}).mid != null) ? profile.sampleFractions.mid : ((base.sampleFractions||{}).mid != null ? base.sampleFractions.mid : DEFAULT_WATER_SAMPLE_FRACTIONS.mid))),
        deep: +((((profile.sampleFractions||{}).deep != null) ? profile.sampleFractions.deep : ((base.sampleFractions||{}).deep != null ? base.sampleFractions.deep : DEFAULT_WATER_SAMPLE_FRACTIONS.deep)))
      },
      sampleDepthsFathoms:{
        shallow: Math.max(1, Math.round(+((((profile.sampleDepthsFathoms||{}).shallow != null) ? profile.sampleDepthsFathoms.shallow : ((base.sampleDepthsFathoms||{}).shallow != null ? base.sampleDepthsFathoms.shallow : DEFAULT_WATER_SAMPLE_FATHOMS.shallow))))),
        mid: Math.max(1, Math.round(+((((profile.sampleDepthsFathoms||{}).mid != null) ? profile.sampleDepthsFathoms.mid : ((base.sampleDepthsFathoms||{}).mid != null ? base.sampleDepthsFathoms.mid : DEFAULT_WATER_SAMPLE_FATHOMS.mid))))),
        deep: Math.max(1, Math.round(+((((profile.sampleDepthsFathoms||{}).deep != null) ? profile.sampleDepthsFathoms.deep : ((base.sampleDepthsFathoms||{}).deep != null ? base.sampleDepthsFathoms.deep : DEFAULT_WATER_SAMPLE_FATHOMS.deep)))))
      }
    };

    out.sampleFractions.shallow = clamp(out.sampleFractions.shallow, 0.05, 0.95);
    out.sampleFractions.mid = clamp(out.sampleFractions.mid, out.sampleFractions.shallow, 0.95);
    out.sampleFractions.deep = clamp(out.sampleFractions.deep, out.sampleFractions.mid, 0.98);
    out.sampleDepthsFathoms.mid = Math.max(out.sampleDepthsFathoms.shallow, out.sampleDepthsFathoms.mid);
    out.sampleDepthsFathoms.deep = Math.max(out.sampleDepthsFathoms.mid, out.sampleDepthsFathoms.deep);

    if(out.sampleMode === 'fractional_depth' && out.totalDepthFeet < 3){
      out.sampleFractions.shallow = 0.6;
      out.sampleFractions.mid = 0.6;
      out.sampleFractions.deep = 0.6;
    }
    return out;
  }

  function currentSampleDepthFeet(profile, sampleKey){
    profile = normalizeWaterProfile(profile || {});
    sampleKey = canonicalKey(sampleKey);
    if(sampleKey === 'surface') return 0;
    if(profile.sampleMode === 'fixed_fathoms'){
      var fathoms = +((profile.sampleDepthsFathoms || {})[sampleKey] || 0);
      return Math.min(profile.totalDepthFeet, Math.max(0, Math.round(fathoms * 6)));
    }
    var fraction = +((profile.sampleFractions || {})[sampleKey] || 0);
    return Math.min(profile.totalDepthFeet, Math.max(0, Math.round(profile.totalDepthFeet * fraction)));
  }

  function currentSampleDepthFraction(profile, sampleKey){
    profile = normalizeWaterProfile(profile || {});
    sampleKey = canonicalKey(sampleKey);
    if(sampleKey === 'surface') return 0;
    if(profile.sampleMode === 'fixed_fathoms'){
      return clamp(currentSampleDepthFeet(profile, sampleKey) / Math.max(1, profile.totalDepthFeet), 0, 1);
    }
    return clamp(+((profile.sampleFractions || {})[sampleKey] || 0), 0, 1);
  }

  function weightedAverageNumeric(weights, fallback){
    weights = Array.isArray(weights) ? weights : [];
    var totalWeight = 0;
    var totalValue = 0;
    for(var i=0;i<weights.length;i++){
      var row = weights[i] || {};
      var value = +row.value;
      var weight = +row.weight;
      if(!isFinite(value) || !isFinite(weight) || weight <= 0) continue;
      totalWeight += weight;
      totalValue += (value * weight);
    }
    return totalWeight ? (totalValue / totalWeight) : (+fallback || 0);
  }

  function averagePeriodTemperatureF(periods, fallback){
    periods = (periods && typeof periods === 'object' && !Array.isArray(periods)) ? periods : {};
    var total = 0;
    var count = 0;
    for(var i=0;i<PERIOD_ORDER.length;i++){
      var block = periods[PERIOD_ORDER[i]] || {};
      var temp = block.temperature || {};
      if(temp.avgF == null || !isFinite(+temp.avgF)) continue;
      total += +temp.avgF;
      count++;
    }
    return count ? Math.round(total / count) : Math.round(+fallback || 55);
  }

  function interpolateCompass16(fromDir, toDir, progress){
    progress = clamp(+progress || 0, 0, 1);
    var fromIdx = _dirToIdx16(fromDir || 'N');
    var toIdx = _dirToIdx16(toDir || 'N');
    var diff = (toIdx - fromIdx + 16) % 16;
    if(diff > 8) diff -= 16;
    return COMPASS_16[(fromIdx + Math.round(diff * progress) + 16) % 16] || 'N';
  }

  function waterProfileForLocation(rl, pattern){
    if(pattern && pattern.measurementProfile){
      return normalizeWaterProfile(pattern.measurementProfile);
    }
    if(rl && rl.localeDef && rl.localeDef.waterProfile){
      return normalizeWaterProfile(rl.localeDef.waterProfile);
    }
    return normalizeWaterProfile(DEFAULT_WATER_PROFILES.underwater);
  }

  function locationDepthMetersForWater(rl, pattern){
    var depthMeters = Math.round(+((rl && rl.depthMeters) || 0));
    if(depthMeters <= 0){
      depthMeters = Math.round((+((pattern || {}).depthFeet) || 0) * 0.3048);
    }
    return Math.max(0, depthMeters);
  }

  function currentReadingAtLocationDepth(pattern, rl){
    pattern = pattern ? normalizeSeasonalCurrent(pattern, pattern.measurementProfile || {}) : null;
    if(!pattern) return null;
    var profile = waterProfileForLocation(rl, pattern);
    var targetDepthMeters = locationDepthMetersForWater(rl, pattern);
    var totalDepthMeters = Math.max(1, Math.round((+profile.totalDepthFeet || 0) * 0.3048));
    var samples = [];
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var reading = pattern.readings[sampleKey];
      if(!reading) continue;
      samples.push({
        sampleKey:sampleKey,
        depthMeters:Math.round(+reading.depthMeters || 0),
        direction:normalizeDir16(reading.direction || pattern.direction || 'N'),
        temperatureF:Math.round((reading.temperatureF != null) ? +reading.temperatureF : +pattern.temperatureF || 50),
        strengthPct:clamp(Math.round((reading.strengthPct != null) ? +reading.strengthPct : +pattern.strengthPct || 0), 0, 100)
      });
    }
    if(!samples.length){
      return {
        sampleKey:'mid',
        depthMeters:targetDepthMeters,
        depthFeet:Math.round(targetDepthMeters / 0.3048),
        depthFraction:clamp(targetDepthMeters / totalDepthMeters, 0, 1),
        direction:normalizeDir16(pattern.direction || 'N'),
        temperatureF:Math.round(+pattern.temperatureF || 50),
        strengthPct:clamp(Math.round(+pattern.strengthPct || 0), 0, 100)
      };
    }
    samples.sort(function(a, b){ return a.depthMeters - b.depthMeters; });
    if(targetDepthMeters <= samples[0].depthMeters){
      return {
        sampleKey:samples[0].sampleKey,
        depthMeters:targetDepthMeters,
        depthFeet:Math.round(targetDepthMeters / 0.3048),
        depthFraction:clamp(targetDepthMeters / totalDepthMeters, 0, 1),
        direction:samples[0].direction,
        temperatureF:samples[0].temperatureF,
        strengthPct:samples[0].strengthPct
      };
    }
    for(var si=1;si<samples.length;si++){
      var prev = samples[si - 1];
      var next = samples[si];
      if(targetDepthMeters > next.depthMeters) continue;
      var span = Math.max(1, next.depthMeters - prev.depthMeters);
      var ratio = clamp((targetDepthMeters - prev.depthMeters) / span, 0, 1);
      return {
        sampleKey:next.sampleKey,
        depthMeters:targetDepthMeters,
        depthFeet:Math.round(targetDepthMeters / 0.3048),
        depthFraction:clamp(targetDepthMeters / totalDepthMeters, 0, 1),
        direction:interpolateCompass16(prev.direction, next.direction, ratio),
        temperatureF:Math.round(lerpNumber(prev.temperatureF, next.temperatureF, ratio)),
        strengthPct:clamp(Math.round(lerpNumber(prev.strengthPct, next.strengthPct, ratio)), 0, 100)
      };
    }
    var deepest = samples[samples.length - 1];
    return {
      sampleKey:deepest.sampleKey,
      depthMeters:targetDepthMeters,
      depthFeet:Math.round(targetDepthMeters / 0.3048),
      depthFraction:clamp(targetDepthMeters / totalDepthMeters, 0, 1),
      direction:deepest.direction,
      temperatureF:deepest.temperatureF,
      strengthPct:deepest.strengthPct
    };
  }

  function seasonFromMonth(m){
    m = clamp(+m||1,1,12);
    if(m===12 || m===1 || m===2) return 'winter';
    if(m>=3 && m<=5) return 'spring';
    if(m>=6 && m<=8) return 'summer';
    return 'autumn';
  }

  function isLeapHarptosYear(y){
    return ((+y||0) % 4) === 0;
  }

  function buildHarptosYearDays(year){
    year = Math.max(HARPTOS_BASE_YEAR, +year || HARPTOS_BASE_YEAR);
    if(HARPTOS_YEAR_DAY_CACHE[year]) return HARPTOS_YEAR_DAY_CACHE[year];
    var seq = [];
    for(var month=1; month<=12; month++){
      for(var day=1; day<=30; day++){
        seq.push({ month:month, day:day, festival:'' });
      }
      for(var i=0; i<HARPTOS_BETWEEN_FESTIVALS.length; i++){
        var fest = HARPTOS_BETWEEN_FESTIVALS[i];
        if(fest.afterMonth !== month) continue;
        if(fest.leap && !isLeapHarptosYear(year)) continue;
        seq.push({ month:0, day:0, festival:fest.key });
      }
    }
    HARPTOS_YEAR_DAY_CACHE[year] = seq;
    return seq;
  }

  function findHarptosDayIndex(year, nw){
    year = Math.max(HARPTOS_BASE_YEAR, +year || HARPTOS_BASE_YEAR);
    nw = nw || now();
    var seq = buildHarptosYearDays(year);
    var festivalKey = canonicalPeriodKey((nw && nw.festival) || '');
    if(festivalKey){
      for(var fi=0; fi<seq.length; fi++){
        if(seq[fi].festival === festivalKey) return fi;
      }
    }
    var month = clamp(+((nw && nw.month) || 1), 1, 12);
    var day = clamp(+((nw && nw.day) || 1), 1, 30);
    for(var di=0; di<seq.length; di++){
      if(seq[di].festival) continue;
      if(seq[di].month === month && seq[di].day === day) return di;
    }
    return 0;
  }

  function daysBeforeHarptosYear(year){
    year = Math.max(HARPTOS_BASE_YEAR, +year || HARPTOS_BASE_YEAR);
    if(year <= HARPTOS_BASE_YEAR) return 0;
    var normalYears = year - HARPTOS_BASE_YEAR;
    var leapYears = Math.floor((year - 1) / 4) - Math.floor((HARPTOS_BASE_YEAR - 1) / 4);
    return (normalYears * 365) + leapYears;
  }

  function harptosYearAndDayFromAbsoluteDay(dayIndex){
    var remaining = Math.max(0, +dayIndex || 0);
    var year = HARPTOS_BASE_YEAR;
    while(true){
      var yearLen = isLeapHarptosYear(year) ? 366 : 365;
      if(remaining < yearLen){
        return { year:year, dayIndex:remaining };
      }
      remaining -= yearLen;
      year++;
    }
  }

  function pad2(n){ n=String(n||'0'); return n.length<2?('0'+n):n; }
  function stamp(nw){
    nw = nw || now();
    return String(nw.year||0)+'-'+pad2(nw.month||0)+'-'+pad2(nw.day||0)+'-'+String(nw.timeofday||'').replace(/\s+/g,'');
  }
  function tick(nw){
    nw = nw || now();
    var y = Math.max(HARPTOS_BASE_YEAR, +nw.year || HARPTOS_BASE_YEAR);
    var absoluteDay = daysBeforeHarptosYear(y) + findHarptosDayIndex(y, nw);
    var tf = timeofdayIndex(nw.timeofday);
    return (absoluteDay * 8) + tf;
  }

  function nowFromTick(t){
    t = (+t||0);
    if(t < 0) t = 0;
    var tf = (t % 8 + 8) % 8;
    var absoluteDay = Math.floor(t / 8);
    var yd = harptosYearAndDayFromAbsoluteDay(absoluteDay);
    var seq = buildHarptosYearDays(yd.year);
    var dayTok = seq[yd.dayIndex] || { month:1, day:1, festival:'' };
    var timeofday = TIMEOFDAY_SEGMENTS[tf] || 'early morning';
    var hour =
      (tf===0)?0  :
      (tf===1)?3  :
      (tf===2)?6  :
      (tf===3)?9  :
      (tf===4)?12 :
      (tf===5)?15 :
      (tf===6)?18 : 21;
    return {
      year:yd.year,
      month:dayTok.festival ? 0 : dayTok.month,
      day:dayTok.festival ? 0 : dayTok.day,
      hour:hour,
      minute:0,
      timeofday:timeofday,
      festival:dayTok.festival || ''
    };
  }

  // ----------------------------
  // Weather root paths (canonical logical paths beneath the single "weather" mule root)
  // ----------------------------
  function AB_SETTINGS(){ return 'weather.settings'; }
  function AB_CUR(region, locale){ return 'weather.current.'+region+'.'+locale; }
  function AB_HIST(region, locale){ return 'weather.history.'+region+'.'+locale; }

  function ensureSettings(mule){
    var s = getJSON(mule, AB_SETTINGS());
    var changed = false;
    if(!s || s.schema!=='dwt.weather.settings.v1'){
      s = defaultWeatherSettings();
      changed = true;
    }
    if(s.units !== 'imperial' && s.units !== 'metric'){
      s.units = 'imperial';
      changed = true;
    }
    if(s.override){
      delete s.override;
      changed = true;
    }
    if(changed) setJSON(mule, AB_SETTINGS(), s);
    return s;
  }

  // ----------------------------
  // Region catalog loading
  // ----------------------------
  function defaultRegionsRoot(){
    return { schema:'dwt.regions.root.v1', regions:{} };
  }

  function normalizeRegionsRoot(root){
    if(!root || typeof root !== 'object' || Array.isArray(root)) root = {};
    if(root.schema !== 'dwt.regions.root.v1') root.schema = 'dwt.regions.root.v1';
    if(!root.regions || typeof root.regions !== 'object' || Array.isArray(root.regions)) root.regions = {};
    return root;
  }

  function loadRegionsRoot(mule){
    var raw = (getAbilityAction(mule, 'regions')||'').trim();
    if(!raw) return defaultRegionsRoot();
    try{
      return normalizeRegionsRoot(JSON.parse(raw));
    }catch(e){
      return defaultRegionsRoot();
    }
  }

  function regionPayloads(root){
    return (root && root.regions && typeof root.regions === 'object' && !Array.isArray(root.regions)) ? root.regions : {};
  }

  function saveRegionsRoot(mule, root){
    upsertAbility(mule, 'regions', JSON.stringify(normalizeRegionsRoot(root)));
  }

  function findRegionPayload(root, region){
    region = canonicalKey(region);
    if(!region) return null;

    var regions = regionPayloads(root);
    if(regions[region]) return regions[region];

    var keys = Object.keys(regions);
    for(var i=0;i<keys.length;i++){
      var payload = regions[keys[i]];
      var candidate = canonicalKey((payload && payload.region) || keys[i]);
      if(candidate === region) return payload;
    }
    return null;
  }

  function canonicalPeriodKey(v){
    var key = canonicalKey(v);
    return PERIOD_INFO[key] ? key : '';
  }

  function periodInfo(periodKey){
    periodKey = canonicalPeriodKey(periodKey);
    return PERIOD_INFO[periodKey] || null;
  }

  function periodKeyFromNow(nw){
    nw = nw || now();
    if(nw && nw.festival){
      var festivalKey = canonicalPeriodKey(nw.festival);
      if(festivalKey) return festivalKey;
    }
    return MONTH_TO_PERIOD[clamp(+((nw&&nw.month)||1), 1, 12)] || 'hammer';
  }

  function normalizeWeightEntries(entries, normalizer){
    if(!Array.isArray(entries)) return [];
    var out = [];
    for(var i=0;i<entries.length;i++){
      var row = entries[i] || {};
      var value = normalizer ? normalizer(row.value) : row.value;
      var weight = Math.round(+row.weight||0);
      if(value === null || value === undefined || value === '' || !weight || weight < 0) continue;
      out.push({ value:value, weight:weight });
    }
    return out;
  }

  function normalizeDirectionWeights(entries){
    return normalizeWeightEntries(entries, function(v){
      var dir = normalizeDir16(v);
      return dir || null;
    });
  }

  function normalizeStrengthWeights(entries){
    return normalizeWeightEntries(entries, function(v){
      var n = Math.round(+v||0);
      if(!isFinite(n)) return null;
      return clamp(n, 0, 100);
    });
  }

  function normalizeEventWeights(entries){
    return normalizeWeightEntries(entries, function(v){
      var key = canonicalKey(v);
      return key || null;
    });
  }

  function normalizeIntensityWeights(weights, chancePct){
    weights = weights || {};
    var out = {
      light: Math.max(0, Math.round(+weights.light||0)),
      moderate: Math.max(0, Math.round(+weights.moderate||0)),
      heavy: Math.max(0, Math.round(+weights.heavy||0))
    };
    if(out.light || out.moderate || out.heavy) return out;
    chancePct = clamp(+chancePct||0, 0, 100);
    if(chancePct <= 20) return { light:70, moderate:25, heavy:5 };
    if(chancePct <= 45) return { light:55, moderate:30, heavy:15 };
    if(chancePct <= 65) return { light:35, moderate:40, heavy:25 };
    return { light:20, moderate:40, heavy:40 };
  }

  function normalizeSeverityWeights(weights){
    weights = weights || {};
    var out = {
      light: Math.max(0, Math.round(+weights.light||0)),
      moderate: Math.max(0, Math.round(+weights.moderate||0)),
      heavy: Math.max(0, Math.round(+weights.heavy||0)),
      severe: Math.max(0, Math.round(+weights.severe||0))
    };
    if(out.light || out.moderate || out.heavy || out.severe) return out;
    return { light:50, moderate:30, heavy:15, severe:5 };
  }

  function normalizeDriftConfig(drift){
    drift = drift || {};
    return {
      temperature: clamp(Math.round(+drift.temperature||1), 1, 3),
      precipitation: clamp(Math.round(+drift.precipitation||1), 1, 3),
      skies: clamp(Math.round(+drift.skies||1), 1, 3),
      wind: clamp(Math.round(+drift.wind||1), 1, 3),
      directionChangePct: clamp(Math.round(+drift.directionChangePct||25), 5, 100),
      timeofdaySegments: normalizeTimeofdayDriftConfig(drift.timeofdaySegments)
    };
  }

  function normalizeTimeofdayDriftEntry(segmentKey, raw){
    var base = DEFAULT_TIMEOFDAY_SEGMENT_DRIFT[segmentKey] || DEFAULT_TIMEOFDAY_SEGMENT_DRIFT.earlymorning;
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    return {
      temperatureSwingPct: clamp(Math.round((raw.temperatureSwingPct != null) ? +raw.temperatureSwingPct : base.temperatureSwingPct), -100, 100),
      temperatureDelta: clamp(Math.round((raw.temperatureDelta != null) ? +raw.temperatureDelta : base.temperatureDelta), -2, 2),
      precipitationDelta: clamp(Math.round((raw.precipitationDelta != null) ? +raw.precipitationDelta : base.precipitationDelta), -2, 2),
      skiesDelta: clamp(Math.round((raw.skiesDelta != null) ? +raw.skiesDelta : base.skiesDelta), -2, 2),
      windDelta: clamp(Math.round((raw.windDelta != null) ? +raw.windDelta : base.windDelta), -2, 2),
      windStrengthDeltaPct: clamp(Math.round((raw.windStrengthDeltaPct != null) ? +raw.windStrengthDeltaPct : base.windStrengthDeltaPct), -40, 40),
      directionChangePct: clamp(Math.round((raw.directionChangePct != null) ? +raw.directionChangePct : base.directionChangePct), 0, 100)
    };
  }

  function normalizeTimeofdayDriftConfig(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var out = {};
    for(var i=0;i<TIMEOFDAY_SEGMENT_KEYS.length;i++){
      var key = TIMEOFDAY_SEGMENT_KEYS[i];
      out[key] = normalizeTimeofdayDriftEntry(key, raw[key]);
    }
    return out;
  }

  function effectiveTimeofdayDrift(ctx, nw){
    nw = nw || now();
    var key = timeofdayKey((nw && nw.timeofday) || '');
    var drift = normalizeDriftConfig((ctx && ctx.drift) || {});
    var segment = normalizeTimeofdayDriftEntry(key, (drift.timeofdaySegments || {})[key]);
    return {
      key:key,
      label:TIMEOFDAY_SEGMENTS[timeofdayIndex((nw && nw.timeofday) || '')] || 'early morning',
      temperature: clamp(drift.temperature + segment.temperatureDelta, 1, 3),
      precipitation: clamp(drift.precipitation + segment.precipitationDelta, 1, 3),
      skies: clamp(drift.skies + segment.skiesDelta, 1, 3),
      wind: clamp(drift.wind + segment.windDelta, 1, 3),
      directionChangePct: segment.directionChangePct,
      temperatureSwingPct: segment.temperatureSwingPct,
      windStrengthDeltaPct: segment.windStrengthDeltaPct,
      raw:segment
    };
  }

  function normalizeMinuteRange(raw, fallback){
    fallback = fallback || { min:0, max:0 };
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var minValue = Math.max(0, Math.round((raw.min != null) ? +raw.min : +fallback.min || 0));
    var maxValue = Math.max(minValue, Math.round((raw.max != null) ? +raw.max : +fallback.max || minValue));
    return { min:minValue, max:maxValue };
  }

  function normalizeDiurnalConfig(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var fallback = DEFAULT_CLIMATE_CONTROL.diurnal;
    return {
      lowTimeHHMM: normalizeHHMM(raw.lowTimeHHMM, fallback.lowTimeHHMM),
      highTimeHHMM: normalizeHHMM(raw.highTimeHHMM, fallback.highTimeHHMM),
      riseCurve: clamp(+raw.riseCurve || +fallback.riseCurve, 0.25, 4),
      fallCurve: clamp(+raw.fallCurve || +fallback.fallCurve, 0.25, 4)
    };
  }

  function normalizeGovernorConfig(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var fallback = DEFAULT_CLIMATE_CONTROL.governor;
    return {
      temperatureMaxDeltaF: clamp(Math.round((raw.temperatureMaxDeltaF != null) ? +raw.temperatureMaxDeltaF : +fallback.temperatureMaxDeltaF), 1, 12),
      rainMaxStep: clamp(Math.round((raw.rainMaxStep != null) ? +raw.rainMaxStep : +fallback.rainMaxStep), 1, 3),
      skyMaxStep: clamp(Math.round((raw.skyMaxStep != null) ? +raw.skyMaxStep : +fallback.skyMaxStep), 1, 4),
      windMaxStep: clamp(Math.round((raw.windMaxStep != null) ? +raw.windMaxStep : +fallback.windMaxStep), 1, 3),
      currentStrengthMaxDeltaPct: clamp(Math.round((raw.currentStrengthMaxDeltaPct != null) ? +raw.currentStrengthMaxDeltaPct : +fallback.currentStrengthMaxDeltaPct), 1, 50),
      currentTemperatureMaxDeltaF: clamp(Math.round((raw.currentTemperatureMaxDeltaF != null) ? +raw.currentTemperatureMaxDeltaF : +fallback.currentTemperatureMaxDeltaF), 1, 20),
      currentDirectionMaxStep: clamp(Math.round((raw.currentDirectionMaxStep != null) ? +raw.currentDirectionMaxStep : +fallback.currentDirectionMaxStep), 1, 8),
      interpolateWindStrength: (raw.interpolateWindStrength != null) ? !!raw.interpolateWindStrength : !!fallback.interpolateWindStrength,
      interpolateCurrentStrength: (raw.interpolateCurrentStrength != null) ? !!raw.interpolateCurrentStrength : !!fallback.interpolateCurrentStrength,
      interpolateCurrentTemperature: (raw.interpolateCurrentTemperature != null) ? !!raw.interpolateCurrentTemperature : !!fallback.interpolateCurrentTemperature
    };
  }

  function normalizeActivationConfig(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var fallback = DEFAULT_CLIMATE_CONTROL.activation;
    return {
      skyLeadMinutes: normalizeMinuteRange(raw.skyLeadMinutes, fallback.skyLeadMinutes),
      precipitationDurationMinutes: normalizeMinuteRange(raw.precipitationDurationMinutes, fallback.precipitationDurationMinutes),
      eventStartOffsetMinutes: normalizeMinuteRange(raw.eventStartOffsetMinutes, fallback.eventStartOffsetMinutes),
      eventTailBufferMinutes: normalizeMinuteRange(raw.eventTailBufferMinutes, fallback.eventTailBufferMinutes)
    };
  }

  function normalizeClimateControl(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    return {
      diurnal: normalizeDiurnalConfig(raw.diurnal),
      governor: normalizeGovernorConfig(raw.governor),
      activation: normalizeActivationConfig(raw.activation)
    };
  }

  function mergeClimateControl(base, override){
    base = normalizeClimateControl(base);
    override = (override && typeof override === 'object' && !Array.isArray(override)) ? override : {};
    return normalizeClimateControl({
      diurnal:Object.assign({}, base.diurnal, override.diurnal || {}),
      governor:Object.assign({}, base.governor, override.governor || {}),
      activation:Object.assign({}, base.activation, override.activation || {})
    });
  }

  function mergeNumber(baseValue, deltaValue, explicitValue){
    if(typeof explicitValue === 'number' && isFinite(explicitValue)) return explicitValue;
    if(typeof deltaValue === 'number' && isFinite(deltaValue)) return baseValue + deltaValue;
    return baseValue;
  }

  function normalizeLocaleDefinition(localeKey, rawDef){
    var base = deepCloneJSON(DEFAULT_LOCALE_DEFINITIONS[localeKey] || {});
    var def = rawDef && typeof rawDef === 'object' && !Array.isArray(rawDef) ? rawDef : {};
    var out = {};
    Object.keys(base).forEach(function(k){ out[k] = base[k]; });
    Object.keys(def).forEach(function(k){
      if(k === 'periods' || k === 'manualTables') return;
      out[k] = def[k];
    });
    out.key = canonicalKey(localeKey || out.key);
    out.label = String(out.label || localeKey || '').trim();
    out.token = String(out.token || out.label || localeKey || '').trim();
    out.environment = canonicalKey(out.environment || 'surface');
    out.biome = String(out.biome || '').trim().toLowerCase() || 'plains';
    out.climateMode = canonicalKey(out.climateMode || 'offset') || 'offset';
    out.inherits = canonicalKey(out.inherits || 'region') || 'region';
    out.useSeasonalCurrent = !!out.useSeasonalCurrent;
    out.includeFathoms = !!out.includeFathoms;
    out.waterProfile = out.useSeasonalCurrent
      ? normalizeWaterProfile(out.waterProfile || def.waterProfile || base.waterProfile || {})
      : ((out.waterProfile && typeof out.waterProfile === 'object' && !Array.isArray(out.waterProfile))
        ? normalizeWaterProfile(out.waterProfile)
        : null);
    out.climateControl = normalizeClimateControl(out.climateControl || def.climateControl || base.climateControl || DEFAULT_CLIMATE_CONTROL);
    out.periods = (def.periods && typeof def.periods === 'object' && !Array.isArray(def.periods)) ? def.periods : {};
    out.manualTables = (def.manualTables && typeof def.manualTables === 'object' && !Array.isArray(def.manualTables)) ? def.manualTables : {};
    return out;
  }

  function regionLocaleDefinitions(payload){
    var out = {};
    var rawDefs = (payload && payload.localeDefinitions && typeof payload.localeDefinitions === 'object' && !Array.isArray(payload.localeDefinitions))
      ? payload.localeDefinitions
      : {};
    var locales = Array.isArray(payload && payload.locales) ? payload.locales : [];
    for(var i=0;i<locales.length;i++){
      var localeKey = canonicalKey(locales[i]);
      if(!localeKey) continue;
      out[localeKey] = normalizeLocaleDefinition(localeKey, rawDefs[localeKey]);
    }
    return out;
  }

  function localeKeysForProfile(payload){
    var out = [];
    var seen = {};
    var defs = regionLocaleDefinitions(payload);
    var locales = Array.isArray(payload && payload.locales) ? payload.locales : Object.keys(defs);
    for(var i=0;i<locales.length;i++){
      var localeKey = canonicalKey(locales[i]);
      if(!localeKey || seen[localeKey]) continue;
      seen[localeKey] = true;
      out.push(localeKey);
    }
    return out;
  }

  function findLocaleDefinition(payload, localeKey){
    localeKey = canonicalKey(localeKey);
    if(!localeKey) return null;
    return regionLocaleDefinitions(payload)[localeKey] || null;
  }

  function findLocaleByKey(payload, localeKey){
    localeKey = canonicalKey(localeKey);
    if(!localeKey) return null;
    var defs = regionLocaleDefinitions(payload);
    return defs[localeKey] || null;
  }

  function availableCriticalEventKeys(payload){
    var out = {};
    Object.keys(BUILTIN_CRITICAL_EVENTS).forEach(function(k){ out[canonicalKey(k)] = true; });
    var custom = (((payload||{}).weather||{}).customCriticalEvents || {});
    Object.keys(custom || {}).forEach(function(k){ out[canonicalKey(k)] = true; });
    return out;
  }

  function appendWeightIssues(weights, label, issues, kind){
    if(!Array.isArray(weights) || !weights.length){
      issues.push('Region "'+label+'" is missing '+kind+' weights.');
      return;
    }
    var total = 0;
    for(var i=0;i<weights.length;i++){
      var row = weights[i] || {};
      if(!row.hasOwnProperty('value')){
        issues.push('Region "'+label+'" contains a '+kind+' weight without a value.');
        return;
      }
      if(!(row.weight > 0)){
        issues.push('Region "'+label+'" contains a '+kind+' weight that is not positive.');
        return;
      }
      total += +row.weight || 0;
    }
    if(total <= 0){
      issues.push('Region "'+label+'" does not have any usable '+kind+' weight.');
    }
  }

  function appendTemperatureIssues(temp, label, issues){
    if(!temp || typeof temp !== 'object' || Array.isArray(temp)){
      issues.push('Region "'+label+'" is missing temperature data.');
      return;
    }
    if(typeof temp.avgF !== 'number' || typeof temp.lowF !== 'number' || typeof temp.highF !== 'number'){
      issues.push('Region "'+label+'" must define temperature avgF, lowF, and highF.');
      return;
    }
    if(temp.lowF > temp.highF){
      issues.push('Region "'+label+'" has a lowF higher than highF.');
    }
  }

  function appendClimateControlIssues(control, label, issues){
    if(!control || typeof control !== 'object' || Array.isArray(control)){
      issues.push('Region "'+label+'" is missing climateControl.');
      return;
    }
    if(!control.diurnal || typeof control.diurnal !== 'object' || Array.isArray(control.diurnal)){
      issues.push('Region "'+label+'" is missing climateControl.diurnal.');
    }else{
      if(!/^\d{4}$/.test(String(control.diurnal.lowTimeHHMM || ''))){
        issues.push('Region "'+label+'" must define climateControl.diurnal.lowTimeHHMM.');
      }
      if(!/^\d{4}$/.test(String(control.diurnal.highTimeHHMM || ''))){
        issues.push('Region "'+label+'" must define climateControl.diurnal.highTimeHHMM.');
      }
    }
    if(!control.governor || typeof control.governor !== 'object' || Array.isArray(control.governor)){
      issues.push('Region "'+label+'" is missing climateControl.governor.');
    }
    if(!control.activation || typeof control.activation !== 'object' || Array.isArray(control.activation)){
      issues.push('Region "'+label+'" is missing climateControl.activation.');
    }
  }

  function appendPeriodIssues(payload, periodKey, period, label, issues){
    if(!period || typeof period !== 'object' || Array.isArray(period)){
      issues.push('Region "'+label+'" is missing the "'+periodKey+'" climate period.');
      return;
    }
    appendTemperatureIssues(period.temperature, label + '.temperature', issues);
    if(!period.precipitation || typeof period.precipitation !== 'object' || Array.isArray(period.precipitation)){
      issues.push('Region "'+label+'" is missing precipitation data.');
    }else{
      if(typeof period.precipitation.chancePct !== 'number'){
        issues.push('Region "'+label+'" is missing precipitation.chancePct.');
      }
      if(!String(period.precipitation.type||'').trim()){
        issues.push('Region "'+label+'" is missing precipitation.type.');
      }
      var intensity = normalizeIntensityWeights(period.precipitation.intensityWeights, period.precipitation.chancePct);
      if(!(intensity.light || intensity.moderate || intensity.heavy)){
        issues.push('Region "'+label+'" has invalid precipitation intensity weights.');
      }
    }
    if(!period.wind || typeof period.wind !== 'object' || Array.isArray(period.wind)){
      issues.push('Region "'+label+'" is missing wind data.');
    }else{
      appendWeightIssues(normalizeDirectionWeights(period.wind.directionWeights), label + '.wind.directionWeights', issues, 'direction');
      appendWeightIssues(normalizeStrengthWeights(period.wind.strengthWeights), label + '.wind.strengthWeights', issues, 'strength');
    }
    if(!period.critical || typeof period.critical !== 'object' || Array.isArray(period.critical)){
      issues.push('Region "'+label+'" is missing critical event data.');
    }else{
      if(typeof period.critical.chancePct !== 'number'){
        issues.push('Region "'+label+'" is missing critical.chancePct.');
      }
      if(!normalizeEventWeights(period.critical.eventWeights).length){
        issues.push('Region "'+label+'" is missing critical.eventWeights.');
      }else{
        var knownEvents = availableCriticalEventKeys(payload);
        var eventWeights = normalizeEventWeights(period.critical.eventWeights);
        for(var i=0;i<eventWeights.length;i++){
          if(!knownEvents[eventWeights[i].value]){
            issues.push('Region "'+label+'" references an unknown critical event "'+eventWeights[i].value+'".');
          }
        }
      }
    }
    if(!period.drift || typeof period.drift !== 'object' || Array.isArray(period.drift)){
      issues.push('Region "'+label+'" is missing drift settings.');
    }else if(!period.drift.timeofdaySegments || typeof period.drift.timeofdaySegments !== 'object' || Array.isArray(period.drift.timeofdaySegments)){
      issues.push('Region "'+label+'" must define drift.timeofdaySegments.');
    }else{
      for(var ti=0;ti<TIMEOFDAY_SEGMENT_KEYS.length;ti++){
        var segmentKey = TIMEOFDAY_SEGMENT_KEYS[ti];
        var segment = period.drift.timeofdaySegments[segmentKey];
        if(!segment || typeof segment !== 'object' || Array.isArray(segment)){
          issues.push('Region "'+label+'" is missing drift.timeofdaySegments.' + segmentKey + '.');
        }
      }
    }
  }

  function appendSeasonalCurrentIssues(currents, label, issues){
    if(!currents || typeof currents !== 'object' || Array.isArray(currents)){
      issues.push('Region "'+label+'" is missing seasonal current data.');
      return;
    }
    for(var i=0;i<SEASONS.length;i++){
      var season = SEASONS[i];
      var block = currents[season];
      if(!block || typeof block !== 'object' || Array.isArray(block)){
        issues.push('Region "'+label+'" is missing seasonal current "'+season+'".');
        continue;
      }
      if(!normalizeDir16(block.direction||'')){
        issues.push('Region "'+label+'" has an invalid current direction for "'+season+'".');
      }
      if(!block.readings || typeof block.readings !== 'object' || Array.isArray(block.readings)){
        issues.push('Region "'+label+'" must define current readings for "'+season+'".');
        continue;
      }
      for(var ri=0;ri<CURRENT_SAMPLE_KEYS.length;ri++){
        var sampleKey = CURRENT_SAMPLE_KEYS[ri];
        var reading = block.readings[sampleKey];
        if(!reading || typeof reading !== 'object' || Array.isArray(reading)){
          issues.push('Region "'+label+'" must define current readings.' + sampleKey + ' for "'+season+'".');
          continue;
        }
        if(typeof reading.temperatureF !== 'number' || typeof reading.strengthPct !== 'number'){
          issues.push('Region "'+label+'" must define current readings.' + sampleKey + '.temperatureF and strengthPct for "'+season+'".');
        }
      }
    }
  }

  function appendLocaleDefinitionIssues(payload, localeKey, def, issues){
    var label = payload.region + '.localeDefinitions.' + localeKey;
    if(!def){
      issues.push('Region "'+payload.region+'" is missing localeDefinitions.'+localeKey+'.');
      return;
    }
    if(!String(def.label||'').trim()){
      issues.push('Region "'+label+'" is missing a label.');
    }
    if(['surface','underwater','subterranean'].indexOf(def.environment) < 0){
      issues.push('Region "'+label+'" has an invalid environment.');
    }
    if(['offset','override'].indexOf(def.climateMode) < 0){
      issues.push('Region "'+label+'" has an invalid climateMode.');
    }
    if(def.useSeasonalCurrent && (!def.waterProfile || typeof def.waterProfile !== 'object' || Array.isArray(def.waterProfile))){
      issues.push('Region "'+label+'" must define waterProfile when useSeasonalCurrent is true.');
    }
    if(def.climateControl && (typeof def.climateControl !== 'object' || Array.isArray(def.climateControl))){
      issues.push('Region "'+label+'" must define climateControl as an object when present.');
    }else if(def.climateControl){
      appendClimateControlIssues(def.climateControl, label + '.climateControl', issues);
    }
    var periodKeys = Object.keys(def.periods || {});
    for(var i=0;i<periodKeys.length;i++){
      var periodKey = canonicalPeriodKey(periodKeys[i]);
      var period = def.periods[periodKeys[i]];
      var periodLabel = label + '.periods.' + (periodKey || periodKeys[i]);
      if(!periodKey){
        issues.push('Region "'+periodLabel+'" is not a supported climate period.');
        continue;
      }
      if(!period || typeof period !== 'object' || Array.isArray(period)){
        issues.push('Region "'+periodLabel+'" must be an object.');
        continue;
      }
      if(period.temperature && typeof period.temperature !== 'object'){
        issues.push('Region "'+periodLabel+'.temperature" must be an object.');
      }
      if(period.precipitation && typeof period.precipitation !== 'object'){
        issues.push('Region "'+periodLabel+'.precipitation" must be an object.');
      }
      if(period.wind && typeof period.wind !== 'object'){
        issues.push('Region "'+periodLabel+'.wind" must be an object.');
      }
      if(period.current && typeof period.current !== 'object'){
        issues.push('Region "'+periodLabel+'.current" must be an object.');
      }
      if(period.critical && typeof period.critical !== 'object'){
        issues.push('Region "'+periodLabel+'.critical" must be an object.');
      }
      if(period.drift && typeof period.drift !== 'object'){
        issues.push('Region "'+periodLabel+'.drift" must be an object.');
      }
    }
  }

  function appendRegionProfileIssues(region, payload, issues){
    region = canonicalKey(region);
    if(!payload || typeof payload !== 'object' || Array.isArray(payload)){
      issues.push('Region "'+region+'" is not a valid object.');
      return;
    }
    if(payload.schema !== REGION_PROFILE_SCHEMA){
      issues.push('Region "'+region+'" must use schema ' + REGION_PROFILE_SCHEMA + '.');
    }
    if(canonicalKey(payload.region || region) !== region){
      issues.push('Region "'+region+'" does not match its payload region key.');
    }
    if(!String(payload.displayName||'').trim()){
      issues.push('Region "'+region+'" is missing displayName.');
    }
    if(!Array.isArray(payload.locales) || !payload.locales.length){
      issues.push('Region "'+region+'" is missing locales.');
      return;
    }
    var seenLocales = {};
    for(var li=0;li<payload.locales.length;li++){
      var localeKey = canonicalKey(payload.locales[li]);
      if(!localeKey){
        issues.push('Region "'+region+'" contains an invalid locale key.');
        continue;
      }
      if(seenLocales[localeKey]){
        issues.push('Region "'+region+'" lists locale "'+localeKey+'" more than once.');
        continue;
      }
      seenLocales[localeKey] = true;
    }
    for(var bi=0;bi<LOCALES.length;bi++){
      if(!seenLocales[LOCALES[bi]]){
        issues.push('Region "'+region+'" must include canonical locale "'+LOCALES[bi]+'".');
      }
    }
    if(!seenLocales[canonicalKey(payload.defaultLocale)]){
      issues.push('Region "'+region+'" has a defaultLocale that is not listed in locales.');
    }
    if(!Array.isArray(payload.campaignLocations)){
      issues.push('Region "'+region+'" is missing campaignLocations.');
    }
    if(!Array.isArray(payload.referenceSources) || !payload.referenceSources.length){
      issues.push('Region "'+region+'" is missing referenceSources.');
    }
    if(!Array.isArray(payload.sourceNotes)){
      issues.push('Region "'+region+'" is missing sourceNotes.');
    }
    if(!payload.weather || typeof payload.weather !== 'object' || Array.isArray(payload.weather)){
      issues.push('Region "'+region+'" is missing weather.');
      return;
    }
    appendClimateControlIssues(payload.weather.climateControl, region + '.weather.climateControl', issues);
    if(!payload.weather.periods || typeof payload.weather.periods !== 'object' || Array.isArray(payload.weather.periods)){
      issues.push('Region "'+region+'" is missing weather.periods.');
    }else{
      for(var pi=0;pi<PERIOD_ORDER.length;pi++){
        var periodKey = PERIOD_ORDER[pi];
        appendPeriodIssues(payload, periodKey, payload.weather.periods[periodKey], region + '.weather.periods.' + periodKey, issues);
      }
    }
    appendSeasonalCurrentIssues(payload.weather.seasonalCurrents, region + '.weather.seasonalCurrents', issues);

    var defs = regionLocaleDefinitions(payload);
    Object.keys(defs).forEach(function(localeKey){
      var def = defs[localeKey];
      appendLocaleDefinitionIssues(payload, localeKey, def, issues);
    });
  }

  function loadRegionCatalog(mule){
    drainRegionQueue();
    var root = loadRegionsRoot(mule);
    var payloads = regionPayloads(root);
    var profiles = {};
    var issues = [];
    var seen = {};
    var keys = Object.keys(payloads);

    for(var i=0;i<keys.length;i++){
      var payload = payloads[keys[i]];
      var region = canonicalKey((payload && payload.region) || keys[i]);
      if(!region){
        issues.push('Regions root contains an entry without a canonical region key.');
        continue;
      }
      if(seen[region]){
        issues.push('Regions root contains duplicate entries for region "'+region+'".');
        continue;
      }
      seen[region] = true;
      var entryIssues = [];
      appendRegionProfileIssues(region, payload, entryIssues);
      if(entryIssues.length){
        issues = issues.concat(entryIssues);
        continue;
      }
      profiles[region] = payload;
    }

    return {
      root:root,
      profiles:profiles,
      regions:Object.keys(profiles).sort(),
      issues:issues
    };
  }

  function ensureRegionCatalogHealth(mule){
    var catalog = loadRegionCatalog(mule);
    if(!catalog.issues.length) return catalog;
    whisperGMOnce(
      'regioncatalog.'+catalog.issues.join('|'),
      '<div style="border:1px solid #666;padding:8px;"><b>dwt_weather</b>: Region data mismatch detected.<br>'
        + catalog.issues.map(function(msg){ return esc(msg); }).join('<br>')
        + '</div>'
    );
    return catalog;
  }

  function loadRegionProfile(mule, region){
    region = canonicalKey(region);
    if(!region) return null;
    return loadRegionCatalog(mule).profiles[region] || null;
  }

  function loadedRegions(mule){
    return loadRegionCatalog(mule).regions;
  }

  function registerRegionEntry(entry, moduleName, moduleVersion){
    var mule = ensureMule();
    var copy = deepCloneJSON(entry || {});
    var region = canonicalKey(copy.region);
    if(!region) throw new Error('Region entry is missing a canonical region key.');
    var issues = [];
    appendRegionProfileIssues(region, copy, issues);
    if(issues.length) throw new Error(issues.join(' | '));
    var root = loadRegionsRoot(mule);
    root.regions[region] = copy;
    saveRegionsRoot(mule, root);
    if(moduleName) mergeVersionEntry(mule, moduleName, moduleVersion || VERSION);
    return copy;
  }

  function drainRegionQueue(){
    var queue = RT.dwtRegionQ || [];
    if(!Array.isArray(queue) || !queue.length) return;
    for(var i=0;i<queue.length;i++){
      var item = queue[i] || {};
      try{
        if(item && item.entry) registerRegionEntry(item.entry, item.moduleName, item.version);
      }catch(e){
        log('dwt_weather region registration err: '+e);
      }
    }
    RT.dwtRegionQ = [];
  }

  // ----------------------------
  // Resolve region / locale from the active page name
  // ----------------------------
  function normalizeMapNameForCompare(s){
    return lower(String(s||'')).replace(/\s+/g,'').replace(/[^a-z0-9._-]/g,'');
  }

  function formatDepthMetricLabel(meters){
    meters = Math.max(0, Math.round(+meters||0));
    if(meters >= 1000) return trimNumber((meters / 1000), 2) + ' km';
    return trimNumber(meters, 0) + ' m';
  }

  function formatDepthImperialLabel(meters, includeFathoms){
    var feet = Math.max(0, Math.round((+meters||0) / 0.3048));
    var label = (feet >= 5280)
      ? (trimNumber((feet / 5280), 2) + ' mi')
      : (trimNumber(feet, 0) + ' ft');
    if(includeFathoms){
      label += ' (' + trimNumber((feet / 6), 0) + ' fathoms)';
    }
    return label;
  }

  function trimNumber(n, decimals){
    var text = String((+n||0).toFixed(decimals||0));
    return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function formatDepthFathomsLabel(meters){
    var feet = Math.max(0, Math.round((+meters||0) / 0.3048));
    return trimNumber((feet / 6), 0) + ' fathoms';
  }

  function weatherUnitFamily(mule){
    var settings = ensureSettings(mule || ensureMule());
    return (settings.units === 'metric') ? 'metric' : 'imperial';
  }

  function formatPreferredDepthLabel(meters, units){
    return (units === 'metric')
      ? formatDepthMetricLabel(meters)
      : formatDepthImperialLabel(meters, false);
  }

  function narratedUnitLabel(valueText, singular, plural){
    return valueText + ' ' + (String(valueText) === '1' ? singular : plural);
  }

  function formatNarratedDepthMetricLabel(meters){
    meters = Math.max(0, Math.round(+meters||0));
    if(meters >= 1000){
      return narratedUnitLabel(trimNumber((meters / 1000), 2), 'kilometer', 'kilometers');
    }
    return narratedUnitLabel(trimNumber(meters, 0), 'meter', 'meters');
  }

  function formatNarratedDepthImperialLabel(meters){
    var feet = Math.max(0, Math.round((+meters||0) / 0.3048));
    if(feet >= 5280){
      return narratedUnitLabel(trimNumber((feet / 5280), 2), 'mile', 'miles');
    }
    return narratedUnitLabel(trimNumber(feet, 0), 'foot', 'feet');
  }

  function formatNarratedDepthFathomsLabel(meters){
    var feet = Math.max(0, Math.round((+meters||0) / 0.3048));
    return narratedUnitLabel(trimNumber((feet / 6), 0), 'fathom', 'fathoms');
  }

  function formatNarratedPreferredDepthLabel(meters, units){
    return (units === 'metric')
      ? formatNarratedDepthMetricLabel(meters)
      : formatNarratedDepthImperialLabel(meters);
  }

  function formatFathomsWithPreferredLabel(meters, units){
    return formatDepthFathomsLabel(meters) + ' (' + formatPreferredDepthLabel(meters, units) + ')';
  }

  function formatNarratedFathomsWithPreferredLabel(meters, units){
    return formatNarratedDepthFathomsLabel(meters) + ' (' + formatNarratedPreferredDepthLabel(meters, units) + ')';
  }

  function formatNarratedSubterraneanDepthLabel(meters, units){
    meters = Math.max(0, Math.round(+meters||0));
    if((units||'imperial') === 'metric'){
      if(meters >= 1000){
        return narratedUnitLabel(trimNumber((meters / 1000), 2), 'kilometer', 'kilometers');
      }
      return narratedUnitLabel(String(Math.max(50, Math.round(meters / 50) * 50)), 'meter', 'meters');
    }
    var feet = Math.max(0, Math.round(meters / 0.3048));
    if(feet >= 5280){
      return narratedUnitLabel(trimNumber((feet / 5280), 2), 'mile', 'miles');
    }
    return narratedUnitLabel(String(Math.max(50, Math.round(feet / 50) * 50)), 'foot', 'feet');
  }

  function parseDepthTokenStrict(raw, units){
    var cleaned = String(raw||'').replace(/,/g,'').trim();
    var match = cleaned.match(/^(\+)?([0-9]+(?:\.[0-9]+)?)(?:\s*(mi|km))?$/i);
    if(!match) return { ok:false, error:'Depth must be a positive number, with optional + for elevation and optional mi or km.' };

    var isElevation = !!match[1];
    var value = parseFloat(match[2]);
    var unit = lower(match[3] || '');
    if(!isFinite(value) || value <= 0) return { ok:false, error:'Depth or elevation must use a positive value.' };
    if(!unit && value % 1 !== 0) return { ok:false, error:'Bare depth values must be whole numbers in page names and commands.' };

    units = (units === 'metric') ? 'metric' : 'imperial';
    var unitToken = unit || (units === 'metric' ? 'm' : 'ft');
    var meters = 0;
    if(unitToken==='ft') meters = value * 0.3048;
    else if(unitToken==='mi') meters = value * 5280 * 0.3048;
    else if(unitToken==='m') meters = value;
    else meters = value * 1000;
    meters = Math.round(meters * 10000) / 10000;

    return {
      ok:true,
      meters:meters,
      token:(isElevation ? '+' : '') + trimNumber(value, unit ? 2 : 0) + unit,
      isElevation:isElevation,
      metricLabel:formatDepthMetricLabel(meters),
      imperialLabel:formatDepthImperialLabel(meters, false),
      fathomsLabel:formatDepthFathomsLabel(meters)
    };
  }

  function parseLocaleSpec(raw, mule, regionPayload){
    var text = String(raw||'').trim();
    if(!text) return { ok:false, error:'Missing locale.' };
    var idx = text.indexOf('_');
    var localePart = (idx >= 0) ? text.slice(0, idx) : text;
    var depthPart = (idx >= 0) ? text.slice(idx + 1) : '';
    var localeDef = regionPayload ? findLocaleByKey(regionPayload, localePart) : null;
    if(!localeDef){
      var fallbackKey = canonicalKey(localePart);
      localeDef = normalizeLocaleDefinition(fallbackKey, DEFAULT_LOCALE_DEFINITIONS[fallbackKey] || { key:fallbackKey, label:localePart });
    }
    if(!localeDef || !localeDef.key) return { ok:false, error:'Unsupported locale.' };
    if(idx >= 0 && !String(depthPart||'').trim()) return { ok:false, error:'Depth or elevation cannot be empty after "_".' };
    if(!depthPart) return {
      ok:true,
      locale:localeDef.key,
      localeDef:localeDef,
      depthMeters:0,
      depthToken:'',
      depthMetric:'',
      depthImperial:'',
      depthFathoms:'',
      depthIsElevation:false
    };
    var depth = parseDepthTokenStrict(depthPart, weatherUnitFamily(mule));
    if(!depth.ok) return depth;
    return {
      ok:true,
      locale:localeDef.key,
      localeDef:localeDef,
      depthMeters:depth.meters,
      depthToken:depth.token,
      depthMetric:depth.metricLabel,
      depthImperial:depth.imperialLabel,
      depthFathoms:depth.fathomsLabel,
      depthIsElevation:!!depth.isElevation
    };
  }

  function parsePageNameTriple(name, mule){
    // region.locale.mapname or region.locale_<depth>.mapname
    var raw = String(name||'').trim();
    var m = raw.match(/^([^.]+)\.([^.]+)\.(.+)$/);
    if(!m) return null;
    var r = canonicalKey(m[1]);
    var map = String(m[3]||'').trim();
    if(!normalizeMapNameForCompare(map)) return null;
    var payload = loadRegionProfile(mule, r);
    if(!payload) return null;
    var localeMeta = parseLocaleSpec(m[2], mule, payload);
    if(!localeMeta.ok) return null;
    return {
      region:r,
      locale:localeMeta.locale,
      localeDef:localeMeta.localeDef || findLocaleDefinition(payload, localeMeta.locale),
      mapname:map,
      depthMeters:localeMeta.depthMeters || 0,
      depthToken:localeMeta.depthToken || '',
      depthMetric:localeMeta.depthMetric || '',
      depthImperial:localeMeta.depthImperial || '',
      depthFathoms:localeMeta.depthFathoms || '',
      depthIsElevation:!!localeMeta.depthIsElevation
    };
  }

  function resolveFromPageId(pageId){
    try{
      var mule = ensureMule();
      var pg = getObj('page', pageId);
      if(!pg) return null;
      var trip = parsePageNameTriple(pg.get('name')||'', mule);
      if(!trip) return null;
      trip.source = 'page';
      trip.pageid = pageId;
      return trip;
    }catch(e){ return null; }
  }

  function resolveFromPage(pid){
    var pageId = _activePageId(pid);
    return pageId ? resolveFromPageId(pageId) : null;
  }

  // ----------------------------
  // Profile access helpers
  // ----------------------------
  function pickOne(arr){
    if(!arr || !arr.length) return null;
    return arr[Math.floor(Math.random()*arr.length)];
  }

  function rollFromWeights(weights, fallback){
    weights = Array.isArray(weights) ? weights : [];
    if(!weights.length) return fallback;
    var total = 0;
    for(var i=0;i<weights.length;i++) total += Math.max(0, Math.round(+weights[i].weight||0));
    if(total <= 0) return fallback;
    var roll = Math.floor(Math.random() * total) + 1;
    var cursor = 0;
    for(var j=0;j<weights.length;j++){
      cursor += Math.max(0, Math.round(+weights[j].weight||0));
      if(roll <= cursor) return weights[j].value;
    }
    return weights[weights.length-1].value;
  }

  var TEMP_BANDS = [
    { key:'frigid', minF:-40, maxF:20 },
    { key:'cold', minF:21, maxF:45 },
    { key:'mild', minF:46, maxF:69 },
    { key:'warm', minF:70, maxF:84 },
    { key:'hot', minF:85, maxF:140 }
  ];

  function tempBandFromF(tempF){
    tempF = Math.round(+tempF||0);
    for(var i=0;i<TEMP_BANDS.length;i++){
      var band = TEMP_BANDS[i];
      if(tempF >= band.minF && tempF <= band.maxF) return band.key;
    }
    return (tempF < TEMP_BANDS[0].minF) ? 'frigid' : 'hot';
  }

  function tempBandRange(band){
    band = canonicalKey(band);
    for(var i=0;i<TEMP_BANDS.length;i++){
      if(TEMP_BANDS[i].key === band) return TEMP_BANDS[i];
    }
    return TEMP_BANDS[2];
  }

  function tempBandMidpointF(band){
    var range = tempBandRange(band);
    if(range.key === 'frigid') return 10;
    if(range.key === 'hot') return 95;
    return Math.round((range.minF + range.maxF) / 2);
  }

  function tempBandRangeSummary(){
    function span(band){
      var range = tempBandRange(band);
      var minC = toC(range.minF);
      var maxC = toC(range.maxF);
      if(band === 'frigid') return 'frigid ('+range.minF+' to '+range.maxF+'F / '+minC+' to '+maxC+'C)';
      if(band === 'hot') return 'hot ('+range.minF+' to '+range.maxF+'F / '+minC+' to '+maxC+'C)';
      return band+' ('+range.minF+' to '+range.maxF+'F / '+minC+' to '+maxC+'C)';
    }
    return [
      span('frigid'),
      span('cold'),
      span('mild'),
      span('warm'),
      span('hot')
    ].join(', ');
  }

  function tempBandRangeBulletLines(){
    function span(band){
      var range = tempBandRange(band);
      var minC = toC(range.minF);
      var maxC = toC(range.maxF);
      return '- ' + band + ': ' + range.minF + ' to ' + range.maxF + 'F / ' + minC + ' to ' + maxC + 'C';
    }
    return [
      span('frigid'),
      span('cold'),
      span('mild'),
      span('warm'),
      span('hot')
    ];
  }

  function rainfallBandFromStep(step){
    step = clamp(Math.round(+step||0), 0, 3);
    if(step === 1) return 'light';
    if(step === 2) return 'moderate';
    if(step >= 3) return 'heavy';
    return 'none';
  }

  function rainfallStepFromBand(band){
    band = normalizeRainfallBand(band);
    if(band === 'light') return 1;
    if(band === 'moderate') return 2;
    if(band === 'heavy') return 3;
    return 0;
  }

  function skyStateFromStep(step){
    step = clamp(Math.round(+step||0), 0, 4);
    if(step === 1) return 'partly_cloudy';
    if(step === 2) return 'cloudy';
    if(step === 3) return 'overcast';
    if(step >= 4) return 'stormy';
    return 'clear';
  }

  function skyStepFromState(v){
    v = canonicalSkyState(v);
    if(v === 'partly_cloudy') return 1;
    if(v === 'cloudy') return 2;
    if(v === 'overcast') return 3;
    if(v === 'stormy') return 4;
    return 0;
  }

  function windPercentFromStep(step){
    step = clamp(Math.round(+step||0), 0, 5);
    return [0,20,40,60,80,100][step];
  }

  function windStepFromPercent(percent){
    percent = clamp(Math.round(+percent||0), 0, 100);
    if(percent <= 0) return 0;
    if(percent <= 20) return 1;
    if(percent <= 40) return 2;
    if(percent <= 60) return 3;
    if(percent <= 80) return 4;
    return 5;
  }

  function normalizeChopBand(v){
    v = canonicalKey(v||'');
    if(v === 'none') return 'none';
    if(v === 'light') return 'light';
    if(v === 'moderate') return 'moderate';
    if(v === 'heavy') return 'heavy';
    if(v === 'severe') return 'severe';
    return '';
  }

  function chopBandFromStep(step){
    step = clamp(Math.round(+step||0), 0, 4);
    return ['none','light','moderate','heavy','severe'][step];
  }

  function chopStepFromBand(v){
    v = normalizeChopBand(v);
    if(v === 'light') return 1;
    if(v === 'moderate') return 2;
    if(v === 'heavy') return 3;
    if(v === 'severe') return 4;
    return 0;
  }

  function windPercentForChopBand(v){
    return [0,20,40,60,80][chopStepFromBand(v)];
  }

  function chopBandFromWindPercent(percent){
    var step = windStepFromPercent(percent);
    if(step <= 0) return 'none';
    if(step === 1) return 'light';
    if(step === 2) return 'moderate';
    if(step === 3) return 'heavy';
    return 'severe';
  }

  function normalizeCurrentReading(raw, fallback, defaultDir){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    fallback = (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) ? fallback : {};
    return {
      direction: normalizeDir16(raw.direction || fallback.direction || defaultDir || 'N'),
      temperatureF: Math.round((raw.temperatureF != null) ? +raw.temperatureF : ((fallback.temperatureF != null) ? +fallback.temperatureF : 50)),
      strengthPct: clamp(Math.round((raw.strengthPct != null) ? +raw.strengthPct : ((fallback.strengthPct != null) ? +fallback.strengthPct : 0)), 0, 100)
    };
  }

  function normalizeSeasonalCurrent(block, waterProfile){
    block = (block && typeof block === 'object' && !Array.isArray(block)) ? block : {};
    var profile = normalizeWaterProfile(block.measurementProfile || waterProfile || {});
    var defaultDir = normalizeDir16(block.direction || 'N');
    var rawReadings = (block.readings && typeof block.readings === 'object' && !Array.isArray(block.readings)) ? block.readings : {};
    var surface = normalizeCurrentReading(rawReadings.surface, null, defaultDir);
    var shallow = normalizeCurrentReading(rawReadings.shallow, rawReadings.surface || surface, surface.direction);
    var mid = normalizeCurrentReading(rawReadings.mid, rawReadings.shallow || shallow, shallow.direction);
    var deep = normalizeCurrentReading(rawReadings.deep, rawReadings.mid || mid, mid.direction);
    var readings = {
      surface:surface,
      shallow:shallow,
      mid:mid,
      deep:deep
    };
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      readings[sampleKey].depthFeet = currentSampleDepthFeet(profile, sampleKey);
      readings[sampleKey].depthMeters = Math.round(readings[sampleKey].depthFeet * 0.3048);
      readings[sampleKey].depthFraction = currentSampleDepthFraction(profile, sampleKey);
    }
    var representativeStrength = Math.round((readings.shallow.strengthPct + readings.deep.strengthPct) / 2);
    return {
      direction: normalizeDir16(block.direction || readings.mid.direction || readings.shallow.direction || defaultDir),
      temperatureF: readings.mid.temperatureF,
      depthFeet: readings.mid.depthFeet,
      strengthPct: clamp(representativeStrength, 0, 100),
      measurementProfile: profile,
      readings:readings
    };
  }

  function resolveSeasonalCurrent(baseBlock, localBlock, mode, localeWaterProfile){
    localBlock = (localBlock && typeof localBlock === 'object' && !Array.isArray(localBlock)) ? localBlock : {};
    var profile = normalizeWaterProfile(localBlock.measurementProfile || localeWaterProfile || {});
    var base = normalizeSeasonalCurrent(baseBlock, profile);
    var localReadings = (localBlock.readings && typeof localBlock.readings === 'object' && !Array.isArray(localBlock.readings)) ? localBlock.readings : {};
    var resolvedReadings = {};
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var baseReading = base.readings[sampleKey];
      var localReading = (localReadings[sampleKey] && typeof localReadings[sampleKey] === 'object' && !Array.isArray(localReadings[sampleKey])) ? localReadings[sampleKey] : {};
      resolvedReadings[sampleKey] = {
        direction: localReading.direction ? normalizeDir16(localReading.direction) : baseReading.direction,
        temperatureF: Math.round(mode === 'offset'
          ? mergeNumber(baseReading.temperatureF, +localReading.temperatureDeltaF||0, localReading.temperatureF)
          : mergeNumber(baseReading.temperatureF, null, localReading.temperatureF)),
        strengthPct: clamp(Math.round(mode === 'offset'
          ? mergeNumber(baseReading.strengthPct, +localReading.strengthDeltaPct||0, localReading.strengthPct)
          : mergeNumber(baseReading.strengthPct, null, localReading.strengthPct)), 0, 100)
      };
    }
    return normalizeSeasonalCurrent({
      direction: localBlock.direction ? normalizeDir16(localBlock.direction) : base.direction,
      measurementProfile:profile,
      readings:resolvedReadings
    }, profile);
  }

  function resolveClimateContext(profile, localeKey, nw){
    nw = nw || now();
    var payload = profile || {};
    var weather = payload.weather || {};
    var periodKey = periodKeyFromNow(nw);
    var season = (periodInfo(periodKey) || { season:seasonFromMonth(nw.month) }).season;
    var localeDef = findLocaleDefinition(payload, localeKey) || normalizeLocaleDefinition(localeKey, DEFAULT_LOCALE_DEFINITIONS[canonicalKey(localeKey)] || {});
    var basePeriod = (weather.periods && weather.periods[periodKey]) || {};
    var localPeriod = (localeDef.periods && localeDef.periods[periodKey]) || {};
    var mode = localeDef.climateMode || 'offset';

    var baseTemp = basePeriod.temperature || {};
    var localTemp = localPeriod.temperature || {};
    var resolvedTemp = {
      avgF: Math.round(mergeNumber(+baseTemp.avgF||55, mode === 'offset' ? +localTemp.avgDeltaF||0 : null, mode === 'override' ? localTemp.avgF : localTemp.avgF)),
      lowF: Math.round(mergeNumber(+baseTemp.lowF||45, mode === 'offset' ? +localTemp.lowDeltaF||0 : null, mode === 'override' ? localTemp.lowF : localTemp.lowF)),
      highF: Math.round(mergeNumber(+baseTemp.highF||65, mode === 'offset' ? +localTemp.highDeltaF||0 : null, mode === 'override' ? localTemp.highF : localTemp.highF))
    };

    var basePrecip = basePeriod.precipitation || {};
    var localPrecip = localPeriod.precipitation || {};
    var precipChance = mode === 'offset'
      ? mergeNumber(+basePrecip.chancePct||0, +localPrecip.chanceDeltaPct||0, localPrecip.chancePct)
      : mergeNumber(+basePrecip.chancePct||0, null, localPrecip.chancePct);
    var precipType = String(localPrecip.type || basePrecip.type || 'auto').trim().toLowerCase();
    var intensityWeights = localPrecip.intensityWeights
      ? normalizeIntensityWeights(localPrecip.intensityWeights, precipChance)
      : normalizeIntensityWeights(basePrecip.intensityWeights, precipChance);

    var baseWind = basePeriod.wind || {};
    var localWind = localPeriod.wind || {};
    var directionWeights = localWind.directionWeights
      ? normalizeDirectionWeights(localWind.directionWeights)
      : normalizeDirectionWeights(baseWind.directionWeights);
    var strengthWeights = localWind.strengthWeights
      ? normalizeStrengthWeights(localWind.strengthWeights)
      : normalizeStrengthWeights(baseWind.strengthWeights);

    var baseCritical = basePeriod.critical || {};
    var localCritical = localPeriod.critical || {};
    var criticalChance = mode === 'offset'
      ? mergeNumber(+baseCritical.chancePct||0, +localCritical.chanceDeltaPct||0, localCritical.chancePct)
      : mergeNumber(+baseCritical.chancePct||0, null, localCritical.chancePct);
    var severityWeights = localCritical.severityWeights
      ? normalizeSeverityWeights(localCritical.severityWeights)
      : normalizeSeverityWeights(baseCritical.severityWeights);
    var eventWeights = localCritical.eventWeights
      ? normalizeEventWeights(localCritical.eventWeights)
      : normalizeEventWeights(baseCritical.eventWeights);

    var baseDrift = normalizeDriftConfig(basePeriod.drift || {});
    var localDrift = localPeriod.drift && typeof localPeriod.drift === 'object' ? localPeriod.drift : {};
    var resolvedDrift = normalizeDriftConfig({
      temperature: localDrift.temperature != null ? localDrift.temperature : baseDrift.temperature,
      precipitation: localDrift.precipitation != null ? localDrift.precipitation : baseDrift.precipitation,
      skies: localDrift.skies != null ? localDrift.skies : baseDrift.skies,
      wind: localDrift.wind != null ? localDrift.wind : baseDrift.wind,
      directionChangePct: localDrift.directionChangePct != null ? localDrift.directionChangePct : baseDrift.directionChangePct,
      timeofdaySegments: localDrift.timeofdaySegments || baseDrift.timeofdaySegments
    });
    if(localeDef.environment === 'subterranean'){
      var subterraneanAnchorF = averagePeriodTemperatureF(localeDef.periods, resolvedTemp.avgF);
      var subterraneanAvgF = Math.round(lerpNumber(subterraneanAnchorF, resolvedTemp.avgF, 0.35));
      var subterraneanSwingF = clamp(Math.round(Math.abs((resolvedTemp.highF || subterraneanAvgF) - (resolvedTemp.lowF || subterraneanAvgF)) * 0.35), 2, 6);
      var subterraneanLowHalf = Math.floor(subterraneanSwingF / 2);
      resolvedTemp = {
        avgF: subterraneanAvgF,
        lowF: subterraneanAvgF - subterraneanLowHalf,
        highF: subterraneanAvgF + Math.max(1, subterraneanSwingF - subterraneanLowHalf)
      };
      resolvedDrift.temperature = 1;
      resolvedDrift.wind = 1;
      resolvedDrift.directionChangePct = Math.min(resolvedDrift.directionChangePct, 10);
      var subterraneanSegments = {};
      for(var di=0;di<TIMEOFDAY_SEGMENT_KEYS.length;di++){
        var segKey = TIMEOFDAY_SEGMENT_KEYS[di];
        var seg = normalizeTimeofdayDriftEntry(segKey, (resolvedDrift.timeofdaySegments || {})[segKey]);
        subterraneanSegments[segKey] = {
          temperatureSwingPct: Math.round(seg.temperatureSwingPct * 0.25),
          temperatureDelta: clamp(Math.round(seg.temperatureDelta * 0.25), -1, 1),
          precipitationDelta: seg.precipitationDelta,
          skiesDelta: seg.skiesDelta,
          windDelta: 0,
          windStrengthDeltaPct: clamp(Math.round(seg.windStrengthDeltaPct * 0.25), -5, 5),
          directionChangePct: Math.min(seg.directionChangePct, 10)
        };
      }
      resolvedDrift.timeofdaySegments = subterraneanSegments;
    }

    var currentBase = (weather.seasonalCurrents || {})[season];
    var localCurrent = localPeriod.current || {};
    var resolvedCurrent = resolveSeasonalCurrent(currentBase, localCurrent, mode, localeDef.waterProfile || {});
    var resolvedClimateControl = mergeClimateControl(
      mergeClimateControl(
        mergeClimateControl(weather.climateControl || DEFAULT_CLIMATE_CONTROL, basePeriod.climateControl || {}),
        localeDef.climateControl || {}
      ),
      localPeriod.climateControl || {}
    );
    var timeofdayDrift = effectiveTimeofdayDrift({ drift:resolvedDrift }, nw);

    return {
      periodKey:periodKey,
      season:season,
      locale:localeDef,
      temperature:resolvedTemp,
      precipitation:{
        chancePct: clamp(Math.round(+precipChance||0), 0, 100),
        type: precipType || 'auto',
        intensityWeights: intensityWeights
      },
      wind:{
        directionWeights: directionWeights,
        strengthWeights: strengthWeights
      },
      currentPattern: resolvedCurrent,
      critical:{
        chancePct: clamp(Math.round(+criticalChance||0), 0, 100),
        severityWeights: severityWeights,
        eventWeights: eventWeights
      },
      climateControl:resolvedClimateControl,
      drift: resolvedDrift,
      timeofday: timeofdayDrift,
      manualTables:{
        region: weather.manualTables || {},
        locale: localeDef.manualTables || {}
      }
    };
  }

  function baselineTemperatureFromContext(ctx, nw){
    ctx = ctx || {};
    nw = nw || now();
    var diurnal = normalizeDiurnalConfig((((ctx || {}).climateControl) || {}).diurnal);
    var low = Math.round(+(((ctx || {}).temperature || {}).lowF) || 45);
    var high = Math.round(+(((ctx || {}).temperature || {}).highF) || 65);
    var nowMinutes = clockMinutesFromNow(nw);
    var lowMinutes = hhmmToMinutes(diurnal.lowTimeHHMM, DEFAULT_CLIMATE_CONTROL.diurnal.lowTimeHHMM);
    var highMinutes = hhmmToMinutes(diurnal.highTimeHHMM, DEFAULT_CLIMATE_CONTROL.diurnal.highTimeHHMM);
    if(low === high) return low;
    if(lowMinutes === highMinutes) return Math.round((low + high) / 2);

    if(lowMinutes < highMinutes && nowMinutes >= lowMinutes && nowMinutes <= highMinutes){
      var riseProgress = ratioBetween(nowMinutes, lowMinutes, highMinutes);
      return Math.round(low + ((high - low) * Math.pow(riseProgress, diurnal.riseCurve)));
    }

    var fallDuration = wrappedDistance(highMinutes, lowMinutes);
    var fallElapsed = wrappedDistance(highMinutes, nowMinutes);
    if(fallElapsed <= fallDuration){
      var fallProgress = clamp(fallElapsed / Math.max(1, fallDuration), 0, 1);
      return Math.round(high - ((high - low) * Math.pow(fallProgress, diurnal.fallCurve)));
    }

    var riseDuration = wrappedDistance(lowMinutes, highMinutes);
    var riseElapsed = wrappedDistance(lowMinutes, nowMinutes);
    var wrappedRiseProgress = clamp(riseElapsed / Math.max(1, riseDuration), 0, 1);
    return Math.round(low + ((high - low) * Math.pow(wrappedRiseProgress, diurnal.riseCurve)));
  }

  function temperatureOffsetFromAbsolute(ctx, tempF, nw){
    return clamp(Math.round((+tempF || 0) - baselineTemperatureFromContext(ctx, nw)), -80, 80);
  }

  function reconcileCurrentAgainstContext(cur, ctx, nw){
    cur = normalizeCurrentWeather(cur || {});
    ctx = ctx || {};
    nw = nw || now();
    cur.period = ctx.periodKey || cur.period;
    cur.season = ctx.season || cur.season;
    cur.currentPattern = ctx.currentPattern ? deepCloneJSON(ctx.currentPattern) : null;
    cur.tempOffsetF = clamp(Math.round((cur.tempOffsetF != null) ? cur.tempOffsetF : temperatureOffsetFromAbsolute(ctx, cur.tempF, nw)), -80, 80);
    cur.tempF = temperatureFromContext(ctx, cur.tempOffsetF, nw);
    cur.tempC = toC(cur.tempF);
    cur.tempBand = tempBandFromF(cur.tempF);
    cur.precipType = resolvedPrecipType(ctx, cur.tempF, cur.rainfall);
    cur.rainStep = rainfallStepFromBand(cur.rainfall);
    cur.skyStep = skyStepFromState(cur.skies);
    cur.windStep = windStepFromPercent((cur.wind && cur.wind.percent) || 0);
    return normalizeCurrentWeather(cur);
  }

  function normalizeStepDeltaWeights(entries, fallback){
    entries = normalizeWeightEntries(entries, null);
    if(!entries.length) return fallback;
    return entries.map(function(row){
      return {
        value: clamp(Math.round(+row.value||0), -3, 3),
        weight: Math.max(0, Math.round(+row.weight||0))
      };
    }).filter(function(row){ return row.weight > 0; });
  }

  function derivedStepDeltaWeights(maxDelta){
    maxDelta = clamp(Math.round(+maxDelta||1), 1, 3);
    if(maxDelta <= 1){
      return [
        { value:-1, weight:20 },
        { value:0, weight:60 },
        { value:1, weight:20 }
      ];
    }
    if(maxDelta === 2){
      return [
        { value:-2, weight:10 },
        { value:-1, weight:20 },
        { value:0, weight:40 },
        { value:1, weight:20 },
        { value:2, weight:10 }
      ];
    }
    return [
      { value:-3, weight:8 },
      { value:-2, weight:12 },
      { value:-1, weight:18 },
      { value:0, weight:24 },
      { value:1, weight:18 },
      { value:2, weight:12 },
      { value:3, weight:8 }
    ];
  }

  function scopedManualTable(raw, periodKey){
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    if(raw[periodKey] && typeof raw[periodKey] === 'object' && !Array.isArray(raw[periodKey])) return raw[periodKey];
    if(raw.default && typeof raw.default === 'object' && !Array.isArray(raw.default)) return raw.default;
    return raw;
  }

  function resolveManualRollConfig(ctx){
    ctx = ctx || {};
    var periodKey = ctx.periodKey || 'hammer';
    var regionSpec = scopedManualTable(((ctx.manualTables||{}).region||{}), periodKey);
    var localeSpec = scopedManualTable(((ctx.manualTables||{}).locale||{}), periodKey);

    function firstDefined(key){
      if(localeSpec.hasOwnProperty(key)) return localeSpec[key];
      if(regionSpec.hasOwnProperty(key)) return regionSpec[key];
      return undefined;
    }

    return {
      temperatureSteps: normalizeStepDeltaWeights(firstDefined('temperatureSteps'), derivedStepDeltaWeights(((ctx.drift||{}).temperature||1))),
      precipitationSteps: normalizeStepDeltaWeights(firstDefined('precipitationSteps'), derivedStepDeltaWeights(((ctx.drift||{}).precipitation||1))),
      skySteps: normalizeStepDeltaWeights(firstDefined('skySteps'), derivedStepDeltaWeights(((ctx.drift||{}).skies||1))),
      windSteps: normalizeStepDeltaWeights(firstDefined('windSteps'), derivedStepDeltaWeights(((ctx.drift||{}).wind||1))),
      directionChangePct: clamp(Math.round(+firstDefined('directionChangePct') || +((ctx.drift||{}).directionChangePct||25)), 0, 100),
      criticalChancePct: clamp(Math.round(+firstDefined('criticalChancePct') || +((ctx.critical||{}).chancePct||0)), 0, 100),
      eventWeights: normalizeEventWeights(firstDefined('eventWeights') || ((ctx.critical||{}).eventWeights||[])),
      severityWeights: normalizeSeverityWeights(firstDefined('severityWeights') || ((ctx.critical||{}).severityWeights||{}))
    };
  }

  function normalizeDir16(v){
    v = String(v||'').trim().toUpperCase();
    if(!v) return 'N';
    if(COMPASS_16.indexOf(v)>=0) return v;
    var idx = _dirToIdx16(v);
    return COMPASS_16[idx] || 'N';
  }

  function pickTargetRainfallStep(ctx){
    var chancePct = clamp(+(((ctx||{}).precipitation||{}).chancePct||0), 0, 100);
    if(!chancePct || r1_100() > chancePct) return 0;
    var intensity = rollFromWeights([
      { value:1, weight:ctx.precipitation.intensityWeights.light },
      { value:2, weight:ctx.precipitation.intensityWeights.moderate },
      { value:3, weight:ctx.precipitation.intensityWeights.heavy }
    ], 1);
    return clamp(+intensity||0, 0, 3);
  }

  function pickTargetSkyStep(ctx, rainStep){
    rainStep = clamp(Math.round(+rainStep||0), 0, 3);
    var chancePct = clamp(+(((ctx||{}).precipitation||{}).chancePct||0), 0, 100);
    if(rainStep >= 3) return (r1_100() <= 60) ? 3 : 4;
    if(rainStep === 2) return (r1_100() <= 55) ? 2 : 3;
    if(rainStep === 1) return (r1_100() <= 60) ? 1 : 2;
    if(chancePct <= 20) return (r1_100() <= 65) ? 0 : 1;
    if(chancePct <= 45) return (r1_100() <= 40) ? 0 : (r1_100() <= 80 ? 1 : 2);
    if(chancePct <= 65) return (r1_100() <= 35) ? 1 : (r1_100() <= 80 ? 2 : 3);
    return (r1_100() <= 40) ? 2 : (r1_100() <= 80 ? 3 : 4);
  }

  function pickTargetWindPercent(ctx, nw){
    var segment = effectiveTimeofdayDrift(ctx, nw);
    if(ctx && ctx.locale && ctx.locale.environment === 'underwater'){
      var base = windPercentFromStep(windStepFromPercent((ctx.currentPattern && ctx.currentPattern.strengthPct) || 0));
      var roll = r1_100();
      if(roll <= 18) return clamp(base - 20 + segment.windStrengthDeltaPct, 0, 100);
      if(roll >= 83) return clamp(base + 20 + segment.windStrengthDeltaPct, 0, 100);
      return clamp(base + segment.windStrengthDeltaPct, 0, 100);
    }
    if(ctx && ctx.locale && ctx.locale.environment === 'subterranean'){
      var draftBias = weightedAverageNumeric((ctx && ctx.wind && ctx.wind.strengthWeights) || [], 10);
      var draftChancePct = clamp(Math.round(draftBias / 4), 2, 12);
      var draftRoll = r1_100();
      if(draftRoll > draftChancePct) return 0;
      return (draftRoll <= Math.max(1, Math.round(draftChancePct * 0.15))) ? 40 : 20;
    }
    return clamp(rollFromWeights((ctx && ctx.wind && ctx.wind.strengthWeights) || [], 20) + segment.windStrengthDeltaPct, 0, 100);
  }

  function pickTargetWindDir(ctx){
    if(ctx && ctx.locale && ctx.locale.environment === 'underwater'){
      var baseDir = normalizeDir16((ctx.currentPattern && ctx.currentPattern.direction) || 'N');
      var idx = _dirToIdx16(baseDir);
      var roll = r1_100();
      if(roll <= 70) return baseDir;
      if(roll <= 85) return COMPASS_16[(idx + 1) % 16];
      return COMPASS_16[(idx + 15) % 16];
    }
    if(ctx && ctx.locale && ctx.locale.environment === 'subterranean'){
      return normalizeDir16(rollFromWeights((ctx && ctx.wind && ctx.wind.directionWeights) || [], 'N'));
    }
    return normalizeDir16(rollFromWeights((ctx && ctx.wind && ctx.wind.directionWeights) || [], 'N'));
  }

  function stepTowards(prev, target, maxStep, minValue, maxValue){
    prev = clamp(Math.round(+prev||0), minValue, maxValue);
    target = clamp(Math.round(+target||0), minValue, maxValue);
    maxStep = clamp(Math.round(+maxStep||1), 1, Math.max(1, maxValue - minValue));
    if(prev === target) return prev;
    if(prev < target) return Math.min(target, prev + maxStep);
    return Math.max(target, prev - maxStep);
  }

  function stepDirToward(prevDir, targetDir, maxStep){
    var prevIdx = _dirToIdx16(prevDir || 'N');
    var targetIdx = _dirToIdx16(targetDir || 'N');
    var dir = prevIdx;
    maxStep = clamp(Math.round(+maxStep||1), 1, 4);
    for(var i=0;i<maxStep;i++){
      if(dir === targetIdx) break;
      dir = (dir + _stepDir16(dir, targetIdx) + 16) % 16;
    }
    return COMPASS_16[dir] || 'N';
  }

  function resolvedPrecipType(ctx, tempF, rainfallBand){
    var type = lower(String((((ctx||{}).precipitation)||{}).type || 'auto')).replace(/[^a-z_]+/g,'');
    var rain = normalizeRainfallBand(rainfallBand) || 'none';
    if(rain !== 'none' && (!type || type === 'none')) type = 'auto';
    if(type === 'auto' || !type){
      if(tempF <= 32) return 'snow';
      if(tempF <= 36) return 'sleet';
      return 'rain';
    }
    return type;
  }

  function temperatureFromContext(ctx, tempOffsetF, nw){
    var baseline = baselineTemperatureFromContext(ctx, nw);
    return clamp(Math.round(baseline + (+tempOffsetF || 0)), -40, 140);
  }

  function normalizeRainfallBand(v){
    v = canonicalKey(v);
    if(v==='clear') return 'none';
    if(v==='med') return 'moderate';
    if(v==='none' || v==='light' || v==='moderate' || v==='heavy') return v;
    return '';
  }

  function canonicalSkyState(v){
    v = canonicalKey(v);
    if(v==='clear' || v==='clearskies') return 'clear';
    if(v==='partlycloudy' || v==='partcloudy' || v==='partlycloudyskies') return 'partly_cloudy';
    if(v==='cloudy') return 'cloudy';
    if(v==='overcast') return 'overcast';
    if(v==='stormy') return 'stormy';
    return '';
  }

  function skyStateRank(v){
    v = canonicalSkyState(v);
    if(v==='partly_cloudy') return 1;
    if(v==='cloudy') return 2;
    if(v==='overcast') return 3;
    if(v==='stormy') return 4;
    return 0;
  }

  function minimumSkiesForRainfall(v){
    v = normalizeRainfallBand(v);
    if(v==='light') return 'partly_cloudy';
    if(v==='moderate' || v==='heavy') return 'cloudy';
    return 'clear';
  }

  function maximumRainfallForSkies(v){
    v = canonicalSkyState(v);
    if(v==='clear') return 'none';
    if(v==='partly_cloudy') return 'light';
    if(v==='cloudy') return 'heavy';
    if(v==='overcast') return 'heavy';
    if(v==='stormy') return 'heavy';
    return 'none';
  }

  function rainfallBandRank(v){
    v = normalizeRainfallBand(v);
    if(v==='light') return 1;
    if(v==='moderate') return 2;
    if(v==='heavy') return 3;
    return 0;
  }

  function rainfallSkiesConflict(rainfall, skies){
    var rain = normalizeRainfallBand(rainfall) || 'none';
    var sky = canonicalSkyState(skies) || 'clear';
    return skyStateRank(sky) < skyStateRank(minimumSkiesForRainfall(rain));
  }

  function coerceSkiesForRainfall(rainfall, skies){
    var rain = normalizeRainfallBand(rainfall) || 'none';
    var sky = canonicalSkyState(skies) || 'clear';
    var minSky = minimumSkiesForRainfall(rain);
    if(skyStateRank(sky) < skyStateRank(minSky)) return minSky;
    return sky;
  }

  function coerceRainfallForSkies(rainfall, skies){
    var rain = normalizeRainfallBand(rainfall) || 'none';
    var sky = canonicalSkyState(skies) || 'clear';
    var maxRain = maximumRainfallForSkies(sky);
    if(rainfallBandRank(rain) > rainfallBandRank(maxRain)) return maxRain;
    return rain;
  }

  function canonicalWindCritical(v){
    v = canonicalKey(v);
    if(v==='critlight') return 'crit_light';
    if(v==='critmoderate') return 'crit_moderate';
    if(v==='critheavy') return 'crit_heavy';
    if(v==='critsevere') return 'crit_severe';
    return '';
  }

  function criticalWindPercent(v){
    v = canonicalWindCritical(v);
    if(v==='crit_light') return 85;
    if(v==='crit_moderate') return 90;
    if(v==='crit_heavy') return 95;
    if(v==='crit_severe') return 100;
    return 0;
  }

  function criticalWindMph(v){
    v = canonicalWindCritical(v);
    if(v==='crit_light') return 18;
    if(v==='crit_moderate') return 24;
    if(v==='crit_heavy') return 32;
    if(v==='crit_severe') return 45;
    return 0;
  }

  function criticalWindSide(v, windsockMode){
    v = canonicalWindCritical(v);
    windsockMode = canonicalKey(windsockMode || 'surface');
    if(windsockMode === 'underwater'){
      if(v==='crit_light') return WINDSOCK_SIDES.uw_crit_light;
      if(v==='crit_moderate') return WINDSOCK_SIDES.uw_crit_moderate;
      if(v==='crit_heavy') return WINDSOCK_SIDES.uw_crit_heavy;
      if(v==='crit_severe') return WINDSOCK_SIDES.uw_crit_severe;
      return WINDSOCK_SIDES.uw_dead_calm;
    }
    if(windsockMode === 'underdark'){
      if(v==='crit_light') return WINDSOCK_SIDES.ud_crit_light;
      if(v==='crit_moderate') return WINDSOCK_SIDES.ud_crit_moderate;
      if(v==='crit_heavy') return WINDSOCK_SIDES.ud_crit_heavy;
      if(v==='crit_severe') return WINDSOCK_SIDES.ud_crit_severe;
      return WINDSOCK_SIDES.ud_dead_calm;
    }
    if(v==='crit_light') return WINDSOCK_SIDES.surface_crit_light;
    if(v==='crit_moderate') return WINDSOCK_SIDES.surface_crit_moderate;
    if(v==='crit_heavy') return WINDSOCK_SIDES.surface_crit_heavy;
    if(v==='crit_severe') return WINDSOCK_SIDES.surface_crit_severe;
    return -1;
  }

  function windsockModeForLocation(rl){
    var environment = activeEnvironment(rl);
    if(environment === 'underwater') return 'underwater';
    if(environment === 'subterranean') return 'underdark';
    return 'surface';
  }

  function baseWindsockSide(percent, windsockMode){
    percent = clamp(+percent||0, 0, 100);
    windsockMode = canonicalKey(windsockMode || 'surface');
    if(windsockMode === 'underwater'){
      if(percent <= 0) return WINDSOCK_SIDES.uw_dead_calm;
      if(percent <= 20) return WINDSOCK_SIDES.uw_20;
      if(percent <= 40) return WINDSOCK_SIDES.uw_40;
      if(percent <= 60) return WINDSOCK_SIDES.uw_60;
      if(percent <= 80) return WINDSOCK_SIDES.uw_80;
      return WINDSOCK_SIDES.uw_100;
    }
    if(windsockMode === 'underdark'){
      if(percent <= 0) return WINDSOCK_SIDES.ud_dead_calm;
      if(percent <= 20) return WINDSOCK_SIDES.ud_20;
      if(percent <= 40) return WINDSOCK_SIDES.ud_40;
      if(percent <= 60) return WINDSOCK_SIDES.ud_60;
      if(percent <= 80) return WINDSOCK_SIDES.ud_80;
      return WINDSOCK_SIDES.ud_100;
    }
    if(percent <= 0) return WINDSOCK_SIDES.dead_calm;
    if(percent <= 20) return WINDSOCK_SIDES.surface_20;
    if(percent <= 40) return WINDSOCK_SIDES.surface_40;
    if(percent <= 60) return WINDSOCK_SIDES.surface_60;
    if(percent <= 80) return WINDSOCK_SIDES.surface_80;
    return WINDSOCK_SIDES.surface_100;
  }

  function normalizeCriticalSeverity(v){
    v = canonicalKey(v);
    if(v === 'light') return 'light';
    if(v === 'moderate') return 'moderate';
    if(v === 'heavy') return 'heavy';
    if(v === 'severe') return 'severe';
    return 'light';
  }

  function severityToCriticalWind(severity){
    severity = normalizeCriticalSeverity(severity);
    if(severity === 'severe') return 'crit_severe';
    if(severity === 'heavy') return 'crit_heavy';
    if(severity === 'moderate') return 'crit_moderate';
    return 'crit_light';
  }

  function severityWeightsArray(weights){
    weights = normalizeSeverityWeights(weights);
    return [
      { value:'light', weight:weights.light },
      { value:'moderate', weight:weights.moderate },
      { value:'heavy', weight:weights.heavy },
      { value:'severe', weight:weights.severe }
    ];
  }

  function criticalEventCatalog(profile){
    var out = {};
    Object.keys(BUILTIN_CRITICAL_EVENTS).forEach(function(key){
      out[canonicalKey(key)] = BUILTIN_CRITICAL_EVENTS[key];
    });
    var custom = (((profile||{}).weather||{}).customCriticalEvents || {});
    Object.keys(custom || {}).forEach(function(key){
      out[canonicalKey(key)] = custom[key];
    });
    return out;
  }

  function resolveCriticalEventTemplate(profile, key){
    key = canonicalKey(key);
    return criticalEventCatalog(profile)[key] || null;
  }

  function criticalEventMatchesContext(template, ctx){
    template = (template && typeof template === 'object' && !Array.isArray(template)) ? template : {};
    var envs = Array.isArray(template.environments) ? template.environments.map(canonicalKey) : [];
    if(!envs.length) return true;
    var environment = canonicalKey((((ctx || {}).locale) || {}).environment || 'surface');
    if(environment === 'underwater') return envs.indexOf('underwater') >= 0;
    if(environment === 'subterranean') return envs.indexOf('subterranean') >= 0;
    return envs.indexOf('surface') >= 0;
  }

  function buildCriticalEvent(profile, ctx, cur, nw, forcedKey, forcedSeverity){
    var eventWeights = (ctx && ctx.critical && ctx.critical.eventWeights) ? ctx.critical.eventWeights : [];
    eventWeights = eventWeights.filter(function(row){
      var template = resolveCriticalEventTemplate(profile, row && row.value);
      return !!template && criticalEventMatchesContext(template, ctx);
    });
    var eventKey = forcedKey ? canonicalKey(forcedKey) : rollFromWeights(eventWeights, '');
    var template = resolveCriticalEventTemplate(profile, eventKey);
    if(!template || !criticalEventMatchesContext(template, ctx)) return null;
    var severity = forcedSeverity ? normalizeCriticalSeverity(forcedSeverity) : normalizeCriticalSeverity(rollFromWeights(severityWeightsArray(ctx.critical.severityWeights), 'light'));
    var stats = (template.severities && template.severities[severity]) ? deepCloneJSON(template.severities[severity]) : null;
    if(!stats) return null;
    var baseDuration = Math.max(1, Math.round(+stats.durationSegments||1));
    var variance = forcedSeverity ? 0 : ((r1_100() <= 20) ? -1 : ((r1_100() >= 81) ? 1 : 0));
    var duration = Math.max(1, baseDuration + variance);
    return {
      key:eventKey,
      name:String(template.name || eventKey),
      category:String(template.category || 'event'),
      summary:String(template.summary || '').trim(),
      severity:severity,
      remainingSegments:duration,
      stats:stats,
      startedTick: tick(nw || now()),
      endsTick: tick(nw || now()) + duration - 1
    };
  }

  function applyCriticalEventToWeather(cur, event){
    if(!cur || !event || !event.stats) return cur;
    cur.event = deepCloneJSON(event);
    if(typeof event.stats.tempDeltaF === 'number'){
      cur.tempOffsetF = clamp(Math.round((+cur.tempOffsetF || 0) + event.stats.tempDeltaF), -80, 80);
    }
    if(event.stats.rainfall != null){
      cur.rainfall = normalizeRainfallBand(event.stats.rainfall) || cur.rainfall;
      cur.rainStep = rainfallStepFromBand(cur.rainfall);
    }
    if(event.stats.skies != null){
      cur.skies = canonicalSkyState(event.stats.skies) || cur.skies;
      cur.skyStep = skyStepFromState(cur.skies);
    }
    if(typeof event.stats.motionPercent === 'number'){
      cur.wind.percent = clamp(Math.round(event.stats.motionPercent), 0, 100);
      cur.windStep = windStepFromPercent(cur.wind.percent);
    }
    cur.wind.critical = severityToCriticalWind(event.severity);
    return cur;
  }

  function parseWindDirection(v){
    v = String(v||'').trim();
    if(!v) return '';

    var upper = v.toUpperCase();
    if(COMPASS_16.indexOf(upper)>=0) return upper;

    var deg = parseFloat(v);
    if(!isNaN(deg) && isFinite(deg)) return normalizeDir16(v);

    var collapsed = upper.replace(/[^A-Z]/g,'');
    collapsed = collapsed.replace(/NORTH/g,'N').replace(/SOUTH/g,'S').replace(/EAST/g,'E').replace(/WEST/g,'W');
    if(COMPASS_16.indexOf(collapsed)>=0) return collapsed;

    return '';
  }

  function snapshotOriginState(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var wind = (raw.wind && typeof raw.wind === 'object' && !Array.isArray(raw.wind)) ? raw.wind : {};
    var origin = {
      tempOffsetF: clamp(Math.round(+raw.tempOffsetF || 0), -80, 80),
      rainStep: clamp(Math.round((raw.rainStep != null) ? +raw.rainStep : rainfallStepFromBand(raw.rainfall)), 0, 3),
      rainfall: normalizeRainfallBand(raw.rainfall) || 'none',
      skyStep: clamp(Math.round((raw.skyStep != null) ? +raw.skyStep : skyStepFromState(raw.skies)), 0, 4),
      skies: canonicalSkyState(raw.skies) || 'clear',
      windStep: clamp(Math.round((raw.windStep != null) ? +raw.windStep : windStepFromPercent(wind.percent)), 0, 5),
      wind:{
        percent: clamp(+wind.percent || 0, 0, 100),
        dir: normalizeDir16(wind.dir || 'N'),
        critical: canonicalWindCritical(wind.critical)
      },
      currentPattern: raw.currentPattern ? normalizeSeasonalCurrent(raw.currentPattern) : null
    };
    origin.skies = coerceSkiesForRainfall(origin.rainfall, origin.skies);
    origin.rainfall = coerceRainfallForSkies(origin.rainfall, origin.skies);
    origin.rainStep = rainfallStepFromBand(origin.rainfall);
    origin.skyStep = skyStepFromState(origin.skies);
    origin.windStep = windStepFromPercent(origin.wind.percent);
    return origin;
  }

  function defaultActivationState(){
    return {
      transitionStartHHMM:'0000',
      transitionEndHHMM:'0259',
      skies:{ startHHMM:'0000', endHHMM:'0259' },
      precipitation:{ startHHMM:'0000', endHHMM:'0259' },
      event:null
    };
  }

  function normalizeGoalWindow(raw, fallbackStart, fallbackEnd){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var startMinutes = hhmmToMinutes(raw.startHHMM, fallbackStart);
    var endMinutes = hhmmToMinutes(raw.endHHMM, fallbackEnd);
    if(endMinutes < startMinutes) endMinutes = startMinutes;
    return {
      startHHMM: minutesToHHMM(startMinutes),
      endHHMM: minutesToHHMM(endMinutes)
    };
  }

  function normalizeActivationState(raw){
    raw = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    var out = defaultActivationState();
    out.transitionStartHHMM = normalizeHHMM(raw.transitionStartHHMM, out.transitionStartHHMM);
    out.transitionEndHHMM = normalizeHHMM(raw.transitionEndHHMM, out.transitionEndHHMM);
    if(hhmmToMinutes(out.transitionEndHHMM, out.transitionEndHHMM) < hhmmToMinutes(out.transitionStartHHMM, out.transitionStartHHMM)){
      out.transitionEndHHMM = out.transitionStartHHMM;
    }
    out.skies = normalizeGoalWindow(raw.skies, out.transitionStartHHMM, out.transitionEndHHMM);
    out.precipitation = normalizeGoalWindow(raw.precipitation, out.transitionStartHHMM, out.transitionEndHHMM);
    out.event = raw.event ? normalizeGoalWindow(raw.event, out.transitionStartHHMM, out.transitionEndHHMM) : null;
    return out;
  }

  function normalizeCurrentWeather(cur){
    if(!cur || typeof cur !== 'object') return cur;

    cur.schema = WEATHER_CURRENT_SCHEMA;
    cur.period = canonicalPeriodKey(cur.period) || cur.period || 'hammer';
    cur.tempOffsetF = clamp(Math.round(+cur.tempOffsetF || 0), -80, 80);
    cur.tempF = clamp(Math.round(+cur.tempF||55), -40, 140);
    cur.tempC = toC(cur.tempF);
    cur.tempBand = tempBandFromF(cur.tempF);
    cur.precipType = lower(String(cur.precipType || 'auto')).replace(/[^a-z_]+/g,'') || 'auto';
    cur.rainStep = clamp(Math.round(+cur.rainStep||rainfallStepFromBand(cur.rainfall)), 0, 3);
    cur.skyStep = clamp(Math.round(+cur.skyStep||skyStepFromState(cur.skies)), 0, 4);
    cur.rainfall = normalizeRainfallBand(cur.rainfall) || 'none';
    cur.skies = canonicalSkyState(cur.skies) || 'clear';
    cur.skies = coerceSkiesForRainfall(cur.rainfall, cur.skies);
    cur.rainfall = coerceRainfallForSkies(cur.rainfall, cur.skies);
    cur.rainStep = rainfallStepFromBand(cur.rainfall);
    cur.skyStep = skyStepFromState(cur.skies);

    cur.wind = cur.wind || { percent:0, dir:'N', critical:'' };
    cur.windStep = clamp(Math.round(+cur.windStep||windStepFromPercent(cur.wind.percent)), 0, 5);
    cur.wind.percent = clamp(+cur.wind.percent||0, 0, 100);
    cur.wind.dir = normalizeDir16(cur.wind.dir||'N');
    cur.wind.critical = canonicalWindCritical(cur.wind.critical);
    cur.currentPattern = cur.currentPattern ? normalizeSeasonalCurrent(cur.currentPattern) : null;

    if(cur.wind.percent <= 0){
      cur.wind.percent = 0;
      cur.wind.dir = 'N';
      if(!cur.wind.critical) cur.wind.critical = '';
    }
    if(cur.wind.critical){
      cur.wind.percent = Math.max(cur.wind.percent, criticalWindPercent(cur.wind.critical));
    }
    cur.windStep = windStepFromPercent(cur.wind.percent);
    cur.origin = snapshotOriginState(cur.origin || cur);
    cur.activation = normalizeActivationState(cur.activation);

    if(cur.event && typeof cur.event === 'object'){
      cur.event.key = canonicalKey(cur.event.key || cur.event.name);
      cur.event.severity = normalizeCriticalSeverity(cur.event.severity);
      cur.event.remainingSegments = Math.max(0, Math.round(+cur.event.remainingSegments||0));
      if(cur.event.remainingSegments < 1) cur.event = null;
    }else{
      cur.event = null;
    }

    return cur;
  }

  // ----------------------------
  // Quips
  // ----------------------------
  function weatherQuipKey(region, locale, cur){
    var season = lower(String(cur.season||''));
    var skies  = canonicalSkyState(cur.skies) || 'clear';
    var rain   = normalizeRainfallBand(cur.rainfall) || 'none';
    var bucket = (rain !== 'none') ? rain : skies;

    var path0 = 'quips.weather.'+canonicalKey(region)+'.'+canonicalKey(locale);
    var path1 = path0 + '.' + season;
    var path2 = path1 + '.' + bucket;
    return { locale:path0, general:path1, specific:path2 };
  }

  function pickQuip(region, locale, cur){
    var paths = weatherQuipKey(region, locale, cur);
    var a = getQuipsArray(paths.specific);
    if(a && a.length) return pickOne(a);
    var b = getQuipsArray(paths.general);
    if(b && b.length) return pickOne(b);
    var c = getQuipsArray(paths.locale);
    if(c && c.length) return pickOne(c);
    return '';
  }

  // ----------------------------
  // Weather snapshot model
  // ----------------------------
  function emptyCurrent(region, locale){
    return {
      schema:WEATHER_CURRENT_SCHEMA,
      region:canonicalKey(region),
      locale:canonicalKey(locale),
      period:'hammer',
      season:'winter',
      tempOffsetF:0,
      tempBand:'mild',
      tempF:60, tempC:16,
      precipType:'auto',
      rainStep:0,
      rainfall:'none',
      skyStep:0,
      skies:'clear',
      windStep:0,
      wind:{ percent:0, dir:'N', critical:'' },
      currentPattern:null,
      origin:snapshotOriginState({}),
      activation:defaultActivationState(),
      event:null,
      quip:'',
      stamp:'',
      tick:null
    };
  }

  function windowContainsMinutes(window, minuteValue){
    if(!window) return false;
    var startMinutes = hhmmToMinutes(window.startHHMM, '0000');
    var endMinutes = hhmmToMinutes(window.endHHMM, '2359');
    minuteValue = clamp(Math.round(+minuteValue||0), 0, 1439);
    return minuteValue >= startMinutes && minuteValue <= endMinutes;
  }

  function dirDistance16(fromDir, toDir){
    var fromIdx = _dirToIdx16(fromDir || 'N');
    var toIdx = _dirToIdx16(toDir || 'N');
    var diff = (toIdx - fromIdx + 16) % 16;
    return (diff <= 8) ? diff : (16 - diff);
  }

  function interpolateDir16(fromDir, toDir, progress){
    var steps = Math.round(dirDistance16(fromDir, toDir) * clamp(+progress||0, 0, 1));
    if(steps <= 0) return normalizeDir16(fromDir || 'N');
    return stepDirToward(fromDir || 'N', toDir || 'N', steps);
  }

  function interpolateCurrentPattern(originPattern, goalPattern, progress, governor){
    originPattern = originPattern ? normalizeSeasonalCurrent(originPattern) : null;
    goalPattern = goalPattern ? normalizeSeasonalCurrent(goalPattern) : null;
    if(!originPattern && !goalPattern) return null;
    if(!originPattern) return goalPattern ? deepCloneJSON(goalPattern) : null;
    if(!goalPattern) return originPattern ? deepCloneJSON(originPattern) : null;
    governor = normalizeGovernorConfig(governor || {});
    progress = clamp(+progress || 0, 0, 1);
    var profile = goalPattern.measurementProfile || originPattern.measurementProfile || normalizeWaterProfile({});
    var readings = {};
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var originReading = originPattern.readings[sampleKey] || originPattern.readings.mid;
      var goalReading = goalPattern.readings[sampleKey] || goalPattern.readings.mid;
      readings[sampleKey] = {
        direction: interpolateDir16(originReading.direction, goalReading.direction, progress),
        temperatureF: Math.round(governor.interpolateCurrentTemperature
          ? lerpNumber(originReading.temperatureF, goalReading.temperatureF, progress)
          : (progress < 1 ? originReading.temperatureF : goalReading.temperatureF)),
        strengthPct: Math.round(governor.interpolateCurrentStrength
          ? lerpNumber(originReading.strengthPct, goalReading.strengthPct, progress)
          : (progress < 1 ? originReading.strengthPct : goalReading.strengthPct))
      };
    }
    return normalizeSeasonalCurrent({
      direction: interpolateDir16(originPattern.direction, goalPattern.direction, progress),
      measurementProfile:profile,
      readings:readings
    }, profile);
  }

  function materializeLiveWeather(cur, ctx, nw){
    var stored = normalizeCurrentWeather(deepCloneJSON(cur || {}));
    var live = deepCloneJSON(stored);
    var origin = snapshotOriginState(stored.origin || stored);
    var activation = normalizeActivationState(stored.activation);
    var control = normalizeClimateControl((ctx || {}).climateControl || DEFAULT_CLIMATE_CONTROL);
    var nowMinutes = clockMinutesFromNow(nw || now());
    var transitionProgress = ratioBetween(
      nowMinutes,
      hhmmToMinutes(activation.transitionStartHHMM, activation.transitionStartHHMM),
      hhmmToMinutes(activation.transitionEndHHMM, activation.transitionEndHHMM)
    );

    live.tempOffsetF = Math.round(lerpNumber(origin.tempOffsetF, stored.tempOffsetF, transitionProgress));
    live.tempF = temperatureFromContext(ctx, live.tempOffsetF, nw);
    live.tempC = toC(live.tempF);
    live.tempBand = tempBandFromF(live.tempF);
    live.precipType = resolvedPrecipType(ctx, live.tempF, live.rainfall);

    live.rainfall = windowContainsMinutes(activation.precipitation, nowMinutes) ? stored.rainfall : origin.rainfall;
    live.skies = windowContainsMinutes(activation.skies, nowMinutes) ? stored.skies : origin.skies;
    live.skies = coerceSkiesForRainfall(live.rainfall, live.skies);
    live.rainfall = coerceRainfallForSkies(live.rainfall, live.skies);
    live.rainStep = rainfallStepFromBand(live.rainfall);
    live.skyStep = skyStepFromState(live.skies);

    live.wind.percent = Math.round(control.governor.interpolateWindStrength
      ? lerpNumber(origin.wind.percent, stored.wind.percent, transitionProgress)
      : (transitionProgress < 1 ? origin.wind.percent : stored.wind.percent));
    live.wind.dir = interpolateDir16(origin.wind.dir, stored.wind.dir, transitionProgress);
    live.wind.critical = canonicalWindCritical(transitionProgress < 1 ? origin.wind.critical : stored.wind.critical);
    if(stored.wind.critical && transitionProgress >= 1) live.wind.critical = stored.wind.critical;
    live.windStep = windStepFromPercent(live.wind.percent);
    live.currentPattern = interpolateCurrentPattern(origin.currentPattern, stored.currentPattern, transitionProgress, control.governor);

    live.event = (stored.event && activation.event && windowContainsMinutes(activation.event, nowMinutes))
      ? deepCloneJSON(stored.event)
      : null;
    if(live.event){
      applyCriticalEventToWeather(live, live.event);
      live.tempF = temperatureFromContext(ctx, live.tempOffsetF, nw);
      live.tempC = toC(live.tempF);
      live.tempBand = tempBandFromF(live.tempF);
      live.precipType = resolvedPrecipType(ctx, live.tempF, live.rainfall);
    }

    live.stamp = stored.stamp;
    live.tick = stored.tick;
    return normalizeCurrentWeather(live);
  }

  function toC(f){ return Math.round((f-32)*5/9); }
  function toF(c){ return Math.round((c*9/5)+32); }
  function mphToKts(mph){ return Math.round((+mph||0) / 1.15078); }

  function historySnapshotEntry(cur){
    return {
      tick:cur.tick,
      stamp:cur.stamp,
      snapshot:deepCloneJSON(cur)
    };
  }

  function upsertHistoryEntries(entries, cur){
    var out = Array.isArray(entries) ? entries.slice() : [];
    var entry = historySnapshotEntry(cur);
    var tickValue = +entry.tick;
    var replaced = false;
    for(var i=out.length-1;i>=0;i--){
      if((+out[i].tick) === tickValue){
        out[i] = entry;
        replaced = true;
        break;
      }
    }
    if(!replaced) out.push(entry);
    if(out.length > HISTORY_ENTRY_LIMIT) out = out.slice(out.length - HISTORY_ENTRY_LIMIT);
    return out;
  }

  function applyTickMetadata(cur, t){
    var nw = nowFromTick(t);
    cur.tick = t;
    cur.stamp = stamp(nw);
    cur.period = periodKeyFromNow(nw);
    cur.season = (periodInfo(cur.period) || { season:seasonFromMonth(nw.month) }).season;
    return cur;
  }

  function ensureHistory(mule, region, locale){
    var h = getJSON(mule, AB_HIST(region, locale));
    if(!h || h.schema!=='dwt.weather.history.v1'){
      h = { schema:'dwt.weather.history.v1', entries:[] };
      setJSON(mule, AB_HIST(region, locale), h);
    }
    if(!Array.isArray(h.entries)) h.entries = [];
    return h;
  }

  function appendHistory(mule, region, locale, cur){
    var h = ensureHistory(mule, region, locale);
    h.entries = upsertHistoryEntries(h.entries, cur);
    setJSON(mule, AB_HIST(region, locale), h);
  }

  function storeCurrentAndHistory(mule, region, locale, cur){
    setJSON(mule, AB_CUR(region, locale), cur);
    appendHistory(mule, region, locale, cur);
  }

  function rootCurPath(region, locale){
    return 'current.'+region+'.'+locale;
  }

  function rootHistPath(region, locale){
    return 'history.'+region+'.'+locale;
  }

  function getRootCurrent(root, region, locale){
    var cur = weatherPathGet(root, rootCurPath(region, locale));
    return cur ? deepCloneJSON(cur) : null;
  }

  function setRootCurrent(root, region, locale, cur){
    weatherPathSet(root, rootCurPath(region, locale), deepCloneJSON(cur));
  }

  function ensureRootHistory(root, region, locale){
    var hist = weatherPathGet(root, rootHistPath(region, locale));
    if(!hist || hist.schema!=='dwt.weather.history.v1'){
      hist = { schema:'dwt.weather.history.v1', entries:[] };
      weatherPathSet(root, rootHistPath(region, locale), hist);
    }
    if(!Array.isArray(hist.entries)) hist.entries = [];
    return hist;
  }

  function appendRootHistory(root, region, locale, cur){
    var hist = ensureRootHistory(root, region, locale);
    hist.entries = upsertHistoryEntries(hist.entries, cur);
  }

  function getHistEntryAtTick(root, region, locale, t){
    var hist = ensureRootHistory(root, region, locale);
    for(var i=hist.entries.length-1;i>=0;i--){
      var entry = hist.entries[i];
      if((+entry.tick)===t) return entry;
    }
    return null;
  }

  function exactSnapshotAtTick(root, region, locale, t){
    var current = getRootCurrent(root, region, locale);
    if(current && (+current.tick) === t){
      return deepCloneJSON(current);
    }
    var exact = getHistEntryAtTick(root, region, locale, t);
    if(exact && exact.snapshot){
      return deepCloneJSON(exact.snapshot);
    }
    return null;
  }

  function getNearestEarlierHist(root, region, locale, t){
    var hist = ensureRootHistory(root, region, locale);
    if(!hist.entries.length) return null;
    var best = null;
    var bestTick = -1;
    for(var i=0;i<hist.entries.length;i++){
      var entry = hist.entries[i];
      var entryTick = +entry.tick;
      if(entryTick < t && entryTick > bestTick){
        best = entry;
        bestTick = entryTick;
      }
    }
    return best;
  }

  function eventActiveAtTick(snapshot, targetTick){
    snapshot = normalizeCurrentWeather(deepCloneJSON(snapshot || {}));
    if(!snapshot.event || typeof snapshot.event !== 'object') return null;
    var event = deepCloneJSON(snapshot.event);
    var startedTick = Math.round(+event.startedTick || 0);
    var endsTick = Math.round(+event.endsTick || 0);
    if(targetTick < startedTick || targetTick > endsTick) return null;
    event.startedTick = startedTick;
    event.endsTick = endsTick;
    event.remainingSegments = Math.max(1, endsTick - targetTick + 1);
    return event;
  }

  function selectAdjacentEvent(previousSnapshot, nextSnapshot, targetTick){
    var beforeEvent = eventActiveAtTick(previousSnapshot, targetTick);
    var afterEvent = eventActiveAtTick(nextSnapshot, targetTick);
    if(beforeEvent && afterEvent){
      var beforeKey = canonicalKey(beforeEvent.key || beforeEvent.name);
      var afterKey = canonicalKey(afterEvent.key || afterEvent.name);
      if(beforeKey === afterKey && normalizeCriticalSeverity(beforeEvent.severity) === normalizeCriticalSeverity(afterEvent.severity)){
        beforeEvent.startedTick = Math.min(+beforeEvent.startedTick || targetTick, +afterEvent.startedTick || targetTick);
        beforeEvent.endsTick = Math.max(+beforeEvent.endsTick || targetTick, +afterEvent.endsTick || targetTick);
        beforeEvent.remainingSegments = Math.max(1, beforeEvent.endsTick - targetTick + 1);
        return beforeEvent;
      }
    }
    return beforeEvent || afterEvent || null;
  }

  function bridgedStateFromAdjacentSnapshots(previousSnapshot, nextSnapshot, ctx){
    ctx = ctx || {};
    var governor = normalizeGovernorConfig((ctx.climateControl || {}).governor);
    var before = snapshotOriginState(previousSnapshot || {});
    var after = snapshotOriginState((nextSnapshot && nextSnapshot.origin) ? nextSnapshot.origin : nextSnapshot || before);
    var rainStep = stepTowards(before.rainStep, after.rainStep, governor.rainMaxStep, 0, 3);
    var rainfall = rainfallBandFromStep(rainStep);
    var skyStep = stepTowards(before.skyStep, after.skyStep, governor.skyMaxStep, 0, 4);
    var skies = skyStateFromStep(skyStep);
    skies = coerceSkiesForRainfall(rainfall, skies);
    rainfall = coerceRainfallForSkies(rainfall, skies);
    rainStep = rainfallStepFromBand(rainfall);
    skyStep = skyStepFromState(skies);
    var windStep = stepTowards(before.windStep, after.windStep, governor.windMaxStep, 0, 5);
    return {
      tempOffsetF: stepTowards(before.tempOffsetF, after.tempOffsetF, governor.temperatureMaxDeltaF, -80, 80),
      rainfall: rainfall,
      rainStep: rainStep,
      skies: skies,
      skyStep: skyStep,
      windStep: windStep,
      wind:{
        percent: windPercentFromStep(windStep),
        dir: stepDirToward(before.wind.dir || 'N', after.wind.dir || before.wind.dir || 'N', Math.max(1, governor.windMaxStep)),
        critical: canonicalWindCritical(after.wind.critical || before.wind.critical || '')
      },
      currentPattern: governedCurrentPatternToward(before.currentPattern || ctx.currentPattern, after.currentPattern || ctx.currentPattern, governor)
    };
  }

  function reconstructStoredSnapshotFromAdjacent(profile, region, locale, previousSnapshot, nextSnapshot, nw, targetTick){
    nw = nw || now();
    var ctx = resolveClimateContext(profile, locale, nw);
    var band = bandWindowForNow(nw);
    var sourceState = null;
    if(previousSnapshot && nextSnapshot){
      sourceState = bridgedStateFromAdjacentSnapshots(previousSnapshot, nextSnapshot, ctx);
    }else if(nextSnapshot){
      sourceState = snapshotOriginState((nextSnapshot && nextSnapshot.origin) ? nextSnapshot.origin : nextSnapshot);
    }else{
      return null;
    }

    var origin = snapshotOriginState(previousSnapshot || sourceState);
    var cur = emptyCurrent(region, locale);
    var wind = (sourceState.wind && typeof sourceState.wind === 'object' && !Array.isArray(sourceState.wind)) ? sourceState.wind : {};
    cur.period = ctx.periodKey;
    cur.season = ctx.season;
    cur.origin = origin;
    cur.currentPattern = sourceState.currentPattern ? normalizeSeasonalCurrent(sourceState.currentPattern) : (ctx.currentPattern ? deepCloneJSON(ctx.currentPattern) : null);
    cur.tempOffsetF = clamp(Math.round(+sourceState.tempOffsetF || 0), -80, 80);
    cur.rainfall = normalizeRainfallBand(sourceState.rainfall) || 'none';
    cur.rainStep = clamp(Math.round((sourceState.rainStep != null) ? +sourceState.rainStep : rainfallStepFromBand(cur.rainfall)), 0, 3);
    cur.skies = canonicalSkyState(sourceState.skies) || 'clear';
    cur.skyStep = clamp(Math.round((sourceState.skyStep != null) ? +sourceState.skyStep : skyStepFromState(cur.skies)), 0, 4);
    cur.windStep = clamp(Math.round((sourceState.windStep != null) ? +sourceState.windStep : windStepFromPercent(wind.percent)), 0, 5);
    cur.wind.percent = clamp((wind.percent != null) ? +wind.percent : windPercentFromStep(cur.windStep), 0, 100);
    cur.wind.dir = normalizeDir16(wind.dir || origin.wind.dir || 'N');
    cur.wind.critical = canonicalWindCritical(wind.critical || '');
    cur.skies = coerceSkiesForRainfall(cur.rainfall, cur.skies);
    cur.rainfall = coerceRainfallForSkies(cur.rainfall, cur.skies);
    cur.rainStep = rainfallStepFromBand(cur.rainfall);
    cur.skyStep = skyStepFromState(cur.skies);
    cur.windStep = windStepFromPercent(cur.wind.percent);
    cur.event = selectAdjacentEvent(previousSnapshot, nextSnapshot, targetTick);
    if(cur.event){
      applyCriticalEventToWeather(cur, cur.event);
    }
    cur.activation = buildActivationForSnapshot(origin, cur, ctx, nw, band.startHHMM, false);
    cur = finalizeStoredSnapshot(cur, ctx, nw, band.endHHMM);
    cur.quip = pickQuip(region, locale, materializeLiveWeather(cur, ctx, nw)) || '';
    cur.stamp = stamp(nw);
    cur.tick = tick(nw);
    return cur;
  }

  function governedCurrentPatternToward(originPattern, targetPattern, governor){
    targetPattern = targetPattern ? normalizeSeasonalCurrent(targetPattern) : null;
    if(!targetPattern) return null;
    originPattern = originPattern ? normalizeSeasonalCurrent(originPattern) : null;
    governor = normalizeGovernorConfig(governor || {});
    if(!originPattern) return deepCloneJSON(targetPattern);
    var profile = targetPattern.measurementProfile || originPattern.measurementProfile || normalizeWaterProfile({});
    var readings = {};
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var originReading = originPattern.readings[sampleKey] || originPattern.readings.mid;
      var targetReading = targetPattern.readings[sampleKey] || targetPattern.readings.mid;
      readings[sampleKey] = {
        direction: stepDirToward(originReading.direction, targetReading.direction, governor.currentDirectionMaxStep),
        temperatureF: Math.round(originReading.temperatureF + clamp(
          targetReading.temperatureF - originReading.temperatureF,
          -governor.currentTemperatureMaxDeltaF,
          governor.currentTemperatureMaxDeltaF
        )),
        strengthPct: clamp(Math.round(originReading.strengthPct + clamp(
          targetReading.strengthPct - originReading.strengthPct,
          -governor.currentStrengthMaxDeltaPct,
          governor.currentStrengthMaxDeltaPct
        )), 0, 100)
      };
    }
    return normalizeSeasonalCurrent({
      direction: stepDirToward(originPattern.direction, targetPattern.direction, governor.currentDirectionMaxStep),
      measurementProfile:profile,
      readings:readings
    }, profile);
  }

  function cloneCurrentPatternWithSetting(pattern, strengthPct, direction){
    pattern = normalizeSeasonalCurrent(pattern || {}, (pattern && pattern.measurementProfile) || {});
    strengthPct = clamp(Math.round(+strengthPct||0), 0, 100);
    direction = normalizeDir16(direction || pattern.direction || 'N');
    var readings = {};
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var reading = (pattern.readings && pattern.readings[sampleKey]) || pattern.readings.mid;
      readings[sampleKey] = {
        direction:direction,
        temperatureF:reading.temperatureF,
        strengthPct:strengthPct
      };
    }
    return normalizeSeasonalCurrent({
      direction:direction,
      measurementProfile:pattern.measurementProfile,
      readings:readings
    }, pattern.measurementProfile);
  }

  function buildGoalWindow(startMinutes, endMinutes){
    startMinutes = clamp(Math.round(+startMinutes||0), 0, 1439);
    endMinutes = clamp(Math.round(+endMinutes||0), startMinutes, 1439);
    return {
      startHHMM: minutesToHHMM(startMinutes),
      endHHMM: minutesToHHMM(endMinutes)
    };
  }

  function buildActivationForSnapshot(origin, goal, ctx, nw, startHHMM, immediate){
    var band = bandWindowForNow(nw);
    var activationCfg = normalizeActivationConfig((((ctx || {}).climateControl) || {}).activation);
    var transitionStart = Math.max(band.startMinutes, hhmmToMinutes(startHHMM, band.startHHMM));
    var transitionEnd = immediate ? transitionStart : band.endMinutes;
    var skyStart = transitionStart;
    var precipStart = transitionStart;

    if(!immediate){
      if(goal.skyStep !== origin.skyStep){
        skyStart = randInt(transitionStart, band.endMinutes);
      }
      if(goal.rainStep !== origin.rainStep){
        var skyLead = activationCfg.skyLeadMinutes;
        var latestSkyStart = Math.max(transitionStart, band.endMinutes - skyLead.min);
        if(goal.skyStep !== origin.skyStep){
          skyStart = randInt(transitionStart, latestSkyStart);
        }
        var precipMin = Math.min(band.endMinutes, skyStart + skyLead.min);
        var precipMax = Math.min(band.endMinutes, skyStart + skyLead.max);
        precipStart = randInt(precipMin, Math.max(precipMin, precipMax));
      }
    }

    var activation = {
      transitionStartHHMM: minutesToHHMM(transitionStart),
      transitionEndHHMM: minutesToHHMM(transitionEnd),
      skies: buildGoalWindow(goal.skyStep === origin.skyStep ? transitionStart : skyStart, band.endMinutes),
      precipitation: buildGoalWindow(goal.rainStep === origin.rainStep ? transitionStart : precipStart, band.endMinutes),
      event:null
    };

    if(goal.event){
      var eventStart = transitionStart;
      var eventEnd = band.endMinutes;
      if(!immediate && (+goal.event.startedTick) === tick(nw)){
        eventStart = Math.min(
          band.endMinutes,
          transitionStart + randInt(activationCfg.eventStartOffsetMinutes.min, activationCfg.eventStartOffsetMinutes.max)
        );
      }
      if((+goal.event.endsTick) === tick(nw)){
        eventEnd = Math.max(
          eventStart,
          band.endMinutes - randInt(activationCfg.eventTailBufferMinutes.min, activationCfg.eventTailBufferMinutes.max)
        );
      }
      activation.event = buildGoalWindow(eventStart, eventEnd);
      if(goal.event.stats && goal.event.stats.skies != null){
        activation.skies = buildGoalWindow(Math.min(hhmmToMinutes(activation.skies.startHHMM, activation.skies.startHHMM), eventStart), eventEnd);
      }
      if(goal.event.stats && goal.event.stats.rainfall != null){
        activation.precipitation = buildGoalWindow(eventStart, eventEnd);
      }
    }

    return normalizeActivationState(activation);
  }

  function finalizeStoredSnapshot(cur, ctx, nw, goalHHMM){
    var goalNow = copyNowAtHHMM(nw, goalHHMM || bandWindowForNow(nw).endHHMM);
    cur = normalizeCurrentWeather(cur);
    cur.tempF = temperatureFromContext(ctx, cur.tempOffsetF, goalNow);
    cur.tempC = toC(cur.tempF);
    cur.tempBand = tempBandFromF(cur.tempF);
    cur.precipType = resolvedPrecipType(ctx, cur.tempF, cur.rainfall);
    cur.rainStep = rainfallStepFromBand(cur.rainfall);
    cur.skyStep = skyStepFromState(cur.skies);
    cur.windStep = windStepFromPercent((cur.wind && cur.wind.percent) || 0);
    return normalizeCurrentWeather(cur);
  }

  function generateFresh(profile, region, locale, nw){
    nw = nw || now();
    var ctx = resolveClimateContext(profile, locale, nw);
    var band = bandWindowForNow(nw);
    var governor = normalizeGovernorConfig((ctx.climateControl || {}).governor);
    var cur = emptyCurrent(region, locale);
    cur.period = ctx.periodKey;
    cur.season = ctx.season;
    cur.currentPattern = ctx.currentPattern ? deepCloneJSON(ctx.currentPattern) : null;
    cur.tempOffsetF = clamp(
      rollFromWeights(derivedStepDeltaWeights(((ctx.timeofday || {}).temperature || 1)), 0),
      -governor.temperatureMaxDeltaF,
      governor.temperatureMaxDeltaF
    );
    cur.rainStep = pickTargetRainfallStep(ctx);
    cur.rainfall = rainfallBandFromStep(cur.rainStep);
    cur.skyStep = pickTargetSkyStep(ctx, cur.rainStep);
    cur.skies = skyStateFromStep(cur.skyStep);
    cur.windStep = windStepFromPercent(pickTargetWindPercent(ctx, nw));
    cur.wind.percent = windPercentFromStep(cur.windStep);
    cur.wind.dir = pickTargetWindDir(ctx);
    cur.wind.critical = '';
    if(ctx.critical.chancePct && r1_100() <= ctx.critical.chancePct){
      var event = buildCriticalEvent(profile, ctx, cur, nw);
      if(event) applyCriticalEventToWeather(cur, event);
    }
    cur.origin = snapshotOriginState(cur);
    cur.activation = buildActivationForSnapshot(cur.origin, cur, ctx, nw, band.startHHMM, false);
    cur = finalizeStoredSnapshot(cur, ctx, nw, band.endHHMM);
    cur.quip = pickQuip(region, locale, materializeLiveWeather(cur, ctx, nw)) || '';
    cur.stamp = stamp(nw);
    cur.tick = tick(nw);
    return cur;
  }

  function updateIncremental(profile, region, locale, prev, nw){
    nw = nw || now();
    var ctx = resolveClimateContext(profile, locale, nw);
    var segDrift = effectiveTimeofdayDrift(ctx, nw);
    var band = bandWindowForNow(nw);
    var governor = normalizeGovernorConfig((ctx.climateControl || {}).governor);
    var origin = snapshotOriginState(prev || emptyCurrent(region, locale));
    var cur = prev ? deepCloneJSON(prev) : emptyCurrent(region, locale);
    cur.period = ctx.periodKey;
    cur.season = ctx.season;
    cur.origin = origin;
    cur.currentPattern = governedCurrentPatternToward(origin.currentPattern || ctx.currentPattern, ctx.currentPattern, governor);
    cur.tempOffsetF = clamp(
      origin.tempOffsetF + clamp(
        rollFromWeights(derivedStepDeltaWeights(segDrift.temperature), 0),
        -governor.temperatureMaxDeltaF,
        governor.temperatureMaxDeltaF
      ),
      -80,
      80
    );

    var targetRainStep = pickTargetRainfallStep(ctx);
    cur.rainStep = stepTowards(origin.rainStep, targetRainStep, governor.rainMaxStep, 0, 3);
    cur.rainfall = rainfallBandFromStep(cur.rainStep);

    var targetSkyStep = pickTargetSkyStep(ctx, cur.rainStep);
    cur.skyStep = stepTowards(origin.skyStep, targetSkyStep, governor.skyMaxStep, 0, 4);
    cur.skies = skyStateFromStep(cur.skyStep);
    cur.skies = coerceSkiesForRainfall(cur.rainfall, cur.skies);
    cur.rainfall = coerceRainfallForSkies(cur.rainfall, cur.skies);
    cur.rainStep = rainfallStepFromBand(cur.rainfall);
    cur.skyStep = skyStepFromState(cur.skies);

    var targetWindStep = windStepFromPercent(pickTargetWindPercent(ctx, nw));
    cur.windStep = stepTowards(origin.windStep, targetWindStep, governor.windMaxStep, 0, 5);
    cur.wind.percent = windPercentFromStep(cur.windStep);
    cur.wind.dir = origin.wind.dir || pickTargetWindDir(ctx);
    if(r1_100() <= segDrift.directionChangePct){
      cur.wind.dir = stepDirToward(origin.wind.dir || pickTargetWindDir(ctx), pickTargetWindDir(ctx), Math.max(1, governor.windMaxStep));
    }
    cur.wind.critical = '';

    cur.event = prev && prev.event ? deepCloneJSON(prev.event) : null;
    if(cur.event && typeof cur.event === 'object'){
      cur.event.remainingSegments = Math.max(0, Math.round(+cur.event.remainingSegments||0) - 1);
      if(cur.event.remainingSegments < 1) cur.event = null;
    }
    if(cur.event){
      applyCriticalEventToWeather(cur, cur.event);
    }else if(ctx.critical.chancePct && r1_100() <= ctx.critical.chancePct){
      var event = buildCriticalEvent(profile, ctx, cur, nw);
      if(event) applyCriticalEventToWeather(cur, event);
    }

    cur.activation = buildActivationForSnapshot(origin, cur, ctx, nw, band.startHHMM, false);
    cur = finalizeStoredSnapshot(cur, ctx, nw, band.endHHMM);
    cur.quip = pickQuip(region, locale, materializeLiveWeather(cur, ctx, nw)) || '';
    cur.stamp = stamp(nw);
    cur.tick = tick(nw);
    return cur;
  }

  // ----------------------------
  // Narrative/weather line builders
  // ----------------------------
  function describeNarratedTemperature(cur, units){
    if((units||'imperial') === 'metric'){
      return cur.tempC + ' degrees celsius';
    }
    return cur.tempF + ' degrees fahrenheit';
  }

  function describeTempAdj(cur){
    var t = canonicalKey(cur.tempBand);
    if(t==='frigid') return 'frigid';
    if(t==='cold') return 'cold';
    if(t==='mild') return 'mild';
    if(t==='warm') return 'warm';
    if(t==='hot') return 'hot';
    return 'mild';
  }

  function describeSkies(cur){
    var sky = canonicalSkyState(cur.skies);
    if(sky==='clear') return 'clear';
    if(sky==='partly_cloudy') return 'partly cloudy';
    if(sky==='cloudy') return 'cloudy';
    if(sky==='overcast') return 'overcast';
    if(sky==='stormy') return 'stormy';
    return sky || 'clear';
  }

  function describePrecipitation(cur, rl){
    var band = normalizeRainfallBand(cur && cur.rainfall);
    if(!band || band === 'none') return '';
    var environment = activeEnvironment(rl);
    var typeKey = canonicalKey((cur && cur.precipType) || '');
    if(!typeKey || typeKey === 'auto' || typeKey === 'none'){
      if(environment === 'subterranean') typeKey = 'drip';
      else if((cur && cur.tempF) <= 32) typeKey = 'snow';
      else if((cur && cur.tempF) <= 36) typeKey = 'sleet';
      else typeKey = 'rain';
    }
    var type = String(typeKey || 'rain').replace(/_/g, ' ').trim();
    return band + ' ' + (type || 'rain');
  }

  function activeEnvironment(rl){
    var localeKey = canonicalKey((rl&&rl.locale)||'');
    if(rl && rl.localeDef && rl.localeDef.environment){
      return canonicalKey(rl.localeDef.environment);
    }
    if(localeKey === 'underwater') return 'underwater';
    if(localeKey === 'underdark') return 'subterranean';
    return 'surface';
  }

  function locationSupportsSurfaceChop(rl){
    var localeKey = canonicalKey((rl && rl.locale) || ((rl && rl.localeDef && rl.localeDef.key) || ''));
    var biomeKey = canonicalKey((rl && rl.localeDef && rl.localeDef.biome) || '');
    if(activeEnvironment(rl) !== 'surface') return false;
    if(rl && rl.depthToken && !rl.depthIsElevation) return false;
    if(localeKey === 'offshore' || localeKey === 'coastal') return true;
    return biomeKey === 'ocean' || biomeKey === 'coastline';
  }

  function chopBandFromWeather(cur, rl){
    if(!locationSupportsSurfaceChop(rl)) return 'none';
    cur = normalizeCurrentWeather(cur || {});
    return chopBandFromWindPercent((cur && cur.wind && cur.wind.percent) || 0);
  }

  function chopNarrativeSentence(chopBand){
    chopBand = normalizeChopBand(chopBand);
    if(chopBand === 'none') return 'The sea surface is smooth, with no chop.';
    return 'Sea chop is ' + chopBand + '.';
  }

  function buildVerticalIntro(locale, units, rl){
    var hasDepth = !!(rl && rl.depthToken);
    if(!hasDepth){
      if(locale === 'underwater' || locale === 'underdark' || locale === 'subterranean') return 'At an unknown depth';
      return '';
    }
    var preferred = formatNarratedPreferredDepthLabel((rl && rl.depthMeters) || 0, units);
    if(rl && rl.depthIsElevation) return 'At an elevation of ' + preferred;
    if(locale === 'underwater'){
      return 'At a depth of ' + formatNarratedFathomsWithPreferredLabel((rl && rl.depthMeters) || 0, units);
    }
    if(locale === 'underdark' || locale === 'subterranean'){
      return 'At approximately ' + formatNarratedSubterraneanDepthLabel((rl && rl.depthMeters) || 0, units) + ' below the surface';
    }
    return 'At a depth of ' + preferred + ' below the surface';
  }

  function renderWeatherForLocation(cur, rl){
    var render = normalizeCurrentWeather(deepCloneJSON(cur || {}));
    if(!render || !rl) return render;
    if(activeEnvironment(rl) !== 'underwater') return render;
    var depthReading = currentReadingAtLocationDepth(render.currentPattern, rl);
    if(!depthReading) return render;
    var representativeTempF = Math.round((render.currentPattern && render.currentPattern.temperatureF != null)
      ? +render.currentPattern.temperatureF
      : +render.tempF || 55);
    render.tempF = clamp(Math.round(render.tempF + (depthReading.temperatureF - representativeTempF)), -40, 140);
    render.tempC = toC(render.tempF);
    render.tempBand = tempBandFromF(render.tempF);
    if(!render.wind.critical){
      render.wind.percent = clamp(Math.round(+depthReading.strengthPct || 0), 0, 100);
      render.wind.dir = normalizeDir16(depthReading.direction || render.wind.dir || 'N');
      render.windStep = windStepFromPercent(render.wind.percent);
    }
    render.locationDepthReading = depthReading;
    return render;
  }

  function describeCurrentStrength(percent, critical){
    critical = canonicalWindCritical(critical||'');
    percent = clamp(+percent||0, 0, 100);
    if(percent === 0) return 'dead calm';
    if(critical === 'crit_severe') return 'violent';
    if(critical === 'crit_heavy') return 'severe';
    if(critical === 'crit_moderate') return 'heavy';
    if(critical === 'crit_light') return 'strong';
    if(percent <= 20) return 'light';
    if(percent <= 40) return 'steady';
    if(percent <= 60) return 'moderate';
    if(percent <= 80) return 'strong';
    return 'heavy';
  }

  function describeSubterraneanAirflow(percent, critical){
    critical = canonicalWindCritical(critical||'');
    percent = clamp(+percent||0, 0, 100);
    if(percent === 0) return 'dead calm';
    if(critical === 'crit_severe') return 'violent';
    if(critical === 'crit_heavy') return 'severe';
    if(critical === 'crit_moderate') return 'heavy';
    if(critical === 'crit_light') return 'strong';
    if(percent <= 20) return 'a faint draft';
    if(percent <= 40) return 'a steady draft';
    if(percent <= 60) return 'a moderate draft';
    if(percent <= 80) return 'a strong draft';
    return 'a heavy draft';
  }

  function formatVisibilityRangeLabel(rangeMeters, units){
    rangeMeters = Math.max(1, Math.round(+rangeMeters || 0));
    if((units || 'imperial') === 'metric') return rangeMeters + ' m';
    return Math.round(rangeMeters * 3.28084) + ' ft';
  }

  function underwaterVisibilityProfile(cur, units, rl){
    var pattern = cur && cur.currentPattern;
    var profile = waterProfileForLocation(rl, pattern);
    var modelKey = canonicalKey((profile && profile.bodyType) || 'reef');
    var model = UNDERWATER_VISIBILITY_MODELS[modelKey] || UNDERWATER_VISIBILITY_MODELS.reef;
    var requestedDepthMeters = Math.max(0, Math.round(+((rl && rl.depthMeters) || ((pattern && pattern.depthFeet) ? (+pattern.depthFeet * 0.3048) : 0))));
    var critical = canonicalWindCritical((cur && cur.wind && cur.wind.critical) || '');
    var zoneKey = 'sunlit';
    if(requestedDepthMeters > model.twilightMaxMeters) zoneKey = 'aphotic';
    else if(requestedDepthMeters > model.sunlitMaxMeters) zoneKey = 'twilight';
    var zoneFactor = (zoneKey === 'aphotic') ? 0.15 : (zoneKey === 'twilight' ? 0.5 : 1);
    var criticalFactor = 1;
    if(critical === 'crit_light') criticalFactor = 0.8;
    else if(critical === 'crit_moderate') criticalFactor = 0.6;
    else if(critical === 'crit_heavy') criticalFactor = 0.4;
    else if(critical === 'crit_severe') criticalFactor = 0.25;
    var rangeMeters = Math.max(1, Math.round(model.baseRangeMeters * zoneFactor * criticalFactor));
    var zoneLabel = 'sunlit';
    var narrative = 'Ambient light still reaches this depth, and visibility remains workable.';
    if(zoneKey === 'twilight'){
      zoneLabel = 'blue-green twilight';
      narrative = 'Ambient light has fallen into a blue-green twilight, and visibility is short.';
    }else if(zoneKey === 'aphotic'){
      zoneLabel = 'aphotic darkness';
      narrative = 'Ambient light is effectively gone here, leaving the water dark unless a light source is carried.';
    }else if(model.baseRangeMeters <= 8){
      zoneLabel = 'sunlit but turbid water';
      narrative = 'Ambient light still reaches this depth, but suspended matter keeps visibility short.';
    }
    if(critical){
      narrative += ' The current disturbance cuts it down further.';
    }
    return {
      zoneKey:zoneKey,
      zoneLabel:zoneLabel,
      rangeMeters:rangeMeters,
      rangeLabel:formatVisibilityRangeLabel(rangeMeters, units),
      bodyLabel:model.bodyLabel,
      narrative:narrative
    };
  }

  function underdarkVisibilityProfile(cur){
    var narrative = 'Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.';
    if(cur && cur.event){
      narrative += ' The active hazard further obscures the passages.';
    }
    return {
      narrative:narrative,
      detail:'Ambient visibility is dark by default; only carried light, bioluminescence, or darkvision pushes beyond it.'
    };
  }

  function formatSecondarySpeedLabel(mph, units){
    mph = Math.round(+mph||0);
    if((units||'imperial') === 'metric') return Math.round(mph * 1.60934) + ' km/h';
    return mph + ' mph';
  }

  function formatKnotsFirstSpeedLabel(mph, units){
    return mphToKts(mph) + ' kts (' + formatSecondarySpeedLabel(mph, units) + ')';
  }

  function buildNarrative(cur, units, rl){
    cur = normalizeCurrentWeather(cur);
    var temp = describeNarratedTemperature(cur, units);
    var adj  = describeTempAdj(cur);
    var skies = describeSkies(cur);
    var precipitation = describePrecipitation(cur, rl);
    var hasPrecip = !!precipitation;
    var environment = activeEnvironment(rl);
    var intro = buildVerticalIntro(environment, units, rl);
    var line = '';

    if(environment === 'underwater'){
      line = (intro || 'At an unknown depth') + ', the water feels ' + adj;
    }else if(environment === 'subterranean'){
      line = (intro || 'At an unknown depth') + ', the air feels ' + adj;
    }else{
      if(intro){
        line = intro + ', the temperature is ' + temp + ', the air feels ' + adj + ', and the skies are ' + skies;
      }else{
        line = 'At ' + temp + ', the temperature is ' + adj + ', and the skies are ' + skies;
      }
      if(hasPrecip){
        line += ' with ' + precipitation;
      }
    }

    if(environment === 'subterranean' && hasPrecip){
      line += ', and ' + precipitation + ' clings to the passages';
    }

    var percent = clamp(+((cur&&cur.wind&&cur.wind.percent)||0),0,100);
    var dir = normalizeDir16((cur&&cur.wind&&cur.wind.dir)||'N');
    var critical = canonicalWindCritical((cur&&cur.wind&&cur.wind.critical)||'');
    var mph = criticalWindMph(critical);
    if(!mph){
      if(percent===0) mph = 0;
      else if(percent<=20) mph = 3;
      else if(percent<=40) mph = 6;
      else if(percent<=60) mph = 9;
      else if(percent<=80) mph = 12;
      else mph = 15;
    }
    if(percent===0){
      if(environment === 'underwater') line += ' and the current is dead calm.';
      else if(environment === 'subterranean') line += '. The airflow is dead calm.';
      else line += '. Wind is dead calm.';
    }else if(environment === 'underwater'){
      line += ' and the current is ' + describeCurrentStrength(percent, critical) + '.';
    }else if(environment === 'subterranean'){
      line += '. The airflow is ' + describeSubterraneanAirflow(percent, critical) + '.';
    }else{
      line += '. Wind is coming from the ' + dirToWords16(dir) + ' at about ' + formatKnotsFirstSpeedLabel(mph, units) + '.';
    }
    if(locationSupportsSurfaceChop(rl)){
      line += ' ' + chopNarrativeSentence(chopBandFromWeather(cur, rl));
    }
    if(environment === 'underwater'){
      line += ' ' + underwaterVisibilityProfile(cur, units, rl).narrative;
    }else if(environment === 'subterranean'){
      line += ' ' + underdarkVisibilityProfile(cur).narrative;
    }

    if(cur.event){
      line += ' A ' + normalizeCriticalSeverity(cur.event.severity) + ' ' + lower(String(cur.event.name||'critical event')).replace(/_/g,' ') + ' is in progress.';
    }
    return line;
  }

  function weightedValuesLabel(weights, formatter){
    weights = Array.isArray(weights) ? weights : [];
    var out = [];
    for(var i=0;i<weights.length;i++){
      var row = weights[i] || {};
      var label = formatter ? formatter(row.value) : String(row.value);
      if(!label) continue;
      out.push(label + ' ' + Math.max(0, Math.round(+row.weight||0)) + '%');
    }
    return out.join(', ');
  }

  function formatTemperatureLabel(tempF, units){
    return (units === 'metric')
      ? (toC(tempF) + ' C')
      : (Math.round(tempF) + ' F');
  }

  function currentSampleDepthLabel(sample, profile, units){
    var depthMeters = Math.round((+((sample||{}).depthFeet)||0) * 0.3048);
    if(sample && sample.depthFeet <= 0) return 'surface';
    if(profile && profile.sampleMode === 'fixed_fathoms' && units !== 'metric'){
      return formatDepthFathomsLabel(depthMeters);
    }
    return (units === 'metric')
      ? formatDepthMetricLabel(depthMeters)
      : formatDepthImperialLabel(depthMeters, false);
  }

  function formatSignedInteger(n){
    n = Math.round(+n||0);
    return (n > 0 ? '+' : '') + String(n);
  }

  function currentPatternLines(pattern, units, rl){
    pattern = pattern ? normalizeSeasonalCurrent(pattern, pattern.measurementProfile || {}) : null;
    if(!pattern || !(pattern.strengthPct > 0)) return ['Seasonal current: none.'];
    var profile = pattern.measurementProfile || normalizeWaterProfile({});
    var environment = activeEnvironment(rl);
    var depthMeters = Math.round((+pattern.depthFeet||0) * 0.3048);
    var representativeDepthLabel = (environment === 'underwater')
      ? formatFathomsWithPreferredLabel(depthMeters, units)
      : ((profile.sampleMode === 'fixed_fathoms' && units !== 'metric')
        ? formatDepthFathomsLabel(depthMeters)
        : ((units === 'metric') ? formatDepthMetricLabel(depthMeters) : formatDepthImperialLabel(depthMeters, false)));
    var sampleParts = [];
    for(var i=0;i<CURRENT_SAMPLE_KEYS.length;i++){
      var sampleKey = CURRENT_SAMPLE_KEYS[i];
      var reading = pattern.readings[sampleKey];
      if(!reading) continue;
      var depthLabel = (sampleKey === 'surface')
        ? ''
        : ((environment === 'underwater')
          ? (' at ' + formatFathomsWithPreferredLabel(reading.depthMeters, units))
          : (' at ' + currentSampleDepthLabel(reading, profile, units)));
      sampleParts.push(titleCaseWords(sampleKey) + ' ' + formatTemperatureLabel(reading.temperatureF, units)
        + ' / ' + describeCurrentStrength(reading.strengthPct, '')
        + depthLabel);
    }
    var summary = (environment === 'underwater')
      ? ('Seasonal current: ' + describeCurrentStrength(pattern.strengthPct, '')
        + ', representative flow at ' + representativeDepthLabel + ', water temperature about ' + formatTemperatureLabel(pattern.temperatureF, units) + '.')
      : ('Seasonal current: ' + describeCurrentStrength(pattern.strengthPct, '') + ' from the ' + dirToWords16(pattern.direction)
        + ', representative flow at ' + representativeDepthLabel + ', water temperature about ' + formatTemperatureLabel(pattern.temperatureF, units) + '.');
    return [
      summary,
      'Water profile: ' + titleCaseWords(String(profile.bodyType||'water').replace(/_/g,' '))
        + ', total depth ' + (environment === 'underwater'
          ? formatFathomsWithPreferredLabel(Math.round((+profile.totalDepthFeet||0) * 0.3048), units)
          : ((units === 'metric')
            ? formatDepthMetricLabel(Math.round((+profile.totalDepthFeet||0) * 0.3048))
            : formatDepthImperialLabel(Math.round((+profile.totalDepthFeet||0) * 0.3048), false)))
        + ', samples ' + sampleParts.join('; ') + '.'
    ];
  }

  function subsurfaceObservationLines(cur, units, rl){
    var environment = activeEnvironment(rl);
    if(environment === 'underwater'){
      var render = renderWeatherForLocation(cur, rl);
      var reading = render && render.locationDepthReading ? render.locationDepthReading : currentReadingAtLocationDepth(render && render.currentPattern, rl);
      var visibility = underwaterVisibilityProfile(render, units, rl);
      var lines = [];
      if(reading){
        lines.push('Page-depth estimate: ' + formatFathomsWithPreferredLabel(reading.depthMeters, units)
          + ', water temperature about ' + formatTemperatureLabel(render.tempF, units)
          + ', current ' + describeCurrentStrength((render.wind || {}).percent, (render.wind || {}).critical)
          + ' from the ' + dirToWords16((render.wind || {}).dir || 'N') + '.');
      }
      lines.push('Ambient light: ' + visibility.zoneLabel + '; visibility about ' + visibility.rangeLabel + ' in ' + visibility.bodyLabel + '.');
      return lines;
    }
    if(environment === 'subterranean'){
      var visibilityNote = underdarkVisibilityProfile(cur);
      return [
        visibilityNote.detail + (cur && cur.event ? ' Active hazards can reduce it further.' : ''),
        'Airflow model: stable passages default to dead calm, with only brief pressure-driven drafts outside of critical events.'
      ];
    }
    return [];
  }

  function activeEventLine(cur){
    cur = normalizeCurrentWeather(cur);
    if(!cur.event) return 'Critical event: none active.';
    var event = cur.event;
    var stats = event.stats || {};
    var bits = [
      normalizeCriticalSeverity(event.severity) + ' ' + String(event.name||event.key||'critical event'),
      (Math.max(0, Math.round(+event.remainingSegments||0)) + ' segment(s) remaining')
    ];
    if(stats.rangeMiles != null) bits.push(Math.round(+stats.rangeMiles||0) + ' mi range');
    if(stats.saveDc != null) bits.push('DC ' + Math.round(+stats.saveDc||0));
    if(String(stats.damage||'').trim() && String(stats.damage||'').trim() !== '0'){
      bits.push(String(stats.damage).trim() + ' ' + ((stats.damageTypes||[]).join('/') || 'damage'));
    }
    return 'Critical event: ' + bits.join(' | ') + '.';
  }

  function windowLabel(window){
    if(!window) return 'none';
    return normalizeHHMM(window.startHHMM, '0000') + '-' + normalizeHHMM(window.endHHMM, '2359');
  }

  function buildWeatherDetails(profile, rl, cur, units){
    var nw = now();
    var ctx = resolveClimateContext(profile, rl.locale, nw);
    var environment = activeEnvironment(rl);
    var renderCur = renderWeatherForLocation(cur, rl);
    var diurnal = normalizeDiurnalConfig((ctx.climateControl || {}).diurnal);
    var governor = normalizeGovernorConfig((ctx.climateControl || {}).governor);
    var avgLabel = (units === 'metric') ? (toC(ctx.temperature.avgF) + ' C') : (Math.round(ctx.temperature.avgF) + ' F');
    var lowLabel = (units === 'metric') ? (toC(ctx.temperature.lowF) + ' C') : (Math.round(ctx.temperature.lowF) + ' F');
    var highLabel = (units === 'metric') ? (toC(ctx.temperature.highF) + ' C') : (Math.round(ctx.temperature.highF) + ' F');
    var periodMeta = periodInfo(ctx.periodKey) || { label:ctx.periodKey };
    var flowSection;
    if(environment === 'underwater'){
      flowSection = {
        title:'Current Model',
        items:[
          'Underwater locales derive current strength and direction from seasonal current readings and the locale waterProfile rather than from the surface wind table.',
          'When a page includes a depth token, the weather line, detail panel, and windsock render against the active depth sample instead of the representative locale midpoint.'
        ]
      };
    }else if(environment === 'subterranean'){
      flowSection = {
        title:'Airflow',
        items:[
          'Underdark airflow is modeled as cave ventilation rather than open-air wind. Stable passages default to dead calm, and only brief drafts or critical events lift the windsock above ud_dead_calm.',
          'Draft direction bias: ' + weightedValuesLabel(ctx.wind.directionWeights, function(v){ return dirToWords16(normalizeDir16(v)); }) + '.',
          'Legacy strength table: ' + weightedValuesLabel(ctx.wind.strengthWeights, function(v){ return windPercentFromStep(windStepFromPercent(v)) + '%'; }) + ' (interpreted as draft bias, not as open-air wind speed).'
        ]
      };
    }else{
      flowSection = {
        title:'Wind',
        items:[
          'Prevailing wind: ' + weightedValuesLabel(ctx.wind.directionWeights, function(v){ return dirToWords16(normalizeDir16(v)); }) + '.',
          'Wind strength table: ' + weightedValuesLabel(ctx.wind.strengthWeights, function(v){ return windPercentFromStep(windStepFromPercent(v)) + '%'; }) + '.'
        ]
      };
      if(locationSupportsSurfaceChop(rl)){
        flowSection.items.push(
          'Chop: ' + titleCaseWords(chopBandFromWeather(renderCur, rl))
            + ' (derived from the live local wind band; dead calm forces none, and setting chop raises or lowers wind to the nearest compliant band).'
        );
      }
    }
    var sections = [
      {
        title:'Climate',
        items:[
          'Climate anchor: ' + periodMeta.label + ' baseline ' + avgLabel + ' average'
            + ' (' + lowLabel + ' to ' + highLabel + '), precipitation chance '
            + Math.round(ctx.precipitation.chancePct) + '%.',
          'Diurnal control: low near ' + diurnal.lowTimeHHMM + ', high near ' + diurnal.highTimeHHMM
            + '; exact clock time drives the live temperature inside the current band.',
          'Drift per segment: temperature ' + ctx.drift.temperature + ', precipitation ' + ctx.drift.precipitation
            + ', skies ' + ctx.drift.skies + ', wind ' + ctx.drift.wind + ', direction shift ' + ctx.drift.directionChangePct + '%.',
          'Governor caps: temperature ' + governor.temperatureMaxDeltaF + 'F, rain ' + governor.rainMaxStep
            + ' step, skies ' + governor.skyMaxStep + ' step, wind ' + governor.windMaxStep
            + ' step, current strength ' + governor.currentStrengthMaxDeltaPct + '%, current temperature '
            + governor.currentTemperatureMaxDeltaF + 'F, current direction ' + governor.currentDirectionMaxStep + ' compass step(s).',
          'Current segment drift (' + titleCaseWords(ctx.timeofday.label) + '): temp drift ' + formatSignedInteger(ctx.timeofday.raw.temperatureDelta)
            + ', precip drift ' + formatSignedInteger(ctx.timeofday.raw.precipitationDelta)
            + ', sky drift ' + formatSignedInteger(ctx.timeofday.raw.skiesDelta)
            + ', wind drift ' + formatSignedInteger(ctx.timeofday.raw.windDelta)
            + ', wind strength ' + formatSignedInteger(ctx.timeofday.windStrengthDeltaPct)
            + '%, direction shift ' + ctx.timeofday.directionChangePct + '%.'
        ]
      },
      flowSection
    ];
    var subsurfaceItems = subsurfaceObservationLines(cur, units, rl);
    if(subsurfaceItems.length){
      sections.push({
        title:'Subsurface',
        items:subsurfaceItems
      });
    }
    if(cur && cur.activation){
      sections.push({
        title:'Activation Windows',
        items:[
          'Skies: ' + windowLabel(cur.activation.skies) + '.',
          'Precipitation: ' + windowLabel(cur.activation.precipitation) + '.',
          'Critical event: ' + windowLabel(cur.activation.event) + '.'
        ]
      });
    }
    if(ctx.locale && ctx.locale.useSeasonalCurrent){
      sections.push({
        title:'Seasonal Current',
        items:currentPatternLines(cur.currentPattern || ctx.currentPattern, units, rl)
      });
    }
    sections.push({
      title:'Critical Event',
      items:[activeEventLine(cur)]
    });
    return {
      summary:buildNarrative(renderCur, units, rl),
      sections:sections
    };
  }

  function renderWeatherDetailSections(details){
    details = details || {};
    var sections = Array.isArray(details.sections) ? details.sections : [];
    var html = '';
    for(var i=0;i<sections.length;i++){
      var section = sections[i] || {};
      var items = Array.isArray(section.items) ? section.items.filter(function(item){ return !!String(item||'').trim(); }) : [];
      if(!items.length) continue;
      html += '<div style="margin-top:8px;"><b>' + esc(section.title || 'Details') + '</b><ul style="margin:4px 0 0 18px;padding:0;">';
      for(var j=0;j<items.length;j++){
        html += '<li>' + esc(items[j]) + '</li>';
      }
      html += '</ul></div>';
    }
    return html;
  }

  function renderWeatherDetailsHtml(rl, details){
    details = details || {};
    var html = '<div><b>' + esc(String((rl && rl.mapname) || 'Weather')) + '</b>';
    if(details.summary){
      html += '<div style="margin-top:6px;">' + esc(details.summary) + '</div>';
    }
    html += renderWeatherDetailSections(details);
    html += '</div>';
    return html;
  }

  function buildWeatherLine(cur, units, rl){
    if(!cur) return '';
    return buildNarrative(renderWeatherForLocation(cur, rl||null), units||'imperial', rl||null);
  }

  function weatherLine(mule, region, locale, cur, units, rl){
    var render = cur;
    if(render && render.activation && mule){
      var profile = loadRegionProfile(mule, region);
      if(profile){
        render = materializeLiveWeather(render, resolveClimateContext(profile, locale, now()), now());
      }
    }
    return buildWeatherLine(render, units, rl||null);
  }

  function buildWeatherQuip(region, locale, cur){
    var q = String((cur&&cur.quip)||'').trim();
    if(q) return q;
    return pickQuip(region, locale, cur) || '';
  }

  function weatherQuipLine(mule, region, locale, cur){
    var render = cur;
    if(render && render.activation && mule){
      var profile = loadRegionProfile(mule, region);
      if(profile){
        render = materializeLiveWeather(render, resolveClimateContext(profile, locale, now()), now());
      }
    }
    return buildWeatherQuip(region, locale, render);
  }

  // ----------------------------
  // Windsock mapping and updates
  // ----------------------------
  function depthTaggedPageForcesCalmWindsock(rl){
    return windsockModeForLocation(rl) === 'surface'
      && !!(rl && rl.depthToken && !rl.depthIsElevation);
  }

  function windsockTargetsFromWeather(cur, rl){
    cur = renderWeatherForLocation(cur, rl);
    // Depth-tagged surface pages keep the windsock calm; underwater and underdark pages
    // use their environment-specific side families instead.
    if(depthTaggedPageForcesCalmWindsock(rl)){
      return { dirIdx:0, sideIdx:WINDSOCK_SIDES.dead_calm };
    }
    var windsockMode = windsockModeForLocation(rl);
    var p = clamp(+((cur&&cur.wind&&cur.wind.percent)||0),0,100);
    if(p <= 0) return { dirIdx:0, sideIdx:baseWindsockSide(0, windsockMode) };
    var dirIdx = _dirToIdx16((cur&&cur.wind&&cur.wind.dir)||'N');
    var criticalWind = canonicalWindCritical((cur&&cur.wind&&cur.wind.critical)||'');
    var sideIdx = criticalWind
      ? criticalWindSide(criticalWind, windsockMode)
      : baseWindsockSide(p, windsockMode);
    return { dirIdx:dirIdx, sideIdx:sideIdx };
  }

  function updateWindsockAndTooltipForPageId(mule, pageId){
    pageId = String(pageId||'');
    if(!pageId) return false;

    var tok = _findWindsockToken(pageId);
    if(!tok) return false;

    var rl = resolveFromPageId(pageId);
    if(!rl) return false;

    var settings = ensureSettings(mule);
    var cur = ensureCurrentWeatherForLocation(mule, rl);
    if(!cur) return false;

    var tgt = windsockTargetsFromWeather(cur, rl);
    var forceImmediate = depthTaggedPageForcesCalmWindsock(rl);

    var fromDirIdx = 0, fromSideIdx = 0;
    try{ fromDirIdx = (Math.round((+tok.get('rotation')||0)/22.5)%16+16)%16; }catch(e){}
    try{ fromSideIdx = clamp(+tok.get('currentSide')||0, 0, WINDSOCK_SIDE_MAX); }catch(e2){}

    if(forceImmediate){
      _wsClear(pageId);
      _wsApplyImmediate(tok, tgt.dirIdx, tgt.sideIdx);
    }else{
      _wsAnimate(pageId, tok, fromDirIdx, tgt.dirIdx, fromSideIdx, tgt.sideIdx);
    }
    try{ tok.set('tooltip', String(buildWeatherLine(cur, settings.units, rl)||'')); }catch(e3){}
    return true;
  }

  function updatePageWindsockAndTooltip(mule, pageId){
    if(!pageId) return false;
    return updateWindsockAndTooltipForPageId(mule, pageId);
  }

  function updateActivePageWindsockAndTooltip(mule, pid){
    var pageId = _activePageId(pid);
    if(!pageId) return false;
    return updateWindsockAndTooltipForPageId(mule, pageId);
  }

  function updateAllCalendarAware(mule, pid, opts){
    opts = opts || {};
    var catalog = ensureRegionCatalogHealth(mule);
    if(!catalog.regions.length){
      whisper(pid,'<div style="border:1px solid #666;padding:8px;"><b>dwt_weather</b>: No unified region weather profiles were detected in the regions root.</div>');
      return { ok:false, error:'No unified region weather profiles were loaded from the regions root.' };
    }

    var locations = trackedWeatherLocations(pid, opts);
    if(!locations.length){
      return { ok:true, steps:0, tracked:0 };
    }

    var nw = now();
    var nowTick = tick(nw);
    var root = ensureWeatherRoot(mule);
    var synced = 0;

    for(var i=0;i<locations.length;i++){
      var loc = locations[i];
      var profile = catalog.profiles[loc.region];
      if(!profile) continue;
      syncLocationToTick(root, profile, loc.region, loc.locale, nw, nowTick);
      synced++;
    }

    root.meta.lastTick = nowTick;
    root.meta.lastStamp = stamp(nw);
    saveWeatherRootDirect(mule, root);

    return { ok:true, steps:synced, tracked:locations.length };
  }

  // ----------------------------
  // Unified Campaign Log injection
  // ----------------------------
  function renderLogCard(pid){
    var mule = ensureMule();
    var settings = ensureSettings(mule);
    var rl = resolveFromPage(pid);

    if(!rl){
      // silent for players; GM gets prompt hint.
      if(isGM(pid)){
        return '<div style="margin-top:8px;"><i>Weather not set: ' + esc(pageNamingRuleHint()) + '.</i></div>';
      }
      return '';
    }

    var cur = ensureCurrentWeatherForLocation(mule, rl);
    if(!cur) return '';

    var line = buildWeatherLine(cur, settings.units, rl);

    return '<div>'+esc(line)+'</div>';
  }

  // ----------------------------
  // Command handling (full msg parsing)
  // ----------------------------

  // Weather verify/sync: ensures a current weather record exists for the resolved page and syncs windsock + tooltip.
  // IMPORTANT: This does NOT advance or re-roll weather forward in time. Only `--weather update` does that.
  function weatherVerifySyncActivePage(pid, opts){
    opts = opts||{};
    var mule = ensureMule();

    // Resolve region/locale from a specific page if provided, otherwise from the caller's effective page.
    var rl = null;
    try{
      if(opts.pageId){
        rl = resolveFromPageId(opts.pageId);
      }
      if(!rl){
        rl = resolveFromPage(pid);
      }
    }catch(e0){ rl = null; }

    if(!rl || !rl.region || !rl.locale){
      return { ok:false, error:'Unable to resolve region/locale for this page.' };
    }

    // Ensure a current record exists (generate once if missing).
    var cur = ensureCurrentWeatherForLocation(mule, rl);
    if(!cur) return { ok:false, error:'Unable to prepare weather for this page.' };

    // Sync windsock + tooltip (target page if provided; else caller's effective/active page).
    try{
      if(opts.pageId){
        updatePageWindsockAndTooltip(mule, String(opts.pageId));
      }else{
        updateActivePageWindsockAndTooltip(mule, pid);
      }
    }catch(e1){}

    return { ok:true };
  }



  function weatherSyncActivePage(pid, opts){
    opts = opts||{};
    var mule = ensureMule();

    // If a pageId override is provided, sync to that page (useful for bare !dwt and page-ribbon changes).
    var rlOverride = null;
    if(opts.pageId){
      rlOverride = resolveFromPageId(opts.pageId);
    }

    // Sync only the active page and live player pages to the exact current timeofday tick.
    var up = updateAllCalendarAware(mule, pid, opts);
    if(!up || up.ok===false){
      return { ok:false, error: up ? up.error : 'Weather update failed.' };
    }

    // Sync windsock/tooltip to the *current* weather for the target page
    try{
      if(opts.pageId){
        updateWindsockAndTooltipForPageId(mule, opts.pageId);
      }else{
        updateActivePageWindsockAndTooltip(mule, pid);
      }
    }catch(e){}

    if(!opts.silent && opts.echoWeather){
      try{
        var rl = rlOverride || resolveFromPage(pid);
        if(rl){
          var cur = ensureCurrentWeatherForLocation(mule, rl);
          if(cur){
            whisper(pid,'<div>'+esc(buildWeatherLine(cur, ensureSettings(mule).units, rl))+'</div>');
          }
        }
      }catch(e2){}
    }
    return { ok:true, steps: up.steps||0, rewind: !!up.rewind };
  }

  // ----------------------------
  // Command/runtime helpers
  // ----------------------------
  function pageNamingRuleHint(){
    return 'rename the current page to region.locale.mapname or region.locale_depth.mapname to enable regional and locale-based weather (use bare depth values for feet/meters in the current weather units, append mi/km for large units, and prefix with a "+" for elevation; case and spaces are ignored; canonical names are lower-case with no spaces)';
  }

  function weatherActiveMapError(){
    return { error:'Weather not set: ' + pageNamingRuleHint() + '.', changed:false };
  }

  function resolvedLocationSignature(rl){
    if(!rl || !rl.region || !rl.locale) return '';
    return canonicalKey(rl.region) + '.' + canonicalKey(rl.locale);
  }

  function pushResolvedLocation(out, seen, rl){
    if(!rl) return;
    var key = resolvedLocationSignature(rl);
    if(!key || seen[key]) return;
    seen[key] = true;
    out.push({
      region:canonicalKey(rl.region),
      locale:canonicalKey(rl.locale),
      mapname:String(rl.mapname || ''),
      depth:(rl.depth != null) ? rl.depth : null,
      elevation:(rl.elevation != null) ? rl.elevation : null
    });
  }

  function trackedWeatherLocations(pid, opts){
    opts = opts || {};
    var out = [];
    var seen = {};

    if(opts.pageId){
      pushResolvedLocation(out, seen, resolveFromPageId(opts.pageId));
    }

    var pageIds = getActivePlayerPageIds();
    for(var i=0;i<pageIds.length;i++){
      pushResolvedLocation(out, seen, resolveFromPageId(pageIds[i]));
    }

    if(pid){
      pushResolvedLocation(out, seen, resolveFromPage(pid));
    }

    return out;
  }

  function bestSeedSnapshotForTick(root, region, locale, targetTick){
    var exact = exactSnapshotAtTick(root, region, locale, targetTick);
    if(exact){
      return { snapshot:exact, exact:true, previous:null, next:null };
    }

    var previous = exactSnapshotAtTick(root, region, locale, targetTick - 1);
    var next = exactSnapshotAtTick(root, region, locale, targetTick + 1);
    if(next){
      return { snapshot:null, exact:false, previous:previous, next:next };
    }

    var current = getRootCurrent(root, region, locale);
    var bestSnapshot = null;
    var bestTick = -1;

    if(current && current.tick != null){
      var currentTick = +current.tick;
      if(currentTick < targetTick){
        bestSnapshot = current;
        bestTick = currentTick;
      }
    }

    var earlier = getNearestEarlierHist(root, region, locale, targetTick);
    if(earlier && earlier.snapshot && (+earlier.tick) > bestTick){
      bestSnapshot = earlier.snapshot;
      bestTick = +earlier.tick;
    }

    return { snapshot:bestSnapshot ? deepCloneJSON(bestSnapshot) : null, exact:false, previous:null, next:null };
  }

  function syncLocationToTick(root, profile, region, locale, nw, targetTick){
    var seeded = bestSeedSnapshotForTick(root, region, locale, targetTick);
    var stored = null;

    if(seeded.exact && seeded.snapshot){
      stored = deepCloneJSON(seeded.snapshot);
    }else if(seeded.previous || seeded.next){
      stored = reconstructStoredSnapshotFromAdjacent(profile, region, locale, seeded.previous, seeded.next, nw, targetTick);
      if(stored){
        applyTickMetadata(stored, targetTick);
        appendRootHistory(root, region, locale, stored);
      }
    }else if(seeded.snapshot){
      stored = updateIncremental(profile, region, locale, seeded.snapshot, nw);
      applyTickMetadata(stored, targetTick);
      appendRootHistory(root, region, locale, stored);
    }else{
      stored = generateFresh(profile, region, locale, nw);
      applyTickMetadata(stored, targetTick);
      appendRootHistory(root, region, locale, stored);
    }

    stored = normalizeCurrentWeather(stored);
    setRootCurrent(root, region, locale, stored);
    return materializeLiveWeather(stored, resolveClimateContext(profile, locale, nw), nw);
  }

  function ensureCurrentWeatherForLocation(mule, rl){
    if(!rl) return null;
    var profile = loadRegionProfile(mule, rl.region);
    if(!profile) return null;

    var nw = now();
    var targetTick = tick(nw);
    var root = ensureWeatherRoot(mule);
    var cur = syncLocationToTick(root, profile, rl.region, rl.locale, nw, targetTick);
    root.meta.lastTick = targetTick;
    root.meta.lastStamp = stamp(nw);
    saveWeatherRootDirect(mule, root);
    return cur;
  }

  function syncActiveWindsockForPlayer(mule, pid){
    try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e){}
  }

  function whisperResolvedWeatherLine(pid, units, rl, cur, label){
    if(!rl || !cur) return;
    var line = buildWeatherLine(cur, units, rl);
    if(!line) return;
    var displayLabel = label || String(rl.mapname||'').trim();
    var prefix = displayLabel ? ('<b>'+esc(displayLabel)+'</b>: ') : '';
    whisper(pid, '<div>'+prefix+esc(line)+'</div>');
  }

  function refreshActiveWeather(mule, pid){
    var rl = resolveFromPage(pid);
    if(!rl) return { error:weatherActiveMapError().error };

    var up = updateAllCalendarAware(mule, pid, { pageId:_activePageId(pid) });
    if(!up || up.ok===false){
      return { error:(up && up.error) ? up.error : 'Weather update failed.' };
    }

    var cur = ensureCurrentWeatherForLocation(mule, rl);
    if(!cur) return { error:'Weather could not be resolved for the current map.' };
    syncActiveWindsockForPlayer(mule, pid);
    return { rl:rl, cur:cur };
  }

  function getActivePlayerPageIds(){
    var out = [];
    try{
      if(RT.dwt && typeof RT.dwt.getActivePlayerPageIds==='function'){
        out = RT.dwt.getActivePlayerPageIds() || [];
      }else{
        var c = Campaign();
        var psp = c.get('playerspecificpages') || {};
        var seen = {};
        seen[String(c.get('playerpageid'))] = true;
        for(var k in psp){
          if(psp.hasOwnProperty(k)) seen[String(psp[k])] = true;
        }
        out = Object.keys(seen);
      }
    }catch(e){}
    return out;
  }

  function syncPageWeatherAndEcho(mule, pid, units, pageId){
    var rl = resolveFromPageId(pageId);
    if(!rl) return false;
    var cur = ensureCurrentWeatherForLocation(mule, rl);
    if(!cur) return false;
    try{ updateWindsockAndTooltipForPageId(mule, pageId); }catch(e){}
    whisperResolvedWeatherLine(pid, units, rl, cur);
    return true;
  }

  function whisperWeatherDetails(pid, units, rl, profile, cur){
    if(!rl || !profile || !cur) return;
    var details = buildWeatherDetails(profile, rl, cur, units || 'imperial');
    whisper(pid, renderWeatherDetailsHtml(rl, details));
  }

  function rollManualWeatherForLocation(mule, rl, profile, cur, forcedEventKey, forcedSeverity){
    var nw = now();
    var ctx = resolveClimateContext(profile, rl.locale, nw);
    var config = resolveManualRollConfig(ctx);
    var governor = normalizeGovernorConfig((ctx.climateControl || {}).governor);
    var band = bandWindowForNow(nw);
    var next = reconcileCurrentAgainstContext(deepCloneJSON(cur || emptyCurrent(rl.region, rl.locale)), ctx, nw);
    var origin = snapshotOriginState(next);

    next.tempOffsetF = clamp(
      origin.tempOffsetF + clamp(
        rollFromWeights(config.temperatureSteps, 0),
        -governor.temperatureMaxDeltaF,
        governor.temperatureMaxDeltaF
      ),
      -80,
      80
    );

    next.rainStep = clamp(
      origin.rainStep + clamp(rollFromWeights(config.precipitationSteps, 0), -governor.rainMaxStep, governor.rainMaxStep),
      0,
      3
    );
    next.rainfall = rainfallBandFromStep(next.rainStep);

    next.skyStep = clamp(
      origin.skyStep + clamp(rollFromWeights(config.skySteps, 0), -governor.skyMaxStep, governor.skyMaxStep),
      0,
      4
    );
    next.skies = skyStateFromStep(next.skyStep);
    next.skies = coerceSkiesForRainfall(next.rainfall, next.skies);
    next.rainfall = coerceRainfallForSkies(next.rainfall, next.skies);
    next.rainStep = rainfallStepFromBand(next.rainfall);
    next.skyStep = skyStepFromState(next.skies);

    next.windStep = clamp(
      origin.windStep + clamp(rollFromWeights(config.windSteps, 0), -governor.windMaxStep, governor.windMaxStep),
      0,
      5
    );
    next.wind.percent = windPercentFromStep(next.windStep);
    next.wind.dir = origin.wind.dir || pickTargetWindDir(ctx);
    if(next.wind.percent <= 0){
      next.wind.dir = 'N';
    }else if(!next.wind.dir || r1_100() <= config.directionChangePct){
      next.wind.dir = stepDirToward(origin.wind.dir || pickTargetWindDir(ctx), pickTargetWindDir(ctx), Math.max(1, governor.windMaxStep));
    }
    next.wind.critical = '';
    next.currentPattern = governedCurrentPatternToward(origin.currentPattern || ctx.currentPattern, ctx.currentPattern, governor);

    if(forcedEventKey || forcedSeverity){
      next.event = null;
      var forcedEvent = buildCriticalEvent(profile, ctx, next, nw, forcedEventKey, forcedSeverity);
      if(forcedEvent) applyCriticalEventToWeather(next, forcedEvent);
    }else{
      next.event = cur && cur.event ? deepCloneJSON(cur.event) : null;
      if(!next.event && config.criticalChancePct && r1_100() <= config.criticalChancePct){
        var event = buildCriticalEvent(profile, ctx, next, nw);
        if(event) applyCriticalEventToWeather(next, event);
      }
    }

    next.origin = origin;
    next.activation = buildActivationForSnapshot(origin, next, ctx, nw, minutesToHHMM(clockMinutesFromNow(nw)), true);
    next = finalizeStoredSnapshot(next, ctx, nw, band.endHHMM);
    next.quip = pickQuip(rl.region, rl.locale, materializeLiveWeather(next, ctx, nw)) || '';
    next.stamp = stamp(nw);
    next.tick = tick(nw);
    storeCurrentAndHistory(mule, rl.region, rl.locale, next);
    return materializeLiveWeather(next, ctx, nw);
  }

  function rollManualCriticalEventForLocation(mule, rl, profile, cur, eventKey, severity){
    var nw = now();
    var ctx = resolveClimateContext(profile, rl.locale, nw);
    var band = bandWindowForNow(nw);
    var next = reconcileCurrentAgainstContext(deepCloneJSON(cur || emptyCurrent(rl.region, rl.locale)), ctx, nw);
    var origin = snapshotOriginState(next);
    next.event = null;
    var event = buildCriticalEvent(profile, ctx, next, nw, eventKey, severity);
    if(event) applyCriticalEventToWeather(next, event);
    next.origin = origin;
    next.activation = buildActivationForSnapshot(origin, next, ctx, nw, minutesToHHMM(clockMinutesFromNow(nw)), true);
    next = finalizeStoredSnapshot(next, ctx, nw, band.endHHMM);
    next.quip = pickQuip(rl.region, rl.locale, materializeLiveWeather(next, ctx, nw)) || '';
    next.stamp = stamp(nw);
    next.tick = tick(nw);
    storeCurrentAndHistory(mule, rl.region, rl.locale, next);
    return materializeLiveWeather(next, ctx, nw);
  }

  function isWeatherSetKey(tok){
    tok = canonicalKey(tok||'');
    return tok==='temp' || tok==='rainfall' || tok==='skies' || tok==='wind' || tok==='current' || tok==='chop';
  }

  function parseWeatherSkyValue(v){
    var key = canonicalKey(v||'');
    if(key==='clear') return 'clear';
    if(key==='partlycloudy') return 'partly_cloudy';
    if(key==='cloudy') return 'cloudy';
    if(key==='overcast') return 'overcast';
    if(key==='stormy') return 'stormy';
    return '';
  }

  function parseWeatherWindValue(v){
    v = String(v||'').trim();
    if(!v) return null;

    var critical = canonicalWindCritical(v);
    if(critical){
      return { percent:criticalWindPercent(critical), critical:critical };
    }

    if(canonicalKey(v)==='deadcalm'){
      return { percent:0, critical:'' };
    }

    if(/%$/.test(v) || /^[0-9]+$/.test(v)){
      var pct = parseInt(String(v).replace(/[^\d]/g,''), 10);
      if(isNaN(pct) || pct < 0 || pct > 100) return null;
      return { percent:pct, critical:'' };
    }

    return null;
  }

  function parseWeatherChopValue(v){
    return normalizeChopBand(v||'');
  }

  function summarizeList(items, limit){
    items = Array.isArray(items) ? items.slice() : [];
    if(!items.length) return '';
    limit = clamp(+limit||8, 1, 50);
    if(items.length <= limit) return items.join(', ');
    return items.slice(0, limit).join(', ') + ' (+' + (items.length - limit) + ' more)';
  }

  // ----------------------------
  // Verification helpers
  // ----------------------------
  function findUnsupportedWeatherAbilityNames(mule){
    var out = [];
    if(!mule) return out;
    var abilities = findObjs({_type:'ability', _characterid:mule.id}) || [];
    for(var i=0;i<abilities.length;i++){
      var name = String(abilities[i].get('name')||'').trim();
      if(!name) continue;
      if(name==='weather.settings' || name==='weather.meta' || /^weather\.(current|history|windsock)\./.test(name)){
        out.push(name);
      }
    }
    out.sort();
    return out;
  }

  function appendUnknownWeatherBranchWarnings(branch, label, catalog, warnings){
    catalog = catalog || { profiles:{} };
    var regionKeys = Object.keys(branch || {});
    for(var i=0;i<regionKeys.length;i++){
      var regionKey = regionKeys[i];
      var canonicalRegion = canonicalKey(regionKey);
      var profile = catalog.profiles[canonicalRegion];
      if(!profile){
        warnings.push(label+' contains unsupported region branch "'+regionKey+'".');
        continue;
      }
      var localeNode = branch[regionKey];
      if(!localeNode || typeof localeNode !== 'object' || Array.isArray(localeNode)){
        warnings.push(label+' contains invalid data for region "'+regionKey+'".');
        continue;
      }
      var knownLocales = {};
      var profileLocaleKeys = localeKeysForProfile(profile);
      for(var li=0;li<profileLocaleKeys.length;li++) knownLocales[profileLocaleKeys[li]] = true;
      var branchLocaleKeys = Object.keys(localeNode);
      for(var j=0;j<branchLocaleKeys.length;j++){
        if(!knownLocales[canonicalKey(branchLocaleKeys[j])]){
          warnings.push(label+' contains unsupported locale "'+regionKey+'.'+branchLocaleKeys[j]+'".');
        }
      }
    }
  }

  function objectId(obj){
    if(!obj) return '';
    try{ return String(obj.id || obj.get('_id') || ''); }catch(e){ return ''; }
  }

  function regionsAbilityDiagnostics(mule){
    var out = { muleCount:0, muleIds:[], regionAbilityCount:0, regionAbilityScores:[], selectedRegionAbilityScore:null };
    var muleMatches = findObjs({_type:'character', name:MULE_NAME}) || [];
    out.muleCount = muleMatches.length;
    out.muleIds = muleMatches.map(function(ch){ return objectId(ch); }).filter(function(id){ return !!id; });
    if(!mule) return out;
    var abilities = namedAbilities(mule, 'regions');
    out.regionAbilityCount = abilities.length;
    out.regionAbilityScores = abilities.map(function(ab, idx){
      var score = abilitySortScore('regions', ab);
      if(idx === 0) out.selectedRegionAbilityScore = score;
      return score;
    });
    return out;
  }

  function verifyWeatherModuleState(mule){
    mule = mule || ensureMule();
    var issues = [];
    var warnings = [];
    var info = [];

    if(!mule){
      issues.push('dwt_mule is not available.');
      return { ok:false, issues:issues, warnings:warnings, info:info };
    }

    var normalized = normalizeWeatherRoot(loadWeatherRootDirect(mule));
    var root = normalized.root;
    if(normalized.changed) saveWeatherRootDirect(mule, root);
    mirrorVersionToUnifiedRegistry();

    var catalog = loadRegionCatalog(mule);

    if(!catalog.regions.length){
      issues.push('No unified region profiles were found in the regions root.');
    }
    if(catalog.issues.length){
      issues = issues.concat(catalog.issues);
    }

    var unsupportedWeatherAbilities = findUnsupportedWeatherAbilityNames(mule);
    if(unsupportedWeatherAbilities.length){
      warnings.push('Unsupported weather ability fragments remain on dwt_mule: ' + summarizeList(unsupportedWeatherAbilities, 8) + '.');
    }

    appendUnknownWeatherBranchWarnings(root.current, 'weather.current', catalog, warnings);
    appendUnknownWeatherBranchWarnings(root.history, 'weather.history', catalog, warnings);

    var diag = regionsAbilityDiagnostics(mule);
    info.push('Selected dwt_mule id: ' + (objectId(mule) || '(unknown)') + '.');
    info.push('Selected regions ability score: ' + String(diag.selectedRegionAbilityScore === null ? 'n/a' : diag.selectedRegionAbilityScore) + '.');
    if(diag.muleCount > 1){
      warnings.push('Multiple dwt_mule characters were found: ' + summarizeList(diag.muleIds, 10) + '.');
    }
    if(diag.regionAbilityCount > 1){
      warnings.push('Multiple regions abilities were found on the selected dwt_mule. Scores: ' + summarizeList(diag.regionAbilityScores.map(function(v){ return String(v); }), 10) + '.');
    }

    info.push('Module version: ' + VERSION + '.');
    info.push('Weather root schema: ' + root.meta.rootSchema + '.');
    info.push('Weather tick schema: ' + (root.meta.tickSchema || '(unset)') + '.');
    info.push('Weather display units: ' + root.settings.units + '.');
    info.push('Unified region count: ' + catalog.regions.length + '.');
    if(catalog.regions.length){
      info.push('Unified regions: ' + summarizeList(catalog.regions, 10) + '.');
      var localeSummary = [];
      for(var i=0;i<catalog.regions.length;i++){
        var region = catalog.regions[i];
        localeSummary.push(region + ' (' + localeKeysForProfile(catalog.profiles[region]).length + ' locales)');
      }
      info.push('Locale counts: ' + summarizeList(localeSummary, 10) + '.');
    }
    if(root.meta.lastStamp){
      info.push('Last processed weather stamp: ' + root.meta.lastStamp + '.');
    }

    return {
      ok:issues.length===0,
      issues:issues,
      warnings:warnings,
      info:info
    };
  }

  function renderWeatherVerifyReport(report){
    var parts = ['<div style="border:1px solid #666;padding:8px;"><b>dwt_weather verify</b><br>'];
    parts.push('Status: <b>' + (report.ok ? 'OK' : 'Issues detected') + '</b>');
    if(report.info && report.info.length){
      parts.push('<br><br><b>Details</b><br>' + report.info.map(function(msg){ return esc(msg); }).join('<br>'));
    }
    if(report.warnings && report.warnings.length){
      parts.push('<br><br><b>Warnings</b><br>' + report.warnings.map(function(msg){ return esc(msg); }).join('<br>'));
    }
    if(report.issues && report.issues.length){
      parts.push('<br><br><b>Issues</b><br>' + report.issues.map(function(msg){ return esc(msg); }).join('<br>'));
    }
    parts.push('</div>');
    return parts.join('');
  }

  function setWeatherUnitsForPlayer(mule, pid, settings, units){
    if(!isGM(pid)) return { error:'Only the GM may change weather units.', changed:false };
    if(units !== 'metric' && units !== 'imperial'){
      return { error:'Use !dwt --weather set units metric|imperial.', changed:false };
    }

    settings.units = units;
    setJSON(mule, AB_SETTINGS(), settings);

    var rlU = resolveFromPage(pid);
    if(rlU){
      var curU = ensureCurrentWeatherForLocation(mule, rlU);
      if(curU){
        curU.quip = pickQuip(rlU.region, rlU.locale, curU) || '';
        syncActiveWindsockForPlayer(mule, pid);
        whisperResolvedWeatherLine(pid, settings.units, rlU, curU);
      }
    }
    return { changed:false };
  }

  function handleWeatherExpr(pid, arg){
    var mule = ensureMule();
    var settings = ensureSettings(mule);

    var a = lower(String(arg||'')).trim();
    var tokens = a ? a.split(/\s+/) : [];

    if(!tokens.length){
      var activeWeather = refreshActiveWeather(mule, pid);
      if(activeWeather.error) return { error:activeWeather.error, changed:false };
      whisperResolvedWeatherLine(pid, settings.units, activeWeather.rl, activeWeather.cur);
      return { changed:false };
    }

    if(tokens[0]==='quip'){
      if(tokens.length !== 1) return { error:'Use !dwt --weather quip with no additional arguments.', changed:false };
      var quipWeather = refreshActiveWeather(mule, pid);
      if(quipWeather.error) return { error:quipWeather.error, changed:false };
      var q = buildWeatherQuip(quipWeather.rl.region, quipWeather.rl.locale, quipWeather.cur);
      if(q) whisper(pid, '<div>'+esc(q)+'</div>');
      else whisper(pid, '<div>No weather quip is configured for this location yet.</div>');
      return { changed:false };
    }

    if(tokens[0]==='detail'){
      if(tokens.length !== 1) return { error:'Use !dwt --weather detail with no additional arguments.', changed:false };
      if(!isGM(pid)) return { error:'Only the GM may view detailed weather state.', changed:false };
      var detailWeather = refreshActiveWeather(mule, pid);
      if(detailWeather.error) return { error:detailWeather.error, changed:false };
      var detailProfile = loadRegionProfile(mule, detailWeather.rl.region);
      if(!detailProfile) return { error:'Weather could not be resolved for the current map.', changed:false };
      whisperWeatherDetails(pid, settings.units, detailWeather.rl, detailProfile, detailWeather.cur);
      return { changed:false };
    }

    if(tokens[0]==='show'){
      if(tokens.length !== 2 || tokens[1] !== 'chop'){
        return { error:'Use !dwt --weather show chop.', changed:false };
      }
      var showWeather = refreshActiveWeather(mule, pid);
      if(showWeather.error) return { error:showWeather.error, changed:false };
      if(!locationSupportsSurfaceChop(showWeather.rl)){
        return { error:'Chop is only modeled on offshore and coastal surface locales.', changed:false };
      }
      var showCur = renderWeatherForLocation(showWeather.cur, showWeather.rl);
      var chopBand = chopBandFromWeather(showCur, showWeather.rl);
      whisper(pid, '<div>Chop: <b>' + esc(titleCaseWords(chopBand)) + '</b> (derived from the current wind band).</div>');
      return { changed:false };
    }

    if(tokens[0]==='update'){
      if(tokens.length !== 1) return { error:'Use !dwt --weather update with no additional arguments.', changed:false };
      if(!isGM(pid)) return { error:'Only the GM may update weather.', changed:false };

      var up = updateAllCalendarAware(mule, pid, { pageId:_activePageId(pid) });
      if(!up || up.ok===false){
        return { error:(up && up.error) ? up.error : 'Weather update failed.', changed:false };
      }

      var pageIds = getActivePlayerPageIds();
      var skipped = [];
      var refreshed = 0;
      for(var i=0;i<pageIds.length;i++){
        if(syncPageWeatherAndEcho(mule, pid, settings.units, pageIds[i])){
          refreshed++;
          continue;
        }
        try{
          var pg = getObj('page', pageIds[i]);
          skipped.push(pg ? (pg.get('name')||'page') : 'page');
        }catch(e2){
          skipped.push('page');
        }
      }

      if(skipped.length){
        whisper(pid, '<div style="border:1px solid #666;padding:6px;">Skipped weather sync for pages that do not follow the unified page-naming rule (<b>region.locale.mapname</b> or <b>region.locale_depth.mapname</b>; use bare depth values for feet/meters in the current weather units, append <b>mi</b>/<b>km</b> for large units, and prefix with a <b>+</b> for elevation; case and spaces are ignored; canonical names are lower-case with no spaces): '+esc(skipped.join(', '))+'.</div>');
      }
      if(!refreshed){
        return { error:'No active player pages could be resolved with the unified region/locale page-naming rule.', changed:false };
      }
      return { changed:false };
    }

    if(tokens[0]==='verify'){
      if(tokens.length !== 1) return { error:'Use !dwt --weather verify with no additional arguments.', changed:false };
      if(!isGM(pid)) return { error:'Only the GM may verify weather state.', changed:false };
      whisper(pid, renderWeatherVerifyReport(verifyWeatherModuleState(mule)));
      return { changed:false };
    }

    if(tokens[0]==='roll'){
      if(!isGM(pid)) return { error:'Only the GM may roll weather tables.', changed:false };

      var rlR = resolveFromPage(pid);
      if(!rlR) return weatherActiveMapError();
      var profileR = loadRegionProfile(mule, rlR.region);
      if(!profileR) return { error:'Weather could not be resolved for the current map.', changed:false };
      var curR = ensureCurrentWeatherForLocation(mule, rlR);
      if(!curR) return { error:'Weather could not be resolved for the current map.', changed:false };

      if(tokens.length === 1){
        var rolled = rollManualWeatherForLocation(mule, rlR, profileR, curR);
        syncActiveWindsockForPlayer(mule, pid);
        whisperWeatherDetails(pid, settings.units, rlR, profileR, rolled);
        return { changed:false };
      }

      if(tokens[1] !== 'event'){
        return { error:'Use !dwt --weather roll or !dwt --weather roll event [event_key] [light|moderate|heavy|severe].', changed:false };
      }

      if(tokens.length > 4){
        return { error:'Use !dwt --weather roll event [event_key] [light|moderate|heavy|severe].', changed:false };
      }

      var eventKey = '';
      var severity = '';
      if(tokens[2]){
        var maybeKey = canonicalKey(tokens[2]);
        if(maybeKey === 'light' || maybeKey === 'moderate' || maybeKey === 'heavy' || maybeKey === 'severe'){
          severity = maybeKey;
        }else{
          eventKey = maybeKey;
        }
      }
      if(tokens[3]){
        severity = canonicalKey(tokens[3]);
      }
      if(severity && ['light','moderate','heavy','severe'].indexOf(severity) < 0){
        return { error:'Critical event severity must be light, moderate, heavy, or severe.', changed:false };
      }

      var rolledEvent = rollManualCriticalEventForLocation(mule, rlR, profileR, curR, eventKey, severity);
      syncActiveWindsockForPlayer(mule, pid);
      whisperWeatherDetails(pid, settings.units, rlR, profileR, rolledEvent);
      return { changed:false };
    }

    if(tokens[0]==='units'){
      if(tokens.length !== 2) return { error:'Use !dwt --weather set units metric|imperial.', changed:false };
      return setWeatherUnitsForPlayer(mule, pid, settings, lower(tokens[1]||'').trim());
    }

    if(tokens[0]==='set'){
      if(tokens.length===1) return { error:'No weather set values provided.', changed:false };
      if(canonicalKey(tokens[1]||'') === 'units'){
        if(tokens.length !== 3) return { error:'Use !dwt --weather set units metric|imperial.', changed:false };
        return setWeatherUnitsForPlayer(mule, pid, settings, lower(tokens[2]||'').trim());
      }
      if(!isGM(pid)) return { error:'Only the GM may set weather conditions.', changed:false };

      var rlS = resolveFromPage(pid);
      if(!rlS) return weatherActiveMapError();
      var curS = ensureCurrentWeatherForLocation(mule, rlS);
      if(!curS) return weatherActiveMapError();

      var pending = {
        tempBand:'',
        tempF:null,
        rainfall:'',
        skies:'',
        windTouched:false,
        windPct:null,
        windDir:'',
        windCritical:'',
        chopTouched:false,
        currentTouched:false,
        currentPct:null,
        currentDir:''
      };
      var rainfallSpecified = false;
      var skiesSpecified = false;
      var rainfallOrder = -1;
      var skiesOrder = -1;

      for(var j=1;j<tokens.length;j++){
        var key = canonicalKey(tokens[j]||'');
        var value = tokens[j+1];
        if(!key) continue;

        if(key==='temp'){
          var tempToken = String(value||'').trim();
          var tempBand = canonicalKey(tempToken);
          if(['frigid','cold','mild','warm','hot'].indexOf(tempBand)>=0){
            pending.tempBand = tempBand;
            pending.tempF = null;
            j++;
            continue;
          }
          var tempNumeric = parseFloat(tempToken);
          if(isNaN(tempNumeric) || !isFinite(tempNumeric)){
            return { error:'Invalid temp value.', changed:false };
          }
          pending.tempBand = '';
          pending.tempF = (settings.units === 'metric') ? toF(tempNumeric) : Math.round(tempNumeric);
          j++;
          continue;
        }

        if(key==='rainfall'){
          var rainfall = normalizeRainfallBand(value||'');
          if(!rainfall){
            return { error:'Invalid rainfall band.', changed:false };
          }
          pending.rainfall = rainfall;
          rainfallSpecified = true;
          rainfallOrder = j;
          j++;
          continue;
        }

        if(key==='skies'){
          var skies = parseWeatherSkyValue(value||'');
          if(!skies){
            return { error:'Invalid skies value.', changed:false };
          }
          pending.skies = skies;
          skiesSpecified = true;
          skiesOrder = j;
          j++;
          continue;
        }

        if(key==='wind'){
          var windToken = String(value||'').trim();
          if(!windToken){
            return { error:'Invalid wind value.', changed:false };
          }
          var next = tokens[j+2];
          var windValue = parseWeatherWindValue(windToken);
          var windDir = '';

          pending.windTouched = true;

          if(windValue){
            pending.windPct = windValue.percent;
            pending.windCritical = windValue.critical;

            if(windValue.percent===0){
              if(next && !isWeatherSetKey(next)){
                return { error:'dead_calm cannot include a wind direction.', changed:false };
              }
              pending.windDir = 'N';
              j++;
              continue;
            }

            if(next && !isWeatherSetKey(next)){
              windDir = parseWindDirection(next);
              if(!windDir){
                return { error:'Invalid wind direction.', changed:false };
              }
              j += 2;
            }else{
              j++;
            }
            if(windDir) pending.windDir = windDir;
            continue;
          }

          windDir = parseWindDirection(windToken);
          if(!windDir){
            return { error:'Invalid wind value.', changed:false };
          }
          if(next && !isWeatherSetKey(next)){
            return { error:'Use !dwt --weather set wind <speed> [dir] or !dwt --weather set wind <dir>.', changed:false };
          }
          pending.windDir = windDir;
          pending.windCritical = '';
          j++;
          continue;
        }

        if(key==='chop'){
          var chopToken = parseWeatherChopValue(value||'');
          if(!chopToken){
            return { error:'Invalid chop value. Use none, light, moderate, heavy, or severe.', changed:false };
          }
          pending.chopTouched = true;
          pending.windTouched = true;
          pending.windPct = windPercentForChopBand(chopToken);
          pending.windCritical = '';
          if(chopToken === 'none') pending.windDir = 'N';
          j++;
          continue;
        }

        if(key==='current'){
          var currentToken = String(value||'').trim();
          if(!currentToken){
            return { error:'Invalid current value.', changed:false };
          }
          var nextCurrent = tokens[j+2];
          var currentValue = parseWeatherWindValue(currentToken);
          var currentDir = '';

          pending.currentTouched = true;

          if(currentValue){
            pending.currentPct = currentValue.percent;

            if(currentValue.percent===0){
              if(nextCurrent && !isWeatherSetKey(nextCurrent)){
                return { error:'dead_calm cannot include a current direction.', changed:false };
              }
              pending.currentDir = 'N';
              j++;
              continue;
            }

            if(nextCurrent && !isWeatherSetKey(nextCurrent)){
              currentDir = parseWindDirection(nextCurrent);
              if(!currentDir){
                return { error:'Invalid current direction.', changed:false };
              }
              j += 2;
            }else{
              j++;
            }
            if(currentDir) pending.currentDir = currentDir;
            continue;
          }

          currentDir = parseWindDirection(currentToken);
          if(!currentDir){
            return { error:'Invalid current value.', changed:false };
          }
          if(nextCurrent && !isWeatherSetKey(nextCurrent)){
            return { error:'Use !dwt --weather set current <speed> [dir] or !dwt --weather set current <dir>.', changed:false };
          }
          pending.currentDir = currentDir;
          j++;
          continue;
        }

        return { error:'Unknown weather set key: '+key, changed:false };
      }

      var finalRainfall = rainfallSpecified ? pending.rainfall : (normalizeRainfallBand(curS.rainfall) || 'none');
      var finalSkies = skiesSpecified ? pending.skies : (canonicalSkyState(curS.skies) || 'clear');

      if(rainfallSpecified && !skiesSpecified){
        finalSkies = coerceSkiesForRainfall(finalRainfall, finalSkies);
      }else if(skiesSpecified && !rainfallSpecified){
        finalRainfall = coerceRainfallForSkies(finalRainfall, finalSkies);
      }else if(rainfallSpecified && skiesSpecified && rainfallSkiesConflict(finalRainfall, finalSkies)){
        if(skiesOrder > rainfallOrder){
          finalRainfall = coerceRainfallForSkies(finalRainfall, finalSkies);
        }else{
          finalSkies = coerceSkiesForRainfall(finalRainfall, finalSkies);
        }
      }

      finalSkies = coerceSkiesForRainfall(finalRainfall, finalSkies);
      finalRainfall = coerceRainfallForSkies(finalRainfall, finalSkies);

      var nw = now();
      var profileS = loadRegionProfile(mule, rlS.region);
      if(profileS){
        var ctxS = resolveClimateContext(profileS, rlS.locale, nw);
        if(pending.chopTouched && !locationSupportsSurfaceChop(rlS)){
          return { error:'Chop can only be set on offshore and coastal surface locales.', changed:false };
        }
        var bandS = bandWindowForNow(nw);
        var nextS = reconcileCurrentAgainstContext(curS, ctxS, nw);
        var originS = snapshotOriginState(curS);

        if(pending.tempBand){
          nextS.tempOffsetF = temperatureOffsetFromAbsolute(ctxS, tempBandMidpointF(pending.tempBand), nw);
        }else if(pending.tempF != null){
          nextS.tempOffsetF = temperatureOffsetFromAbsolute(ctxS, Math.round(pending.tempF), nw);
        }
        nextS.rainfall = finalRainfall;
        nextS.rainStep = rainfallStepFromBand(nextS.rainfall);
        nextS.skies = finalSkies;
        nextS.skyStep = skyStepFromState(nextS.skies);
        nextS.event = null;

        if(pending.windTouched){
          nextS.wind = nextS.wind || { percent:0, dir:'N', critical:'' };
          if(pending.windPct !== null){
            nextS.wind.percent = pending.windPct;
            nextS.wind.critical = pending.windCritical || '';
            if(pending.windPct===0){
              nextS.wind.dir = 'N';
            }else if(pending.windDir){
              nextS.wind.dir = pending.windDir;
            }
          }else if(pending.windDir){
            nextS.wind.dir = pending.windDir;
          }
          nextS.windStep = windStepFromPercent(nextS.wind.percent);
        }

        if(pending.currentTouched){
          var baseCurrent = nextS.currentPattern || ctxS.currentPattern;
          if(!(ctxS.locale && ctxS.locale.useSeasonalCurrent) || !baseCurrent){
            return { error:'Current can only be set on locales that use seasonal currents.', changed:false };
          }
          var targetCurrentStrength = (pending.currentPct !== null) ? pending.currentPct : baseCurrent.strengthPct;
          var targetCurrentDir = pending.currentDir || baseCurrent.direction;
          nextS.currentPattern = cloneCurrentPatternWithSetting(baseCurrent, targetCurrentStrength, targetCurrentDir);
        }

        nextS.origin = originS;
        nextS.activation = buildActivationForSnapshot(originS, nextS, ctxS, nw, minutesToHHMM(clockMinutesFromNow(nw)), true);
        nextS = finalizeStoredSnapshot(nextS, ctxS, nw, bandS.endHHMM);
        nextS.quip = pickQuip(rlS.region, rlS.locale, materializeLiveWeather(nextS, ctxS, nw)) || '';
        nextS.stamp = stamp(nw);
        nextS.tick = tick(nw);
        storeCurrentAndHistory(mule, rlS.region, rlS.locale, nextS);
        curS = materializeLiveWeather(nextS, ctxS, nw);
      }else{
        normalizeCurrentWeather(curS);
        curS.quip = pickQuip(rlS.region, rlS.locale, curS) || '';
        curS.stamp = stamp(nw);
        curS.tick = tick(nw);
        storeCurrentAndHistory(mule, rlS.region, rlS.locale, curS);
      }
      syncActiveWindsockForPlayer(mule, pid);
      whisperResolvedWeatherLine(pid, settings.units, rlS, curS);
      return { changed:false };
    }

    return { error:'Unknown weather command.', changed:false };
  }

  // ----------------------------
  // Provisioning / root normalization
  // ----------------------------
  function ensureUnifiedRootHealth(){
    var M = ensureMule();
    if(!M) return;

    var normalized = normalizeWeatherRoot(loadWeatherRootDirect(M));
    if(normalized.changed) saveWeatherRootDirect(M, normalized.root);
    mirrorVersionToUnifiedRegistry();
  }

  // ----------------------------
  // Core integration
  // ----------------------------
  function helpLines(){
    var tempBullets = tempBandRangeBulletLines();
    return [
      'Commands',
      'Whisper the current weather line for the current map:',
      '!dwt --weather',
      'Whisper the short weather quip for current map:',
      '!dwt --weather quip',
      '',
      'GM-Only Commands',
      'Enable regional and locale-based seasonal weather patterns via dwt_region.regionname modules, with the associated page naming template: region.locale.mapname or region.locale_depth.mapname.',
      'Use bare depth values for feet/meters in the current weather units, append mi/km for large units, and prefix with a "+" for elevation. Case and spaces are ignored; canonical names are lower-case with no spaces.',
      '',
      'Whisper detailed climate control, governor, activation-window, current pattern, and active event information for the current map:',
      '!dwt --weather detail',
      'Sync only the exact current timeofday tick for the active page and any page that currently has players on it. Live temperature, wind, and current rendering still follow the exact clock inside the current band:',
      '!dwt --weather update',
      'Verify the unified weather root and region catalog:',
      '!dwt --weather verify',
      'Roll one immediate governed weather step for the current map at the current timeofday tick:',
      '!dwt --weather roll',
      'Roll or force an immediate critical event for the current map at the current timeofday tick:',
      '!dwt --weather roll event [event_key] [light|moderate|heavy|severe]',
      'Set display units for weather output:',
      '!dwt --weather set units metric|imperial',
      'Set temperature band or exact temperature for the current map at the current timeofday tick. Exact clock time still drives the live diurnal reading:',
      '!dwt --weather set temp <number|frigid|cold|mild|warm|hot>',
      'Set rainfall band for the current map at the current timeofday tick:',
      '!dwt --weather set rainfall none|light|moderate|heavy',
      'Set sky cover for the current map at the current timeofday tick:',
      '!dwt --weather set skies clear|partly_cloudy|cloudy|overcast|stormy',
      'Set wind strength and/or direction for the current map at the current timeofday tick:',
      '!dwt --weather set wind <pct|dead_calm|crit_light|crit_moderate|crit_heavy|crit_severe> [dir]',
      'Set marine surface chop for the current map by dragging wind to the nearest compliant band:',
      '!dwt --weather set chop none|light|moderate|heavy|severe',
      'Set current strength and/or direction for the current map at the current timeofday tick when the locale uses seasonal currents:',
      '!dwt --weather set current <pct|dead_calm|crit_light|crit_moderate|crit_heavy|crit_severe> [dir]',
      'Show the derived chop value for the current map when the locale models surface chop:',
      '!dwt --weather show chop',
      'Page naming rule:',
      'Pages use region.locale.mapname or region.locale_depth.mapname.',
      'Depth token rule:',
      'Bare depth values use the current weather units (feet for imperial, meters for metric). Append mi or km to force large units, and prefix with a "+" for elevation. Case and spaces are ignored; canonical names are lower-case with no spaces.',
      'Windsock rule:',
      'The active-page dwt_windsock token uses the surface layer family for surface locales, the uw_* layer family for underwater locales, and the ud_* layer family for underdark locales. The token must include the documented 30-side order.',
      'Chop rule:',
      'Chop is modeled only on offshore and coastal surface locales. It represents local short-period wind waves, so dead calm always yields chop none, and setting chop raises or lowers wind to the nearest compliant wind band.',
      'Subsurface rule:',
      'Underwater pages sample current strength, direction, temperature shift, and visibility from the locale waterProfile and the active page depth. Underdark pages treat airflow as mostly dead-calm cave ventilation, with only brief drafts or critical events pushing the ud_* tiers.',
      'Set keys may be stacked in a single command. The command writes the current map weather for the current timeofday tick and clears any active critical event on that map. Example:',
      '!dwt --weather set temp cold rainfall light',
      'Manual weather rolls and automatic drift both obey the same governor caps. Temperature anomalies are capped in absolute degrees per segment, rain/skies/wind move one step per segment unless a critical event overrides them, and current direction/strength/temperature ease toward their targets.',
      'Light rainfall requires partly_cloudy skies or better, and moderate and heavy rainfall require cloudy skies or better. If a rainfall command omits skies, the module raises skies to the minimum compatible state.',
      '',
      'Temperature band ranges:',
      tempBullets[0],
      tempBullets[1],
      tempBullets[2],
      tempBullets[3],
      tempBullets[4],
      'Numeric temperature values use the current weather units.'
    ];
  }
  function mirrorVersionToUnifiedRegistry(){
    try{
      var mule = ensureMule();
      mergeVersionEntry(mule, MODULE_KEY, VERSION);
    }catch(e){}
  }

  function tryWrapCalendarCard(){
    try{
      if(!(RT.dwt && RT.dwt.LOG_CARDS && Array.isArray(RT.dwt.LOG_CARDS))) return false;

      for(var i=0;i<RT.dwt.LOG_CARDS.length;i++){
        var card = RT.dwt.LOG_CARDS[i];
        if(!card || card.order !== 5 || typeof card.render !== 'function') continue;
        if(card._dwtWeatherWrapped) return true;

        (function(c){
          var orig = c.render;
          c.render = function(pid){
            var html = orig(pid) || '';
            try{
              var mule = ensureMule();
              var settings = ensureSettings(mule);
              var rl = resolveFromPage(pid);
              if(!rl) return html;

              // Ensure at least a current weather record exists for the active region/locale.
              var cur = null;
              try{ cur = ensureCurrentWeatherForLocation(mule, rl); }catch(e0){ cur = null; }
              if(!cur) return html;

              var line = buildWeatherLine(cur, settings.units, rl);
              var insert = '<div style="margin-top:6px;">'+esc(line)+'</div>';

              // Insert the line immediately before the calendar button container.
              // Calendar uses: <div style="margin-top:12px;">...Show Calendar...</div>
              var needle = '<div style="margin-top:12px;">';
              if(html.indexOf(needle) !== -1){
                html = html.replace(needle, insert + needle);
              }else{
                html += insert;
              }
            }catch(e){ /* no-op */ }
            return html;
          };
          c._dwtWeatherWrapped = true;
        })(card);

        return true;
      }
    }catch(e){}
    return false;
  }

  function registerWithCore(dwt){
    try{
      dwt = dwt || (RT && RT.dwt) || null;
      if(!dwt) return;

      if(typeof dwt.addHelpSection==='function'){
        dwt.addHelpSection(300, 'Weather', function(){ return helpLines(); });
        if(typeof dwt.refreshHelpHandout==='function'){
          dwt.refreshHelpHandout(null);
        }
      }

      // Publish weather helpers to core for unified-menu sync behavior.
      dwt.weatherSyncActivePage = weatherSyncActivePage;
      dwt.weatherVerifySyncActivePage = weatherVerifySyncActivePage;

      // Ensure our weather line is injected into the calendar log card regardless of script load order.
      if(typeof dwt.registerStartup==='function'){
        dwt.registerStartup(MODULE_KEY, function(mule){
          moduleStartup(mule);
          tryWrapCalendarCard();
        });
      }

      // Best-effort immediate wrap (covers cases where calendar already registered).
      tryWrapCalendarCard();

      if(typeof dwt.registerCommands==='function'){
        // IMPORTANT: core calls cmd.handler({pid,key,val}); we must provide a function.
        dwt.registerCommands({
          weather: { access:'player', handler:function(ctx){
            try{ return handleWeatherExpr(ctx.pid, String(ctx.val||'')); }
            catch(e){ return { error:String(e), changed:false }; }
          }}
        });
      }
    }catch(e){}
  }

  // ----------------------------
  // Startup
  // ----------------------------
  function moduleStartup(mule){
    mule = mule || ensureMule();
    ensureUnifiedRootHealth();
    drainRegionQueue();
    ensureRegionCatalogHealth(mule);
    mirrorVersionToUnifiedRegistry();
  }

  function init(){
    var mule = ensureMule();
    moduleStartup(mule);

    try{
      RT.dwtQ = RT.dwtQ || [];
      RT.dwtQ.push(function(dwt){
        registerWithCore(dwt);
      });
      if(RT.dwt) registerWithCore(RT.dwt);
    }catch(e){}
  }

  return {
    init:init,
    registerRegionEntry:registerRegionEntry,
    loadedRegions:loadedRegions,
    _renderLogCard:renderLogCard,
    _weatherLine:weatherLine,
    _weatherQuipLine:weatherQuipLine,
    _now:now,
    _tick:tick,
    _stamp:stamp,
    _updateActivePageWindsockAndTooltip:updateActivePageWindsockAndTooltip,
    _weatherVerifySyncActivePage:weatherVerifySyncActivePage,
    _weatherSyncActivePage:weatherSyncActivePage,
    _verifyWeatherModuleState:verifyWeatherModuleState
  };
}());

try{
  var _dwtWeatherRoot = (typeof globalThis !== 'undefined') ? globalThis
                      : (typeof window !== 'undefined')     ? window
                      : (typeof self !== 'undefined')       ? self
                      : (typeof global !== 'undefined')     ? global
                      : this;
  _dwtWeatherRoot.dwt_weather = dwt_weather;
  _dwtWeatherRoot.RT = _dwtWeatherRoot.RT || {};
  _dwtWeatherRoot.RT.dwt_weather = dwt_weather;
}catch(e){}

on('ready', function(){
  try{ dwt_weather.init(); }catch(e){ log('dwt_weather init error: '+e); }
});

on('change:campaign:playerpageid', function(obj, prev){
  try{
    var mule = (dwt_weather && dwt_weather._weatherVerifySyncActivePage) ? (findObjs({_type:'character', name:'dwt_mule'})[0] || null) : null;
    if(!mule) return;
    // Refresh the new ribbon page only; this is a sync/verify, not a weather advance.
    dwt_weather._weatherVerifySyncActivePage(null, { pageId: String(obj.get('playerpageid')||'') });
  }catch(e){}
});
on('change:campaign:playerspecificpages', function(obj, prev){
  try{
    var nowPSP = obj.get('playerspecificpages') || {};
    var seen = {};
    for(var pid in nowPSP){
      if(!nowPSP.hasOwnProperty(pid)) continue;
      var pageId = String(nowPSP[pid]||'');
      if(!pageId || seen[pageId]) continue;
      seen[pageId] = true;
      dwt_weather._weatherVerifySyncActivePage(pid, { pageId: pageId });
    }
  }catch(e){}
});


