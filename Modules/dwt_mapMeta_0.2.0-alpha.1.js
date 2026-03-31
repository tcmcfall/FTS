// name:        dwt_mapMeta.js
// version:     0.2.0-alpha.1
// description: Unified map metadata capture for DWT.
// depends:     dwt_core >= 0.1.0-alpha.1 (optional but recommended), Roll20 Mod API
// provides:    !dwt --mapMeta | !dwt --mapMeta all | !dwt --mapMeta set depth <value>
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

var dwt_mapMeta = dwt_mapMeta || (function () {
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  var VERSION = '0.2.0-alpha.1';
  var MODULE_KEY = 'mapmeta';
  var MULE_NAME = 'dwt_mule';
  var ROOT_ABILITY = 'regions';
  var STATE_ROOT = 'mapmeta';
  var LOCALE_ORDER = ['offshore', 'coastal', 'inland', 'underwater', 'underdark'];
  var DEFAULT_LOCALE_DEFINITIONS = {
    offshore: { key: 'offshore', label: 'Offshore', token: 'Offshore', environment: 'surface', includeFathoms: false },
    coastal: { key: 'coastal', label: 'Coastal', token: 'Coastal', environment: 'surface', includeFathoms: false },
    inland: { key: 'inland', label: 'Inland', token: 'Inland', environment: 'surface', includeFathoms: false },
    underwater: { key: 'underwater', label: 'Underwater', token: 'Underwater', environment: 'underwater', includeFathoms: true },
    underdark: { key: 'underdark', label: 'Underdark', token: 'Underdark', environment: 'subterranean', includeFathoms: false }
  };
  var _registered = false;
  var _startupRegistered = false;

  function ensureMapMetaState() {
    if (!state.dwt) state.dwt = {};
    if (!state.dwt[STATE_ROOT]) {
      state.dwt[STATE_ROOT] = {
        last: null,
        byPage: {},
        flash: {},
        namingWarn: {}
      };
    }
    if (!state.dwt[STATE_ROOT].byPage) state.dwt[STATE_ROOT].byPage = {};
    if (!state.dwt[STATE_ROOT].flash) state.dwt[STATE_ROOT].flash = {};
    if (!state.dwt[STATE_ROOT].namingWarn) state.dwt[STATE_ROOT].namingWarn = {};
    return state.dwt[STATE_ROOT];
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c;
    });
  }

  function cssVars() {
    return (RT.dwt && typeof RT.dwt.cssVars === 'function')
      ? RT.dwt.cssVars()
      : {
          card: '',
          btn: '',
          hrefAttr: function (s) { return String(s || '').replace(/"/g, '&quot;'); },
          literal: function (s) { return '<code>' + esc(s) + '</code>'; }
        };
  }

  function lower(s) {
    return String(s || '').toLowerCase();
  }

  function canonicalRegionKey(s) {
    return lower(s).replace(/[^a-z0-9]+/g, '');
  }

  function canonicalLocaleKey(s) {
    return lower(s).replace(/[^a-z0-9]+/g, '');
  }

  function roundTo(n, decimals) {
    var pow = Math.pow(10, decimals || 0);
    return Math.round((+n || 0) * pow) / pow;
  }

  function trimNumberString(n, decimals) {
    var value = roundTo(n, decimals);
    var text = String(value.toFixed(decimals || 0));
    return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function metersToFeet(meters) {
    return meters / 0.3048;
  }

  function feetToMeters(feet) {
    return feet * 0.3048;
  }

  function feetToFathoms(feet) {
    return feet / 6;
  }

  function formatMetricDepth(meters) {
    meters = Math.max(0, Math.round(+meters || 0));
    if (meters >= 1000) return trimNumberString(meters / 1000, 2) + ' km';
    return trimNumberString(meters, 0) + ' m';
  }

  function formatImperialDepth(meters, includeFathoms) {
    var feet = Math.max(0, roundTo(metersToFeet(meters), 0));
    var label = (feet >= 5280)
      ? (trimNumberString(feet / 5280, 2) + ' mi')
      : (trimNumberString(feet, 0) + ' ft');
    if (includeFathoms) {
      label += ' (' + trimNumberString(feetToFathoms(feet), 0) + ' fathoms)';
    }
    return label;
  }

  function getWeatherUnits(mule) {
    mule = mule || getOrCreateMule();
    try {
      var rootRaw = getAbilityAction(mule, 'weather');
      if (rootRaw) {
        var rootParsed = JSON.parse(rootRaw);
        if (rootParsed && rootParsed.settings && rootParsed.settings.units === 'metric') {
          return 'metric';
        }
        if (rootParsed && rootParsed.settings && rootParsed.settings.units === 'imperial') {
          return 'imperial';
        }
      }
    } catch (e) {}
    return 'imperial';
  }

  function formatFathomsDepth(meters) {
    return trimNumberString(feetToFathoms(roundTo(metersToFeet(meters), 0)), 0) + ' fathoms';
  }

  function formatPreferredDepth(meters, units) {
    return (units === 'metric')
      ? formatMetricDepth(meters)
      : formatImperialDepth(meters, false);
  }

  function formatDepthDisplay(meters, localeKey, units, isElevation) {
    var preferred = formatPreferredDepth(meters, units);
    if (isElevation) return preferred;
    if (localeKey === 'underwater') {
      return formatFathomsDepth(meters) + ' (' + preferred + ')';
    }
    return preferred + ' below the surface';
  }

  function formatApproximateDepthDisplay(meters, units, isElevation) {
    meters = Math.max(0, Math.round(+meters || 0));
    if (units === 'metric') {
      if (meters >= 1000) {
        return 'approximately ' + trimNumberString(meters / 1000, 1) + ' km' + (isElevation ? '' : ' below the surface');
      }
      return 'approximately ' + trimNumberString(Math.max(10, Math.round(meters / 10) * 10), 0) + ' m' + (isElevation ? '' : ' below the surface');
    }
    var feet = Math.max(0, roundTo(metersToFeet(meters), 0));
    if (feet >= 5280) {
      return 'approximately ' + trimNumberString(feet / 5280, 1) + ' mi' + (isElevation ? '' : ' below the surface');
    }
    return 'approximately ' + trimNumberString(Math.max(10, Math.round(feet / 10) * 10), 0) + ' ft' + (isElevation ? '' : ' below the surface');
  }

  function parseDepthSpec(raw, units) {
    var input = String(raw || '').trim();
    if (!input) {
      return { ok: false, error: 'Depth or elevation requires a value.' };
    }

    var cleaned = input.replace(/,/g, '').trim();
    var match = cleaned.match(/^(\+)?([0-9]+(?:\.[0-9]+)?)(?:\s*(mi|km))?$/i);
    if (!match) {
      return {
        ok: false,
        error: 'Depth must be a positive number, with optional + for elevation and optional mi or km.'
      };
    }

    var isElevation = !!match[1];
    var rawValue = parseFloat(match[2]);
    var explicitUnit = lower(match[3] || '');
    if (!isFinite(rawValue) || rawValue <= 0) {
      return {
        ok: false,
        error: 'Depth or elevation must use a positive value.'
      };
    }

    if (!explicitUnit && rawValue % 1 !== 0) {
      return {
        ok: false,
        error: 'Bare depth values must be whole numbers in page names and commands.'
      };
    }

    units = (units === 'metric') ? 'metric' : 'imperial';
    var unitToken = explicitUnit || (units === 'metric' ? 'm' : 'ft');
    var meters = 0;
    if (unitToken === 'ft') meters = feetToMeters(rawValue);
    else if (unitToken === 'mi') meters = feetToMeters(rawValue * 5280);
    else if (unitToken === 'm') meters = rawValue;
    else meters = rawValue * 1000;

    meters = roundTo(meters, 4);
    var canonicalToken = (isElevation ? '+' : '')
      + trimNumberString(rawValue, explicitUnit ? 2 : 0)
      + explicitUnit;

    return {
      ok: true,
      meters: meters,
      canonicalToken: canonicalToken,
      isElevation: isElevation,
      metricLabel: formatMetricDepth(meters),
      imperialLabel: formatImperialDepth(meters, false),
      fathomsLabel: formatFathomsDepth(meters)
    };
  }

  function normalizeLocaleDefinition(localeKey, rawDef) {
    var base = DEFAULT_LOCALE_DEFINITIONS[localeKey] || {};
    var def = rawDef && typeof rawDef === 'object' && !Array.isArray(rawDef) ? rawDef : {};
    return {
      key: canonicalLocaleKey(localeKey || def.key || ''),
      label: String(def.label || base.label || localeKey || '').trim(),
      token: String(def.token || def.label || base.token || base.label || localeKey || '').trim(),
      environment: lower(def.environment || base.environment || 'surface').replace(/[^a-z]+/g, '') || 'surface',
      includeFathoms: !!(def.includeFathoms != null ? def.includeFathoms : base.includeFathoms)
    };
  }

  function normalizeRegionLocaleDefinitions(payload) {
    var defs = {};
    var rawDefs = (payload && payload.localeDefinitions && typeof payload.localeDefinitions === 'object' && !Array.isArray(payload.localeDefinitions))
      ? payload.localeDefinitions
      : {};
    normalizeRegionLocales(payload).forEach(function (localeKey) {
      defs[localeKey] = normalizeLocaleDefinition(localeKey, rawDefs[localeKey]);
    });
    return defs;
  }

  function localeDepthRequired(def) {
    if (!def) return false;
    return def.environment === 'underwater' || def.environment === 'subterranean';
  }

  function localeDefinitionForKey(regionMeta, rawLocale) {
    var localeKey = canonicalLocaleKey(rawLocale);
    if (!localeKey) return null;
    var defs = (regionMeta && regionMeta.localeDefinitions) || DEFAULT_LOCALE_DEFINITIONS;
    if (defs[localeKey]) return normalizeLocaleDefinition(localeKey, defs[localeKey]);
    if (DEFAULT_LOCALE_DEFINITIONS[localeKey]) return normalizeLocaleDefinition(localeKey, DEFAULT_LOCALE_DEFINITIONS[localeKey]);
    return null;
  }

  function parseLocaleSpec(rawLocale, opts) {
    opts = opts || {};

    var raw = String(rawLocale || '').trim();
    var out = {
      raw_locale: raw,
      locale_key: '',
      locale_label: '',
      locale_token: '',
      depth_required: false,
      depth_present: false,
      depth_valid: false,
      depth_meters: 0,
      depth_token: '',
      depth_is_elevation: false,
      depth_metric: '',
      depth_imperial: '',
      depth_display: '',
      depth_fathoms: '',
      error: ''
    };

    if (!raw) {
      out.error = 'Locale is required.';
      return out;
    }

    var underscore = raw.indexOf('_');
    var localePart = (underscore >= 0) ? raw.slice(0, underscore) : raw;
    var depthPart = (underscore >= 0) ? raw.slice(underscore + 1) : '';
    var def = localeDefinitionForKey(opts.regionMeta || null, localePart);
    if (!def) def = localeDefinitionForKey(null, localePart);

    out.locale_key = def ? canonicalLocaleKey(def.key) : canonicalLocaleKey(localePart);
    out.locale_label = def ? def.label : String(localePart || '').trim();
    out.locale_token = out.locale_key;
    out.depth_present = !!String(depthPart || '').trim();

    if (!def) {
      out.error = 'Unsupported locale "' + raw + '".';
      return out;
    }

    out.depth_required = localeDepthRequired(def);
    if (underscore >= 0 && !String(depthPart || '').trim()) {
      out.error = 'Depth or elevation cannot be empty after "_".';
      return out;
    }

    if (!out.depth_present) return out;

    var parsedDepth = parseDepthSpec(depthPart, getWeatherUnits(opts.mule || getOrCreateMule()));
    if (!parsedDepth.ok) {
      out.error = parsedDepth.error;
      return out;
    }

    out.depth_valid = true;
    out.depth_meters = parsedDepth.meters;
    out.depth_token = parsedDepth.canonicalToken;
    out.depth_is_elevation = !!parsedDepth.isElevation;
    out.depth_metric = parsedDepth.metricLabel;
    out.depth_imperial = parsedDepth.imperialLabel;
    out.depth_display = formatDepthDisplay(
      parsedDepth.meters,
      out.locale_key,
      getWeatherUnits(opts.mule || getOrCreateMule()),
      !!parsedDepth.isElevation
    );
    out.depth_fathoms = parsedDepth.fathomsLabel;
    out.locale_token = out.locale_key + '_' + parsedDepth.canonicalToken;
    return out;
  }

  function getActivePageForPlayer(pid) {
    try {
      if (RT.dwt && typeof RT.dwt.getEffectivePageId === 'function') {
        var effectiveId = RT.dwt.getEffectivePageId(pid);
        if (effectiveId) return getObj('page', effectiveId);
      }
    } catch (e) {}

    try {
      if (typeof getPlayerPage === 'function') {
        var pageId = getPlayerPage(pid);
        if (pageId) return getObj('page', pageId);
      }
    } catch (e2) {}
    return null;
  }

  function getDefaultBookmarkPage() {
    try {
      var campaign = findObjs({ _type: 'campaign' })[0];
      if (!campaign) return null;
      var pageId = campaign.get('playerpageid') || campaign.get('sandbox_active_page');
      return pageId ? getObj('page', pageId) : null;
    } catch (e) {
      return null;
    }
  }

  function getOrCreateMule() {
    try {
      if (RT.dwt && typeof RT.dwt.ensureMule === 'function') {
        return RT.dwt.ensureMule();
      }
    } catch (e) {}

    var matches = findObjs({ _type: 'character', name: MULE_NAME }) || [];
    var mule = null;
    var bestScore = -1;
    for (var i = 0; i < matches.length; i++) {
      var abilities = findObjs({ _type: 'ability', _characterid: matches[i].id }) || [];
      var score = abilities.length;
      for (var ai = 0; ai < abilities.length; ai++) {
        var ability = abilities[ai];
        var name = '';
        try { name = normalizeAbilityName(ability.get('name') || ''); } catch (e0) {}
        var weighted = abilitySortScore(name, ability);
        score += weighted;
        if (name === 'regions' || name === 'weather' || name === 'mapmeta') score += weighted;
        else if (name === 'version' || name === 'core') score += Math.max(0, weighted);
      }
      if (score > bestScore) {
        bestScore = score;
        mule = matches[i];
      }
    }
    if (!mule) {
      mule = createObj('character', {
        name: MULE_NAME,
        inplayerjournals: '',
        controlledby: 'all',
        archived: false
      });
    }
    return mule;
  }

  function abilityActionLength(ability) {
    try { return String((ability && ability.get('action')) || '').length; } catch (e) { return 0; }
  }

  function abilityText(ability) {
    try { return String((ability && ability.get('action')) || ''); } catch (e) { return ''; }
  }

  function normalizeAbilityName(name) {
    return String(name || '').toLowerCase().replace(/\s+/g, '');
  }

  function safeParseJSON(text) {
    try { return JSON.parse(String(text || '')); } catch (e) { return null; }
  }

  function regionsRootQuality(text) {
    var parsed = safeParseJSON(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = (parsed.schema === 'dwt.regions.root.v1') ? 50 : 0;
    var regions = parsed.regions;
    if (!regions || typeof regions !== 'object' || Array.isArray(regions)) return score;
    var keys = Object.keys(regions);
    score += keys.length * 5;
    for (var i = 0; i < keys.length; i++) {
      var payload = regions[keys[i]];
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      if (payload.schema === 'dwt.region.v4') score += 200;
      if (payload.weather && typeof payload.weather === 'object' && !Array.isArray(payload.weather)) score += 100;
      if (payload.region) score += 10;
      if (payload.locales) score += 10;
    }
    return score;
  }

  function weatherRootQuality(text) {
    var parsed = safeParseJSON(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = 0;
    if (parsed.meta && parsed.meta.rootSchema === 'dwt.weather.root.v2') score += 200;
    if (parsed.settings && (parsed.settings.units === 'imperial' || parsed.settings.units === 'metric')) score += 25;
    if (parsed.current && typeof parsed.current === 'object' && !Array.isArray(parsed.current)) score += 25;
    if (parsed.history && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) score += 25;
    return score;
  }

  function abilitySortScore(name, ability) {
    var text = abilityText(ability);
    var key = normalizeAbilityName(name || (ability && ability.get && ability.get('name')) || '');
    var base = abilityActionLength(ability);
    if (key === 'regions') return regionsRootQuality(text) * 1000000 + base;
    if (key === 'weather') return weatherRootQuality(text) * 1000000 + base;
    return base;
  }

  function namedAbilities(character, name) {
    if (!character) return [];
    var list = findObjs({ _type: 'ability', _characterid: character.id, name: name }) || [];
    list.sort(function (a, b) { return abilitySortScore(name, b) - abilitySortScore(name, a); });
    return list;
  }

  function getAbilityAction(character, name) {
    if (!character) return '';
    var ability = namedAbilities(character, name)[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function upsertAbility(character, name, action) {
    if (!character) return;
    var abilities = namedAbilities(character, name);
    if (abilities.length) {
      for (var i = 0; i < abilities.length; i++) {
        abilities[i].set({ action: String(action || '') });
      }
    } else {
      createObj('ability', {
        characterid: character.id,
        name: name,
        action: String(action || ''),
        istokenaction: false
      });
    }
  }

  function upsertAttribute(character, name, value) {
    if (!character) return;
    var attr = findObjs({
      _type: 'attribute',
      _characterid: character.id,
      name: name
    })[0];

    if (attr) {
      attr.set({ current: String(value || '') });
    } else {
      createObj('attribute', {
        characterid: character.id,
        name: name,
        current: String(value || ''),
        max: ''
      });
    }
  }

  function parseVersionRoot(raw) {
    var obj = {};
    String(raw || '').split('\r').join('').split('\n').forEach(function (line) {
      var trimmed = String(line || '').trim();
      if (!trimmed) return;
      var idx = trimmed.indexOf('=');
      if (idx < 1) return;
      obj[canonicalRegionKey(trimmed.slice(0, idx))] = String(trimmed.slice(idx + 1) || '').trim();
    });
    return obj;
  }

  function serializeVersionRoot(obj) {
    var lines = [];
    Object.keys(obj || {}).sort().forEach(function (key) {
      var clean = canonicalRegionKey(key);
      if (clean) lines.push(clean + '=' + obj[key]);
    });
    return lines.join('\n');
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion) {
    if (!character) return;
    var key = canonicalRegionKey(moduleKey);
    if (!key) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    var version = String(moduleVersion || '').trim();
    root[key] = version;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function loadRegionsRoot(mule) {
    var raw = getAbilityAction(mule, ROOT_ABILITY);
    if (!raw) return { schema: 'dwt.regions.root.v1', regions: {} };
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {};
      if (!parsed.regions || typeof parsed.regions !== 'object' || Array.isArray(parsed.regions)) {
        parsed.regions = {};
      }
      if (parsed.schema !== 'dwt.regions.root.v1') parsed.schema = 'dwt.regions.root.v1';
      return parsed;
    } catch (e) {
      return { schema: 'dwt.regions.root.v1', regions: {} };
    }
  }

  function normalizeRegionLocales(payload) {
    var out = [];
    if (!payload || !Array.isArray(payload.locales)) return out;
    payload.locales.forEach(function (value) {
      var localeKey = canonicalLocaleKey(value);
      if (localeKey && out.indexOf(localeKey) === -1) {
        out.push(localeKey);
      }
    });
    return out;
  }

  function loadKnownRegions(mule) {
    var root = loadRegionsRoot(mule || getOrCreateMule());
    var out = {};
    Object.keys(root.regions || {}).forEach(function (rawKey) {
      var payload = root.regions[rawKey];
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
      var regionKey = canonicalRegionKey(payload.region || rawKey);
      var displayName = String(payload.displayName || '').trim();
      if (!regionKey || !displayName) return;
      out[regionKey] = {
        regionKey: regionKey,
        displayName: displayName,
        defaultLocale: canonicalLocaleKey(payload.defaultLocale || ''),
        locales: normalizeRegionLocales(payload),
        localeDefinitions: normalizeRegionLocaleDefinitions(payload)
      };
    });
    return out;
  }

  function loadedRegionDisplayNames(mule) {
    var known = loadKnownRegions(mule);
    return Object.keys(known).map(function (key) {
      return known[key].displayName;
    }).sort();
  }

  function loadedLocaleSummaries(mule) {
    var known = loadKnownRegions(mule);
    var seen = {};
    var out = [];
    Object.keys(known).sort().forEach(function (regionKey) {
      var regionMeta = known[regionKey];
      regionMeta.locales.forEach(function (localeKey) {
        var summary = localeKey + ' (' + regionKey + ')';
        if (!seen[summary]) {
          seen[summary] = true;
          out.push(summary);
        }
      });
    });
    return out;
  }

  function emptyPageNameMeta(rawName) {
    return {
      raw_name: String(rawName || ''),
      name: String(rawName || ''),
      raw_region: '',
      raw_locale: '',
      region_key: '',
      locale_key: '',
      region_name: '',
      locale_name: '',
      name_pattern_ok: false,
      region_valid: false,
      locale_valid: false,
      depth_required: false,
      depth_present: false,
      depth_valid: false,
      depth_meters: 0,
      depth_token: '',
      depth_is_elevation: false,
      depth_metric: '',
      depth_imperial: '',
      depth_display: '',
      depth_fathoms: '',
      depth_error: ''
    };
  }

  function parsePageName(rawName, mule, opts) {
    var meta = emptyPageNameMeta(rawName);
    var parts = String(rawName || '').split('.');
    if (parts.length < 3) return meta;

    var rawRegion = String(parts[0] || '').trim();
    var rawLocale = String(parts[1] || '').trim();
    var rawMap = parts.slice(2).join('.').trim();
    if (!rawRegion || !rawLocale || !rawMap) return meta;

    meta.name_pattern_ok = true;
    meta.raw_region = rawRegion;
    meta.raw_locale = rawLocale;
    meta.name = rawMap;

    var knownRegions = loadKnownRegions(mule || getOrCreateMule());
    var regionKey = canonicalRegionKey(rawRegion);
    var regionMeta = knownRegions[regionKey] || null;
    var localeMeta = parseLocaleSpec(rawLocale, {
      mule: mule || getOrCreateMule(),
      allowMissingDepth: !!(opts && opts.allowMissingDepth),
      regionMeta: regionMeta
    });

    meta.region_key = regionKey;
    meta.region_name = regionMeta ? regionMeta.displayName : rawRegion;
    meta.region_valid = !!regionMeta;
    meta.locale_key = localeMeta.locale_key;
    meta.locale_name = localeMeta.locale_label || rawLocale;
    meta.depth_required = !!localeMeta.depth_required;
    meta.depth_present = !!localeMeta.depth_present;
    meta.depth_valid = !!localeMeta.depth_valid;
    meta.depth_meters = localeMeta.depth_meters || 0;
    meta.depth_token = localeMeta.depth_token || '';
    meta.depth_is_elevation = !!localeMeta.depth_is_elevation;
    meta.depth_metric = localeMeta.depth_metric || '';
    meta.depth_imperial = localeMeta.depth_imperial || '';
    meta.depth_display = localeMeta.depth_display || '';
    meta.depth_fathoms = localeMeta.depth_fathoms || '';
    meta.depth_error = localeMeta.error || '';

    var allowedLocales = regionMeta ? regionMeta.locales : LOCALE_ORDER.slice();
    meta.locale_valid = !!meta.locale_key
      && allowedLocales.indexOf(meta.locale_key) !== -1
      && !localeMeta.error;

    return meta;
  }

  function collectPageMeta(page) {
    var mule = getOrCreateMule();
    var parsed = parsePageName(page.get('name') || '', mule);

    var widthUnits = Number(page.get('width') || 0);
    var heightUnits = Number(page.get('height') || 0);
    var snapUnits = Number(page.get('snapping_increment') || 1);
    var scaleNumber = Number(page.get('scale_number') || 5);
    var scaleUnits = String(page.get('scale_units') || 'ft');
    var cellsWide = (snapUnits > 0 ? widthUnits / snapUnits : 0);
    var cellsHigh = (snapUnits > 0 ? heightUnits / snapUnits : 0);
    var distancePerCell = scaleNumber;
    var worldWidth = cellsWide * distancePerCell;
    var worldHeight = cellsHigh * distancePerCell;
    var pixelsPerUnit = 70;

    return {
      id: page.id,
      raw_name: parsed.raw_name,
      name: parsed.name,
      raw_region: parsed.raw_region,
      raw_locale: parsed.raw_locale,
      region_key: parsed.region_key,
      locale_key: parsed.locale_key,
      region_name: parsed.region_name,
      locale_name: parsed.locale_name,
      name_pattern_ok: parsed.name_pattern_ok,
      region_valid: parsed.region_valid,
      locale_valid: parsed.locale_valid,
      depth_required: parsed.depth_required,
      depth_present: parsed.depth_present,
      depth_valid: parsed.depth_valid,
      depth_meters: parsed.depth_meters,
      depth_token: parsed.depth_token,
      depth_is_elevation: parsed.depth_is_elevation,
      depth_metric: parsed.depth_metric,
      depth_imperial: parsed.depth_imperial,
      depth_display: parsed.depth_display,
      depth_fathoms: parsed.depth_fathoms,
      depth_error: parsed.depth_error,
      width_units: widthUnits,
      height_units: heightUnits,
      snapping_increment_units: snapUnits,
      scale_number: scaleNumber,
      scale_units: scaleUnits,
      distance_per_cell: distancePerCell,
      world_width_distance: worldWidth,
      world_height_distance: worldHeight,
      pixels_per_unit: pixelsPerUnit,
      page_width_px: widthUnits * pixelsPerUnit,
      page_height_px: heightUnits * pixelsPerUnit,
      cell_size_px: snapUnits * pixelsPerUnit,
      showgrid: !!page.get('showgrid'),
      grid_type: page.get('grid_type') || 'square',
      grid_opacity: Number(page.get('grid_opacity') || 0),
      gridcolor: page.get('gridcolor') || '#C0C0C0',
      diagonaltype: page.get('diagonaltype') || 'foure',
      showdarkness: !!page.get('showdarkness'),
      fog_opacity: Number(page.get('fog_opacity') || 0.35),
      showlighting: !!page.get('showlighting'),
      dynamic_lighting_enabled: !!page.get('dynamic_lighting_enabled'),
      daylight_mode_enabled: !!page.get('daylight_mode_enabled'),
      daylightModeOpacity: Number(page.get('daylightModeOpacity') || 1),
      lightupdatedrop: !!page.get('lightupdatedrop'),
      lightenforcelos: !!page.get('lightenforcelos'),
      lightrestrictmove: !!page.get('lightrestrictmove'),
      lightglobalillum: !!page.get('lightglobalillum'),
      explorer_mode: page.get('explorer_mode') || 'off',
      darknessEffect: page.get('darknessEffect') || 'none',
      gridlabels: !!page.get('gridlabels'),
      archived: !!page.get('archived'),
      sampled_at: (new Date()).toISOString()
    };
  }

  function emptyMeta() {
    return {
      id: '',
      raw_name: '',
      name: '',
      raw_region: '',
      raw_locale: '',
      region_key: '',
      locale_key: '',
      region_name: '',
      locale_name: '',
      name_pattern_ok: false,
      region_valid: false,
      locale_valid: false,
      depth_required: false,
      depth_present: false,
      depth_valid: false,
      depth_meters: 0,
      depth_token: '',
      depth_is_elevation: false,
      depth_metric: '',
      depth_imperial: '',
      depth_display: '',
      depth_fathoms: '',
      depth_error: '',
      width_units: 0,
      height_units: 0,
      snapping_increment_units: 1,
      scale_number: 0,
      scale_units: '',
      distance_per_cell: 0,
      world_width_distance: 0,
      world_height_distance: 0,
      pixels_per_unit: 70,
      page_width_px: 0,
      page_height_px: 0,
      cell_size_px: 0,
      showgrid: false,
      grid_type: '',
      grid_opacity: 0,
      gridcolor: '',
      diagonaltype: '',
      showdarkness: false,
      fog_opacity: 0,
      showlighting: false,
      dynamic_lighting_enabled: false,
      daylight_mode_enabled: false,
      daylightModeOpacity: 0,
      lightupdatedrop: false,
      lightenforcelos: false,
      lightrestrictmove: false,
      lightglobalillum: false,
      explorer_mode: '',
      darknessEffect: '',
      gridlabels: false,
      archived: false,
      sampled_at: ''
    };
  }

  function depthLabel(meta) {
    return (meta && meta.depth_is_elevation) ? 'Elevation' : 'Depth';
  }

  function depthDisplay(meta, mule) {
    if (!meta || !meta.depth_valid) return '';
    if (meta.locale_key === 'underwater' || meta.locale_key === 'underdark') {
      return formatApproximateDepthDisplay(
        meta.depth_meters,
        getWeatherUnits(mule || getOrCreateMule()),
        !!meta.depth_is_elevation
      );
    }
    return formatDepthDisplay(
      meta.depth_meters,
      meta.locale_key,
      getWeatherUnits(mule || getOrCreateMule()),
      !!meta.depth_is_elevation
    );
  }

  function storeMeta(meta) {
    var stateRoot = ensureMapMetaState();
    stateRoot.last = meta;
    if (meta && meta.id) stateRoot.byPage[meta.id] = meta;
  }

  function syncFlatMetaAttributes(mule, meta) {
    meta = meta || emptyMeta();
    var currentDepth = meta.depth_valid ? depthDisplay(meta, mule) : '';
    upsertAttribute(mule, 'currentMap', meta.name || '');
    upsertAttribute(mule, 'currentMapID', meta.id || '');
    upsertAttribute(mule, 'currentRegion', meta.region_valid ? meta.region_name : '');
    upsertAttribute(mule, 'currentLocale', meta.locale_valid ? meta.locale_name : '');
    upsertAttribute(mule, 'currentDepth', currentDepth);
    upsertAttribute(mule, 'currentDepthMetric', meta.depth_valid ? meta.depth_metric : '');
    upsertAttribute(mule, 'currentDepthImperial', meta.depth_valid ? meta.depth_imperial : '');
    upsertAttribute(mule, 'currentDepthMeters', meta.depth_valid ? String(meta.depth_meters) : '');
  }

  function storeMetaToMule(meta) {
    var mule = getOrCreateMule();
    if (!mule) return;
    upsertAbility(mule, 'mapMeta', JSON.stringify(meta || emptyMeta()));
    syncFlatMetaAttributes(mule, meta || emptyMeta());
  }

  function mirrorVersionToMule() {
    var mule = getOrCreateMule();
    if (!mule) return;
    mergeVersionEntry(mule, MODULE_KEY, VERSION);
  }

  function mirrorCurrentMetaToMule() {
    var stateRoot = ensureMapMetaState();
    storeMetaToMule(stateRoot.last || emptyMeta());
  }

  function formatSummary(meta, showAll, isGM) {
    var v = cssVars();
    var html = '<div style="' + (v.card || '') + '">';

    if (!meta) {
      html += '<div><b>Map Information</b></div>';
      html += '<div>No page metadata captured yet. Use '
        + (v.literal ? v.literal('!dwt --mapMeta') : '!dwt --mapMeta')
        + '.</div></div>';
      return html;
    }

    html += '<div><b>' + esc(meta.name || '(unnamed map)') + '</b></div>';

    var scaleVal = parseFloat(meta.scale_number);
    var scaleUnits = meta.scale_units || '';
    var gridType = lower(meta.grid_type || '');
    var gridLabel = meta.grid_type || '';
    if (gridType === 'hexr' || gridType === 'hexv' || gridType === 'hex') gridLabel = 'hex';
    if (meta.name_pattern_ok && meta.region_valid && meta.locale_valid && (meta.locale_name || meta.region_name)) {
      var pieces = [];
      if (meta.locale_name) pieces.push(esc(meta.locale_name));
      if (meta.region_name) pieces.push(esc(meta.region_name));
      html += '<div><i>(' + pieces.join(', ') + ')</i></div>';
    }

    if (meta.depth_valid) {
      html += '<div><b>' + esc(depthLabel(meta)) + ':</b> ' + esc(depthDisplay(meta, getOrCreateMule())) + '</div>';
    } else if (meta.depth_required) {
      html += '<div><b>Depth:</b> <i>unset</i></div>';
    }

    var worldW = parseFloat(meta.world_width_distance);
    var worldH = parseFloat(meta.world_height_distance);
    var worldWText = isNaN(worldW) ? String(meta.world_width_distance || '') : worldW.toFixed(1);
    var worldHText = isNaN(worldH) ? String(meta.world_height_distance || '') : worldH.toFixed(1);
    var cellDist = isNaN(scaleVal) ? String(meta.scale_number || '') : scaleVal.toFixed(1);

    // Keep footprint/grid diagnostics in the GM-only detail view; the player menu stays location-focused.
    if (showAll) {
      html += '<div><b>Map Size:</b> ' + worldWText + ' x ' + worldHText + ' ' + esc(scaleUnits) + '</div>';

      var gridBits = ['Status=' + (meta.showgrid ? 'enabled' : 'disabled')];
      if (gridType && gridType !== 'none') {
        gridBits.push('Type=' + gridLabel);
        gridBits.push('Cell=' + cellDist + ' ' + scaleUnits);
      } else {
        gridBits.push('Type=none');
      }
      html += '<div style="margin-top:4px;"><b>Grid:</b><br>' + gridBits.map(esc).join('<br>') + '</div>';

      html += '<div><b>Map Pixels:</b> '
        + esc(String(meta.page_width_px || 0)) + ' x '
        + esc(String(meta.page_height_px || 0)) + ' px'
        + ' (cell = ' + esc(String(meta.cell_size_px || 0)) + ' px, 70 px/unit)</div>';

      var dlBits = [];
      dlBits.push('DL=' + (meta.dynamic_lighting_enabled ? 'on' : 'off'));
      dlBits.push('Daylight=' + (meta.daylight_mode_enabled ? 'on' : 'off'));
      dlBits.push('GlobalIllum=' + (meta.lightglobalillum ? 'on' : 'off'));
      dlBits.push('RestrictMove=' + (meta.lightrestrictmove ? 'on' : 'off'));
      dlBits.push('EnforceLoS=' + (meta.lightenforcelos ? 'on' : 'off'));
      dlBits.push('Explorer=' + (meta.explorer_mode || 'off'));
      dlBits.push('Darkness=' + (meta.darknessEffect || 'none'));
      html += '<div style="margin-top:4px;"><b>Dynamic Lighting:</b><br>'
        + dlBits.map(esc).join('<br>') + '</div>';
      html += '<div style="margin-top:4px;font-size:10px;color:#AAA;">Sampled at '
        + esc(meta.sampled_at || '') + '</div>';
    }

    if (isGM) {
      var actionAttrs = (RT.dwt && typeof RT.dwt.actionLinkAttrs === 'function')
        ? RT.dwt.actionLinkAttrs('!dwt --mapMeta all')
        : ' role="button" href="' + (v.hrefAttr ? v.hrefAttr('!dwt --mapMeta all') : '!dwt --mapMeta all') + '"' + (v.btn ? (' style="' + v.btn + '"') : '');
      html += '<div style="margin-top:8px;"><a' + actionAttrs + '>'
        + 'Detailed Map Information</a></div>';
    }

    html += '</div>';
    return html;
  }

  function renderConfigHTML(pid) {
    var stateRoot = ensureMapMetaState();
    var isGM = false;
    try { isGM = !!playerIsGM(pid); } catch (e) {}

    if (isGM) {
      try {
        var res = captureForPlayer(pid);
        if (res && res.meta) {
          stateRoot.last = res.meta;
          maybeWhisperNamingIssues(pid, res.meta);
        }
      } catch (e2) {}
    }

    var showAll = false;
    if (pid && stateRoot.flash && stateRoot.flash[pid]) {
      showAll = true;
      delete stateRoot.flash[pid];
    }

    return formatSummary(stateRoot.last || null, showAll, isGM);
  }

  function captureForPlayer(pid) {
    var page = getActivePageForPlayer(pid) || getDefaultBookmarkPage();
    if (!page) return { error: 'Could not resolve an active page for you.' };
    var meta = collectPageMeta(page);
    storeMeta(meta);
    storeMetaToMule(meta);
    return { meta: meta, page: page };
  }

  function syncPageMeta(pid, opts) {
    opts = opts || {};
    var page = null;
    if (opts.pageId) {
      page = getObj('page', String(opts.pageId || ''));
    }
    if (!page) {
      page = getActivePageForPlayer(pid) || getDefaultBookmarkPage();
    }
    if (!page) return { error: 'Could not resolve an active page for you.' };

    var meta = collectPageMeta(page);
    storeMeta(meta);
    storeMetaToMule(meta);
    maybeWhisperNamingIssues(pid, meta || {});
    return { meta: meta, page: page };
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

  function syncWeatherToPage(pid, pageId) {
    try {
      if (RT.dwt && typeof RT.dwt.weatherVerifySyncActivePage === 'function') {
        RT.dwt.weatherVerifySyncActivePage(pid || 'API', { silent: true, pageId: pageId });
      }
    } catch (e) {}
  }

  function normalizePageName(regionLabel, localeKey, mapName) {
    return canonicalRegionKey(regionLabel) + '.'
      + canonicalLocaleKey(localeKey) + '.'
      + lower(String(mapName || '')).replace(/\s+/g, '').trim();
  }

  function buildCanonicalPageName(regionDisplayName, localeKey, depthToken, mapName, regionMeta) {
    var localeSegment = canonicalLocaleKey(localeKey);
    if (depthToken) localeSegment += '_' + lower(String(depthToken || '')).replace(/\s+/g, '');
    return normalizePageName(regionMeta && regionMeta.regionKey ? regionMeta.regionKey : regionDisplayName, localeSegment, mapName);
  }

  function rewritePageNameWithDepth(page, rawSpec) {
    var spec = String(rawSpec || '').trim();
    if (!spec) return { error: 'Use !dwt --mapMeta set depth <value>.' };

    var mule = getOrCreateMule();
    var knownRegions = loadKnownRegions(mule);
    var current = parsePageName(page.get('name') || '', mule, { allowMissingDepth: true });
    var currentRegion = knownRegions[current.region_key] || null;

    if (spec.indexOf('.') !== -1) {
      var full = parsePageName(spec, mule);
      if (!full.name_pattern_ok || !full.region_valid || !full.locale_valid) {
        return {
          error: 'Full page-name input must resolve to region.locale.mapname or region.locale_depth.mapname.'
        };
      }
      return {
        pageName: buildCanonicalPageName(full.region_name, full.locale_key, full.depth_token, full.name, knownRegions[full.region_key] || null)
      };
    }

    var localeCandidate = parseLocaleSpec(spec, { mule: mule, allowMissingDepth: true, regionMeta: currentRegion });
    if (localeCandidate.locale_key && !localeCandidate.error) {
      if (!current.name_pattern_ok || !currentRegion) {
        return { error: 'The current page must already use a valid unified region/locale page name before you can swap in a locale.' };
      }
      return {
        pageName: buildCanonicalPageName(currentRegion.displayName, localeCandidate.locale_key, localeCandidate.depth_token, current.name, currentRegion)
      };
    }

    if (!current.name_pattern_ok || !currentRegion) {
      return { error: 'The current page must already use a valid unified region/locale page name before depth or elevation can be set.' };
    }

    var currentLocale = parseLocaleSpec(current.raw_locale, { mule: mule, allowMissingDepth: true, regionMeta: currentRegion });

    var parsedDepth = parseDepthSpec(spec, getWeatherUnits(mule));
    if (!parsedDepth.ok) return { error: parsedDepth.error };

    return {
      pageName: buildCanonicalPageName(currentRegion.displayName, currentLocale.locale_key, parsedDepth.canonicalToken, current.name, currentRegion)
    };
  }

  function whisperNamingIssues(meta) {
    try {
      var regionNames = loadedRegionDisplayNames(getOrCreateMule());
      if (!meta.name_pattern_ok) {
        sendChat(
          'dwt',
          '/w gm Map name "' + esc(meta.raw_name || '') + '" does not use '
            + 'region.locale.mapname or region.locale_depth.mapname.'
            + '<br><br>Rename appropriately to enable regional and locale-based weather. '
            + 'Use bare depth values for feet/meters in the current weather units, append mi/km for large-unit input, and prefix with a "+" for elevation.'
            + '<br><br>Case and spaces are ignored; canonical names are lower-case with no spaces.'
        );
        return;
      }
      if (!meta.region_valid) {
        sendChat(
          'dwt',
          '/w gm Region "' + esc(meta.raw_region || '') + '" is not one of the loaded unified region values'
            + (regionNames.length ? ' (' + esc(regionNames.join(', ')) + ')' : '')
            + '.'
        );
        return;
      }
      if (!meta.locale_valid) {
        var localeMsg = meta.depth_error
          ? meta.depth_error
          : 'Locale is not valid for the loaded region. Use one of that region\'s configured locale keys, each with an optional _<depth> or _+<elevation> token.';
        sendChat('dwt', '/w gm ' + esc(localeMsg));
      }
    } catch (e) {}
  }

  function namingWarningFingerprint(meta) {
    meta = meta || emptyMeta();
    return [
      lower(String(meta.raw_name || '')).replace(/\s+/g, ''),
      !!meta.name_pattern_ok,
      !!meta.region_valid,
      !!meta.locale_valid,
      lower(String(meta.depth_error || ''))
    ].join('|');
  }

  function maybeWhisperNamingIssues(pid, meta) {
    if (!pid) return;
    var stateRoot = ensureMapMetaState();
    if (meta && meta.name_pattern_ok && meta.region_valid && meta.locale_valid) {
      delete stateRoot.namingWarn[pid];
      return;
    }
    var fingerprint = namingWarningFingerprint(meta);
    if (stateRoot.namingWarn[pid] === fingerprint) return;
    stateRoot.namingWarn[pid] = fingerprint;
    whisperNamingIssues(meta || {});
  }

  function handleSetDepthCommand(pid, rawSpec) {
    if (!playerIsGM(pid)) {
      return { error: 'Only the gm may set map depth or elevation.', changed: false };
    }

    var page = getActivePageForPlayer(pid) || getDefaultBookmarkPage();
    if (!page) return { error: 'Could not resolve an active page for you.', changed: false };

    var rewrite = rewritePageNameWithDepth(page, rawSpec);
    if (rewrite.error) return { error: rewrite.error, changed: false };

    page.set({ name: rewrite.pageName });
    var meta = collectPageMeta(page);
    storeMeta(meta);
    storeMetaToMule(meta);
    syncWeatherToPage(pid, page.id);
    maybeWhisperNamingIssues(pid, meta);
    return { changed: true };
  }

  function handleMapMetaCommand(args) {
    var pid = args.pid;
    var rawVal = (args.val == null) ? '' : String(args.val);
    var trimmed = rawVal.trim();
    var lowerVal = lower(trimmed);
    var stateRoot = ensureMapMetaState();

    if (!playerIsGM(pid)) {
      return { error: 'Only the gm may capture map metadata.' };
    }

    if (/^set\s+depth\b/i.test(trimmed)) {
      var depthArg = trimmed.replace(/^set\s+depth\b/i, '').trim();
      return handleSetDepthCommand(pid, depthArg);
    }

    if (lowerVal === 'all') {
      stateRoot.flash[pid] = true;
    } else if (!lowerVal || lowerVal === 'active') {
      delete stateRoot.flash[pid];
    } else {
      return {
        error: 'Unrecognized value for --mapMeta: "' + esc(rawVal)
          + '". Use "!dwt --mapMeta", "!dwt --mapMeta all", or "!dwt --mapMeta set depth <value>".'
      };
    }

    var res = captureForPlayer(pid);
    if (res.error) return { error: res.error };
    maybeWhisperNamingIssues(pid, res.meta || {});
    return { changed: true };
  }

  function helpLines() {
    var regions = loadedRegionDisplayNames(getOrCreateMule());
    var locales = loadedLocaleSummaries(getOrCreateMule());
    return [
      'Capture active page map info (truncated):', '!dwt --mapMeta',
      'Capture and show all details (one-shot):', '!dwt --mapMeta all',
      'Set depth or elevation on the current page:', '!dwt --mapMeta set depth 90 | !dwt --mapMeta set depth +100 | !dwt --mapMeta set depth 2mi',
      'Or switch the current page to a locale with optional position:', '!dwt --mapMeta set depth underwater_90 | !dwt --mapMeta set depth coastal_+100',
      'Where data is stored:', 'dwt_mule -> ability "mapMeta" (JSON)',
      'Also stored on mule:', 'currentMap, currentMapID, currentRegion, currentLocale, currentDepth, currentDepthMetric, currentDepthImperial, currentDepthMeters',
      'Naming convention:', 'Pages use region.locale.mapname or region.locale_depth.mapname.',
      'Examples:', 'frozenfar.coastal.iceplains | moonshaes.underwater_90.sunkenhall | swordcoast.underdark_2mi.deeproad | swordcoast.coastal_+100.cliffwatch',
      'Depth tokens:', 'Bare depth values use the current weather units (feet for imperial, meters for metric). Append mi or km to force large units, and prefix with a "+" for elevation. Case and spaces are ignored; canonical names are lower-case with no spaces.',
      'Valid Regions:', regions.length ? regions.join(', ') : 'Load one or more dwt_region.* modules first.',
      'Valid Locales:', locales.length ? locales.join(', ') : 'Load one or more dwt_region.* modules first.'
    ];
  }

  function registerWithCore() {
    try {
      if (!(RT.dwt && !_registered && typeof RT.dwt.registerCommands === 'function')) return;

      RT.dwt.registerCommands({
        mapmeta: {
          access: 'player',
          handler: handleMapMetaCommand
        }
      });

      RT.dwt.addLogCard(1, function (pid) {
        try {
          return renderConfigHTML(pid);
        } catch (e) {
          log('dwt_mapMeta logCard err: ' + e);
          return '';
        }
      });

      RT.dwt.addHelpSection(20, 'Map Information', helpLines);
      RT.dwt.mapMetaSyncActivePage = syncPageMeta;
      if (typeof RT.dwt.refreshHelpHandout === 'function') {
        RT.dwt.refreshHelpHandout(null);
      }

      _registered = true;
    } catch (e2) {
      log('dwt_mapMeta registerWithCore err: ' + e2);
    }
  }

  function mapMetaStartup() {
    ensureMapMetaState();
    captureDefaultPageAtInit();
    mirrorCurrentMetaToMule();
    mirrorVersionToMule();
  }

  function registerStartupHooks() {
    if (_startupRegistered) return;
    _startupRegistered = true;

    RT.dwtQ = RT.dwtQ || [];
    RT.dwtQ.push(function (dwt) {
      try {
        if (dwt && typeof dwt.registerStartup === 'function') {
          dwt.registerStartup(MODULE_KEY, function () {
            mapMetaStartup();
          });
        }
      } catch (e) {
        log('dwt_mapMeta dwtQ err: ' + e);
      }
    });

    try {
      if (RT.dwt && typeof RT.dwt.registerStartup === 'function') {
        RT.dwt.registerStartup(MODULE_KEY, function () {
          mapMetaStartup();
        });
      }
    } catch (e2) {
      log('dwt_mapMeta registerStartup err: ' + e2);
    }
  }

  function init() {
    mapMetaStartup();
    registerWithCore();
    registerStartupHooks();
  }

  on('ready', init);

  return {
    init: init,
    collectPageMeta: collectPageMeta,
    parsePageName: parsePageName,
    syncPageMeta: syncPageMeta
  };
})();

