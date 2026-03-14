// name:        dwt_mapmeta.js
// version:     5.0.1
// description: Map Information module (core-aware). Captures active page metadata,
//              writes JSON into dwt_mule.mapMeta, and exposes a card & help
//              within the unified dwt core UI.
// depends:     dwt_core_3.0.0+ (Meta-Toolbox shell), Roll20 Mod API
// provides:    !dwt --mapMeta | !dwt --mapMeta all
// author:      tcm (AI-assisted)

var dwt_mapMeta = dwt_mapMeta || (function () {
  'use strict';

  /* ========== Intro / Root ========== */

  var RT = (typeof globalThis!=='undefined') ? globalThis
         : (typeof window!=='undefined')     ? window
         : (typeof self!=='undefined')       ? self
         : (typeof global!=='undefined')     ? global
         : this;

  var VERSION    = 'mapmeta_5.0.1';
  var DWT_MULE   = 'dwt_mule';
  var STATE_ROOT = 'mapmeta';

  var _registered = false;

  // Allowed naming components
  var ALLOWED_REGIONS = {
    // spaced forms
    'frozenfar':          'Frozenfar',
    'sword coast north':  'Sword Coast North',
    'sword coast':        'Sword Coast',
	'moonshaes':          'Moonshaes',
    'lands of intrigue':  'Lands of Intrigue',
    // condensed one-word variants
    'swordcoastnorth':    'Sword Coast North',
    'swordcoast':         'Sword Coast',
    'landsofintrigue':    'Lands of Intrigue'
  };

  var ALLOWED_LOCALES = {
    'offshore': 'Offshore',
    'coastal':  'Coastal',
    'inland':   'Inland'
  };

  /* ========== Utils / State ========== */

  function ensureMapMetaState() {
    if (!state.dwt) state.dwt = {};
    if (!state.dwt[STATE_ROOT]) {
      state.dwt[STATE_ROOT] = {
        last: null,
        byPage: {},
        flash: {}
      };
    } else {
      if (!state.dwt[STATE_ROOT].byPage) {
        state.dwt[STATE_ROOT].byPage = {};
      }
      if (!state.dwt[STATE_ROOT].flash) {
        state.dwt[STATE_ROOT].flash = {};
      }
    }
    return state.dwt[STATE_ROOT];
  }

  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;')
                        .replace(/</g,'&lt;')
                        .replace(/>/g,'&gt;')
                        .replace(/"/g,'&quot;')
                        .replace(/'/g,'&#39;');
  }

  function cssVars() {
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

  function getFolderPathForPage(page) {
    // Currently unused in practice but kept for future expansion.
    return {
      folder_path_ids:   [],
      folder_path_names: [],
      folder_path_full:  ''
    };
  }

  function getActivePageForPlayer(pid) {
    try {
      if (typeof getPlayerPage === 'function') {
        var pageId = getPlayerPage(pid);
        if (pageId) {
          return getObj('page', pageId);
        }
      }
    } catch (e) {}
    return null;
  }

  function getDefaultBookmarkPage() {
    try {
      var campaign = findObjs({ _type: 'campaign' })[0];
      if (!campaign) return null;
      var pageId = campaign.get('playerpageid') || campaign.get('sandbox_active_page');
      if (!pageId) return null;
      return getObj('page', pageId);
    } catch (e) {
      return null;
    }
  }

  /* ========== Page Metadata Collection ========== */

  function collectPageMeta(page) {
    var rawName      = page.get('name') || '';
    var region       = '';
    var locale       = '';
    var mapName      = rawName;
    var patternOK    = false;
    var regionOK     = false;
    var localeOK     = false;

    // Expected basic format: Region.Locale.MapName
    var parts = rawName.split('.');
    if (parts.length >= 3) {
      var rawRegion = (parts[0] || '').trim();
      var rawLocale = (parts[1] || '').trim();
      var rawMap    = parts.slice(2).join('.').trim(); // allow extra dots in map name

      if (rawRegion && rawLocale && rawMap) {
        patternOK = true;

        var rKey        = rawRegion.toLowerCase().replace(/\s+/g, ' ').trim();
        var rKeyCond    = rawRegion.toLowerCase().replace(/\s+/g, '');
        var lKey        = rawLocale.toLowerCase().replace(/\s+/g, ' ').trim();
        var lKeyCond    = rawLocale.toLowerCase().replace(/\s+/g, '');

        // Region: try spaced key, then condensed one-word key
        if (ALLOWED_REGIONS[rKey]) {
          region = ALLOWED_REGIONS[rKey];
          regionOK = true;
        } else if (ALLOWED_REGIONS[rKeyCond]) {
          region = ALLOWED_REGIONS[rKeyCond];
          regionOK = true;
        } else {
          region = rawRegion;
        }

        // Locale: try spaced key, then condensed one-word key (mirrors Region behavior)
        if (ALLOWED_LOCALES[lKey]) {
          locale = ALLOWED_LOCALES[lKey];
          localeOK = true;
        } else if (ALLOWED_LOCALES[lKeyCond]) {
          locale = ALLOWED_LOCALES[lKeyCond];
          localeOK = true;
        } else {
          locale = rawLocale;
        }

        mapName = rawMap;
      }
    }

    var widthUnits   = Number(page.get('width') || 0);
    var heightUnits  = Number(page.get('height') || 0);
    var snapUnits    = Number(page.get('snapping_increment') || 1);
    var scaleNumber  = Number(page.get('scale_number') || 5);
    var scaleUnits   = String(page.get('scale_units') || 'ft');

    // In Roll20, page width/height are expressed in "units" (70px),
    // while snapping_increment is the fraction of a unit per grid cell.
    // Cells across = widthUnits / snapUnits; cell distance is scaleNumber.
    var cellsWide  = (snapUnits > 0 ? widthUnits  / snapUnits : 0);
    var cellsHigh  = (snapUnits > 0 ? heightUnits / snapUnits : 0);

    var distancePerCell = scaleNumber;
    var worldWidth      = cellsWide * distancePerCell;
    var worldHeight     = cellsHigh * distancePerCell;

    // Pixel metrics
    var PIXELS_PER_UNIT = 70;
    var pageWidthPx     = widthUnits  * PIXELS_PER_UNIT;
    var pageHeightPx    = heightUnits * PIXELS_PER_UNIT;
    var cellSizePx      = snapUnits   * PIXELS_PER_UNIT;

    var folderInfo = getFolderPathForPage(page);

    return {
      id: page.id,

      // Naming convention derived fields
      raw_name:        rawName,
      name:            mapName,
      region_name:     region,
      locale_name:     locale,
      name_pattern_ok: patternOK,
      region_valid:    regionOK,
      locale_valid:    localeOK,

      width_units: widthUnits,
      height_units: heightUnits,
      snapping_increment_units: snapUnits,
      scale_number:  scaleNumber,
      scale_units:   scaleUnits,
      distance_per_cell:       distancePerCell,
      world_width_distance:    worldWidth,
      world_height_distance:   worldHeight,

      // Pixel metrics
      pixels_per_unit: PIXELS_PER_UNIT,
      page_width_px:   pageWidthPx,
      page_height_px:  pageHeightPx,
      cell_size_px:    cellSizePx,

      showgrid: !!page.get('showgrid'),
      grid_type: page.get('grid_type') || 'square',
      grid_opacity: Number(page.get('grid_opacity') || 0),
      gridcolor: page.get('gridcolor') || '#C0C0C0',
      diagonaltype: page.get('diagonaltype') || 'foure',

      showdarkness: !!page.get('showdarkness'),
      fog_opacity: Number(page.get('fog_opacity') || 0.35),

      showlighting: !!page.get('showlighting'),
      dynamic_lighting_enabled: !!page.get('dynamic_lighting_enabled'),
      daylight_mode_enabled:    !!page.get('daylight_mode_enabled'),
      daylightModeOpacity: Number(page.get('daylightModeOpacity') || 1),
      lightupdatedrop:   !!page.get('lightupdatedrop'),
      lightenforcelos:   !!page.get('lightenforcelos'),
      lightrestrictmove: !!page.get('lightrestrictmove'),
      lightglobalillum:  !!page.get('lightglobalillum'),
      explorer_mode:     page.get('explorer_mode') || 'off',
      darknessEffect:    page.get('darknessEffect') || 'none',

      gridlabels: !!page.get('gridlabels'),
      archived:   !!page.get('archived'),

      // Folder metadata (currently always empty)
      folder_path_ids:   folderInfo.folder_path_ids,
      folder_path_names: folderInfo.folder_path_names,
      folder_path_full:  folderInfo.folder_path_full,

      sampled_at: (new Date()).toISOString()
    };
  }

  /* ========== Mule Helpers ========== */

  function getOrCreateMule() {
    try {
      if (RT.dwt && typeof RT.dwt.ensureMule === 'function') {
        return RT.dwt.ensureMule();
      }
    } catch (e) {}

    // Fallback (legacy behavior) if core is not present.
    var mule = findObjs({
      _type: 'character',
      name: DWT_MULE
    })[0];

    if (!mule) {
      mule = createObj('character', {
        name: DWT_MULE,
        archived: false,
        inplayerjournals: '',
        controlledby: ''
      });
    }
    return mule;
  }

  function upsertAbility(character, name, action) {
    if (!character) return;
    var ability = findObjs({
      _type: 'ability',
      _characterid: character.id,
      name: name
    })[0];

    if (ability) {
      ability.set({ action: action });
    } else {
      createObj('ability', {
        characterid: character.id,
        name:        name,
        action:      action,
        istokenaction: false
      });
    }
  }

  function getAbilityAction(character, name) {
    if (!character) return '';
    var ability = findObjs({
      _type: 'ability',
      _characterid: character.id,
      name: name
    })[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function parseVersionRoot(raw) {
    var root = {};
    var lines = String(raw || '').split('\n');
    var i, line, eq, key, val;
    for (i = 0; i < lines.length; i++) {
      line = String(lines[i] || '').trim();
      if (!line) continue;
      eq = line.indexOf('=');
      if (eq <= 0) continue;
      key = String(line.substring(0, eq) || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      val = String(line.substring(eq + 1) || '').trim();
      if (!key || !val) continue;
      root[key] = val;
    }
    return root;
  }

  function serializeVersionRoot(obj) {
    var out = [];
    Object.keys(obj || {}).sort().forEach(function(key){
      out.push(key + '=' + String(obj[key] || '').trim());
    });
    return out.join('\n');
  }

  function normalizeModuleVersion(moduleKey, moduleVersion) {
    var mk = String(moduleKey || '').trim();
    var raw = String(moduleVersion || '').trim();
    var rx = new RegExp('^' + mk + '_', 'i');
    raw = raw.replace(rx, '');
    return mk + '_' + raw;
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion) {
    if (!character) return;
    var key = String(moduleKey || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    root[key] = normalizeModuleVersion(moduleKey, moduleVersion);
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function upsertAttribute(character, name, value) {
    if (!character) return;
    var attr = findObjs({
      _type: 'attribute',
      _characterid: character.id,
      name: name
    })[0];

    if (attr) {
      attr.set({ current: String(value||'') });
    } else {
      createObj('attribute', {
        characterid: character.id,
        name:        name,
        current:     String(value||''),
        max:         ''
      });
    }
  }

  function storeMetaToMule(meta) {
    var mule = getOrCreateMule();
    if (!mule) return;

    var json = JSON.stringify(meta);
    upsertAbility(mule, 'mapMeta', json);

    // Maintain flat attributes for quick access
    // Only write Region/Locale when they are valid.
    upsertAttribute(mule, 'currentMap',    meta.name || '');
    upsertAttribute(mule, 'currentMapID',  meta.id   || '');
    upsertAttribute(mule, 'currentRegion', (meta.region_valid ? meta.region_name : ''));
    upsertAttribute(mule, 'currentLocale', (meta.locale_valid ? meta.locale_name : ''));
  }

  function syncMapMetaRootToMule() {
    var mule = getOrCreateMule();
    if (!mule) return;

    var S = ensureMapMetaState();
    var meta = S.last || null;
    var payload = meta ? JSON.stringify(meta) : JSON.stringify({
      id: '',
      raw_name: '',
      name: '',
      page_name: '',
      region_name: '',
      locale_name: '',
      region_valid: false,
      locale_valid: false,
      name_pattern_ok: false,
      sampled_at: '',
      scale_number: 0,
      scale_units: '',
      grid_type: '',
      page_width_px: 0,
      page_height_px: 0,
      cell_size_px: 70,
      world_width_distance: 0,
      world_height_distance: 0
    });

    upsertAbility(mule, 'mapMeta', payload);

    if (meta) {
      upsertAttribute(mule, 'currentMap',    meta.name || '');
      upsertAttribute(mule, 'currentMapID',  meta.id   || '');
      upsertAttribute(mule, 'currentRegion', (meta.region_valid ? meta.region_name : ''));
      upsertAttribute(mule, 'currentLocale', (meta.locale_valid ? meta.locale_name : ''));
    } else {
      upsertAttribute(mule, 'currentMap',    '');
      upsertAttribute(mule, 'currentMapID',  '');
      upsertAttribute(mule, 'currentRegion', '');
      upsertAttribute(mule, 'currentLocale', '');
    }
  }

  function getAbilityAction(character, name) {
    if (!character) return '';
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function parseVersionRoot(raw) {
    var obj = {};
    var lines = String(raw || '').split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = String(lines[i] || '').trim();
      if (!line) continue;
      var eq = line.indexOf('=');
      if (eq <= 0) continue;
      var key = line.substring(0, eq).trim();
      var val = line.substring(eq + 1).trim();
      if (key) obj[key] = val;
    }
    return obj;
  }

  function serializeVersionRoot(obj) {
    var lines = [];
    Object.keys(obj || {}).sort().forEach(function(k){
      lines.push(k + '=' + String(obj[k] || ''));
    });
    return lines.join('\n');
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion) {
    if (!character) return;
    var key = String(moduleKey || '').trim();
    if (!key) return;
    var raw = getAbilityAction(character, 'version');
    var root = parseVersionRoot(raw);
    var ver = String(moduleVersion || '').trim();
    var low = key.toLowerCase();
    if (ver.toLowerCase().indexOf(low + '_') === 0) ver = ver.substring(low.length + 1);
    if (ver.indexOf(key + '_') === 0) ver = ver.substring(key.length + 1);
    root[key] = key + '_' + ver;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function mirrorVersionToMule() {
    var mule = getOrCreateMule();
    if (!mule) return;
    mergeVersionEntry(mule, 'mapMeta', VERSION);
  }

  /* ========== Storage & Formatting ========== */

  function storeMeta(meta) {
    var S = ensureMapMetaState();
    S.last = meta;
    S.byPage[meta.id] = meta;
  }
  function syncMapMetaRootToMule() {
    var S = ensureMapMetaState();
    var mule = getOrCreateMule();
    if (!mule) return;
    var meta = S.last || null;
    if (meta) {
      upsertAbility(mule, 'mapMeta', JSON.stringify(meta));
      return;
    }
    upsertAbility(mule, 'mapMeta', JSON.stringify({
      id: '',
      raw_name: '',
      name: '',
      region_name: '',
      locale_name: '',
      name_pattern_ok: false,
      region_valid: false,
      locale_valid: false,
      sampled_at: (new Date()).toISOString()
    }));
  }


  // showAll: boolean – whether to show Page + DL + timestamp + pixel metrics
  // isGM:   boolean – whether to show the Refresh button
  function formatSummary(meta, showAll, isGM) {
    var v = cssVars();
    var html = '';

    html += '<div style="'+ (v.card || '') +'">';

    if (!meta) {
      // No meta captured yet: keep a simple hint.
      html += '<div><b>Map Information</b></div>';
      html += '<div>No page metadata captured yet. Use '
           +  (v.literal ? v.literal('!dwt --mapMeta') : '!dwt --mapMeta')
           +  '.</div>';
      html += '</div>';
      return html;
    }

    // 1) Title line: page/map name in bold
    html += '<div><b>' + esc(meta.name) + '</b></div>';

    // 2) Second line: (Locale, Region) in italics, if naming is valid
    if (meta.name_pattern_ok && meta.region_valid && meta.locale_valid &&
        (meta.locale_name || meta.region_name)) {
      var pieces = [];
      if (meta.locale_name) {
        pieces.push(esc(meta.locale_name));
      }
      if (meta.region_name) {
        pieces.push(esc(meta.region_name));
      }
      html += '<div><i>(' + pieces.join(', ') + ')</i></div>';
    }

    // 3) Grid + Map Size (always shown)
    var scaleVal    = parseFloat(meta.scale_number);
    var scaleUnits  = meta.scale_units || '';
    var gridRaw     = String(meta.grid_type || '');
    var gridType    = gridRaw.toLowerCase();
    var gridLabel   = gridRaw;
    if (gridType === 'hexr' || gridType === 'hexv' || gridType === 'hex') {
      gridLabel = 'hex';
    }

    var worldW      = parseFloat(meta.world_width_distance);
    var worldH      = parseFloat(meta.world_height_distance);
    var worldWText  = isNaN(worldW) ? meta.world_width_distance : worldW.toFixed(1);
    var worldHText  = isNaN(worldH) ? meta.world_height_distance : worldH.toFixed(1);

    if (gridType !== 'none') {
      var cellDistVal = isNaN(scaleVal) ? meta.scale_number : scaleVal.toFixed(1);
      html += '<div><b>Grid:</b> '
           +  esc(gridLabel) + ', cell = '
           +  cellDistVal + ' ' + esc(scaleUnits) + '</div>';
    } else {
      html += '<div><b>Grid:</b> none</div>';
    }

    html += '<div><b>Map Size:</b> '
         +  worldWText + ' × '
         +  worldHText + ' '
         +  esc(scaleUnits) + '</div>';

    // 4) Extra detail only in "all" view (Pixel Metrics + DL + timestamp)
    if (showAll) {
      if (typeof meta.page_width_px !== 'undefined' &&
          typeof meta.page_height_px !== 'undefined' &&
          typeof meta.cell_size_px !== 'undefined') {
        html += '<div><b>Map Pixels:</b> '
             +  esc(String(meta.page_width_px)) + ' × '
             +  esc(String(meta.page_height_px)) + ' px'
             +  ' (cell = ' + esc(String(meta.cell_size_px)) + ' px, '
             +  '70 px/unit)</div>';
      }

      var dlBits = [];
      dlBits.push('DL=' + (meta.dynamic_lighting_enabled ? 'on' : 'off'));
      dlBits.push('Daylight=' + (meta.daylight_mode_enabled ? 'on' : 'off'));
      dlBits.push('GlobalIllum=' + (meta.lightglobalillum ? 'on' : 'off'));
      dlBits.push('RestrictMove=' + (meta.lightrestrictmove ? 'on' : 'off'));
      dlBits.push('EnforceLoS=' + (meta.lightenforcelos ? 'on' : 'off'));
      dlBits.push('Explorer=' + meta.explorer_mode);
      dlBits.push('Darkness=' + meta.darknessEffect);

      html += '<div style="margin-top:4px;"><b>Dynamic Lighting:</b><br>'
           +  dlBits.map(function(s){ return esc(s); }).join('<br>') + '</div>';

      html += '<div style="margin-top:4px;font-size:10px;color:#AAA;">';
      html += 'Sampled at ' + esc(meta.sampled_at) + '</div>';
    }

    // 5) GM-only refresh button (re-runs !dwt --mapMeta all)
    if (isGM) {
      var href = (v.hrefAttr ? v.hrefAttr('!dwt --mapMeta all') : '!dwt --mapMeta all');
      var btnStyle = v.btn || '';
      var styleAttr = btnStyle ? (' style="' + btnStyle + '"') : '';
      html += '<div style="margin-top:8px;">'
           +  '<a role="button" href="' + href + '"' + styleAttr + '>'
           +  'Refresh Map Information'
           +  '</a>'
           +  '</div>';
    }

    html += '</div>';

    return html;
  }

  function renderConfigHTML(pid) {
    var S = ensureMapMetaState();

    var isGM = false;
    try {
      if (typeof playerIsGM === 'function') {
        isGM = playerIsGM(pid);
      }
    } catch (e) {
      isGM = false;
    }

    // When the GM opens the dwt panel (!dwt), recapture for the current page
    // so the Map Information card always reflects the GM's active map.
    if (isGM) {
      var res = captureForPlayer(pid);
      if (res && res.error) {
        // If capture fails, we'll fall back to whatever last meta we had.
      }
    }

    var meta = S.last || null;

    // one-shot "all" flag: only honored for the next render, then cleared
    var showAll = false;
    if (pid && S.flash && S.flash[pid]) {
      showAll = true;
      delete S.flash[pid];
    }

    return formatSummary(meta, showAll, isGM);
  }

  /* ========== Capture Helpers (used by init + command) ========== */

  function captureForPlayer(pid) {
    var page = getActivePageForPlayer(pid) || getDefaultBookmarkPage();
    if (!page) {
      return { error: 'Could not resolve an active page for you.' };
    }
    var meta = collectPageMeta(page);
    storeMeta(meta);
    storeMetaToMule(meta);
    return { meta: meta };
  }

  function captureDefaultPageAtInit() {
    try {
      var page = getDefaultBookmarkPage();
      if (!page) return;
      var meta = collectPageMeta(page);
      storeMeta(meta);
      storeMetaToMule(meta);
    } catch (e) {
      log('dwt_mapMeta captureDefaultPageAtInit err: ' + e);
    }
  }

  /* ========== Command Handler (wired via core) ========== */

  function handleMapMetaCommand(args) {
    // args: { pid, key:'mapmeta', val:'', ... }
    var pid = args.pid;
    var rawVal = (args.val === undefined || args.val === null) ? '' : String(args.val);
    var val = rawVal.trim().toLowerCase();
    var S   = ensureMapMetaState();

    if (!playerIsGM(pid)) {
      return { error: 'Only the gm may capture map metadata.' };
    }

    // If "all", mark a one-shot flash for this player.
    if (val === 'all') {
      S.flash[pid] = true;
    } else if (!val || val === 'active') {
      delete S.flash[pid];
    } else {
      return {
        error: 'Unrecognized value for --mapMeta: "' + esc(rawVal) +
               '". Use "!dwt --mapMeta" or "!dwt --mapMeta all".'
      };
    }

    var res = captureForPlayer(pid);
    if (res.error) {
      return { error: res.error };
    }

    var meta = res.meta || {};

    // Graceful error whispering for naming issues
    try {
      if (!meta.name_pattern_ok) {
        sendChat('dwt', '/w gm Map page name "' + esc(meta.raw_name || '') +
          '" does not match the expected Region.Locale.MapName convention ' +
          '(e.g. Frozenfar.Coastal.Ice Plains or swordcoastnorth.inland.farmhouse). ' +
          'Region and Locale will not be shown.');
      } else {
        if (!meta.region_valid) {
          sendChat('dwt', '/w gm Region "' + esc(meta.region_name || '') +
            '" is not one of the allowed values ' +
            '(Frozenfar, Sword Coast North, Sword Coast, Moonshaes, Lands of Intrigue). ' +
            'Region and Locale will not be shown.');
        } else if (!meta.locale_valid) {
          sendChat('dwt', '/w gm Locale "' + esc(meta.locale_name || '') +
            '" is not one of the allowed values (Offshore, Coastal, Inland). ' +
            'Region and Locale will not be shown.');
        }
      }
    } catch (e) {
      // Ignore whisper failures
    }

    // core will re-render Campaign Log panel (which includes our Map Information card)
    return { changed: true };
  }

  /* ========== Core Integration ========== */

  function registerWithCore() {
    try {
      if (RT.dwt && !_registered && typeof RT.dwt.registerCommands === 'function') {
        RT.dwt.registerCommands({
          'mapmeta': {
            access: 'player',
            handler: handleMapMetaCommand
          }
        });

        RT.dwt.addLogCard(20, function (pid) {
          try {
            return renderConfigHTML(pid);
          } catch (e) {
            log('dwt_mapMeta logCard err: ' + e);
            return '';
          }
        });

        RT.dwt.addHelpSection(20, 'Map Information', function () {
          return [
            'Capture active page map info (truncated):', '!dwt --mapMeta',
            'Capture and show all details (one-shot):',  '!dwt --mapMeta all',
            'Where data is stored:',                     'dwt_mule → ability "mapMeta" (JSON)',
            'Also stored on mule:',                      'currentMap, currentMapID, currentRegion, currentLocale',
            'Naming convention:',                        'Page name "Region.Locale.MapName" (e.g. Frozenfar.Coastal.Ice Plains or swordcoastnorth.inland.farmhouse)',
            'Valid Regions:',                            'Frozenfar, Sword Coast North, Sword Coast, Moonshaes, Lands of Intrigue',
            'Valid Locales:',                            'Offshore, Coastal, Inland'
          ];
        });

        _registered = true;
      }
    } catch (e) {
      log('dwt_mapMeta registerWithCore err: ' + e);
    }
  }


  function mapMetaStartup(){
    ensureMapMetaState();
    captureDefaultPageAtInit();
    syncMapMetaRootToMule();
    mirrorVersionToMule();
  }

  function init() {
    mapMetaStartup();
    registerWithCore();

    // In case core loads *after* this module, hook into dwtQ.
    try {
      RT.dwtQ = RT.dwtQ || [];
      RT.dwtQ.push(function (dwt) {
        try{
          if(dwt && typeof dwt.registerStartup === 'function'){
            dwt.registerStartup('mapmeta', function(mule, reason){
              try{ mapMetaStartup(); }catch(e){}
            });
          }
          registerWithCore();
        }catch(e){}
      });
      if (RT.dwt && typeof RT.dwt.registerStartup === 'function'){
        RT.dwt.registerStartup('mapmeta', function(mule, reason){
          try{ mapMetaStartup(); }catch(e){}
        });
      }
    } catch (e) {
      log('dwt_mapMeta dwtQ err: ' + e);
    }
  }

  return {
    init: init
  };
}());

on('ready', function () {
  'use strict';
  dwt_mapMeta.init();
});