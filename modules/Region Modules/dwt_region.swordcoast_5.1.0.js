// name:        dwt_region.swordcoast.js
// version:     5.1.0
// description: Unified Sword Coast region module for dwt_weather and dwt_mapMeta.
// provides:    dwt_mule ability: regions (root JSON; regions.swordcoast), version entry dwt_region.swordcoast_5.1.0
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
  var REGION_KEY = 'swordcoast';
  var MODULE_NAME = 'dwt_region.' + REGION_KEY;
  var _startupRegistered = false;

  var REGION_ENTRY = {
  "schema": "dwt.region.v4",
  "region": "swordcoast",
  "displayName": "Sword Coast",
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
      "name": "Trackless Sea",
      "locale": "offshore",
      "tags": [
        "sea",
        "trade"
      ],
      "sources": [
        "Forgotten Realms setting reference",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for open-water travel, merchant lanes, and coastal approach weather west of the mainland."
    },
    {
      "name": "Waterdeep",
      "locale": "coastal",
      "tags": [
        "city",
        "harbor"
      ],
      "sources": [
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for major harbors, cliff coasts, and marine-layer conditions along the settled shore."
    },
    {
      "name": "Trade Way Hinterlands",
      "locale": "inland",
      "tags": [
        "road",
        "farmland"
      ],
      "sources": [
        "Campaign notes",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for inland roads, farms, and settlements east of the coast where heat swings are wider."
    },
    {
      "name": "Trackless Sea Reaches",
      "locale": "underwater",
      "tags": [
        "sea",
        "reef"
      ],
      "sources": [
        "Campaign notes",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for reefs, sea caves, and drowned ruins along the wider Sword Coast."
    },
    {
      "name": "Dessarin Underways",
      "locale": "underdark",
      "tags": [
        "cavern",
        "road"
      ],
      "sources": [
        "Campaign notes",
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for cave roads, buried shrines, and deep passages beneath the interior trade ways."
    }
  ],
  "sourceNotes": [
    "Climate analogue: Central California, per Documentation/dwt_README_weathermapping.docx.",
    "Monthly temperature, precipitation, and prevailing-wind defaults are aligned to the analogue using ECMWF ERA5 climatology.",
    "Seasonal surface and subsurface water temperatures are checked against NOAA OISST and Copernicus Marine global ocean-physics guidance.",
    "Water-column sampling uses surface plus 20/60/80% depths for inland and coastal columns, while offshore defaults use 1, 5, and 10 fathoms.",
    "Exact-clock diurnal controls follow a California-style west-coast regime, with marine-layer damping at sea and faster inland heating away from the coast."
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
            "avgF": 55,
            "lowF": 45,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 45,
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 28
              },
              {
                "value": 100,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
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
            "avgF": 55,
            "lowF": 45,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 45,
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 28
              },
              {
                "value": 100,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
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
            "avgF": 55,
            "lowF": 45,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 45,
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 28
              },
              {
                "value": 100,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
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
            "avgF": 60,
            "lowF": 50,
            "highF": 70
          },
          "precipitation": {
            "chancePct": 25,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 17
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 60,
            "lowF": 50,
            "highF": 70
          },
          "precipitation": {
            "chancePct": 25,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 17
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 60,
            "lowF": 50,
            "highF": 70
          },
          "precipitation": {
            "chancePct": 25,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 17
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 60,
            "lowF": 50,
            "highF": 70
          },
          "precipitation": {
            "chancePct": 25,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 33
              },
              {
                "value": 75,
                "weight": 17
              },
              {
                "value": 100,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 64,
            "lowF": 55,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 37
              },
              {
                "value": 75,
                "weight": 21
              },
              {
                "value": 100,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 2
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
            "directionChangePct": 28,
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
            "avgF": 64,
            "lowF": 55,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 37
              },
              {
                "value": 75,
                "weight": 21
              },
              {
                "value": 100,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 2
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
            "directionChangePct": 28,
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
            "avgF": 64,
            "lowF": 55,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 37
              },
              {
                "value": 75,
                "weight": 21
              },
              {
                "value": 100,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 2
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
            "directionChangePct": 28,
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
            "avgF": 64,
            "lowF": 55,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 37
              },
              {
                "value": 75,
                "weight": 21
              },
              {
                "value": 100,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 2
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
            "directionChangePct": 28,
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
            "avgF": 64,
            "lowF": 55,
            "highF": 75
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 37
              },
              {
                "value": 75,
                "weight": 21
              },
              {
                "value": 100,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 4,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 2
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
            "directionChangePct": 28,
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
            "avgF": 62,
            "lowF": 52,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 30
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
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 62,
            "lowF": 52,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 30
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
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 62,
            "lowF": 52,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 30
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
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 62,
            "lowF": 52,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 30
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
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 62,
            "lowF": 52,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 30
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
            "chancePct": 8,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 55,
            "lowF": 45,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 45,
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 30
              },
              {
                "value": 75,
                "weight": 28
              },
              {
                "value": 100,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 14,
            "eventWeights": [
              {
                "value": "sea_storm",
                "weight": 7
              },
              {
                "value": "winter_gale",
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 48,
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
        "totalDepthFeet": 720,
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
        "totalDepthFeet": 90,
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
            "avgF": 52,
            "lowF": 38,
            "highF": 65
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
                "weight": 35
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 9
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
                "value": "winter_gale",
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
        "midwinter": {
          "temperature": {
            "avgF": 52,
            "lowF": 38,
            "highF": 65
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
                "weight": 35
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 9
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
                "value": "winter_gale",
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
        "alturiak": {
          "temperature": {
            "avgF": 52,
            "lowF": 38,
            "highF": 65
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
                "weight": 35
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 9
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
                "value": "winter_gale",
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
        "ches": {
          "temperature": {
            "avgF": 65,
            "lowF": 48,
            "highF": 80
          },
          "precipitation": {
            "chancePct": 20,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
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
            "avgF": 65,
            "lowF": 48,
            "highF": 80
          },
          "precipitation": {
            "chancePct": 20,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
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
            "avgF": 65,
            "lowF": 48,
            "highF": 80
          },
          "precipitation": {
            "chancePct": 20,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
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
            "avgF": 65,
            "lowF": 48,
            "highF": 80
          },
          "precipitation": {
            "chancePct": 20,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 6
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
            "avgF": 82,
            "lowF": 60,
            "highF": 100
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 5
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "thunderstorm",
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
            "directionChangePct": 30,
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
            "avgF": 82,
            "lowF": 60,
            "highF": 100
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 5
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "thunderstorm",
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
            "directionChangePct": 30,
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
            "avgF": 82,
            "lowF": 60,
            "highF": 100
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 5
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "thunderstorm",
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
            "directionChangePct": 30,
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
            "avgF": 82,
            "lowF": 60,
            "highF": 100
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 5
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "thunderstorm",
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
            "directionChangePct": 30,
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
            "avgF": 82,
            "lowF": 60,
            "highF": 100
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 5
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 5,
            "eventWeights": [
              {
                "value": "thunderstorm",
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
            "directionChangePct": 30,
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
            "avgF": 72,
            "lowF": 52,
            "highF": 90
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 4
              },
              {
                "value": "winter_gale",
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
            "directionChangePct": 32,
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
            "avgF": 72,
            "lowF": 52,
            "highF": 90
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 4
              },
              {
                "value": "winter_gale",
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
            "directionChangePct": 32,
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
            "avgF": 72,
            "lowF": 52,
            "highF": 90
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 4
              },
              {
                "value": "winter_gale",
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
            "directionChangePct": 32,
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
            "avgF": 72,
            "lowF": 52,
            "highF": 90
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 4
              },
              {
                "value": "winter_gale",
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
            "directionChangePct": 32,
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
            "avgF": 72,
            "lowF": 52,
            "highF": 90
          },
          "precipitation": {
            "chancePct": 15,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 22
              },
              {
                "value": 75,
                "weight": 6
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 6,
            "eventWeights": [
              {
                "value": "thunderstorm",
                "weight": 4
              },
              {
                "value": "winter_gale",
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
            "directionChangePct": 32,
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
            "avgF": 52,
            "lowF": 38,
            "highF": 65
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
                "weight": 35
              },
              {
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 9
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
                "value": "winter_gale",
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
            "avgF": 56,
            "lowF": 52,
            "highF": 60
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 8,
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
            "directionChangePct": 36,
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
            "avgF": 56,
            "lowF": 52,
            "highF": 60
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 8,
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
            "directionChangePct": 36,
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
            "avgF": 56,
            "lowF": 52,
            "highF": 60
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 8,
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
            "directionChangePct": 36,
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
            "avgF": 58,
            "lowF": 54,
            "highF": 62
          },
          "precipitation": {
            "chancePct": 22,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 58,
            "lowF": 54,
            "highF": 62
          },
          "precipitation": {
            "chancePct": 22,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 58,
            "lowF": 54,
            "highF": 62
          },
          "precipitation": {
            "chancePct": 22,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 58,
            "lowF": 54,
            "highF": 62
          },
          "precipitation": {
            "chancePct": 22,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "SW",
                "weight": 9
              },
              {
                "value": "S",
                "weight": 3
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 60,
            "lowF": 56,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 60,
            "lowF": 56,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 60,
            "lowF": 56,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 60,
            "lowF": 56,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 60,
            "lowF": 56,
            "highF": 64
          },
          "precipitation": {
            "chancePct": 5,
            "type": "none",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 45
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "W",
                "weight": 18
              },
              {
                "value": "WNW",
                "weight": 8
              },
              {
                "value": "SW",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 10
              },
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 7
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 14,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 14,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 14,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 14,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 14,
            "type": "rain",
            "intensityWeights": {
              "light": 75,
              "moderate": 20,
              "heavy": 5
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 11
              },
              {
                "value": "S",
                "weight": 4
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 15
              },
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 50
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 5,
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
            "directionChangePct": 30,
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
            "avgF": 56,
            "lowF": 52,
            "highF": 60
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
                "value": "NW",
                "weight": 35
              },
              {
                "value": "W",
                "weight": 25
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "WNW",
                "weight": 12
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
                "weight": 20
              },
              {
                "value": 50,
                "weight": 58
              },
              {
                "value": 75,
                "weight": 12
              }
            ]
          },
          "critical": {
            "chancePct": 8,
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
            "directionChangePct": 36,
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
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 18,
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
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 37
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 4,
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
        "midwinter": {
          "temperature": {
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 18,
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
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 37
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 4,
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
        "alturiak": {
          "temperature": {
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 18,
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
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 37
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 4,
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
        "ches": {
          "temperature": {
            "avgF": 62,
            "lowF": 56,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 9,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "tarsakh": {
          "temperature": {
            "avgF": 62,
            "lowF": 56,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 9,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "greengrass": {
          "temperature": {
            "avgF": 62,
            "lowF": 56,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 9,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "mirtul": {
          "temperature": {
            "avgF": 62,
            "lowF": 56,
            "highF": 68
          },
          "precipitation": {
            "chancePct": 9,
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
                "value": "NW",
                "weight": 45
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "kythorn": {
          "temperature": {
            "avgF": 65,
            "lowF": 58,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 5,
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
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 20
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
            "avgF": 65,
            "lowF": 58,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 5,
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
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 20
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
            "avgF": 65,
            "lowF": 58,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 5,
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
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 20
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
            "avgF": 65,
            "lowF": 58,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 5,
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
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 20
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
            "avgF": 65,
            "lowF": 58,
            "highF": 72
          },
          "precipitation": {
            "chancePct": 5,
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
                "value": "NW",
                "weight": 40
              },
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
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 40
              },
              {
                "value": 25,
                "weight": 38
              },
              {
                "value": 50,
                "weight": 20
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
            "avgF": 63,
            "lowF": 57,
            "highF": 69
          },
          "precipitation": {
            "chancePct": 7,
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "highharvestide": {
          "temperature": {
            "avgF": 63,
            "lowF": 57,
            "highF": 69
          },
          "precipitation": {
            "chancePct": 7,
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "marpenoth": {
          "temperature": {
            "avgF": 63,
            "lowF": 57,
            "highF": 69
          },
          "precipitation": {
            "chancePct": 7,
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "uktar": {
          "temperature": {
            "avgF": 63,
            "lowF": 57,
            "highF": 69
          },
          "precipitation": {
            "chancePct": 7,
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "feastofthemoon": {
          "temperature": {
            "avgF": 63,
            "lowF": 57,
            "highF": 69
          },
          "precipitation": {
            "chancePct": 7,
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "SW",
                "weight": 20
              },
              {
                "value": "S",
                "weight": 8
              },
              {
                "value": "E",
                "weight": 2
              }
            ],
            "strengthWeights": [
              {
                "value": 0,
                "weight": 30
              },
              {
                "value": 25,
                "weight": 40
              },
              {
                "value": 50,
                "weight": 28
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
        "nightal": {
          "temperature": {
            "avgF": 59,
            "lowF": 55,
            "highF": 63
          },
          "precipitation": {
            "chancePct": 18,
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
                "value": "SW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "S",
                "weight": 10
              },
              {
                "value": "E",
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
                "weight": 37
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 4,
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
          "avgF": 54,
          "lowF": 44,
          "highF": 62
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
              "weight": 35
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 22
            },
            {
              "value": "WNW",
              "weight": 13
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 20
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 16
            },
            {
              "value": 100,
              "weight": 4
            }
          ]
        },
        "critical": {
          "chancePct": 10,
          "eventWeights": [
            {
              "value": "sea_storm",
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
          "directionChangePct": 40,
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
            "highTimeHHMM": "1445",
            "riseCurve": 1.7,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 105
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
              "max": 30
            }
          }
        }
      },
      "midwinter": {
        "temperature": {
          "avgF": 54,
          "lowF": 44,
          "highF": 62
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
              "weight": 35
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 22
            },
            {
              "value": "WNW",
              "weight": 13
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 20
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 16
            },
            {
              "value": 100,
              "weight": 4
            }
          ]
        },
        "critical": {
          "chancePct": 10,
          "eventWeights": [
            {
              "value": "sea_storm",
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
          "directionChangePct": 40,
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
            "highTimeHHMM": "1445",
            "riseCurve": 1.7,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 105
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
              "max": 30
            }
          }
        }
      },
      "alturiak": {
        "temperature": {
          "avgF": 54,
          "lowF": 44,
          "highF": 62
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
              "weight": 35
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 22
            },
            {
              "value": "WNW",
              "weight": 13
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 20
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 16
            },
            {
              "value": 100,
              "weight": 4
            }
          ]
        },
        "critical": {
          "chancePct": 10,
          "eventWeights": [
            {
              "value": "sea_storm",
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
          "directionChangePct": 40,
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
            "highTimeHHMM": "1445",
            "riseCurve": 1.7,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 105
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
              "max": 30
            }
          }
        }
      },
      "ches": {
        "temperature": {
          "avgF": 60,
          "lowF": 50,
          "highF": 70
        },
        "precipitation": {
          "chancePct": 25,
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
              "value": "NW",
              "weight": 45
            },
            {
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 17
            },
            {
              "value": "SW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "lowTimeHHMM": "0545",
            "highTimeHHMM": "1500",
            "riseCurve": 2.0,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "tarsakh": {
        "temperature": {
          "avgF": 60,
          "lowF": 50,
          "highF": 70
        },
        "precipitation": {
          "chancePct": 25,
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
              "value": "NW",
              "weight": 45
            },
            {
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 17
            },
            {
              "value": "SW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "lowTimeHHMM": "0545",
            "highTimeHHMM": "1500",
            "riseCurve": 2.0,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "greengrass": {
        "temperature": {
          "avgF": 60,
          "lowF": 50,
          "highF": 70
        },
        "precipitation": {
          "chancePct": 25,
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
              "value": "NW",
              "weight": 45
            },
            {
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 17
            },
            {
              "value": "SW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "lowTimeHHMM": "0545",
            "highTimeHHMM": "1500",
            "riseCurve": 2.0,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "mirtul": {
        "temperature": {
          "avgF": 60,
          "lowF": 50,
          "highF": 70
        },
        "precipitation": {
          "chancePct": 25,
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
              "value": "NW",
              "weight": 45
            },
            {
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 17
            },
            {
              "value": "SW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "lowTimeHHMM": "0545",
            "highTimeHHMM": "1500",
            "riseCurve": 2.0,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "kythorn": {
        "temperature": {
          "avgF": 62,
          "lowF": 54,
          "highF": 72
        },
        "precipitation": {
          "chancePct": 5,
          "type": "none",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "NNW",
              "weight": 25
            },
            {
              "value": "W",
              "weight": 18
            },
            {
              "value": "WNW",
              "weight": 8
            },
            {
              "value": "SW",
              "weight": 4
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 15
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 35
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 3,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 2
            },
            {
              "value": "thunderstorm",
              "weight": 1
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
          "directionChangePct": 26,
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
            "lowTimeHHMM": "0545",
            "highTimeHHMM": "1500",
            "riseCurve": 2.0,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "flamerule": {
        "temperature": {
          "avgF": 62,
          "lowF": 54,
          "highF": 72
        },
        "precipitation": {
          "chancePct": 5,
          "type": "none",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "NNW",
              "weight": 25
            },
            {
              "value": "W",
              "weight": 18
            },
            {
              "value": "WNW",
              "weight": 8
            },
            {
              "value": "SW",
              "weight": 4
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 15
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 35
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 3,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 2
            },
            {
              "value": "thunderstorm",
              "weight": 1
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
          "directionChangePct": 26,
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
            "lowTimeHHMM": "0530",
            "highTimeHHMM": "1530",
            "riseCurve": 2.3,
            "fallCurve": 1.4
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
              "min": 20,
              "max": 60
            },
            "precipitationDurationMinutes": {
              "min": 20,
              "max": 75
            },
            "eventStartOffsetMinutes": {
              "min": 5,
              "max": 20
            },
            "eventTailBufferMinutes": {
              "min": 5,
              "max": 15
            }
          }
        }
      },
      "midsummer": {
        "temperature": {
          "avgF": 62,
          "lowF": 54,
          "highF": 72
        },
        "precipitation": {
          "chancePct": 5,
          "type": "none",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "NNW",
              "weight": 25
            },
            {
              "value": "W",
              "weight": 18
            },
            {
              "value": "WNW",
              "weight": 8
            },
            {
              "value": "SW",
              "weight": 4
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 15
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 35
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 3,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 2
            },
            {
              "value": "thunderstorm",
              "weight": 1
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
          "directionChangePct": 26,
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
            "lowTimeHHMM": "0530",
            "highTimeHHMM": "1530",
            "riseCurve": 2.3,
            "fallCurve": 1.4
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
              "min": 20,
              "max": 60
            },
            "precipitationDurationMinutes": {
              "min": 20,
              "max": 75
            },
            "eventStartOffsetMinutes": {
              "min": 5,
              "max": 20
            },
            "eventTailBufferMinutes": {
              "min": 5,
              "max": 15
            }
          }
        }
      },
      "shieldmeet": {
        "temperature": {
          "avgF": 62,
          "lowF": 54,
          "highF": 72
        },
        "precipitation": {
          "chancePct": 5,
          "type": "none",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "NNW",
              "weight": 25
            },
            {
              "value": "W",
              "weight": 18
            },
            {
              "value": "WNW",
              "weight": 8
            },
            {
              "value": "SW",
              "weight": 4
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 15
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 35
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 3,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 2
            },
            {
              "value": "thunderstorm",
              "weight": 1
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
          "directionChangePct": 26,
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
            "lowTimeHHMM": "0530",
            "highTimeHHMM": "1530",
            "riseCurve": 2.3,
            "fallCurve": 1.4
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
              "min": 20,
              "max": 60
            },
            "precipitationDurationMinutes": {
              "min": 20,
              "max": 75
            },
            "eventStartOffsetMinutes": {
              "min": 5,
              "max": 20
            },
            "eventTailBufferMinutes": {
              "min": 5,
              "max": 15
            }
          }
        }
      },
      "eleasis": {
        "temperature": {
          "avgF": 62,
          "lowF": 54,
          "highF": 72
        },
        "precipitation": {
          "chancePct": 5,
          "type": "none",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "NNW",
              "weight": 25
            },
            {
              "value": "W",
              "weight": 18
            },
            {
              "value": "WNW",
              "weight": 8
            },
            {
              "value": "SW",
              "weight": 4
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 15
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 35
            },
            {
              "value": 75,
              "weight": 15
            },
            {
              "value": 100,
              "weight": 5
            }
          ]
        },
        "critical": {
          "chancePct": 3,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 2
            },
            {
              "value": "thunderstorm",
              "weight": 1
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
          "directionChangePct": 26,
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
            "lowTimeHHMM": "0530",
            "highTimeHHMM": "1530",
            "riseCurve": 2.3,
            "fallCurve": 1.4
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
              "min": 20,
              "max": 60
            },
            "precipitationDurationMinutes": {
              "min": 20,
              "max": 75
            },
            "eventStartOffsetMinutes": {
              "min": 5,
              "max": 20
            },
            "eventTailBufferMinutes": {
              "min": 5,
              "max": 15
            }
          }
        }
      },
      "eleint": {
        "temperature": {
          "avgF": 64,
          "lowF": 54,
          "highF": 74
        },
        "precipitation": {
          "chancePct": 15,
          "type": "rain",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "W",
              "weight": 27
            },
            {
              "value": "SW",
              "weight": 20
            },
            {
              "value": "WNW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
              "weight": 12
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "highharvestide": {
        "temperature": {
          "avgF": 64,
          "lowF": 54,
          "highF": 74
        },
        "precipitation": {
          "chancePct": 15,
          "type": "rain",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "W",
              "weight": 27
            },
            {
              "value": "SW",
              "weight": 20
            },
            {
              "value": "WNW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
              "weight": 12
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "marpenoth": {
        "temperature": {
          "avgF": 64,
          "lowF": 54,
          "highF": 74
        },
        "precipitation": {
          "chancePct": 15,
          "type": "rain",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "W",
              "weight": 27
            },
            {
              "value": "SW",
              "weight": 20
            },
            {
              "value": "WNW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
              "weight": 12
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "uktar": {
        "temperature": {
          "avgF": 64,
          "lowF": 54,
          "highF": 74
        },
        "precipitation": {
          "chancePct": 15,
          "type": "rain",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "W",
              "weight": 27
            },
            {
              "value": "SW",
              "weight": 20
            },
            {
              "value": "WNW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
              "weight": 12
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "feastofthemoon": {
        "temperature": {
          "avgF": 64,
          "lowF": 54,
          "highF": 74
        },
        "precipitation": {
          "chancePct": 15,
          "type": "rain",
          "intensityWeights": {
            "light": 75,
            "moderate": 20,
            "heavy": 5
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NW",
              "weight": 45
            },
            {
              "value": "W",
              "weight": 27
            },
            {
              "value": "SW",
              "weight": 20
            },
            {
              "value": "WNW",
              "weight": 6
            },
            {
              "value": "S",
              "weight": 2
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
              "weight": 12
            },
            {
              "value": 100,
              "weight": 3
            }
          ]
        },
        "critical": {
          "chancePct": 6,
          "eventWeights": [
            {
              "value": "sea_storm",
              "weight": 6
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
            "temperatureMaxDeltaF": 3,
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
              "min": 30,
              "max": 90
            },
            "precipitationDurationMinutes": {
              "min": 45,
              "max": 150
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
      "nightal": {
        "temperature": {
          "avgF": 54,
          "lowF": 44,
          "highF": 62
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
              "weight": 35
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 22
            },
            {
              "value": "WNW",
              "weight": 13
            },
            {
              "value": "S",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 0,
              "weight": 20
            },
            {
              "value": 25,
              "weight": 30
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 16
            },
            {
              "value": 100,
              "weight": 4
            }
          ]
        },
        "critical": {
          "chancePct": 10,
          "eventWeights": [
            {
              "value": "sea_storm",
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
          "directionChangePct": 40,
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
            "highTimeHHMM": "1445",
            "riseCurve": 1.7,
            "fallCurve": 1.2
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 2,
            "currentDirectionMaxStep": 1,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 45,
              "max": 105
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
              "max": 30
            }
          }
        }
      }
    },
    "seasonalCurrents": {
      "winter": {
        "direction": "NW",
        "readings": {
          "surface": {
            "direction": "NW",
            "temperatureF": 59,
            "strengthPct": 36
          },
          "shallow": {
            "direction": "NW",
            "temperatureF": 58,
            "strengthPct": 56
          },
          "mid": {
            "direction": "NW",
            "temperatureF": 56,
            "strengthPct": 48
          },
          "deep": {
            "direction": "NW",
            "temperatureF": 51,
            "strengthPct": 40
          }
        }
      },
      "spring": {
        "direction": "NW",
        "readings": {
          "surface": {
            "direction": "NW",
            "temperatureF": 61,
            "strengthPct": 27
          },
          "shallow": {
            "direction": "NW",
            "temperatureF": 60,
            "strengthPct": 47
          },
          "mid": {
            "direction": "NW",
            "temperatureF": 58,
            "strengthPct": 39
          },
          "deep": {
            "direction": "NW",
            "temperatureF": 53,
            "strengthPct": 31
          }
        }
      },
      "summer": {
        "direction": "NW",
        "readings": {
          "surface": {
            "direction": "NW",
            "temperatureF": 64,
            "strengthPct": 31
          },
          "shallow": {
            "direction": "NW",
            "temperatureF": 63,
            "strengthPct": 51
          },
          "mid": {
            "direction": "NW",
            "temperatureF": 60,
            "strengthPct": 43
          },
          "deep": {
            "direction": "NW",
            "temperatureF": 54,
            "strengthPct": 35
          }
        }
      },
      "autumn": {
        "direction": "NW",
        "readings": {
          "surface": {
            "direction": "NW",
            "temperatureF": 62,
            "strengthPct": 27
          },
          "shallow": {
            "direction": "NW",
            "temperatureF": 61,
            "strengthPct": 47
          },
          "mid": {
            "direction": "NW",
            "temperatureF": 59,
            "strengthPct": 39
          },
          "deep": {
            "direction": "NW",
            "temperatureF": 54,
            "strengthPct": 31
          }
        }
      }
    },
    "climateControl": {
      "diurnal": {
        "lowTimeHHMM": "0545",
        "highTimeHHMM": "1500",
        "riseCurve": 2.0,
        "fallCurve": 1.2
      },
      "governor": {
        "temperatureMaxDeltaF": 3,
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
          "min": 30,
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

