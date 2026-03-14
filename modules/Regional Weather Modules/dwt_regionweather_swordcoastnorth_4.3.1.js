// name:        dwt_regionweather_swordcoastnorth.js
// version:     4.3.1
// description: Sword Coast North regional weather tables (regionWeather) for dwt_weather 4.3.x.
// provides:    dwt_mule ability: regionWeather (root JSON; regions.swordcoastnorth (JSON)swordcoastnorth.version
// notes:       Profile format matches dwt_weather expectations:
//              - visibilityBand and seaStateBand are scalar values
//              - storms provides criticalChancePct, windBonusPct, tempShiftF (types[] preserved)
//
// author:      tcm (AI-assisted)

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '4.3.1';
  var REGION_KEY = 'swordcoastnorth';
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

  var REGION_WEATHER_JSON = "{\"schema\":\"dwt.regionweather.v1\",\"region\":\"swordcoastnorth\",\"displayName\":\"Sword Coast North\",\"locales\":[\"offshore\",\"coastal\",\"inland\"],\"seasons\":[\"winter\",\"spring\",\"summer\",\"autumn\"],\"units\":{\"wind\":\"percent\",\"windSpeedReference\":\"knots\",\"temperature\":\"degF\",\"precipChance\":\"percent\",\"stormChance\":\"percent\"},\"windScale\":{\"0\":{\"label\":\"Calm\",\"knots\":\"0\u20131\"},\"25\":{\"label\":\"Light\",\"knots\":\"2\u20137\"},\"50\":{\"label\":\"Moderate\",\"knots\":\"8\u201315\"},\"75\":{\"label\":\"Strong\",\"knots\":\"16\u201325\"},\"100\":{\"label\":\"Gale\",\"knots\":\"26\u201340+\"}},\"updatePolicy\":{\"incrementalDrift\":{\"windPercentDeltaMax\":10,\"tempDeltaMaxF\":8,\"precipChanceDeltaMax\":10,\"visibilityDeltaMax\":1},\"allowWildSwingsOnlyOn\":[\"storm_event\",\"dm_override\",\"narrative_event\"]},\"profiles\":{\"offshore\":{\"winter\":{\"temp\":{\"avgF\":45,\"lowF\":35,\"highF\":55},\"precip\":{\"type\":\"rain\",\"chancePct\":65,\"fogChancePct\":20},\"visibilityBand\":3,\"visibilityNotes\":\"Long rain bands and squalls; visibility drops quickly in storms.\",\"seaStateBand\":3,\"seaStateStormBand\":5,\"wind\":{\"prevailingDirs\":[\"W\",\"WSW\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":5,\"value\":0},{\"min\":6,\"max\":20,\"value\":25},{\"min\":21,\"max\":55,\"value\":50},{\"min\":56,\"max\":85,\"value\":75},{\"min\":86,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"WSW\"},{\"min\":56,\"max\":75,\"value\":\"SW\"},{\"min\":76,\"max\":90,\"value\":\"WNW\"},{\"min\":91,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":22,\"windBonusPct\":20,\"tempShiftF\":-3,\"types\":[{\"name\":\"Winter Gale\",\"chancePct\":12,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Driving Squall\",\"chancePct\":10,\"effects\":[\"visibility-\",\"rain++\"]}]}},\"spring\":{\"temp\":{\"avgF\":52,\"lowF\":42,\"highF\":62},\"precip\":{\"type\":\"rain\",\"chancePct\":50,\"fogChancePct\":18},\"visibilityBand\":4,\"visibilityNotes\":\"Showers alternate with clear intervals; fog banks persist offshore.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"WNW\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":0},{\"min\":11,\"max\":30,\"value\":25},{\"min\":31,\"max\":65,\"value\":50},{\"min\":66,\"max\":92,\"value\":75},{\"min\":93,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"WNW\"},{\"min\":56,\"max\":75,\"value\":\"NW\"},{\"min\":76,\"max\":90,\"value\":\"SW\"},{\"min\":91,\"max\":100,\"value\":\"N\"}]},\"storms\":{\"criticalChancePct\":12,\"windBonusPct\":15,\"tempShiftF\":-1,\"types\":[{\"name\":\"Cold-Front Squall\",\"chancePct\":7,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Hard Rain Line\",\"chancePct\":5,\"effects\":[\"rain++\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":60,\"lowF\":52,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":20,\"fogChancePct\":30},\"visibilityBand\":4,\"visibilityNotes\":\"Marine layer fog common; storms rare but sudden.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"NNW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":45,\"value\":25},{\"min\":46,\"max\":80,\"value\":50},{\"min\":81,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":65,\"value\":\"NNW\"},{\"min\":66,\"max\":85,\"value\":\"W\"},{\"min\":86,\"max\":95,\"value\":\"WNW\"},{\"min\":96,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Summer Squall\",\"chancePct\":6,\"effects\":[\"wind+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":52,\"lowF\":42,\"highF\":62},\"precip\":{\"type\":\"rain\",\"chancePct\":55,\"fogChancePct\":22},\"visibilityBand\":3,\"visibilityNotes\":\"First big systems return; longer rain and stronger winds.\",\"seaStateBand\":3,\"seaStateStormBand\":5,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"WSW\",\"NW\"],\"percentTable\":[{\"min\":1,\"max\":8,\"value\":0},{\"min\":9,\"max\":25,\"value\":25},{\"min\":26,\"max\":55,\"value\":50},{\"min\":56,\"max\":85,\"value\":75},{\"min\":86,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"SW\"},{\"min\":56,\"max\":75,\"value\":\"WSW\"},{\"min\":76,\"max\":90,\"value\":\"NW\"},{\"min\":91,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":18,\"windBonusPct\":18,\"tempShiftF\":-2,\"types\":[{\"name\":\"Autumn Gale\",\"chancePct\":10,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Cold Rain Blow\",\"chancePct\":8,\"effects\":[\"rain++\",\"wind+\"]}]}}},\"coastal\":{\"winter\":{\"temp\":{\"avgF\":44,\"lowF\":34,\"highF\":54},\"precip\":{\"type\":\"rain\",\"chancePct\":70,\"fogChancePct\":30},\"visibilityBand\":3,\"visibilityNotes\":\"Persistent drizzle, fog, and rain; coastal visibility often reduced.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"W\",\"WSW\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":0},{\"min\":11,\"max\":30,\"value\":25},{\"min\":31,\"max\":65,\"value\":50},{\"min\":66,\"max\":90,\"value\":75},{\"min\":91,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"WSW\"},{\"min\":56,\"max\":75,\"value\":\"SW\"},{\"min\":76,\"max\":90,\"value\":\"WNW\"},{\"min\":91,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":18,\"windBonusPct\":15,\"tempShiftF\":-2,\"types\":[{\"name\":\"Coastal Gale\",\"chancePct\":10,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Fogbound Rain\",\"chancePct\":8,\"effects\":[\"visibility-\",\"fog++\"]}]}},\"spring\":{\"temp\":{\"avgF\":52,\"lowF\":42,\"highF\":62},\"precip\":{\"type\":\"rain\",\"chancePct\":55,\"fogChancePct\":28},\"visibilityBand\":4,\"visibilityNotes\":\"Foggy mornings, clearing afternoons; showers common.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"WNW\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":40,\"value\":25},{\"min\":41,\"max\":75,\"value\":50},{\"min\":76,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"WNW\"},{\"min\":56,\"max\":75,\"value\":\"NW\"},{\"min\":76,\"max\":92,\"value\":\"SW\"},{\"min\":93,\"max\":100,\"value\":\"N\"}]},\"storms\":{\"criticalChancePct\":10,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"Spring Squall\",\"chancePct\":6,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Cold Mist\",\"chancePct\":4,\"effects\":[\"fog++\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":60,\"lowF\":52,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":20,\"fogChancePct\":35},\"visibilityBand\":4,\"visibilityNotes\":\"Marine fog common; otherwise fair weather.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"NNW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":55,\"value\":25},{\"min\":56,\"max\":88,\"value\":50},{\"min\":89,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":65,\"value\":\"NNW\"},{\"min\":66,\"max\":85,\"value\":\"W\"},{\"min\":86,\"max\":95,\"value\":\"WNW\"},{\"min\":96,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":5,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Summer Squall\",\"chancePct\":5,\"effects\":[\"wind+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":52,\"lowF\":42,\"highF\":62},\"precip\":{\"type\":\"rain\",\"chancePct\":60,\"fogChancePct\":30},\"visibilityBand\":3,\"visibilityNotes\":\"Rains return; fog thickens; wind picks up.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"WSW\",\"NW\"],\"percentTable\":[{\"min\":1,\"max\":12,\"value\":0},{\"min\":13,\"max\":35,\"value\":25},{\"min\":36,\"max\":70,\"value\":50},{\"min\":71,\"max\":92,\"value\":75},{\"min\":93,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"SW\"},{\"min\":56,\"max\":75,\"value\":\"WSW\"},{\"min\":76,\"max\":92,\"value\":\"NW\"},{\"min\":93,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":14,\"windBonusPct\":15,\"tempShiftF\":-2,\"types\":[{\"name\":\"Autumn Gale\",\"chancePct\":8,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Driving Rain\",\"chancePct\":6,\"effects\":[\"rain++\",\"visibility-\"]}]}}},\"inland\":{\"winter\":{\"temp\":{\"avgF\":38,\"lowF\":25,\"highF\":50},\"precip\":{\"type\":\"rain\",\"chancePct\":55,\"fogChancePct\":12},\"visibilityBand\":4,\"visibilityNotes\":\"Cold rains with occasional wet snow; clearer than the coast.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"S\",\"NW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":45,\"value\":25},{\"min\":46,\"max\":80,\"value\":50},{\"min\":81,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":60,\"value\":\"SW\"},{\"min\":61,\"max\":80,\"value\":\"S\"},{\"min\":81,\"max\":95,\"value\":\"NW\"},{\"min\":96,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":12,\"windBonusPct\":12,\"tempShiftF\":-4,\"types\":[{\"name\":\"Windstorm\",\"chancePct\":7,\"effects\":[\"wind+\",\"treefall+\"]},{\"name\":\"Wet Snow Burst\",\"chancePct\":5,\"effects\":[\"snow+\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":52,\"lowF\":40,\"highF\":65},\"precip\":{\"type\":\"rain\",\"chancePct\":45,\"fogChancePct\":10},\"visibilityBand\":5,\"visibilityNotes\":\"Best overland travel season; showers but good visibility.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"SW\",\"S\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":55,\"value\":25},{\"min\":56,\"max\":85,\"value\":50},{\"min\":86,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":60,\"value\":\"NW\"},{\"min\":61,\"max\":85,\"value\":\"SW\"},{\"min\":86,\"max\":95,\"value\":\"S\"},{\"min\":96,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":10,\"tempShiftF\":-1,\"types\":[{\"name\":\"Thunderburst\",\"chancePct\":4,\"effects\":[\"thunder+\",\"visibility-\"]},{\"name\":\"Gust Front\",\"chancePct\":4,\"effects\":[\"wind+\"]}]}},\"summer\":{\"temp\":{\"avgF\":70,\"lowF\":55,\"highF\":85},\"precip\":{\"type\":\"rain\",\"chancePct\":20,\"fogChancePct\":5},\"visibilityBand\":5,\"visibilityNotes\":\"Warm and generally fair; occasional thunderstorms inland.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":35,\"value\":0},{\"min\":36,\"max\":70,\"value\":25},{\"min\":71,\"max\":90,\"value\":50},{\"min\":91,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":75,\"value\":\"W\"},{\"min\":76,\"max\":95,\"value\":\"SW\"},{\"min\":96,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Thunderstorm\",\"chancePct\":6,\"effects\":[\"thunder+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":55,\"lowF\":42,\"highF\":68},\"precip\":{\"type\":\"rain\",\"chancePct\":40,\"fogChancePct\":8},\"visibilityBand\":4,\"visibilityNotes\":\"Cooling and wetter; storms increase later in the season.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"NW\",\"S\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":50,\"value\":25},{\"min\":51,\"max\":80,\"value\":50},{\"min\":81,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":60,\"value\":\"SW\"},{\"min\":61,\"max\":85,\"value\":\"NW\"},{\"min\":86,\"max\":95,\"value\":\"S\"},{\"min\":96,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":10,\"windBonusPct\":12,\"tempShiftF\":-2,\"types\":[{\"name\":\"Windstorm\",\"chancePct\":6,\"effects\":[\"wind+\",\"treefall+\"]},{\"name\":\"Cold Rain Line\",\"chancePct\":4,\"effects\":[\"rain++\",\"visibility-\"]}]}}}}}";

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
      log('dwt_regionweather_swordcoastnorth_4.3.1 startup err: ' + e);
    }
  }

  function registerWithCore(dwt){
    try{
      if(!dwt || typeof dwt.registerStartup !== 'function') return;
      dwt.registerStartup('dwt_regionweather_swordcoastnorth', moduleStartup);
    }catch(e){
      log('dwt_regionweather_swordcoastnorth register err: ' + e);
    }
  }

  RT.dwtQ = RT.dwtQ || [];
  RT.dwtQ.push(function(dwt){ registerWithCore(dwt); });

  if(RT.dwt && typeof RT.dwt.registerStartup === 'function') {
    registerWithCore(RT.dwt);
  }

  on('ready', function(){ moduleStartup(null); });
})();
