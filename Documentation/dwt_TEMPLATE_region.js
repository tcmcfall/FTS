// name:        dwt_region.TEMPLATE.js
// version:     0.1.0-alpha.1
// description: Authoritative template for a DWT dwt.region.v4 module.
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
//
// Copy this file to:
//   Modules/Region Modules/dwt_region.<regionKey>_0.1.0-alpha.1.js
//
// Then replace REGION_KEY, MODULE_NAME, and REGION_ENTRY.
//
// Canonical climate references used by the shipped modules:
//   - ECMWF ERA5 Reanalysis: https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5
//   - Copernicus Marine Global Ocean Physics Analysis and Forecast: https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description
//   - NOAA NCEI OISST: https://www.ncei.noaa.gov/products/optimum-interpolation-sst
//   - NOAA World Ocean Atlas 2023 Data: https://www.ncei.noaa.gov/access/world-ocean-atlas-2023/
//   - NOAA Ocean Service light-depth guidance: https://oceanservice.noaa.gov/facts/light_travel.html
//   - NOAA Ocean Service wave mechanics guidance: https://oceanservice.noaa.gov/education/tutorial_currents/03coastal1.html
//   - NOAA CoastWatch Kd490 guidance: https://eastcoast.coastwatch.noaa.gov/cw_k490.php
//   - NOAA NDBC Climatic Summary Plots and Table Descriptions: https://www.ndbc.noaa.gov/climatedesc.shtml
//   - Copernicus Marine Global Ocean Waves Reanalysis: https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_WAV_001_032/description
//   - National Weather Service wave glossary: https://www.weather.gov/ggw/GlossaryW
//   - NPS Great Basin cave climate guidance: https://www.nps.gov/grba/learn/nature/airflow-and-cave-climate.htm
//   - USGS Streamflow Measurement Guidance: https://www.usgs.gov/water-science-school/science/how-streamflow-measured
//
// Page names use:
//   region.locale.mapname
//   region.locale_<depth>.mapname
//
// Page names are case- and space-insensitive. Canonical generated names should be lower-case with no spaces.

