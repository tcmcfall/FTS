// name:        dwt_regionBuilder_0.1.0-alpha.1.js
// version:     0.1.0-alpha.1
// description: GM-only generator for dwt.region.v4 modules and locale snippets.
// depends:     dwt_core >= 0.1.0-alpha.1 (optional but recommended), Roll20 Mod API
// provides:    !dwt --regionbuilder
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

var dwt_regionBuilder = dwt_regionBuilder || (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined') ? window
         : (typeof self !== 'undefined') ? self
         : (typeof global !== 'undefined') ? global
         : this;

  var VERSION = '0.1.0-alpha.1';
  var MODULE_KEY = 'regionbuilder';
  var MODULE_NAME = 'dwt_regionBuilder';
  var DWT_MULE = 'dwt_mule';
  var OUTPUT_HANDOUT_NAME = 'Region Builder Output';
  var _registered = false;

  var CANONICAL_LOCALES = ['offshore','coastal','inland','underwater','underdark'];
  var PERIOD_ORDER = [
    'hammer','midwinter','alturiak','ches','tarsakh','greengrass','mirtul','kythorn',
    'flamerule','midsummer','shieldmeet','eleasis','eleint','highharvestide',
    'marpenoth','uktar','feastofthemoon','nightal'
  ];
  var PERIOD_INFO = {
    hammer:{ label:'Hammer', season:'winter' },
    midwinter:{ label:'Midwinter', season:'winter' },
    alturiak:{ label:'Alturiak', season:'winter' },
    ches:{ label:'Ches', season:'spring' },
    tarsakh:{ label:'Tarsakh', season:'spring' },
    greengrass:{ label:'Greengrass', season:'spring' },
    mirtul:{ label:'Mirtul', season:'spring' },
    kythorn:{ label:'Kythorn', season:'summer' },
    flamerule:{ label:'Flamerule', season:'summer' },
    midsummer:{ label:'Midsummer', season:'summer' },
    shieldmeet:{ label:'Shieldmeet', season:'summer' },
    eleasis:{ label:'Eleasis', season:'summer' },
    eleint:{ label:'Eleint', season:'autumn' },
    highharvestide:{ label:'Highharvestide', season:'autumn' },
    marpenoth:{ label:'Marpenoth', season:'autumn' },
    uktar:{ label:'Uktar', season:'autumn' },
    feastofthemoon:{ label:'Feast of the Moon', season:'autumn' },
    nightal:{ label:'Nightal', season:'winter' }
  };
  var TIMEOFDAY_SEGMENT_KEYS = ['earlypredawn','latepredawn','earlymorning','latemorning','earlyafternoon','lateafternoon','earlyevening','lateevening'];
  var DEFAULT_TIMEOFDAY_SEGMENTS = {
    earlypredawn:{ temperatureSwingPct:-100, temperatureDelta:-1, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-10, directionChangePct:15 },
    latepredawn:{ temperatureSwingPct:-67, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-5, directionChangePct:18 },
    earlymorning:{ temperatureSwingPct:-17, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:0, directionChangePct:22 },
    latemorning:{ temperatureSwingPct:17, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:5, directionChangePct:26 },
    earlyafternoon:{ temperatureSwingPct:67, temperatureDelta:1, precipitationDelta:0, skiesDelta:0, windDelta:1, windStrengthDeltaPct:10, directionChangePct:32 },
    lateafternoon:{ temperatureSwingPct:50, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:1, windStrengthDeltaPct:8, directionChangePct:30 },
    earlyevening:{ temperatureSwingPct:0, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:0, windStrengthDeltaPct:2, directionChangePct:24 },
    lateevening:{ temperatureSwingPct:-33, temperatureDelta:0, precipitationDelta:0, skiesDelta:0, windDelta:-1, windStrengthDeltaPct:-5, directionChangePct:20 }
  };
  var DEFAULT_CLIMATE_CONTROL = {
    diurnal:{
      lowTimeHHMM:'0559',
      highTimeHHMM:'1400',
      riseCurve:2.0,
      fallCurve:1.2
    },
    governor:{
      temperatureMaxDeltaF:3,
      rainMaxStep:1,
      skyMaxStep:1,
      windMaxStep:1,
      currentStrengthMaxDeltaPct:12,
      currentTemperatureMaxDeltaF:3,
      currentDirectionMaxStep:2,
      interpolateWindStrength:true,
      interpolateCurrentStrength:true,
      interpolateCurrentTemperature:true
    },
    activation:{
      skyLeadMinutes:{ min:30, max:90 },
      precipitationDurationMinutes:{ min:45, max:165 },
      eventStartOffsetMinutes:{ min:10, max:45 },
      eventTailBufferMinutes:{ min:10, max:30 }
    }
  };
  var DEFAULT_WATER_PROFILES = {
    offshore:{
      bodyType:'open_ocean',
      totalDepthFeet:600,
      sampleMode:'fixed_fathoms',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    coastline:{
      bodyType:'coastline',
      totalDepthFeet:90,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    lake:{
      bodyType:'lake',
      totalDepthFeet:60,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    river:{
      bodyType:'river',
      totalDepthFeet:18,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    },
    reef:{
      bodyType:'reef',
      totalDepthFeet:90,
      sampleMode:'fractional_depth',
      sampleFractions:{ shallow:0.2, mid:0.6, deep:0.8 },
      sampleDepthsFathoms:{ shallow:1, mid:5, deep:10 }
    }
  };
  var DEFAULT_REFERENCE_SOURCES = [
    {
      label:'ECMWF ERA5 Reanalysis',
      url:'https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5',
      usage:'Global atmospheric climatology for air temperature, prevailing winds, precipitation, and seasonal belt shifts.'
    },
    {
      label:'Copernicus Marine Global Ocean Physics Analysis and Forecast',
      url:'https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description',
      usage:'Global current direction, current strength, and subsurface ocean temperature structure.'
    },
    {
      label:'NOAA NCEI OISST',
      url:'https://www.ncei.noaa.gov/products/optimum-interpolation-sst',
      usage:'Sea-surface temperature sanity check for open-ocean and coastal surface layers.'
    },
    {
      label:'USGS Streamflow Measurement Guidance',
      url:'https://www.usgs.gov/water-science-school/science/how-streamflow-measured',
      usage:'Three-point vertical sampling logic for rivers, lakes, and other non-ocean water columns.'
    }
  ];
  var DEFAULT_LOCALE_PRESETS = {
    offshore:'ocean',
    coastal:'coastline',
    inland:'plains',
    underwater:'reef',
    underdark:'caverns'
  };
  var BASELINE_SEASONS = {
    winter:{
      temperature:{ avgF:38, lowF:28, highF:48 },
      precipitation:{ chancePct:45, type:'auto', intensityWeights:{ light:50, moderate:35, heavy:15 } },
      wind:{
        directionWeights:[{ value:'NW', weight:40 }, { value:'W', weight:35 }, { value:'SW', weight:25 }],
        strengthWeights:[{ value:0, weight:10 }, { value:25, weight:20 }, { value:50, weight:35 }, { value:75, weight:25 }, { value:100, weight:10 }]
      },
      critical:{
        chancePct:8,
        eventWeights:[{ value:'winter_gale', weight:60 }, { value:'blizzard', weight:40 }],
        severityWeights:{ light:50, moderate:30, heavy:15, severe:5 }
      },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    spring:{
      temperature:{ avgF:54, lowF:42, highF:64 },
      precipitation:{ chancePct:35, type:'rain', intensityWeights:{ light:55, moderate:30, heavy:15 } },
      wind:{
        directionWeights:[{ value:'W', weight:35 }, { value:'SW', weight:35 }, { value:'NW', weight:30 }],
        strengthWeights:[{ value:0, weight:10 }, { value:25, weight:25 }, { value:50, weight:40 }, { value:75, weight:20 }, { value:100, weight:5 }]
      },
      critical:{
        chancePct:6,
        eventWeights:[{ value:'thunderstorm', weight:60 }, { value:'flash_flood', weight:40 }],
        severityWeights:{ light:50, moderate:30, heavy:15, severe:5 }
      },
      drift:{ temperature:1, precipitation:2, skies:1, wind:1, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    summer:{
      temperature:{ avgF:72, lowF:60, highF:82 },
      precipitation:{ chancePct:20, type:'rain', intensityWeights:{ light:65, moderate:25, heavy:10 } },
      wind:{
        directionWeights:[{ value:'SW', weight:40 }, { value:'W', weight:35 }, { value:'S', weight:25 }],
        strengthWeights:[{ value:0, weight:15 }, { value:25, weight:30 }, { value:50, weight:35 }, { value:75, weight:15 }, { value:100, weight:5 }]
      },
      critical:{
        chancePct:5,
        eventWeights:[{ value:'thunderstorm', weight:50 }, { value:'wildfire', weight:25 }, { value:'heat_wave', weight:25 }],
        severityWeights:{ light:55, moderate:28, heavy:13, severe:4 }
      },
      drift:{ temperature:2, precipitation:1, skies:1, wind:1, directionChangePct:20, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    autumn:{
      temperature:{ avgF:58, lowF:46, highF:68 },
      precipitation:{ chancePct:40, type:'rain', intensityWeights:{ light:50, moderate:35, heavy:15 } },
      wind:{
        directionWeights:[{ value:'W', weight:40 }, { value:'NW', weight:35 }, { value:'SW', weight:25 }],
        strengthWeights:[{ value:0, weight:10 }, { value:25, weight:25 }, { value:50, weight:35 }, { value:75, weight:20 }, { value:100, weight:10 }]
      },
      critical:{
        chancePct:7,
        eventWeights:[{ value:'sea_storm', weight:40 }, { value:'winter_gale', weight:35 }, { value:'flash_flood', weight:25 }],
        severityWeights:{ light:50, moderate:30, heavy:15, severe:5 }
      },
      drift:{ temperature:1, precipitation:2, skies:1, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    }
  };
  var BASELINE_CURRENTS = {
    winter:{
      direction:'NW',
      readings:{
        surface:{ direction:'NW', temperatureF:50, strengthPct:18 },
        shallow:{ direction:'NW', temperatureF:48, strengthPct:36 },
        mid:{ direction:'WNW', temperatureF:46, strengthPct:34 },
        deep:{ direction:'W', temperatureF:44, strengthPct:32 }
      }
    },
    spring:{
      direction:'W',
      readings:{
        surface:{ direction:'W', temperatureF:56, strengthPct:16 },
        shallow:{ direction:'W', temperatureF:54, strengthPct:32 },
        mid:{ direction:'W', temperatureF:52, strengthPct:30 },
        deep:{ direction:'WNW', temperatureF:49, strengthPct:28 }
      }
    },
    summer:{
      direction:'SW',
      readings:{
        surface:{ direction:'SW', temperatureF:64, strengthPct:14 },
        shallow:{ direction:'SW', temperatureF:62, strengthPct:28 },
        mid:{ direction:'WSW', temperatureF:59, strengthPct:26 },
        deep:{ direction:'W', temperatureF:55, strengthPct:24 }
      }
    },
    autumn:{
      direction:'W',
      readings:{
        surface:{ direction:'W', temperatureF:58, strengthPct:16 },
        shallow:{ direction:'W', temperatureF:56, strengthPct:32 },
        mid:{ direction:'W', temperatureF:53, strengthPct:30 },
        deep:{ direction:'WNW', temperatureF:50, strengthPct:28 }
      }
    }
  };
  var BIOME_PRESETS = {
    forest:{
      label:'Forest',
      description:'Cooler, wetter, sheltered surface woodland.',
      environment:'surface',
      biome:'forest',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:-2, lowDeltaF:-2, highDeltaF:-3 },
      precipitation:{ chanceDeltaPct:10, type:'auto' },
      critical:{ chanceDeltaPct:2, eventWeights:[{ value:'thunderstorm', weight:60 }, { value:'wildfire', weight:40 }] },
      drift:{ temperature:1, precipitation:2, skies:1, wind:1, directionChangePct:20, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    hills:{
      label:'Hills',
      description:'Open uplands with stronger gusts and cooler nights.',
      environment:'surface',
      biome:'hills',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:-1, lowDeltaF:-3, highDeltaF:-1 },
      precipitation:{ chanceDeltaPct:-5, type:'auto' },
      critical:{ chanceDeltaPct:1, eventWeights:[{ value:'winter_gale', weight:40 }, { value:'thunderstorm', weight:60 }] },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    mountains:{
      label:'Mountains',
      description:'Cold, exposed heights with stronger storms.',
      environment:'surface',
      biome:'mountains',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:-10, lowDeltaF:-12, highDeltaF:-8 },
      precipitation:{ chanceDeltaPct:5, type:'auto' },
      critical:{ chanceDeltaPct:4, eventWeights:[{ value:'blizzard', weight:50 }, { value:'winter_gale', weight:30 }, { value:'earthquake', weight:20 }] },
      drift:{ temperature:2, precipitation:2, skies:1, wind:3, directionChangePct:30, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    swamp:{
      label:'Swamp',
      description:'Warm, humid, waterlogged terrain with haze and floods.',
      environment:'surface',
      biome:'swamp',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:3, lowDeltaF:2, highDeltaF:2 },
      precipitation:{ chanceDeltaPct:20, type:'rain' },
      critical:{ chanceDeltaPct:3, eventWeights:[{ value:'flash_flood', weight:55 }, { value:'toxic_fog', weight:45 }] },
      drift:{ temperature:1, precipitation:2, skies:2, wind:1, directionChangePct:20, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    jungle:{
      label:'Jungle',
      description:'Hot, wet, storm-heavy tropical growth.',
      environment:'surface',
      biome:'jungle',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:8, lowDeltaF:6, highDeltaF:8 },
      precipitation:{ chanceDeltaPct:25, type:'rain' },
      critical:{ chanceDeltaPct:4, eventWeights:[{ value:'thunderstorm', weight:60 }, { value:'flash_flood', weight:25 }, { value:'wildfire', weight:15 }] },
      drift:{ temperature:2, precipitation:2, skies:2, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    desert:{
      label:'Desert',
      description:'Dry, hot, volatile open desert.',
      environment:'surface',
      biome:'desert',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:14, lowDeltaF:8, highDeltaF:18 },
      precipitation:{ chanceDeltaPct:-25, type:'auto' },
      critical:{ chanceDeltaPct:4, eventWeights:[{ value:'sandstorm', weight:55 }, { value:'heat_wave', weight:45 }] },
      drift:{ temperature:3, precipitation:1, skies:1, wind:2, directionChangePct:30, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    coastline:{
      label:'Coastline',
      description:'Nearshore land-sea transition with marine moderation and a sea-breeze cycle.',
      environment:'surface',
      biome:'coastline',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.coastline,
      temperature:{ avgDeltaF:-1, lowDeltaF:0, highDeltaF:-2 },
      precipitation:{ chanceDeltaPct:8, type:'rain' },
      critical:{ chanceDeltaPct:3, eventWeights:[{ value:'sea_storm', weight:55 }, { value:'winter_gale', weight:25 }, { value:'thunderstorm', weight:20 }] },
      current:{
        readings:{
          surface:{ temperatureDeltaF:0, strengthDeltaPct:-4 },
          shallow:{ temperatureDeltaF:-1, strengthDeltaPct:4 },
          mid:{ temperatureDeltaF:-1, strengthDeltaPct:2 },
          deep:{ temperatureDeltaF:-2, strengthDeltaPct:0 }
        }
      },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:28, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    ocean:{
      label:'Ocean',
      description:'Open saltwater with prevailing current influence.',
      environment:'surface',
      biome:'ocean',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.offshore,
      temperature:{ avgDeltaF:-2, lowDeltaF:-1, highDeltaF:-2 },
      precipitation:{ chanceDeltaPct:10, type:'rain' },
      critical:{ chanceDeltaPct:3, eventWeights:[{ value:'sea_storm', weight:70 }, { value:'rogue_wave', weight:30 }] },
      current:{
        readings:{
          surface:{ temperatureDeltaF:0, strengthDeltaPct:-6 },
          shallow:{ temperatureDeltaF:-1, strengthDeltaPct:10 },
          mid:{ temperatureDeltaF:-2, strengthDeltaPct:8 },
          deep:{ temperatureDeltaF:-4, strengthDeltaPct:6 }
        }
      },
      drift:{ temperature:1, precipitation:2, skies:1, wind:2, directionChangePct:30, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    lake:{
      label:'Lake',
      description:'Sheltered nearshore water and littoral climate.',
      environment:'surface',
      biome:'lake',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.lake,
      temperature:{ avgDeltaF:-1, lowDeltaF:-1, highDeltaF:-1 },
      precipitation:{ chanceDeltaPct:5, type:'rain' },
      critical:{ chanceDeltaPct:2, eventWeights:[{ value:'sea_storm', weight:50 }, { value:'flash_flood', weight:50 }] },
      current:{
        readings:{
          surface:{ temperatureDeltaF:1, strengthDeltaPct:-8 },
          shallow:{ temperatureDeltaF:0, strengthDeltaPct:4 },
          mid:{ temperatureDeltaF:-1, strengthDeltaPct:2 },
          deep:{ temperatureDeltaF:-3, strengthDeltaPct:-2 }
        }
      },
      drift:{ temperature:1, precipitation:1, skies:1, wind:1, directionChangePct:20, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    river:{
      label:'River',
      description:'Channelized fresh water with a faster mean flow and shallower sampling depths.',
      environment:'surface',
      biome:'river',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.river,
      temperature:{ avgDeltaF:0, lowDeltaF:-1, highDeltaF:1 },
      precipitation:{ chanceDeltaPct:2, type:'rain' },
      critical:{ chanceDeltaPct:3, eventWeights:[{ value:'flash_flood', weight:70 }, { value:'toxic_fog', weight:30 }] },
      current:{
        readings:{
          surface:{ temperatureDeltaF:0, strengthDeltaPct:-2 },
          shallow:{ temperatureDeltaF:0, strengthDeltaPct:14 },
          mid:{ temperatureDeltaF:-1, strengthDeltaPct:12 },
          deep:{ temperatureDeltaF:-2, strengthDeltaPct:4 }
        }
      },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:24, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    plains:{
      label:'Plains',
      description:'Open surface baseline with room for storms and heat.',
      environment:'surface',
      biome:'plains',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:0, lowDeltaF:0, highDeltaF:0 },
      precipitation:{ chanceDeltaPct:0, type:'auto' },
      critical:{ chanceDeltaPct:2, eventWeights:[{ value:'thunderstorm', weight:65 }, { value:'wildfire', weight:35 }] },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    tundra:{
      label:'Tundra',
      description:'Frozen open terrain with blizzard pressure.',
      environment:'surface',
      biome:'tundra',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:-12, lowDeltaF:-14, highDeltaF:-10 },
      precipitation:{ chanceDeltaPct:-10, type:'snow' },
      critical:{ chanceDeltaPct:4, eventWeights:[{ value:'blizzard', weight:60 }, { value:'ice_storm', weight:40 }] },
      drift:{ temperature:2, precipitation:1, skies:1, wind:3, directionChangePct:30, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    caverns:{
      label:'Caverns',
      description:'Stable subterranean passages with seepage and collapse risk.',
      environment:'subterranean',
      biome:'caverns',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:-6, lowDeltaF:-2, highDeltaF:-6 },
      precipitation:{ chanceDeltaPct:15, type:'drip' },
      critical:{ chanceDeltaPct:3, eventWeights:[{ value:'cave_in', weight:55 }, { value:'toxic_fog', weight:45 }] },
      drift:{ temperature:1, precipitation:1, skies:1, wind:1, directionChangePct:20, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    volcanic:{
      label:'Volcanic',
      description:'Hot, unstable terrain with ash and eruption risk.',
      environment:'surface',
      biome:'volcanic',
      useSeasonalCurrent:false,
      temperature:{ avgDeltaF:12, lowDeltaF:8, highDeltaF:14 },
      precipitation:{ chanceDeltaPct:-10, type:'auto' },
      critical:{ chanceDeltaPct:5, eventWeights:[{ value:'volcanic_eruption', weight:55 }, { value:'ashfall', weight:45 }] },
      drift:{ temperature:2, precipitation:1, skies:2, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    },
    reef:{
      label:'Reef',
      description:'Shallow underwater locale with stronger current detail.',
      environment:'underwater',
      biome:'reef',
      useSeasonalCurrent:true,
      waterProfile:DEFAULT_WATER_PROFILES.reef,
      temperature:{ avgDeltaF:2, lowDeltaF:2, highDeltaF:2 },
      precipitation:{ chanceDeltaPct:-100, type:'none' },
      critical:{ chanceDeltaPct:4, eventWeights:[{ value:'sea_storm', weight:50 }, { value:'maelstrom', weight:50 }] },
      current:{
        readings:{
          surface:{ temperatureDeltaF:2, strengthDeltaPct:-4 },
          shallow:{ temperatureDeltaF:2, strengthDeltaPct:15 },
          mid:{ temperatureDeltaF:1, strengthDeltaPct:12 },
          deep:{ temperatureDeltaF:0, strengthDeltaPct:8 }
        }
      },
      drift:{ temperature:1, precipitation:1, skies:1, wind:2, directionChangePct:25, timeofdaySegments:DEFAULT_TIMEOFDAY_SEGMENTS }
    }
  };

  function cloneJSON(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function esc(s){
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function canonicalKey(s){
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function canonicalRegionKey(s){
    return String(s || '').trim().toLowerCase().replace(/[^a-z]+/g, '');
  }

  function titleCaseWords(s){
    return String(s || '').trim().replace(/\s+/g, ' ').replace(/\b([a-z])/g, function(_, c){
      return c.toUpperCase();
    });
  }

  function playerName(pid){
    try{
      var p = getObj('player', pid);
      return p ? (p.get('displayname') || 'GM') : 'GM';
    }catch(e){
      return 'GM';
    }
  }

  function whisper(pid, html){
    try{
      sendChat('dwt', '/w "' + playerName(pid) + '" ' + html);
    }catch(e){}
  }

  function isGM(pid){
    try{ return !!playerIsGM(pid); }catch(e){ return false; }
  }

  function splitPipeArgs(s){
    return String(s || '').split('|').map(function(part){
      return String(part || '').trim();
    }).filter(function(part){
      return !!part;
    });
  }

  function getOrCreateMule(){
    try{
      if(RT.dwt && typeof RT.dwt.ensureMule === 'function') return RT.dwt.ensureMule();
    }catch(e){}
    var mule = findObjs({ _type:'character', name:DWT_MULE })[0];
    if(!mule){
      mule = createObj('character', {
        name: DWT_MULE,
        archived: false,
        inplayerjournals: '',
        controlledby: ''
      });
    }
    return mule;
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function upsertAbility(character, name, action){
    if(!character) return;
    var ability = findObjs({ _type:'ability', _characterid:character.id, name:name })[0];
    if(ability){
      ability.set({ action:String(action || '') });
    }else{
      createObj('ability', {
        characterid: character.id,
        name: name,
        action: String(action || ''),
        istokenaction: false
      });
    }
  }

  function parseVersionRoot(raw){
    var out = {};
    String(raw || '').split('\r').join('').split('\n').forEach(function(line){
      line = String(line || '').trim();
      if(!line) return;
      var idx = line.indexOf('=');
      if(idx <= 0) return;
      out[canonicalKey(line.slice(0, idx))] = String(line.slice(idx + 1) || '').trim();
    });
    return out;
  }

  function serializeVersionRoot(root){
    return Object.keys(root || {}).sort().map(function(key){
      return canonicalKey(key) + '=' + String(root[key] || '').trim();
    }).filter(function(line){
      return !!line.split('=')[0];
    }).join('\n');
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var key = canonicalKey(moduleKey);
    if(!key) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    var version = String(moduleVersion || '').trim();
    root[key] = version;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }

  function findHandout(name){
    return findObjs({ _type:'handout', name:name })[0] || null;
  }

  function upsertGmHandout(name, title, code){
    var handout = findHandout(name);
    if(!handout){
      handout = createObj('handout', {
        name: name,
        inplayerjournals: '',
        controlledby: ''
      });
    }
    var html = '<div><b>' + esc(title) + '</b></div><div style="margin-top:6px;">Generated by dwt_regionBuilder.</div><pre>'
      + esc(code)
      + '</pre>';
    try{ handout.set({ notes:html, gmnotes:code, inplayerjournals:'', controlledby:'' }); }catch(e){}
    return handout;
  }

  function defaultStepWeights(maxDelta){
    maxDelta = Math.max(1, Math.min(3, Math.round(+maxDelta || 1)));
    if(maxDelta === 1){
      return [{ value:-1, weight:20 }, { value:0, weight:60 }, { value:1, weight:20 }];
    }
    if(maxDelta === 2){
      return [{ value:-2, weight:10 }, { value:-1, weight:20 }, { value:0, weight:40 }, { value:1, weight:20 }, { value:2, weight:10 }];
    }
    return [{ value:-3, weight:8 }, { value:-2, weight:12 }, { value:-1, weight:18 }, { value:0, weight:24 }, { value:1, weight:18 }, { value:2, weight:12 }, { value:3, weight:8 }];
  }

  function basePeriodForKey(periodKey){
    var season = (PERIOD_INFO[periodKey] || PERIOD_INFO.hammer).season;
    return cloneJSON(BASELINE_SEASONS[season]);
  }

  function buildManualTableTemplate(){
    return {
      default:{
        temperatureSteps: defaultStepWeights(1),
        precipitationSteps: defaultStepWeights(1),
        skySteps: defaultStepWeights(1),
        windSteps: defaultStepWeights(1),
        directionChangePct: 25,
        criticalChancePct: 5,
        eventWeights:[{ value:'winter_gale', weight:35 }, { value:'thunderstorm', weight:35 }, { value:'sea_storm', weight:30 }],
        severityWeights:{ light:50, moderate:30, heavy:15, severe:5 }
      }
    };
  }

  function buildSeasonalCurrents(){
    return cloneJSON(BASELINE_CURRENTS);
  }

  function buildBiomeLocaleDefinition(localeKey, label, presetKey, token, isDefault){
    var preset = BIOME_PRESETS[presetKey];
    if(!preset) throw new Error('Unknown biome preset: ' + presetKey);
    var def = {
      label: titleCaseWords(label || localeKey),
      token: titleCaseWords(token || label || localeKey),
      environment: preset.environment,
      biome: preset.biome,
      climateMode: 'offset',
      inherits: 'region',
      useSeasonalCurrent: !!preset.useSeasonalCurrent
    };
    if(preset.useSeasonalCurrent && preset.waterProfile){
      def.waterProfile = cloneJSON(preset.waterProfile);
    }
    if(isDefault) return def;

    def.periods = {};
    for(var i=0;i<PERIOD_ORDER.length;i++){
      var periodKey = PERIOD_ORDER[i];
      var period = {};
      if(preset.temperature){
        period.temperature = cloneJSON(preset.temperature);
      }
      if(preset.precipitation){
        period.precipitation = cloneJSON(preset.precipitation);
      }
      if(preset.critical){
        period.critical = cloneJSON(preset.critical);
      }
      if(preset.drift){
        period.drift = cloneJSON(preset.drift);
      }
      if(preset.current){
        period.current = cloneJSON(preset.current);
      }
      def.periods[periodKey] = period;
    }
    return def;
  }

  function buildDefaultRegionEntry(regionKey, displayName, defaultLocale){
    var localeDefinitions = {};
    for(var i=0;i<CANONICAL_LOCALES.length;i++){
      var localeKey = CANONICAL_LOCALES[i];
      var label = titleCaseWords(localeKey);
      localeDefinitions[localeKey] = buildBiomeLocaleDefinition(
        localeKey,
        label,
        DEFAULT_LOCALE_PRESETS[localeKey],
        label,
        localeKey === defaultLocale
      );
    }

    var periods = {};
    for(var pi=0;pi<PERIOD_ORDER.length;pi++){
      periods[PERIOD_ORDER[pi]] = basePeriodForKey(PERIOD_ORDER[pi]);
    }

    return {
      schema:'dwt.region.v4',
      region:regionKey,
      displayName:displayName,
      defaultLocale:defaultLocale,
      locales:CANONICAL_LOCALES.slice(),
      campaignLocations:[],
      referenceSources:cloneJSON(DEFAULT_REFERENCE_SOURCES),
      sourceNotes:[
        'Climate analogue: Replace with the real-world or setting analogue.',
        'Use ECMWF ERA5 for monthly air temperature, precipitation, and prevailing wind defaults.',
        'Use Copernicus Marine global ocean physics and NOAA OISST to tune seasonal currents and water temperatures.',
        'Use the USGS three-point current-meter method for inland, lake, and river sampling depths; open ocean defaults to 1, 5, and 10 fathoms.'
      ],
      localeDefinitions:localeDefinitions,
      weather:{
        climateControl:cloneJSON(DEFAULT_CLIMATE_CONTROL),
        periods:periods,
        seasonalCurrents:buildSeasonalCurrents(),
        manualTables:buildManualTableTemplate(),
        customCriticalEvents:{}
      }
    };
  }

  function buildRegionModuleSource(regionKey, displayName, defaultLocale){
    var entry = buildDefaultRegionEntry(regionKey, displayName, defaultLocale);
    var json = JSON.stringify(entry, null, 2);
    return (
      "// name:        dwt_region." + regionKey + ".js\n" +
      "// version:     0.1.0-alpha.1\n" +
      "// description: Unified " + displayName + " region module for dwt_weather and dwt_mapMeta.\n" +
      "// provides:    dwt_mule ability: regions (root JSON; regions." + regionKey + "), version entry dwt_region." + regionKey + "_0.1.0-alpha.1\n" +
      "// depends:     dwt_weather >= 0.1.0-alpha.1 (recommended), dwt_core >= 0.1.0-alpha.1 (optional startup registration), Roll20 API.\n" +
      "// author:      tcm (AI-assisted)\n" +
      "// Semantic Versioning (SemVer) Policy:\n" +
      "// - DWT uses SemVer in the form MAJOR.MINOR.PATCH[-PRERELEASE].\n" +
      "// - Pre-release versions stay in 0.y.z. Anything may change and the API is not yet considered stable.\n" +
      "// - Increment PATCH for backward-compatible bug fixes.\n" +
      "// - Increment MINOR for new backward-compatible functionality.\n" +
      "// - Increment MAJOR only when the public API becomes stable and/or incompatible breaking changes are introduced.\n" +
      "// - Pre-release labels such as alpha, beta, or rc mark unstable builds and sort lower than the matching normal release.\n" +
      "// - Once a version is released, its contents must not be changed; further edits require a new version.\n" +
      "// - Header comments, internal VERSION constants, filenames, generated module text, and documentation references must stay aligned.\n" +
      "// - Dependency notes should use SemVer-friendly wording such as \">= 0.1.0-alpha.1\" rather than informal forms like \"5.1.0+\".\n" +
      "// canonical references:\n" +
      "//   - ECMWF ERA5 Reanalysis: https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5\n" +
      "//   - Copernicus Marine Global Ocean Physics Analysis and Forecast: https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description\n" +
      "//   - NOAA NCEI OISST: https://www.ncei.noaa.gov/products/optimum-interpolation-sst\n" +
      "//   - USGS Streamflow Measurement Guidance: https://www.usgs.gov/water-science-school/science/how-streamflow-measured\n\n" +
      "(function(){\n" +
      "  'use strict';\n\n" +
      "  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;\n" +
      "  var VERSION = '0.1.0-alpha.1';\n" +
      "  var REGION_KEY = '" + regionKey + "';\n" +
      "  var MODULE_NAME = 'dwt_region.' + REGION_KEY;\n" +
      "  var _startupRegistered = false;\n\n" +
      "  var REGION_ENTRY = " + json + ";\n\n" +
      "  function queueRegion(){\n" +
      "    RT.dwtRegionQ = RT.dwtRegionQ || [];\n" +
      "    var next = [];\n" +
      "    for(var i=0;i<RT.dwtRegionQ.length;i++){\n" +
      "      var item = RT.dwtRegionQ[i];\n" +
      "      if(item && item.moduleName !== MODULE_NAME) next.push(item);\n" +
      "    }\n" +
      "    next.push({ entry: REGION_ENTRY, moduleName: MODULE_NAME, version: VERSION });\n" +
      "    RT.dwtRegionQ = next;\n" +
      "  }\n\n" +
      "  function registerRegion(){\n" +
      "    try{\n" +
      "      if(RT.dwt_weather && typeof RT.dwt_weather.registerRegionEntry === 'function'){\n" +
      "        RT.dwt_weather.registerRegionEntry(REGION_ENTRY, MODULE_NAME, VERSION);\n" +
      "      }else{\n" +
      "        queueRegion();\n" +
      "      }\n" +
      "    }catch(e){\n" +
      "      log(MODULE_NAME + ' registration error: ' + e);\n" +
      "    }\n" +
      "  }\n\n" +
      "  function registerStartupHooks(){\n" +
      "    if(_startupRegistered) return;\n" +
      "    _startupRegistered = true;\n\n" +
      "    RT.dwtQ = RT.dwtQ || [];\n" +
      "    RT.dwtQ.push(function(dwt){\n" +
      "      if(dwt && typeof dwt.registerStartup === 'function'){\n" +
      "        dwt.registerStartup(MODULE_NAME, function(){ registerRegion(); });\n" +
      "      }\n" +
      "    });\n\n" +
      "    if(RT.dwt && typeof RT.dwt.registerStartup === 'function'){\n" +
      "      RT.dwt.registerStartup(MODULE_NAME, function(){ registerRegion(); });\n" +
      "    }\n" +
      "  }\n\n" +
      "  function init(){\n" +
      "    registerRegion();\n" +
      "    registerStartupHooks();\n" +
      "  }\n\n" +
      "  on('ready', init);\n" +
      "})();\n"
    );
  }

  function renderPresetsHTML(){
    var rows = Object.keys(BIOME_PRESETS).sort().map(function(key){
      var preset = BIOME_PRESETS[key];
      return '<div><b>' + esc(key) + '</b>: ' + esc(preset.description) + '</div>';
    }).join('');
    return '<div><b>Biome Presets</b></div><div style="margin-top:6px;">' + rows + '</div>';
  }

  function renderHelpHTML(){
    return [
      '<div><b>Region Builder</b></div>',
      '<div style="margin-top:6px;">Generate a starter <code>dwt.region.v4</code> module or a custom locale snippet.</div>',
      '<div style="margin-top:6px;"><b>Commands</b></div>',
      '<div><code>!dwt --regionbuilder</code></div>',
      '<div><code>!dwt --regionbuilder presets</code></div>',
      '<div><code>!dwt --regionbuilder template regionkey | Display Name | coastal</code></div>',
      '<div><code>!dwt --regionbuilder locale moonwell | Moonwell | forest | Moonwell</code></div>',
      '<div style="margin-top:6px;">Template output goes to the GM-only handout <b>' + esc(OUTPUT_HANDOUT_NAME) + '</b>.</div>'
    ].join('');
  }

  function handleTemplateCommand(pid, raw){
    var parts = splitPipeArgs(raw);
    if(parts.length < 2){
      return { error:'Use !dwt --regionbuilder template regionkey | Display Name | [defaultLocale].' };
    }
    var regionKey = canonicalRegionKey(parts[0]);
    var displayName = titleCaseWords(parts[1]);
    var defaultLocale = canonicalKey(parts[2] || 'coastal');
    if(!regionKey){
      return { error:'Region key must contain letters only.' };
    }
    if(!displayName){
      return { error:'Display name is required.' };
    }
    if(CANONICAL_LOCALES.indexOf(defaultLocale) < 0){
      return { error:'Default locale must be one of: ' + CANONICAL_LOCALES.join(', ') + '.' };
    }
    var code = buildRegionModuleSource(regionKey, displayName, defaultLocale);
    upsertGmHandout(OUTPUT_HANDOUT_NAME, 'Region Module Template', code);
    whisper(pid, '<div>Generated <b>' + esc(regionKey) + '</b> in the GM handout <b>' + esc(OUTPUT_HANDOUT_NAME) + '</b>.</div>');
    return { changed:true };
  }

  function handleLocaleCommand(pid, raw){
    var parts = splitPipeArgs(raw);
    if(parts.length < 3){
      return { error:'Use !dwt --regionbuilder locale localeKey | Label | biomePreset | [token].' };
    }
    var localeKey = canonicalKey(parts[0]);
    var label = titleCaseWords(parts[1]);
    var presetKey = canonicalKey(parts[2]);
    var token = titleCaseWords(parts[3] || label);
    if(!localeKey){
      return { error:'Locale key is required.' };
    }
    if(!BIOME_PRESETS[presetKey]){
      return { error:'Unknown biome preset "' + parts[2] + '". Use !dwt --regionbuilder presets.' };
    }
    var snippet = JSON.stringify(buildBiomeLocaleDefinition(localeKey, label, presetKey, token, false), null, 2);
    upsertGmHandout(OUTPUT_HANDOUT_NAME, 'Locale Definition Snippet', snippet);
    whisper(pid, '<div>Generated locale snippet for <b>' + esc(localeKey) + '</b> using the <b>' + esc(presetKey) + '</b> preset.</div>');
    return { changed:true };
  }

  function handleCommand(args){
    var pid = args.pid;
    var raw = String(args.val || '').trim();
    if(!isGM(pid)){
      return { error:'Only the GM may use regionbuilder.' };
    }
    if(!raw){
      whisper(pid, renderHelpHTML());
      return { changed:false };
    }

    var match = raw.match(/^(\S+)(?:\s+([\s\S]+))?$/);
    var cmd = canonicalKey(match && match[1]);
    var rest = String((match && match[2]) || '').trim();

    if(cmd === 'presets'){
      whisper(pid, renderPresetsHTML());
      return { changed:false };
    }
    if(cmd === 'template'){
      return handleTemplateCommand(pid, rest);
    }
    if(cmd === 'locale'){
      return handleLocaleCommand(pid, rest);
    }

    return { error:'Unknown regionbuilder command. Use !dwt --regionbuilder, !dwt --regionbuilder presets, !dwt --regionbuilder template ..., or !dwt --regionbuilder locale ...' };
  }

  function helpLines(){
    return [
      'Show Region Builder help:',
      '!dwt --regionbuilder',
      'List the built-in biome presets:',
      '!dwt --regionbuilder presets',
      'Generate a starter dwt.region.v4 module into the GM handout:',
      '!dwt --regionbuilder template regionkey | Display Name | coastal',
      'Generate a custom localeDefinition snippet from a biome preset:',
      '!dwt --regionbuilder locale localeKey | Label | biomePreset | Token'
    ];
  }

  function registerWithCore(){
    try{
      if(!(RT.dwt && !_registered && typeof RT.dwt.registerCommands === 'function')) return;
      _registered = true;

      RT.dwt.registerCommands({
        regionbuilder:{
          access:'player',
          handler:handleCommand
        }
      });

      if(typeof RT.dwt.addHelpSection === 'function'){
        RT.dwt.addHelpSection(340, 'Region Builder', function(){ return helpLines(); });
        if(typeof RT.dwt.refreshHelpHandout === 'function'){
          RT.dwt.refreshHelpHandout(null);
        }
      }
    }catch(e){}
  }

  function init(){
    mergeVersionEntry(getOrCreateMule(), MODULE_KEY, VERSION);
    try{
      RT.dwtQ = RT.dwtQ || [];
      RT.dwtQ.push(function(){ registerWithCore(); });
      if(RT.dwt) registerWithCore();
    }catch(e){}
  }

  on('ready', init);
}());

