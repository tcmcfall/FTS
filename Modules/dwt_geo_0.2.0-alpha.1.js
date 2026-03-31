// name:        dwt_geo.js
// version:     0.2.0-alpha.1
// description: Geolocation & Route module (core-aware). Reads mapMeta and token
//              coordinates, builds per-map named routes and static map points,
//              and stores data on dwt_mule as mapRoutes.* and mapPoints.*.
// depends:     dwt_core >= 0.1.0-alpha.1, dwt_mapMeta >= 0.1.0-alpha.1, Roll20 Mod API
// provides:    !dwt --geo list routes
//              !dwt --geo start route <routeName>
//              !dwt --geo set routepoint <pointName>
//              !dwt --geo end route
//              !dwt --geo goto route <routeName>
//              !dwt --geo goto routepoint <routeName (current if omitted)> <index|pointName>
//              !dwt --geo prev routepoint
//              !dwt --geo next routepoint
//              !dwt --geo delete route <routeName>
//              !dwt --geo delete routepoint <routeName (current if omitted)> <index|pointName>
//              !dwt --geo rename route <oldName> <newName>
//              !dwt --geo rename routepoint <oldName> <newName>
//              !dwt --geo list locations
//              !dwt --geo set location <locationName>
//              !dwt --geo goto location <locationName>
//              !dwt --geo delete location <locationName>
//              !dwt --geo rename location <oldName> <newName>
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