(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '0.1.0-alpha.1';
  var REGION_KEY = 'replacewithregionkey';
  var MODULE_NAME = 'dwt_region.' + REGION_KEY;
  var _startupRegistered = false;

  // Replace the object below with real data.
  // The template is intentionally explicit so every editable area is visible.
  var REGION_ENTRY = {
    "schema": "dwt.region.v4",
    "region": "replacewithregionkey",
    "displayName": "Replace With Region Name",
    "defaultLocale": "coastal",
    "locales": [
      "offshore",
      "coastal",
      "inland",
      "underwater",
      "underdark"
    ],
    "campaignLocations": [
      {
        "name": "Replace With Campaign Anchor",
        "locale": "coastal",
        "tags": ["harbor", "trade"],
        "sources": ["Setting reference", "Campaign notes"],
        "notes": "Why this place belongs to this locale."
      }
    ],
    "referenceSources": [
      {
        "label": "ECMWF ERA5 Reanalysis",
        "url": "https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5",
        "usage": "Global atmospheric climatology for air temperature, prevailing winds, precipitation, and seasonal belt shifts."
      },
      {
        "label": "Copernicus Marine Global Ocean Physics Analysis and Forecast",
        "url": "https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description",
        "usage": "Global current direction, current strength, and subsurface ocean temperature structure."
      },
      {
        "label": "NOAA NCEI OISST",
        "url": "https://www.ncei.noaa.gov/products/optimum-interpolation-sst",
        "usage": "Sea-surface temperature sanity check for open-ocean and coastal surface layers."
      },
      {
        "label": "NOAA World Ocean Atlas 2023 Data",
        "url": "https://www.ncei.noaa.gov/access/world-ocean-atlas-2023/",
        "usage": "Depth-aware ocean temperature sanity check and seasonal damping reference below the upper ocean."
      },
      {
        "label": "NOAA Ocean Service Light-Depth Guidance",
        "url": "https://oceanservice.noaa.gov/facts/light_travel.html",
        "usage": "Sunlight, twilight, and aphotic depth bands used to darken underwater visibility with depth."
      },
      {
        "label": "NOAA Ocean Service Wave Mechanics Guidance",
        "url": "https://oceanservice.noaa.gov/education/tutorial_currents/03coastal1.html",
        "usage": "Wind-wave reference showing that local wave height depends on wind speed, wind duration, and fetch rather than wind speed alone."
      },
      {
        "label": "NOAA CoastWatch Kd490 Guidance",
        "url": "https://eastcoast.coastwatch.noaa.gov/cw_k490.php",
        "usage": "Water-clarity check used to make coastal, lake, river, and reef water attenuate light faster than clear open ocean."
      },
      {
        "label": "NOAA NDBC Climatic Summary Plots and Table Descriptions",
        "url": "https://www.ndbc.noaa.gov/climatedesc.shtml",
        "usage": "Monthly and seasonal buoy climatology for significant wave height, average wave period, and joint wind-versus-wave distributions."
      },
      {
        "label": "Copernicus Marine Global Ocean Waves Reanalysis",
        "url": "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_WAV_001_032/description",
        "usage": "Regional open-ocean wave climatology and wind-wave fields for monthly chop baselines where buoy coverage is sparse."
      },
      {
        "label": "National Weather Service Wave Glossary",
        "url": "https://www.weather.gov/ggw/GlossaryW",
        "usage": "Terminology reference for wind waves, swell, significant wave height, wind-wave height, and wave period."
      },
      {
        "label": "NPS Great Basin Cave Climate Guidance",
        "url": "https://www.nps.gov/grba/learn/nature/airflow-and-cave-climate.htm",
        "usage": "Cave-temperature stability and mostly dead-calm airflow reference for underdark locales."
      },
      {
        "label": "USGS Streamflow Measurement Guidance",
        "url": "https://www.usgs.gov/water-science-school/science/how-streamflow-measured",
        "usage": "Three-point vertical sampling logic for rivers, lakes, and other non-ocean water columns."
      }
    ],
    "sourceNotes": [
      "Climate analogue: Replace this note with the real analogue.",
      "Use ECMWF ERA5 for monthly air temperature, precipitation, and prevailing wind defaults.",
      "Use Copernicus Marine global ocean physics and NOAA OISST to tune seasonal currents and water temperatures.",
      "Use NOAA World Ocean Atlas plus NOAA Ocean Service light-depth guidance to keep underwater temperatures colder and darker with depth.",
      "Use NOAA wave mechanics guidance plus the NWS wave glossary to treat chop as local short-period wind waves, not as total seas or distant swell.",
      "Use NDBC climatic summaries where a real-world analogue buoy exists, and fall back to Copernicus wave reanalysis to set monthly or seasonal chop baselines for exposed offshore and coastal locales.",
      "Use NOAA CoastWatch Kd490 guidance as a conservative clarity check when deciding how quickly non-ocean water should lose visibility.",
      "Use NPS cave-climate guidance to keep underdark temperatures near the regional annual mean and airflow near dead calm except at entrances, faults, or critical events.",
      "Use the USGS three-point method for inland and coastal water columns; open ocean defaults use 1, 5, and 10 fathoms."
    ],
    "localeDefinitions": {
      "offshore": {
        "label": "Offshore",
        "token": "Offshore",
        "environment": "surface",
        "biome": "ocean",
        "climateMode": "offset",
        "inherits": "region",
        "useSeasonalCurrent": true,
        "waterProfile": {
          "bodyType": "open_ocean",
          "totalDepthFeet": 600,
          "sampleMode": "fixed_fathoms",
          "sampleFractions": { "shallow": 0.2, "mid": 0.6, "deep": 0.8 },
          "sampleDepthsFathoms": { "shallow": 1, "mid": 5, "deep": 10 }
        }
      },
      "coastal": {
        "label": "Coastal",
        "token": "Coastal",
        "environment": "surface",
        "biome": "coastline",
        "climateMode": "offset",
        "inherits": "region",
        "useSeasonalCurrent": true,
        "waterProfile": {
          "bodyType": "coastline",
          "totalDepthFeet": 90,
          "sampleMode": "fractional_depth",
          "sampleFractions": { "shallow": 0.2, "mid": 0.6, "deep": 0.8 },
          "sampleDepthsFathoms": { "shallow": 1, "mid": 5, "deep": 10 }
        }
      },
      "inland": {
        "label": "Inland",
        "token": "Inland",
        "environment": "surface",
        "biome": "plains",
        "climateMode": "offset",
        "inherits": "region",
        "useSeasonalCurrent": false
      },
      "underwater": {
        "label": "Underwater",
        "token": "Underwater",
        "environment": "underwater",
        "biome": "reef",
        "climateMode": "override",
        "inherits": "region",
        "useSeasonalCurrent": true,
        "waterProfile": {
          "bodyType": "reef",
          "totalDepthFeet": 120,
          "sampleMode": "fractional_depth",
          "sampleFractions": { "shallow": 0.2, "mid": 0.6, "deep": 0.8 },
          "sampleDepthsFathoms": { "shallow": 1, "mid": 5, "deep": 10 }
        },
        "periods": {
          "hammer": {
            "temperature": { "avgF": 48, "lowF": 44, "highF": 52 },
            "precipitation": { "chancePct": 0, "type": "none", "intensityWeights": { "light": 100, "moderate": 0, "heavy": 0 } },
            "wind": {
              "directionWeights": [{ "value": "NW", "weight": 60 }, { "value": "W", "weight": 40 }],
              "strengthWeights": [{ "value": 25, "weight": 30 }, { "value": 50, "weight": 45 }, { "value": 75, "weight": 20 }, { "value": 100, "weight": 5 }]
            },
            "critical": {
              "chancePct": 8,
              "eventWeights": [{ "value": "sea_storm", "weight": 60 }, { "value": "maelstrom", "weight": 40 }],
              "severityWeights": { "light": 45, "moderate": 30, "heavy": 20, "severe": 5 }
            },
            "drift": {
              "temperature": 1,
              "precipitation": 1,
              "skies": 1,
              "wind": 2,
              "directionChangePct": 25,
              "timeofdaySegments": TIMEOFDAY_SEGMENTS_UNDERWATER
            },
            "current": {
              "direction": "NW",
              "readings": {
                "surface": { "direction": "NW", "temperatureF": 50, "strengthPct": 43 },
                "shallow": { "direction": "NW", "temperatureF": 49, "strengthPct": 63 },
                "mid": { "direction": "NW", "temperatureF": 48, "strengthPct": 55 },
                "deep": { "direction": "NW", "temperatureF": 45, "strengthPct": 47 }
              }
            }
          }
        }
      },
      "underdark": {
        "label": "Underdark",
        "token": "Underdark",
        "environment": "subterranean",
        "biome": "caverns",
        "climateMode": "override",
        "inherits": "region",
        "useSeasonalCurrent": false,
        "periods": {
          "hammer": {
            "temperature": { "avgF": 52, "lowF": 50, "highF": 54 },
            "precipitation": { "chancePct": 20, "type": "drip", "intensityWeights": { "light": 70, "moderate": 25, "heavy": 5 } },
            "wind": {
              "directionWeights": [{ "value": "N", "weight": 50 }, { "value": "NW", "weight": 50 }],
              "strengthWeights": [{ "value": 0, "weight": 90 }, { "value": 25, "weight": 9 }, { "value": 50, "weight": 1 }]
            },
            "critical": {
              "chancePct": 4,
              "eventWeights": [{ "value": "cave_in", "weight": 50 }, { "value": "toxic_fog", "weight": 50 }],
              "severityWeights": { "light": 50, "moderate": 30, "heavy": 15, "severe": 5 }
            },
            "drift": {
              "temperature": 1,
              "precipitation": 1,
              "skies": 1,
              "wind": 1,
              "directionChangePct": 10,
              "timeofdaySegments": TIMEOFDAY_SEGMENTS_UNDERDARK
            }
          }
        }
      }
    },
    "weather": {
      "climateControl": {
        "diurnal": {
          "lowTimeHHMM": "0559",
          "highTimeHHMM": "1400",
          "riseCurve": 2.0,
          "fallCurve": 1.2
        },
        "governor": {
          "temperatureMaxDeltaF": 3,
          "rainMaxStep": 1,
          "skyMaxStep": 1,
          "windMaxStep": 1,
          "currentStrengthMaxDeltaPct": 12,
          "currentTemperatureMaxDeltaF": 3,
          "currentDirectionMaxStep": 2,
          "interpolateWindStrength": true,
          "interpolateCurrentStrength": true,
          "interpolateCurrentTemperature": true
        },
        "activation": {
          "skyLeadMinutes": { "min": 30, "max": 90 },
          "precipitationDurationMinutes": { "min": 45, "max": 165 },
          "eventStartOffsetMinutes": { "min": 10, "max": 45 },
          "eventTailBufferMinutes": { "min": 10, "max": 30 }
        }
      },
      "periods": {
        "hammer": PERIOD_BLOCK_HAMMER,
        "midwinter": COPY_HAMMER_OR_BLEND_ADJACENT_MONTHS,
        "alturiak": COPY_WINTER_MONTH_BLOCK,
        "ches": COPY_SPRING_MONTH_BLOCK,
        "tarsakh": COPY_SPRING_MONTH_BLOCK,
        "greengrass": COPY_TARSKAH_MIRTUL_BLEND,
        "mirtul": COPY_SPRING_MONTH_BLOCK,
        "kythorn": COPY_SUMMER_MONTH_BLOCK,
        "flamerule": COPY_SUMMER_MONTH_BLOCK,
        "midsummer": COPY_FLAMERULE_ELEASIS_BLEND,
        "shieldmeet": COPY_FLAMERULE_ELEASIS_BLEND,
        "eleasis": COPY_SUMMER_MONTH_BLOCK,
        "eleint": COPY_AUTUMN_MONTH_BLOCK,
        "highharvestide": COPY_ELEINT_MARPENOTH_BLEND,
        "marpenoth": COPY_AUTUMN_MONTH_BLOCK,
        "uktar": COPY_AUTUMN_MONTH_BLOCK,
        "feastofthemoon": COPY_UKTAR_NIGHTAL_BLEND,
        "nightal": COPY_WINTER_MONTH_BLOCK
      },
      "seasonalCurrents": {
        "winter": {
          "direction": "NW",
          "readings": {
            "surface": { "direction": "NW", "temperatureF": 50, "strengthPct": 28 },
            "shallow": { "direction": "NW", "temperatureF": 49, "strengthPct": 48 },
            "mid": { "direction": "NW", "temperatureF": 48, "strengthPct": 40 },
            "deep": { "direction": "NW", "temperatureF": 45, "strengthPct": 32 }
          }
        },
        "spring": {
          "direction": "W",
          "readings": {
            "surface": { "direction": "W", "temperatureF": 56, "strengthPct": 23 },
            "shallow": { "direction": "W", "temperatureF": 55, "strengthPct": 43 },
            "mid": { "direction": "W", "temperatureF": 54, "strengthPct": 35 },
            "deep": { "direction": "W", "temperatureF": 51, "strengthPct": 27 }
          }
        },
        "summer": {
          "direction": "SW",
          "readings": {
            "surface": { "direction": "SW", "temperatureF": 66, "strengthPct": 18 },
            "shallow": { "direction": "SW", "temperatureF": 64, "strengthPct": 38 },
            "mid": { "direction": "SW", "temperatureF": 62, "strengthPct": 30 },
            "deep": { "direction": "SW", "temperatureF": 58, "strengthPct": 22 }
          }
        },
        "autumn": {
          "direction": "W",
          "readings": {
            "surface": { "direction": "W", "temperatureF": 60, "strengthPct": 23 },
            "shallow": { "direction": "W", "temperatureF": 58, "strengthPct": 43 },
            "mid": { "direction": "W", "temperatureF": 56, "strengthPct": 35 },
            "deep": { "direction": "W", "temperatureF": 52, "strengthPct": 27 }
          }
        }
      },
      "manualTables": {
        "default": {
          "temperatureSteps": [{ "value": -1, "weight": 20 }, { "value": 0, "weight": 60 }, { "value": 1, "weight": 20 }],
          "precipitationSteps": [{ "value": -1, "weight": 20 }, { "value": 0, "weight": 60 }, { "value": 1, "weight": 20 }],
          "skySteps": [{ "value": -1, "weight": 20 }, { "value": 0, "weight": 60 }, { "value": 1, "weight": 20 }],
          "windSteps": [{ "value": -1, "weight": 20 }, { "value": 0, "weight": 60 }, { "value": 1, "weight": 20 }],
          "directionChangePct": 25,
          "criticalChancePct": 5,
          "eventWeights": [{ "value": "winter_gale", "weight": 50 }, { "value": "thunderstorm", "weight": 50 }],
          "severityWeights": { "light": 50, "moderate": 30, "heavy": 15, "severe": 5 }
        }
      },
      "customCriticalEvents": {
        "replace_this_key": {
          "name": "Replace This Event",
          "category": "weather",
          "summary": "Explain what makes this event unique in the region.",
          "environments": ["surface"],
          "severities": {
            "light": {
              "durationSegments": 2,
              "rangeMiles": 2,
              "saveDc": 12,
              "damage": "1d6",
              "damageTypes": ["bludgeoning"],
              "motionPercent": 85,
              "tempDeltaF": -2,
              "rainfall": "light",
              "skies": "overcast",
              "environmentalEffects": ["difficult terrain"]
            },
            "moderate": {
              "durationSegments": 4,
              "rangeMiles": 4,
              "saveDc": 14,
              "damage": "2d6",
              "damageTypes": ["bludgeoning"],
              "motionPercent": 90,
              "tempDeltaF": -4,
              "rainfall": "moderate",
              "skies": "stormy",
              "environmentalEffects": ["difficult terrain", "lightly obscured"]
            },
            "heavy": {
              "durationSegments": 6,
              "rangeMiles": 6,
              "saveDc": 16,
              "damage": "3d6",
              "damageTypes": ["bludgeoning"],
              "motionPercent": 95,
              "tempDeltaF": -6,
              "rainfall": "heavy",
              "skies": "stormy",
              "environmentalEffects": ["difficult terrain", "lightly obscured", "visibility reduced"]
            },
            "severe": {
              "durationSegments": 8,
              "rangeMiles": 10,
              "saveDc": 18,
              "damage": "4d6",
              "damageTypes": ["bludgeoning"],
              "motionPercent": 100,
              "tempDeltaF": -8,
              "rainfall": "heavy",
              "skies": "stormy",
              "environmentalEffects": ["difficult terrain", "lightly obscured", "visibility reduced", "travel routes become impassable"]
            }
          }
        }
      }
    }
  };

  // Replace PERIOD_BLOCK_HAMMER with concrete monthly data like this.
  // TIMEOFDAY_SEGMENTS_COASTAL, TIMEOFDAY_SEGMENTS_UNDERWATER, and TIMEOFDAY_SEGMENTS_UNDERDARK
  // are placeholders here for full eight-entry maps keyed by:
  // earlypredawn, latepredawn, earlymorning, latemorning,
  // earlyafternoon, lateafternoon, earlyevening, lateevening.
  //
  // weather.climateControl is required in dwt.region.v4.
  // localeDefinitions.<locale>.climateControl and localeDefinitions.<locale>.periods.<period>.climateControl
  // are optional overrides when a locale needs different diurnal timings, governor caps, or activation windows.
  //
  // Replace PERIOD_BLOCK_HAMMER with concrete monthly data like this:
  //
  // {
  //   "temperature": { "avgF": 40, "lowF": 28, "highF": 49 },
  //   "precipitation": {
  //     "chancePct": 45,
  //     "type": "rain",
  //     "intensityWeights": { "light": 50, "moderate": 35, "heavy": 15 }
  //   },
  //   "wind": {
  //     "directionWeights": [{ "value": "NW", "weight": 40 }, { "value": "W", "weight": 35 }, { "value": "SW", "weight": 25 }],
  //     "strengthWeights": [{ "value": 0, "weight": 10 }, { "value": 25, "weight": 25 }, { "value": 50, "weight": 35 }, { "value": 75, "weight": 20 }, { "value": 100, "weight": 10 }]
  //   },
  //   "critical": {
  //     "chancePct": 8,
  //     "eventWeights": [{ "value": "winter_gale", "weight": 70 }, { "value": "blizzard", "weight": 30 }],
  //     "severityWeights": { "light": 50, "moderate": 30, "heavy": 15, "severe": 5 }
  //   },
  //   "drift": {
  //     "temperature": 1,
  //     "precipitation": 1,
  //     "skies": 1,
  //     "wind": 2,
  //     "directionChangePct": 25,
  //     "timeofdaySegments": TIMEOFDAY_SEGMENTS_COASTAL
  //   }
  // }

  function queueRegion(){
    RT.dwtRegionQ = RT.dwtRegionQ || [];
    RT.dwtRegionQ.push({ entry: REGION_ENTRY, moduleName: MODULE_NAME, version: VERSION });
  }

  function registerRegion(){
    if(RT.dwt_weather && typeof RT.dwt_weather.registerRegionEntry === 'function'){
      RT.dwt_weather.registerRegionEntry(REGION_ENTRY, MODULE_NAME, VERSION);
      return;
    }
    queueRegion();
  }

  function registerStartupHooks(){
    if(_startupRegistered) return;
    _startupRegistered = true;

    RT.dwtQ = RT.dwtQ || [];
    RT.dwtQ.push(function(dwt){
      if(dwt && typeof dwt.registerStartup === 'function'){
        dwt.registerStartup(MODULE_NAME, function(){
          registerRegion();
        });
      }
    });

    if(RT.dwt && typeof RT.dwt.registerStartup === 'function'){
      RT.dwt.registerStartup(MODULE_NAME, function(){
        registerRegion();
      });
    }
  }

  function init(){
    registerStartupHooks();
  }

  on('ready', init);
})();
