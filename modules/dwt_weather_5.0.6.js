// name:        dwt_weather.js
// version:     5.0.6
// description: Core-aware weather engine for the DWT (Date-Weather-Trade) Roll20 API suite.
//              - Stores weather settings, metadata, current weather, history, events, and windsock state beneath a single
//                root dwt_mule ability named weather.
//              - Writes the module version to the root dwt_mule ability named version.
//              - Updates weather in Harptos timeofday segments (early/late predawn, morning, afternoon, evening).
//              - Loads regional profiles from the regionWeather mule root object (schema: dwt.regionWeather.v1).
//              - Provides !dwt --weather controls and injects a weather line + short quip into the unified Campaign Log.
// depends:     dwt_core_4.3.2+, dwt_calendar_harptos (state.dwt.now), Roll20 API.
// author:      TC McFall (AI-assisted)

var dwt_weather = dwt_weather || (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '5.0.6';
  var MODULE_KEY = 'weather';
  var MULE_NAME = 'dwt_mule';

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
  //
  // Animation cadence: milliseconds per step for BOTH rotation and side changes.
  // Requested default: 0.05 seconds per step.
  var WINDSOCK_NAME = 'dwt_windsock';
  var WINDSOCK_STEP_MS = 50; // <-- adjust here

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

  function _wsStore(mule, pageId, dirIdx, sideIdx){
    try{
      setJSON(mule, 'weather.windsock.'+String(pageId), {
        schema:'dwt.weather.windsock.v1',
        pageId:String(pageId),
        dirIdx:dirIdx,
        sideIdx:sideIdx,
        ts:Date.now()
      });
    }catch(e){}
  }

  function _wsLoad(mule, pageId){
    var rec = getJSON(mule, 'weather.windsock.'+String(pageId));
    if(rec && rec.schema==='dwt.weather.windsock.v1') return rec;
    return null;
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
    var curSide = clamp(+fromSideIdx||0, 0, 9);
    toDirIdx = clamp(+toDirIdx||0, 0, 15);
    toSideIdx = clamp(+toSideIdx||0, 0, 9);

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



  // Canonical region keys (normalized; regionWeather modules may provide a subset).
  var REGIONS = ['frozenfar','swordcoastnorth','swordcoast','moonshaes','landsofintrigue'];
  var LOCALES = ['offshore','coastal','inland'];
  var TIMEOFDAY_SEGMENTS = ['early predawn','late predawn','early morning','late morning','early afternoon','late afternoon','early evening','late evening'];

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

  function say(html){
    try{ sendChat('dwt_weather', html); }catch(e){}
  }

  function ensureMule(){
    try{ if(RT.dwt && typeof RT.dwt.ensureMule==='function'){ return RT.dwt.ensureMule(); } }catch(e){}
    var ch = findObjs({_type:'character', name:MULE_NAME})[0];
    if(!ch){
      ch = createObj('character',{ name:MULE_NAME, inplayerjournals:'', controlledby:'', archived:false });
    }
    return ch;
  }

  function upsertAbility(character, name, action){
    if(!character) return null;
    var ab = findObjs({_type:'ability', _characterid:character.id, name:name})[0];
    if(ab){
      try{ ab.set('action', String(action||'')); }catch(e){}
      return ab;
    }
    try{
      return createObj('ability',{
        name:name, characterid:character.id, action:String(action||''), istokenaction:false
      });
    }catch(e2){ return null; }
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ab = findObjs({_type:'ability', _characterid:character.id, name:name})[0];
    try{ return ab ? (ab.get('action')||'') : ''; }catch(e){ return ''; }
  }

  function removeAbility(character, name){
    if(!character) return;
    var ab = findObjs({_type:'ability', _characterid:character.id, name:name})[0];
    if(ab){ try{ ab.remove(); }catch(e){} }
  }

  function deepCloneJSON(v){
    return JSON.parse(JSON.stringify(v));
  }

  function ensureStateRoot(){
    if(!state.dwt) state.dwt = {};
    if(!state.dwt.weather) state.dwt.weather = {};
    return state.dwt.weather;
  }

  function normalizeModuleVersion(moduleKey, moduleVersion){
    var mk = String(moduleKey || '').toLowerCase().replace(/[^a-z0-9]+/g,'');
    var mv = String(moduleVersion || '').replace(/^[^0-9]*/, '');
    return mk + '_' + mv;
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
    root[String(moduleKey || '').toLowerCase().replace(/[^a-z0-9]+/g,'')] = normalizeModuleVersion(moduleKey, moduleVersion);
    upsertAbility(character, 'version', serializeVersionRoot(root));
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
    var root = loadWeatherRootDirect(mule);
    if(!root || typeof root !== 'object') root = {};
    if(!root.meta || root.meta.schema !== 'dwt.weather.meta.v1'){
      root.meta = { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'' };
    }
    if(!root.settings || root.settings.schema !== 'dwt.weather.settings.v1'){
      root.settings = {
        schema:'dwt.weather.settings.v1',
        units:'imperial',
        override:{
          region:'', locale:'',
          tempBand:'', rainfall:'', storms:'',
          stormNow:''
        }
      };
    }
    if(!root.current || typeof root.current !== 'object') root.current = {};
    if(!root.history || typeof root.history !== 'object') root.history = {};
    if(!root.events || typeof root.events !== 'object') root.events = {};
    if(!root.windsock || typeof root.windsock !== 'object') root.windsock = {};
    root.meta.version = VERSION;
    root.meta.rootSchema = 'dwt.weather.root.v1';
    saveWeatherRootDirect(mule, root);
    return root;
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
      if(obj && typeof obj === 'object'){
        root = deepCloneJSON(obj);
      }else{
        root = {};
      }
      if(!root.meta || root.meta.schema!=='dwt.weather.meta.v1'){
        root.meta = { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'' };
      }
      if(!root.settings || root.settings.schema!=='dwt.weather.settings.v1'){
        root.settings = {
          schema:'dwt.weather.settings.v1',
          units:'imperial',
          override:{ region:'', locale:'', tempBand:'', rainfall:'', storms:'', stormNow:'' }
        };
      }
      if(!root.current || typeof root.current !== 'object') root.current = {};
      if(!root.history || typeof root.history !== 'object') root.history = {};
      if(!root.events || typeof root.events !== 'object') root.events = {};
      if(!root.windsock || typeof root.windsock !== 'object') root.windsock = {};
      root.meta.version = VERSION;
      root.meta.rootSchema = 'dwt.weather.root.v1';
      saveWeatherRootDirect(mule, root);
      return;
    }
    weatherPathSet(root, path, deepCloneJSON(obj));
    root.meta.version = VERSION;
    root.meta.rootSchema = 'dwt.weather.root.v1';
    saveWeatherRootDirect(mule, root);
  }

  function getJSONNoClone(mule, logicalPath){
    try{
      var root = ensureWeatherRoot(mule);
      var path = String(logicalPath||'');
      if(path.indexOf('weather.') === 0) path = path.slice(8);
      if(path === 'weather') return root;
      return weatherPathGet(root, path);
    }catch(e){ return null; }
  }

  function getQuipsArray(path){
    path = String(path||'').trim().toLowerCase();
    if(!path) return [];
    try{
      if(RT.dwt_quips && typeof RT.dwt_quips.getQuips === 'function'){
        var fromModule = RT.dwt_quips.getQuips(path);
        if(Array.isArray(fromModule)) return fromModule;
      }
    }catch(e){}
    try{
      var mule = ensureMule();
      var rawRoot = (getAbilityAction(mule, 'quips') || '').trim();
      if(rawRoot){
        var parsedRoot = JSON.parse(rawRoot);
        if(parsedRoot && parsedRoot.data && Array.isArray(parsedRoot.data[path])){
          return parsedRoot.data[path];
        }
      }
    }catch(e2){}
    var raw = getJSON(ensureMule(), path);
    return Array.isArray(raw) ? raw : [];
  }

  function canonicalKey(s){
    return lower(s).replace(/[^a-z]/g,'');
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

  function seasonFromMonth(m){
    m = clamp(+m||1,1,12);
    if(m===12 || m===1 || m===2) return 'winter';
    if(m>=3 && m<=5) return 'spring';
    if(m>=6 && m<=8) return 'summer';
    return 'autumn';
  }

  function pad2(n){ n=String(n||'0'); return n.length<2?('0'+n):n; }
  function stamp(nw){
    nw = nw || now();
    return String(nw.year||0)+'-'+pad2(nw.month||0)+'-'+pad2(nw.day||0)+'-'+String(nw.timeofday||'').replace(/\s+/g,'');
  }
  function tick(nw){
    nw = nw || now();
    var y=+nw.year||0;
    var m=clamp(+nw.month||1,1,12);
    var d=clamp(+nw.day||1,1,30);
    var tf=timeofdayIndex(nw.timeofday);
    return (((y*12 + (m-1))*30 + (d-1))*8 + tf);
  }

  function nowFromTick(t){
    t = (+t||0);
    if(t < 0) t = 0;
    var tf = (t % 8 + 8) % 8;
    var daysTotal = Math.floor(t / 8);
    var d = (daysTotal % 30) + 1;
    var monthsTotal = Math.floor(daysTotal / 30);
    var m = (monthsTotal % 12) + 1;
    var y = Math.floor(monthsTotal / 12);
    var timeofday = TIMEOFDAY_SEGMENTS[tf] || 'early morning';
    var hour =
      (tf===0)?0  :
      (tf===1)?3  :
      (tf===2)?6  :
      (tf===3)?9  :
      (tf===4)?12 :
      (tf===5)?15 :
      (tf===6)?18 : 21;
    return { year:y, month:m, day:d, hour:hour, minute:0, timeofday:timeofday, festival:'' };
  }

  // ----------------------------
  // Weather root paths (canonical logical paths beneath the single "weather" mule root)
  // ----------------------------
  function AB_SETTINGS(){ return 'weather.settings'; }
  function AB_META(){ return 'weather.meta'; }
  function AB_CUR(region, locale){ return 'weather.current.'+region+'.'+locale; }
  function AB_HIST(region, locale){ return 'weather.history.'+region+'.'+locale; }

  function AB_EVENTS(region, locale){ return 'weather.events.'+region+'.'+locale; }

  // Critical weather event categories tracked per region+locale.
  // Wind percent remains a sailing-strength indicator (windsock scale); critical events are separate state tracks.
  var CRITICAL_EVENT_TYPES = ['hurricane','gale','sandstorm'];

  function ensureSettings(mule){
    var s = getJSON(mule, AB_SETTINGS());
    if(!s || s.schema!=='dwt.weather.settings.v1'){
      s = {
        schema:'dwt.weather.settings.v1',
        units:'imperial',
        override:{
          region:'', locale:'',
          tempBand:'', rainfall:'', storms:'',
          stormNow:''
        }
      };
      setJSON(mule, AB_SETTINGS(), s);
    }
    return s;
  }

  function ensureMeta(mule){
    var m = getJSON(mule, AB_META());
    if(!m || m.schema!=='dwt.weather.meta.v1'){
      m = { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'' };
      setJSON(mule, AB_META(), m);
    }
    return m;
  }

  // ----------------------------
  // regionWeather profile loading
  // ----------------------------
  function loadRegionProfile(mule, region){
    region = canonicalKey(region);
    var root = getJSON(mule, 'regionWeather');
    if(!root || typeof root !== 'object' || !root.regions || typeof root.regions !== 'object') return null;
    var payload = root.regions[region] || null;
    if(payload && payload.schema==='dwt.regionweather.v1' && canonicalKey(payload.region)===region){
      return payload;
    }
    return null;
  }

  function loadedRegions(mule){
    var out=[];
    for(var i=0;i<REGIONS.length;i++){
      if(loadRegionProfile(mule, REGIONS[i])) out.push(REGIONS[i]);
    }
    return out;
  }

  // ----------------------------
  // Resolve region / locale (page name or override)
  // ----------------------------
  function normalizeMapNameForCompare(s){
    return lower(String(s||'')).replace(/\s+/g,'').replace(/[^a-z0-9._-]/g,'');
  }

  function resolveFromMeta(mule){
    var s = ensureSettings(mule);
    var r = canonicalKey((s.override&&s.override.region)||'');
    var l = canonicalKey((s.override&&s.override.locale)||'');
    if(REGIONS.indexOf(r)>=0 && LOCALES.indexOf(l)>=0) return {region:r, locale:l, source:'override'};
    return null;
  }

  function parsePageNameTriple(name){
    // region.locale.mapname
    var raw = normalizeMapNameForCompare(name);
    var m = raw.match(/^([a-z]+)\.([a-z]+)\.(.+)$/);
    if(!m) return null;
    var r = canonicalKey(m[1]), l = canonicalKey(m[2]), map = String(m[3]||'');
    if(REGIONS.indexOf(r)<0 || LOCALES.indexOf(l)<0 || !map) return null;
    return { region:r, locale:l, mapname:map };
  }

  function resolveFromPageId(pageId){
    try{
      var pg = getObj('page', pageId);
      if(!pg) return null;
      var trip = parsePageNameTriple(pg.get('name')||'');
      return trip ? { region:trip.region, locale:trip.locale, source:'page', mapname:trip.mapname, pageid:pageId } : null;
    }catch(e){ return null; }
  }

  function resolveFromPage(pid){
    var pageId = _activePageId(pid);
    return pageId ? resolveFromPageId(pageId) : null;
  }

  function resolveFromSelected(mule){
    // Kept for compatibility with existing flow: selected region/locale is override.
    return resolveFromMeta(mule);
  }

  function resolveRegionLocale(mule, explicit){
    explicit = explicit || {};
    var r = canonicalKey(explicit.region||'');
    var l = canonicalKey(explicit.locale||'');
    if(REGIONS.indexOf(r)>=0 && LOCALES.indexOf(l)>=0) return {region:r, locale:l, source:'explicit'};
    var fromMeta = resolveFromMeta(mule);
    if(fromMeta) return fromMeta;
    return null;
  }

  // ----------------------------
  // Profile access helpers
  // ----------------------------
  function getLocaleProfile(profile, locale){
    if(!profile || !profile.locales) return null;
    return profile.locales[locale] || null;
  }

  function pickOne(arr){
    if(!arr || !arr.length) return null;
    return arr[Math.floor(Math.random()*arr.length)];
  }

  function pickWeighted(dictOrArr){
    if(Array.isArray(dictOrArr)){
      return pickOne(dictOrArr);
    }
    var items = [];
    var total = 0;
    for(var k in dictOrArr){
      if(!dictOrArr.hasOwnProperty(k)) continue;
      var w = +dictOrArr[k] || 0;
      if(w<=0) continue;
      total += w;
      items.push({k:k, upto:total});
    }
    if(!items.length) return null;
    var roll = Math.random()*total;
    for(var i=0;i<items.length;i++){
      if(roll < items[i].upto) return items[i].k;
    }
    return items[items.length-1].k;
  }

  function chooseTempBand(lp, settings){
    var ov = ((settings||{}).override||{});
    if(ov.tempBand) return ov.tempBand;
    if(lp && lp.tempBands && typeof lp.tempBands === 'object'){
      var picked = pickWeighted(lp.tempBands);
      if(picked) return picked;
    }
    return 'temperate';
  }

  function chooseRainfall(lp, settings){
    var ov = ((settings||{}).override||{});
    if(ov.rainfall) return ov.rainfall;
    if(lp && lp.rainfall && typeof lp.rainfall === 'object'){
      var picked = pickWeighted(lp.rainfall);
      if(picked) return picked;
    }
    return 'none';
  }

  function chooseSkies(lp){
    if(lp && lp.skies && typeof lp.skies === 'object'){
      var picked = pickWeighted(lp.skies);
      if(picked) return picked;
    }
    return 'clear';
  }

  function chooseStormType(lp){
    if(lp && lp.stormTypes && typeof lp.stormTypes === 'object'){
      var picked = pickWeighted(lp.stormTypes);
      if(picked) return picked;
    }
    return 'storm';
  }

  function chooseWindPercent(lp){
    if(lp && lp.windPercent && typeof lp.windPercent === 'object'){
      var picked = pickWeighted(lp.windPercent);
      if(picked!=null){
        var n = parseInt(String(picked).replace(/[^\d]/g,''),10);
        if(!isNaN(n)) return clamp(n,0,100);
      }
    }
    return 25;
  }

  function chooseWindDir(lp){
    if(lp && lp.windDir && typeof lp.windDir === 'object'){
      var picked = pickWeighted(lp.windDir);
      if(picked) return normalizeDir16(picked);
    }
    return pickOne(COMPASS_16);
  }

  function chooseStormChance(lp, settings){
    var ov = ((settings||{}).override||{});
    if(ov.storms){
      var v = canonicalKey(ov.storms);
      if(v==='none' || v==='off') return 0;
      if(v==='low') return 15;
      if(v==='moderate' || v==='med') return 35;
      if(v==='high') return 65;
    }
    if(lp && lp.stormChanceByLocale && typeof lp.stormChanceByLocale === 'object'){
      var picked = pickWeighted(lp.stormChanceByLocale);
      if(picked!=null){
        var n = parseInt(String(picked).replace(/[^\d]/g,''),10);
        if(!isNaN(n)) return clamp(n,0,100);
      }
    }
    if(lp && typeof lp.stormChance === 'number') return clamp(lp.stormChance,0,100);
    return 20;
  }

  function normalizeDir16(v){
    v = String(v||'').trim().toUpperCase();
    if(!v) return 'N';
    if(COMPASS_16.indexOf(v)>=0) return v;
    var idx = _dirToIdx16(v);
    return COMPASS_16[idx] || 'N';
  }

  // ----------------------------
  // Quips
  // ----------------------------
  function weatherQuipKey(region, locale, cur){
    var season = lower(String(cur.season||''));
    var skies  = canonicalKey(cur.skies||'');
    var rain   = canonicalKey(cur.rainfall||'');
    var stormA = !!(cur.storm && cur.storm.active);
    var tempest = stormA ? canonicalKey(cur.storm.type||'storm') : '';

    var path1 = 'quips.weather.'+canonicalKey(region)+'.'+canonicalKey(locale)+'.'+season;
    var path2 = path1 + '.' + (stormA ? tempest : (rain||skies||'clear'));
    return { general:path1, specific:path2 };
  }

  function pickQuip(region, locale, cur){
    var paths = weatherQuipKey(region, locale, cur);
    var a = getQuipsArray(paths.specific);
    if(a && a.length) return pickOne(a);
    var b = getQuipsArray(paths.general);
    if(b && b.length) return pickOne(b);
    return '';
  }

  // ----------------------------
  // Weather snapshot model
  // ----------------------------
  function emptyCurrent(region, locale){
    return {
      schema:'dwt.weather.current.v1',
      region:canonicalKey(region),
      locale:canonicalKey(locale),
      season:'winter',
      tempBand:'temperate',
      tempF:60, tempC:16,
      rainfall:'none',
      skies:'clear',
      storm:{ active:false, type:'', critical:false },
      wind:{ percent:0, dir:'N' },
      narrative:'',
      quip:'',
      stamp:'',
      tick:null
    };
  }

  function toC(f){ return Math.round((f-32)*5/9); }

  function tempBandToF(band, region, locale, season){
    band = canonicalKey(band);
    // DWT canonical descriptive temperatures; kept stable to avoid unauthorized behavior changes.
    if(band==='frigid') return 20;
    if(band==='cold') return 33;
    if(band==='temperate') return 55;
    if(band==='warm') return 74;
    if(band==='hot') return 90;
    return 55;
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
    h.entries.push({ tick:cur.tick, stamp:cur.stamp, snapshot:cur });
    // Keep bounded to avoid runaway journal bloat.
    if(h.entries.length > 160) h.entries = h.entries.slice(h.entries.length - 160);
    setJSON(mule, AB_HIST(region, locale), h);
  }

  function storeCurrentAndHistory(mule, region, locale, cur){
    setJSON(mule, AB_CUR(region, locale), cur);
    appendHistory(mule, region, locale, cur);
  }

  function generateFresh(profile, settings, region, locale, nw){
    var lp = getLocaleProfile(profile, locale) || {};
    var cur = emptyCurrent(region, locale);
    cur.season = seasonFromMonth((nw||now()).month);
    cur.tempBand = chooseTempBand(lp, settings);
    cur.tempF = tempBandToF(cur.tempBand, region, locale, cur.season);
    cur.tempC = toC(cur.tempF);
    cur.rainfall = chooseRainfall(lp, settings);
    cur.skies = chooseSkies(lp);
    cur.wind.percent = chooseWindPercent(lp);
    cur.wind.dir = chooseWindDir(lp);

    var forcedStorm = canonicalKey((((settings||{}).override||{}).stormNow)||'');
    if(forcedStorm){
      cur.storm.active = true;
      cur.storm.type = forcedStorm;
      cur.storm.critical = false;
    }else{
      var chance = chooseStormChance(lp, settings);
      if(r1_100() <= chance){
        cur.storm.active = true;
        cur.storm.type = chooseStormType(lp);
      }
    }

    cur.narrative = buildNarrative(cur, (settings||{}).units || 'imperial');
    cur.quip = pickQuip(region, locale, cur) || '';
    cur.stamp = stamp(nw);
    cur.tick = tick(nw);
    return cur;
  }

  function adjustTempBand(cur, delta){
    var order = ['frigid','cold','temperate','warm','hot'];
    var idx = order.indexOf(canonicalKey(cur.tempBand));
    if(idx<0) idx = 2;
    idx = clamp(idx + delta, 0, order.length-1);
    cur.tempBand = order[idx];
  }

  function updateIncremental(profile, settings, region, locale, prev, nw){
    var lp = getLocaleProfile(profile, locale) || {};
    var cur = prev ? deepCloneJSON(prev) : emptyCurrent(region, locale);
    var season = seasonFromMonth((nw||now()).month);

    // Season shift can affect baseline temp band slightly. Preserve continuity with small drift.
    if(season !== cur.season){
      cur.season = season;
      if(season==='winter') adjustTempBand(cur,-1);
      else if(season==='summer') adjustTempBand(cur,+1);
    }

    // Temperature drift
    var tempDrift = r1_100();
    if(tempDrift <= 15) adjustTempBand(cur,-1);
    else if(tempDrift >= 86) adjustTempBand(cur,+1);

    cur.tempF = tempBandToF(cur.tempBand, region, locale, cur.season);
    cur.tempC = toC(cur.tempF);

    // Rainfall / skies continuity
    if(r1_100() <= 25) cur.rainfall = chooseRainfall(lp, settings);
    if(r1_100() <= 25) cur.skies = chooseSkies(lp);

    // Wind continuity
    if(r1_100() <= 35) cur.wind.percent = chooseWindPercent(lp);
    if(r1_100() <= 35) cur.wind.dir = chooseWindDir(lp);

    // Storm handling
    var forcedStorm = canonicalKey((((settings||{}).override||{}).stormNow)||'');
    if(forcedStorm){
      cur.storm.active = true;
      cur.storm.type = forcedStorm;
      cur.storm.critical = false;
    }else{
      var chance = chooseStormChance(lp, settings);
      if(cur.storm && cur.storm.active){
        // Ongoing storms tend to persist briefly.
        if(r1_100() <= 55){
          // keep
        }else{
          cur.storm.active = false;
          cur.storm.type = '';
          cur.storm.critical = false;
        }
      }else if(r1_100() <= chance){
        cur.storm.active = true;
        cur.storm.type = chooseStormType(lp);
        cur.storm.critical = false;
      }
    }

    cur.narrative = buildNarrative(cur, (settings||{}).units || 'imperial');
    cur.quip = pickQuip(region, locale, cur) || '';
    cur.stamp = stamp(nw);
    cur.tick = tick(nw);
    cur.season = season;
    return cur;
  }

  // ----------------------------
  // Critical weather event tracking
  // ----------------------------
  function emptyCriticalEventState(){
    return {
      active:false,
      pressure:0,
      delta:0,
      chance:0,
      startedTick:null,
      startedStamp:''
    };
  }

  function ensureEventsRecord(mule, region, locale){
    var rec = getJSON(mule, AB_EVENTS(region, locale));
    if(!rec || rec.schema!=='dwt.weather.events.v1'){
      rec = {
        schema:'dwt.weather.events.v1',
        region:canonicalKey(region),
        locale:canonicalKey(locale),
        stamp:'',
        tick:null,
        events:{
          hurricane:emptyCriticalEventState(),
          gale:emptyCriticalEventState(),
          sandstorm:emptyCriticalEventState()
        }
      };
      setJSON(mule, AB_EVENTS(region, locale), rec);
      return rec;
    }

    if(!rec.events || typeof rec.events !== 'object') rec.events = {};
    for(var i=0;i<CRITICAL_EVENT_TYPES.length;i++){
      var k = CRITICAL_EVENT_TYPES[i];
      if(!rec.events[k] || typeof rec.events[k] !== 'object'){
        rec.events[k] = emptyCriticalEventState();
      }
      var e = rec.events[k];
      if(!e.hasOwnProperty('active')) e.active = false;
      if(!e.hasOwnProperty('pressure')) e.pressure = 0;
      if(!e.hasOwnProperty('delta')) e.delta = 0;
      if(!e.hasOwnProperty('chance')) e.chance = 0;
      if(!e.hasOwnProperty('startedTick')) e.startedTick = null;
      if(!e.hasOwnProperty('startedStamp')) e.startedStamp = '';
    }
    if(!rec.hasOwnProperty('tick')) rec.tick = null;
    if(!rec.hasOwnProperty('stamp')) rec.stamp = '';
    return rec;
  }

  function eventTypeApplies(region, locale, type){
    region = canonicalKey(region);
    locale = canonicalKey(locale);
    type   = canonicalKey(type);

    if(type==='hurricane'){
      return region==='moonshaes' || locale==='offshore' || region==='landsofintrigue' || region==='swordcoast';
    }
    if(type==='gale'){
      return locale==='offshore' || locale==='coastal';
    }
    if(type==='sandstorm'){
      return region==='landsofintrigue' && locale!=='offshore';
    }
    return false;
  }

  function computeCriticalCategoryChance(type, cur){
    type = canonicalKey(type);
    var wind = clamp(+((cur&&cur.wind&&cur.wind.percent)||0),0,100);
    var rain = canonicalKey((cur&&cur.rainfall)||'');
    var skies = canonicalKey((cur&&cur.skies)||'');
    var stormType = canonicalKey((cur&&cur.storm&&cur.storm.type)||'');
    var stormActive = !!(cur && cur.storm && cur.storm.active);

    var p = 0;

    if(type==='hurricane'){
      p += Math.max(0, wind - 55);
      if(rain==='heavy') p += 12;
      if(stormActive) p += 18;
      if(stormType==='hurricane') p += 30;
      if(skies==='overcast') p += 4;
    }else if(type==='gale'){
      p += Math.max(0, wind - 40);
      if(rain==='moderate') p += 6;
      if(rain==='heavy') p += 10;
      if(stormActive) p += 14;
      if(stormType==='gale') p += 26;
      if(skies==='overcast') p += 4;
    }else if(type==='sandstorm'){
      p += Math.max(0, wind - 45);
      if(stormActive) p += 12;
      if(stormType==='sandstorm') p += 32;
      // Sandstorms prefer dry / dusty conditions, not rainfall.
      if(rain==='none') p += 8;
      if(skies==='overcast') p += 2;
    }

    return clamp(p, 0, 100);
  }

  function applyPressureDrift(prevPressure, chance){
    var drift = 0;

    if(chance >= 70) drift = Math.floor(Math.random()*9) + 5;        // +5..+13
    else if(chance >= 45) drift = Math.floor(Math.random()*7) + 2;   // +2..+8
    else if(chance >= 20) drift = Math.floor(Math.random()*5) - 1;   // -1..+3
    else drift = -1 * (Math.floor(Math.random()*6) + 1);             // -1..-6

    return clamp(prevPressure + drift, 0, 100);
  }

  function updateCriticalEventsForLocation(mule, region, locale, cur){
    var rec = ensureEventsRecord(mule, region, locale);
    rec.tick = +cur.tick;
    rec.stamp = String(cur.stamp||'');

    for(var i=0;i<CRITICAL_EVENT_TYPES.length;i++){
      var type = CRITICAL_EVENT_TYPES[i];
      var e = rec.events[type];

      if(!eventTypeApplies(region, locale, type)){
        e.active = false;
        e.pressure = 0;
        e.delta = 0;
        e.chance = 0;
        e.startedTick = null;
        e.startedStamp = '';
        continue;
      }

      var chance = computeCriticalCategoryChance(type, cur);
      var nextPressure = applyPressureDrift(+e.pressure||0, chance);
      var delta = nextPressure - (+e.pressure||0);

      e.delta = delta;
      e.pressure = nextPressure;
      e.chance = chance;

      // streak counts in timeofday segments (ticks)
      if(!e.active){
        if(nextPressure >= 85 && chance >= 50){
          e.active = true;
          e.startedTick = rec.tick;
          e.startedStamp = rec.stamp;
        }
      }else{
        // Once active, let it decay more slowly.
        if(nextPressure <= 35 && chance <= 20){
          e.active = false;
          e.startedTick = null;
          e.startedStamp = '';
        }else{
          // When active, keep pressure pinned high to prevent immediate decay from a single tick.
          if(e.pressure < 55) e.pressure = 55;
        }
      }

      // Reflect active critical event into the current weather state, without destroying ordinary storm info.
      if(e.active){
        cur.storm = cur.storm || { active:true, type:type, critical:true };
        cur.storm.active = true;
        cur.storm.type = type;
        cur.storm.critical = true;
      }
    }

    setJSON(mule, AB_EVENTS(region, locale), rec);
    return rec;
  }

  // ----------------------------
  // Narrative/weather line builders
  // ----------------------------
  function describeTempBand(cur, units){
    if((units||'imperial') === 'metric'){
      return cur.tempC+'°C';
    }
    return cur.tempF+'°F';
  }

  function describeTempAdj(cur){
    var t = canonicalKey(cur.tempBand);
    if(t==='frigid') return 'frigid';
    if(t==='cold') return 'cold';
    if(t==='temperate') return 'temperate';
    if(t==='warm') return 'warm';
    if(t==='hot') return 'hot';
    return 'temperate';
  }

  function describeSkies(cur){
    var sky = canonicalKey(cur.skies);
    if(sky==='clear') return 'clear';
    if(sky==='cloudy') return 'cloudy';
    if(sky==='overcast') return 'overcast';
    if(sky==='fog') return 'foggy';
    return sky || 'clear';
  }

  function buildNarrative(cur, units){
    var temp = describeTempBand(cur, units);
    var adj  = describeTempAdj(cur);
    var skies = describeSkies(cur);
    var line = 'At '+temp+', the temperature is '+adj+', and the skies are '+skies;

    if(cur.rainfall && canonicalKey(cur.rainfall) !== 'none'){
      line += ' with '+cur.rainfall+' rain';
    }

    if(cur.storm && cur.storm.active){
      line += ' and '+String(cur.storm.type||'storm');
      if(cur.storm.critical) line += ' conditions';
    }

    var percent = clamp(+((cur&&cur.wind&&cur.wind.percent)||0),0,100);
    var dir = normalizeDir16((cur&&cur.wind&&cur.wind.dir)||'N');
    var mph = 0;
    if(percent===0) mph = 0;
    else if(percent<=20) mph = 3;
    else if(percent<=40) mph = 6;
    else if(percent<=60) mph = 9;
    else if(percent<=80) mph = 12;
    else mph = 15;

    line += ' with '+((percent===0)?'dead calm':('wind coming from the '+dirToWords16(dir)+' at about '+mph+' mph'));
    line += '.';

    return line;
  }

  function weatherLine(mule, region, locale, cur, units){
    var narrative = String((cur&&cur.narrative)||'').trim();
    if(!narrative) narrative = buildNarrative(cur, units||'imperial');
    return narrative;
  }

  function weatherQuipLine(mule, region, locale, cur){
    var q = String((cur&&cur.quip)||'').trim();
    if(q) return q;
    return pickQuip(region, locale, cur) || '';
  }

  // ----------------------------
  // Windsock mapping and updates
  // ----------------------------
  function windsockTargetsFromWeather(mule, region, locale, cur){
    var dirIdx = _dirToIdx16((cur&&cur.wind&&cur.wind.dir)||'N');

    var sideIdx = 0;
    var p = clamp(+((cur&&cur.wind&&cur.wind.percent)||0),0,100);
    if(cur && cur.storm && cur.storm.active && cur.storm.critical){
      var st = canonicalKey(cur.storm.type||'');
      if(st==='sandstorm') sideIdx = 7;
      else if(st==='gale') sideIdx = 8;
      else if(st==='hurricane') sideIdx = 9;
      else sideIdx = 6;
    }else{
      if(p<=0) sideIdx = 0;
      else if(p<=20) sideIdx = 1;
      else if(p<=40) sideIdx = 2;
      else if(p<=60) sideIdx = 3;
      else if(p<=80) sideIdx = 4;
      else sideIdx = 5;
    }

    return { dirIdx:dirIdx, sideIdx:sideIdx };
  }

  function updateWindsockAndTooltipForPageId(mule, pageId){
    pageId = String(pageId||'');
    if(!pageId) return false;

    var tok = _findWindsockToken(pageId);
    if(!tok) return false;

    var rl = resolveFromPageId(pageId) || resolveFromMeta(mule);
    if(!rl) return false;

    var settings = ensureSettings(mule);
    var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
    if(!cur) return false;

    var tgt = windsockTargetsFromWeather(mule, rl.region, rl.locale, cur);

    var fromDirIdx = 0, fromSideIdx = 0;
    try{ fromDirIdx = (Math.round((+tok.get('rotation')||0)/22.5)%16+16)%16; }catch(e){}
    try{ fromSideIdx = clamp(+tok.get('currentSide')||0, 0, 9); }catch(e2){}

    _wsAnimate(pageId, tok, fromDirIdx, tgt.dirIdx, fromSideIdx, tgt.sideIdx);
    _wsStore(mule, pageId, tgt.dirIdx, tgt.sideIdx);

    try{ tok.set('tooltip', String(weatherLine(mule, rl.region, rl.locale, cur, settings.units)||'')); }catch(e3){}
    return true;
  }

  function updatePageWindsockAndTooltip(mule, pid, pageId){
    if(!pageId) return false;
    return updateWindsockAndTooltipForPageId(mule, pageId);
  }

  function updateActivePageWindsockAndTooltip(mule, pid){
    var pageId = _activePageId(pid);
    if(!pageId) return false;
    return updateWindsockAndTooltipForPageId(mule, pageId);
  }

  // ----------------------------
  // Ensure current weather exists for every loaded region/locale
  // ----------------------------
  function ensureAllExistIfMissing(mule, pid){
    var settings = ensureSettings(mule);
    var nw = now();
    var regions = loadedRegions(mule);
    if(!regions.length) return { ok:false, error:'No regionWeather modules loaded.' };

    for(var ri=0;ri<regions.length;ri++){
      var region = regions[ri];
      var profile = loadRegionProfile(mule, region);
      for(var li=0;li<LOCALES.length;li++){
        var locale = LOCALES[li];
        var cur = getJSON(mule, AB_CUR(region, locale));
        if(!cur){
          cur = generateFresh(profile, settings, region, locale, nw);
          updateCriticalEventsForLocation(mule, region, locale, cur);
          storeCurrentAndHistory(mule, region, locale, cur);
          updateCriticalEventsForLocation(mule, region, locale, cur);
                }
        // Ensure critical-event tracking record exists even if weather already existed.
        var cur2 = getJSON(mule, AB_CUR(region, locale));
        if(cur2) updateCriticalEventsForLocation(mule, region, locale, cur2);
      }
    }
    return { ok:true };
  }

  function updateAllCalendarAware(mule, pid, rlOverride){
    var meta = ensureMeta(mule);
    var nw = now();
    var nowTick = tick(nw);

    var regions = loadedRegions(mule);
    if(!regions.length){
      whisper(pid,'<div style="border:1px solid #666;padding:8px;"><b>dwt_weather</b>: No regionWeather modules detected.</div>');
      return { ok:false, error:'No regionWeather modules loaded.' };
    }

    // Ensure baseline.
    ensureAllExistIfMissing(mule, null);

    var last = (meta.lastTick==null) ? nowTick : (+meta.lastTick||nowTick);

    // Rewind-aware behavior:
    // - If the calendar moved backwards, set current weather to that earlier tick if present in history.
    // - If missing, generate it and backfill forward up to the most-recent tick so intervening history exists.
    // - If the calendar moved forwards, apply one update per elapsed timeofday segment (capped).
    var steps = 0;

    function getHistEntryAtTick(region, locale, t){
      var hist = getJSON(mule, AB_HIST(region, locale));
      if(!hist || hist.schema!=='dwt.weather.history.v1' || !Array.isArray(hist.entries)) return null;
      for(var i=hist.entries.length-1;i>=0;i--){
        var e = hist.entries[i];
        if((+e.tick)===t) return e;
      }
      return null;
    }

    function getNearestEarlierHist(region, locale, t){
      var hist = getJSON(mule, AB_HIST(region, locale));
      if(!hist || hist.schema!=='dwt.weather.history.v1' || !Array.isArray(hist.entries) || !hist.entries.length) return null;
      var best=null, bestTick=-1;
      for(var i=0;i<hist.entries.length;i++){
        var e=hist.entries[i]; var et=+e.tick;
        if(et < t && et > bestTick){ best=e; bestTick=et; }
      }
      return best;
    }

    function getMaxHistTick(region, locale){
      var hist = getJSON(mule, AB_HIST(region, locale));
      if(!hist || hist.schema!=='dwt.weather.history.v1' || !Array.isArray(hist.entries) || !hist.entries.length) return null;
      var mx = -1;
      for(var i=0;i<hist.entries.length;i++){
        var et = +hist.entries[i].tick;
        if(et > mx) mx = et;
      }
      return (mx>=0)?mx:null;
    }

    function appendSnapshot(region, locale, cur){
      // store only history (do not disturb current unless intended)
      appendHistory(mule, region, locale, cur);
      setJSON(mule, AB_CUR(region, locale), cur);
    }

    // Determine a "most recent" tick across meta + history for backfill target.
    var mostRecentTick = last;
    if(nowTick > mostRecentTick) mostRecentTick = nowTick;

    for(var ri=0;ri<regions.length;ri++){
      var region = regions[ri];
      var profile = loadRegionProfile(mule, region);
      var settings = ensureSettings(mule);

      for(var li=0;li<LOCALES.length;li++){
        var locale = LOCALES[li];

        var histMax = getMaxHistTick(region, locale);
        if(histMax != null && histMax > mostRecentTick) mostRecentTick = histMax;
      }
    }

    if(nowTick < last){
      // Rewind path
      for(var ri=0;ri<regions.length;ri++){
        var region = regions[ri];
        var profile = loadRegionProfile(mule, region);
        var settings = ensureSettings(mule);

        for(var li=0;li<LOCALES.length;li++){
          var locale = LOCALES[li];

          // 1) If exact tick exists, set current to it.
          var exact = getHistEntryAtTick(region, locale, nowTick);
          if(exact && exact.snapshot){
            setJSON(mule, AB_CUR(region, locale), exact.snapshot);
            updateCriticalEventsForLocation(mule, region, locale, exact.snapshot);
            continue;
          }

          // 2) Start from nearest earlier; otherwise generate fresh at nowTick.
          var startEntry = getNearestEarlierHist(region, locale, nowTick);
          var cur;
          var startTick;
          if(startEntry && startEntry.snapshot){
            cur = startEntry.snapshot;
            startTick = +startEntry.tick;
          }else{
            var nw0 = nowFromTick(nowTick);
            cur = generateFresh(profile, settings, region, locale, nw0);
            cur.tick = nowTick;
            cur.stamp = stamp(nw0);
            cur.season = seasonFromMonth(nw0.month);
            appendHistory(mule, region, locale, cur);
            startTick = nowTick;
          }

          // 3) Backfill forward up to the most recent tick so intervening history exists.
          //    Cap to avoid runaway.
          var endTick = clamp(mostRecentTick, startTick, startTick + 160);
          for(var t = startTick+1; t<=endTick; t++){
            var nw1 = nowFromTick(t);
            cur = updateIncremental(profile, settings, region, locale, cur, nw1);
            // ensure tick reflects target
            cur.tick = t;
            cur.stamp = stamp(nw1);
            cur.season = seasonFromMonth(nw1.month);
            appendHistory(mule, region, locale, cur);
          }

          // 4) Set current to the nowTick snapshot we just created during backfill.
          var created = getHistEntryAtTick(region, locale, nowTick);
          if(created && created.snapshot){
            setJSON(mule, AB_CUR(region, locale), created.snapshot);
            updateCriticalEventsForLocation(mule, region, locale, created.snapshot);
          }
        }
      }

      meta.lastTick = nowTick;
      meta.lastStamp = stamp(nowFromTick(nowTick));
      setJSON(mule, AB_META(), meta);

      whisper(pid,'<div style="border:1px solid #666;padding:8px;"><b>dwt_weather</b>: Weather loaded for the earlier time and history was backfilled as needed.</div>');
      return { ok:true, steps:0, rewind:true };
    }

    // Forward path
    var delta = Math.max(0, nowTick - last);

    // Apply 1 update per elapsed timeofday segment, capped to 40 to avoid runaway.
    steps = clamp(delta, 0, 40);

    for(var s=1;s<=steps;s++){
      var t = last + s;
      var nwStep = nowFromTick(t);
      for(var ri=0;ri<regions.length;ri++){
        var region = regions[ri];
        var profile = loadRegionProfile(mule, region);
        var settings = ensureSettings(mule);
        for(var li=0;li<LOCALES.length;li++){
          var locale = LOCALES[li];
          var cur = getJSON(mule, AB_CUR(region, locale));
          cur = updateIncremental(profile, settings, region, locale, cur, nwStep);
          // ensure tick reflects step
          cur.tick = t;
          cur.stamp = stamp(nwStep);
          cur.season = seasonFromMonth(nwStep.month);
          updateCriticalEventsForLocation(mule, region, locale, cur);
          storeCurrentAndHistory(mule, region, locale, cur);
        }
      }
    }

    meta.lastTick = nowTick;
    meta.lastStamp = stamp(nw);
    setJSON(mule, AB_META(), meta);

    return { ok:true, steps:steps };
  }

  // ----------------------------
  // Unified Campaign Log injection
  // ----------------------------
  function renderLogCard(pid){
    var mule = ensureMule();
    var settings = ensureSettings(mule);
    var rl = resolveFromPage(pid) || resolveRegionLocale(mule, null);

    if(!rl){
      // silent for players; GM gets prompt hint.
      if(isGM(pid)){
        return '<div style="margin-top:8px;"><i>Weather not set: name the current page as <b>region.locale.mapname</b> or use <b>!dwt --weather set region ... locale ...</b>.</i></div>';
      }
      return '';
    }

    var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
    if(!cur){
      var prof = loadRegionProfile(mule, rl.region);
      cur = generateFresh(prof, settings, rl.region, rl.locale, now());
      updateCriticalEventsForLocation(mule, rl.region, rl.locale, cur);
      storeCurrentAndHistory(mule, rl.region, rl.locale, cur);
    }

    var line = weatherLine(mule, rl.region, rl.locale, cur, settings.units);

    return '<div>'+esc(line)+'</div>';
  }

  // ----------------------------
  // Command handling (full msg parsing)
  // ----------------------------
  function normalizeRegionInput(s){
    return canonicalKey(s).replace(/\s+/g,'');
  }

  
  function nowNarrativeLine(){
    try{
      if(RT.dwt_calendar && typeof RT.dwt_calendar._dateLine==='function'){
        return RT.dwt_calendar._dateLine();
      }
    }catch(e){}
    // Fallback: minimal narrative using state.dwt.now (may omit festival pretty-name).
    try{
      var n = (state && state.dwt && state.dwt.now) ? state.dwt.now : null;
      if(!n) return '';
      var tf = String(n.timeofday||'').trim() || 'early morning';
      if(n.festival){
        return 'It is currently '+tf+' on '+String(n.festival)+', '+(n.year||1492)+' DR.';
      }
      var short = ['Hammer','Alturiak','Ches','Tarsakh','Mirtul','Kythorn','Flamerule','Eleasis','Eleint','Marpenoth','Uktar','Nightal'];
      var mi = Math.max(1, Math.min(12, +n.month||1)) - 1;
      return 'It is currently '+tf+' on '+(+n.day||1)+' '+short[mi]+', '+(n.year||1492)+' DR.';
    }catch(e2){}
    return '';
  }

// Weather verify/sync: ensures a current weather record exists for the resolved page and syncs windsock + tooltip.
// IMPORTANT: This does NOT advance or re-roll weather forward in time. Only `--weather update` does that.
function weatherVerifySyncActivePage(pid, opts){
  opts = opts||{};
  var mule = ensureMule();
  var settings = ensureSettings(mule);

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
  var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
  if(!cur){
    var profile = loadRegionProfile(mule, rl.region);
    cur = generateFresh(profile, settings, rl.region, rl.locale, now());
    updateCriticalEventsForLocation(mule, rl.region, rl.locale, cur);
    storeCurrentAndHistory(mule, rl.region, rl.locale, cur);
  }

  // Sync windsock + tooltip (target page if provided; else caller's effective/active page).
  try{
    if(opts.pageId){
      updatePageWindsockAndTooltip(mule, pid, String(opts.pageId));
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

    // Ensure weather is current for the current calendar tick (including rewind/backfill logic)
    var up = updateAllCalendarAware(mule, pid, rlOverride);
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
        var rl = rlOverride || resolveFromPage(pid) || resolveFromSelected(mule) || resolveFromMeta(mule);
        if(rl){
          var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
          if(cur){
            whisper(pid,'<div>'+esc(weatherLine(mule, rl.region, rl.locale, cur, ensureSettings(mule).units))+'</div>');
          }
        }
      }catch(e2){}
    }
    return { ok:true, steps: up.steps||0, rewind: !!up.rewind };
  }

  function handleWeatherExpr(pid, arg, opts){
    opts = opts||{};
    var mule = ensureMule();
    var settings = ensureSettings(mule);

    var a = lower(String(arg||'')).trim();
    var tokens = a ? a.split(/\s+/) : [];

    function resolveRL(){
      return resolveFromPage(pid) || resolveRegionLocale(mule, null);
    }

    function ensureCurForRL(rl){
      if(!rl) return null;
      var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
      if(!cur){
        var profile = loadRegionProfile(mule, rl.region);
        cur = generateFresh(profile, settings, rl.region, rl.locale, now());
        updateCriticalEventsForLocation(mule, rl.region, rl.locale, cur);
        storeCurrentAndHistory(mule, rl.region, rl.locale, cur);
      }
      return getJSON(mule, AB_CUR(rl.region, rl.locale)) || cur;
    }

    function syncWindsock(){
      try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e){}
    }

    function whisperWeatherOnly(cur, rl){
      if(cur && rl){
        var line = weatherLine(mule, rl.region, rl.locale, cur, settings.units);
        if(line){ whisper(pid, '<div>'+esc(line)+'</div>'); }
      }
    }

    // No args: echo current weather narrative to chat (no panel redraw).
    if(!tokens.length){
      ensureAllExistIfMissing(mule, pid);
      // Verify/sync windsock & tooltip (no advance).
      weatherVerifySyncActivePage(pid, {});
      updateAllCalendarAware(mule, pid);
      var rl0 = resolveRL();
      var cur0 = ensureCurForRL(rl0);
      syncWindsock();
      whisperWeatherOnly(cur0, rl0);
      return { changed:false };
    }

    if(tokens[0]==='help'){
      return { changed:false };
    }

    // list events (GM only) - reuse legacy output
    if(tokens[0]==='list' && tokens[1]==='events'){
      if(!isGM(pid)) return { error:'Only the GM may list critical weather events.', changed:false };
      try{ legacyHandle(tokens, pid, mule, settings); }catch(e){ return { error:String(e), changed:false }; }
      return { changed:false };
    }

    // update:
    // - Player: updates current weather for the player's effective page, syncs that page windsock, whispers weather narrative.
    // - GM: by default updates the ribbon page AND every page that currently has players (split-party aware).
    //       GM may also target pages by region, region.locale, or map name:
    //         !dwt --weather update frozenfar
    //         !dwt --weather update frozenfar.inland
    //         !dwt --weather update iceplains
    //       Multiple targets may be provided; tokens are normalized (lower-case, no spaces). '|' groups are allowed.
    if(tokens[0]==='update'){
      if(!isGM(pid)) return { error:'Only the GM may update weather.', changed:false };
      ensureAllExistIfMissing(mule, pid);
      var up = updateAllCalendarAware(mule, pid);
      if(!up || up.ok===false){
        return { error:(up && up.error) ? up.error : 'Weather update failed.', changed:false };
      }

      function syncOnePage(pageId, echo, label){
        try{
          var rlP = resolveFromPageId(pageId) || resolveRegionLocale(mule, null);
          if(!rlP) return false;

          var curP = ensureCurForRL(rlP);
          if(!curP) return false;

          // Ensure windsock + tooltip on that page.
          try{
            // Temporarily treat this page as "active" by directly invoking the pageId-aware updater.
            var tok = _findWindsockToken(pageId);
            if(tok){
              // Mirror logic: animate to target and set tooltip.
              var settingsP = ensureSettings(mule);
              var tgt = windsockTargetsFromWeather(mule, rlP.region, rlP.locale, curP);

              var fromDirIdx = 0, fromSideIdx = 0;
              try{ fromDirIdx = (Math.round((+tok.get('rotation')||0)/22.5)%16+16)%16; }catch(e0){}
              try{ fromSideIdx = clamp(+tok.get('currentSide')||0, 0, 9); }catch(e1){}
              _wsAnimate(pageId, tok, fromDirIdx, tgt.dirIdx, fromSideIdx, tgt.sideIdx);
              _wsStore(mule, pageId, tgt.dirIdx, tgt.sideIdx);

              var line = weatherLine(mule, rlP.region, rlP.locale, curP, settingsP.units);
              try{ tok.set('tooltip', String(line||'')); }catch(e2){}
            }
          }catch(eTok){}

          if(echo){
            var line2 = weatherLine(mule, rlP.region, rlP.locale, curP, settings.units);
            if(line2){
              var prefix = label ? ('<b>'+esc(label)+'</b>: ') : '';
              whisper(pid, '<div>'+prefix+esc(line2)+'</div>');
            }
          }
          return true;
        }catch(e){ return false; }
      }

      // Targets provided?
      var targetsRaw = tokens.slice(1);
      var targets = [];
      if(targetsRaw.length){
        // Preserve "Ice Plains" by joining, but also support multiple by '|' or multiple tokens.
        var joined = String(a).replace(/^update\s*/,'');
        joined.split('|').forEach(function(t){
          t = String(t||'').trim();
          if(t) targets.push(t);
        });
        // If no pipe, still accept tokenized targets (e.g. "frozenfar inland").
        if(targets.length===1 && targetsRaw.length>1 && joined.indexOf('|')<0){
          // Treat each token as its own target.
          targets = targetsRaw.slice(0);
        }
      }

      // GM default: ribbon + all player pages
      if(isGM(pid) && !targets.length){
        var pageIds = [];
        try{
          if(RT.dwt && typeof RT.dwt.getActivePlayerPageIds==='function'){
            pageIds = RT.dwt.getActivePlayerPageIds();
          }else{
            // local fallback
            var c = Campaign();
            var psp = c.get('playerspecificpages')||{};
            var set = {};
            for(var k in psp){ if(psp.hasOwnProperty(k)){ set[String(psp[k])] = true; } }
            set[String(c.get('playerpageid'))] = true;
            pageIds = Object.keys(set);
          }
        }catch(e3){}
        pageIds.forEach(function(pgId){
          var pg = getObj('page', pgId);
          var label = pg ? (pg.get('name')||'page') : 'page';
          syncOnePage(pgId, true, label);
        });
        return { changed:false };
      }

      // GM targeted update(s)
      if(isGM(pid) && targets.length){
        // Build candidate page matches from region, region.locale, or mapname.
        var pages = findObjs({_type:'page'}) || [];
        var matched = {};
        targets.forEach(function(tRaw){
          var t = normalizeMapNameForCompare(tRaw);
          if(!t) return;

          // region.locale exact
          var m = t.match(/^([a-z]+)\.([a-z]+)$/);
          if(m){
            var rr = canonicalKey(m[1]), ll = canonicalKey(m[2]);
            pages.forEach(function(pg){
              var tr = parsePageNameTriple(pg.get('name')||'');
              if(tr && tr.region===rr && tr.locale===ll) matched[pg.id] = true;
            });
            return;
          }

          // region exact
          if(REGIONS.indexOf(canonicalKey(t)) >= 0){
            var rOnly = canonicalKey(t);
            pages.forEach(function(pg){
              var tr = parsePageNameTriple(pg.get('name')||'');
              if(tr && tr.region===rOnly) matched[pg.id] = true;
            });
            return;
          }

          // mapname exact
          pages.forEach(function(pg){
            var tr = parsePageNameTriple(pg.get('name')||'');
            if(tr && normalizeMapNameForCompare(tr.mapname) === t) matched[pg.id] = true;
          });
        });

        var ids = Object.keys(matched);
        if(!ids.length){
          return { error:'No pages matched the specified weather update target(s).', changed:false };
        }

        ids.forEach(function(pgId){
          var pg = getObj('page', pgId);
          var label = pg ? (pg.get('name')||'page') : 'page';
          syncOnePage(pgId, true, label);
        });
        return { changed:false };
      }
    }

    // narrative
    if(tokens[0]==='narrative'){
      var rlN = resolveRL();
      var curN = ensureCurForRL(rlN);
      if(rlN && curN){
        var narr = nowNarrativeLine();
        var lineN = weatherLine(mule, rlN.region, rlN.locale, curN, settings.units);
        whisper(pid, '<div>'+esc(narr + ' ' + lineN)+'</div>');
      }
      return { changed:false };
    }

    // quip
    if(tokens[0]==='quip'){
      var rlQ = resolveRL();
      var curQ = ensureCurForRL(rlQ);
      if(rlQ && curQ){
        var q = weatherQuipLine(mule, rlQ.region, rlQ.locale, curQ);
        if(q) whisper(pid, '<div>'+esc(q)+'</div>');
      }
      return { changed:false };
    }

    // metric | imperial
    if(tokens[0]==='metric' || tokens[0]==='imperial'){
      if(!isGM(pid)) return { error:'Only the GM may change weather display units.', changed:false };
      settings.units = tokens[0];
      setJSON(mule, AB_SETTINGS(), settings);
      return { changed:false };
    }

    // set (stackable). Supported:
    // !dwt --weather set temp cold rainfall light storms moderate region frozenfar locale inland wind 80% wnw
    if(tokens[0]==='set'){
      if(!isGM(pid)) return { error:'Only the GM may set weather overrides.', changed:false };

      // Current resolved target record (may come from page or meta override)
      var rlS = resolveRL();
      if(!rlS){
        return { error:'Weather not set: name the current page as region.locale.mapname or set region+locale.', changed:false };
      }

      var curS = ensureCurForRL(rlS);
      if(!curS){
        return { error:'Unable to initialize current weather for this region/locale.', changed:false };
      }

      var pairs = tokens.slice(1);

      function setTempBand(v){
        v = canonicalKey(v);
        if(v==='frigid' || v==='cold' || v==='temperate' || v==='warm' || v==='hot'){
          curS.tempBand = v;
          curS.tempF = tempBandToF(curS.tempBand, rlS.region, rlS.locale, curS.season);
          curS.tempC = toC(curS.tempF);
        }
      }

      function setRain(v){
        v = canonicalKey(v);
        if(v==='none' || v==='clear') curS.rainfall = 'none';
        else if(v==='light') curS.rainfall = 'light';
        else if(v==='moderate' || v==='med') curS.rainfall = 'moderate';
        else if(v==='heavy') curS.rainfall = 'heavy';
        else curS.rainfall = v;
      }

      function setSkies(v){
        v = canonicalKey(v);
        if(v==='clear' || v==='clearskies') curS.skies = 'clear';
        else if(v==='cloudy') curS.skies = 'cloudy';
        else if(v==='overcast') curS.skies = 'overcast';
        else if(v==='fog' || v==='foggy') curS.skies = 'fog';
        else curS.skies = v;
      }

      function setStorms(v){
        v = canonicalKey(v);
        curS.storm = curS.storm || { active:false, type:'', critical:false };
        if(v==='none' || v==='off' || v==='clear'){
          curS.storm.active = false;
          curS.storm.type = '';
          curS.storm.critical = false;
        }else{
          curS.storm.active = true;
          curS.storm.type = v;
          curS.storm.critical = false;
        }
      }

      function setWind(pct, dir){
        curS.wind = curS.wind || { percent:0, dir:'N' };
        if(pct!=null && !isNaN(pct)) curS.wind.percent = clamp(pct,0,100);
        if(dir) curS.wind.dir = normalizeDir16(dir);
      }

      // Second pass: apply fields in order
      for(var j=0;j<pairs.length;j++){
        var k = pairs[j];
        var v = pairs[j+1];
        if(!k) continue;

        if(k==='region' || k==='locale'){ j++; continue; }

        if(k==='temp' && v){ setTempBand(v); j++; continue; }
        if(k==='rainfall' && v){ setRain(v); j++; continue; }
        if(k==='skies' && v){ setSkies(v); j++; continue; }
        if(k==='storms' && v){ setStorms(v); j++; continue; }

        if(k==='wind'){
          // wind <pct> <dir> OR wind <dir> OR wind <pct>
          var pct = null, dir = null;
          if(v){
            if(/%$/.test(v) || /^[0-9]+$/.test(v)){ pct = parseInt(v,10); }
            else dir = v;
            // look ahead for second component
            var v2 = pairs[j+2];
            if(v2 && dir==null && !( /%$/.test(v2) || /^[0-9]+$/.test(v2) )){
              dir = v2;
              j++;
            }else if(v2 && pct==null && (/%$/.test(v2) || /^[0-9]+$/.test(v2))){
              pct = parseInt(v2,10);
              j++;
            }
            setWind(pct, dir);
            j++;
            continue;
          }
        }
      }

      // Recompute windsock targets / critical mapping if needed
      updateCriticalEventsForLocation(mule, rlS.region, rlS.locale, curS);
      storeCurrentAndHistory(mule, rlS.region, rlS.locale, curS);

      // Sync token on active page
      syncWindsock();

      // Echo only the weather line to chat
      whisperWeatherOnly(curS, rlS);
      return { changed:false };
    }


    // Fallback to legacy behavior for any other action (e.g., debug switches).
    try{
      legacyHandle(tokens, pid, mule, settings);
      return { changed:false };
    }catch(e4){
      return { error:String(e4), changed:false };
    }
  }

  // Legacy handler shim: reuse existing handleWeatherCommand logic without chat message plumbing.
  function legacyHandle(tokens, pid, mule, settings){
    // This function intentionally calls into the existing token-based branches below by reconstructing 'arg'.
    // Many branches in the original implementation assume local variables; we preserve behavior by delegating
    // to the original handler through a minimal fake msg object.
    var fake = { type:'api', content:'!dwt --weather '+tokens.join(' '), playerid:pid };
    handleWeatherCommand(fake);
    return { changed:true };
  }

function handleWeatherCommand(msg){
    if(msg.type!=='api') return;
    var content = (msg.content||'').trim();
    if(!/^!dwt(\b|$)/i.test(content)) return;
    if(!/--weather(\b|$)/i.test(content)) return;

    var mule = ensureMule();
    var pid = msg.playerid;
    var settings = ensureSettings(mule);

    // Extract the --weather argument string exactly as core does.
    var arg = '';
    try{
      var parts = content.split(/\s+--/);
      for(var i=1;i<parts.length;i++){
        var m = parts[i].match(/^([A-Za-z-]+)(?:\s+(.+))?$/);
        if(!m) continue;
        var flag = lower(m[1]||'');
        if(flag==='weather'){ arg = String(m[2]||'').trim(); break; }
      }
    }catch(e){}

    var a = lower(arg||'').trim();
    var tokens = a ? a.split(/\s+/) : [];

    // 0) --weather list events
    if(tokens[0]==='list' && tokens[1]==='events'){
      if(!isGM(pid)){ whisper(pid,'<div>Only the GM may list critical weather events.</div>'); return; }

      // Ensure baseline data exists and is current before listing.
      ensureAllExistIfMissing(mule, null);
      updateAllCalendarAware(mule, pid);

      var regions = loadedRegions(mule);
      var rows = [];

      for(var ri=0;ri<regions.length;ri++){
        var region = regions[ri];
        for(var li=0;li<LOCALES.length;li++){
          var locale = LOCALES[li];
          var rec = ensureEventsRecord(mule, region, locale);
          // Persist a normalized record if missing.
          setJSON(mule, AB_EVENTS(region, locale), rec);

          for(var ei=0;ei<CRITICAL_EVENT_TYPES.length;ei++){
            var cat = CRITICAL_EVENT_TYPES[ei];
            var e = rec.events[cat];
            rows.push({
              region:region,
              locale:locale,
              category:cat,
              pressure:clamp(+e.pressure||0,0,100),
              delta:clamp(+e.delta||0,-25,25),
              chance:clamp(+e.chance||0,0,100),
              active:!!e.active,
              started:String(e.startedStamp||''),
              stamp:String(rec.stamp||'')
            });
          }
        }
      }

      // Sort: active first, then chance desc, then pressure desc, then region/locale/category.
      rows.sort(function(a,b){
        if(a.active!==b.active) return a.active ? -1 : 1;
        if(b.chance!==a.chance) return b.chance - a.chance;
        if(b.pressure!==a.pressure) return b.pressure - a.pressure;
        if(a.region!==b.region) return (a.region<b.region)?-1:1;
        if(a.locale!==b.locale) return (a.locale<b.locale)?-1:1;
        if(a.category!==b.category) return (a.category<b.category)?-1:1;
        return 0;
      });

      var html = '<div style="border:1px solid #666;padding:8px;">'
        +'<div style="font-weight:bold;margin-bottom:6px;">Critical Weather Events</div>'
        +'<div style="font-size:11px;margin-bottom:6px;">Shows pressure, trend, and escalation chance for all loaded regions/locales.</div>'
        +'<table style="width:100%;border-collapse:collapse;font-size:11px;">'
        +'<tr>'
        +'<th style="text-align:left;border-bottom:1px solid #999;padding:2px 4px;">Region</th>'
        +'<th style="text-align:left;border-bottom:1px solid #999;padding:2px 4px;">Locale</th>'
        +'<th style="text-align:left;border-bottom:1px solid #999;padding:2px 4px;">Event</th>'
        +'<th style="text-align:right;border-bottom:1px solid #999;padding:2px 4px;">Pressure</th>'
        +'<th style="text-align:right;border-bottom:1px solid #999;padding:2px 4px;">Δ</th>'
        +'<th style="text-align:right;border-bottom:1px solid #999;padding:2px 4px;">Chance</th>'
        +'<th style="text-align:center;border-bottom:1px solid #999;padding:2px 4px;">Active</th>'
        +'</tr>';

      for(var r=0;r<rows.length;r++){
        var row = rows[r];
        html += '<tr>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;">'+esc(row.region)+'</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;">'+esc(row.locale)+'</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;">'+esc(row.category)+'</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;text-align:right;">'+esc(row.pressure)+'</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;text-align:right;">'+esc((row.delta>0?'+':'')+row.delta)+'</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;text-align:right;">'+esc(row.chance)+'%</td>'
          +'<td style="border-bottom:1px solid #ddd;padding:2px 4px;text-align:center;">'+(row.active?'<b>YES</b>':'')+'</td>'
          +'</tr>';
      }

      html += '</table></div>';
      whisper(pid, html);
      return;
    }


    // 1) --weather update
    if(tokens[0]==='update'){
      if(!isGM(pid)){ whisper(pid,'<div>Only the GM may update campaign weather.</div>'); return; }
      var res = updateAllCalendarAware(mule, pid);
      if(res.ok){
        // Update windsock (if present) and mirror the unified-line into its tooltip.
        try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e0){}
        whisper(pid,'<div style="border:1px solid #666;padding:6px;">dwt_weather: update applied ('+res.steps+' timeofday step(s)).</div>');
      }
      return;
    }

    // 2) --weather metric|imperial
    if(tokens[0]==='metric' || tokens[0]==='imperial'){
      if(!isGM(pid)){ whisper(pid,'<div>Only the GM may change weather display units.</div>'); return; }
      settings.units = tokens[0];
      setJSON(mule, AB_SETTINGS(), settings);
      whisper(pid,'<div style="border:1px solid #666;padding:6px;">dwt_weather: units set to <b>'+esc(tokens[0])+'</b>.</div>');
      return;
    }

    // 3) --weather set ... (stackable)
    if(tokens[0]==='set'){
      if(!isGM(pid)){ whisper(pid,'<div>Only the GM may set weather overrides.</div>'); return; }

      // Parse stacks: key value key value ... (storms now <type> consumes two values)
      var i2=1;
      while(i2 < tokens.length){
        var key = tokens[i2];
        if(key==='temp'){
          var v = tokens[i2+1]||'';
          v = lower(v);
          if(['frigid','cold','temperate','warm','hot'].indexOf(v)<0){ whisper(pid,'<div>Invalid temp band.</div>'); return; }
          settings.override.tempBand = v; settings.override.stormNow='';
          i2 += 2; continue;
        }
        if(key==='rainfall'){
          var rr = tokens[i2+1]||'';
          rr = lower(rr);
          if(['none','light','moderate','heavy'].indexOf(rr)<0){ whisper(pid,'<div>Invalid rainfall band.</div>'); return; }
          settings.override.rainfall = rr; settings.override.stormNow='';
          i2 += 2; continue;
        }
        if(key==='storms'){
          var sv = tokens[i2+1]||'';
          sv = canonicalKey(sv);
          if(sv==='now'){
            var st = canonicalKey(tokens[i2+2]||'');
            if(!st){ whisper(pid,'<div>Missing storm type after "storms now".</div>'); return; }
            settings.override.stormNow = st;
            settings.override.storms = '';
            i2 += 3; continue;
          }
          if(['none','off','low','moderate','med','high'].indexOf(sv)<0){ whisper(pid,'<div>Invalid storms override.</div>'); return; }
          settings.override.storms = sv;
          settings.override.stormNow = '';
          i2 += 2; continue;
        }
        if(key==='region'){
          var rg = canonicalKey(tokens[i2+1]||'');
          if(REGIONS.indexOf(rg)<0){ whisper(pid,'<div>Invalid region.</div>'); return; }
          settings.override.region = rg;
          i2 += 2; continue;
        }
        if(key==='locale'){
          var lc = canonicalKey(tokens[i2+1]||'');
          if(LOCALES.indexOf(lc)<0){ whisper(pid,'<div>Invalid locale.</div>'); return; }
          settings.override.locale = lc;
          i2 += 2; continue;
        }
        if(key==='wind'){
          var pct = tokens[i2+1]||'';
          var dir = tokens[i2+2]||'';
          var rl = resolveRegionLocale(mule, null);
          if(!rl){ whisper(pid,'<div>Weather not set: set region and locale first.</div>'); return; }
          var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
          if(!cur){
            var prof = loadRegionProfile(mule, rl.region);
            cur = generateFresh(prof, settings, rl.region, rl.locale, now());
          }
          cur.wind = cur.wind || { percent:0, dir:'N' };
          if(canonicalKey(pct)==='deadcalm'){ cur.wind.percent = 0; if(dir) cur.wind.dir = normalizeDir16(dir); i2 += (dir?3:2); setJSON(mule, AB_CUR(rl.region, rl.locale), cur); storeCurrentAndHistory(mule, rl.region, rl.locale, cur); try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e4){} continue; }
          if(/%$/.test(pct) || /^[0-9]+$/.test(pct)){
            cur.wind.percent = clamp(parseInt(String(pct).replace(/[^\d]/g,''),10),0,100);
            if(dir) cur.wind.dir = normalizeDir16(dir);
            i2 += (dir?3:2);
            setJSON(mule, AB_CUR(rl.region, rl.locale), cur);
            storeCurrentAndHistory(mule, rl.region, rl.locale, cur);
            try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e5){}
            continue;
          }
          // wind <dir>
          cur.wind.dir = normalizeDir16(pct);
          i2 += 2;
          setJSON(mule, AB_CUR(rl.region, rl.locale), cur);
          storeCurrentAndHistory(mule, rl.region, rl.locale, cur);
          try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e6){}
          continue;
        }

        whisper(pid,'<div>Unknown weather set key: '+esc(key)+'</div>');
        return;
      }

      setJSON(mule, AB_SETTINGS(), settings);

      // Store current and update history at current tick without duplicating entries.
      var rl = resolveRegionLocale(mule, null);
      if(rl){
        var curW = getJSON(mule, AB_CUR(rl.region, rl.locale));
        if(curW){
          curW.narrative = buildNarrative(curW, settings.units);
          curW.quip = pickQuip(rl.region, rl.locale, curW) || '';
          curW.stamp = stamp(now());
          curW.tick = tick(now());
          updateCriticalEventsForLocation(mule, rl.region, rl.locale, curW);
          setJSON(mule, AB_CUR(rl.region, rl.locale), curW);

          var hist = ensureHistory(mule, rl.region, rl.locale);
          var found = false;
          for(var hi=hist.entries.length-1;hi>=0;hi--){
            if(+hist.entries[hi].tick === +curW.tick){
              hist.entries[hi].snapshot = curW;
              hist.entries[hi].stamp = curW.stamp;
              found = true;
              break;
            }
          }
          if(!found){
            hist.entries.push({ tick:curW.tick, stamp:curW.stamp, snapshot:curW });
            if(hist.entries.length > 160) hist.entries = hist.entries.slice(hist.entries.length - 160);
          }
          setJSON(mule, AB_HIST(rl.region, rl.locale), hist);
        }
      }

      try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e7){}
      whisper(pid,'<div style="border:1px solid #666;padding:6px;">dwt_weather: overrides updated.</div>');
      return;
    }

    // 4) no args / default: narrative line only
    ensureAllExistIfMissing(mule, pid);
    weatherVerifySyncActivePage(pid, {});
    updateAllCalendarAware(mule, pid);

    var rl0 = resolveFromPage(pid) || resolveRegionLocale(mule, null);
    if(!rl0){
      whisper(pid,'<div style="border:1px solid #666;padding:8px;"><b>dwt_weather</b>: Weather not set. Name the page as <b>region.locale.mapname</b> or use <b>!dwt --weather set region ... locale ...</b>.</div>');
      return;
    }

    var cur0 = getJSON(mule, AB_CUR(rl0.region, rl0.locale));
    if(!cur0){
      var prof0 = loadRegionProfile(mule, rl0.region);
      cur0 = generateFresh(prof0, settings, rl0.region, rl0.locale, now());
      updateCriticalEventsForLocation(mule, rl0.region, rl0.locale, cur0);
      storeCurrentAndHistory(mule, rl0.region, rl0.locale, cur0);
    }

    try{ updateActivePageWindsockAndTooltip(mule, pid); }catch(e8){}
    whisper(pid,'<div>'+esc(weatherLine(mule, rl0.region, rl0.locale, cur0, settings.units))+'</div>');
  }

  // ----------------------------
  // Provisioning / root normalization
  // ----------------------------
  function migrateLegacyAbilitiesIntoWeatherRoot(M){
    if(!M) return;

    var changed = false;
    var root = ensureWeatherRoot(M);

    function pullJSONAbility(name){
      var raw = (getAbilityAction(M, name)||'').trim();
      if(!raw) return null;
      try{ return JSON.parse(raw); }catch(e){ return null; }
    }

    var settings = pullJSONAbility('weather.settings');
    if(settings && settings.schema==='dwt.weather.settings.v1'){
      root.settings = settings; changed = true;
      removeAbility(M, 'weather.settings');
    }

    var meta = pullJSONAbility('weather.meta');
    if(meta && meta.schema==='dwt.weather.meta.v1'){
      root.meta = meta; changed = true;
      removeAbility(M, 'weather.meta');
    }

    if(!root.current || typeof root.current !== 'object') root.current = {};
    if(!root.history || typeof root.history !== 'object') root.history = {};
    if(!root.events || typeof root.events !== 'object') root.events = {};
    if(!root.windsock || typeof root.windsock !== 'object') root.windsock = {};

    // Pull any weather.current.*, weather.history.*, weather.events.* or weather.windsock.* legacy abilities.
    var abilities = findObjs({_type:'ability', _characterid:M.id}) || [];
    for(var i=0;i<abilities.length;i++){
      var ab = abilities[i];
      var name = String(ab.get('name')||'');
      var raw = String(ab.get('action')||'').trim();
      if(!raw) continue;
      if(!/^weather\.(current|history|events|windsock)\./.test(name)) continue;
      try{
        var parsed = JSON.parse(raw);
        var path = name.replace(/^weather\./,'');
        weatherPathSet(root, path, parsed);
        changed = true;
        ab.remove();
      }catch(e2){}
    }

    if(!changed) return;

    if(!root.meta || root.meta.schema !== 'dwt.weather.meta.v1'){
      root.meta = { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'' };
      changed = true;
    }else{
      if(!root.meta.hasOwnProperty('lastTick')) root.meta.lastTick = null;
      if(!root.meta.hasOwnProperty('lastStamp')) root.meta.lastStamp = '';
    }

    if(!root.settings || root.settings.schema !== 'dwt.weather.settings.v1'){
      root.settings = {
        schema:'dwt.weather.settings.v1',
        units:'imperial',
        override:{ region:'', locale:'', tempBand:'', rainfall:'', storms:'', stormNow:'' }
      };
      changed = true;
    }

    root.meta.version = VERSION;
    root.meta.rootSchema = 'dwt.weather.root.v1';

    saveWeatherRootDirect(M, root);
    mirrorVersionToUnifiedRegistry();
  }

  function ensureUnifiedRootHealth(){
    var M = ensureMule();
    if(!M) return;

    var root = loadWeatherRootDirect(M) || {};
    var changed = false;

    if(!root.settings || root.settings.schema !== 'dwt.weather.settings.v1'){
      root.settings = {
        schema:'dwt.weather.settings.v1',
        units:'imperial',
        override:{ region:'', locale:'', tempBand:'', rainfall:'', storms:'', stormNow:'' }
      };
      changed = true;
    }

    if(!root.current || typeof root.current !== 'object'){
      root.current = {};
      changed = true;
    }

    if(!root.history || typeof root.history !== 'object'){
      root.history = {};
      changed = true;
    }

    if(!root.events || typeof root.events !== 'object'){
      root.events = {};
      changed = true;
    }

    if(!root.windsock || typeof root.windsock !== 'object'){
      root.windsock = {};
      changed = true;
    }

    if(!root.meta || root.meta.schema !== 'dwt.weather.meta.v1'){
      root.meta = { schema:'dwt.weather.meta.v1', lastTick:null, lastStamp:'' };
      changed = true;
    }else{
      if(!root.meta.hasOwnProperty('lastTick')) root.meta.lastTick = null;
      if(!root.meta.hasOwnProperty('lastStamp')) root.meta.lastStamp = '';
    }

    root.meta.version = VERSION;
    root.meta.rootSchema = 'dwt.weather.root.v1';

    saveWeatherRootDirect(M, root);
    mirrorVersionToUnifiedRegistry();
  }

  // ----------------------------
  // Core integration
  // ----------------------------
  function helpLines(){
    return [
      '!dwt --weather', 'Display the current narrative weather line (same as the unified menu).',
      '!dwt --weather quip', 'Display a 4-line weather quip in chat.',
      '!dwt --weather metric|imperial', 'GM-only: set display units (default: imperial).',
      '!dwt --weather update', 'GM-only: update all regions/locales based on calendar delta since last run; records history; updates the active-page windsock token + tooltip if present.',
      '!dwt --weather set temp frigid|cold|temperate|warm|hot', 'GM-only: override temperature band until next update.',
      '!dwt --weather set rainfall none|light|moderate|heavy', 'GM-only: override rainfall until next update.',
      '!dwt --weather set storms none|low|moderate|high', 'GM-only: override storm chance until next update.',
      '!dwt --weather set storms now <stormtype>', 'GM-only: force an immediate storm state until next update.',
      '!dwt --weather set region <region>', 'GM-only: set region override (must match a loaded regionWeather module).',
      '!dwt --weather set locale offshore|coastal|inland', 'GM-only: set locale override.',
      '!dwt --weather set wind <pct|dead_calm> [dir]', 'GM-only: set wind percent and/or direction (e.g. 75% nw, northwest, dead_calm).',
      '!dwt --weather set ...', 'Set may be stacked: !dwt --weather set temp cold rainfall light storms moderate region Frozenfar locale inland wind 80% wnw'
    ];
  }

  function mirrorVersionToUnifiedRegistry(){
    try{
      var mule = ensureMule();
      mergeVersionEntry(mule, MODULE_KEY, VERSION);
      removeAbility(mule, 'weather.version');
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
              var rl = resolveFromPage(pid) || resolveRegionLocale(mule, null);
              if(!rl) return html;

              // Ensure at least a current weather record exists for the active region/locale.
              try{
                var profile0 = loadRegionProfile(mule, rl.region);
                var cur0 = getJSON(mule, AB_CUR(rl.region, rl.locale));
                if(!cur0){
                  cur0 = generateFresh(profile0, settings, rl.region, rl.locale, now());
                  storeCurrentAndHistory(mule, rl.region, rl.locale, cur0);
                }
              }catch(e0){}

              var cur = getJSON(mule, AB_CUR(rl.region, rl.locale));
              if(!cur) return html;

              var line = weatherLine(mule, rl.region, rl.locale, cur, settings.units);
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
      }

      // Publish weather helpers to core for unified-menu sync behavior.
      dwt.weatherSyncActivePage = weatherSyncActivePage;
      dwt.weatherVerifySyncActivePage = weatherVerifySyncActivePage;

      // Ensure our weather line is injected into the calendar log card regardless of script load order.
      if(typeof dwt.registerStartup==='function'){
        dwt.registerStartup(MODULE_KEY, function(mule, reason){
          moduleStartup(mule, reason);
          tryWrapCalendarCard();
        });
      }

      // Best-effort immediate wrap (covers cases where calendar already registered).
      tryWrapCalendarCard();

      if(typeof dwt.registerCommands==='function'){
        // IMPORTANT: core calls cmd.handler({pid,key,val}); we must provide a function.
        dwt.registerCommands({
          weather: { access:'player', handler:function(ctx){
            try{ return handleWeatherExpr(ctx.pid, String(ctx.val||''), { source:'core' }); }
            catch(e){ return { error:String(e), changed:false }; }
          }}
        });
      }
    }catch(e){}
  }

  // ----------------------------
  // Startup
  // ----------------------------
  function moduleStartup(mule, reason){
    mule = mule || ensureMule();
    migrateLegacyAbilitiesIntoWeatherRoot(mule);
    ensureUnifiedRootHealth();
    mirrorVersionToUnifiedRegistry();
  }

  function init(){
    var mule = ensureMule();
    moduleStartup(mule, 'init');

    try{
      on('chat:message', handleWeatherCommand);
    }catch(e){}

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
    _ensureAllExistIfMissing:ensureAllExistIfMissing,
    _updateAllCalendarAware:updateAllCalendarAware,
    _renderLogCard:renderLogCard,
    _weatherLine:weatherLine,
    _weatherQuipLine:weatherQuipLine,
    _now:now,
    _tick:tick,
    _stamp:stamp,
    _updateActivePageWindsockAndTooltip:updateActivePageWindsockAndTooltip,
    _weatherVerifySyncActivePage:weatherVerifySyncActivePage,
    _weatherSyncActivePage:weatherSyncActivePage
  };
}());

on('ready', function(){
  try{ dwt_weather.init(); }catch(e){ log('dwt_weather init error: '+e); }
});

on('change:campaign:playerpageid', function(obj, prev){
  try{
    var mule = (dwt_weather && dwt_weather._ensureAllExistIfMissing) ? (findObjs({_type:'character', name:'dwt_mule'})[0] || null) : null;
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