var dwt_geo = dwt_geo || (function () {
  'use strict';

  /* ========== Intro / Root ========== */

  var RT = (typeof globalThis!=='undefined') ? globalThis
         : (typeof window!=='undefined')     ? window
         : (typeof self!=='undefined')       ? self
         : (typeof global!=='undefined')     ? global
         : this;

  var VERSION    = '0.2.0-alpha.1';
  var STATE_ROOT = 'geo';
  var DWT_MULE   = 'dwt_mule';
  var GEO_HANDOUT_NAME = 'Map Locations and Routes';

  var _registered = false;
  var _startupRegistered = false;

  /* ========== Utils / State ========== */

  function esc(s){
    return String(s||'').replace(/&/g,'&amp;')
                         .replace(/</g,'&lt;')
                         .replace(/>/g,'&gt;')
                         .replace(/"/g,'&quot;')
                         .replace(/'/g,'&#39;');
  }

  function cssVars(){
    return (RT.dwt && typeof RT.dwt.cssVars === 'function')
      ? RT.dwt.cssVars()
      : {
          container:'',
          title:'',
          card:'',
          link:'',
          btn:'',
          table:'',
          th:'',
          td:function(){ return ''; },
          dayLine:'',
          dot:'',
          esc:esc,
          hrefAttr:function(s){ return String(s||'').replace(/"/g,'&quot;'); },
          literal:function(s){ return '<code>'+esc(s)+'</code>'; }
        };
  }

  function ensureGeoState(){
    if(!state.dwt){ state.dwt = {}; }
    if(!state.dwt[STATE_ROOT]){
      state.dwt[STATE_ROOT] = {
        routes: {},          // mapKey → { routeKey → route }
        points: {},          // mapKey → { pointKey → point }
        currentRoute: {},    // pid → { mapKey, routeKey }
        lastSelection: {}    // pid → [{_id,_type}]
      };
    }else{
      var S = state.dwt[STATE_ROOT];
      if(!S.routes){ S.routes = {}; }
      if(!S.points){ S.points = {}; }
      if(!S.currentRoute){ S.currentRoute = {}; }
      if(!S.lastSelection){ S.lastSelection = {}; }
    }
    return state.dwt[STATE_ROOT];
  }

  function normalizeKey(name){
    return String(name||'').trim().toLowerCase();
  }

  function normalizeGeoKeyComponent(s){
    // Use the same normalizer as other DWT identifiers (calendar, etc.).
    var norm = (RT.dwt && RT.dwt.normalizeName)
      ? RT.dwt.normalizeName
      : function(x){
          return String(x||'')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g,'');
        };
    return norm(s);
  }

  function deriveNameMapKey(meta){
    if(!meta){
      return 'unknown';
    }

    if(meta.name){
      return normalizeGeoKeyComponent(meta.name);
    }
    if(meta.raw_name){
      return normalizeGeoKeyComponent(meta.raw_name);
    }
    if(meta.page_name){
      return normalizeGeoKeyComponent(meta.page_name);
    }
    return 'map'+String(meta.id||'0');
  }

  function mapKeyFromMeta(meta){
    // Geo state keys route and point data directly to the canonical page name.
    return deriveNameMapKey(meta);
  }

  
  function getRoutesForMap(S, mapKey){
    if(!S.routes[mapKey]){
      S.routes[mapKey] = {};
    }
    return S.routes[mapKey];
  }

  function getPointsForMap(S, mapKey){
    if(!S.points[mapKey]){
      S.points[mapKey] = {};
    }
    return S.points[mapKey];
  }

/* ========== Mule Helpers ========== */

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

  function weatherRootQuality(text){
    var parsed = safeParseJSON(text);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = 0;
    if(parsed.meta && parsed.meta.rootSchema === 'dwt.weather.root.v2') score += 200;
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
    var list = findObjs({ _type:'ability', _characterid:character.id, name:name }) || [];
    list.sort(function(a, b){ return abilitySortScore(name, b) - abilitySortScore(name, a); });
    return list;
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
      mule = createObj('character',{
        name: DWT_MULE,
        archived:false,
        inplayerjournals:'',
        controlledby:''
      });
    }
    return mule;
  }

  function upsertAbility(character, name, action){
    if(!character) return;
    var abilities = namedAbilities(character, name);
    if(abilities.length){
      for(var i=0;i<abilities.length;i++){
        try{ abilities[i].set({action:String(action || '')}); }catch(e){}
      }
    }else{
      createObj('ability',{
        characterid: character.id,
        name:name,
        action:String(action || ''),
        istokenaction:false
      });
    }
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = namedAbilities(character, name)[0];
    return ability ? String(ability.get('action')||'') : '';
  }

  function parseVersionRoot(raw){
    var root = {};
    raw = String(raw || '').split('\r').join('');
    if(!raw) return root;
    var lines = raw.split('\n');
    for(var i=0;i<lines.length;i++){
      var line = String(lines[i] || '').trim();
      if(!line) continue;
      var eq = line.indexOf('=');
      if(eq <= 0) continue;
      var key = String(line.slice(0, eq) || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
      var val = String(line.slice(eq + 1) || '').trim();
      if(key && val){ root[key] = val; }
    }
    return root;
  }

  function serializeVersionRoot(root){
    var lines = [];
    Object.keys(root || {}).sort().forEach(function(k){
      var key = String(k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
      var val = String(root[k] || '').trim();
      if(key && val){ lines.push(key + '=' + val); }
    });
    return lines.join('\n');
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var key = String(moduleKey || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
    if(!key) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    var version = String(moduleVersion || '').trim();
    root[key] = version;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function syncGeoRootToMule(){
    var mule = getOrCreateMule();
    if(!mule) return;
    var S = ensureGeoState();
    upsertAbility(mule, 'geo', JSON.stringify({
      version: VERSION,
      routes: S.routes || {},
      points: S.points || {},
      currentRoute: S.currentRoute || {},
      lastSelection: S.lastSelection || {}
    }));
  }

  function mirrorVersionToMule(){
    var mule = getOrCreateMule();
    if(!mule) return;
    mergeVersionEntry(mule, 'geo', VERSION);
  }


  /* ========== Routes & Locations Handout ========== */

  function geoHandout(){
    return findObjs({_type:'handout', name:GEO_HANDOUT_NAME})[0] || null;
  }

  function ensureGeoHandout(meta){
    var h = geoHandout();
    if(!h){
      // Viewable by all players, editable only by the GM.
      h = createObj('handout', {
        name: GEO_HANDOUT_NAME,
        inplayerjournals: 'all',
        controlledby: ''
      });
    }
    try{
      h.set('notes', buildGeoHandoutHTML(meta));
    }catch(e){
      log('dwt_geo ensureGeoHandout err: '+e);
    }
    return h;
  }

  function buildGeoHandoutHTML(meta){
    var v   = cssVars();
    var S   = ensureGeoState();
    meta    = meta || readMapMetaFromMule();

    var mapKey = meta ? (mapKeyFromMeta(meta) || '(unknown)') : '(no mapMeta)';

    var routesForMap = meta ? getRoutesForMap(S, mapKey) : {};
    var pointsForMap = meta ? getPointsForMap(S, mapKey) : {};

    // Map display metadata
    var pageName  = meta ? (meta.name || meta.raw_name || '(unknown page)') : '(unknown page)';
    var locale    = (meta && meta.locale_name) || '';
    var region    = (meta && meta.region_name) || '';
    var locRegion = '';

    if (locale || region) {
      locRegion = '(' + esc(locale || 'Unknown locale') + ', ' + esc(region || 'Unknown region') + ')';
    }

    var html = '';
    html += '<div'+(v.container?(' style="'+v.container+'"'):'')+'>';

    // Title: page (map) name
    html += '<div'+(v.title?(' style="'+v.title+'"'):'')+'>'+esc(pageName)+'</div>';

    // Sub-title: (locale, region)
    if (locRegion) {
      html += '<div style="margin-top:2px;font-size:11px;font-style:italic;">'
           +  locRegion
           +  '</div>';
    }

    // Instructions paragraph (mentioning route bullets)
    html += '<div style="margin-top:6px;font-size:11px;line-height:1.4;">'
          + 'This handout lists all <b>locations</b> (static map points) and '
          + '<b>routes</b> known for the current map. '
          + 'Click a location to re-center the map on that point. '
          + 'Click a route name to jump to its starting point, use the '
          + '&#171; / &#187; buttons to step along the route, or click one of the '
          + '&bull; markers to jump directly to a specific route point.'
          + '</div>';

    // Locations
    html += '<div style="margin-top:10px;font-weight:bold;">Locations</div>';

    var hasPoints = false;
    var pk;
    for(pk in pointsForMap){
      if(pointsForMap.hasOwnProperty(pk)){
        hasPoints = true;
        break;
      }
    }

    if(!hasPoints){
      html += '<div style="font-size:11px;"><i>No locations defined yet for this map.</i></div>';
    }else{
      html += '<ul style="margin-top:4px;">';
      var pointKeys = [];
      for(pk in pointsForMap){
        if(pointsForMap.hasOwnProperty(pk)){
          pointKeys.push(pk);
        }
      }
      pointKeys.sort();
      for(var i=0;i<pointKeys.length;i++){
        var key = pointKeys[i];
        var p   = pointsForMap[key];
        if(!p) continue;
        var label = p.name || key;
        var href  = esc('!dwt --geo goto location '+label);
        html += '<li style="font-size:11px;">'
              + '<a href="'+href+'"'+(v.link?(' style="'+v.link+'"'):'')+'>'+esc(label)+'</a>'
              + '</li>';
      }
      html += '</ul>';
    }

    // Routes
    html += '<div style="margin-top:10px;font-weight:bold;">Routes</div>';

    var hasRoutes = false;
    var rk;
    for(rk in routesForMap){
      if(routesForMap.hasOwnProperty(rk)){
        hasRoutes = true;
        break;
      }
    }

    if(!hasRoutes){
      html += '<div style="font-size:11px;"><i>No routes defined yet for this map.</i></div>';
    }else{
      html += '<ul style="margin-top:4px;">';
      var routeKeys = [];
      for(rk in routesForMap){
        if(routesForMap.hasOwnProperty(rk)){
          routeKeys.push(rk);
        }
      }
      routeKeys.sort();

      for(var j=0;j<routeKeys.length;j++){
        var rKey = routeKeys[j];
        var r    = routesForMap[rKey];
        if(!r) continue;
        var rLabel = r.name || rKey;
        var count  = (r.points && r.points.length) || 0;

        var baseHref = esc('!dwt --geo goto route '+rLabel);

        html += '<li style="font-size:11px;">'
              + '<a href="'+baseHref+'"'+(v.link?(' style="'+v.link+'"'):'')+'>'+esc(rLabel)+'</a>';

        if(count>0){
          // Back arrow (larger target)
          html += '&nbsp;&nbsp;'
                + '<a href="'+prevHref+'" style="font-size:20px;text-decoration:none;line-height:1;">&#171;</a>';

          // Bullet markers for each point in the route
          for(var idx=0; idx<count; idx++){
            var pt      = r.points[idx] || {};
            var ptLabel = pt.label || pt.name || (rLabel+' #'+(idx+1));
            var dotHref = esc('!dwt --geo goto route '+rLabel+' '+idx);

            html += '&nbsp;<a href="'+dotHref+'" '
                  + 'style="font-size:20px;text-decoration:none;line-height:1;" '
                  + 'title="'+esc(ptLabel)+'">&bull;</a>';
          }
                + ' <span style="font-size:10px;color:#888;">('+count+' points)</span>';
        }else{
          html += ' <span style="font-size:10px;color:#888;">(no points yet)</span>';
        }

        html += '</li>';
      }

      html += '</ul>';
    }

    html += '</div>';
    return html;
  }


  /* ========== MapMeta Ingestion ========== */

  function readMapMetaFromMule(){
    var mule = getOrCreateMule();
    if(!mule) return null;

    var ability = findObjs({
      _type:'ability',
      _characterid:mule.id,
      name:'mapMeta'
    })[0];

    if(!ability) return null;

    try{
      var json = ability.get('action') || '';
      if(!json) return null;
      var meta = JSON.parse(json);
      return meta || null;
    }catch(e){
      log('dwt_geo readMapMetaFromMule JSON error: '+e);
      return null;
    }
  }

  /* ========== Token & Coordinate Helpers ========== */

  function getLastSelectionForPlayer(pid){
    var S = ensureGeoState();
    var entries = S.lastSelection[pid] || [];
    var tokens = [];

    for(var i=0;i<entries.length;i++){
      var s = entries[i];
      if(!s || !s._id || !s._type) continue;
      var obj = getObj(s._type, s._id);
      if(obj && obj.get('type') === 'graphic'){
        tokens.push(obj);
      }
    }
    return tokens;
  }

  function snapshotToken(token){
    if(!token) return null;
    return {
      id:         token.id,
      name:       token.get('name') || '',
      pageid:     token.get('pageid'),
      left:       Number(token.get('left')  || 0),
      top:        Number(token.get('top')   || 0),
      width:      Number(token.get('width') || 0),
      height:     Number(token.get('height')|| 0),
      layer:      token.get('layer') || '',
      rotation:   Number(token.get('rotation') || 0),
      imgsrc:     token.get('imgsrc') || '',
      represents: token.get('represents') || '',
      tint_color: token.get('tint_color') || 'transparent',
      statusmarkers: token.get('statusmarkers') || '',
      bar1: {
        value: token.get('bar1_value'),
        max:   token.get('bar1_max')
      },
      bar2: {
        value: token.get('bar2_value'),
        max:   token.get('bar2_max')
      },
      bar3: {
        value: token.get('bar3_value'),
        max:   token.get('bar3_max')
      },
      aura1: {
        radius: token.get('aura1_radius'),
        color:  token.get('aura1_color'),
        square: !!token.get('aura1_square')
      },
      aura2: {
        radius: token.get('aura2_radius'),
        color:  token.get('aura2_color'),
        square: !!token.get('aura2_square')
      },
      light: {
        radius: token.get('light_radius'),
        dim:    token.get('light_dimradius'),
        angle:  token.get('light_angle'),
        otherplayers: !!token.get('light_otherplayers'),
        losangle: token.get('light_losangle')
      }
    };
  }

  function buildGeoPoint(token, meta, label){
    var snap = snapshotToken(token);
    if(!snap || !meta) return null;

    var pxPerUnit   = Number(meta.pixels_per_unit || 70) || 70;
    var pageWidthPx = Number(meta.page_width_px || 0);
    var pageHeightPx= Number(meta.page_height_px || 0);
    var cellSizePx  = Number(meta.cell_size_px || 0);

    var left  = snap.left;
    var top   = snap.top;
    var cx    = cellSizePx > 0 ? (left  / cellSizePx) : 0;
    var cy    = cellSizePx > 0 ? (top   / cellSizePx) : 0;

    // token center is at (left, top). Page origin (0,0) is top-left.
    var fracX = pageWidthPx  > 0 ? (left / pageWidthPx)  : 0;
    var fracY = pageHeightPx > 0 ? (top  / pageHeightPx) : 0;

    var worldW = Number(meta.world_width_distance  || 0);
    var worldH = Number(meta.world_height_distance || 0);

    var worldX = worldW > 0 ? (fracX * worldW) : 0;
    var worldY = worldH > 0 ? (fracY * worldH) : 0;

    return {
      label:          label || '',
      taken_at:       (new Date()).toISOString(),
      token:          snap,
      page: {
        id:           meta.id || snap.pageid,
        name:         meta.name || '',
        region:       meta.region_name || '',
        locale:       meta.locale_name || '',
        pixels_per_unit: pxPerUnit,
        page_width_px:   pageWidthPx,
        page_height_px:  pageHeightPx,
        cell_size_px:    cellSizePx,
        scale_number:    meta.scale_number,
        scale_units:     meta.scale_units
      },
      position: {
        left_px:  left,
        top_px:   top,
        cell_x:   cx,
        cell_y:   cy,
        world_x:  worldX,
        world_y:  worldY
      }
    };
  }

  /* ========== Route & Point Persistence (state <-> mule) ========== */

  function syncRoutesToMule(){
    var S    = ensureGeoState();
    var mule = getOrCreateMule();
    if(!mule) return;

    var abilities = findObjs({
      _type:'ability',
      _characterid:mule.id
    }) || [];

    var i, ability, name, mapKey;
    var needed = {};

    // Create/update per-map mapRoutes abilities
    for(mapKey in S.routes){
      if(!S.routes.hasOwnProperty(mapKey)) continue;
      var routesForMap = S.routes[mapKey];
      // Skip completely empty maps
      var hasAny = false;
      for(var rk in routesForMap){
        if(routesForMap.hasOwnProperty(rk)){
          hasAny = true;
          break;
        }
      }
      if(!hasAny) continue;

      name = 'mapRoutes.'+mapKey;
      needed[name] = true;

      var payload = {
        version: VERSION,
        mapKey:  mapKey,
        routes:  routesForMap
      };

      ability = null;
      for(i=0;i<abilities.length;i++){
        if(abilities[i].get('name') === name){
          ability = abilities[i];
          break;
        }
      }
      if(ability){
        ability.set({action: JSON.stringify(payload)});
      }else{
        upsertAbility(mule, name, JSON.stringify(payload));
      }
    }

    // Remove stray mapRoutes.* that have no corresponding mapKey
    for(i=0;i<abilities.length;i++){
      ability = abilities[i];
      name    = ability.get('name');
      if(name.indexOf('mapRoutes.') === 0 && !needed[name]){
        ability.remove();
      }
    }
  }

  function syncPointsToMule(){
    var S    = ensureGeoState();
    var mule = getOrCreateMule();
    if(!mule) return;

    var abilities = findObjs({
      _type:'ability',
      _characterid:mule.id
    }) || [];

    var i, ability, name, mapKey;
    var needed = {};

    // Create/update per-map mapPoints abilities
    for(mapKey in S.points){
      if(!S.points.hasOwnProperty(mapKey)) continue;
      var pointsForMap = S.points[mapKey];
      var hasAny = false;
      for(var pk in pointsForMap){
        if(pointsForMap.hasOwnProperty(pk)){
          hasAny = true;
          break;
        }
      }
      if(!hasAny) continue;

      name = 'mapPoints.'+mapKey;
      needed[name] = true;

      var payload = {
        version: VERSION,
        mapKey:  mapKey,
        points:  pointsForMap
      };

      ability = null;
      for(i=0;i<abilities.length;i++){
        if(abilities[i].get('name') === name){
          ability = abilities[i];
          break;
        }
      }
      if(ability){
        ability.set({action: JSON.stringify(payload)});
      }else{
        upsertAbility(mule, name, JSON.stringify(payload));
      }
    }

    // Remove stray mapPoints.* that have no corresponding mapKey
    for(i=0;i<abilities.length;i++){
      ability = abilities[i];
      name    = ability.get('name');
      if(name.indexOf('mapPoints.') === 0 && !needed[name]){
        ability.remove();
      }
    }
  }

  function loadRoutesFromMule(){
    var S    = ensureGeoState();
    var mule = getOrCreateMule();
    if(!mule) return;

    var abilities = findObjs({
      _type:'ability',
      _characterid:mule.id
    }) || [];

    for(var i=0;i<abilities.length;i++){
      var ability = abilities[i];
      var name    = ability.get('name');
      if(name.indexOf('mapRoutes.') !== 0) continue;

      var mapKey = name.substring('mapRoutes.'.length);
      if(!mapKey) continue;

      try{
        var json = ability.get('action') || '';
        if(!json) continue;
        var payload = JSON.parse(json);
        if(payload && payload.routes && typeof payload.routes === 'object'){
          S.routes[mapKey] = payload.routes;
        }
      }catch(e){
        // invalid JSON will be cleaned later
      }
    }
  }

  function loadPointsFromMule(){
    var S    = ensureGeoState();
    var mule = getOrCreateMule();
    if(!mule) return;

    var abilities = findObjs({
      _type:'ability',
      _characterid:mule.id
    }) || [];

    for(var i=0;i<abilities.length;i++){
      var ability = abilities[i];
      var name    = ability.get('name');
      if(name.indexOf('mapPoints.') !== 0) continue;

      var mapKey = name.substring('mapPoints.'.length);
      if(!mapKey) continue;

      try{
        var json = ability.get('action') || '';
        if(!json) continue;
        var payload = JSON.parse(json);
        if(payload && payload.points && typeof payload.points === 'object'){
          S.points[mapKey] = payload.points;
        }
      }catch(e){
        // invalid JSON will be cleaned later
      }
    }
  }

  function pruneInvalidGeoEntries(){
    var S = ensureGeoState();
    var removedRoutes = 0;
    var removedPoints = 0;
    var mapKey, k;

    // prune routes whose page no longer exists
    for(mapKey in S.routes){
      if(!S.routes.hasOwnProperty(mapKey)) continue;
      var routesForMap = S.routes[mapKey];
      for(k in routesForMap){
        if(!routesForMap.hasOwnProperty(k)) continue;
        var route = routesForMap[k];
        var pageid = route && route.pageid;
                if(!pageid || !getObj('page', pageid)){

          delete routesForMap[k];
          removedRoutes++;
        }
      }
      var hasAny = false;
      for(k in routesForMap){
        if(routesForMap.hasOwnProperty(k)){
          hasAny = true;
          break;
        }
      }
      if(!hasAny){
        delete S.routes[mapKey];
      }
    }

    // prune map points whose page no longer exists
    for(mapKey in S.points){
      if(!S.points.hasOwnProperty(mapKey)) continue;
      var pointsForMap = S.points[mapKey];
      for(k in pointsForMap){
        if(!pointsForMap.hasOwnProperty(k)) continue;
        var p = pointsForMap[k];
        var pageid2 = p && p.pageid;
                if(!pageid2 || !getObj('page', pageid2)){

          delete pointsForMap[k];
          removedPoints++;
        }
      }
      var hasAnyPoints = false;
      for(k in pointsForMap){
        if(pointsForMap.hasOwnProperty(k)){
          hasAnyPoints = true;
          break;
        }
      }
      if(!hasAnyPoints){
        delete S.points[mapKey];
      }
    }

    if(removedRoutes || removedPoints){
      sendChat('dwt','/w gm Removed '+removedRoutes+' orphan route(s) and '+removedPoints+' orphan map point(s) whose maps no longer exist.');
    }
  }

  function cleanMuleGeoAbilitiesOnInit(){
    var S    = ensureGeoState();
    var mule = getOrCreateMule();
    if(!mule) return;

    var abilities = findObjs({
      _type:'ability',
      _characterid:mule.id
    }) || [];

    var removed = 0;

    for(var i=0;i<abilities.length;i++){
      var ability = abilities[i];
      var name    = ability.get('name');

      // Remove mapRoutes.<key> for maps that no longer exist in state
      if(name.indexOf('mapRoutes.') === 0){
        var mapKey = name.substring('mapRoutes.'.length);
        if(!S.routes[mapKey]){
          ability.remove();
          removed++;
        }
      }

      // Remove mapPoints.<key> for maps that no longer exist in state
      if(name.indexOf('mapPoints.') === 0){
        var mapKey2 = name.substring('mapPoints.'.length);
        if(!S.points[mapKey2]){
          ability.remove();
          removed++;
        }
      }
    }

    if(removed){
      sendChat('dwt','/w gm Cleaned '+removed+' obsolete mapRoutes/mapPoints entries from dwt_mule.');
    }

    // Re-sync from state back to mule
    syncRoutesToMule();
    syncPointsToMule();
  }

  function refreshGeoForActivePage(){
    // Called on sandbox init and when the party ribbon (active page) changes.
    // If mapMeta has been captured for the current ribbon page, we prune invalid
    // geo entries, sync mule state, and rebuild the handout for that page.
    try{
      if('undefined' === typeof Campaign){ return; }
      var c = Campaign();
      if(!c){ return; }
      var ribbonId = c.get('playerpageid');
      if(!ribbonId){ return; }

      var meta = readMapMetaFromMule();
      if(!meta || !meta.id || meta.id !== ribbonId){
        // Either no mapMeta yet, or it was captured for a different page.
        // In either case we fail quietly; GM can run --mapMeta all to refresh.
        return;
      }

      pruneInvalidGeoEntries();
      cleanMuleGeoAbilitiesOnInit();
      ensureGeoHandout(meta);

    }catch(e){
      log('dwt_geo refreshGeoForActivePage err: '+e);
    }
  }

  /* ========== Route Helpers ========== */

  function getOrCreateRoute(S, mapKey, routeName, pid, meta, token){
    var routesForMap = getRoutesForMap(S, mapKey);
    var key          = normalizeKey(routeName);
    if(!key){
      return { error:'Route name is required.' };
    }

    var existing = routesForMap[key];
    if(existing){
      return { route: existing, key:key };
    }

    var now = (new Date()).toISOString();
    var route = {
      name:       String(routeName).trim(),
      key:        key,
      mapKey:     mapKey,
      created_by: pid || '',
      created_at: now,
      updated_at: now,
      pageid:     (token && token.get('pageid')) || (meta && meta.id) || '',
      region:     (meta && meta.region_name) || '',
      locale:     (meta && meta.locale_name) || '',
      points:     []
    };
    routesForMap[key] = route;
    return { route: route, key:key };
  }

  function addPointToRoute(route, point){
    if(!route || !point) return;
    route.points.push(point);
    route.updated_at = (new Date()).toISOString();
  }

  /* ========== Command Handlers ========== */

  function handleStartRoute(args){
    var pid   = args.pid;
    var name  = (args.val===undefined || args.val===null) ? '' : String(args.val);
    var raw   = name.trim();
    var S     = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --startRoute.' };
    }
    if(!raw){
      return { error:'Route name is required for --startRoute.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var tokens = getLastSelectionForPlayer(pid);
    if(!tokens.length){
      return { error:'No token selected. Select a token and try again.' };
    }
    var token = tokens[0];

    if(token.get('pageid') !== meta.id){
      return { error:'Selected token is not on the page captured by mapMeta. Run "!dwt --mapMeta all" on this page first.' };
    }

    var got = getOrCreateRoute(S, mapKey, raw, pid, meta, token);
    if(got.error){
      return { error:got.error };
    }

    var route = got.route;
    var key   = got.key;

    // First point at start
    var point = buildGeoPoint(token, meta, 'Start');
    if(point){
      addPointToRoute(route, point);
    }

    S.currentRoute[pid] = { mapKey: mapKey, routeKey: key };
    syncRoutesToMule();

    sendChat('dwt','/w gm Started route "'+esc(route.name)+'" on map "'+esc(mapKey)+'" with 1 point.');
    return { changed:false };
  }

  function handleSetRoutePoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S     = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --setRoutePoint.' };
    }

    var active = S.currentRoute[pid];
    if(!active || !active.routeKey || !active.mapKey){
      return { error:'You have no active route. Use "!dwt --startRoute <name>" first.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    if(mapKey !== active.mapKey){
      return { error:'Your active route is on a different map ("'+active.mapKey+'"). Finish or delete it before adding points on this map.' };
    }

    var routesForMap = getRoutesForMap(S, mapKey);
    var route = routesForMap[active.routeKey];
    if(!route){
      delete S.currentRoute[pid];
      return { error:'Active route was not found. Start a new route.' };
    }

    var tokens = getLastSelectionForPlayer(pid);
    if(!tokens.length){
      return { error:'No token selected. Select a token and try again.' };
    }
    var token = tokens[0];

    if(token.get('pageid') !== meta.id){
      return { error:'Selected token is not on the page captured by mapMeta. Run "!dwt --mapMeta all" on this page first.' };
    }

    var idx = route.points.length+1;
    var pointLabel = label || ('Point '+idx);
    var point = buildGeoPoint(token, meta, pointLabel);
    if(!point){
      return { error:'Could not compute geolocation for the selected token.' };
    }

    addPointToRoute(route, point);
    syncRoutesToMule();

    sendChat('dwt','/w gm Added route point "'+esc(pointLabel)+'" to route "'+esc(route.name)+'" on "'+esc(mapKey)+'" (total '+route.points.length+' points).');
    return { changed:false };
  }

  function handleEndRoute(args){
    var pid = args.pid;
    var S   = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --endRoute.' };
    }

    var active = S.currentRoute[pid];
    if(!active || !active.routeKey || !active.mapKey){
      return { error:'You have no active route to end.' };
    }

    var routesForMap = getRoutesForMap(S, active.mapKey);
    var route = routesForMap[active.routeKey];
    delete S.currentRoute[pid];

    if(!route){
      return { error:'Active route was not found. It may have been deleted.' };
    }

    route.updated_at = (new Date()).toISOString();
    syncRoutesToMule();

    sendChat('dwt','/w gm Ended route "'+esc(route.name)+'" on "'+esc(active.mapKey)+'" ('+route.points.length+' points).');
    return { changed:false };
  }

  function handleListRoutes(args){
    var pid = args.pid;
    var S   = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --listRoutes.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta) || '(unknown)';

    var v    = cssVars();
    var card = v.card || '';
    var html = '<div style="'+card+'"><div><b>Routes on '+esc(mapKey)+'</b></div>';

    var routesForMap = S.routes[mapKey] || {};
    var keys = [];
    var k;
    for(k in routesForMap){
      if(routesForMap.hasOwnProperty(k)){
        keys.push(k);
      }
    }

    var active = S.currentRoute[pid];

    if(!keys.length){
      html += '<div>No routes have been defined yet on this map.</div>';
    }else{
      html += '<div style="margin-top:4px;">';
      for(var i=0;i<keys.length;i++){
        var key = keys[i];
        var r   = routesForMap[key];
        if(!r) continue;
        var isActive = (active && active.mapKey === mapKey && active.routeKey === key);
        var activeText = isActive ? ' (active)' : '';
        html += '<div><b>'+esc(r.name)+'</b>'+esc(activeText)+' — '+r.points.length+' points</div>';
      }
      html += '</div>';
    }

    html += '<div style="margin-top:6px;font-size:10px;color:#AAA;">'
          + 'Commands: !dwt --geo start route &lt;name&gt;, !dwt --geo set routepoint [name], !dwt --geo end route, !dwt --geo delete route &lt;name&gt;'
          + '</div>';
    html += '</div>';

    sendChat('dwt','/w gm '+html);
    return { changed:false };
  }

  function handleDeleteRoute(args){
    var pid  = args.pid;
    var name = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S    = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --deleteRoute.' };
    }
    if(!name){
      return { error:'Route name is required for --deleteRoute.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var key = normalizeKey(name);
    var routesForMap = getRoutesForMap(S, mapKey);
    var r   = routesForMap[key];
    if(!r){
      return { error:'Route "'+name+'" was not found on this map.' };
    }

    delete routesForMap[key];

    // clear any active pointer
    var pids = Object.keys(S.currentRoute);
    for(var i=0;i<pids.length;i++){
      var a = S.currentRoute[pids[i]];
      if(a && a.mapKey === mapKey && a.routeKey === key){
        delete S.currentRoute[pids[i]];
      }
    }

    syncRoutesToMule();
    sendChat('dwt','/w gm Deleted route "'+esc(r.name)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  /* ========== Map Points Handlers ========== */

  function handleSetMapPoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S     = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --setMapPoint.' };
    }
    if(!label){
      return { error:'A point name (usually the selected token name) is required for --setMapPoint.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var tokens = getLastSelectionForPlayer(pid);
    if(!tokens.length){
      return { error:'No token selected. Select a token and try again.' };
    }
    var token = tokens[0];

    if(token.get('pageid') !== meta.id){
      return { error:'Selected token is not on the page captured by mapMeta. Run "!dwt --mapMeta all" on this page first.' };
    }

    var pointData = buildGeoPoint(token, meta, label);
    if(!pointData){
      return { error:'Could not compute geolocation for the selected token.' };
    }

    var pointsForMap = getPointsForMap(S, mapKey);
    var key = normalizeKey(label);

    pointsForMap[key] = {
      name:   label,
      key:    key,
      mapKey: mapKey,
      pageid: meta.id,
      data:   pointData
    };

    syncPointsToMule();

    sendChat('dwt','/w gm Stored map point "'+esc(label)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  function handleDelMapPoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S     = ensureGeoState();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --delMapPoint.' };
    }
    if(!label){
      return { error:'Point name is required for --delMapPoint.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var pointsForMap = getPointsForMap(S, mapKey);
    var key = normalizeKey(label);
    var p   = pointsForMap[key];
    if(!p){
      return { error:'Map point "'+label+'" was not found on this map.' };
    }

    delete pointsForMap[key];
    syncPointsToMule();

    sendChat('dwt','/w gm Deleted map point "'+esc(label)+'" from "'+esc(mapKey)+'".');
    return { changed:false };
  }


  /* ========== Map Navigation & Rename Handlers ========== */

  function handleMapGotoPoint(args){
    var pid = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --mapGotoPoint.' };
    }
    if(!label){
      return { error:'Usage: !dwt --geo goto location <location name>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var points = getPointsForMap(S, mapKey);

    var normLabel = normalizeKey(label);
    var target = points[normLabel] || null;

    if(!target){
      // Fallback: search by stored display name.
      for(var k in points){
        if(!points.hasOwnProperty(k)) continue;
        var p = points[k];
        if(normalizeKey(p.name||k) === normLabel){
          target = p;
          break;
        }
      }
    }

    if(!target){
      return { error:'Map point "'+label+'" was not found on this map.' };
    }

    var data = target.data || {};
    var pos  = data.position || {};
    var page = data.page || {};
    var pageid = page.id || target.pageid;
    var left  = Number(pos.left_px || 0);
    var top   = Number(pos.top_px  || 0);

    try{
      sendPing(left, top, pageid, null, true);
    }catch(e){
      log('dwt_geo mapGotoPoint sendPing err: '+e);
    }

    // No GM whisper here; map recenters silently.
    return { changed:false };
  }

  function handleMapGotoRoute(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --mapGotoRoute.' };
    }
    if(!raw){
      return { error:'Usage: !dwt --geo goto route <route name>.' };
    }

    // Support optional index selection for direct point jumps (used by route bullets).
    // Accepted form:
    //   "!dwt --geo goto route The Old Road 2"
    var name  = raw;
    var index = 0;

    var m = raw.match(/^(.*)\s+(\d+)$/);
    if(m){
      name  = m[1].trim();
      index = parseInt(m[2], 10);
      if(isNaN(index) || index < 0){
        index = 0;
      }
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var routes = getRoutesForMap(S, mapKey);

    var normName = normalizeKey(name);
    var route = null;
    var routeKey = null;

    for(var k in routes){
      if(!routes.hasOwnProperty(k)) continue;
      var r = routes[k];
      if(normalizeKey(r.name||k) === normName){
        route   = r;
        routeKey= k;
        break;
      }
    }

    if(!route){
      return { error:'Route "'+name+'" was not found on this map.' };
    }
    if(!route.points || !route.points.length){
      return { error:'Route "'+(route.name||name)+'" has no points defined yet.' };
    }

    // Clamp index into the valid range of route points.
    if(index >= route.points.length){
      index = route.points.length-1;
    }

    // Remember current route position per GM.
    S.currentRoute[pid] = {
      mapKey:   mapKey,
      routeKey: routeKey,
      index:    index
    };

    var point = route.points[index];
    var data  = point.data || point || {};
    var pos   = data.position || {};
    var page  = data.page || {};
    var pageid = page.id || route.pageid;
    var left  = Number(pos.left_px || 0);
    var top   = Number(pos.top_px  || 0);

    try{
      sendPing(left, top, pageid, null, true);
    }catch(e){
      log('dwt_geo mapGotoRoute sendPing err: '+e);
    }

    // No GM whisper here; map recenters silently.
    return { changed:false };
  }


  function stepRouteForGM(pid, name, delta){
    if(!playerIsGM(pid)){
      return { error:'Only the gm may step along routes.' };
    }
    name = String(name||'').trim();
    if(!name){
      return { error:'Usage: !dwt --geo prev routepoint/--mapRouteNext <route name>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var routes = getRoutesForMap(S, mapKey);

    var normName = normalizeKey(name);
    var route = null;
    var routeKey = null;

    for(var k in routes){
      if(!routes.hasOwnProperty(k)) continue;
      var r = routes[k];
      if(normalizeKey(r.name||k) === normName){
        route = r;
        routeKey = k;
        break;
      }
    }

    if(!route){
      return { error:'Route "'+name+'" was not found on this map.' };
    }
    if(!route.points || !route.points.length){
      return { error:'Route "'+(route.name||name)+'" has no points to step through.' };
    }

    S.currentRoute[pid] = S.currentRoute[pid] || {
      mapKey:   mapKey,
      routeKey: routeKey,
      index:    0
    };
    var cur = S.currentRoute[pid];
    if(cur.mapKey !== mapKey || cur.routeKey !== routeKey){
      cur.mapKey  = mapKey;
      cur.routeKey= routeKey;
      cur.index   = 0;
    }

    var idx = cur.index + delta;
    if(idx < 0){ idx = 0; }
    if(idx >= route.points.length){ idx = route.points.length-1; }
    cur.index = idx;

    var point = route.points[idx];
    var data  = point.data || point || {};
    var pos   = data.position || {};
    var page  = data.page || {};
    var pageid = page.id || route.pageid;
    var left  = Number(pos.left_px || 0);
    var top   = Number(pos.top_px  || 0);

    try{
      sendPing(left, top, pageid, null, true);
    }catch(e){
      log('dwt_geo stepRouteForGM sendPing err: '+e);
    }

    // No GM whisper here; stepping is silent.
    return { changed:false };
  }

  function handleRenMapPoint(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --renMapPoint.' };
    }
    if(!raw){
      return { error:'Usage: !dwt --renMapPoint <current name|selected> <new name>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !dwt --renMapPoint <current name|selected> <new name>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New name cannot be empty for --renMapPoint.' };
    }

    // Allow sentinel "selected" to use the last selected token's name.
    if(/^selected$/i.test(currentName)){
      var tokens = getLastSelectionForPlayer(pid);
      if(!tokens.length){
        return { error:'No token is currently selected to derive a name from.' };
      }
      currentName = tokens[0].get('name') || '';
      if(!currentName){
        return { error:'Selected token has no name to derive a current value from.' };
      }
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var points = getPointsForMap(S, mapKey);

    var normCurrent = normalizeKey(currentName);
    var targetKey = null;
    var target    = null;

    for(var k in points){
      if(!points.hasOwnProperty(k)) continue;
      var p = points[k];
      if(normalizeKey(p.name||k) === normCurrent){
        targetKey = k;
        target    = p;
        break;
      }
    }

    if(!target){
      return { error:'Map point "'+currentName+'" was not found on this map.' };
    }

    var oldName = target.name || currentName;
    target.name = newName;
    syncPointsToMule();

    sendChat('dwt','/w gm Renamed map point "'+esc(oldName)+'" to "'+esc(newName)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  function handleRenRoute(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --renRoute.' };
    }
    if(!raw){
      return { error:'Usage: !dwt --renRoute <current name> <new name>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !dwt --renRoute <current name> <new name>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New name cannot be empty for --renRoute.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var routes = getRoutesForMap(S, mapKey);

    var normCurrent = normalizeKey(currentName);
    var targetKey = null;
    var target    = null;

    for(var k in routes){
      if(!routes.hasOwnProperty(k)) continue;
      var r = routes[k];
      if(normalizeKey(r.name||k) === normCurrent){
        targetKey = k;
        target    = r;
        break;
      }
    }

    if(!target){
      return { error:'Route "'+currentName+'" was not found on this map.' };
    }

    var oldName = target.name || currentName;
    target.name = newName;
    syncRoutesToMule();

    sendChat('dwt','/w gm Renamed route "'+esc(oldName)+'" to "'+esc(newName)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  function handleRenRoutePoint(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the gm may use --renRoutePoint.' };
    }
    if(!raw){
      return { error:'Usage: !dwt --renRoutePoint <current point name|selected> <new name>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !dwt --renRoutePoint <current point name|selected> <new name>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New name cannot be empty for --renRoutePoint.' };
    }

    // Allow sentinel "selected" to derive the point name from the selected token.
    if(/^selected$/i.test(currentName)){
      var tokens = getLastSelectionForPlayer(pid);
      if(!tokens.length){
        return { error:'No token is currently selected to derive a point name from.' };
      }
      currentName = tokens[0].get('name') || '';
      if(!currentName){
        return { error:'Selected token has no name to derive a current point value from.' };
      }
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!dwt --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureGeoState();
    var cur    = S.currentRoute[pid];

    if(!cur || cur.mapKey !== mapKey){
      return { error:'No active route for this map. Use --startRoute first before renaming a route point.' };
    }

    var routes = getRoutesForMap(S, mapKey);
    var route  = routes[cur.routeKey];
    if(!route){
      return { error:'The active route record could not be found for this map.' };
    }
    if(!route.points || !route.points.length){
      return { error:'The active route has no points to rename.' };
    }

    var normCurrent = normalizeKey(currentName);
    var idx = -1;
    for(var i=0;i<route.points.length;i++){
      var pt = route.points[i];
      var label = pt.label || ('Point '+(i+1));
      if(normalizeKey(label) === normCurrent){
        idx = i;
        break;
      }
    }

    if(idx === -1){
      return { error:'No point named "'+currentName+'" was found on the active route.' };
    }

    var point = route.points[idx];
    var oldLabel = point.label || ('Point '+(idx+1));
    point.label  = newName;

    syncRoutesToMule();

    sendChat('dwt','/w gm Renamed route point "'+esc(oldLabel)+'" to "'+esc(newName)+'" in route "'+esc(route.name||'')+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }



  /* ========== Standardized Geo Command Surface ========== */
  /* !dwt --geo <action> <target> <value...> */

  function _geoError(msg){
    return { error: String(msg||'Geo command error.') };
  }

  function _splitArgs(s){
    s = String(s||'').trim();
    if(!s) return [];
    return s.split(/\s+/);
  }

  function _joinRest(parts, startIdx){
    return parts.slice(startIdx).join(' ').trim();
  }

  function _geoListLocations(args){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _geoError('Only the gm may use geo location listing.');
    }
    var meta = readMapMetaFromMule();
    if(!meta){
      return _geoError('No map metadata found. Use "!dwt --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta) || '(unknown)';
    var S = ensureGeoState();
    var pointsForMap = S.points[mapKey] || {};
    var keys = [];
    for(var k in pointsForMap){
      if(pointsForMap.hasOwnProperty(k)){
        keys.push(k);
      }
    }
    keys.sort();

    var v = cssVars();
    var html = '<div style="'+(v.card||'')+'"><div><b>Locations on '+esc(mapKey)+'</b></div>';
    if(!keys.length){
      html += '<div>No locations have been defined yet on this map.</div>';
    }else{
      html += '<div style="margin-top:4px;">';
      for(var i=0;i<keys.length;i++){
        var p = pointsForMap[keys[i]];
        if(!p) continue;
        var nm = p.name || keys[i];
        html += '<div><b>'+esc(nm)+'</b></div>';
      }
      html += '</div>';
    }
    html += '</div>';
    sendChat('dwt','/w gm '+html);
    return { changed:false };
  }

  function _geoDeleteRoutePoint(args, routeNameOpt, selector){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _geoError('Only the gm may delete route points.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _geoError('No map metadata found. Use "!dwt --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _geoError('Unable to derive a map key from the current page name.');
    }

    var S = ensureGeoState();
    var routeName = (routeNameOpt || '').trim();
    var routeKey  = null;
    var route     = null;

    // If route omitted, use current route for this GM on this map.
    if(!routeName){
      var cur = S.currentRoute[pid];
      if(cur && cur.mapKey === mapKey && cur.routeKey){
        routeKey = cur.routeKey;
      }else{
        return _geoError('No current route is set. Use "!dwt --geo goto route <routeName>" or start a route.');
      }
    }

    var routesForMap = getRoutesForMap(S, mapKey);
    if(!routeKey){
      var norm = normalizeKey(routeName);
      for(var k in routesForMap){
        if(!routesForMap.hasOwnProperty(k)) continue;
        var r = routesForMap[k];
        if(normalizeKey(r.name||k) === norm){
          routeKey = k;
          break;
        }
      }
      if(!routeKey){
        return _geoError('Route "'+routeName+'" was not found on this map.');
      }
    }

    route = routesForMap[routeKey];
    if(!route || !route.points || !route.points.length){
      return _geoError('Route has no points to delete.');
    }

    selector = String(selector||'').trim();
    if(!selector){
      return _geoError('You must specify an index or point name to delete.');
    }

    var idx = -1;
    if(/^\d+$/.test(selector)){
      idx = parseInt(selector,10);
      // Support 1-based user indexing by treating 1..N as 1-based.
      // Also allow 0-based if they explicitly use 0.
      if(idx > 0){
        idx = idx - 1;
      }
    }else{
      var normSel = normalizeKey(selector);
      for(var i=0;i<route.points.length;i++){
        var pt = route.points[i];
        var lbl = pt.label || ('Point '+(i+1));
        if(normalizeKey(lbl) === normSel){
          idx = i;
          break;
        }
      }
    }

    if(idx < 0 || idx >= route.points.length){
      return _geoError('Routepoint selector "'+selector+'" did not match any point.');
    }

    var removed = route.points.splice(idx,1)[0];
    route.updated_at = (new Date()).toISOString();
    syncRoutesToMule();

    // Keep currentRoute index within bounds if it exists.
    if(S.currentRoute[pid] && S.currentRoute[pid].mapKey === mapKey && S.currentRoute[pid].routeKey === routeKey){
      var cur2 = S.currentRoute[pid];
      if(typeof cur2.index === 'number'){
        if(cur2.index >= route.points.length){ cur2.index = Math.max(0, route.points.length-1); }
      }
    }

    var removedLabel = (removed && (removed.label || removed.name)) || ('Point '+(idx+1));
    sendChat('dwt','/w gm Deleted route point "'+esc(removedLabel)+'" from route "'+esc(route.name||'')+'".');
    return { changed:false };
  }

  function _geoGotoRoutePoint(args, routeNameOpt, selector){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _geoError('Only the gm may use geo route navigation.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _geoError('No map metadata found. Use "!dwt --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _geoError('Unable to derive a map key from the current page name.');
    }

    var S = ensureGeoState();
    var routeName = (routeNameOpt || '').trim();
    var routesForMap = getRoutesForMap(S, mapKey);

    var routeKey = null;
    var route = null;

    if(routeName){
      var norm = normalizeKey(routeName);
      for(var k in routesForMap){
        if(!routesForMap.hasOwnProperty(k)) continue;
        var r = routesForMap[k];
        if(normalizeKey(r.name||k) === norm){
          routeKey = k;
          route = r;
          break;
        }
      }
      if(!route){
        return _geoError('Route "'+routeName+'" was not found on this map.');
      }
    }else{
      var cur = S.currentRoute[pid];
      if(cur && cur.mapKey === mapKey && cur.routeKey){
        routeKey = cur.routeKey;
        route = routesForMap[routeKey];
      }
      if(!route){
        return _geoError('No current route is set. Use "!dwt --geo goto route <routeName>" first.');
      }
    }

    if(!route.points || !route.points.length){
      return _geoError('Route "'+(route.name||routeKey)+'" has no points defined yet.');
    }

    selector = String(selector||'').trim();
    if(!selector){
      return _geoError('You must specify an index or point name.');
    }

    var index = -1;
    if(/^\d+$/.test(selector)){
      index = parseInt(selector,10);
      if(index > 0){
        index = index - 1;
      }
    }else{
      var normSel = normalizeKey(selector);
      for(var i=0;i<route.points.length;i++){
        var pt = route.points[i];
        var lbl = pt.label || ('Point '+(i+1));
        if(normalizeKey(lbl) === normSel){
          index = i;
          break;
        }
      }
    }

    if(index < 0 || index >= route.points.length){
      return _geoError('Routepoint selector "'+selector+'" did not match any point.');
    }

    // Set current route + index, then ping
    S.currentRoute[pid] = { mapKey: mapKey, routeKey: routeKey, index: index };

    var point = route.points[index];
    var data  = point.data || point || {};
    var pos   = data.position || {};
    var page  = data.page || {};
    var pageid = page.id || route.pageid;
    var left  = Number(pos.left_px || 0);
    var top   = Number(pos.top_px  || 0);

    try{
      sendPing(left, top, pageid, null, true);
    }catch(e){
      log('dwt_geo geoGotoRoutePoint sendPing err: '+e);
    }

    return { changed:false };
  }

  function _geoPrevNextRoutePoint(args, delta){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _geoError('Only the gm may step along routes.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _geoError('No map metadata found. Use "!dwt --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _geoError('Unable to derive a map key from the current page name.');
    }

    var S = ensureGeoState();
    var cur = S.currentRoute[pid];
    if(!cur || cur.mapKey !== mapKey || !cur.routeKey){
      return _geoError('No current route is set. Use "!dwt --geo goto route <routeName>" first.');
    }

    var routesForMap = getRoutesForMap(S, mapKey);
    var route = routesForMap[cur.routeKey];
    if(!route || !route.points || !route.points.length){
      return _geoError('Current route has no points.');
    }

    var idx = (typeof cur.index === 'number') ? cur.index : 0;
    idx = idx + delta;
    if(idx < 0) idx = 0;
    if(idx >= route.points.length) idx = route.points.length-1;
    cur.index = idx;

    var point = route.points[idx];
    var data  = point.data || point || {};
    var pos   = data.position || {};
    var page  = data.page || {};
    var pageid = page.id || route.pageid;
    var left  = Number(pos.left_px || 0);
    var top   = Number(pos.top_px  || 0);

    try{
      sendPing(left, top, pageid, null, true);
    }catch(e){
      log('dwt_geo geoPrevNextRoutePoint sendPing err: '+e);
    }

    return { changed:false };
  }

  function handleGeoCommand(args){
    var pid = args.pid;
    var expr = String(args.val||'').trim();
    if(!expr){
      return _geoError('Usage: !dwt --geo <action> <target> <value...>');
    }

    var parts = _splitArgs(expr);
    var action = (parts[0]||'').toLowerCase();
    var target = (parts[1]||'').toLowerCase();

    // list routes|locations
    if(action === 'list'){
      if(target === 'routes'){
        return handleListRoutes({ pid:pid, val:'' });
      }
      if(target === 'locations'){
        return _geoListLocations({ pid:pid, val:'' });
      }
      return _geoError('Usage: !dwt --geo list routes|locations');
    }

    // start route <routeName>
    if(action === 'start' && target === 'route'){
      var nm = _joinRest(parts,2);
      return handleStartRoute({ pid:pid, val:nm });
    }

    // end route
    if(action === 'end' && target === 'route'){
      return handleEndRoute({ pid:pid, val:'' });
    }

    // set routepoint <pointName>
    if(action === 'set' && target === 'routepoint'){
      var pt = _joinRest(parts,2);
      return handleSetRoutePoint({ pid:pid, val:pt });
    }

    // set location <locationName>
    if(action === 'set' && target === 'location'){
      var loc = _joinRest(parts,2);
      return handleSetMapPoint({ pid:pid, val:loc });
    }

    // goto route <routeName>
    if(action === 'goto' && target === 'route'){
      var rnm = _joinRest(parts,2);
      return handleMapGotoRoute({ pid:pid, val:rnm });
    }

    // goto location <locationName>
    if(action === 'goto' && target === 'location'){
      var lnm = _joinRest(parts,2);
      return handleMapGotoPoint({ pid:pid, val:lnm });
    }

    // goto routepoint <routeName (optional)> <index|pointName>
    if(action === 'goto' && target === 'routepoint'){
      // If 3+ parts: could be routeName + selector, or selector only.
      // We treat the last token as selector, and the preceding tokens (from 2..n-2) as optional routeName.
      if(parts.length < 3){
        return _geoError('Usage: !dwt --geo goto routepoint <routeName (optional)> <index|pointName>');
      }
      var selector = parts[parts.length-1];
      var routeMaybe = '';
      if(parts.length > 3){
        routeMaybe = parts.slice(2, parts.length-1).join(' ').trim();
      }
      return _geoGotoRoutePoint({ pid:pid }, routeMaybe, selector);
    }

    // prev/next routepoint (current route implied)
    if(action === 'prev' && target === 'routepoint'){
      return _geoPrevNextRoutePoint({ pid:pid }, -1);
    }
    if(action === 'next' && target === 'routepoint'){
      return _geoPrevNextRoutePoint({ pid:pid }, +1);
    }

    // delete route <routeName>
    if(action === 'delete' && target === 'route'){
      var dn = _joinRest(parts,2);
      return handleDeleteRoute({ pid:pid, val:dn });
    }

    // delete location <locationName>
    if(action === 'delete' && target === 'location'){
      var dl = _joinRest(parts,2);
      return handleDelMapPoint({ pid:pid, val:dl });
    }

    // delete routepoint <routeName (optional)> <index|pointName>
    if(action === 'delete' && target === 'routepoint'){
      if(parts.length < 3){
        return _geoError('Usage: !dwt --geo delete routepoint <routeName (optional)> <index|pointName>');
      }
      var sel = parts[parts.length-1];
      var rMaybe = '';
      if(parts.length > 3){
        rMaybe = parts.slice(2, parts.length-1).join(' ').trim();
      }
      return _geoDeleteRoutePoint({ pid:pid }, rMaybe, sel);
    }

    // rename route <old> <new>
    if(action === 'rename' && target === 'route'){
      var rest = _joinRest(parts,2);
      return handleRenRoute({ pid:pid, val:rest });
    }

    // rename location <old> <new>
    if(action === 'rename' && target === 'location'){
      var restL = _joinRest(parts,2);
      return handleRenMapPoint({ pid:pid, val:restL });
    }

    // rename routepoint <old> <new> (current route)
    if(action === 'rename' && target === 'routepoint'){
      var restP = _joinRest(parts,2);
      return handleRenRoutePoint({ pid:pid, val:restP });
    }

    return _geoError('Unknown geo command. Use: !dwt --geo list routes|locations');
  }

  /* ========== Core Integration (Help + Log Card) ========== */

  function renderConfigHTML(pid){
    // Keep this minimal: only expose the Map Routes & Locations handout button.
    ensureGeoState();
    var v         = cssVars();
    var escFn     = v.esc || esc;
    var cardStyle = v.card || '';
    var btnStyle  = v.btn  || '';

    var meta = readMapMetaFromMule();
    var h    = ensureGeoHandout(meta);

    var html = '<div'+(cardStyle?(' style="'+cardStyle+'"'):'')+'>';    

    if(h && h.id){
      var url       = 'https://journal.roll20.net/handout/'+h.id;
      var actionAttrs = (RT.dwt && typeof RT.dwt.actionLinkAttrs === 'function')
        ? RT.dwt.actionLinkAttrs(url)
        : ' role="button" href="'+(v.hrefAttr ? v.hrefAttr(url) : url)+'"'+(btnStyle ? (' style="'+btnStyle+'"') : '');
      html += '<a'+actionAttrs+' target="_blank">Show Map Locations and Routes</a>';
    }

    html += '</div>';
    return html;
  }

  function registerWithCore(){
    try{
      if(RT.dwt && !_registered && typeof RT.dwt.registerCommands === 'function'){
        
RT.dwt.registerCommands({
  'geo': {
    access:'gm',
    handler:handleGeoCommand
  }
});

if(typeof RT.dwt.addLogCard === 'function'){
          RT.dwt.addLogCard(25, function(pid){
            try{
              return renderConfigHTML(pid);
            }catch(e){
              log('dwt_geo logCard err: '+e);
              return '';
            }
          });
        }

        if(typeof RT.dwt.addHelpSection === 'function'){
          
if(typeof RT.dwt.addHelpSection === 'function'){
  RT.dwt.addHelpSection(25, 'Geolocation and Routes', function(){
    return [
      'Routes:', '',
      '!dwt --geo list routes',
      '!dwt --geo start route <routeName>',
      '!dwt --geo set routepoint <pointName>',
      '!dwt --geo end route',
      '!dwt --geo goto route <routeName>',
      '!dwt --geo goto routepoint <routeName (current if omitted)> <index|pointName>',
      '!dwt --geo prev routepoint',
      '!dwt --geo next routepoint',
      '!dwt --geo delete route <routeName>',
      '!dwt --geo delete routepoint <routeName (current if omitted)> <index|pointName>',
      '!dwt --geo rename route <oldName> <newName>',
      '!dwt --geo rename routepoint <oldName> <newName>',
      '',
      'Locations:', '',
      '!dwt --geo list locations',
      '!dwt --geo set location <locationName>',
      '!dwt --geo goto location <locationName>',
      '!dwt --geo delete location <locationName>',
      '!dwt --geo rename location <oldName> <newName>'
    ];
  });
}
        }

        _registered = true;
      }
    }catch(e){
      log('dwt_geo registerWithCore err: '+e);
    }
  }

  function moduleStartup(mule, reason){
    ensureGeoState();
    loadRoutesFromMule();
    loadPointsFromMule();
    pruneInvalidGeoEntries();
    cleanMuleGeoAbilitiesOnInit();
    refreshGeoForActivePage();
    mirrorVersionToMule();
    syncGeoRootToMule();
  }

  function init(){
    moduleStartup(null, 'ready');
    registerWithCore();

    if(!_startupRegistered){
      try{
        if(RT.dwt && typeof RT.dwt.registerStartup === 'function'){
          RT.dwt.registerStartup('geo', moduleStartup);
          _startupRegistered = true;
        }
      }catch(e){
        log('dwt_geo startup registration err: '+e);
      }
    }

    if(!_startupRegistered){
      try{
        RT.dwtQ = RT.dwtQ || [];
        RT.dwtQ.push(function(dwt){
          if(!_startupRegistered && dwt && typeof dwt.registerStartup === 'function'){
            dwt.registerStartup('geo', moduleStartup);
            _startupRegistered = true;
          }
          registerWithCore();
        });
      }catch(e){
        log('dwt_geo dwtQ err: '+e);
      }
    }
  }

  return {
    init: init,
    refreshGeoForActivePage: refreshGeoForActivePage
  };
}());

on('ready', function(){
  'use strict';
  try{ dwt_geo.init(); }catch(e){ log('dwt_geo init err: '+e); }
});


// Selection capture: track selection for route & map point commands
on('chat:message', function(msg){
  'use strict';
  try{
    if(msg.type!=='api') return;
    var content = String(msg.content||'').trim();
    if(content.indexOf('!dwt') !== 0) return;
    var lower = content.toLowerCase();
    // Capture selection for geo commands that require a selected token.
// (start route, set routepoint, set location)
if(lower.indexOf('--geo')===-1){
  return;
}

var geoTail = lower.split('--geo')[1] || '';
geoTail = geoTail.trim();

// Only for actions that require token selection
if(!(geoTail.indexOf('start route')===0 ||
     geoTail.indexOf('set routepoint')===0 ||
     geoTail.indexOf('set location')===0)){
  return;
}

    if(!state.dwt){ state.dwt = {}; }
    if(!state.dwt.geo){
      state.dwt.geo = { routes:{}, points:{}, currentRoute:{}, lastSelection:{} };
    }else{
      if(!state.dwt.geo.routes){ state.dwt.geo.routes = {}; }
      if(!state.dwt.geo.points){ state.dwt.geo.points = {}; }
      if(!state.dwt.geo.currentRoute){ state.dwt.geo.currentRoute = {}; }
      if(!state.dwt.geo.lastSelection){ state.dwt.geo.lastSelection = {}; }
    }

    var sels = msg.selected || [];
    var out  = [];
    for(var i=0;i<sels.length;i++){
      var s = sels[i];
      if(!s || !s._id || !s._type) continue;
      out.push({ _id:s._id, _type:s._type });
    }
    state.dwt.geo.lastSelection[msg.playerid || ''] = out;

  }catch(e){
    log('dwt_geo selection listener err: '+e);
  }
});

