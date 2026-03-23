// name:        dwt_region.moonshaes.js
// version:     5.1.0
// description: Unified Moonshaes region module for dwt_weather and dwt_mapMeta.
// provides:    dwt_mule ability: regions (root JSON; regions.moonshaes), version entry dwt_region.moonshaes_5.1.0
// depends:     dwt_weather_5.1.0+ (recommended), dwt_core_5.1.0+ (optional startup registration), Roll20 API.
// author:      tcm (AI-assisted)
// canonical references:
//   - ECMWF ERA5 Reanalysis: https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5
//   - Copernicus Marine Global Ocean Physics Analysis and Forecast: https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description
//   - NOAA NCEI OISST: https://www.ncei.noaa.gov/products/optimum-interpolation-sst
//   - USGS Streamflow Measurement Guidance: https://www.usgs.gov/water-science-school/science/how-streamflow-measured
(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis : this;
  var VERSION = '5.1.0';
  var REGION_KEY = 'moonshaes';
  var MODULE_NAME = 'dwt_region.' + REGION_KEY;
  var _startupRegistered = false;

  var REGION_ENTRY = {
  "schema": "dwt.region.v4",
  "region": "moonshaes",
  "displayName": "Moonshaes",
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
      "name": "Sea Lanes of the Moonshaes",
      "locale": "offshore",
      "tags": [
        "sea",
        "islands"
      ],
      "sources": [
        "Forgotten Realms setting reference",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for exposed channels, open-water crossings, and rough Atlantic-style sailing weather."
    },
    {
      "name": "Caer Callidyrr",
      "locale": "coastal",
      "tags": [
        "capital",
        "harbor"
      ],
      "sources": [
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for island ports, fishing towns, cliff roads, and wind-beaten settlements along the shore."
    },
    {
      "name": "Moonshae Interior",
      "locale": "inland",
      "tags": [
        "hills",
        "forest"
      ],
      "sources": [
        "Campaign notes",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for the island interiors, uplands, and forest roads away from the immediate coast."
    },
    {
      "name": "Moonshae Shelf",
      "locale": "underwater",
      "tags": [
        "sea",
        "shelf"
      ],
      "sources": [
        "Campaign notes",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for kelp forests, cliff-foot caverns, and submerged island ruins."
    },
    {
      "name": "Korinn Deepways",
      "locale": "underdark",
      "tags": [
        "cavern",
        "isles"
      ],
      "sources": [
        "Campaign notes",
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for under-island caverns, druidic depths, and old stone passages below the highlands."
    }
  ],
  "sourceNotes": [
    "Climate analogue: Scotland & Western Ireland, per Documentation/dwt_README_weathermapping.docx.",
    "Monthly temperature, precipitation, and prevailing-wind defaults are aligned to the analogue using ECMWF ERA5 climatology.",
    "Seasonal surface and subsurface water temperatures are checked against NOAA OISST and Copernicus Marine global ocean-physics guidance.",
    "Water-column sampling uses surface plus 20/60/80% depths for inland and coastal columns, while offshore defaults use 1, 5, and 10 fathoms.",
    "Exact-clock diurnal controls follow a North Atlantic maritime regime, with long-lived fronts offshore and muted subterranean variance below ground."
  ],
  "localeDefinitions": {
    "offshore": {
      "label": "Offshore",
      "token": "Offshore",
      "environment": "surface",
      "biome": "ocean",
      "useSeasonalCurrent": true,
      "climateMode": "override",
      "inherits": "region",
      "periods": {
        "hammer": {
          "temperature": {
            "avgF": 42,
            "lowF": 34,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 70,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 35
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 28,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 12
              },
              {
                "value": "sea_storm",
                "weight": 16
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "midwinter": {
          "temperature": {
            "avgF": 42,
            "lowF": 34,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 70,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 35
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 28,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 12
              },
              {
                "value": "sea_storm",
                "weight": 16
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "alturiak": {
          "temperature": {
            "avgF": 42,
            "lowF": 34,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 70,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 35
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 28,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 12
              },
              {
                "value": "sea_storm",
                "weight": 16
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "ches": {
          "temperature": {
            "avgF": 48,
            "lowF": 38,
            "highF": 58
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 30
              },
              {
                "value": 100,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "tarsakh": {
          "temperature": {
            "avgF": 48,
            "lowF": 38,
            "highF": 58
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 30
              },
              {
                "value": 100,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "greengrass": {
          "temperature": {
            "avgF": 48,
            "lowF": 38,
            "highF": 58
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 30
              },
              {
                "value": 100,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "mirtul": {
          "temperature": {
            "avgF": 48,
            "lowF": 38,
            "highF": 58
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 30
              },
              {
                "value": 100,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "kythorn": {
          "temperature": {
            "avgF": 58,
            "lowF": 50,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "thunderstorm",
                "weight": 3
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "flamerule": {
          "temperature": {
            "avgF": 58,
            "lowF": 50,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "thunderstorm",
                "weight": 3
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "midsummer": {
          "temperature": {
            "avgF": 58,
            "lowF": 50,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "thunderstorm",
                "weight": 3
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "shieldmeet": {
          "temperature": {
            "avgF": 58,
            "lowF": 50,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "thunderstorm",
                "weight": 3
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "eleasis": {
          "temperature": {
            "avgF": 58,
            "lowF": 50,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "thunderstorm",
                "weight": 3
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "eleint": {
          "temperature": {
            "avgF": 50,
            "lowF": 40,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 34
              },
              {
                "value": 100,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 26,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 26
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "highharvestide": {
          "temperature": {
            "avgF": 50,
            "lowF": 40,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 34
              },
              {
                "value": 100,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 26,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 26
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "marpenoth": {
          "temperature": {
            "avgF": 50,
            "lowF": 40,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 34
              },
              {
                "value": 100,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 26,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 26
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "uktar": {
          "temperature": {
            "avgF": 50,
            "lowF": 40,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 34
              },
              {
                "value": 100,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 26,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 26
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "feastofthemoon": {
          "temperature": {
            "avgF": 50,
            "lowF": 40,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 34
              },
              {
                "value": 100,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 26,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 26
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        },
        "nightal": {
          "temperature": {
            "avgF": 42,
            "lowF": 34,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 70,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 35
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 28,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 12
              },
              {
                "value": "sea_storm",
                "weight": 16
              }
            ],
            "severityWeights": {
              "light": 30,
              "moderate": 35,
              "heavy": 25,
              "severe": 10
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -45,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -12,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 15,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 3,
                "directionChangePct": 24
              },
              "earlyafternoon": {
                "temperatureSwingPct": 45,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 28
              },
              "lateafternoon": {
                "temperatureSwingPct": 35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 7,
                "directionChangePct": 26
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateevening": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              }
            }
          }
        }
      },
      "waterProfile": {
        "bodyType": "open_ocean",
        "totalDepthFeet": 840,
        "sampleMode": "fixed_fathoms",
        "sampleFractions": {
          "shallow": 0.2,
          "mid": 0.6,
          "deep": 0.8
        },
        "sampleDepthsFathoms": {
          "shallow": 1,
          "mid": 5,
          "deep": 10
        }
      },
      "climateControl": {
        "governor": {
          "temperatureMaxDeltaF": 2,
          "currentStrengthMaxDeltaPct": 6,
          "currentTemperatureMaxDeltaF": 2,
          "currentDirectionMaxStep": 1
        },
        "activation": {
          "skyLeadMinutes": {
            "min": 60,
            "max": 135
          },
          "precipitationDurationMinutes": {
            "min": 90,
            "max": 255
          },
          "eventStartOffsetMinutes": {
            "min": 15,
            "max": 45
          },
          "eventTailBufferMinutes": {
            "min": 15,
            "max": 45
          }
        }
      }
    },
    "coastal": {
      "label": "Coastal",
      "token": "Coastal",
      "environment": "surface",
      "biome": "coastline",
      "useSeasonalCurrent": true,
      "climateMode": "offset",
      "inherits": "region",
      "waterProfile": {
        "bodyType": "coastline",
        "totalDepthFeet": 120,
        "sampleMode": "fractional_depth",
        "sampleFractions": {
          "shallow": 0.2,
          "mid": 0.6,
          "deep": 0.8
        },
        "sampleDepthsFathoms": {
          "shallow": 1,
          "mid": 5,
          "deep": 10
        }
      },
      "climateControl": {
        "governor": {
          "temperatureMaxDeltaF": 2,
          "currentStrengthMaxDeltaPct": 8,
          "currentTemperatureMaxDeltaF": 2,
          "currentDirectionMaxStep": 1
        },
        "activation": {
          "skyLeadMinutes": {
            "min": 45,
            "max": 120
          },
          "precipitationDurationMinutes": {
            "min": 60,
            "max": 210
          },
          "eventStartOffsetMinutes": {
            "min": 10,
            "max": 35
          },
          "eventTailBufferMinutes": {
            "min": 10,
            "max": 35
          }
        }
      }
    },
    "inland": {
      "label": "Inland",
      "token": "Inland",
      "environment": "surface",
      "biome": "plains",
      "useSeasonalCurrent": false,
      "climateMode": "override",
      "inherits": "region",
      "periods": {
        "hammer": {
          "temperature": {
            "avgF": 40,
            "lowF": 28,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
                "weight": 9
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "midwinter": {
          "temperature": {
            "avgF": 40,
            "lowF": 28,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
                "weight": 9
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "alturiak": {
          "temperature": {
            "avgF": 40,
            "lowF": 28,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
                "weight": 9
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "ches": {
          "temperature": {
            "avgF": 48,
            "lowF": 36,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 13
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "tarsakh": {
          "temperature": {
            "avgF": 48,
            "lowF": 36,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 13
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "greengrass": {
          "temperature": {
            "avgF": 48,
            "lowF": 36,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 13
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "mirtul": {
          "temperature": {
            "avgF": 48,
            "lowF": 36,
            "highF": 60
          },
          "precipitation": {
            "chancePct": 55,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 13
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 10
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "kythorn": {
          "temperature": {
            "avgF": 62,
            "lowF": 48,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 28
              },
              {
                "value": 75,
                "weight": 10
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "flamerule": {
          "temperature": {
            "avgF": 62,
            "lowF": 48,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 28
              },
              {
                "value": 75,
                "weight": 10
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "midsummer": {
          "temperature": {
            "avgF": 62,
            "lowF": 48,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 28
              },
              {
                "value": 75,
                "weight": 10
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "shieldmeet": {
          "temperature": {
            "avgF": 62,
            "lowF": 48,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 28
              },
              {
                "value": 75,
                "weight": 10
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "eleasis": {
          "temperature": {
            "avgF": 62,
            "lowF": 48,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 35,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 28
              },
              {
                "value": 75,
                "weight": 10
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "eleint": {
          "temperature": {
            "avgF": 52,
            "lowF": 40,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 60,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "highharvestide": {
          "temperature": {
            "avgF": 52,
            "lowF": 40,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 60,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "marpenoth": {
          "temperature": {
            "avgF": 52,
            "lowF": 40,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 60,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "uktar": {
          "temperature": {
            "avgF": 52,
            "lowF": 40,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 60,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "feastofthemoon": {
          "temperature": {
            "avgF": 52,
            "lowF": 40,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 60,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
              },
              {
                "value": "winter_gale",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        },
        "nightal": {
          "temperature": {
            "avgF": 40,
            "lowF": 28,
            "highF": 50
          },
          "precipitation": {
            "chancePct": 65,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 35
              },
              {
                "value": 75,
                "weight": 20
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
                "weight": 9
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": -100,
                "temperatureDelta": -1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -8,
                "directionChangePct": 16
              },
              "latepredawn": {
                "temperatureSwingPct": -70,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": -20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 22
              },
              "latemorning": {
                "temperatureSwingPct": 20,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 4,
                "directionChangePct": 26
              },
              "earlyafternoon": {
                "temperatureSwingPct": 75,
                "temperatureDelta": 1,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 10,
                "directionChangePct": 32
              },
              "lateafternoon": {
                "temperatureSwingPct": 60,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 1,
                "windStrengthDeltaPct": 8,
                "directionChangePct": 30
              },
              "earlyevening": {
                "temperatureSwingPct": 5,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 24
              },
              "lateevening": {
                "temperatureSwingPct": -35,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": -1,
                "windStrengthDeltaPct": -4,
                "directionChangePct": 20
              }
            }
          }
        }
      },
      "climateControl": {
        "governor": {
          "temperatureMaxDeltaF": 4,
          "currentStrengthMaxDeltaPct": 12,
          "currentTemperatureMaxDeltaF": 3,
          "currentDirectionMaxStep": 2
        },
        "activation": {
          "skyLeadMinutes": {
            "min": 20,
            "max": 75
          },
          "precipitationDurationMinutes": {
            "min": 30,
            "max": 120
          },
          "eventStartOffsetMinutes": {
            "min": 5,
            "max": 20
          },
          "eventTailBufferMinutes": {
            "min": 5,
            "max": 20
          }
        }
      }
    },
    "underwater": {
      "label": "Underwater",
      "token": "Underwater",
      "environment": "underwater",
      "biome": "ocean",
      "useSeasonalCurrent": true,
      "climateMode": "override",
      "inherits": "region",
      "periods": {
        "hammer": {
          "temperature": {
            "avgF": 44,
            "lowF": 40,
            "highF": 48
          },
          "precipitation": {
            "chancePct": 63,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 17,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 7
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 54,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "midwinter": {
          "temperature": {
            "avgF": 44,
            "lowF": 40,
            "highF": 48
          },
          "precipitation": {
            "chancePct": 63,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 17,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 7
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 54,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "alturiak": {
          "temperature": {
            "avgF": 44,
            "lowF": 40,
            "highF": 48
          },
          "precipitation": {
            "chancePct": 63,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 17,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 7
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 54,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "ches": {
          "temperature": {
            "avgF": 47,
            "lowF": 43,
            "highF": 51
          },
          "precipitation": {
            "chancePct": 50,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "tarsakh": {
          "temperature": {
            "avgF": 47,
            "lowF": 43,
            "highF": 51
          },
          "precipitation": {
            "chancePct": 50,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "greengrass": {
          "temperature": {
            "avgF": 47,
            "lowF": 43,
            "highF": 51
          },
          "precipitation": {
            "chancePct": 50,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "mirtul": {
          "temperature": {
            "avgF": 47,
            "lowF": 43,
            "highF": 51
          },
          "precipitation": {
            "chancePct": 50,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 15
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 10
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 40,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "kythorn": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 32,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 32,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "flamerule": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 32,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 32,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "midsummer": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 32,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 32,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "shieldmeet": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 32,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 32,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "eleasis": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 32,
            "type": "rain",
            "intensityWeights": {
              "light": 60,
              "moderate": 30,
              "heavy": 10
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 23
              },
              {
                "value": "SW",
                "weight": 17
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 5
              },
              {
                "value": "toxic_fog",
                "weight": 5
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 32,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "eleint": {
          "temperature": {
            "avgF": 48,
            "lowF": 44,
            "highF": 52
          },
          "precipitation": {
            "chancePct": 58,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 64
              },
              {
                "value": 75,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 6
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "highharvestide": {
          "temperature": {
            "avgF": 48,
            "lowF": 44,
            "highF": 52
          },
          "precipitation": {
            "chancePct": 58,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 64
              },
              {
                "value": 75,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 6
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "marpenoth": {
          "temperature": {
            "avgF": 48,
            "lowF": 44,
            "highF": 52
          },
          "precipitation": {
            "chancePct": 58,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 64
              },
              {
                "value": 75,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 6
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "uktar": {
          "temperature": {
            "avgF": 48,
            "lowF": 44,
            "highF": 52
          },
          "precipitation": {
            "chancePct": 58,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 64
              },
              {
                "value": 75,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 6
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "feastofthemoon": {
          "temperature": {
            "avgF": 48,
            "lowF": 44,
            "highF": 52
          },
          "precipitation": {
            "chancePct": 58,
            "type": "rain",
            "intensityWeights": {
              "light": 45,
              "moderate": 35,
              "heavy": 20
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "WSW",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 6
              },
              {
                "value": 25,
                "weight": 12
              },
              {
                "value": 50,
                "weight": 64
              },
              {
                "value": 75,
                "weight": 18
              }
            ]
          },
          "critical": {
            "chancePct": 16,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 6
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 52,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        },
        "nightal": {
          "temperature": {
            "avgF": 44,
            "lowF": 40,
            "highF": 48
          },
          "precipitation": {
            "chancePct": 63,
            "type": "rain",
            "intensityWeights": {
              "light": 35,
              "moderate": 40,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "WSW",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "WNW",
                "weight": 17
              },
              {
                "value": "NW",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 5
              },
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 65
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 17,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 8
              },
              {
                "value": "toxic_fog",
                "weight": 7
              }
            ],
            "severityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 20,
              "severe": 5
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 2,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 54,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -2,
                "directionChangePct": 18
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 1,
                "directionChangePct": 20
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 2,
                "directionChangePct": 22
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 20
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": -1,
                "directionChangePct": 18
              }
            }
          }
        }
      },
      "waterProfile": {
        "bodyType": "reef",
        "totalDepthFeet": 140,
        "sampleMode": "fractional_depth",
        "sampleFractions": {
          "shallow": 0.2,
          "mid": 0.6,
          "deep": 0.8
        },
        "sampleDepthsFathoms": {
          "shallow": 1,
          "mid": 5,
          "deep": 10
        }
      },
      "climateControl": {
        "diurnal": {
          "lowTimeHHMM": "1000",
          "highTimeHHMM": "1600",
          "riseCurve": 1.0,
          "fallCurve": 1.0
        },
        "governor": {
          "temperatureMaxDeltaF": 1,
          "rainMaxStep": 1,
          "skyMaxStep": 1,
          "windMaxStep": 1,
          "currentStrengthMaxDeltaPct": 6,
          "currentTemperatureMaxDeltaF": 1,
          "currentDirectionMaxStep": 1,
          "interpolateWindStrength": true,
          "interpolateCurrentStrength": true,
          "interpolateCurrentTemperature": true
        },
        "activation": {
          "skyLeadMinutes": {
            "min": 0,
            "max": 30
          },
          "precipitationDurationMinutes": {
            "min": 30,
            "max": 120
          },
          "eventStartOffsetMinutes": {
            "min": 5,
            "max": 20
          },
          "eventTailBufferMinutes": {
            "min": 10,
            "max": 25
          }
        }
      }
    },
    "underdark": {
      "label": "Underdark",
      "token": "Underdark",
      "environment": "subterranean",
      "biome": "caverns",
      "useSeasonalCurrent": false,
      "climateMode": "override",
      "inherits": "region",
      "periods": {
        "hammer": {
          "temperature": {
            "avgF": 50,
            "lowF": 46,
            "highF": 54
          },
          "precipitation": {
            "chancePct": 29,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "midwinter": {
          "temperature": {
            "avgF": 50,
            "lowF": 46,
            "highF": 54
          },
          "precipitation": {
            "chancePct": 29,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "alturiak": {
          "temperature": {
            "avgF": 50,
            "lowF": 46,
            "highF": 54
          },
          "precipitation": {
            "chancePct": 29,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "ches": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 25,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 43
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "toxic_fog",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 30,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "tarsakh": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 25,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 43
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "toxic_fog",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 30,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "greengrass": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 25,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 43
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "toxic_fog",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 30,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "mirtul": {
          "temperature": {
            "avgF": 52,
            "lowF": 48,
            "highF": 56
          },
          "precipitation": {
            "chancePct": 25,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 20
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 43
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "toxic_fog",
                "weight": 8
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 30,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "kythorn": {
          "temperature": {
            "avgF": 55,
            "lowF": 51,
            "highF": 59
          },
          "precipitation": {
            "chancePct": 16,
            "type": "drip",
            "intensityWeights": {
              "light": 70,
              "moderate": 25,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 38
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sandstorm",
                "weight": 4
              },
              {
                "value": "volcanic_eruption",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 28,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "flamerule": {
          "temperature": {
            "avgF": 55,
            "lowF": 51,
            "highF": 59
          },
          "precipitation": {
            "chancePct": 16,
            "type": "drip",
            "intensityWeights": {
              "light": 70,
              "moderate": 25,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 38
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sandstorm",
                "weight": 4
              },
              {
                "value": "volcanic_eruption",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 28,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "midsummer": {
          "temperature": {
            "avgF": 55,
            "lowF": 51,
            "highF": 59
          },
          "precipitation": {
            "chancePct": 16,
            "type": "drip",
            "intensityWeights": {
              "light": 70,
              "moderate": 25,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 38
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sandstorm",
                "weight": 4
              },
              {
                "value": "volcanic_eruption",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 28,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "shieldmeet": {
          "temperature": {
            "avgF": 55,
            "lowF": 51,
            "highF": 59
          },
          "precipitation": {
            "chancePct": 16,
            "type": "drip",
            "intensityWeights": {
              "light": 70,
              "moderate": 25,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 38
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sandstorm",
                "weight": 4
              },
              {
                "value": "volcanic_eruption",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 28,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "eleasis": {
          "temperature": {
            "avgF": 55,
            "lowF": 51,
            "highF": 59
          },
          "precipitation": {
            "chancePct": 16,
            "type": "drip",
            "intensityWeights": {
              "light": 70,
              "moderate": 25,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 35
              },
              {
                "value": "NW",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 25
              },
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 38
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sandstorm",
                "weight": 4
              },
              {
                "value": "volcanic_eruption",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 28,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "eleint": {
          "temperature": {
            "avgF": 53,
            "lowF": 49,
            "highF": 57
          },
          "precipitation": {
            "chancePct": 27,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 51
              },
              {
                "value": 75,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 7,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 34,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "highharvestide": {
          "temperature": {
            "avgF": 53,
            "lowF": 49,
            "highF": 57
          },
          "precipitation": {
            "chancePct": 27,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 51
              },
              {
                "value": 75,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 7,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 34,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "marpenoth": {
          "temperature": {
            "avgF": 53,
            "lowF": 49,
            "highF": 57
          },
          "precipitation": {
            "chancePct": 27,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 51
              },
              {
                "value": 75,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 7,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 34,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "uktar": {
          "temperature": {
            "avgF": 53,
            "lowF": 49,
            "highF": 57
          },
          "precipitation": {
            "chancePct": 27,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 51
              },
              {
                "value": 75,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 7,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 34,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "feastofthemoon": {
          "temperature": {
            "avgF": 53,
            "lowF": 49,
            "highF": 57
          },
          "precipitation": {
            "chancePct": 27,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 28
              },
              {
                "value": "NW",
                "weight": 27
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "N",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 18
              },
              {
                "value": 25,
                "weight": 27
              },
              {
                "value": 50,
                "weight": 51
              },
              {
                "value": 75,
                "weight": 4
              }
            ]
          },
          "critical": {
            "chancePct": 7,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 34,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        },
        "nightal": {
          "temperature": {
            "avgF": 50,
            "lowF": 46,
            "highF": 54
          },
          "precipitation": {
            "chancePct": 29,
            "type": "drip",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 23
              },
              {
                "value": "NW",
                "weight": 14
              },
              {
                "value": "N",
                "weight": 8
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 4
              },
              {
                "value": "toxic_fog",
                "weight": 4
              }
            ],
            "severityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 12,
              "severe": 3
            }
          },
          "drift": {
            "temperature": 2,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 36,
            "timeofdaySegments": {
              "earlypredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "latepredawn": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "earlymorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "latemorning": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "lateafternoon": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 14
              },
              "earlyevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              },
              "lateevening": {
                "temperatureSwingPct": 0,
                "temperatureDelta": 0,
                "precipitationDelta": 0,
                "skiesDelta": 0,
                "windDelta": 0,
                "windStrengthDeltaPct": 0,
                "directionChangePct": 12
              }
            }
          }
        }
      },
      "climateControl": {
        "diurnal": {
          "lowTimeHHMM": "1200",
          "highTimeHHMM": "1200",
          "riseCurve": 1.0,
          "fallCurve": 1.0
        },
        "governor": {
          "temperatureMaxDeltaF": 1,
          "rainMaxStep": 1,
          "skyMaxStep": 1,
          "windMaxStep": 1,
          "currentStrengthMaxDeltaPct": 6,
          "currentTemperatureMaxDeltaF": 1,
          "currentDirectionMaxStep": 1,
          "interpolateWindStrength": true,
          "interpolateCurrentStrength": true,
          "interpolateCurrentTemperature": true
        },
        "activation": {
          "skyLeadMinutes": {
            "min": 0,
            "max": 15
          },
          "precipitationDurationMinutes": {
            "min": 20,
            "max": 90
          },
          "eventStartOffsetMinutes": {
            "min": 0,
            "max": 15
          },
          "eventTailBufferMinutes": {
            "min": 5,
            "max": 20
          }
        }
      }
    }
  },
  "weather": {
    "periods": {
      "hammer": {
        "temperature": {
          "avgF": 41,
          "lowF": 33,
          "highF": 49
        },
        "precipitation": {
          "chancePct": 75,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "N",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 8
            },
            {
              "value": 25,
              "weight": 14
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 33
            },
            {
              "value": 100,
              "weight": 12
            }
          ]
        },
        "critical": {
          "chancePct": 24,
          "eventWeights": [
            {
              "value": "ice_storm",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 14
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 2,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0730",
            "highTimeHHMM": "1415",
            "riseCurve": 1.4,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 270
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "midwinter": {
        "temperature": {
          "avgF": 41,
          "lowF": 33,
          "highF": 49
        },
        "precipitation": {
          "chancePct": 75,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "N",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 8
            },
            {
              "value": 25,
              "weight": 14
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 33
            },
            {
              "value": 100,
              "weight": 12
            }
          ]
        },
        "critical": {
          "chancePct": 24,
          "eventWeights": [
            {
              "value": "ice_storm",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 14
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 2,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0730",
            "highTimeHHMM": "1415",
            "riseCurve": 1.4,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 270
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "alturiak": {
        "temperature": {
          "avgF": 41,
          "lowF": 33,
          "highF": 49
        },
        "precipitation": {
          "chancePct": 75,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "N",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 8
            },
            {
              "value": 25,
              "weight": 14
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 33
            },
            {
              "value": 100,
              "weight": 12
            }
          ]
        },
        "critical": {
          "chancePct": 24,
          "eventWeights": [
            {
              "value": "ice_storm",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 14
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 2,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0730",
            "highTimeHHMM": "1415",
            "riseCurve": 1.4,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 270
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "ches": {
        "temperature": {
          "avgF": 48,
          "lowF": 38,
          "highF": 58
        },
        "precipitation": {
          "chancePct": 60,
          "type": "rain",
          "intensityWeights": {
            "light": 45,
            "moderate": 35,
            "heavy": 20
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "WNW",
              "weight": 25
            },
            {
              "value": "NW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 12
            },
            {
              "value": 25,
              "weight": 20
            },
            {
              "value": 50,
              "weight": 38
            },
            {
              "value": 75,
              "weight": 25
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 14,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 9
            },
            {
              "value": "toxic_fog",
              "weight": 5
            }
          ],
          "severityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 20,
            "severe": 5
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 48,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0600",
            "highTimeHHMM": "1500",
            "riseCurve": 1.8,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 120
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 225
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 35
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 40
            }
          }
        }
      },
      "tarsakh": {
        "temperature": {
          "avgF": 48,
          "lowF": 38,
          "highF": 58
        },
        "precipitation": {
          "chancePct": 60,
          "type": "rain",
          "intensityWeights": {
            "light": 45,
            "moderate": 35,
            "heavy": 20
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "WNW",
              "weight": 25
            },
            {
              "value": "NW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 12
            },
            {
              "value": 25,
              "weight": 20
            },
            {
              "value": 50,
              "weight": 38
            },
            {
              "value": 75,
              "weight": 25
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 14,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 9
            },
            {
              "value": "toxic_fog",
              "weight": 5
            }
          ],
          "severityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 20,
            "severe": 5
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 48,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0600",
            "highTimeHHMM": "1500",
            "riseCurve": 1.8,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 120
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 225
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 35
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 40
            }
          }
        }
      },
      "greengrass": {
        "temperature": {
          "avgF": 48,
          "lowF": 38,
          "highF": 58
        },
        "precipitation": {
          "chancePct": 60,
          "type": "rain",
          "intensityWeights": {
            "light": 45,
            "moderate": 35,
            "heavy": 20
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "WNW",
              "weight": 25
            },
            {
              "value": "NW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 12
            },
            {
              "value": 25,
              "weight": 20
            },
            {
              "value": 50,
              "weight": 38
            },
            {
              "value": 75,
              "weight": 25
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 14,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 9
            },
            {
              "value": "toxic_fog",
              "weight": 5
            }
          ],
          "severityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 20,
            "severe": 5
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 48,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0600",
            "highTimeHHMM": "1500",
            "riseCurve": 1.8,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 120
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 225
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 35
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 40
            }
          }
        }
      },
      "mirtul": {
        "temperature": {
          "avgF": 48,
          "lowF": 38,
          "highF": 58
        },
        "precipitation": {
          "chancePct": 60,
          "type": "rain",
          "intensityWeights": {
            "light": 45,
            "moderate": 35,
            "heavy": 20
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "WNW",
              "weight": 25
            },
            {
              "value": "NW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 12
            },
            {
              "value": 25,
              "weight": 20
            },
            {
              "value": 50,
              "weight": 38
            },
            {
              "value": 75,
              "weight": 25
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 14,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 9
            },
            {
              "value": "toxic_fog",
              "weight": 5
            }
          ],
          "severityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 20,
            "severe": 5
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 48,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0600",
            "highTimeHHMM": "1500",
            "riseCurve": 1.8,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 120
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 225
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 35
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 40
            }
          }
        }
      },
      "kythorn": {
        "temperature": {
          "avgF": 58,
          "lowF": 50,
          "highF": 68
        },
        "precipitation": {
          "chancePct": 40,
          "type": "rain",
          "intensityWeights": {
            "light": 60,
            "moderate": 30,
            "heavy": 10
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "NNW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 18
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 34
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 8,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
            },
            {
              "value": "thunderstorm",
              "weight": 2
            }
          ],
          "severityWeights": {
            "light": 55,
            "moderate": 30,
            "heavy": 12,
            "severe": 3
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 1,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 36,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0600",
            "highTimeHHMM": "1500",
            "riseCurve": 1.8,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 120
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 225
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 35
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 40
            }
          }
        }
      },
      "flamerule": {
        "temperature": {
          "avgF": 58,
          "lowF": 50,
          "highF": 68
        },
        "precipitation": {
          "chancePct": 40,
          "type": "rain",
          "intensityWeights": {
            "light": 60,
            "moderate": 30,
            "heavy": 10
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "NNW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 18
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 34
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 8,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
            },
            {
              "value": "thunderstorm",
              "weight": 2
            }
          ],
          "severityWeights": {
            "light": 55,
            "moderate": 30,
            "heavy": 12,
            "severe": 3
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 1,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 36,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0430",
            "highTimeHHMM": "1600",
            "riseCurve": 2.0,
            "fallCurve": 1.3
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 7,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 165
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 30
            },
            "eventTailBufferMinutes": {
              "min": 10,
              "max": 25
            }
          }
        }
      },
      "midsummer": {
        "temperature": {
          "avgF": 58,
          "lowF": 50,
          "highF": 68
        },
        "precipitation": {
          "chancePct": 40,
          "type": "rain",
          "intensityWeights": {
            "light": 60,
            "moderate": 30,
            "heavy": 10
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "NNW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 18
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 34
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 8,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
            },
            {
              "value": "thunderstorm",
              "weight": 2
            }
          ],
          "severityWeights": {
            "light": 55,
            "moderate": 30,
            "heavy": 12,
            "severe": 3
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 1,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 36,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0430",
            "highTimeHHMM": "1600",
            "riseCurve": 2.0,
            "fallCurve": 1.3
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 7,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 165
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 30
            },
            "eventTailBufferMinutes": {
              "min": 10,
              "max": 25
            }
          }
        }
      },
      "shieldmeet": {
        "temperature": {
          "avgF": 58,
          "lowF": 50,
          "highF": 68
        },
        "precipitation": {
          "chancePct": 40,
          "type": "rain",
          "intensityWeights": {
            "light": 60,
            "moderate": 30,
            "heavy": 10
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "NNW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 18
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 34
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 8,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
            },
            {
              "value": "thunderstorm",
              "weight": 2
            }
          ],
          "severityWeights": {
            "light": 55,
            "moderate": 30,
            "heavy": 12,
            "severe": 3
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 1,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 36,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0430",
            "highTimeHHMM": "1600",
            "riseCurve": 2.0,
            "fallCurve": 1.3
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 7,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 165
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 30
            },
            "eventTailBufferMinutes": {
              "min": 10,
              "max": 25
            }
          }
        }
      },
      "eleasis": {
        "temperature": {
          "avgF": 58,
          "lowF": 50,
          "highF": 68
        },
        "precipitation": {
          "chancePct": 40,
          "type": "rain",
          "intensityWeights": {
            "light": 60,
            "moderate": 30,
            "heavy": 10
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "NNW",
              "weight": 23
            },
            {
              "value": "SW",
              "weight": 17
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 18
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 34
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 8,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
            },
            {
              "value": "thunderstorm",
              "weight": 2
            }
          ],
          "severityWeights": {
            "light": 55,
            "moderate": 30,
            "heavy": 12,
            "severe": 3
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 1,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 36,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0430",
            "highTimeHHMM": "1600",
            "riseCurve": 2.0,
            "fallCurve": 1.3
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 7,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 165
            },
            "eventStartOffsetMinutes": {
              "min": 10,
              "max": 30
            },
            "eventTailBufferMinutes": {
              "min": 10,
              "max": 25
            }
          }
        }
      },
      "eleint": {
        "temperature": {
          "avgF": 50,
          "lowF": 40,
          "highF": 60
        },
        "precipitation": {
          "chancePct": 70,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "S",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 10
            },
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 32
            },
            {
              "value": 100,
              "weight": 10
            }
          ]
        },
        "critical": {
          "chancePct": 20,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 20
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0645",
            "highTimeHHMM": "1430",
            "riseCurve": 1.5,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 9,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 255
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 40
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "highharvestide": {
        "temperature": {
          "avgF": 50,
          "lowF": 40,
          "highF": 60
        },
        "precipitation": {
          "chancePct": 70,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "S",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 10
            },
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 32
            },
            {
              "value": 100,
              "weight": 10
            }
          ]
        },
        "critical": {
          "chancePct": 20,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 20
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0645",
            "highTimeHHMM": "1430",
            "riseCurve": 1.5,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 9,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 255
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 40
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "marpenoth": {
        "temperature": {
          "avgF": 50,
          "lowF": 40,
          "highF": 60
        },
        "precipitation": {
          "chancePct": 70,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "S",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 10
            },
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 32
            },
            {
              "value": 100,
              "weight": 10
            }
          ]
        },
        "critical": {
          "chancePct": 20,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 20
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0645",
            "highTimeHHMM": "1430",
            "riseCurve": 1.5,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 9,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 255
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 40
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "uktar": {
        "temperature": {
          "avgF": 50,
          "lowF": 40,
          "highF": 60
        },
        "precipitation": {
          "chancePct": 70,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "S",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 10
            },
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 32
            },
            {
              "value": 100,
              "weight": 10
            }
          ]
        },
        "critical": {
          "chancePct": 20,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 20
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0645",
            "highTimeHHMM": "1430",
            "riseCurve": 1.5,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 9,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 255
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 40
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "feastofthemoon": {
        "temperature": {
          "avgF": 50,
          "lowF": 40,
          "highF": 60
        },
        "precipitation": {
          "chancePct": 70,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "S",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 10
            },
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 32
            },
            {
              "value": 100,
              "weight": 10
            }
          ]
        },
        "critical": {
          "chancePct": 20,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 20
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 1,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0645",
            "highTimeHHMM": "1430",
            "riseCurve": 1.5,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 9,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 255
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 40
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      },
      "nightal": {
        "temperature": {
          "avgF": 41,
          "lowF": 33,
          "highF": 49
        },
        "precipitation": {
          "chancePct": 75,
          "type": "rain",
          "intensityWeights": {
            "light": 35,
            "moderate": 40,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "W",
              "weight": 30
            },
            {
              "value": "SW",
              "weight": 25
            },
            {
              "value": "WSW",
              "weight": 23
            },
            {
              "value": "NW",
              "weight": 14
            },
            {
              "value": "N",
              "weight": 8
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 8
            },
            {
              "value": 25,
              "weight": 14
            },
            {
              "value": 50,
              "weight": 33
            },
            {
              "value": 75,
              "weight": 33
            },
            {
              "value": 100,
              "weight": 12
            }
          ]
        },
        "critical": {
          "chancePct": 24,
          "eventWeights": [
            {
              "value": "ice_storm",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 14
            }
          ],
          "severityWeights": {
            "light": 30,
            "moderate": 35,
            "heavy": 25,
            "severe": 10
          }
        },
        "drift": {
          "temperature": 2,
          "precipitation": 2,
          "skies": 1,
          "wind": 2,
          "directionChangePct": 60,
          "timeofdaySegments": {
            "earlypredawn": {
              "temperatureSwingPct": -80,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -6,
              "directionChangePct": 18
            },
            "latepredawn": {
              "temperatureSwingPct": -55,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -3,
              "directionChangePct": 20
            },
            "earlymorning": {
              "temperatureSwingPct": -15,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 0,
              "directionChangePct": 22
            },
            "latemorning": {
              "temperatureSwingPct": 18,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 4,
              "directionChangePct": 26
            },
            "earlyafternoon": {
              "temperatureSwingPct": 58,
              "temperatureDelta": 1,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 12,
              "directionChangePct": 32
            },
            "lateafternoon": {
              "temperatureSwingPct": 42,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 1,
              "windStrengthDeltaPct": 10,
              "directionChangePct": 30
            },
            "earlyevening": {
              "temperatureSwingPct": 0,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": 0,
              "windStrengthDeltaPct": 2,
              "directionChangePct": 24
            },
            "lateevening": {
              "temperatureSwingPct": -25,
              "temperatureDelta": 0,
              "precipitationDelta": 0,
              "skiesDelta": 0,
              "windDelta": -1,
              "windStrengthDeltaPct": -4,
              "directionChangePct": 20
            }
          }
        },
        "climateControl": {
          "diurnal": {
            "lowTimeHHMM": "0730",
            "highTimeHHMM": "1415",
            "riseCurve": 1.4,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 2,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 8,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 75,
              "max": 150
            },
            "precipitationDurationMinutes": {
              "min": 90,
              "max": 270
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 50
            }
          }
        }
      }
    },
    "seasonalCurrents": {
      "winter": {
        "direction": "W",
        "readings": {
          "surface": {
            "direction": "W",
            "temperatureF": 46,
            "strengthPct": 45
          },
          "shallow": {
            "direction": "W",
            "temperatureF": 45,
            "strengthPct": 65
          },
          "mid": {
            "direction": "W",
            "temperatureF": 44,
            "strengthPct": 57
          },
          "deep": {
            "direction": "W",
            "temperatureF": 40,
            "strengthPct": 49
          }
        }
      },
      "spring": {
        "direction": "W",
        "readings": {
          "surface": {
            "direction": "W",
            "temperatureF": 50,
            "strengthPct": 37
          },
          "shallow": {
            "direction": "W",
            "temperatureF": 49,
            "strengthPct": 57
          },
          "mid": {
            "direction": "W",
            "temperatureF": 47,
            "strengthPct": 49
          },
          "deep": {
            "direction": "W",
            "temperatureF": 42,
            "strengthPct": 41
          }
        }
      },
      "summer": {
        "direction": "W",
        "readings": {
          "surface": {
            "direction": "W",
            "temperatureF": 55,
            "strengthPct": 29
          },
          "shallow": {
            "direction": "W",
            "temperatureF": 54,
            "strengthPct": 49
          },
          "mid": {
            "direction": "W",
            "temperatureF": 52,
            "strengthPct": 41
          },
          "deep": {
            "direction": "W",
            "temperatureF": 47,
            "strengthPct": 33
          }
        }
      },
      "autumn": {
        "direction": "SW",
        "readings": {
          "surface": {
            "direction": "SW",
            "temperatureF": 51,
            "strengthPct": 42
          },
          "shallow": {
            "direction": "SW",
            "temperatureF": 50,
            "strengthPct": 62
          },
          "mid": {
            "direction": "SW",
            "temperatureF": 48,
            "strengthPct": 54
          },
          "deep": {
            "direction": "SW",
            "temperatureF": 43,
            "strengthPct": 46
          }
        }
      }
    },
    "climateControl": {
      "diurnal": {
        "lowTimeHHMM": "0630",
        "highTimeHHMM": "1500",
        "riseCurve": 1.7,
        "fallCurve": 1.2
      },
      "governor": {
        "temperatureMaxDeltaF": 2,
        "rainMaxStep": 1,
        "skyMaxStep": 1,
        "windMaxStep": 1,
        "currentStrengthMaxDeltaPct": 8,
        "currentTemperatureMaxDeltaF": 2,
        "currentDirectionMaxStep": 1,
        "interpolateWindStrength": true,
        "interpolateCurrentStrength": true,
        "interpolateCurrentTemperature": true
      },
      "activation": {
        "skyLeadMinutes": {
          "min": 60,
          "max": 120
        },
        "precipitationDurationMinutes": {
          "min": 75,
          "max": 240
        },
        "eventStartOffsetMinutes": {
          "min": 10,
          "max": 35
        },
        "eventTailBufferMinutes": {
          "min": 15,
          "max": 40
        }
      }
    }
  },
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
      "label": "USGS Streamflow Measurement Guidance",
      "url": "https://www.usgs.gov/water-science-school/science/how-streamflow-measured",
      "usage": "Three-point vertical sampling logic for rivers, lakes, and other non-ocean water columns."
    }
  ]
};

  function queueRegion(){
    RT.dwtRegionQ = RT.dwtRegionQ || [];
    var next = [];
    for(var i=0;i<RT.dwtRegionQ.length;i++){
      var item = RT.dwtRegionQ[i];
      if(item && item.moduleName !== MODULE_NAME) next.push(item);
    }
    next.push({ entry: REGION_ENTRY, moduleName: MODULE_NAME, version: VERSION });
    RT.dwtRegionQ = next;
  }

  function registerRegion(){
    try{
      if(RT.dwt_weather && typeof RT.dwt_weather.registerRegionEntry === 'function'){
        RT.dwt_weather.registerRegionEntry(REGION_ENTRY, MODULE_NAME, VERSION);
      }else{
        queueRegion();
      }
    }catch(e){
      log(MODULE_NAME + ' registration error: ' + e);
    }
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
    registerRegion();
    registerStartupHooks();
  }

  on('ready', init);
})();

