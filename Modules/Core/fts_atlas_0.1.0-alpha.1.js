// name:        fts_atlas.js
// version:     0.1.0-alpha.1
// description: GM-only Campaign Atlas handout for FTS map browsing, verification, repair, and campaign-wide map review.
// depends:     fts_core >= 0.2.0-alpha.1 (optional but recommended), fts_mapMeta >= 0.2.0-alpha.1 (optional but recommended), Roll20 Mod API
// provides:    !fts --atlas
//              !fts --atlas current
//              !fts --atlas page <pageId>
//              !fts --atlas refresh
//              !fts --atlas verify campaign
//              !fts --atlas verify page
//              !fts --atlas verify repairCampaign
//              !fts --atlas verify repairPage
// author:      tcm (AI-assisted)
// Semantic Versioning (SemVer) Policy:
// - FTS uses SemVer in the form MAJOR.MINOR.PATCH[-PRERELEASE].
// - Pre-release versions stay in 0.y.z. Anything may change and the API is not yet considered stable.
// - Increment PATCH for non-breaking bug fixes.
// - Increment MINOR for new non-breaking functionality.
// - Increment MAJOR only when the public API becomes stable and/or incompatible breaking changes are introduced.
// - Pre-release labels such as alpha, beta, or rc mark unstable builds and sort lower than the matching normal release.
// - Once a version is released, its contents must not be changed; further edits require a new version.
// - Header comments, internal VERSION constants, filenames, generated module text, and documentation references must stay aligned.
// - Dependency notes should use SemVer-friendly wording such as ">= 0.1.0-alpha.1" rather than informal forms like "5.1.0+".

