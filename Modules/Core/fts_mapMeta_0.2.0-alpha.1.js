// name:        fts_mapMeta.js
// version:     0.2.0-alpha.1
// description: Unified map metadata, map point, and route capture for FTS.
// depends:     fts_core >= 0.2.0-alpha.1 (optional but recommended), Roll20 Mod API
// provides:    !fts --mapMeta | !fts --mapMeta all | !fts --mapMeta set depth <value>
//              !fts --mapMeta list routes
//              !fts --mapMeta start route <routeName>
//              !fts --mapMeta set routePoint <pointName>
//              !fts --mapMeta end route
//              !fts --mapMeta goto route <routeName>
//              !fts --mapMeta goto routePoint <routeName (current if omitted)> <index|pointName>
//              !fts --mapMeta prev routePoint
//              !fts --mapMeta next routePoint
//              !fts --mapMeta delete route <routeName>
//              !fts --mapMeta delete routePoint <routeName (current if omitted)> <index|pointName>
//              !fts --mapMeta rename route <oldName> <newName>
//              !fts --mapMeta rename routePoint <oldName> <newName>
//              !fts --mapMeta list locations
//              !fts --mapMeta set location <locationName>
//              !fts --mapMeta goto location <locationName>
//              !fts --mapMeta delete location <locationName>
//              !fts --mapMeta rename location <oldName> <newName>
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

