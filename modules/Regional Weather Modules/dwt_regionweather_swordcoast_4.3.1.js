// name:        dwt_regionweather_swordcoast.js
// version:     4.3.1
// description: Sword Coast regional weather tables (regionWeather) for dwt_weather 4.3.x.
// provides:    dwt_mule ability: regionWeather (root JSON; regions.swordcoast (JSON)swordcoast.version
// notes:       Profile format matches dwt_weather expectations:
//              - visibilityBand and seaStateBand are scalar values
//              - storms provides criticalChancePct, windBonusPct, tempShiftF (types[] preserved)
//
// author:      tcm (AI-assisted)

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '4.3.1';
  var REGION_KEY = 'swordcoast';
  var ABILITY_ROOT = 'regionWeather';

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

  function getOrCreateMule(){
    var ch = findObjs({ _type:'character', name:'dwt_mule' })[0];
    if(!ch){
      ch = createObj('character', {
        name: 'dwt_mule',
        inplayerjournals: '',
        controlledby: 'all',
        archived: false
      });
    }else{
      ch.set({ inplayerjournals:'', controlledby:'all' });
    }
    return ch;
  }


  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function loadRegionWeatherRoot(character){
    var raw = getAbilityAction(character, ABILITY_ROOT).trim();
    if(!raw){
      return { schema:'dwt.regionWeather.root.v1', regions:{} };
    }
    try{
      var parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad root');
      if(!parsed.regions || typeof parsed.regions !== 'object' || Array.isArray(parsed.regions)) parsed.regions = {};
      if(!parsed.schema) parsed.schema = 'dwt.regionWeather.root.v1';
      return parsed;
    }catch(e){
      return { schema:'dwt.regionWeather.root.v1', regions:{} };
    }
  }

  function saveRegionWeatherRoot(character, root){
    if(!character) return;
    if(!root || typeof root !== 'object' || Array.isArray(root)) root = { schema:'dwt.regionWeather.root.v1', regions:{} };
    if(!root.regions || typeof root.regions !== 'object' || Array.isArray(root.regions)) root.regions = {};
    if(!root.schema) root.schema = 'dwt.regionWeather.root.v1';
    upsertAbility(character, ABILITY_ROOT, JSON.stringify(root));
  }

  function validateD100(table, label){
    if(!Array.isArray(table) || table.length < 1) throw new Error('regionWeather: missing d100 table ' + label);
    if((table[0].min|0) !== 1) throw new Error('regionWeather: d100 table must start at 1 for ' + label);
    if((table[table.length-1].max|0) !== 100) throw new Error('regionWeather: d100 table must end at 100 for ' + label);
    for(var i=0;i<table.length;i++){ if((table[i].min|0) > (table[i].max|0)) throw new Error('regionWeather: bad range in ' + label); }
    for(var i=1;i<table.length;i++){ if((table[i-1].max|0)+1 !== (table[i].min|0)) throw new Error('regionWeather: gap/overlap in ' + label); }
  }

  function validateRegionWeather(obj){
    if(!obj || typeof obj !== 'object') throw new Error('regionWeather: not an object');
    if(obj.schema !== 'dwt.regionweather.v1') throw new Error('regionWeather: schema mismatch');
    if(String(obj.region||'') !== REGION_KEY) throw new Error('regionWeather: wrong region');
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

    return true;
  }

  var REGION_WEATHER_JSON = "{\"schema\":\"dwt.regionweather.v1\",\"region\":\"swordcoast\",\"displayName\":\"Sword Coast\",\"locales\":[\"offshore\",\"coastal\",\"inland\"],\"seasons\":[\"winter\",\"spring\",\"summer\",\"autumn\"],\"units\":{\"wind\":\"percent\",\"windSpeedReference\":\"knots\",\"temperature\":\"degF\",\"precipChance\":\"percent\",\"stormChance\":\"percent\"},\"windScale\":{\"0\":{\"label\":\"Calm\",\"knots\":\"0\u20131\"},\"25\":{\"label\":\"Light\",\"knots\":\"2\u20137\"},\"50\":{\"label\":\"Moderate\",\"knots\":\"8\u201315\"},\"75\":{\"label\":\"Strong\",\"knots\":\"16\u201325\"},\"100\":{\"label\":\"Gale\",\"knots\":\"26\u201340+\"}},\"updatePolicy\":{\"incrementalDrift\":{\"windPercentDeltaMax\":10,\"tempDeltaMaxF\":8,\"precipChanceDeltaMax\":10,\"visibilityDeltaMax\":1},\"allowWildSwingsOnlyOn\":[\"storm_event\",\"dm_override\",\"narrative_event\"]},\"profiles\":{\"offshore\":{\"winter\":{\"temp\":{\"avgF\":55,\"lowF\":45,\"highF\":63},\"precip\":{\"type\":\"rain\",\"chancePct\":45,\"fogChancePct\":15},\"visibilityBand\":4,\"visibilityNotes\":\"Passing rain bands and squalls; visibility fair between systems.\",\"seaStateBand\":3,\"seaStateStormBand\":5,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":0},{\"min\":11,\"max\":30,\"value\":25},{\"min\":31,\"max\":60,\"value\":50},{\"min\":61,\"max\":88,\"value\":75},{\"min\":89,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"NW\"},{\"min\":36,\"max\":60,\"value\":\"W\"},{\"min\":61,\"max\":80,\"value\":\"SW\"},{\"min\":81,\"max\":92,\"value\":\"WNW\"},{\"min\":93,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":14,\"windBonusPct\":18,\"tempShiftF\":-2,\"types\":[{\"name\":\"Pacific Gale\",\"chancePct\":7,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Winter Squall\",\"chancePct\":7,\"effects\":[\"rain++\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":60,\"lowF\":50,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":25,\"fogChancePct\":18},\"visibilityBand\":4,\"visibilityNotes\":\"Fewer storms; occasional showers; marine haze increases.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"NW\",\"WNW\",\"W\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":45,\"value\":25},{\"min\":46,\"max\":78,\"value\":50},{\"min\":79,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":70,\"value\":\"WNW\"},{\"min\":71,\"max\":88,\"value\":\"W\"},{\"min\":89,\"max\":97,\"value\":\"SW\"},{\"min\":98,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"Late Shower Line\",\"chancePct\":5,\"effects\":[\"rain+\",\"visibility-\"]},{\"name\":\"Gust Front\",\"chancePct\":3,\"effects\":[\"wind+\"]}]}},\"summer\":{\"temp\":{\"avgF\":64,\"lowF\":55,\"highF\":75},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":28},\"visibilityBand\":4,\"visibilityNotes\":\"Dry season; marine layer fog common at dawn and dusk.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"NNW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":0},{\"min\":11,\"max\":35,\"value\":25},{\"min\":36,\"max\":72,\"value\":50},{\"min\":73,\"max\":93,\"value\":75},{\"min\":94,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":70,\"value\":\"NNW\"},{\"min\":71,\"max\":88,\"value\":\"W\"},{\"min\":89,\"max\":96,\"value\":\"WNW\"},{\"min\":97,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":4,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Dry Squall\",\"chancePct\":2,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Thunderhead Drift\",\"chancePct\":2,\"effects\":[\"thunder+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":62,\"lowF\":52,\"highF\":72},\"precip\":{\"type\":\"rain\",\"chancePct\":15,\"fogChancePct\":20},\"visibilityBand\":4,\"visibilityNotes\":\"Warm early autumn; first rains return late in season.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":45,\"value\":25},{\"min\":46,\"max\":75,\"value\":50},{\"min\":76,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":65,\"value\":\"W\"},{\"min\":66,\"max\":85,\"value\":\"SW\"},{\"min\":86,\"max\":96,\"value\":\"WNW\"},{\"min\":97,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"First Storm Line\",\"chancePct\":5,\"effects\":[\"rain++\",\"wind+\"]},{\"name\":\"Autumn Squall\",\"chancePct\":3,\"effects\":[\"wind+\",\"visibility-\"]}]}}},\"coastal\":{\"winter\":{\"temp\":{\"avgF\":54,\"lowF\":44,\"highF\":62},\"precip\":{\"type\":\"rain\",\"chancePct\":50,\"fogChancePct\":20},\"visibilityBand\":4,\"visibilityNotes\":\"Intermittent rain; fog near headlands and bays.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":50,\"value\":25},{\"min\":51,\"max\":80,\"value\":50},{\"min\":81,\"max\":96,\"value\":75},{\"min\":97,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":60,\"value\":\"NW\"},{\"min\":61,\"max\":82,\"value\":\"SW\"},{\"min\":83,\"max\":95,\"value\":\"WNW\"},{\"min\":96,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":10,\"windBonusPct\":15,\"tempShiftF\":-2,\"types\":[{\"name\":\"Coastal Squall\",\"chancePct\":6,\"effects\":[\"rain++\",\"visibility-\"]},{\"name\":\"Windstorm\",\"chancePct\":4,\"effects\":[\"wind+\",\"sea+\"]}]}},\"spring\":{\"temp\":{\"avgF\":60,\"lowF\":50,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":25,\"fogChancePct\":25},\"visibilityBand\":4,\"visibilityNotes\":\"Drying trend; coastal fog becomes common.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"WNW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":60,\"value\":25},{\"min\":61,\"max\":88,\"value\":50},{\"min\":89,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":75,\"value\":\"WNW\"},{\"min\":76,\"max\":92,\"value\":\"W\"},{\"min\":93,\"max\":98,\"value\":\"SW\"},{\"min\":99,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"Gust Front\",\"chancePct\":3,\"effects\":[\"wind+\"]},{\"name\":\"Brief Shower\",\"chancePct\":3,\"effects\":[\"rain+\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":62,\"lowF\":54,\"highF\":72},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":35},\"visibilityBand\":4,\"visibilityNotes\":\"Marine layer dominates mornings; afternoons clear and breezy.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"NNW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":45,\"value\":25},{\"min\":46,\"max\":80,\"value\":50},{\"min\":81,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":70,\"value\":\"NNW\"},{\"min\":71,\"max\":88,\"value\":\"W\"},{\"min\":89,\"max\":96,\"value\":\"WNW\"},{\"min\":97,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":3,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Dry Squall\",\"chancePct\":2,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Thunderhead Drift\",\"chancePct\":1,\"effects\":[\"thunder+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":64,\"lowF\":54,\"highF\":74},\"precip\":{\"type\":\"rain\",\"chancePct\":15,\"fogChancePct\":25},\"visibilityBand\":4,\"visibilityNotes\":\"Warm early; first rains late; fog persists in mornings.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":55,\"value\":25},{\"min\":56,\"max\":85,\"value\":50},{\"min\":86,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":72,\"value\":\"W\"},{\"min\":73,\"max\":92,\"value\":\"SW\"},{\"min\":93,\"max\":98,\"value\":\"WNW\"},{\"min\":99,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"First Rain Line\",\"chancePct\":4,\"effects\":[\"rain++\",\"visibility-\"]},{\"name\":\"Wind Burst\",\"chancePct\":2,\"effects\":[\"wind+\"]}]}}},\"inland\":{\"winter\":{\"temp\":{\"avgF\":52,\"lowF\":38,\"highF\":65},\"precip\":{\"type\":\"rain\",\"chancePct\":40,\"fogChancePct\":10},\"visibilityBand\":5,\"visibilityNotes\":\"Cool wet spells; clearer skies between systems.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"NW\",\"S\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":60,\"value\":25},{\"min\":61,\"max\":88,\"value\":50},{\"min\":89,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":60,\"value\":\"SW\"},{\"min\":61,\"max\":85,\"value\":\"NW\"},{\"min\":86,\"max\":95,\"value\":\"S\"},{\"min\":96,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":12,\"tempShiftF\":-3,\"types\":[{\"name\":\"Inland Windstorm\",\"chancePct\":4,\"effects\":[\"wind+\",\"treefall+\"]},{\"name\":\"Cold Downpour\",\"chancePct\":4,\"effects\":[\"rain++\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":65,\"lowF\":48,\"highF\":80},\"precip\":{\"type\":\"rain\",\"chancePct\":20,\"fogChancePct\":5},\"visibilityBand\":5,\"visibilityNotes\":\"Warming quickly; showers taper off.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":0},{\"min\":31,\"max\":70,\"value\":25},{\"min\":71,\"max\":92,\"value\":50},{\"min\":93,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":75,\"value\":\"W\"},{\"min\":76,\"max\":95,\"value\":\"SW\"},{\"min\":96,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":10,\"tempShiftF\":-1,\"types\":[{\"name\":\"Thunderburst\",\"chancePct\":3,\"effects\":[\"thunder+\",\"visibility-\"]},{\"name\":\"Gust Front\",\"chancePct\":3,\"effects\":[\"wind+\"]}]}},\"summer\":{\"temp\":{\"avgF\":82,\"lowF\":60,\"highF\":100},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":0},\"visibilityBand\":5,\"visibilityNotes\":\"Hot, dry days; heat haze common; rare thunderstorms.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":40,\"value\":0},{\"min\":41,\"max\":78,\"value\":25},{\"min\":79,\"max\":93,\"value\":50},{\"min\":94,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":70,\"value\":\"W\"},{\"min\":71,\"max\":95,\"value\":\"SW\"},{\"min\":96,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":5,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Dry Thunderstorm\",\"chancePct\":5,\"effects\":[\"thunder+\",\"fireRisk+\"]}]}},\"autumn\":{\"temp\":{\"avgF\":72,\"lowF\":52,\"highF\":90},\"precip\":{\"type\":\"rain\",\"chancePct\":15,\"fogChancePct\":5},\"visibilityBand\":5,\"visibilityNotes\":\"Warm early; cooler late; first rains late in season.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\",\"S\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":0},{\"min\":31,\"max\":70,\"value\":25},{\"min\":71,\"max\":92,\"value\":50},{\"min\":93,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":70,\"value\":\"W\"},{\"min\":71,\"max\":90,\"value\":\"SW\"},{\"min\":91,\"max\":98,\"value\":\"S\"},{\"min\":99,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":10,\"tempShiftF\":-1,\"types\":[{\"name\":\"First Storm Line\",\"chancePct\":4,\"effects\":[\"rain++\",\"wind+\"]},{\"name\":\"Wind Burst\",\"chancePct\":2,\"effects\":[\"wind+\"]}]}}}}}";

  function moduleStartup(mule){
    try{
      var M = mule || getOrCreateMule();
      if(!M) return;

      var parsed = JSON.parse(REGION_WEATHER_JSON);
      validateRegionWeather(parsed);

      var root = loadRegionWeatherRoot(M);
      root.regions[REGION_KEY] = parsed;
      saveRegionWeatherRoot(M, root);
    }catch(e){
      log('dwt_regionweather_swordcoast_4.3.1 startup err: ' + e);
    }
  }

  function registerWithCore(dwt){
    try{
      if(!dwt || typeof dwt.registerStartup !== 'function') return;
      dwt.registerStartup('dwt_regionweather_swordcoast', moduleStartup);
    }catch(e){
      log('dwt_regionweather_swordcoast register err: ' + e);
    }
  }

  RT.dwtQ = RT.dwtQ || [];
  RT.dwtQ.push(function(dwt){ registerWithCore(dwt); });

  if(RT.dwt && typeof RT.dwt.registerStartup === 'function') {
    registerWithCore(RT.dwt);
  }

  on('ready', function(){ moduleStartup(null); });
})();