var fts_atlas = (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  var VERSION = '0.1.0-alpha.1';
  var MODULE_KEY = 'atlas';
  var HANDOUT_NAME = 'Campaign Atlas';
  var _registered = false;
  var _startupRegistered = false;

  function ensureAtlasState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.atlas){
      state.fts.atlas = { updateByPlayer:{} };
    }
    if(!state.fts.atlas.updateByPlayer) state.fts.atlas.updateByPlayer = {};
    return state.fts.atlas;
  }

  function esc(s){
    return String(s || '').replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c] || c;
    });
  }

  function lower(s){
    return String(s || '').toLowerCase();
  }

  function badge(text){
    return '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 6px;border:1px solid #999;border-radius:999px;font-size:11px;">'
      + esc(text)
      + '</span>';
  }

  function cssVars(){
    return (RT.fts && typeof RT.fts.cssVars === 'function')
      ? RT.fts.cssVars()
      : {
          container:'',
          title:'',
          card:'',
          link:'text-decoration:none;color:#2266aa;',
          btn:'display:block;text-align:center;',
          hrefAttr:function(s){ return String(s || '').replace(/"/g, '&quot;'); },
          literal:function(s){ return '<code>' + esc(s) + '</code>'; }
        };
  }

  function currentPaletteName(){
    try{
      if(RT.fts && typeof RT.fts.ensureCoreState === 'function'){
        var S = RT.fts.ensureCoreState();
        return String((((S || {}).ui || {}).palette) || 'none').toLowerCase();
      }
    }catch(e){}
    return 'none';
  }

  function gmAreaStyle(){
    var palette = currentPaletteName();
    var map = {
      none:{ bg:'rgba(80, 92, 108, 0.08)', border:'rgba(80, 92, 108, 0.20)' },
      dark:{ bg:'rgba(155, 109, 255, 0.10)', border:'rgba(155, 109, 255, 0.26)' },
      mint:{ bg:'rgba(82, 125, 82, 0.10)', border:'rgba(82, 125, 82, 0.26)' },
      parchment:{ bg:'rgba(154, 110, 55, 0.10)', border:'rgba(154, 110, 55, 0.26)' },
      powder:{ bg:'rgba(122, 167, 217, 0.12)', border:'rgba(122, 167, 217, 0.28)' },
      rosebud:{ bg:'rgba(186, 46, 104, 0.10)', border:'rgba(186, 46, 104, 0.26)' }
    };
    var tone = map[palette] || map.none;
    return (cssVars().card || '') + 'border:1px solid ' + tone.border + ';background:' + tone.bg + ';';
  }

  function shell(title){
    var v = cssVars();
    return '<div style="' + (v.container || '') + '"><div style="' + (v.title || '') + '">' + esc(title) + '</div>';
  }

  function endShell(){
    return '</div>';
  }

  function isGM(pid){
    try{
      return !!playerIsGM(pid);
    }catch(e){
      return false;
    }
  }

  function actionLinkAttrs(target){
    if(RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      return RT.fts.actionLinkAttrs(target);
    }
    var v = cssVars();
    return ' href="' + (v.hrefAttr ? v.hrefAttr(target) : esc(target)) + '" style="' + (v.btn || v.link || '') + '"';
  }

  function directLinkAttrs(target){
    return actionLinkAttrs(target) + ' target="_blank" rel="noopener noreferrer"';
  }

  function handoutUrl(handout){
    return handout ? ('https://journal.roll20.net/handout/' + handout.id) : '';
  }

  function atlasHandout(){
    return findObjs({ _type:'handout', name:HANDOUT_NAME })[0] || null;
  }

  function ensureAtlasHandout(){
    var handout = atlasHandout();
    if(!handout){
      handout = createObj('handout', {
        name: HANDOUT_NAME,
        inplayerjournals: '',
        controlledby: '',
        archived: false
      });
    }else{
      handout.set({ inplayerjournals:'', controlledby:'', archived:false });
    }
    return handout;
  }

  function getEffectivePageId(pid){
    if(RT.fts && typeof RT.fts.getEffectivePageId === 'function'){
      return String(RT.fts.getEffectivePageId(pid) || '');
    }
    try{
      var campaign = Campaign();
      var specific = campaign.get('playerspecificpages') || {};
      if(pid && specific[pid]) return String(specific[pid] || '');
      return String(campaign.get('playerpageid') || '');
    }catch(e){
      return '';
    }
  }

  function normalizeMapKeyComponent(s){
    return lower(String(s || '')).replace(/[^a-z0-9]+/g, '');
  }

  function mapKeyFromMeta(meta){
    if(!meta || typeof meta !== 'object') return '';
    if(meta.name) return normalizeMapKeyComponent(meta.name);
    if(meta.raw_name) return normalizeMapKeyComponent(meta.raw_name);
    if(meta.page_name) return normalizeMapKeyComponent(meta.page_name);
    if(meta.id) return 'map' + String(meta.id);
    return '';
  }

  function getMapMetaState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.mapmeta){
      state.fts.mapmeta = { last:null, byPage:{}, flash:{}, namingWarn:{} };
    }
    if(!state.fts.mapmeta.byPage) state.fts.mapmeta.byPage = {};
    return state.fts.mapmeta;
  }

  function getMapRecordsState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.mapRecords){
      state.fts.mapRecords = { routes:{}, points:{}, currentRoute:{}, lastSelection:{} };
    }
    if(!state.fts.mapRecords.routes) state.fts.mapRecords.routes = {};
    if(!state.fts.mapRecords.points) state.fts.mapRecords.points = {};
    if(!state.fts.mapRecords.currentRoute) state.fts.mapRecords.currentRoute = {};
    if(!state.fts.mapRecords.lastSelection) state.fts.mapRecords.lastSelection = {};
    return state.fts.mapRecords;
  }

  function getPageById(pageId){
    return pageId ? getObj('page', String(pageId || '')) : null;
  }

  function allPages(){
    var pages = findObjs({ _type:'page' }) || [];
    pages.sort(function(a, b){
      return String(a.get('name') || '').localeCompare(String(b.get('name') || ''));
    });
    return pages;
  }

  function routeCountForMap(mapKey){
    var records = getMapRecordsState();
    var routes = records.routes[String(mapKey || '')] || {};
    return Object.keys(routes).length;
  }

  function pointCountForMap(mapKey){
    var records = getMapRecordsState();
    var points = records.points[String(mapKey || '')] || {};
    return Object.keys(points).length;
  }

  function collectPageSummary(page, meta){
    var pageId = String((page && page.id) || (meta && meta.id) || '');
    var pageName = page ? String(page.get('name') || '') : String((meta && meta.raw_name) || '(missing page)');
    var mapKey = meta ? mapKeyFromMeta(meta) : '';
    return {
      pageId: pageId,
      pageName: pageName || '(unnamed page)',
      mapKey: mapKey,
      meta: meta || null,
      pageExists: !!page,
      pointCount: mapKey ? pointCountForMap(mapKey) : 0,
      routeCount: mapKey ? routeCountForMap(mapKey) : 0
    };
  }

  function focusPageSummary(pageId){
    var metaState = getMapMetaState();
    var meta = metaState.byPage[String(pageId || '')] || null;
    var page = getPageById(pageId);
    return collectPageSummary(page, meta);
  }

  function currentPlayerRoute(pid, mapKey){
    var records = getMapRecordsState();
    var active = records.currentRoute[String(pid || '')] || null;
    if(!active || String(active.mapKey || '') !== String(mapKey || '')) return null;
    return active;
  }

  function refreshFtsHref(){
    return '!fts --atlas refresh';
  }

  function renderControlPanel(){
    var html = '<div style="' + gmAreaStyle() + '">';
    html += '<div><b>GM-Only Controls</b></div>';
    html += '<div style="margin-top:4px;">Use these controls to refresh the shared FTS state and review campaign map health.</div>';
    html += '<div style="margin-top:8px;"><a' + actionLinkAttrs(refreshFtsHref()) + '>Update Atlas</a></div>';
    html += '</div>';
    return html;
  }

  function currentUpdateStatus(pid){
    var key = String(pid || '');
    return ensureAtlasState().updateByPlayer[key] || null;
  }

  function setUpdateStatus(pid, report){
    ensureAtlasState().updateByPlayer[String(pid || '')] = report;
  }

  function updateStatusRow(step){
    var icon = step.ok ? '&#10003;' : (step.skipped ? '&#9675;' : '&#10007;');
    var color = step.ok ? '#2c7034' : (step.skipped ? '#7a6a33' : '#7a1b1b');
    return '<div style="margin-top:6px;">'
      + '<span style="display:inline-block;min-width:18px;color:' + color + ';font-weight:bold;">' + icon + '</span>'
      + '<b>' + esc(step.label || 'Step') + ':</b> '
      + esc(step.detail || '')
      + '</div>';
  }

  function renderUpdateStatus(pid){
    var report = currentUpdateStatus(pid);
    if(!report) return '';
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Latest Atlas Update</b></div>';
    html += '<div style="margin-top:4px;">Ran: ' + esc(report.when || '') + '</div>';
    html += '<div style="margin-top:4px;">Result: <b>' + esc(report.ok ? 'Pass' : 'Attention Needed') + '</b></div>';
    for(var i=0;i<report.steps.length;i++){
      html += updateStatusRow(report.steps[i]);
    }
    html += '</div>';
    return html;
  }

  function regionLabelFromMeta(meta){
    if(!meta) return '(unknown)';
    return String(meta.region_name || meta.raw_region || '(unknown)');
  }

  function localeLabelFromMeta(meta){
    if(!meta) return '(unknown)';
    if(meta.page_scope === 'region') return 'Region Scope';
    if(meta.page_scope === 'global') return 'Global Scope';
    return String(meta.locale_name || meta.raw_locale || '(unknown)');
  }

  function labelList(labels, emptyText){
    labels = Array.isArray(labels) ? labels : [];
    if(!labels.length) return '<i>' + esc(emptyText) + '</i>';
    return labels.map(function(label){
      return '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 6px;border:1px solid #999;border-radius:999px;font-size:11px;">'
        + esc(label)
        + '</span>';
    }).join('');
  }

  function renderCurrentContext(pid, summary){
    var v = cssVars();
    var meta = summary.meta;
    var mapKey = summary.mapKey;
    var records = getMapRecordsState();
    var points = mapKey ? (records.points[mapKey] || {}) : {};
    var routes = mapKey ? (records.routes[mapKey] || {}) : {};
    var active = currentPlayerRoute(pid, mapKey);
    var html = '<div style="' + (v.card || '') + '">';
    html += '<div><b>Current GM Context</b></div>';
    html += '<div style="margin-top:4px;"><b>' + esc(summary.pageName) + '</b></div>';
    html += '<div style="margin-top:4px;"><b>Region:</b> ' + esc(regionLabelFromMeta(meta)) + '</div>';
    html += '<div style="margin-top:4px;"><b>Locale:</b> ' + esc(localeLabelFromMeta(meta)) + '</div>';
    html += '<div style="margin-top:4px;"><b>Map Key:</b> ' + esc(mapKey || '(unavailable)') + '</div>';
    html += '<div style="margin-top:6px;"><b>Map Points:</b> ' + String(summary.pointCount) + '</div>';
    html += '<div style="margin-top:4px;">' + labelList(Object.keys(points).sort().map(function(pointKey){
      var point = points[pointKey] || {};
      return String(point.name || pointKey || '');
    }), 'No map points stored for this map.') + '</div>';
    html += '<div style="margin-top:8px;"><b>Map Routes:</b> ' + String(summary.routeCount) + '</div>';
    html += '<div style="margin-top:4px;">' + labelList(Object.keys(routes).sort().map(function(routeKey){
      var route = routes[routeKey] || {};
      var name = String(route.name || routeKey || '');
      if(active && String(active.routeKey || '') === String(routeKey || '')) name += ' (active)';
      return name;
    }), 'No routes stored for this map.') + '</div>';
    html += '</div>';
    return html;
  }

  function renderRegionSummary(summaries){
    var v = cssVars();
    var buckets = {};
    summaries.forEach(function(summary){
      var key = lower(regionLabelFromMeta(summary.meta));
      if(!buckets[key]){
        buckets[key] = {
          label: regionLabelFromMeta(summary.meta),
          maps:0,
          points:0,
          routes:0
        };
      }
      buckets[key].maps += 1;
      buckets[key].points += summary.pointCount;
      buckets[key].routes += summary.routeCount;
    });
    var keys = Object.keys(buckets).sort(function(a, b){
      return String(buckets[a].label || '').localeCompare(String(buckets[b].label || ''));
    });
    var html = '<div style="' + (v.card || '') + '">';
    html += '<div><b>Known Regions</b></div>';
    if(!keys.length){
      html += '<div style="margin-top:4px;"><i>No captured regional data exists yet.</i></div>';
      html += '</div>';
      return html;
    }
    html += '<table style="width:100%;border-collapse:collapse;margin-top:8px;">';
    html += '<tr><th style="text-align:left;padding:4px 6px;">Region</th><th style="text-align:left;padding:4px 6px;">Maps</th><th style="text-align:left;padding:4px 6px;">Points</th><th style="text-align:left;padding:4px 6px;">Routes</th></tr>';
    keys.forEach(function(key){
      var bucket = buckets[key];
      html += '<tr>';
      html += '<td style="padding:4px 6px;">' + esc(bucket.label) + '</td>';
      html += '<td style="padding:4px 6px;">' + String(bucket.maps) + '</td>';
      html += '<td style="padding:4px 6px;">' + String(bucket.points) + '</td>';
      html += '<td style="padding:4px 6px;">' + String(bucket.routes) + '</td>';
      html += '</tr>';
    });
    html += '</table>';
    html += '</div>';
    return html;
  }

  function renderWorldIndex(focusPageId){
    var v = cssVars();
    var metaState = getMapMetaState();
    var summaries = allPages().map(function(page){
      return collectPageSummary(page, metaState.byPage[String(page.id || '')] || null);
    });
    var orphanMapKeys = [];
    var metaByMapKey = {};
    summaries.forEach(function(summary){
      if(summary.mapKey) metaByMapKey[summary.mapKey] = true;
    });
    Object.keys(getMapRecordsState().routes).forEach(function(mapKey){
      if(!metaByMapKey[mapKey]) orphanMapKeys.push(mapKey);
    });
    Object.keys(getMapRecordsState().points).forEach(function(mapKey){
      if(!metaByMapKey[mapKey] && orphanMapKeys.indexOf(mapKey) === -1) orphanMapKeys.push(mapKey);
    });
    orphanMapKeys.sort();

    var html = '<div style="' + (v.card || '') + '">';
    html += '<div><b>Known Maps, Points, and Routes</b></div>';
    if(!summaries.length){
      html += '<div style="margin-top:4px;"><i>No pages exist in this campaign.</i></div>';
    }else{
      html += '<table style="width:100%;border-collapse:collapse;margin-top:8px;table-layout:fixed;">';
      html += '<tr><th style="text-align:left;padding:4px 6px;width:16%;">Region</th><th style="text-align:left;padding:4px 6px;width:16%;">Locale</th><th style="text-align:left;padding:4px 6px;width:14%;overflow-wrap:anywhere;word-break:break-word;">Map</th><th style="text-align:left;padding:4px 6px;width:27%;">Points</th><th style="text-align:left;padding:4px 6px;width:27%;">Routes</th></tr>';
      summaries.forEach(function(summary){
        var focusText = (String(summary.pageId || '') === String(focusPageId || '')) ? ' (focus)' : '';
        var mapKey = summary.mapKey || '';
        var points = mapKey ? (getMapRecordsState().points[mapKey] || {}) : {};
        var routes = mapKey ? (getMapRecordsState().routes[mapKey] || {}) : {};
        var pointLabels = Object.keys(points).sort().map(function(pointKey){
          var point = points[pointKey] || {};
          return String(point.name || pointKey || '');
        });
        var routeLabels = Object.keys(routes).sort().map(function(routeKey){
          var route = routes[routeKey] || {};
          return String(route.name || routeKey || '');
        });
        html += '<tr>';
        html += '<td style="padding:4px 6px;vertical-align:top;">' + esc(regionLabelFromMeta(summary.meta)) + '</td>';
        html += '<td style="padding:4px 6px;vertical-align:top;">' + esc(localeLabelFromMeta(summary.meta)) + '</td>';
        html += '<td style="padding:4px 6px;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;">' + esc(summary.pageName + focusText) + '<div style="margin-top:4px;font-size:11px;opacity:0.85;">' + esc(mapKey || 'no-map-key') + '</div></td>';
        html += '<td style="padding:4px 6px;vertical-align:top;">' + labelList(pointLabels, 'None') + '</td>';
        html += '<td style="padding:4px 6px;vertical-align:top;">' + labelList(routeLabels, 'None') + '</td>';
        html += '</tr>';
      });
      html += '</table>';
    }
    if(orphanMapKeys.length){
      html += '<div style="margin-top:10px;"><b>Orphan MapMeta Route and Point Keys</b></div>';
      html += '<div style="margin-top:4px;">These route or point buckets do not currently map to a captured page.</div>';
      html += '<ul style="margin-top:4px;">';
      orphanMapKeys.forEach(function(mapKey){
        html += '<li>' + esc(mapKey) + ' (points: ' + String(pointCountForMap(mapKey)) + ', routes: ' + String(routeCountForMap(mapKey)) + ')</li>';
      });
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  function buildAtlasHTML(pid, focusPageId){
    var effectivePageId = String(focusPageId || getEffectivePageId(pid) || '');
    var focus = focusPageSummary(effectivePageId);
    var summaries = allPages().map(function(page){
      return collectPageSummary(page, getMapMetaState().byPage[String(page.id || '')] || null);
    });
    var html = '<div style="' + (cssVars().container || '') + '">';
    html += '<div style="margin-bottom:8px;">Campaign Atlas is the GM-only ledger of known regional, map, map-point, and map-route information. It highlights your current page while keeping the full campaign listing visible.</div>';
    html += renderControlPanel();
    html += renderUpdateStatus(pid);
    if(typeof atlasVerifySection !== 'undefined' && atlasVerifySection){
      if(typeof atlasVerifySection.renderControlsHTML === 'function'){
        html += atlasVerifySection.renderControlsHTML();
      }
      if(typeof atlasVerifySection.renderLatestReportHTML === 'function'){
        html += atlasVerifySection.renderLatestReportHTML();
      }
    }
    html += renderCurrentContext(pid, focus);
    html += renderRegionSummary(summaries);
    html += renderWorldIndex(effectivePageId);
    html += endShell();
    return html;
  }

  function refreshAtlas(pid, focusPageId){
    var handout = ensureAtlasHandout();
    try{
      handout.set('notes', buildAtlasHTML(pid, focusPageId));
    }catch(e){
      log('fts_atlas refreshAtlas err: ' + e);
    }
    return handout;
  }

  function openAtlas(pid, focusPageId){
    refreshAtlas(pid, focusPageId);
    return { changed:false };
  }

  function refreshFTS(pid, focusPageId){
    var pageId = String(focusPageId || getEffectivePageId(pid) || '');
    var page = pageId ? getObj('page', pageId) : null;
    var report = {
      ok:true,
      when:(new Date()).toISOString(),
      steps:[]
    };

    function pushStep(label, ok, detail, skipped){
      report.steps.push({ label:label, ok:!!ok, detail:detail, skipped:!!skipped });
      if(!ok && !skipped) report.ok = false;
    }

    try{
      if(RT.fts && typeof RT.fts.runStartupHooks === 'function'){
        RT.fts.runStartupHooks('atlas-refresh');
        pushStep('Startup Hooks', true, 'FTS startup hooks completed.');
      }else{
        pushStep('Startup Hooks', false, 'FTS startup hooks are unavailable.');
      }
    }catch(e1){
      log('fts_atlas refreshFTS startup err: ' + e1);
      pushStep('Startup Hooks', false, String(e1));
    }
    try{
      if(pageId && RT.fts_mapMeta && typeof RT.fts_mapMeta.syncPageMeta === 'function'){
        RT.fts_mapMeta.syncPageMeta(pid || 'API', { pageId:pageId });
        pushStep('Map Metadata', true, 'Synchronized active page metadata for ' + String((page && page.get('name')) || pageId) + '.');
      }else if(pageId){
        pushStep('Map Metadata', false, 'Map metadata sync is unavailable for the active page.');
      }else{
        pushStep('Map Metadata', true, 'Skipped because no active page could be resolved.', true);
      }
    }catch(e2){
      log('fts_atlas refreshFTS mapMeta err: ' + e2);
      pushStep('Map Metadata', false, String(e2));
    }
    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.loadMapRecordsFromMule === 'function'){
        RT.fts_mapMeta.loadMapRecordsFromMule();
        pushStep('Map Points and Routes Load', true, 'Loaded map points and routes from fts_mule.');
      }else{
        pushStep('Map Points and Routes Load', false, 'MapMeta route and point mule load is unavailable.');
      }
    }catch(e3){
      log('fts_atlas refreshFTS mapMeta map records load err: ' + e3);
      pushStep('Map Points and Routes Load', false, String(e3));
    }
    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.refreshActiveMapRecords === 'function'){
        RT.fts_mapMeta.refreshActiveMapRecords({ pageId: pageId });
        pushStep('Active Map Refresh', true, 'Refreshed active-page map points and routes.');
      }else{
        pushStep('Active Map Refresh', false, 'MapMeta active-page route and point refresh is unavailable.');
      }
    }catch(e4){
      log('fts_atlas refreshFTS mapMeta map records refresh err: ' + e4);
      pushStep('Active Map Refresh', false, String(e4));
    }
    setUpdateStatus(pid, report);
    refreshAtlas(pid, focusPageId || '');
    return { changed:false };
  }

  function renderConfigHTML(pid){
    if(!isGM(pid)) return '';
    var handout = refreshAtlas(pid, '');
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<a' + directLinkAttrs(handoutUrl(handout)) + '>Show Atlas</a>';
    html += '</div>';
    return html;
  }

  function helpLines(){
    return [
      'Commands',
      '!fts --atlas',
      '!fts --atlas open',
      '!fts --atlas current',
      '!fts --atlas page <pageId>',
      '!fts --atlas refresh',
      '!fts --atlas verify campaign',
      '!fts --atlas verify page',
      '!fts --atlas verify repairCampaign',
      '!fts --atlas verify repairPage',
      '',
      'GM-only behavior',
      'Campaign Atlas is the GM-only atlas handout for reviewing all known regional, map, point, and route information in one place.',
      'The Campaign Menu Show Atlas button opens the Campaign Atlas handout directly.',
      'Campaign Atlas owns verification and repair controls inside the Atlas handout.',
      'Use the Campaign Menu Wizard Menu button to update FTS state and whisper wizard launch controls.',
      'The current GM page remains highlighted while the full campaign listing stays visible below it.'
    ];
  }

  function handleAtlasCommand(args){
    var pid = args.pid;
    if(!isGM(pid)) return { error:'Only the GM may use Atlas.' };
    var raw = String(args.val || '').trim();
    if(!raw){
      return openAtlas(pid, '');
    }
    var tokens = raw.split(/\s+/g).filter(function(tok){ return !!tok; });
    var action = lower(tokens[0] || raw);
    if(action === 'open'){
      return openAtlas(pid, '');
    }
    if(action === 'current'){
      return openAtlas(pid, '');
    }
    if(action === 'refresh'){
      return refreshFTS(pid, '');
    }
    if(action === 'verify'){
      if(typeof atlasVerifySection === 'undefined' || !atlasVerifySection || typeof atlasVerifySection.handleCommand !== 'function'){
        return { error:'Atlas verify tools are unavailable.' };
      }
      var verifyRaw = tokens.slice(1).join(' ').trim();
      var verifyResult = atlasVerifySection.handleCommand({ pid:pid, val:verifyRaw });
      refreshAtlas(pid, '');
      return verifyResult || { changed:false };
    }
    if(action === 'page'){
      var pageId = tokens.slice(1).join(' ').trim();
      if(!pageId) return { error:'Use !fts --atlas page <pageId>.' };
      return openAtlas(pid, pageId);
    }
    return { error:'Unknown Atlas command. Use !fts --atlas open, !fts --atlas current, !fts --atlas page <pageId>, !fts --atlas refresh, or !fts --atlas verify <scope>.' };
  }

  function registerWithCore(){
    try{
      if(!(RT.fts && !_registered && typeof RT.fts.registerCommands === 'function')) return;
      RT.fts.registerCommands({
        atlas: {
          access:'gm',
          handler:handleAtlasCommand
        }
      });
      if(typeof RT.fts.addLogCard === 'function'){
        RT.fts.addLogCard(26, function(pid){
          try{
            return renderConfigHTML(pid);
          }catch(e){
            log('fts_atlas logCard err: ' + e);
            return '';
          }
        });
      }
      if(typeof RT.fts.addHelpSection === 'function'){
        RT.fts.addHelpSection(26, 'Atlas', helpLines);
        if(typeof RT.fts.refreshHelpHandout === 'function'){
          RT.fts.refreshHelpHandout(null);
        }
      }
      _registered = true;
    }catch(e){
      log('fts_atlas registerWithCore err: ' + e);
    }
  }

  function startup(){
    refreshAtlas('', '');
    registerWithCore();
  }

  function registerStartup(){
    if(_startupRegistered) return;
    try{
      if(RT.fts && typeof RT.fts.registerStartup === 'function'){
        RT.fts.registerStartup(MODULE_KEY, function(){
          refreshAtlas('', '');
        });
        _startupRegistered = true;
      }
    }catch(e){
      log('fts_atlas registerStartup err: ' + e);
    }
  }

  on('ready', function(){
    startup();
    registerStartup();
    log('fts_atlas v' + VERSION + ' ready.');
  });

  return {
    refresh: refreshAtlas,
    open: openAtlas,
    refreshFTS: refreshFTS,
    getHandoutUrl: function(){
      return handoutUrl(ensureAtlasHandout());
    }
  };
}());

