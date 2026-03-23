// name:        dwt_region.frozenfar.js
// version:     5.1.0
// description: Unified Frozenfar region module for dwt_weather and dwt_mapMeta.
// provides:    dwt_mule ability: regions (root JSON; regions.frozenfar), version entry dwt_region.frozenfar_5.1.0
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
  var REGION_KEY = 'frozenfar';
  var MODULE_NAME = 'dwt_region.' + REGION_KEY;
  var _startupRegistered = false;

  var REGION_ENTRY = {
  "schema": "dwt.region.v4",
  "region": "frozenfar",
  "displayName": "Frozenfar",
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
      "name": "Sea of Moving Ice",
      "locale": "offshore",
      "tags": [
        "sea",
        "arctic"
      ],
      "sources": [
        "Forgotten Realms setting reference",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for open-water, pack-ice, and sea-ice encounter maps north of the coast."
    },
    {
      "name": "Frozenfar Coast",
      "locale": "coastal",
      "tags": [
        "shore",
        "tundra"
      ],
      "sources": [
        "Documentation/dwt_README_weathermapping.docx",
        "Campaign notes"
      ],
      "notes": "Use for exposed arctic shorelines, fishing camps, and icebound coastal settlements."
    },
    {
      "name": "Icewind Dale",
      "locale": "inland",
      "tags": [
        "tundra",
        "valley"
      ],
      "sources": [
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for the dale, the tundra roads, and interior travel beyond the immediate coast."
    },
    {
      "name": "Sea of Moving Ice Deeps",
      "locale": "underwater",
      "tags": [
        "sea",
        "depths"
      ],
      "sources": [
        "Campaign notes",
        "Documentation/dwt_README_weathermapping.docx"
      ],
      "notes": "Use for under-ice trenches, drowned caves, and frigid wreck sites."
    },
    {
      "name": "Spine of the World Depths",
      "locale": "underdark",
      "tags": [
        "cavern",
        "underdark"
      ],
      "sources": [
        "Campaign notes",
        "Forgotten Realms setting reference"
      ],
      "notes": "Use for buried passes, deep caverns, and old dwarf roads beneath the range."
    }
  ],
  "sourceNotes": [
    "Climate analogue: Northern Alaska / Arctic Coast, per Documentation/dwt_README_weathermapping.docx.",
    "Monthly temperature, precipitation, and prevailing-wind defaults are aligned to the analogue using ECMWF ERA5 climatology.",
    "Seasonal surface and subsurface water temperatures are checked against NOAA OISST and Copernicus Marine global ocean-physics guidance.",
    "Water-column sampling uses surface plus 20/60/80% depths for inland and coastal columns, while offshore defaults use 1, 5, and 10 fathoms.",
    "Exact-clock diurnal controls follow arctic daylight compression and expansion, while marine and under-ice locales damp drift to reflect polar water inertia."
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
            "avgF": 10,
            "lowF": -15,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 55,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 35,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 35
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
            "temperature": 3,
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
            "avgF": 10,
            "lowF": -15,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 55,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 35,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 35
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
            "temperature": 3,
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
            "avgF": 10,
            "lowF": -15,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 55,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 35,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 35
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
            "temperature": 3,
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 40
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 25,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 10
              },
              {
                "value": "winter_gale",
                "weight": 15
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
            "temperature": 3,
            "precipitation": 1,
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
        "tarsakh": {
          "temperature": {
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 40
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 25,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 10
              },
              {
                "value": "winter_gale",
                "weight": 15
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
            "temperature": 3,
            "precipitation": 1,
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
        "greengrass": {
          "temperature": {
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 40
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 25,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 10
              },
              {
                "value": "winter_gale",
                "weight": 15
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
            "temperature": 3,
            "precipitation": 1,
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
        "mirtul": {
          "temperature": {
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 40
              },
              {
                "value": 100,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 25,
            "eventWeights": [
              {
                "value": "ice_storm",
                "weight": 10
              },
              {
                "value": "winter_gale",
                "weight": 15
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
            "temperature": 3,
            "precipitation": 1,
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
        "kythorn": {
          "temperature": {
            "avgF": 40,
            "lowF": 25,
            "highF": 55
          },
          "precipitation": {
            "chancePct": 30,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 40,
            "lowF": 25,
            "highF": 55
          },
          "precipitation": {
            "chancePct": 30,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 40,
            "lowF": 25,
            "highF": 55
          },
          "precipitation": {
            "chancePct": 30,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 40,
            "lowF": 25,
            "highF": 55
          },
          "precipitation": {
            "chancePct": 30,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 40,
            "lowF": 25,
            "highF": 55
          },
          "precipitation": {
            "chancePct": 30,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "sea_storm",
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 25
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
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
            "temperature": 3,
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 25
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
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
            "temperature": 3,
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 25
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
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
            "temperature": 3,
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 25
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
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
            "temperature": 3,
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
            "avgF": 25,
            "lowF": 0,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 25
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
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
            "temperature": 3,
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
            "avgF": 10,
            "lowF": -15,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 55,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 15
              },
              {
                "value": 75,
                "weight": 40
              },
              {
                "value": 100,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 35,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 35
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
            "temperature": 3,
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
        "totalDepthFeet": 900,
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
            "avgF": -5,
            "lowF": -35,
            "highF": 10
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 20
              },
              {
                "value": "winter_gale",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": -5,
            "lowF": -35,
            "highF": 10
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 20
              },
              {
                "value": "winter_gale",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": -5,
            "lowF": -35,
            "highF": 10
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 20
              },
              {
                "value": "winter_gale",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 15,
            "lowF": -10,
            "highF": 35
          },
          "precipitation": {
            "chancePct": 35,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
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
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 15,
            "lowF": -10,
            "highF": 35
          },
          "precipitation": {
            "chancePct": 35,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
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
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 15,
            "lowF": -10,
            "highF": 35
          },
          "precipitation": {
            "chancePct": 35,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
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
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 15,
            "lowF": -10,
            "highF": 35
          },
          "precipitation": {
            "chancePct": 35,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
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
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 18
              },
              {
                "value": 100,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 45,
            "lowF": 30,
            "highF": 65
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
                "value": "W",
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 9
              },
              {
                "value": 100,
                "weight": 1
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
            "avgF": 45,
            "lowF": 30,
            "highF": 65
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
                "value": "W",
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 9
              },
              {
                "value": 100,
                "weight": 1
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
            "avgF": 45,
            "lowF": 30,
            "highF": 65
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
                "value": "W",
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 9
              },
              {
                "value": 100,
                "weight": 1
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
            "avgF": 45,
            "lowF": 30,
            "highF": 65
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
                "value": "W",
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 9
              },
              {
                "value": 100,
                "weight": 1
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
            "avgF": 45,
            "lowF": 30,
            "highF": 65
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
                "value": "W",
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 9
              },
              {
                "value": 100,
                "weight": 1
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
            "avgF": 20,
            "lowF": -5,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 22
              },
              {
                "value": 100,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 20,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 20,
            "lowF": -5,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 22
              },
              {
                "value": 100,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 20,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 20,
            "lowF": -5,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 22
              },
              {
                "value": 100,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 20,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 20,
            "lowF": -5,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 22
              },
              {
                "value": 100,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 20,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 20,
            "lowF": -5,
            "highF": 40
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 45
              },
              {
                "value": 75,
                "weight": 22
              },
              {
                "value": 100,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 20,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 10
              },
              {
                "value": "ice_storm",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": -5,
            "lowF": -35,
            "highF": 10
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 45
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
            "chancePct": 30,
            "eventWeights": [
              {
                "value": "blizzard",
                "weight": 20
              },
              {
                "value": "winter_gale",
                "weight": 10
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 60,
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
            "avgF": 16,
            "lowF": 7,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 21,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 10
              },
              {
                "value": "toxic_fog",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
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
            "avgF": 16,
            "lowF": 7,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 21,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 10
              },
              {
                "value": "toxic_fog",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
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
            "avgF": 16,
            "lowF": 7,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 21,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 10
              },
              {
                "value": "toxic_fog",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
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
            "avgF": 23,
            "lowF": 14,
            "highF": 32
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 15,
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 23,
            "lowF": 14,
            "highF": 32
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 15,
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 23,
            "lowF": 14,
            "highF": 32
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 15,
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 23,
            "lowF": 14,
            "highF": 32
          },
          "precipitation": {
            "chancePct": 40,
            "type": "snow",
            "intensityWeights": {
              "light": 55,
              "moderate": 30,
              "heavy": 15
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "W",
                "weight": 15
              },
              {
                "value": "NE",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 10
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 20
              }
            ]
          },
          "critical": {
            "chancePct": 15,
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 30,
            "lowF": 23,
            "highF": 37
          },
          "precipitation": {
            "chancePct": 27,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
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
            "avgF": 30,
            "lowF": 23,
            "highF": 37
          },
          "precipitation": {
            "chancePct": 27,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
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
            "avgF": 30,
            "lowF": 23,
            "highF": 37
          },
          "precipitation": {
            "chancePct": 27,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
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
            "avgF": 30,
            "lowF": 23,
            "highF": 37
          },
          "precipitation": {
            "chancePct": 27,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
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
            "avgF": 30,
            "lowF": 23,
            "highF": 37
          },
          "precipitation": {
            "chancePct": 27,
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
                "value": "WNW",
                "weight": 25
              },
              {
                "value": "NW",
                "weight": 25
              },
              {
                "value": "NNW",
                "weight": 15
              },
              {
                "value": "SW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
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
            "avgF": 24,
            "lowF": 15,
            "highF": 33
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 9
              },
              {
                "value": "toxic_fog",
                "weight": 7
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 24,
            "lowF": 15,
            "highF": 33
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 9
              },
              {
                "value": "toxic_fog",
                "weight": 7
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 24,
            "lowF": 15,
            "highF": 33
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 9
              },
              {
                "value": "toxic_fog",
                "weight": 7
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 24,
            "lowF": 15,
            "highF": 33
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 9
              },
              {
                "value": "toxic_fog",
                "weight": 7
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 24,
            "lowF": 15,
            "highF": 33
          },
          "precipitation": {
            "chancePct": 45,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 35
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "ENE",
                "weight": 20
              },
              {
                "value": "E",
                "weight": 15
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
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
                "weight": 25
              }
            ]
          },
          "critical": {
            "chancePct": 18,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 9
              },
              {
                "value": "toxic_fog",
                "weight": 7
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
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 56,
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
            "avgF": 16,
            "lowF": 7,
            "highF": 25
          },
          "precipitation": {
            "chancePct": 50,
            "type": "snow",
            "intensityWeights": {
              "light": 40,
              "moderate": 35,
              "heavy": 25
            }
          },
          "wind": {
            "directionWeights": [
              {
                "value": "N",
                "weight": 40
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 20
              },
              {
                "value": "ENE",
                "weight": 10
              },
              {
                "value": "NW",
                "weight": 5
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 5
              },
              {
                "value": 50,
                "weight": 55
              },
              {
                "value": 75,
                "weight": 40
              }
            ]
          },
          "critical": {
            "chancePct": 21,
            "eventWeights": [
              {
                "value": "maelstrom",
                "weight": 10
              },
              {
                "value": "toxic_fog",
                "weight": 8
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
            "temperature": 3,
            "precipitation": 2,
            "skies": 1,
            "wind": 2,
            "directionChangePct": 60,
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
        "totalDepthFeet": 150,
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
            "avgF": 30,
            "lowF": 22,
            "highF": 38
          },
          "precipitation": {
            "chancePct": 20,
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
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 15,
            "eventWeights": [
              {
                "value": "cave_in",
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 30,
            "lowF": 22,
            "highF": 38
          },
          "precipitation": {
            "chancePct": 20,
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
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 15,
            "eventWeights": [
              {
                "value": "cave_in",
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 30,
            "lowF": 22,
            "highF": 38
          },
          "precipitation": {
            "chancePct": 20,
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
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 15,
            "eventWeights": [
              {
                "value": "cave_in",
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
            "avgF": 34,
            "lowF": 26,
            "highF": 42
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 63
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 9,
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
            "directionChangePct": 38,
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
            "avgF": 34,
            "lowF": 26,
            "highF": 42
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 63
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 9,
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
            "directionChangePct": 38,
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
            "avgF": 34,
            "lowF": 26,
            "highF": 42
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 63
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 9,
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
            "directionChangePct": 38,
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
            "avgF": 34,
            "lowF": 26,
            "highF": 42
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
                "value": "NW",
                "weight": 40
              },
              {
                "value": "W",
                "weight": 30
              },
              {
                "value": "N",
                "weight": 20
              },
              {
                "value": "NE",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 35
              },
              {
                "value": 50,
                "weight": 63
              },
              {
                "value": 75,
                "weight": 2
              }
            ]
          },
          "critical": {
            "chancePct": 9,
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
            "directionChangePct": 38,
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
            "avgF": 40,
            "lowF": 34,
            "highF": 46
          },
          "precipitation": {
            "chancePct": 11,
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
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 54
              },
              {
                "value": 75,
                "weight": 1
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
            "avgF": 40,
            "lowF": 34,
            "highF": 46
          },
          "precipitation": {
            "chancePct": 11,
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
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 54
              },
              {
                "value": 75,
                "weight": 1
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
            "avgF": 40,
            "lowF": 34,
            "highF": 46
          },
          "precipitation": {
            "chancePct": 11,
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
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 54
              },
              {
                "value": 75,
                "weight": 1
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
            "avgF": 40,
            "lowF": 34,
            "highF": 46
          },
          "precipitation": {
            "chancePct": 11,
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
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 54
              },
              {
                "value": 75,
                "weight": 1
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
            "avgF": 40,
            "lowF": 34,
            "highF": 46
          },
          "precipitation": {
            "chancePct": 11,
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
                "weight": 40
              },
              {
                "value": "SW",
                "weight": 30
              },
              {
                "value": "NW",
                "weight": 20
              },
              {
                "value": "N",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 45
              },
              {
                "value": 50,
                "weight": 54
              },
              {
                "value": 75,
                "weight": 1
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
            "avgF": 35,
            "lowF": 27,
            "highF": 43
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
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 67
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 5
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
            "directionChangePct": 40,
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
            "avgF": 35,
            "lowF": 27,
            "highF": 43
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
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 67
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 5
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
            "directionChangePct": 40,
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
            "avgF": 35,
            "lowF": 27,
            "highF": 43
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
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 67
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 5
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
            "directionChangePct": 40,
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
            "avgF": 35,
            "lowF": 27,
            "highF": 43
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
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 67
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 5
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
            "directionChangePct": 40,
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
            "avgF": 35,
            "lowF": 27,
            "highF": 43
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
                "value": "N",
                "weight": 45
              },
              {
                "value": "NE",
                "weight": 25
              },
              {
                "value": "E",
                "weight": 20
              },
              {
                "value": "NW",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 30
              },
              {
                "value": 50,
                "weight": 67
              },
              {
                "value": 75,
                "weight": 3
              }
            ]
          },
          "critical": {
            "chancePct": 10,
            "eventWeights": [
              {
                "value": "cave_in",
                "weight": 5
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
            "directionChangePct": 40,
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
            "avgF": 30,
            "lowF": 22,
            "highF": 38
          },
          "precipitation": {
            "chancePct": 20,
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
                "value": "N",
                "weight": 50
              },
              {
                "value": "NNE",
                "weight": 25
              },
              {
                "value": "NE",
                "weight": 15
              },
              {
                "value": "E",
                "weight": 10
              }
            ],
            "strengthWeights": [
              {
                "value": 25,
                "weight": 25
              },
              {
                "value": 50,
                "weight": 70
              },
              {
                "value": 75,
                "weight": 5
              }
            ]
          },
          "critical": {
            "chancePct": 15,
            "eventWeights": [
              {
                "value": "cave_in",
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
            "temperature": 3,
            "precipitation": 1,
            "skies": 1,
            "wind": 1,
            "directionChangePct": 50,
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
          "avgF": 12,
          "lowF": -10,
          "highF": 28
        },
        "precipitation": {
          "chancePct": 60,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 45
            },
            {
              "value": "NNE",
              "weight": 30
            },
            {
              "value": "NE",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 10
            },
            {
              "value": 50,
              "weight": 25
            },
            {
              "value": 75,
              "weight": 45
            },
            {
              "value": 100,
              "weight": 20
            }
          ]
        },
        "critical": {
          "chancePct": 30,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 12
            },
            {
              "value": "sea_storm",
              "weight": 18
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
          "temperature": 3,
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
            "lowTimeHHMM": "0930",
            "highTimeHHMM": "1300",
            "riseCurve": 1.15,
            "fallCurve": 0.95
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
              "max": 300
            },
            "eventStartOffsetMinutes": {
              "min": 20,
              "max": 60
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 60
            }
          }
        }
      },
      "midwinter": {
        "temperature": {
          "avgF": 12,
          "lowF": -10,
          "highF": 28
        },
        "precipitation": {
          "chancePct": 60,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 45
            },
            {
              "value": "NNE",
              "weight": 30
            },
            {
              "value": "NE",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 10
            },
            {
              "value": 50,
              "weight": 25
            },
            {
              "value": 75,
              "weight": 45
            },
            {
              "value": 100,
              "weight": 20
            }
          ]
        },
        "critical": {
          "chancePct": 30,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 12
            },
            {
              "value": "sea_storm",
              "weight": 18
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
          "temperature": 3,
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
            "lowTimeHHMM": "0930",
            "highTimeHHMM": "1300",
            "riseCurve": 1.15,
            "fallCurve": 0.95
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
              "max": 300
            },
            "eventStartOffsetMinutes": {
              "min": 20,
              "max": 60
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 60
            }
          }
        }
      },
      "alturiak": {
        "temperature": {
          "avgF": 12,
          "lowF": -10,
          "highF": 28
        },
        "precipitation": {
          "chancePct": 60,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 45
            },
            {
              "value": "NNE",
              "weight": 30
            },
            {
              "value": "NE",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 10
            },
            {
              "value": 50,
              "weight": 25
            },
            {
              "value": 75,
              "weight": 45
            },
            {
              "value": 100,
              "weight": 20
            }
          ]
        },
        "critical": {
          "chancePct": 30,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 12
            },
            {
              "value": "sea_storm",
              "weight": 18
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
          "temperature": 3,
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
            "lowTimeHHMM": "0930",
            "highTimeHHMM": "1300",
            "riseCurve": 1.15,
            "fallCurve": 0.95
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
              "max": 300
            },
            "eventStartOffsetMinutes": {
              "min": 20,
              "max": 60
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 60
            }
          }
        }
      },
      "ches": {
        "temperature": {
          "avgF": 28,
          "lowF": 5,
          "highF": 42
        },
        "precipitation": {
          "chancePct": 50,
          "type": "sleet",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NNW",
              "weight": 40
            },
            {
              "value": "NW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 20
            },
            {
              "value": "N",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 40
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
              "weight": 12
            },
            {
              "value": "toxic_fog",
              "weight": 8
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
            "lowTimeHHMM": "0700",
            "highTimeHHMM": "1430",
            "riseCurve": 1.6,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
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
              "min": 60,
              "max": 210
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 35
            }
          }
        }
      },
      "tarsakh": {
        "temperature": {
          "avgF": 28,
          "lowF": 5,
          "highF": 42
        },
        "precipitation": {
          "chancePct": 50,
          "type": "sleet",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NNW",
              "weight": 40
            },
            {
              "value": "NW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 20
            },
            {
              "value": "N",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 40
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
              "weight": 12
            },
            {
              "value": "toxic_fog",
              "weight": 8
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
            "lowTimeHHMM": "0700",
            "highTimeHHMM": "1430",
            "riseCurve": 1.6,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
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
              "min": 60,
              "max": 210
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 35
            }
          }
        }
      },
      "greengrass": {
        "temperature": {
          "avgF": 28,
          "lowF": 5,
          "highF": 42
        },
        "precipitation": {
          "chancePct": 50,
          "type": "sleet",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NNW",
              "weight": 40
            },
            {
              "value": "NW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 20
            },
            {
              "value": "N",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 40
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
              "weight": 12
            },
            {
              "value": "toxic_fog",
              "weight": 8
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
            "lowTimeHHMM": "0700",
            "highTimeHHMM": "1430",
            "riseCurve": 1.6,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
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
              "min": 60,
              "max": 210
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 35
            }
          }
        }
      },
      "mirtul": {
        "temperature": {
          "avgF": 28,
          "lowF": 5,
          "highF": 42
        },
        "precipitation": {
          "chancePct": 50,
          "type": "sleet",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "NNW",
              "weight": 40
            },
            {
              "value": "NW",
              "weight": 30
            },
            {
              "value": "W",
              "weight": 20
            },
            {
              "value": "N",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 40
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
              "weight": 12
            },
            {
              "value": "toxic_fog",
              "weight": 8
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
            "lowTimeHHMM": "0700",
            "highTimeHHMM": "1430",
            "riseCurve": 1.6,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
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
              "min": 60,
              "max": 210
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 35
            }
          }
        }
      },
      "kythorn": {
        "temperature": {
          "avgF": 42,
          "lowF": 28,
          "highF": 58
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
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 18
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
            "lowTimeHHMM": "0700",
            "highTimeHHMM": "1430",
            "riseCurve": 1.6,
            "fallCurve": 1.1
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
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
              "min": 60,
              "max": 210
            },
            "eventStartOffsetMinutes": {
              "min": 15,
              "max": 45
            },
            "eventTailBufferMinutes": {
              "min": 15,
              "max": 35
            }
          }
        }
      },
      "flamerule": {
        "temperature": {
          "avgF": 42,
          "lowF": 28,
          "highF": 58
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
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 18
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
            "lowTimeHHMM": "0300",
            "highTimeHHMM": "1630",
            "riseCurve": 2.2,
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
              "min": 45,
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
      "midsummer": {
        "temperature": {
          "avgF": 42,
          "lowF": 28,
          "highF": 58
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
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 18
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
            "lowTimeHHMM": "0300",
            "highTimeHHMM": "1630",
            "riseCurve": 2.2,
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
              "min": 45,
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
      "shieldmeet": {
        "temperature": {
          "avgF": 42,
          "lowF": 28,
          "highF": 58
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
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 18
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
            "lowTimeHHMM": "0300",
            "highTimeHHMM": "1630",
            "riseCurve": 2.2,
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
              "min": 45,
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
      "eleasis": {
        "temperature": {
          "avgF": 42,
          "lowF": 28,
          "highF": 58
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
              "value": "WNW",
              "weight": 30
            },
            {
              "value": "NW",
              "weight": 25
            },
            {
              "value": "SW",
              "weight": 10
            }
          ],
          "strengthWeights": [
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
              "weight": 18
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
            "lowTimeHHMM": "0300",
            "highTimeHHMM": "1630",
            "riseCurve": 2.2,
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
              "min": 45,
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
      "eleint": {
        "temperature": {
          "avgF": 30,
          "lowF": 5,
          "highF": 45
        },
        "precipitation": {
          "chancePct": 55,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 40
            },
            {
              "value": "NE",
              "weight": 30
            },
            {
              "value": "E",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 10
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 40
            },
            {
              "value": 100,
              "weight": 15
            }
          ]
        },
        "critical": {
          "chancePct": 25,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 15
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
          "temperature": 3,
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
            "lowTimeHHMM": "0800",
            "highTimeHHMM": "1330",
            "riseCurve": 1.4,
            "fallCurve": 1.0
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 135
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 240
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
      "highharvestide": {
        "temperature": {
          "avgF": 30,
          "lowF": 5,
          "highF": 45
        },
        "precipitation": {
          "chancePct": 55,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 40
            },
            {
              "value": "NE",
              "weight": 30
            },
            {
              "value": "E",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 10
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 40
            },
            {
              "value": 100,
              "weight": 15
            }
          ]
        },
        "critical": {
          "chancePct": 25,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 15
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
          "temperature": 3,
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
            "lowTimeHHMM": "0800",
            "highTimeHHMM": "1330",
            "riseCurve": 1.4,
            "fallCurve": 1.0
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 135
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 240
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
      "marpenoth": {
        "temperature": {
          "avgF": 30,
          "lowF": 5,
          "highF": 45
        },
        "precipitation": {
          "chancePct": 55,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 40
            },
            {
              "value": "NE",
              "weight": 30
            },
            {
              "value": "E",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 10
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 40
            },
            {
              "value": 100,
              "weight": 15
            }
          ]
        },
        "critical": {
          "chancePct": 25,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 15
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
          "temperature": 3,
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
            "lowTimeHHMM": "0800",
            "highTimeHHMM": "1330",
            "riseCurve": 1.4,
            "fallCurve": 1.0
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 135
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 240
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
      "uktar": {
        "temperature": {
          "avgF": 30,
          "lowF": 5,
          "highF": 45
        },
        "precipitation": {
          "chancePct": 55,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 40
            },
            {
              "value": "NE",
              "weight": 30
            },
            {
              "value": "E",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 10
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 40
            },
            {
              "value": 100,
              "weight": 15
            }
          ]
        },
        "critical": {
          "chancePct": 25,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 15
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
          "temperature": 3,
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
            "lowTimeHHMM": "0800",
            "highTimeHHMM": "1330",
            "riseCurve": 1.4,
            "fallCurve": 1.0
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 135
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 240
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
      "feastofthemoon": {
        "temperature": {
          "avgF": 30,
          "lowF": 5,
          "highF": 45
        },
        "precipitation": {
          "chancePct": 55,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 40
            },
            {
              "value": "NE",
              "weight": 30
            },
            {
              "value": "E",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 10
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 15
            },
            {
              "value": 50,
              "weight": 30
            },
            {
              "value": 75,
              "weight": 40
            },
            {
              "value": 100,
              "weight": 15
            }
          ]
        },
        "critical": {
          "chancePct": 25,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 10
            },
            {
              "value": "sea_storm",
              "weight": 15
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
          "temperature": 3,
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
            "lowTimeHHMM": "0800",
            "highTimeHHMM": "1330",
            "riseCurve": 1.4,
            "fallCurve": 1.0
          },
          "governor": {
            "temperatureMaxDeltaF": 3,
            "rainMaxStep": 1,
            "skyMaxStep": 1,
            "windMaxStep": 1,
            "currentStrengthMaxDeltaPct": 10,
            "currentTemperatureMaxDeltaF": 3,
            "currentDirectionMaxStep": 2,
            "interpolateWindStrength": true,
            "interpolateCurrentStrength": true,
            "interpolateCurrentTemperature": true
          },
          "activation": {
            "skyLeadMinutes": {
              "min": 60,
              "max": 135
            },
            "precipitationDurationMinutes": {
              "min": 75,
              "max": 240
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
      "nightal": {
        "temperature": {
          "avgF": 12,
          "lowF": -10,
          "highF": 28
        },
        "precipitation": {
          "chancePct": 60,
          "type": "snow",
          "intensityWeights": {
            "light": 40,
            "moderate": 35,
            "heavy": 25
          }
        },
        "wind": {
          "directionWeights": [
            {
              "value": "N",
              "weight": 45
            },
            {
              "value": "NNE",
              "weight": 30
            },
            {
              "value": "NE",
              "weight": 20
            },
            {
              "value": "NW",
              "weight": 5
            }
          ],
          "strengthWeights": [
            {
              "value": 25,
              "weight": 10
            },
            {
              "value": 50,
              "weight": 25
            },
            {
              "value": 75,
              "weight": 45
            },
            {
              "value": 100,
              "weight": 20
            }
          ]
        },
        "critical": {
          "chancePct": 30,
          "eventWeights": [
            {
              "value": "blizzard",
              "weight": 12
            },
            {
              "value": "sea_storm",
              "weight": 18
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
          "temperature": 3,
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
            "lowTimeHHMM": "0930",
            "highTimeHHMM": "1300",
            "riseCurve": 1.15,
            "fallCurve": 0.95
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
              "max": 300
            },
            "eventStartOffsetMinutes": {
              "min": 20,
              "max": 60
            },
            "eventTailBufferMinutes": {
              "min": 20,
              "max": 60
            }
          }
        }
      }
    },
    "seasonalCurrents": {
      "winter": {
        "direction": "N",
        "readings": {
          "surface": {
            "direction": "N",
            "temperatureF": 18,
            "strengthPct": 54
          },
          "shallow": {
            "direction": "N",
            "temperatureF": 17,
            "strengthPct": 74
          },
          "mid": {
            "direction": "N",
            "temperatureF": 16,
            "strengthPct": 66
          },
          "deep": {
            "direction": "N",
            "temperatureF": 12,
            "strengthPct": 58
          }
        }
      },
      "spring": {
        "direction": "N",
        "readings": {
          "surface": {
            "direction": "N",
            "temperatureF": 25,
            "strengthPct": 46
          },
          "shallow": {
            "direction": "N",
            "temperatureF": 24,
            "strengthPct": 66
          },
          "mid": {
            "direction": "N",
            "temperatureF": 23,
            "strengthPct": 58
          },
          "deep": {
            "direction": "N",
            "temperatureF": 19,
            "strengthPct": 50
          }
        }
      },
      "summer": {
        "direction": "W",
        "readings": {
          "surface": {
            "direction": "W",
            "temperatureF": 32,
            "strengthPct": 36
          },
          "shallow": {
            "direction": "W",
            "temperatureF": 31,
            "strengthPct": 56
          },
          "mid": {
            "direction": "W",
            "temperatureF": 30,
            "strengthPct": 48
          },
          "deep": {
            "direction": "W",
            "temperatureF": 26,
            "strengthPct": 40
          }
        }
      },
      "autumn": {
        "direction": "N",
        "readings": {
          "surface": {
            "direction": "N",
            "temperatureF": 26,
            "strengthPct": 49
          },
          "shallow": {
            "direction": "N",
            "temperatureF": 25,
            "strengthPct": 69
          },
          "mid": {
            "direction": "N",
            "temperatureF": 24,
            "strengthPct": 61
          },
          "deep": {
            "direction": "N",
            "temperatureF": 20,
            "strengthPct": 53
          }
        }
      }
    },
    "climateControl": {
      "diurnal": {
        "lowTimeHHMM": "0700",
        "highTimeHHMM": "1430",
        "riseCurve": 1.6,
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
          "min": 60,
          "max": 135
        },
        "precipitationDurationMinutes": {
          "min": 75,
          "max": 240
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