var fts_mapMeta = (function () {
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  var VERSION = '0.2.0-alpha.1';
  var MODULE_KEY = 'mapmeta';
  var MULE_NAME = 'fts_mule';
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
    if (!state.fts) state.fts = {};
    if (!state.fts[STATE_ROOT]) {
      state.fts[STATE_ROOT] = {
        last: null,
        byPage: {},
        flash: {},
        namingWarn: {}
      };
    }
    if (!state.fts[STATE_ROOT].byPage) state.fts[STATE_ROOT].byPage = {};
    if (!state.fts[STATE_ROOT].flash) state.fts[STATE_ROOT].flash = {};
    if (!state.fts[STATE_ROOT].namingWarn) state.fts[STATE_ROOT].namingWarn = {};
    return state.fts[STATE_ROOT];
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c;
    });
  }

  function cssVars() {
    return (RT.fts && typeof RT.fts.cssVars === 'function')
      ? RT.fts.cssVars()
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

  function commandKey(s) {
    return lower(s);
  }

  function splitMapMetaCommandArgs(s) {
    s = String(s || '').trim();
    return s ? s.split(/\s+/g) : [];
  }

  function joinMapMetaCommandRest(parts, startIdx) {
    return parts.slice(startIdx).join(' ').trim();
  }

  function readMapMetaCommandTarget(parts, index) {
    var first = commandKey(parts[index] || '');
    if (first === 'routepoint') return { target:'routepoint', next:index + 1 };
    if (first === 'routes') return { target:'routes', next:index + 1 };
    if (first === 'locations') return { target:'locations', next:index + 1 };
    if (first === 'route' || first === 'location' || first === 'depth') return { target:first, next:index + 1 };
    return { target:first, next:index + (first ? 1 : 0) };
  }

  function parseMapRecordsCommandSpec(expr) {
    var parts = splitMapMetaCommandArgs(expr);
    if (!parts.length) return null;
    var targetInfo = readMapMetaCommandTarget(parts, 1);
    return {
      parts: parts,
      action: commandKey(parts[0] || ''),
      target: targetInfo.target,
      valueStart: targetInfo.next
    };
  }

  function isMapRecordsCommandSpec(spec) {
    if (!spec || !spec.action) return false;
    var recordActions = { list:1, start:1, end:1, goto:1, prev:1, next:1, delete:1, rename:1 };
    if (recordActions[spec.action]) return true;
    return spec.action === 'set' && (spec.target === 'routepoint' || spec.target === 'location');
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
      if (RT.fts && typeof RT.fts.getEffectivePageId === 'function') {
        var effectiveId = RT.fts.getEffectivePageId(pid);
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
      if (RT.fts && typeof RT.fts.ensureMule === 'function') {
        return RT.fts.ensureMule();
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
    var score = (parsed.schema === 'fts.regions.root.v1') ? 50 : 0;
    var regions = parsed.regions;
    if (!regions || typeof regions !== 'object' || Array.isArray(regions)) return score;
    var keys = Object.keys(regions);
    score += keys.length * 5;
    for (var i = 0; i < keys.length; i++) {
      var payload = regions[keys[i]];
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      if (payload.schema === 'fts.region.v4') score += 200;
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
    if (parsed.meta && parsed.meta.rootSchema === 'fts.weather.root.v2') score += 200;
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

  function removeAbility(character, name) {
    if (!character) return 0;
    var removed = 0;
    var abilities = namedAbilities(character, name);
    for (var i = 0; i < abilities.length; i++) {
      try {
        abilities[i].remove();
        removed += 1;
      } catch (e) {}
    }
    return removed;
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
    if (!raw) return { schema: 'fts.regions.root.v1', regions: {} };
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {};
      if (!parsed.regions || typeof parsed.regions !== 'object' || Array.isArray(parsed.regions)) {
        parsed.regions = {};
      }
      if (parsed.schema !== 'fts.regions.root.v1') parsed.schema = 'fts.regions.root.v1';
      return parsed;
    } catch (e) {
      return { schema: 'fts.regions.root.v1', regions: {} };
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
      page_scope: '',
      page_scope_label: '',
      default_locale_key: '',
      default_locale_name: '',
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

  function pageScopeLabel(scope) {
    if (scope === 'region') return 'Region Overview';
    if (scope === 'global') return 'Global Overview';
    return '';
  }

  function pageNamePatternAccepted(meta) {
    meta = meta || emptyPageNameMeta('');
    if (!meta.name_pattern_ok) return false;
    if (meta.page_scope === 'global') return true;
    if (meta.page_scope === 'region') return !!meta.region_valid;
    return !!meta.region_valid && !!meta.locale_valid;
  }

  function defaultLocaleMetaForRegion(regionMeta) {
    var key = canonicalLocaleKey(regionMeta && regionMeta.defaultLocale ? regionMeta.defaultLocale : '');
    var def = localeDefinitionForKey(regionMeta || null, key);
    return {
      key: def ? canonicalLocaleKey(def.key) : key,
      label: def ? String(def.label || '').trim() : ''
    };
  }

  function parsePageName(rawName, mule, opts) {
    var meta = emptyPageNameMeta(rawName);
    var parts = String(rawName || '').split('.');
    var knownRegions = loadKnownRegions(mule || getOrCreateMule());

    if (parts.length === 2) {
      var rawLead = String(parts[0] || '').trim();
      var rawTail = lower(String(parts[1] || '')).replace(/\s+/g, '').trim();
      if (!rawLead || !rawTail) return meta;

      if (rawTail === 'region') {
        var regionKey2 = canonicalRegionKey(rawLead);
        var regionMeta2 = knownRegions[regionKey2] || null;
        var defaultLocale = defaultLocaleMetaForRegion(regionMeta2);

        meta.name_pattern_ok = true;
        meta.page_scope = 'region';
        meta.page_scope_label = pageScopeLabel('region');
        meta.raw_region = rawLead;
        meta.region_key = regionKey2;
        meta.region_name = regionMeta2 ? regionMeta2.displayName : rawLead;
        meta.region_valid = !!regionMeta2;
        meta.default_locale_key = defaultLocale.key;
        meta.default_locale_name = defaultLocale.label;
        meta.name = regionMeta2 ? regionMeta2.displayName : rawLead;
        return meta;
      }

      if (rawTail === 'global') {
        meta.name_pattern_ok = true;
        meta.page_scope = 'global';
        meta.page_scope_label = pageScopeLabel('global');
        meta.name = rawLead;
        return meta;
      }

      return meta;
    }

    if (parts.length < 3) return meta;

    var rawRegion = String(parts[0] || '').trim();
    var rawLocale = String(parts[1] || '').trim();
    var rawMap = parts.slice(2).join('.').trim();
    if (!rawRegion || !rawLocale || !rawMap) return meta;

    meta.name_pattern_ok = true;
    meta.page_scope = 'locale';
    meta.page_scope_label = pageScopeLabel('locale');
    meta.raw_region = rawRegion;
    meta.raw_locale = rawLocale;
    meta.name = rawMap;

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
      page_scope: parsed.page_scope,
      page_scope_label: parsed.page_scope_label,
      default_locale_key: parsed.default_locale_key,
      default_locale_name: parsed.default_locale_name,
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
      page_scope: '',
      page_scope_label: '',
      default_locale_key: '',
      default_locale_name: '',
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

  function readMapMetaPayloadFromMule(mule) {
    var parsed = safeParseJSON(getAbilityAction(mule, 'mapMeta'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  }

  function storeMetaToMule(meta) {
    var mule = getOrCreateMule();
    if (!mule) return;

    var payload = meta || emptyMeta();
    var currentMapMeta = readMapMetaPayloadFromMule(mule);

    if (currentMapMeta && currentMapMeta.geo && typeof currentMapMeta.geo === 'object' && !Array.isArray(currentMapMeta.geo)) {
      payload.geo = currentMapMeta.geo;
    }

    upsertAbility(mule, 'mapMeta', JSON.stringify(payload));
    syncFlatMetaAttributes(mule, payload);
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
        + (v.literal ? v.literal('!fts --mapMeta') : '!fts --mapMeta')
        + '.</div></div>';
      return html;
    }

    html += '<div><b>' + esc(meta.name || '(unnamed map)') + '</b></div>';

    var scaleVal = parseFloat(meta.scale_number);
    var scaleUnits = meta.scale_units || '';
    var gridType = lower(meta.grid_type || '');
    var gridLabel = meta.grid_type || '';
    if (gridType === 'hexr' || gridType === 'hexv' || gridType === 'hex') gridLabel = 'hex';
    var pieces = [];
    if (meta.page_scope === 'locale' && meta.region_valid && meta.locale_valid && (meta.locale_name || meta.region_name)) {
      if (meta.locale_name) pieces.push(esc(meta.locale_name));
      if (meta.region_name) pieces.push(esc(meta.region_name));
    } else if (meta.page_scope === 'region') {
      pieces.push('Region Overview');
      if (meta.region_name || meta.raw_region) pieces.push(esc(meta.region_name || meta.raw_region));
    } else if (meta.page_scope === 'global') {
      pieces.push('Global Overview');
    }
    if (pieces.length) {
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
      var actionAttrs = RT.fts.actionLinkAttrs('!fts --mapMeta all');
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
    notifySurfaceRefresh(page.id);
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
    notifySurfaceRefresh(page.id);
    return { meta: meta, page: page };
  }

  function captureDefaultPageAtInit() {
    try {
      var page = getDefaultBookmarkPage();
      if (!page) return;
      var meta = collectPageMeta(page);
      storeMeta(meta);
      storeMetaToMule(meta);
      notifySurfaceRefresh(page.id);
    } catch (e) {
      log('fts_mapMeta captureDefaultPageAtInit err: ' + e);
    }
  }

  function syncWeatherToPage(pid, pageId) {
    try {
      if (RT.fts && typeof RT.fts.weatherVerifySyncActivePage === 'function') {
        RT.fts.weatherVerifySyncActivePage(pid || 'API', { silent: true, pageId: pageId });
      }
    } catch (e) {}
  }

  function notifySurfaceRefresh(pageId) {
    try {
      if (RT.fts_atlas && typeof RT.fts_atlas.refresh === 'function') {
        RT.fts_atlas.refresh('', pageId || '');
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
    if (!spec) return { error: 'Use !fts --mapMeta set depth <value>.' };

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

    if (current.page_scope !== 'locale') {
      return {
        error: 'Overview pages do not have a current locale. Use a locale token such as coastal or underwater_90, or provide a full locale page name.'
      };
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
          'fts',
          '/w gm Map name "' + esc(meta.raw_name || '') + '" does not use '
            + 'region.locale.mapname, region.locale_depth.mapname, region.region, or mapname.global.'
            + '<br><br>Rename appropriately to enable regional, overview, and global mapping support. '
            + 'Use bare depth values for feet/meters in the current weather units, append mi/km for large-unit input, and prefix with a "+" for elevation.'
            + '<br><br>Case and spaces are ignored; canonical names are lower-case with no spaces.'
        );
        return;
      }
      if (!meta.region_valid) {
        sendChat(
          'fts',
          '/w gm Region "' + esc(meta.raw_region || '') + '" is not one of the loaded unified region values'
            + (regionNames.length ? ' (' + esc(regionNames.join(', ')) + ')' : '')
            + '.'
        );
        return;
      }
      if (meta.page_scope === 'global' || meta.page_scope === 'region') {
        return;
      }
      if (!meta.locale_valid) {
        var localeMsg = meta.depth_error
          ? meta.depth_error
          : 'Locale is not valid for the loaded region. Use one of that region\'s configured locale keys, each with an optional _<depth> or _+<elevation> token.';
        sendChat('fts', '/w gm ' + esc(localeMsg));
      }
    } catch (e) {}
  }

  function namingWarningFingerprint(meta) {
    meta = meta || emptyMeta();
    return [
      lower(String(meta.raw_name || '')).replace(/\s+/g, ''),
      lower(String(meta.page_scope || '')),
      !!meta.name_pattern_ok,
      !!meta.region_valid,
      !!meta.locale_valid,
      lower(String(meta.depth_error || ''))
    ].join('|');
  }

  function maybeWhisperNamingIssues(pid, meta) {
    if (!pid) return;
    var stateRoot = ensureMapMetaState();
    if (meta && pageNamePatternAccepted(meta)) {
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
      return { error: 'Only the GM may set map depth or elevation.', changed: false };
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
      return { error: 'Only the GM may capture map metadata.' };
    }

    var commandSpec = parseMapRecordsCommandSpec(trimmed);
    if (commandSpec && commandSpec.action === 'set' && commandSpec.target === 'depth') {
      var depthArg = joinMapMetaCommandRest(commandSpec.parts, commandSpec.valueStart);
      return handleSetDepthCommand(pid, depthArg);
    }

    if (commandSpec && isMapRecordsCommandSpec(commandSpec)) {
      if (typeof mapMetaRecordsSection === 'undefined' || !mapMetaRecordsSection || typeof mapMetaRecordsSection.handleCommand !== 'function') {
        return { error: 'MapMeta route and location tools are not available.' };
      }
      return mapMetaRecordsSection.handleCommand({
        pid: pid,
        val: trimmed
      });
    }

    if (lowerVal === 'all') {
      stateRoot.flash[pid] = true;
    } else if (!lowerVal || lowerVal === 'active') {
      delete stateRoot.flash[pid];
    } else {
      return {
        error: 'Unrecognized value for --mapMeta: "' + esc(rawVal)
          + '". Use "!fts --mapMeta", "!fts --mapMeta all", or "!fts --mapMeta set depth <value>".'
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
      'Capture active page map info (truncated):', '!fts --mapMeta',
      'Capture and show all details (one-shot):', '!fts --mapMeta all',
      'Set depth or elevation on the current page:', '!fts --mapMeta set depth 90 | !fts --mapMeta set depth +100 | !fts --mapMeta set depth 2mi',
      'Or switch the current page to a locale with optional position:', '!fts --mapMeta set depth underwater_90 | !fts --mapMeta set depth coastal_+100',
      'Where data is stored:', 'fts_mule -> Character Macro / ability "mapMeta" (JSON)',
      'Also stored on mule:', 'currentMap, currentMapID, currentRegion, currentLocale, currentDepth, currentDepthMetric, currentDepthImperial, currentDepthMeters',
      'Naming convention:', 'Pages use region.locale.mapname, region.locale_depth.mapname, region.region, or mapname.global.',
      'Examples:', 'frozenfar.coastal.iceplains | moonshaes.underwater_90.sunkenhall | swordcoast.underdark_2mi.deeproad | swordcoast.coastal_+100.cliffwatch | landsofintrigue.region | faerun.global',
      'Depth tokens:', 'Bare depth values use the current weather units (feet for imperial, meters for metric). Append mi or km to force large units, and prefix with a "+" for elevation. Case and spaces are ignored; canonical names are lower-case with no spaces.',
      'Valid Regions:', regions.length ? regions.join(', ') : 'Load one or more fts_regionRegionName modules first.',
      'Valid Locales:', locales.length ? locales.join(', ') : 'Load one or more fts_regionRegionName modules first.',
      '',
      'Map routes:', '',
      '!fts --mapMeta list routes',
      '!fts --mapMeta start route <routeName>',
      '!fts --mapMeta set routePoint <pointName>',
      '!fts --mapMeta end route',
      '!fts --mapMeta goto route <routeName>',
      '!fts --mapMeta goto routePoint <routeName (current if omitted)> <index|pointName>',
      '!fts --mapMeta prev routePoint',
      '!fts --mapMeta next routePoint',
      '!fts --mapMeta delete route <routeName>',
      '!fts --mapMeta delete routePoint <routeName (current if omitted)> <index|pointName>',
      '!fts --mapMeta rename route <oldName> <newName>',
      '!fts --mapMeta rename routePoint <oldName> <newName>',
      '',
      'Map locations:', '',
      '!fts --mapMeta list locations',
      '!fts --mapMeta set location <locationName>',
      '!fts --mapMeta goto location <locationName>',
      '!fts --mapMeta delete location <locationName>',
      '!fts --mapMeta rename location <oldName> <newName>'
    ];
  }

  function registerWithCore() {
    try {
      if (!(RT.fts && !_registered && typeof RT.fts.registerCommands === 'function')) return;

      RT.fts.registerCommands({
        mapmeta: {
          access: 'gm',
          handler: handleMapMetaCommand
        }
      });

      RT.fts.addLogCard(1, function (pid) {
        try {
          return renderConfigHTML(pid);
        } catch (e) {
          log('fts_mapMeta logCard err: ' + e);
          return '';
        }
      });

      RT.fts.addLogCard(25, function (pid) {
        try {
          return (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.renderConfigHTML === 'function')
            ? mapMetaRecordsSection.renderConfigHTML(pid)
            : '';
        } catch (e) {
          log('fts_mapMeta route/location logCard err: ' + e);
          return '';
        }
      });

      RT.fts.addHelpSection(20, 'Map Information', helpLines);
      RT.fts.mapMetaSyncActivePage = syncPageMeta;
      if (typeof RT.fts.refreshHelpHandout === 'function') {
        RT.fts.refreshHelpHandout(null);
      }

      _registered = true;
    } catch (e2) {
      log('fts_mapMeta registerWithCore err: ' + e2);
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

    try {
      if (RT.fts && typeof RT.fts.registerStartup === 'function') {
        RT.fts.registerStartup(MODULE_KEY, mapMetaStartup);
        _startupRegistered = true;
      }
    } catch (e2) {
      log('fts_mapMeta registerStartup err: ' + e2);
    }
  }

  function init() {
    mapMetaStartup();
    if (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.init === 'function') {
      mapMetaRecordsSection.init();
    }
    registerWithCore();
    registerStartupHooks();
  }

  on('ready', init);

  return {
    init: init,
    collectPageMeta: collectPageMeta,
    parsePageName: parsePageName,
    syncPageMeta: syncPageMeta,
    refreshActiveMapRecords: function (opts) {
      if (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.refreshActiveMapRecords === 'function') {
        return mapMetaRecordsSection.refreshActiveMapRecords(opts || {});
      }
    },
    loadMapRecordsFromMule: function () {
      if (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.loadMapRecordsFromMule === 'function') {
        return mapMetaRecordsSection.loadMapRecordsFromMule();
      }
    },
    pruneInvalidMapRecords: function () {
      if (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.pruneInvalidMapRecords === 'function') {
        return mapMetaRecordsSection.pruneInvalidMapRecords();
      }
    },
    syncMapRecordsToMule: function () {
      if (typeof mapMetaRecordsSection !== 'undefined' && mapMetaRecordsSection && typeof mapMetaRecordsSection.syncMapRecordsToMule === 'function') {
        return mapMetaRecordsSection.syncMapRecordsToMule();
      }
    }
  };
})();

try {
  var _ftsMapMetaRoot = (typeof globalThis !== 'undefined') ? globalThis
                      : (typeof window !== 'undefined')     ? window
                      : (typeof self !== 'undefined')       ? self
                      : (typeof global !== 'undefined')     ? global
                      : this;
  _ftsMapMetaRoot.RT = _ftsMapMetaRoot.RT || {};
  _ftsMapMetaRoot.RT.fts_mapMeta = fts_mapMeta;
  _ftsMapMetaRoot.fts_mapMeta = fts_mapMeta;
} catch (e) {}

/* ========== Map Records Section (map points, routes, active-map handout) ========== */
var mapMetaRecordsSection = (function () {
  'use strict';

  /* ========== Intro / Root ========== */

  var RT = (typeof globalThis!=='undefined') ? globalThis
         : (typeof window!=='undefined')     ? window
         : (typeof self!=='undefined')       ? self
         : (typeof global!=='undefined')     ? global
         : this;

  var VERSION    = '0.2.0-alpha.1';
  var STATE_ROOT = 'mapRecords';
  var FTS_MULE   = 'fts_mule';
  var MAP_RECORDS_HANDOUT_NAME = 'Map Locations and Routes';

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
    return (RT.fts && typeof RT.fts.cssVars === 'function')
      ? RT.fts.cssVars()
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

  function ensureMapRecordsState(){
    if(!state.fts){ state.fts = {}; }
    if(!state.fts[STATE_ROOT]){
      state.fts[STATE_ROOT] = {
        routes: {},          // mapKey → { routeKey → route }
        points: {},          // mapKey → { pointKey → point }
        currentRoute: {},    // pid → { mapKey, routeKey }
        lastSelection: {}    // pid → [{_id,_type}]
      };
    }else{
      var S = state.fts[STATE_ROOT];
      if(!S.routes){ S.routes = {}; }
      if(!S.points){ S.points = {}; }
      if(!S.currentRoute){ S.currentRoute = {}; }
      if(!S.lastSelection){ S.lastSelection = {}; }
    }
    return state.fts[STATE_ROOT];
  }

  function normalizeKey(name){
    return String(name||'').trim().toLowerCase();
  }

  function normalizeMapKeyComponent(s){
    // Use the same normalizer as other FTS identifiers (calendar, etc.).
    var norm = (RT.fts && RT.fts.normalizeName)
      ? RT.fts.normalizeName
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
      return normalizeMapKeyComponent(meta.name);
    }
    if(meta.raw_name){
      return normalizeMapKeyComponent(meta.raw_name);
    }
    if(meta.page_name){
      return normalizeMapKeyComponent(meta.page_name);
    }
    return 'map'+String(meta.id||'0');
  }

  function mapKeyFromMeta(meta){
    // Map record state keys route and point data directly to the canonical page name.
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
    var score = (parsed.schema === 'fts.regions.root.v1') ? 50 : 0;
    var regions = parsed.regions;
    if(!regions || typeof regions !== 'object' || Array.isArray(regions)) return score;
    var keys = Object.keys(regions);
    score += keys.length * 5;
    for(var i=0;i<keys.length;i++){
      var payload = regions[keys[i]];
      if(!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      if(payload.schema === 'fts.region.v4') score += 200;
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
    if(parsed.meta && parsed.meta.rootSchema === 'fts.weather.root.v2') score += 200;
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
      if(RT.fts && typeof RT.fts.ensureMule === 'function'){
        return RT.fts.ensureMule();
      }
    }catch(e){}

    var matches = findObjs({_type:'character', name:FTS_MULE}) || [];
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
        name: FTS_MULE,
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

  function syncMapRecordsRootToMule(){
    var mule = getOrCreateMule();
    if(!mule) return;
    var S = ensureMapRecordsState();
    upsertAbility(mule, 'mapRecords', JSON.stringify({
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
    mergeVersionEntry(mule, 'mapRecords', VERSION);
  }

  function notifySurfaceRefresh(){
    try{
      if(RT.fts_atlas && typeof RT.fts_atlas.refresh === 'function'){
        RT.fts_atlas.refresh('', '');
      }
    }catch(e){}
  }


  /* ========== Routes & Locations Handout ========== */

  function mapRecordsHandout(){
    return findObjs({_type:'handout', name:MAP_RECORDS_HANDOUT_NAME})[0] || null;
  }

  function ensureMapRecordsHandout(meta){
    var h = mapRecordsHandout();
    if(!h){
      // Viewable by all players, editable only by the GM.
      h = createObj('handout', {
        name: MAP_RECORDS_HANDOUT_NAME,
        inplayerjournals: 'all',
        controlledby: ''
      });
    }
    try{
      h.set('notes', buildMapRecordsHandoutHTML(meta));
    }catch(e){
      log('mapMetaRecordsSection ensureMapRecordsHandout err: '+e);
    }
    return h;
  }

  function buildMapRecordsHandoutHTML(meta){
    var v   = cssVars();
    var S   = ensureMapRecordsState();
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
        var href  = esc('!fts --mapMeta goto location '+label);
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

        var baseHref = esc('!fts --mapMeta goto route '+rLabel);

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
            var dotHref = esc('!fts --mapMeta goto route '+rLabel+' '+idx);

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
      log('mapMetaRecordsSection readMapMetaFromMule JSON error: '+e);
      return null;
    }
  }

  /* ========== Token & Coordinate Helpers ========== */

  function getLastSelectionForPlayer(pid){
    var S = ensureMapRecordsState();
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

  function buildMapRecordPoint(token, meta, label){
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
    var S    = ensureMapRecordsState();
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

    notifySurfaceRefresh();
  }

  function syncPointsToMule(){
    var S    = ensureMapRecordsState();
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

    notifySurfaceRefresh();
  }

  function loadRoutesFromMule(){
    var S    = ensureMapRecordsState();
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
    var S    = ensureMapRecordsState();
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

  function pruneInvalidMapRecordEntries(){
    var S = ensureMapRecordsState();
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
      sendChat('fts','/w gm Removed '+removedRoutes+' orphan route(s) and '+removedPoints+' orphan map point(s) whose maps no longer exist.');
    }
  }

  function cleanMuleMapRecordAbilitiesOnInit(){
    var S    = ensureMapRecordsState();
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
      sendChat('fts','/w gm Cleaned '+removed+' obsolete mapRoutes/mapPoints entries from fts_mule.');
    }

    // Re-sync from state back to mule
    syncRoutesToMule();
    syncPointsToMule();
  }

  function refreshMapRecordsForActivePage(opts){
    // Called on sandbox init and when the party ribbon (active page) changes.
    // If mapMeta has been captured for the current ribbon page, we prune invalid
    // map records, sync mule state, and rebuild the handout for that page.
    opts = opts || {};
    try{
      if('undefined' === typeof Campaign){ return; }
      var c = Campaign();
      if(!c){ return; }
      var targetPageId = String(opts.pageId || c.get('playerpageid') || '');
      if(!targetPageId){ return; }

      var meta = readMapMetaFromMule();
      if(!meta || !meta.id || String(meta.id || '') !== targetPageId){
        // Either no mapMeta yet, or it was captured for a different page.
        // In either case we fail quietly; GM can run --mapMeta all to refresh.
        return;
      }

      pruneInvalidMapRecordEntries();
      cleanMuleMapRecordAbilitiesOnInit();
      ensureMapRecordsHandout(meta);
      notifySurfaceRefresh();

    }catch(e){
      log('mapMetaRecordsSection refreshMapRecordsForActivePage err: '+e);
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
    var S     = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may start map routes.' };
    }
    if(!raw){
      return { error:'Route name is required. Use !fts --mapMeta start route <routeName>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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
      return { error:'Selected token is not on the page captured by mapMeta. Run "!fts --mapMeta all" on this page first.' };
    }

    var got = getOrCreateRoute(S, mapKey, raw, pid, meta, token);
    if(got.error){
      return { error:got.error };
    }

    var route = got.route;
    var key   = got.key;

    // First point at start
    var point = buildMapRecordPoint(token, meta, 'Start');
    if(point){
      addPointToRoute(route, point);
    }

    S.currentRoute[pid] = { mapKey: mapKey, routeKey: key };
    syncRoutesToMule();

    sendChat('fts','/w gm Started route "'+esc(route.name)+'" on map "'+esc(mapKey)+'" with 1 point.');
    return { changed:false };
  }

  function handleSetRoutePoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S     = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may set map route points.' };
    }

    var active = S.currentRoute[pid];
    if(!active || !active.routeKey || !active.mapKey){
      return { error:'You have no active route. Use "!fts --mapMeta start route <routeName>" first.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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
      return { error:'Selected token is not on the page captured by mapMeta. Run "!fts --mapMeta all" on this page first.' };
    }

    var idx = route.points.length+1;
    var pointLabel = label || ('Point '+idx);
    var point = buildMapRecordPoint(token, meta, pointLabel);
    if(!point){
      return { error:'Could not compute map coordinates for the selected token.' };
    }

    addPointToRoute(route, point);
    syncRoutesToMule();

    sendChat('fts','/w gm Added route point "'+esc(pointLabel)+'" to route "'+esc(route.name)+'" on "'+esc(mapKey)+'" (total '+route.points.length+' points).');
    return { changed:false };
  }

  function handleEndRoute(args){
    var pid = args.pid;
    var S   = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may end map routes.' };
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

    sendChat('fts','/w gm Ended route "'+esc(route.name)+'" on "'+esc(active.mapKey)+'" ('+route.points.length+' points).');
    return { changed:false };
  }

  function handleListRoutes(args){
    var pid = args.pid;
    var S   = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may list map routes.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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
        html += '<div><b>'+esc(r.name)+'</b>'+esc(activeText)+' - '+r.points.length+' points</div>';
      }
      html += '</div>';
    }

    html += '<div style="margin-top:6px;font-size:10px;color:#AAA;">'
          + 'Commands: !fts --mapMeta start route &lt;name&gt;, !fts --mapMeta set routePoint [name], !fts --mapMeta end route, !fts --mapMeta delete route &lt;name&gt;'
          + '</div>';
    html += '</div>';

    sendChat('fts','/w gm '+html);
    return { changed:false };
  }

  function handleDeleteRoute(args){
    var pid  = args.pid;
    var name = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S    = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may delete map routes.' };
    }
    if(!name){
      return { error:'Route name is required. Use !fts --mapMeta delete route <routeName>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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
    sendChat('fts','/w gm Deleted route "'+esc(r.name)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  /* ========== Map Points Handlers ========== */

  function handleSetMapPoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var silent = !!(args && args.silent);
    var S     = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may set map locations.' };
    }
    if(!label){
      return { error:'A location name is required. Use !fts --mapMeta set location <locationName>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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
      return { error:'Selected token is not on the page captured by mapMeta. Run "!fts --mapMeta all" on this page first.' };
    }

    var pointData = buildMapRecordPoint(token, meta, label);
    if(!pointData){
      return { error:'Could not compute map coordinates for the selected token.' };
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

    if(!silent){
      sendChat('fts','/w gm Stored map point "'+esc(label)+'" on "'+esc(mapKey)+'".');
    }
    return { changed:false };
  }

  function handleDelMapPoint(args){
    var pid   = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();
    var S     = ensureMapRecordsState();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may delete map locations.' };
    }
    if(!label){
      return { error:'Location name is required. Use !fts --mapMeta delete location <locationName>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
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

    sendChat('fts','/w gm Deleted map point "'+esc(label)+'" from "'+esc(mapKey)+'".');
    return { changed:false };
  }


  /* ========== Map Navigation & Rename Handlers ========== */

  function handleMapGotoPoint(args){
    var pid = args.pid;
    var label = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may use map-location navigation.' };
    }
    if(!label){
      return { error:'Usage: !fts --mapMeta goto location <location name>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
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
      log('mapMetaRecordsSection mapGotoPoint sendPing err: '+e);
    }

    // No GM whisper here; map recenters silently.
    return { changed:false };
  }

  function handleMapGotoRoute(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may use map-route navigation.' };
    }
    if(!raw){
      return { error:'Usage: !fts --mapMeta goto route <route name>.' };
    }

    // Support optional index selection for direct point jumps (used by route bullets).
    // Accepted form:
    //   "!fts --mapMeta goto route The Old Road 2"
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
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
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
      log('mapMetaRecordsSection mapGotoRoute sendPing err: '+e);
    }

    // No GM whisper here; map recenters silently.
    return { changed:false };
  }


  function stepRouteForGM(pid, name, delta){
    if(!playerIsGM(pid)){
      return { error:'Only the GM may step along routes.' };
    }
    name = String(name||'').trim();
    if(!name){
      return { error:'Usage: !fts --mapMeta prev routePoint <route name> or !fts --mapMeta next routePoint <route name>.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
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
      log('mapMetaRecordsSection stepRouteForGM sendPing err: '+e);
    }

    // No GM whisper here; stepping is silent.
    return { changed:false };
  }

  function handleRenMapPoint(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may rename map locations.' };
    }
    if(!raw){
      return { error:'Usage: !fts --mapMeta rename location <currentName|selected> <newName>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !fts --mapMeta rename location <currentName|selected> <newName>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New location name cannot be empty.' };
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
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
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

    sendChat('fts','/w gm Renamed map point "'+esc(oldName)+'" to "'+esc(newName)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  function handleRenRoute(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may rename map routes.' };
    }
    if(!raw){
      return { error:'Usage: !fts --mapMeta rename route <currentName> <newName>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !fts --mapMeta rename route <currentName> <newName>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New route name cannot be empty.' };
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
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

    sendChat('fts','/w gm Renamed route "'+esc(oldName)+'" to "'+esc(newName)+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }

  function handleRenRoutePoint(args){
    var pid = args.pid;
    var raw = (args.val===undefined || args.val===null) ? '' : String(args.val).trim();

    if(!playerIsGM(pid)){
      return { error:'Only the GM may rename map route points.' };
    }
    if(!raw){
      return { error:'Usage: !fts --mapMeta rename routePoint <currentPointName|selected> <newName>.' };
    }

    var parts = raw.split(/\s+/);
    if(parts.length < 2){
      return { error:'Usage: !fts --mapMeta rename routePoint <currentPointName|selected> <newName>.' };
    }

    var currentName = parts[0];
    var newName     = parts.slice(1).join(' ').trim();

    if(!newName){
      return { error:'New route point name cannot be empty.' };
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
      return { error:'No map metadata found. Use "!fts --mapMeta all" first.' };
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return { error:'Unable to derive a map key from the current page name.' };
    }

    var S      = ensureMapRecordsState();
    var cur    = S.currentRoute[pid];

    if(!cur || cur.mapKey !== mapKey){
      return { error:'No active route for this map. Use !fts --mapMeta start route <routeName> first before renaming a route point.' };
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

    sendChat('fts','/w gm Renamed route point "'+esc(oldLabel)+'" to "'+esc(newName)+'" in route "'+esc(route.name||'')+'" on "'+esc(mapKey)+'".');
    return { changed:false };
  }



  /* ========== Standardized Map Records Command Surface ========== */
  /* !fts --mapMeta <action> <target> <value...> */

  function _mapRecordsError(msg){
    return { error: String(msg||'Map records command error.') };
  }

  function _splitArgs(s){
    s = String(s||'').trim();
    if(!s) return [];
    return s.split(/\s+/);
  }

  function _joinRest(parts, startIdx){
    return parts.slice(startIdx).join(' ').trim();
  }

  function _commandKey(s){
    return String(s || '').toLowerCase();
  }

  function _readCommandTarget(parts, index){
    var first = _commandKey(parts[index] || '');
    if(first === 'routepoint') return { target:'routepoint', next:index + 1 };
    if(first === 'routes') return { target:'routes', next:index + 1 };
    if(first === 'locations') return { target:'locations', next:index + 1 };
    if(first === 'route' || first === 'location' || first === 'depth') return { target:first, next:index + 1 };
    return { target:first, next:index + (first ? 1 : 0) };
  }

  function parseMapRecordsCommandSpec(expr){
    var parts = _splitArgs(expr);
    if(!parts.length) return null;
    var targetInfo = _readCommandTarget(parts, 1);
    return {
      parts: parts,
      action: _commandKey(parts[0] || ''),
      target: targetInfo.target,
      valueStart: targetInfo.next
    };
  }

  function extractMapMetaCommandTail(content){
    content = String(content || '').trim();
    if(!/^!fts(\b|$)/i.test(content)) return null;
    var segments = content.split(/\s+--/);
    for(var i=1;i<segments.length;i++){
      var tokens = _splitArgs(segments[i]);
      if(_commandKey(tokens[0] || '') === 'mapmeta'){
        return tokens.slice(1).join(' ').trim();
      }
    }
    return null;
  }

  function _mapRecordsListLocations(args){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _mapRecordsError('Only the GM may use map location listing.');
    }
    var meta = readMapMetaFromMule();
    if(!meta){
      return _mapRecordsError('No map metadata found. Use "!fts --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta) || '(unknown)';
    var S = ensureMapRecordsState();
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
    sendChat('fts','/w gm '+html);
    return { changed:false };
  }

  function _mapRecordsDeleteRoutePoint(args, routeNameOpt, selector){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _mapRecordsError('Only the GM may delete route points.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _mapRecordsError('No map metadata found. Use "!fts --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _mapRecordsError('Unable to derive a map key from the current page name.');
    }

    var S = ensureMapRecordsState();
    var routeName = (routeNameOpt || '').trim();
    var routeKey  = null;
    var route     = null;

    // If route omitted, use current route for this GM on this map.
    if(!routeName){
      var cur = S.currentRoute[pid];
      if(cur && cur.mapKey === mapKey && cur.routeKey){
        routeKey = cur.routeKey;
      }else{
        return _mapRecordsError('No current route is set. Use "!fts --mapMeta goto route <routeName>" or start a route.');
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
        return _mapRecordsError('Route "'+routeName+'" was not found on this map.');
      }
    }

    route = routesForMap[routeKey];
    if(!route || !route.points || !route.points.length){
      return _mapRecordsError('Route has no points to delete.');
    }

    selector = String(selector||'').trim();
    if(!selector){
      return _mapRecordsError('You must specify an index or point name to delete.');
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
      return _mapRecordsError('routePoint selector "'+selector+'" did not match any point.');
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
    sendChat('fts','/w gm Deleted route point "'+esc(removedLabel)+'" from route "'+esc(route.name||'')+'".');
    return { changed:false };
  }

  function _mapRecordsGotoRoutePoint(args, routeNameOpt, selector){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _mapRecordsError('Only the GM may use map-route navigation.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _mapRecordsError('No map metadata found. Use "!fts --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _mapRecordsError('Unable to derive a map key from the current page name.');
    }

    var S = ensureMapRecordsState();
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
        return _mapRecordsError('Route "'+routeName+'" was not found on this map.');
      }
    }else{
      var cur = S.currentRoute[pid];
      if(cur && cur.mapKey === mapKey && cur.routeKey){
        routeKey = cur.routeKey;
        route = routesForMap[routeKey];
      }
      if(!route){
        return _mapRecordsError('No current route is set. Use "!fts --mapMeta goto route <routeName>" first.');
      }
    }

    if(!route.points || !route.points.length){
      return _mapRecordsError('Route "'+(route.name||routeKey)+'" has no points defined yet.');
    }

    selector = String(selector||'').trim();
    if(!selector){
      return _mapRecordsError('You must specify an index or point name.');
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
      return _mapRecordsError('routePoint selector "'+selector+'" did not match any point.');
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
      log('mapMetaRecordsSection gotoRoutePoint sendPing err: '+e);
    }

    return { changed:false };
  }

  function _mapRecordsPrevNextRoutePoint(args, delta){
    var pid = args.pid;
    if(!playerIsGM(pid)){
      return _mapRecordsError('Only the GM may step along routes.');
    }

    var meta = readMapMetaFromMule();
    if(!meta){
      return _mapRecordsError('No map metadata found. Use "!fts --mapMeta all" first.');
    }
    var mapKey = mapKeyFromMeta(meta);
    if(!mapKey){
      return _mapRecordsError('Unable to derive a map key from the current page name.');
    }

    var S = ensureMapRecordsState();
    var cur = S.currentRoute[pid];
    if(!cur || cur.mapKey !== mapKey || !cur.routeKey){
      return _mapRecordsError('No current route is set. Use "!fts --mapMeta goto route <routeName>" first.');
    }

    var routesForMap = getRoutesForMap(S, mapKey);
    var route = routesForMap[cur.routeKey];
    if(!route || !route.points || !route.points.length){
      return _mapRecordsError('Current route has no points.');
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
      log('mapMetaRecordsSection prevNextRoutePoint sendPing err: '+e);
    }

    return { changed:false };
  }

  function handleMapRecordsCommand(args){
    var pid = args.pid;
    var expr = String(args.val||'').trim();
    if(!expr){
      return _mapRecordsError('Usage: !fts --mapMeta <action> <target> <value...>');
    }

    var spec = parseMapRecordsCommandSpec(expr);
    var parts = spec ? spec.parts : [];
    var action = spec ? spec.action : '';
    var target = spec ? spec.target : '';
    var valueStart = spec ? spec.valueStart : 2;

    // list routes|locations
    if(action === 'list'){
      if(target === 'routes'){
        return handleListRoutes({ pid:pid, val:'' });
      }
      if(target === 'locations'){
        return _mapRecordsListLocations({ pid:pid, val:'' });
      }
      return _mapRecordsError('Usage: !fts --mapMeta list routes|locations');
    }

    // start route <routeName>
    if(action === 'start' && target === 'route'){
      var nm = _joinRest(parts,valueStart);
      return handleStartRoute({ pid:pid, val:nm });
    }

    // end route
    if(action === 'end' && target === 'route'){
      return handleEndRoute({ pid:pid, val:'' });
    }

    // set routePoint <pointName>
    if(action === 'set' && target === 'routepoint'){
      var pt = _joinRest(parts,valueStart);
      return handleSetRoutePoint({ pid:pid, val:pt });
    }

    // set location <locationName>
    if(action === 'set' && target === 'location'){
      var loc = _joinRest(parts,valueStart);
      return handleSetMapPoint({ pid:pid, val:loc, silent: !!(args && args.silent) });
    }

    // goto route <routeName>
    if(action === 'goto' && target === 'route'){
      var rnm = _joinRest(parts,valueStart);
      return handleMapGotoRoute({ pid:pid, val:rnm });
    }

    // goto location <locationName>
    if(action === 'goto' && target === 'location'){
      var lnm = _joinRest(parts,valueStart);
      return handleMapGotoPoint({ pid:pid, val:lnm });
    }

    // goto routePoint <routeName (optional)> <index|pointName>
    if(action === 'goto' && target === 'routepoint'){
      // If 3+ parts: could be routeName + selector, or selector only.
      // We treat the last token as selector, and the preceding tokens as optional routeName.
      if(parts.length < valueStart + 1){
        return _mapRecordsError('Usage: !fts --mapMeta goto routePoint <routeName (optional)> <index|pointName>');
      }
      var selector = parts[parts.length-1];
      var routeMaybe = '';
      if(parts.length > valueStart + 1){
        routeMaybe = parts.slice(valueStart, parts.length-1).join(' ').trim();
      }
      return _mapRecordsGotoRoutePoint({ pid:pid }, routeMaybe, selector);
    }

    // prev/next routePoint (current route implied)
    if(action === 'prev' && target === 'routepoint'){
      return _mapRecordsPrevNextRoutePoint({ pid:pid }, -1);
    }
    if(action === 'next' && target === 'routepoint'){
      return _mapRecordsPrevNextRoutePoint({ pid:pid }, +1);
    }

    // delete route <routeName>
    if(action === 'delete' && target === 'route'){
      var dn = _joinRest(parts,valueStart);
      return handleDeleteRoute({ pid:pid, val:dn });
    }

    // delete location <locationName>
    if(action === 'delete' && target === 'location'){
      var dl = _joinRest(parts,valueStart);
      return handleDelMapPoint({ pid:pid, val:dl });
    }

    // delete routePoint <routeName (optional)> <index|pointName>
    if(action === 'delete' && target === 'routepoint'){
      if(parts.length < valueStart + 1){
        return _mapRecordsError('Usage: !fts --mapMeta delete routePoint <routeName (optional)> <index|pointName>');
      }
      var sel = parts[parts.length-1];
      var rMaybe = '';
      if(parts.length > valueStart + 1){
        rMaybe = parts.slice(valueStart, parts.length-1).join(' ').trim();
      }
      return _mapRecordsDeleteRoutePoint({ pid:pid }, rMaybe, sel);
    }

    // rename route <old> <new>
    if(action === 'rename' && target === 'route'){
      var rest = _joinRest(parts,valueStart);
      return handleRenRoute({ pid:pid, val:rest });
    }

    // rename location <old> <new>
    if(action === 'rename' && target === 'location'){
      var restL = _joinRest(parts,valueStart);
      return handleRenMapPoint({ pid:pid, val:restL });
    }

    // rename routePoint <old> <new> (current route)
    if(action === 'rename' && target === 'routepoint'){
      var restP = _joinRest(parts,valueStart);
      return handleRenRoutePoint({ pid:pid, val:restP });
    }

    return _mapRecordsError('Unknown map records command. Use: !fts --mapMeta list routes|locations');
  }

  /* ========== Core Integration (Help + Log Card) ========== */

  function renderConfigHTML(pid){
    // Keep this minimal: only expose the Map Routes & Locations handout button.
    ensureMapRecordsState();
    var v         = cssVars();
    var cardStyle = v.card || '';

    var meta = readMapMetaFromMule();
    var h    = ensureMapRecordsHandout(meta);

    var html = '<div'+(cardStyle?(' style="'+cardStyle+'"'):'')+'>';

    if(h && h.id){
      var url       = 'https://journal.roll20.net/handout/'+h.id;
      var actionAttrs = RT.fts.actionLinkAttrs(url);
      html += '<a'+actionAttrs+' target="_blank">Show Map Locations and Routes</a>';
    }

    html += '</div>';
    return html;
  }

  function moduleStartup(mule, reason){
    ensureMapRecordsState();
    loadRoutesFromMule();
    loadPointsFromMule();
    pruneInvalidMapRecordEntries();
    cleanMuleMapRecordAbilitiesOnInit();
    refreshMapRecordsForActivePage();
    mirrorVersionToMule();
    syncMapRecordsRootToMule();
  }

  function init(){
    moduleStartup(null, 'ready');
    if(_startupRegistered) return;
    try{
      if(RT.fts && typeof RT.fts.registerStartup === 'function'){
        RT.fts.registerStartup('mapmeta.records', moduleStartup);
        _startupRegistered = true;
      }
    }catch(e){
      log('fts_mapMeta route/location startup registration err: '+e);
    }
  }

  function captureSelectionMessage(msg){
    try{
      if(!msg || msg.type !== 'api') return;
      var content = String(msg.content || '').trim();
      var tail = extractMapMetaCommandTail(content);
      if(tail == null) return;
      var spec = parseMapRecordsCommandSpec(tail);
      if(!(spec && (
        (spec.action === 'start' && spec.target === 'route') ||
        (spec.action === 'set' && (spec.target === 'routepoint' || spec.target === 'location'))
      ))){
        return;
      }
      var mapRecordsState = ensureMapRecordsState();
      var sels = msg.selected || [];
      var out = [];
      for(var i=0;i<sels.length;i++){
        var s = sels[i];
        if(!s || !s._id || !s._type) continue;
        out.push({ _id:s._id, _type:s._type });
      }
      mapRecordsState.lastSelection[msg.playerid || ''] = out;
    }catch(e){
      log('fts_mapMeta route/location selection listener err: ' + e);
    }
  }

  on('chat:message', captureSelectionMessage);

  return {
    handleCommand: handleMapRecordsCommand,
    renderConfigHTML: renderConfigHTML,
    init: init,
    refreshActiveMapRecords: refreshMapRecordsForActivePage,
    loadMapRecordsFromMule: function(){
      loadRoutesFromMule();
      loadPointsFromMule();
    },
    pruneInvalidMapRecords: pruneInvalidMapRecordEntries,
    syncMapRecordsToMule: function(){
      syncRoutesToMule();
      syncPointsToMule();
      syncMapRecordsRootToMule();
    }
  };
}());
