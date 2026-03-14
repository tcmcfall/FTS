// name:        dwt_region_TEMPLATE.js
// version:     4.3.1
// description: TEMPLATE for defining a campaign region metadata module (metadata + real-world analogs).
//
// -------------------------------------------------------------------------------------------------
// WHAT THIS IS
// -------------------------------------------------------------------------------------------------
// This file is a developer template for authoring a region metadata module in the DWT suite.
//
// Unlike dwt_regionweather_* modules (which provide seasonal weather tables), a region module
// is intended to hold mapping metadata:
//
//   - Region identity (key, display name)
//   - Canonical locales used by dwt_weather (offshore/coastal/inland)
//   - Canonical campaign locations (cities, landmarks) belonging to the region
//   - Real-world analog assignments (for weather data research, historic wind patterns, etc.)
//   - Optional references to data sources and notes for maintainers
//
// The region module publishes its JSON into the shared dwt_mule Ability:
//
//    regionMeta
//
// under:
//
//    root.regions[REGION_KEY]
//
// -------------------------------------------------------------------------------------------------
// WHY THIS EXISTS
// -------------------------------------------------------------------------------------------------
// A regionWeather module answers: "How does weather behave here seasonally?"
// A region module answers:        "What fictional places are in this region, and what real places
//                                 do we treat as their analogs for research and calibration?"
//
// This supports:
//   - consistent, documented real-world analog choices
//   - future automation
//   - developer onboarding
//
// -------------------------------------------------------------------------------------------------
// QUICK START
// -------------------------------------------------------------------------------------------------
// 1) Pick a region key (lowercase, no spaces), e.g. "moonshaes".
// 2) Copy this template and rename it:
//       dwt_region_<regionKey>_<version>.js
// 3) Set REGION_KEY and paste a JSON string into REGION_JSON.
// 4) Upload into Roll20 API sandbox; it will write into dwt_mule on startup.
//
// -------------------------------------------------------------------------------------------------
// JSON SCHEMA: dwt.region.v1
// -------------------------------------------------------------------------------------------------
// {
//   "schema": "dwt.region.v1",
//   "region": "<regionKey>",
//   "displayName": "Moonshaes",
//   "defaultLocale": "coastal",
//   "locales": ["offshore","coastal","inland"],
//   "campaignLocations": [
//     {
//       "name": "Caer Callidyrr",
//       "locale": "coastal",
//       "tags": ["capital","island"],
//       "realWorldAnalog": {
//         "name": "Edinburgh, Scotland",
//         "lat": 55.9533,
//         "lon": -3.1883,
//         "notes": "Atlantic maritime; cool summers, mild winters, frequent rain and wind."
//       },
//       "sources": [
//         "FR wiki / setting books / project notes"
//       ],
//       "notes": "Optional DM-facing notes."
//     }
//   ],
//   "sourceNotes": [
//     "Document your mapping logic, assumptions, and validation references."
//   ]
// }
//
// -------------------------------------------------------------------------------------------------
// IMPLEMENTATION NOTES
// -------------------------------------------------------------------------------------------------
// This module does NOT require dwt_weather, but it registers with dwt_core if present.
// It always writes into dwt_mule as a safety net.

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var REGION_KEY = 'yourregionkey';
  var VERSION = '4.3.1';
  var MODULE_KEY = 'regionMeta';
  var _startupRegistered = false;

  var REGION_JSON = [
    '{',
    '  "schema": "dwt.region.v1",',
    '  "region": "yourregionkey",',
    '  "displayName": "Your Region Name",',
    '  "defaultLocale": "coastal",',
    '  "locales": ["offshore","coastal","inland"],',
    '  "campaignLocations": [],',
    '  "sourceNotes": []',
    '}'
  ].join('\n');

  function upsertAbility(character, name, action){
    if(!character) return;
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    if(ability){
      ability.set({ action:String(action) });
    }else{
      createObj('ability', {
        characterid: character.id,
        name: name,
        action: String(action),
        istokenaction: false
      });
    }
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function getOrCreateMule(){
    var ch = findObjs({ _type:'character', name:'dwt_mule' })[0];
    if(!ch){
      ch = createObj('character', {
        name:'dwt_mule',
        inplayerjournals:'',
        controlledby:'all',
        archived:false
      });
    }
    return ch;
  }

  function parseVersionRoot(raw){
    var obj = {};
    var lines = String(raw || '').split('\n');
    for(var i=0;i<lines.length;i++){
      var line = String(lines[i] || '').trim();
      if(!line) continue;
      var idx = line.indexOf('=');
      if(idx < 1) continue;
      var k = String(line.substring(0, idx) || '').trim();
      var v = String(line.substring(idx + 1) || '').trim();
      if(k) obj[k] = v;
    }
    return obj;
  }

  function serializeVersionRoot(obj){
    var out = [];
    Object.keys(obj || {}).sort().forEach(function(k){
      out.push(k + '=' + obj[k]);
    });
    return out.join('\n');
  }

  function normalizeModuleVersion(moduleKey, moduleVersion){
    var mk = String(moduleKey || '').trim();
    var mv = String(moduleVersion || '').trim();
    var m = mv.match(/(\d+\.\d+\.\d+)$/);
    var ver = m ? m[1] : mv.replace(/^[^0-9]*/, '');
    return mk + '_' + ver;
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    root[moduleKey] = normalizeModuleVersion(moduleKey, moduleVersion);
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function loadRegionMetaRoot(character){
    var raw = getAbilityAction(character, MODULE_KEY);
    if(!raw){
      return { schema:'dwt.regionMeta.root.v1', regions:{} };
    }
    try{
      var parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') parsed = {};
      if(parsed.schema !== 'dwt.regionMeta.root.v1') parsed.schema = 'dwt.regionMeta.root.v1';
      if(!parsed.regions || typeof parsed.regions !== 'object') parsed.regions = {};
      return parsed;
    }catch(e){
      return { schema:'dwt.regionMeta.root.v1', regions:{} };
    }
  }

  function saveRegionMetaRoot(character, root){
    upsertAbility(character, MODULE_KEY, JSON.stringify(root));
  }

  function validateRegion(obj){
    if(!obj || typeof obj !== 'object') throw new Error('regionMeta: not an object');
    if(obj.schema !== 'dwt.region.v1') throw new Error('regionMeta: schema mismatch');
    if(String(obj.region || '') !== REGION_KEY) throw new Error('regionMeta: wrong region');
    if(!Array.isArray(obj.locales)) throw new Error('regionMeta: missing locales');
    if(!Array.isArray(obj.campaignLocations)) throw new Error('regionMeta: missing campaignLocations');
  }

  function moduleStartup(mule, reason){
    mule = mule || getOrCreateMule();
    var parsed = JSON.parse(REGION_JSON);
    validateRegion(parsed);

    var root = loadRegionMetaRoot(mule);
    root.regions[REGION_KEY] = parsed;
    saveRegionMetaRoot(mule, root);
    mergeVersionEntry(mule, MODULE_KEY, VERSION);
  }

  function registerWithCore(){
    // region modules are primarily data providers; no default commands required
  }

  function registerStartupHooks(){
    if(_startupRegistered) return;
    _startupRegistered = true;

    RT.dwtQ = RT.dwtQ || [];
    RT.dwtQ.push(function(dwt){
      if(dwt && typeof dwt.registerStartup === 'function'){
        dwt.registerStartup(MODULE_KEY + '.' + REGION_KEY, function(mule, reason){
          moduleStartup(mule, reason);
        });
      }
      registerWithCore();
    });

    if(RT.dwt && typeof RT.dwt.registerStartup === 'function'){
      RT.dwt.registerStartup(MODULE_KEY + '.' + REGION_KEY, function(mule, reason){
        moduleStartup(mule, reason);
      });
    }
  }

  function init(){
    moduleStartup(getOrCreateMule(), 'ready');
    registerWithCore();
    registerStartupHooks();
  }

  on('ready', init);
})();