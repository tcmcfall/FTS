// name:        dwt_regionweather_frozenfar.js
// version:     4.3.1
// description: Frozenfar regional weather tables (regionWeather) for dwt_weather 4.3.x.
// provides:    dwt_mule ability: regionWeather (root JSON; regions.frozenfar (JSON)frozenfar.version
// notes:       Profile format updated to match dwt_weather_4.3.0 expectations:
//              - visibilityBand and seaStateBand are scalar values
//              - storms provides criticalChancePct, windBonusPct, tempShiftF (types[] preserved)
//
// author:      tcm (AI-assisted)

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '4.3.1';
  var REGION_KEY = 'frozenfar';
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

  var REGION_WEATHER_JSON = "{\"schema\":\"dwt.regionweather.v1\",\"region\":\"frozenfar\",\"displayName\":\"Frozenfar\",\"locales\":[\"offshore\",\"coastal\",\"inland\"],\"seasons\":[\"winter\",\"spring\",\"summer\",\"autumn\"],\"units\":{\"wind\":\"percent\",\"windSpeedReference\":\"knots\",\"temperature\":\"degF\",\"precipChance\":\"percent\",\"stormChance\":\"percent\"},\"windScale\":{\"0\":{\"label\":\"Calm\",\"knots\":\"0\u20131\"},\"25\":{\"label\":\"Light\",\"knots\":\"2\u20137\"},\"50\":{\"label\":\"Moderate\",\"knots\":\"8\u201315\"},\"75\":{\"label\":\"Strong\",\"knots\":\"16\u201325\"},\"100\":{\"label\":\"Gale\",\"knots\":\"26\u201340+\"}},\"updatePolicy\":{\"incrementalDrift\":{\"windPercentDeltaMax\":10,\"tempDeltaMaxF\":8,\"precipChanceDeltaMax\":10,\"visibilityDeltaMax\":1},\"allowWildSwingsOnlyOn\":[\"storm_event\",\"dm_override\",\"narrative_event\"]},\"profiles\":{\"offshore\":{\"winter\":{\"temp\":{\"avgF\":10,\"lowF\":-15,\"highF\":25},\"precip\":{\"type\":\"snow\",\"chancePct\":55,\"fogChancePct\":10},\"visibilityBand\":2,\"visibilityNotes\":\"Blowing snow common; whiteouts during storms.\",\"seaStateBand\":3,\"seaStateStormBand\":5,\"wind\":{\"prevailingDirs\":[\"N\",\"NNE\",\"NE\",\"ENE\"],\"percentTable\":[{\"min\":1,\"max\":5,\"value\":25},{\"min\":6,\"max\":20,\"value\":50},{\"min\":21,\"max\":60,\"value\":75},{\"min\":61,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"N\"},{\"min\":41,\"max\":65,\"value\":\"NNE\"},{\"min\":66,\"max\":85,\"value\":\"NE\"},{\"min\":86,\"max\":95,\"value\":\"ENE\"},{\"min\":96,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":35,\"windBonusPct\":25,\"tempShiftF\":-8,\"types\":[{\"name\":\"Arctic Gale\",\"chancePct\":20,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Blizzard Squall\",\"chancePct\":15,\"effects\":[\"visibility--\",\"ice_risk+\"]}]}},\"spring\":{\"temp\":{\"avgF\":25,\"lowF\":0,\"highF\":40},\"precip\":{\"type\":\"snow\",\"chancePct\":45,\"fogChancePct\":15},\"visibilityBand\":3,\"visibilityNotes\":\"Breakup season; fog banks and sleet.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"N\",\"NW\",\"NNW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":25},{\"min\":11,\"max\":40,\"value\":50},{\"min\":41,\"max\":80,\"value\":75},{\"min\":81,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"N\"},{\"min\":36,\"max\":60,\"value\":\"NNW\"},{\"min\":61,\"max\":80,\"value\":\"NW\"},{\"min\":81,\"max\":95,\"value\":\"W\"},{\"min\":96,\"max\":100,\"value\":\"NE\"}]},\"storms\":{\"criticalChancePct\":25,\"windBonusPct\":20,\"tempShiftF\":-4,\"types\":[{\"name\":\"Cold-Front Gale\",\"chancePct\":15,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Sleet Squall\",\"chancePct\":10,\"effects\":[\"ice_risk+\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":40,\"lowF\":25,\"highF\":55},\"precip\":{\"type\":\"rain\",\"chancePct\":30,\"fogChancePct\":20},\"visibilityBand\":4,\"visibilityNotes\":\"Clearer skies but persistent marine fog at times.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"W\",\"WNW\",\"NW\",\"NNW\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":25},{\"min\":26,\"max\":70,\"value\":50},{\"min\":71,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":30,\"value\":\"W\"},{\"min\":31,\"max\":55,\"value\":\"WNW\"},{\"min\":56,\"max\":80,\"value\":\"NW\"},{\"min\":81,\"max\":95,\"value\":\"NNW\"},{\"min\":96,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":10,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Summer Squall\",\"chancePct\":10,\"effects\":[\"wind+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":25,\"lowF\":0,\"highF\":40},\"precip\":{\"type\":\"snow\",\"chancePct\":50,\"fogChancePct\":15},\"visibilityBand\":3,\"visibilityNotes\":\"Rapid cooling; first serious gales return.\",\"seaStateBand\":3,\"seaStateStormBand\":5,\"wind\":{\"prevailingDirs\":[\"N\",\"NE\",\"ENE\",\"E\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":25},{\"min\":11,\"max\":35,\"value\":50},{\"min\":36,\"max\":75,\"value\":75},{\"min\":76,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"N\"},{\"min\":36,\"max\":60,\"value\":\"NE\"},{\"min\":61,\"max\":80,\"value\":\"ENE\"},{\"min\":81,\"max\":95,\"value\":\"E\"},{\"min\":96,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":30,\"windBonusPct\":25,\"tempShiftF\":-6,\"types\":[{\"name\":\"Autumn Gale\",\"chancePct\":20,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Early Blizzard\",\"chancePct\":10,\"effects\":[\"visibility--\",\"ice_risk+\"]}]}}},\"coastal\":{\"winter\":{\"temp\":{\"avgF\":12,\"lowF\":-10,\"highF\":28},\"precip\":{\"type\":\"snow\",\"chancePct\":60,\"fogChancePct\":20},\"visibilityBand\":2,\"visibilityNotes\":\"Frequent low visibility from fog + blowing snow.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"N\",\"NNE\",\"NE\"],\"percentTable\":[{\"min\":1,\"max\":10,\"value\":25},{\"min\":11,\"max\":35,\"value\":50},{\"min\":36,\"max\":80,\"value\":75},{\"min\":81,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"N\"},{\"min\":46,\"max\":75,\"value\":\"NNE\"},{\"min\":76,\"max\":95,\"value\":\"NE\"},{\"min\":96,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":30,\"windBonusPct\":20,\"tempShiftF\":-7,\"types\":[{\"name\":\"Coastal Gale\",\"chancePct\":18,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Whiteout Squall\",\"chancePct\":12,\"effects\":[\"visibility--\",\"ice_risk+\"]}]}},\"spring\":{\"temp\":{\"avgF\":28,\"lowF\":5,\"highF\":42},\"precip\":{\"type\":\"sleet\",\"chancePct\":50,\"fogChancePct\":25},\"visibilityBand\":3,\"visibilityNotes\":\"Fog and mixed precipitation common.\",\"seaStateBand\":2,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"NW\",\"NNW\",\"W\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":25},{\"min\":16,\"max\":50,\"value\":50},{\"min\":51,\"max\":90,\"value\":75},{\"min\":91,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NNW\"},{\"min\":41,\"max\":70,\"value\":\"NW\"},{\"min\":71,\"max\":90,\"value\":\"W\"},{\"min\":91,\"max\":100,\"value\":\"N\"}]},\"storms\":{\"criticalChancePct\":20,\"windBonusPct\":15,\"tempShiftF\":-3,\"types\":[{\"name\":\"Cold Squall\",\"chancePct\":12,\"effects\":[\"wind+\",\"visibility-\"]},{\"name\":\"Freezing Fog\",\"chancePct\":8,\"effects\":[\"ice_risk+\",\"visibility-\"]}]}},\"summer\":{\"temp\":{\"avgF\":42,\"lowF\":28,\"highF\":58},\"precip\":{\"type\":\"rain\",\"chancePct\":35,\"fogChancePct\":30},\"visibilityBand\":4,\"visibilityNotes\":\"Cool maritime air; fog can roll in quickly.\",\"seaStateBand\":1,\"seaStateStormBand\":3,\"wind\":{\"prevailingDirs\":[\"W\",\"WNW\",\"NW\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":25},{\"min\":31,\"max\":80,\"value\":50},{\"min\":81,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":35,\"value\":\"W\"},{\"min\":36,\"max\":65,\"value\":\"WNW\"},{\"min\":66,\"max\":90,\"value\":\"NW\"},{\"min\":91,\"max\":100,\"value\":\"SW\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Summer Squall\",\"chancePct\":8,\"effects\":[\"wind+\",\"visibility-\"]}]}},\"autumn\":{\"temp\":{\"avgF\":30,\"lowF\":5,\"highF\":45},\"precip\":{\"type\":\"snow\",\"chancePct\":55,\"fogChancePct\":25},\"visibilityBand\":3,\"visibilityNotes\":\"Increasing storms; coastal fog + first snows.\",\"seaStateBand\":2,\"seaStateStormBand\":4,\"wind\":{\"prevailingDirs\":[\"N\",\"NE\",\"E\"],\"percentTable\":[{\"min\":1,\"max\":15,\"value\":25},{\"min\":16,\"max\":45,\"value\":50},{\"min\":46,\"max\":85,\"value\":75},{\"min\":86,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"N\"},{\"min\":41,\"max\":70,\"value\":\"NE\"},{\"min\":71,\"max\":90,\"value\":\"E\"},{\"min\":91,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":25,\"windBonusPct\":20,\"tempShiftF\":-4,\"types\":[{\"name\":\"Autumn Gale\",\"chancePct\":15,\"effects\":[\"wind+\",\"sea+\",\"visibility-\"]},{\"name\":\"Early Blizzard\",\"chancePct\":10,\"effects\":[\"visibility--\",\"ice_risk+\"]}]}}},\"inland\":{\"winter\":{\"temp\":{\"avgF\":-5,\"lowF\":-35,\"highF\":10},\"precip\":{\"type\":\"snow\",\"chancePct\":45,\"fogChancePct\":5},\"visibilityBand\":3,\"visibilityNotes\":\"Clear but brutally cold; blizzards drop visibility fast.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"N\",\"NNE\",\"NE\"],\"percentTable\":[{\"min\":1,\"max\":25,\"value\":25},{\"min\":26,\"max\":70,\"value\":50},{\"min\":71,\"max\":95,\"value\":75},{\"min\":96,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":50,\"value\":\"N\"},{\"min\":51,\"max\":75,\"value\":\"NNE\"},{\"min\":76,\"max\":90,\"value\":\"NE\"},{\"min\":91,\"max\":100,\"value\":\"E\"}]},\"storms\":{\"criticalChancePct\":30,\"windBonusPct\":15,\"tempShiftF\":-12,\"types\":[{\"name\":\"Blizzard\",\"chancePct\":20,\"effects\":[\"visibility--\",\"wind+\",\"coldSnap+\"]},{\"name\":\"Cold Snap\",\"chancePct\":10,\"effects\":[\"coldSnap++\"]}]}},\"spring\":{\"temp\":{\"avgF\":15,\"lowF\":-10,\"highF\":35},\"precip\":{\"type\":\"snow\",\"chancePct\":35,\"fogChancePct\":10},\"visibilityBand\":4,\"visibilityNotes\":\"Clearer days; sudden squalls still occur.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"NW\",\"W\",\"N\"],\"percentTable\":[{\"min\":1,\"max\":35,\"value\":25},{\"min\":36,\"max\":80,\"value\":50},{\"min\":81,\"max\":98,\"value\":75},{\"min\":99,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"NW\"},{\"min\":41,\"max\":70,\"value\":\"W\"},{\"min\":71,\"max\":90,\"value\":\"N\"},{\"min\":91,\"max\":100,\"value\":\"NE\"}]},\"storms\":{\"criticalChancePct\":18,\"windBonusPct\":12,\"tempShiftF\":-5,\"types\":[{\"name\":\"Snow Squall\",\"chancePct\":10,\"effects\":[\"visibility-\",\"wind+\"]},{\"name\":\"Mudfreeze\",\"chancePct\":8,\"effects\":[\"ice_risk+\"]}]}},\"summer\":{\"temp\":{\"avgF\":45,\"lowF\":30,\"highF\":65},\"precip\":{\"type\":\"rain\",\"chancePct\":25,\"fogChancePct\":5},\"visibilityBand\":5,\"visibilityNotes\":\"Best overland travel season; occasional storms.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"W\",\"SW\",\"NW\"],\"percentTable\":[{\"min\":1,\"max\":45,\"value\":25},{\"min\":46,\"max\":90,\"value\":50},{\"min\":91,\"max\":99,\"value\":75},{\"min\":100,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":40,\"value\":\"W\"},{\"min\":41,\"max\":70,\"value\":\"SW\"},{\"min\":71,\"max\":90,\"value\":\"NW\"},{\"min\":91,\"max\":100,\"value\":\"N\"}]},\"storms\":{\"criticalChancePct\":8,\"windBonusPct\":10,\"tempShiftF\":0,\"types\":[{\"name\":\"Thunderstorm\",\"chancePct\":5,\"effects\":[\"thunder+\",\"visibility-\"]},{\"name\":\"Gust Front\",\"chancePct\":3,\"effects\":[\"wind+\"]}]}},\"autumn\":{\"temp\":{\"avgF\":20,\"lowF\":-5,\"highF\":40},\"precip\":{\"type\":\"snow\",\"chancePct\":40,\"fogChancePct\":10},\"visibilityBand\":4,\"visibilityNotes\":\"Cooling rapidly; storms increase toward winter.\",\"seaStateBand\":0,\"seaStateStormBand\":0,\"wind\":{\"prevailingDirs\":[\"N\",\"NE\",\"E\"],\"percentTable\":[{\"min\":1,\"max\":30,\"value\":25},{\"min\":31,\"max\":75,\"value\":50},{\"min\":76,\"max\":97,\"value\":75},{\"min\":98,\"max\":100,\"value\":100}],\"dirTable\":[{\"min\":1,\"max\":45,\"value\":\"N\"},{\"min\":46,\"max\":70,\"value\":\"NE\"},{\"min\":71,\"max\":90,\"value\":\"E\"},{\"min\":91,\"max\":100,\"value\":\"NW\"}]},\"storms\":{\"criticalChancePct\":20,\"windBonusPct\":12,\"tempShiftF\":-6,\"types\":[{\"name\":\"Early Blizzard\",\"chancePct\":10,\"effects\":[\"visibility--\",\"wind+\",\"ice_risk+\"]},{\"name\":\"Cold Rain Freeze\",\"chancePct\":10,\"effects\":[\"ice_risk+\",\"visibility-\"]}]}}}}}";

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
      log('dwt_regionweather_frozenfar_4.3.1 startup err: ' + e);
    }
  }

  function registerWithCore(dwt){
    try{
      if(!dwt || typeof dwt.registerStartup !== 'function') return;
      dwt.registerStartup('dwt_regionweather_frozenfar', moduleStartup);
    }catch(e){
      log('dwt_regionweather_frozenfar register err: ' + e);
    }
  }

  RT.dwtQ = RT.dwtQ || [];
  RT.dwtQ.push(function(dwt){ registerWithCore(dwt); });

  if(RT.dwt && typeof RT.dwt.registerStartup === 'function') {
    registerWithCore(RT.dwt);
  }

  on('ready', function(){ moduleStartup(null); });
})();
