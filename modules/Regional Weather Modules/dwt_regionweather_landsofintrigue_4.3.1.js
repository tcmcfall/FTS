// name:        dwt_regionweather_landsofintrigue.js
// version:     4.3.1
// description: Lands of Intrigue regional weather tables (regionWeather) for dwt_weather 4.3.x.
// provides:    dwt_mule ability: regionWeather (root JSON; regions.landsofintrigue (JSON)landsofintrigue.version
// notes:       Profile format matches dwt_weather expectations:
//              - visibilityBand and seaStateBand are scalar values
//              - storms provides criticalChancePct, windBonusPct, tempShiftF (types[] preserved)
//
// author:      tcm (AI-assisted)

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '4.3.1';
  var REGION_KEY = 'landsofintrigue';
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

  var REGION_WEATHER_JSON = "{\"schema\":\"dwt.regionweather.v1\",\"region\":\"landsofintrigue\",\"displayName\":\"Lands of Intrigue\",\"locales\":[\"offshore\",\"coastal\",\"inland\"],\"seasons\":[\"winter\",\"spring\",\"summer\",\"autumn\"],\"units\":{\"wind\":\"percent\",\"windSpeedReference\":\"knots\",\"temperature\":\"degF\",\"precipChance\":\"percent\",\"stormChance\":\"percent\"},\"windScale\":{\"0\":{\"label\":\"Calm\",\"knots\":\"0\u20131\"},\"25\":{\"label\":\"Light\",\"knots\":\"2\u20137\"},\"50\":{\"label\":\"Moderate\",\"knots\":\"8\u201315\"},\"75\":{\"label\":\"Strong\",\"knots\":\"16\u201325\"},\"100\":{\"label\":\"Gale\",\"knots\":\"26\u201340+\"}},\"updatePolicy\":{\"incrementalDrift\":{\"windPercentDeltaMax\":10,\"tempDeltaMaxF\":8,\"precipChanceDeltaMax\":10,\"visibilityDeltaMax\":1},\"allowWildSwingsOnlyOn\":[\"storm_event\",\"dm_override\",\"narrative_event\"]},\"profiles\":{\"offshore\":{\"winter\":{\"temp\":{\"avgF\":62,\"lowF\":55,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":15,\"fogChancePct\":10},\"visibilityBand\":5,\"visibilityNotes\":\"Clear horizons; occasional winter squalls; seas can build with fronts.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"WNW\",\"N\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":50,\"value\":25},{\"min\":51,\"max\":80,\"value\":50},{\"min\":81,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":70,\"value\":\"W\"},{\"min\":71,\"max\":88,\"value\":\"WNW\"},{\"min\":89,\"max\":96,\"value\":\"N\"},{\"min\":97,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":15,\"tempShiftF\":-2,\"types\":[{\"name\":\"Winter Front\",\"chancePct\":5,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Cold Squall\",\"chancePct\":3,\"effects\":[\"rain+\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":68,\"lowF\":60,\"highF\":76},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":10},\"visibilityBand\":5,\"visibilityNotes\":\"Dry and clear; steady breezes offshore.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"WNW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":40,\"value\":25},{\"min\":41,\"max\":75,\"value\":50},{\"min\":76,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":55,\"value\":\"NW\"},{\"min\":56,\"max\":80,\"value\":\"WNW\"},{\"min\":81,\"max\":95,\"value\":\"W\"},{\"min\":96,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":4,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Brief Squall\",\"chancePct\":4,\"effects\":[\"wind+\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":74,\"lowF\":66,\"highF\":82},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":15},\"visibilityBand\":5,\"visibilityNotes\":\"Hot sun and haze; occasional marine layer; afternoon winds common.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":0},{\"min\":11,\"max\":30,\"value\":25},{\"min\":31,\"max\":65,\"value\":50},{\"min\":66,\"max\":92,\"value\":75},{\"min\":93,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":60,\"value\":\"NW\"},{\"min\":61,\"max\":85,\"value\":\"W\"},{\"min\":86,\"max\":97,\"value\":\"WNW\"},{\"min\":98,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":5,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Heat Squall\",\"chancePct\":3,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Distant Thunderheads\",\"chancePct\":2,\"effects\":[\"thunder+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":70,\"lowF\":62,\"highF\":78},\"precip\":{\"type\":\"rain\",\"chancePct\":10,\"fogChancePct\":10},\"visibilityBand\":5,\"visibilityNotes\":\"Warm waters; late-season storms possible; winds begin to shift.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":0},{\"min\":16,\"max\":40,\"value\":25},{\"min\":41,\"max\":72,\"value\":50},{\"min\":73,\"max\":92,\"value\":75},{\"min\":93,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"NW\"},{\"min\":46,\"max\":70,\"value\":\"W\"},{\"min\":71,\"max\":88,\"value\":\"WNW\"},{\"min\":89,\"max\":96,\"value\":\"SW\"},{\"min\":97,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":7,\"windBonusPct\":15,\"tempShiftF\":-1,\"types\":[{\"name\":\"Late Storm\",\"chancePct\":5,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Hard Rain Burst\",\"chancePct\":2,\"effects\":[\"rain++\",\"visibility-\"]}]}}},\"coastal\":{\"winter\":{\"temp\":{\"avgF\":60,\"lowF\":50,\"highF\":70},\"precip\":{\"type\":\"rain\",\"chancePct\":20,\"fogChancePct\":15},\"visibilityBand\":5,\"visibilityNotes\":\"Mild winters; occasional rain; clear days dominate.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"N\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":0},{\"min\":31,\"max\":65,\"value\":25},{\"min\":66,\"max\":90,\"value\":50},{\"min\":91,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":50,\"value\":\"NW\"},{\"min\":51,\"max\":75,\"value\":\"W\"},{\"min\":76,\"max\":90,\"value\":\"N\"},{\"min\":91,\"max\":98,\"value\":\"WNW\"},{\"min\":99,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":12,\"tempShiftF\":-2,\"types\":[{\"name\":\"Coastal Squall\",\"chancePct\":4,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Cold Rain Line\",\"chancePct\":2,\"effects\":[\"rain+\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":68,\"lowF\":58,\"highF\":78},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":20},\"visibilityBand\":5,\"visibilityNotes\":\"Dry and pleasant; morning marine haze/fog can linger near bays.\",\"seaStateBand\":1,\"seaStateStormBand\":2,\"wind\":{\"prevailingDirs\":[\"NW\",\"WNW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":55,\"value\":25},{\"min\":56,\"max\":85,\"value\":50},{\"min\":86,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":60,\"value\":\"NW\"},{\"min\":61,\"max\":85,\"value\":\"WNW\"},{\"min\":86,\"max\":96,\"value\":\"W\"},{\"min\":97,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":3,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Sea Breeze Surge\",\"chancePct\":3,\"effects\":[\"wind+\"]}]}},\"summer\":{\"temp\":{\"avgF\":76,\"lowF\":66,\"highF\":86},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":25},\"visibilityBand\":5,\"visibilityNotes\":\"Hot afternoons; coastal fog in mornings; dry air overall.\",\"seaStateBand\":1,\"seaStateStormBand\":2,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":20,\"value\":0},{\"min\":21,\"max\":45,\"value\":25},{\"min\":46,\"max\":78,\"value\":50},{\"min\":79,\"max\":96,\"value\":75},{\"min\":97,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":60,\"value\":\"NW\"},{\"min\":61,\"max\":85,\"value\":\"W\"},{\"min\":86,\"max\":97,\"value\":\"WNW\"},{\"min\":98,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":4,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Heat Squall\",\"chancePct\":2,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Distant Thunderheads\",\"chancePct\":2,\"effects\":[\"thunder+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":72,\"lowF\":62,\"highF\":82},\"precip\":{\"type\":\"rain\",\"chancePct\":10,\"fogChancePct\":15},\"visibilityBand\":5,\"visibilityNotes\":\"Still warm; chance of late storms increases; clearer nights.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"SW\",\"WNW\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":55,\"value\":25},{\"min\":56,\"max\":82,\"value\":50},{\"min\":83,\"max\":96,\"value\":75},{\"min\":97,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":55,\"value\":\"NW\"},{\"min\":56,\"max\":80,\"value\":\"W\"},{\"min\":81,\"max\":93,\"value\":\"WNW\"},{\"min\":94,\"max\":98,\"value\":\"SW\"},{\"min\":99,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":6,\"windBonusPct\":12,\"tempShiftF\":-1,\"types\":[{\"name\":\"Late Storm\",\"chancePct\":4,\"effects\":[\"wind+\",\"visibility-\",\"rain+\"]},{\"name\":\"Hard Rain Burst\",\"chancePct\":2,\"effects\":[\"rain++\",\"visibility-\"]}]}}},\"inland\":{\"winter\":{\"temp\":{\"avgF\":55,\"lowF\":38,\"highF\":72},\"precip\":{\"type\":\"rain\",\"chancePct\":15,\"fogChancePct\":5},\"visibilityBand\":5,\"visibilityNotes\":\"Dry and cool; rain is uncommon but can come in sharp lines.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"N\",\"NE\",\"NW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":35,\"value\":0},{\"min\":36,\"max\":70,\"value\":25},{\"min\":71,\"max\":90,\"value\":50},{\"min\":91,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"N\"},{\"min\":46,\"max\":70,\"value\":\"NE\"},{\"min\":71,\"max\":90,\"value\":\"NW\"},{\"min\":91,\"max\":98,\"value\":\"W\"},{\"min\":99,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":5,\"windBonusPct\":12,\"tempShiftF\":-4,\"types\":[{\"name\":\"Cold Wind Dust\",\"chancePct\":3,\"effects\":[\"wind+\",\"dust+\"]},{\"name\":\"Brief Downpour\",\"chancePct\":2,\"effects\":[\"rain+\",\"visibility-\"]}]}},\"spring\":{\"temp\":{\"avgF\":74,\"lowF\":52,\"highF\":92},\"precip\":{\"type\":\"none\",\"chancePct\":5,\"fogChancePct\":0},\"visibilityBand\":5,\"visibilityNotes\":\"Warming fast; dry air; dust rises with afternoon winds.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"SW\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":0},{\"min\":31,\"max\":65,\"value\":25},{\"min\":66,\"max\":88,\"value\":50},{\"min\":89,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"W\"},{\"min\":46,\"max\":70,\"value\":\"NW\"},{\"min\":71,\"max\":92,\"value\":\"SW\"},{\"min\":93,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":4,\"windBonusPct\":12,\"tempShiftF\":0,\"types\":[{\"name\":\"Dust Wind\",\"chancePct\":3,\"effects\":[\"dust+\",\"visibility-\"]},{\"name\":\"Dry Thunderhead\",\"chancePct\":1,\"effects\":[\"thunder+\"]}]}},\"summer\":{\"temp\":{\"avgF\":92,\"lowF\":65,\"highF\":112},\"precip\":{\"type\":\"none\",\"chancePct\":10,\"fogChancePct\":0},\"visibilityBand\":5,\"visibilityNotes\":\"Blazing heat; mirages and heat haze; storms rare but violent when they strike.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"SW\",\"W\",\"NW\",\"S\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":0},{\"min\":26,\"max\":55,\"value\":25},{\"min\":56,\"max\":80,\"value\":50},{\"min\":81,\"max\":92,\"value\":75},{\"min\":93,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"SW\"},{\"min\":36,\"max\":60,\"value\":\"W\"},{\"min\":61,\"max\":82,\"value\":\"NW\"},{\"min\":83,\"max\":95,\"value\":\"S\"},{\"min\":96,\"max\":100,\"value\":\"SE\"}]},\"storms\":{\"criticalChancePct\":10,\"windBonusPct\":20,\"tempShiftF\":0,\"types\":[{\"name\":\"Desert Thunderstorm\",\"chancePct\":6,\"effects\":[\"thunder++\",\"flashFlood+\",\"visibility-\"]},{\"name\":\"Sandstorm\",\"chancePct\":4,\"effects\":[\"visibility--\",\"dust++\",\"wind+\"]}]}},\"autumn\":{\"temp\":{\"avgF\":78,\"lowF\":55,\"highF\":98},\"precip\":{\"type\":\"none\",\"chancePct\":10,\"fogChancePct\":0},\"visibilityBand\":5,\"visibilityNotes\":\"Heat breaks gradually; late storms possible; nights cool quickly.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"NW\",\"SW\",\"N\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":0},{\"min\":31,\"max\":65,\"value\":25},{\"min\":66,\"max\":88,\"value\":50},{\"min\":89,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"W\"},{\"min\":41,\"max\":65,\"value\":\"NW\"},{\"min\":66,\"max\":88,\"value\":\"SW\"},{\"min\":89,\"max\":96,\"value\":\"N\"},{\"min\":97,\"max\":100,\"value\":\"S\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":18,\"tempShiftF\":-1,\"types\":[{\"name\":\"Late Thunderstorm\",\"chancePct\":5,\"effects\":[\"thunder+\",\"flashFlood+\",\"visibility-\"]},{\"name\":\"Dust Wind\",\"chancePct\":3,\"effects\":[\"dust+\",\"visibility-\"]}]}}}}}";

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
      log('dwt_regionweather_landsofintrigue_4.3.1 startup err: ' + e);
    }
  }

  function registerWithCore(dwt){
    try{
      if(!dwt || typeof dwt.registerStartup !== 'function') return;
      dwt.registerStartup('dwt_regionweather_landsofintrigue', moduleStartup);
    }catch(e){
      log('dwt_regionweather_landsofintrigue register err: ' + e);
    }
  }

  RT.dwtQ = RT.dwtQ || [];
  RT.dwtQ.push(function(dwt){ registerWithCore(dwt); });

  if(RT.dwt && typeof RT.dwt.registerStartup === 'function') {
    registerWithCore(RT.dwt);
  }

  on('ready', function(){ moduleStartup(null); });
})();
