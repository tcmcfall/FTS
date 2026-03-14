// name:        dwt_regionWeather_TEMPLATE.js
// version:     4.3.1
// description: TEMPLATE for creating a regional weather module (regionWeather) compatible with dwt_weather 5.x.
// provides:    dwt_mule abilities:
//              - regionWeather   (JSON root; required)
//              - version         (shared line-based version registry; required)
//
// =================================================================================================
// PURPOSE
// -------------------------------------------------------------------------------------------------
// This file is a developer template for adding a new weather region to the DWT suite.
//
// A regionWeather module is a data provider that publishes seasonal weather tables for a region
// under a standardized JSON schema, then stores that JSON into the shared dwt_mule Ability:
//
//    regionWeather
//
// under:
//
//    root.regions[REGION_KEY]
//
// The weather engine then loads regional profiles from:
//
//    regionWeather.regions.<regionKey>
//
// =================================================================================================
// QUICK START
// -------------------------------------------------------------------------------------------------
// 1) Pick a canonical region key (lowercase, no spaces).
// 2) Copy this template and rename it:
//      dwt_regionWeather_<regionKey>_<version>.js
// 3) Edit REGION_KEY and REGION_WEATHER_JSON.
// 4) Upload into Roll20 API sandbox; it will automatically write into dwt_mule on startup.
// 5) In Roll20, run:
//      !dwt --weather update
//
// =================================================================================================
// IMPORTANT DESIGN GUIDELINES
// -------------------------------------------------------------------------------------------------
// 1) Keep REGION_KEY stable.
// 2) Keep all locale/season profiles complete.
// 3) Validate all d100 tables.
// 4) Keep naming and casing consistent with regionWeather root storage.

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var REGION_KEY = 'yourregionkey';
  var VERSION = '4.3.1';
  var MODULE_KEY = 'regionWeather';
  var _startupRegistered = false;

  var REGION_WEATHER_JSON = [
    '{',
    '  "schema": "dwt.regionweather.v1",',
    '  "region": "yourregionkey",',
    '  "profiles": {',
    '    "offshore": {',
    '      "winter": {',
    '        "temp": { "avgF": 40 },',
    '        "precip": { "chancePct": 50 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 3,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 30, "value": 25 },',
    '            { "min": 31, "max": 60, "value": 50 },',
    '            { "min": 61, "max": 85, "value": 75 },',
    '            { "min": 86, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 40, "value": "W" },',
    '            { "min": 41, "max": 70, "value": "SW" },',
    '            { "min": 71, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 10,',
    '          "windBonusPct": 25,',
    '          "tempShiftF": -5,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "spring": {',
    '        "temp": { "avgF": 50 },',
    '        "precip": { "chancePct": 45 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 2,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 35, "value": 25 },',
    '            { "min": 36, "max": 70, "value": 50 },',
    '            { "min": 71, "max": 90, "value": 75 },',
    '            { "min": 91, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 50, "value": "W" },',
    '            { "min": 51, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 8,',
    '          "windBonusPct": 20,',
    '          "tempShiftF": -3,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "summer": {',
    '        "temp": { "avgF": 62 },',
    '        "precip": { "chancePct": 30 },',
    '        "visibilityBand": 1,',
    '        "seaStateBand": 2,',
    '        "wind": {',
    '          "prevailingDirs": ["W","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 40, "value": 25 },',
    '            { "min": 41, "max": 75, "value": 50 },',
    '            { "min": 76, "max": 95, "value": 75 },',
    '            { "min": 96, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 60, "value": "W" },',
    '            { "min": 61, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 4,',
    '          "windBonusPct": 15,',
    '          "tempShiftF": -2,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "autumn": {',
    '        "temp": { "avgF": 52 },',
    '        "precip": { "chancePct": 45 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 3,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 30, "value": 25 },',
    '            { "min": 31, "max": 65, "value": 50 },',
    '            { "min": 66, "max": 90, "value": 75 },',
    '            { "min": 91, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 50, "value": "W" },',
    '            { "min": 51, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 9,',
    '          "windBonusPct": 25,',
    '          "tempShiftF": -4,',
    '          "types": ["storm"]',
    '        }',
    '      }',
    '    },',
    '    "coastal": {',
    '      "winter": {',
    '        "temp": { "avgF": 38 },',
    '        "precip": { "chancePct": 55 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 2,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 35, "value": 25 },',
    '            { "min": 36, "max": 70, "value": 50 },',
    '            { "min": 71, "max": 90, "value": 75 },',
    '            { "min": 91, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 40, "value": "W" },',
    '            { "min": 41, "max": 70, "value": "SW" },',
    '            { "min": 71, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 10,',
    '          "windBonusPct": 25,',
    '          "tempShiftF": -5,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "spring": {',
    '        "temp": { "avgF": 48 },',
    '        "precip": { "chancePct": 45 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 2,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 40, "value": 25 },',
    '            { "min": 41, "max": 75, "value": 50 },',
    '            { "min": 76, "max": 92, "value": 75 },',
    '            { "min": 93, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 55, "value": "W" },',
    '            { "min": 56, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 7,',
    '          "windBonusPct": 20,',
    '          "tempShiftF": -3,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "summer": {',
    '        "temp": { "avgF": 60 },',
    '        "precip": { "chancePct": 30 },',
    '        "visibilityBand": 1,',
    '        "seaStateBand": 1,',
    '        "wind": {',
    '          "prevailingDirs": ["W","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 45, "value": 25 },',
    '            { "min": 46, "max": 80, "value": 50 },',
    '            { "min": 81, "max": 95, "value": 75 },',
    '            { "min": 96, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 60, "value": "W" },',
    '            { "min": 61, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 4,',
    '          "windBonusPct": 15,',
    '          "tempShiftF": -2,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "autumn": {',
    '        "temp": { "avgF": 50 },',
    '        "precip": { "chancePct": 48 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 2,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 35, "value": 25 },',
    '            { "min": 36, "max": 70, "value": 50 },',
    '            { "min": 71, "max": 92, "value": 75 },',
    '            { "min": 93, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 55, "value": "W" },',
    '            { "min": 56, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 9,',
    '          "windBonusPct": 25,',
    '          "tempShiftF": -4,',
    '          "types": ["storm"]',
    '        }',
    '      }',
    '    },',
    '    "inland": {',
    '      "winter": {',
    '        "temp": { "avgF": 34 },',
    '        "precip": { "chancePct": 45 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 0,',
    '        "wind": {',
    '          "prevailingDirs": ["W","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 40, "value": 25 },',
    '            { "min": 41, "max": 75, "value": 50 },',
    '            { "min": 76, "max": 92, "value": 75 },',
    '            { "min": 93, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 60, "value": "W" },',
    '            { "min": 61, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 8,',
    '          "windBonusPct": 20,',
    '          "tempShiftF": -6,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "spring": {',
    '        "temp": { "avgF": 47 },',
    '        "precip": { "chancePct": 40 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 0,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 45, "value": 25 },',
    '            { "min": 46, "max": 80, "value": 50 },',
    '            { "min": 81, "max": 95, "value": 75 },',
    '            { "min": 96, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 55, "value": "W" },',
    '            { "min": 56, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 6,',
    '          "windBonusPct": 15,',
    '          "tempShiftF": -3,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "summer": {',
    '        "temp": { "avgF": 65 },',
    '        "precip": { "chancePct": 25 },',
    '        "visibilityBand": 1,',
    '        "seaStateBand": 0,',
    '        "wind": {',
    '          "prevailingDirs": ["W","NW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 50, "value": 25 },',
    '            { "min": 51, "max": 85, "value": 50 },',
    '            { "min": 86, "max": 96, "value": 75 },',
    '            { "min": 97, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 60, "value": "W" },',
    '            { "min": 61, "max": 100, "value": "NW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 3,',
    '          "windBonusPct": 10,',
    '          "tempShiftF": -2,',
    '          "types": ["storm"]',
    '        }',
    '      },',
    '      "autumn": {',
    '        "temp": { "avgF": 49 },',
    '        "precip": { "chancePct": 40 },',
    '        "visibilityBand": 2,',
    '        "seaStateBand": 0,',
    '        "wind": {',
    '          "prevailingDirs": ["W","SW"],',
    '          "percentTable": [',
    '            { "min": 1, "max": 40, "value": 25 },',
    '            { "min": 41, "max": 78, "value": 50 },',
    '            { "min": 79, "max": 94, "value": 75 },',
    '            { "min": 95, "max": 100, "value": 100 }',
    '          ],',
    '          "dirTable": [',
    '            { "min": 1, "max": 55, "value": "W" },',
    '            { "min": 56, "max": 100, "value": "SW" }',
    '          ]',
    '        },',
    '        "storms": {',
    '          "criticalChancePct": 7,',
    '          "windBonusPct": 20,',
    '          "tempShiftF": -4,',
    '          "types": ["storm"]',
    '        }',
    '      }',
    '    }',
    '  }',
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

  function loadRegionWeatherRoot(character){
    var raw = getAbilityAction(character, MODULE_KEY);
    if(!raw){
      return { schema:'dwt.regionWeather.root.v1', regions:{} };
    }
    try{
      var parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') parsed = {};
      if(parsed.schema !== 'dwt.regionWeather.root.v1') parsed.schema = 'dwt.regionWeather.root.v1';
      if(!parsed.regions || typeof parsed.regions !== 'object') parsed.regions = {};
      return parsed;
    }catch(e){
      return { schema:'dwt.regionWeather.root.v1', regions:{} };
    }
  }

  function saveRegionWeatherRoot(character, root){
    upsertAbility(character, MODULE_KEY, JSON.stringify(root));
  }

  function validateD100(table, label){
    if(!Array.isArray(table) || table.length < 1) throw new Error('regionWeather: missing d100 table ' + label);
    if((table[0].min|0) !== 1) throw new Error('regionWeather: d100 table must start at 1 for ' + label);
    if((table[table.length-1].max|0) !== 100) throw new Error('regionWeather: d100 table must end at 100 for ' + label);
    for(var i=0;i<table.length;i++){
      if((table[i].min|0) > (table[i].max|0)) throw new Error('regionWeather: bad range in ' + label);
    }
    for(var j=1;j<table.length;j++){
      if((table[j-1].max|0)+1 !== (table[j].min|0)) throw new Error('regionWeather: gap/overlap in ' + label);
    }
  }

  function validateRegionWeather(obj){
    if(!obj || typeof obj !== 'object') throw new Error('regionWeather: not an object');
    if(obj.schema !== 'dwt.regionweather.v1') throw new Error('regionWeather: schema mismatch');
    if(String(obj.region || '') !== REGION_KEY) throw new Error('regionWeather: wrong region');
    if(!obj.profiles || typeof obj.profiles !== 'object') throw new Error('regionWeather: missing profiles');

    var locales = ['offshore','coastal','inland'];
    var seasons = ['winter','spring','summer','autumn'];

    locales.forEach(function(loc){
      if(!obj.profiles[loc]) throw new Error('regionWeather: missing locale ' + loc);
      seasons.forEach(function(sea){
        var p = obj.profiles[loc][sea];
        if(!p) throw new Error('regionWeather: missing profile ' + loc + '.' + sea);
        if(!p.temp || typeof p.temp.avgF !== 'number') throw new Error('regionWeather: missing temp ' + loc + '.' + sea);
        if(!p.precip || typeof p.precip.chancePct !== 'number') throw new Error('regionWeather: missing precip ' + loc + '.' + sea);
        if(typeof p.visibilityBand !== 'number') throw new Error('regionWeather: visibilityBand must be number ' + loc + '.' + sea);
        if(typeof p.seaStateBand !== 'number') throw new Error('regionWeather: seaStateBand must be number ' + loc + '.' + sea);
        if(!p.wind || !Array.isArray(p.wind.prevailingDirs)) throw new Error('regionWeather: missing wind prev dirs ' + loc + '.' + sea);
        validateD100(p.wind.percentTable, loc + '.' + sea + '.wind.percentTable');
        validateD100(p.wind.dirTable, loc + '.' + sea + '.wind.dirTable');
        if(!p.storms || typeof p.storms.criticalChancePct !== 'number') throw new Error('regionWeather: storms.criticalChancePct missing ' + loc + '.' + sea);
        if(typeof p.storms.windBonusPct !== 'number') throw new Error('regionWeather: storms.windBonusPct missing ' + loc + '.' + sea);
        if(typeof p.storms.tempShiftF !== 'number') throw new Error('regionWeather: storms.tempShiftF missing ' + loc + '.' + sea);
      });
    });
  }

  function moduleStartup(mule, reason){
    mule = mule || getOrCreateMule();
    var parsed = JSON.parse(REGION_WEATHER_JSON);
    validateRegionWeather(parsed);

    var root = loadRegionWeatherRoot(mule);
    root.regions[REGION_KEY] = parsed;
    saveRegionWeatherRoot(mule, root);
    mergeVersionEntry(mule, MODULE_KEY, VERSION);
  }

  function registerWithCore(){
    // data provider only; no default commands required
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