try{
  var _ftsAtlasRoot = (typeof globalThis !== 'undefined') ? globalThis
                    : (typeof window !== 'undefined')     ? window
                    : (typeof self !== 'undefined')       ? self
                    : (typeof global !== 'undefined')     ? global
                    : this;
  _ftsAtlasRoot.RT = _ftsAtlasRoot.RT || {};
  _ftsAtlasRoot.RT.fts_atlas = fts_atlas;
  _ftsAtlasRoot.fts_atlas = fts_atlas;
}catch(e){}

/* ========== Verify Section (atlas report and repair tools) ========== */
var atlasVerifySection = (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  function ensureState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.atlas) state.fts.atlas = { updateByPlayer:{} };
    if(!state.fts.atlas.updateByPlayer) state.fts.atlas.updateByPlayer = {};
    if(!state.fts.atlas.verify){
      state.fts.atlas.verify = { lastReport:null };
    }
    return state.fts.atlas.verify;
  }

  function esc(s){
    return String(s || '').replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c] || c;
    });
  }

  function lower(s){
    return String(s || '').toLowerCase();
  }

  function cssVars(){
    return (RT.fts && typeof RT.fts.cssVars === 'function')
      ? RT.fts.cssVars()
      : {
          container:'',
          title:'',
          card:'',
          link:'text-decoration:none;color:#2266aa;',
          btn:'display:block;text-align:center;',
          hrefAttr:function(s){ return String(s || '').replace(/"/g, '&quot;'); },
          literal:function(s){ return '<code>' + esc(s) + '</code>'; }
        };
  }

  function currentPaletteName(){
    try{
      if(RT.fts && typeof RT.fts.ensureCoreState === 'function'){
        var S = RT.fts.ensureCoreState();
        return String((((S || {}).ui || {}).palette) || 'none').toLowerCase();
      }
    }catch(e){}
    return 'none';
  }

  function gmAreaStyle(){
    var palette = currentPaletteName();
    var map = {
      none:{ bg:'rgba(80, 92, 108, 0.08)', border:'rgba(80, 92, 108, 0.20)' },
      dark:{ bg:'rgba(155, 109, 255, 0.10)', border:'rgba(155, 109, 255, 0.26)' },
      mint:{ bg:'rgba(82, 125, 82, 0.10)', border:'rgba(82, 125, 82, 0.26)' },
      parchment:{ bg:'rgba(154, 110, 55, 0.10)', border:'rgba(154, 110, 55, 0.26)' },
      powder:{ bg:'rgba(122, 167, 217, 0.12)', border:'rgba(122, 167, 217, 0.28)' },
      rosebud:{ bg:'rgba(186, 46, 104, 0.10)', border:'rgba(186, 46, 104, 0.26)' }
    };
    var tone = map[palette] || map.none;
    return (cssVars().card || '') + 'border:1px solid ' + tone.border + ';background:' + tone.bg + ';';
  }

  function isGM(pid){
    try{
      return !!playerIsGM(pid);
    }catch(e){
      return false;
    }
  }

  function actionLinkAttrs(target){
    if(RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      return RT.fts.actionLinkAttrs(target);
    }
    var v = cssVars();
    return ' href="' + (v.hrefAttr ? v.hrefAttr(target) : esc(target)) + '" style="' + (v.btn || v.link || '') + '"';
  }

  function escapeRollQueryValue(s){
    return String(s || '')
      .replace(/\|/g, '&#124;')
      .replace(/,/g, '&#44;')
      .replace(/\}/g, '&#125;')
      .replace(/\{/g, '&#123;');
  }

  function buildRollQuery(title, options){
    options = Array.isArray(options) ? options : [];
    var parts = [];
    for(var i=0;i<options.length;i++){
      parts.push(escapeRollQueryValue(options[i].label) + ',' + escapeRollQueryValue(options[i].value));
    }
    return '?{' + escapeRollQueryValue(title) + '|' + parts.join('|') + '}';
  }

  function getEffectivePageId(pid){
    if(RT.fts && typeof RT.fts.getEffectivePageId === 'function'){
      return String(RT.fts.getEffectivePageId(pid) || '');
    }
    try{
      var campaign = Campaign();
      var specific = campaign.get('playerspecificpages') || {};
      if(pid && specific[pid]) return String(specific[pid] || '');
      return String(campaign.get('playerpageid') || '');
    }catch(e){
      return '';
    }
  }

  function normalizeMapKeyComponent(s){
    return lower(String(s || '')).replace(/[^a-z0-9]+/g, '');
  }

  function mapKeyFromMeta(meta){
    if(!meta || typeof meta !== 'object') return '';
    if(meta.name) return normalizeMapKeyComponent(meta.name);
    if(meta.raw_name) return normalizeMapKeyComponent(meta.raw_name);
    if(meta.page_name) return normalizeMapKeyComponent(meta.page_name);
    if(meta.id) return 'map' + String(meta.id);
    return '';
  }

  function cloneJSON(value){
    return JSON.parse(JSON.stringify(value));
  }

  function allPages(){
    var pages = findObjs({ _type:'page' }) || [];
    pages.sort(function(a, b){
      return String(a.get('name') || '').localeCompare(String(b.get('name') || ''));
    });
    return pages;
  }

  function getPageById(pageId){
    return pageId ? getObj('page', String(pageId || '')) : null;
  }

  function getMapMetaState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.mapmeta){
      state.fts.mapmeta = { last:null, byPage:{}, flash:{}, namingWarn:{} };
    }
    if(!state.fts.mapmeta.byPage) state.fts.mapmeta.byPage = {};
    return state.fts.mapmeta;
  }

  function getMapRecordsState(){
    if(!state.fts) state.fts = {};
    if(!state.fts.mapRecords){
      state.fts.mapRecords = { routes:{}, points:{}, currentRoute:{}, lastSelection:{} };
    }
    if(!state.fts.mapRecords.routes) state.fts.mapRecords.routes = {};
    if(!state.fts.mapRecords.points) state.fts.mapRecords.points = {};
    if(!state.fts.mapRecords.currentRoute) state.fts.mapRecords.currentRoute = {};
    if(!state.fts.mapRecords.lastSelection) state.fts.mapRecords.lastSelection = {};
    return state.fts.mapRecords;
  }

  function newReport(scope, repair, pageId){
    return {
      scope: scope,
      repair: !!repair,
      pageId: String(pageId || ''),
      generatedAt: (new Date()).toISOString(),
      findings: [],
      repairs: [],
      errors: 0,
      warnings: 0
    };
  }

  function addFinding(report, severity, subject, detail){
    report.findings.push({
      severity: severity,
      subject: subject,
      detail: detail
    });
    if(severity === 'error') report.errors += 1;
    if(severity === 'warn') report.warnings += 1;
  }

  function addRepair(report, detail){
    report.repairs.push(detail);
  }

  function scopePageIds(pid, scope, pageId){
    if(scope === 'page'){
      var effective = String(pageId || getEffectivePageId(pid) || '');
      return effective ? [effective] : [];
    }
    return allPages().map(function(page){
      return String(page.id || '');
    });
  }

  function syncMetaIfRequested(pid, report, pageIds){
    if(!report.repair) return;
    if(!(RT.fts_mapMeta && typeof RT.fts_mapMeta.syncPageMeta === 'function')) return;
    pageIds.forEach(function(pageId){
      var page = getPageById(pageId);
      if(!page) return;
      var metaState = getMapMetaState();
      var meta = metaState.byPage[pageId] || null;
      var stale = !meta || String(meta.raw_name || '') !== String(page.get('name') || '');
      if(!stale) return;
      var result = RT.fts_mapMeta.syncPageMeta(pid || 'API', { pageId:pageId });
      if(result && result.meta){
        addRepair(report, 'Synced map metadata for "' + (result.meta.raw_name || page.get('name') || pageId) + '".');
      }else{
        addFinding(report, 'error', 'mapMeta', 'Could not sync map metadata for page ' + pageId + '.');
      }
    });
  }

  function verifyPages(pid, report, pageIds){
    var metaState = getMapMetaState();
    var pageIdSet = {};
    pageIds.forEach(function(pageId){ pageIdSet[String(pageId || '')] = true; });

    pageIds.forEach(function(pageId){
      var page = getPageById(pageId);
      if(!page){
        addFinding(report, 'error', 'page', 'Page ' + pageId + ' does not exist.');
        return;
      }
      var meta = metaState.byPage[pageId] || null;
      if(!meta){
        addFinding(report, 'error', 'mapMeta', 'No captured map metadata exists for "' + (page.get('name') || pageId) + '".');
        return;
      }
      if(String(meta.raw_name || '') !== String(page.get('name') || '')){
        addFinding(report, 'warn', 'mapMeta', 'Captured metadata for "' + (page.get('name') || pageId) + '" is stale.');
      }
      if(!meta.name_pattern_ok){
        addFinding(report, 'error', 'mapMeta', 'Page "' + (page.get('name') || pageId) + '" does not use a valid FTS page name.');
      }
      if(meta.page_scope === 'locale'){
        if(!meta.region_valid){
          addFinding(report, 'error', 'mapMeta', 'Locale page "' + (page.get('name') || pageId) + '" does not resolve a valid region.');
        }
        if(!meta.locale_valid){
          addFinding(report, 'error', 'mapMeta', 'Locale page "' + (page.get('name') || pageId) + '" does not resolve a valid locale.');
        }
      }else if(meta.page_scope === 'region' && !meta.region_valid){
        addFinding(report, 'error', 'mapMeta', 'Region page "' + (page.get('name') || pageId) + '" does not resolve a valid region.');
      }
      if(meta.depth_required && !meta.depth_valid){
        addFinding(report, 'error', 'mapMeta', 'Page "' + (page.get('name') || pageId) + '" requires a valid depth or elevation token.');
      }
    });

    Object.keys(metaState.byPage).forEach(function(pageId){
      if(report.scope === 'page' && !pageIdSet[pageId]) return;
      var page = getPageById(pageId);
      if(page) return;
      addFinding(report, 'warn', 'mapMeta', 'Captured metadata exists for missing page ' + pageId + '.');
      if(report.repair){
        delete metaState.byPage[pageId];
        addRepair(report, 'Removed orphaned map metadata entry for missing page ' + pageId + '.');
      }
    });
  }

  function buildExpectedMapKeyByPage(pageIds){
    var metaState = getMapMetaState();
    var out = {};
    pageIds.forEach(function(pageId){
      var meta = metaState.byPage[String(pageId || '')] || null;
      if(meta) out[String(pageId || '')] = mapKeyFromMeta(meta);
    });
    return out;
  }

  function verifyMapRecords(report, pageIds){
    var mapRecordsState = getMapRecordsState();
    var pageFilter = {};
    pageIds.forEach(function(pageId){ pageFilter[String(pageId || '')] = true; });
    var expectedMapKeys = buildExpectedMapKeyByPage(allPages().map(function(page){ return String(page.id || ''); }));

    var nextRoutes = {};
    var nextPoints = {};

    function keepRoute(mapKey, routeKey, route){
      if(!nextRoutes[mapKey]) nextRoutes[mapKey] = {};
      nextRoutes[mapKey][routeKey] = route;
    }

    function keepPoint(mapKey, pointKey, point){
      if(!nextPoints[mapKey]) nextPoints[mapKey] = {};
      nextPoints[mapKey][pointKey] = point;
    }

    Object.keys(mapRecordsState.routes).forEach(function(bucketKey){
      var bucket = mapRecordsState.routes[bucketKey] || {};
      Object.keys(bucket).forEach(function(routeKey){
        var route = bucket[routeKey];
        if(!route || typeof route !== 'object') return;
        if(report.scope === 'page' && route.pageid && !pageFilter[String(route.pageid || '')]) {
          keepRoute(bucketKey, routeKey, cloneJSON(route));
          return;
        }
        if(!route.pageid){
          addFinding(report, 'error', 'route', 'Route "' + (route.name || routeKey) + '" is missing a page id.');
          if(!report.repair) keepRoute(bucketKey, routeKey, cloneJSON(route));
          return;
        }
        if(!getPageById(route.pageid)){
          addFinding(report, 'error', 'route', 'Route "' + (route.name || routeKey) + '" points to missing page ' + route.pageid + '.');
          if(report.repair){
            addRepair(report, 'Removed orphaned route "' + (route.name || routeKey) + '".');
          }else{
            keepRoute(bucketKey, routeKey, cloneJSON(route));
          }
          return;
        }
        if(!Array.isArray(route.points) || !route.points.length){
          addFinding(report, 'warn', 'route', 'Route "' + (route.name || routeKey) + '" has no stored points.');
        }
        var expectedMapKey = expectedMapKeys[String(route.pageid || '')] || bucketKey;
        var nextRoute = cloneJSON(route);
        if(String(nextRoute.mapKey || '') !== String(expectedMapKey || '')){
          addFinding(report, 'warn', 'route', 'Route "' + (route.name || routeKey) + '" has stale map key "' + String(nextRoute.mapKey || '') + '".');
          nextRoute.mapKey = expectedMapKey;
          if(report.repair){
            addRepair(report, 'Updated route "' + (route.name || routeKey) + '" to map key "' + expectedMapKey + '".');
          }
        }
        if(String(bucketKey || '') !== String(expectedMapKey || '')){
          addFinding(report, 'warn', 'route', 'Route "' + (route.name || routeKey) + '" is stored under stale route bucket "' + bucketKey + '".');
          if(report.repair){
            addRepair(report, 'Moved route "' + (route.name || routeKey) + '" from bucket "' + bucketKey + '" to "' + expectedMapKey + '".');
          }
        }
        keepRoute(report.repair ? expectedMapKey : bucketKey, routeKey, nextRoute);
      });
    });

    Object.keys(mapRecordsState.points).forEach(function(bucketKey){
      var bucket = mapRecordsState.points[bucketKey] || {};
      Object.keys(bucket).forEach(function(pointKey){
        var point = bucket[pointKey];
        if(!point || typeof point !== 'object') return;
        if(report.scope === 'page' && point.pageid && !pageFilter[String(point.pageid || '')]) {
          keepPoint(bucketKey, pointKey, cloneJSON(point));
          return;
        }
        if(!point.pageid){
          addFinding(report, 'error', 'point', 'Map point "' + (point.name || pointKey) + '" is missing a page id.');
          if(!report.repair) keepPoint(bucketKey, pointKey, cloneJSON(point));
          return;
        }
        if(!getPageById(point.pageid)){
          addFinding(report, 'error', 'point', 'Map point "' + (point.name || pointKey) + '" points to missing page ' + point.pageid + '.');
          if(report.repair){
            addRepair(report, 'Removed orphaned map point "' + (point.name || pointKey) + '".');
          }else{
            keepPoint(bucketKey, pointKey, cloneJSON(point));
          }
          return;
        }
        if(!String(point.name || '').trim()){
          addFinding(report, 'warn', 'point', 'Map point "' + pointKey + '" is missing a display name.');
        }
        var expectedMapKey = expectedMapKeys[String(point.pageid || '')] || bucketKey;
        var nextPoint = cloneJSON(point);
        if(String(nextPoint.mapKey || '') !== String(expectedMapKey || '')){
          addFinding(report, 'warn', 'point', 'Map point "' + (point.name || pointKey) + '" has stale map key "' + String(nextPoint.mapKey || '') + '".');
          nextPoint.mapKey = expectedMapKey;
          if(report.repair){
            addRepair(report, 'Updated map point "' + (point.name || pointKey) + '" to map key "' + expectedMapKey + '".');
          }
        }
        if(nextPoint.data && nextPoint.data.page && String(nextPoint.data.page.id || '') !== String(nextPoint.pageid || '')){
          addFinding(report, 'warn', 'point', 'Map point "' + (point.name || pointKey) + '" has stale embedded page metadata.');
          nextPoint.data.page.id = nextPoint.pageid;
          if(report.repair){
            addRepair(report, 'Updated embedded page metadata for map point "' + (point.name || pointKey) + '".');
          }
        }
        if(String(bucketKey || '') !== String(expectedMapKey || '')){
          addFinding(report, 'warn', 'point', 'Map point "' + (point.name || pointKey) + '" is stored under stale point bucket "' + bucketKey + '".');
          if(report.repair){
            addRepair(report, 'Moved map point "' + (point.name || pointKey) + '" from bucket "' + bucketKey + '" to "' + expectedMapKey + '".');
          }
        }
        keepPoint(report.repair ? expectedMapKey : bucketKey, pointKey, nextPoint);
      });
    });

    if(report.repair){
      mapRecordsState.routes = nextRoutes;
      mapRecordsState.points = nextPoints;
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.syncMapRecordsToMule === 'function'){
        RT.fts_mapMeta.syncMapRecordsToMule();
      }
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.refreshActiveMapRecords === 'function'){
        RT.fts_mapMeta.refreshActiveMapRecords();
      }
    }
  }

  function maybeLoadMapRecordsFromMule(){
    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.loadMapRecordsFromMule === 'function'){
        RT.fts_mapMeta.loadMapRecordsFromMule();
      }
    }catch(e){}
  }

  function parseVerifyArgs(pid, raw){
    raw = String(raw || '').trim();
    var out = { scope:'campaign', repair:false, pageId:'' };
    if(!raw) return out;
    var normalized = lower(raw);
    if(normalized === 'campaign'){
      return out;
    }
    if(normalized === 'page'){
      out.scope = 'page';
      out.pageId = getEffectivePageId(pid);
      return out;
    }
    if(normalized === 'repaircampaign'){
      out.repair = true;
      return out;
    }
    if(normalized === 'repairpage'){
      out.repair = true;
      out.scope = 'page';
      out.pageId = getEffectivePageId(pid);
      return out;
    }
    return { error:'Unknown Atlas verify command. Use !fts --atlas verify campaign, !fts --atlas verify page, !fts --atlas verify repairCampaign, or !fts --atlas verify repairPage.' };
  }

  function runVerify(pid, opts){
    maybeLoadMapRecordsFromMule();
    var pageIds = scopePageIds(pid, opts.scope, opts.pageId);
    var report = newReport(opts.scope, opts.repair, opts.pageId);
    if(opts.scope === 'page' && !pageIds.length){
      addFinding(report, 'error', 'page', 'No effective page could be resolved for page-scoped verification.');
      return report;
    }
    syncMetaIfRequested(pid, report, pageIds);
    verifyPages(pid, report, pageIds);
    verifyMapRecords(report, pageIds);
    return report;
  }

  function renderFindingRow(finding){
    var prefix = finding.severity === 'error' ? 'Error' : 'Warning';
    return '<div style="margin-top:6px;"><b>' + esc(prefix + ' - ' + finding.subject) + ':</b> ' + esc(finding.detail) + '</div>';
  }

  function renderRepairRow(detail){
    return '<div style="margin-top:6px;">' + esc(detail) + '</div>';
  }

  function verifyActionQueryHref(){
    return '!fts --atlas verify ' + buildRollQuery('Verify Action', [
      { label:'Report Current Page', value:'page' },
      { label:'Report Campaign', value:'campaign' },
      { label:'Repair Current Page', value:'repairPage' },
      { label:'Repair Campaign', value:'repairCampaign' }
    ]);
  }

  function renderControlsHTML(){
    var html = '<div style="' + gmAreaStyle() + '">';
    html += '<div><b>GM-Only Controls</b></div>';
    html += '<div style="margin-top:4px;">Use the prompt below to run report-only or repair verification across the active page or the full campaign.</div>';
    html += '<div style="margin-top:8px;"><a' + actionLinkAttrs(verifyActionQueryHref()) + '>Run Verify</a></div>';
    html += '</div>';
    return html;
  }

  function renderReportSection(report){
    var v = cssVars();
    if(!report){
      return '<div style="' + (v.card || '') + '"><div><b>Latest Report</b></div><div style="margin-top:4px;"><i>No verification report has been generated yet in this sandbox session.</i></div></div>';
    }
    var scopeLabel = report.scope === 'page'
      ? ('Page scope' + (report.pageId ? ' (' + report.pageId + ')' : ''))
      : 'Campaign scope';
    var html = '';
    html += '<div style="' + (v.card || '') + '">';
    html += '<div><b>Run Summary</b></div>';
    html += '<div style="margin-top:4px;">Scope: ' + esc(scopeLabel) + '</div>';
    html += '<div style="margin-top:4px;">Mode: ' + esc(report.repair ? 'Repair' : 'Report only') + '</div>';
    html += '<div style="margin-top:4px;">Generated: ' + esc(report.generatedAt) + '</div>';
    html += '<div style="margin-top:6px;">Errors: ' + String(report.errors) + ' | Warnings: ' + String(report.warnings) + ' | Repairs: ' + String(report.repairs.length) + '</div>';
    html += '</div>';

    html += '<div style="' + (v.card || '') + '">';
    html += '<div><b>Findings</b></div>';
    if(!report.findings.length){
      html += '<div style="margin-top:4px;"><i>No map, point, or route problems were detected in this scope.</i></div>';
    }else{
      report.findings.forEach(function(finding){
        html += renderFindingRow(finding);
      });
    }
    html += '</div>';

    html += '<div style="' + (v.card || '') + '">';
    html += '<div><b>Repairs</b></div>';
    if(!report.repairs.length){
      html += '<div style="margin-top:4px;"><i>No repairs were applied in this run.</i></div>';
    }else{
      report.repairs.forEach(function(detail){
        html += renderRepairRow(detail);
      });
    }
    html += '</div>';
    return html;
  }

  function handleVerifyCommand(args){
    var pid = args.pid;
    if(!isGM(pid)) return { error:'Only the GM may use Atlas verify.' };
    var raw = String(args.val || '').trim();
    if(!raw || lower(raw) === 'prompt' || lower(raw) === 'open'){
      return { changed:false };
    }
    var parsed = parseVerifyArgs(pid, raw);
    if(parsed.error) return { error:parsed.error };
    var report = runVerify(pid, parsed);
    ensureState().lastReport = report;
    return { changed:false, report:report };
  }

  function renderLatestReportHTML(){
    return renderReportSection(ensureState().lastReport || null);
  }

  return {
    handleCommand: handleVerifyCommand,
    renderControlsHTML: renderControlsHTML,
    renderLatestReportHTML: renderLatestReportHTML,
    run: runVerify
  };
}());
