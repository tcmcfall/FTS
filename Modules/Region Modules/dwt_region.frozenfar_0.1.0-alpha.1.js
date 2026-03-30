// name:        dwt_region.frozenfar.js
// version:     0.1.0-alpha.1
// description: Unified Frozenfar region module for dwt_weather and dwt_mapMeta.
// provides:    dwt_mule ability: regions (root JSON; regions.frozenfar), version entry dwt_region.frozenfar_0.1.0-alpha.1
// depends:     dwt_weather >= 0.1.0-alpha.1 (recommended), dwt_core >= 0.1.0-alpha.1 (optional startup registration), Roll20 API.
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
// canonical references:
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
  var REGION_KEY = 'frozenfar';
  var MODULE_NAME = 'dwt_region.' + REGION_KEY;
  var _startupRegistered = false;

  // Tolkien-inspired quip scaffold:
  // - short: 2 lines, AA
  // - medium: 4 lines, ACBC
  // - long: 8 lines, ABCBDEFE
  // Keep the voice conversational, lightly rhythmic, and maritime where possible.
  // Calendar month keys use Harptos month names (hammer..nightal); festival keys use between-month festival keys.

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
  "quips": {
    "calendar": {
      "months": {
        "hammer": { "short": [], "medium": [], "long": [] },
        "alturiak": { "short": [], "medium": [], "long": [] },
        "ches": { "short": [], "medium": [], "long": [] },
        "tarsakh": { "short": [], "medium": [], "long": [] },
        "mirtul": { "short": [], "medium": [], "long": [] },
        "kythorn": { "short": [], "medium": [], "long": [] },
        "flamerule": { "short": [], "medium": [], "long": [] },
        "eleasis": { "short": [], "medium": [], "long": [] },
        "eleint": { "short": [], "medium": [], "long": [] },
        "marpenoth": { "short": [], "medium": [], "long": [] },
        "uktar": { "short": [], "medium": [], "long": [] },
        "nightal": { "short": [], "medium": [], "long": [] }
      },
      "festivals": {
        "midwinter": { "short": [], "medium": [], "long": [] },
        "greengrass": { "short": [], "medium": [], "long": [] },
        "midsummer": { "short": [], "medium": [], "long": [] },
        "shieldmeet": { "short": [], "medium": [], "long": [] },
        "highharvestide": { "short": [], "medium": [], "long": [] },
        "feastofthemoon": { "short": [], "medium": [], "long": [] }
      }
    },
    "weather": {
      "region": {
        "short": [
          "Frozenfar keeps its weather hard in rime, in salt, in stone|Yet folk there laugh with red-bit lips and call the cold their own",
          "Where auroras stain the harbor green and pack-ice grips the bar|A weather-wise soul reads the sky as if it were a scar",
          "In Frozenfar the sea bites white and cliffs bite black above|A tighter knot, a deeper fire, and both will pass for love"
        ],
        "medium": [
          "Cold weather rules the northern quay|Where floes grind slow below the light|A pilot trusts his beard for truth|Before the dawn admits he's right",
          "In Frozenfar the lamps burn low|And rime takes hold of spar and bone|Yet harbor folk keep working still|As if the gale were kin well known",
          "The cliffs stand black, the surf stands white|The sky turns green in winter's glass|A northman says the clever thrive|By letting colder weather pass"
        ],
        "long": [
          "Frozenfar keeps an iron coast|With floes along the bar|The sea breathes mist, the cliffs breathe cold|Beneath the northern star|A pilot reads the wind by pain|That stiffens hand and cheek|For weather there speaks plain enough|To all who know its speech",
          "When auroras lean above the bay|And ice begins to ring|The harbor shrinks to lamp and oath|And every board to spring|Yet folk of Frozenfar endure|With seal-oil fire and song|For in that hard and bitter land|Stout hearts have winter long",
          "The snow comes slant in Frozenfar|The surf comes dark and steep|The dead are named beside the stove|Before the folk can sleep|A captain banks the embers high|And checks the frozen chain|For northland weather favors those|Who reckon twice with pain"
        ]
      },
      "locales": {
        "offshore": {
          "short": [
            "Off Frozenfar the pack-ice knocks like knuckles on a door|And every swell seems old enough to ask for one year more",
            "The offshore dark runs black and green beneath a glassy cold|A sailor there keeps speech cut short and both hands hard and bold",
            "Far offshore in Frozenfar the wind comes clean as pain|And even gulls look built of bone above the iron main"
          ],
          "medium": [
            "Beyond the headlands floes drift slow|And grind in dull and patient time|A helmsman listens more than speaks|For offshore weather talks in rime",
            "The outer swells are dark as ore|The sky sits low, the cold bites through|A northern mate will bless no chart|Until the gulls agree it true",
            "Offshore in Frozenfar the wind|Can skin the boast from any lip|A prudent soul reefs early there|And learns humility from ship"
          ],
          "long": [
            "Offshore the ice fields shift and groan|Beyond the harbor light|The swells rise black, the foam burns pale|Against the polar night|A lookout names the moving floes|Like kin he used to know|For offshore weather there can kill|The hand that learns too slow",
            "The outer sea of Frozenfar|Is dark as hammered lead|The wind can flay the cheek to bone|Before the clouds have spread|A captain trusts a smaller sail|A tighter lash, a prayer|For offshore weather keeps no room|For fools or borrowed air",
            "When pack-ice drifts across the lanes|And closes half the way|The bells ashore grow faint and small|Against the iron spray|Yet crews that know the northern deeps|Go on with steady hands|For offshore weather crowns the folk|Who bend before commands"
          ]
        },
        "coastal": {
          "short": [
            "On Frozenfar's black coastal stones the surf leaves silver lace|And weather writes in salt and rime across the harbor face",
            "The coastal wind tastes half of snow and half of iron foam|Yet every lamp beside the pier insists the quay is home",
            "Along that coast the tide runs hard beneath a frost-bit sky|A fisher mends by lantern glow and lets the long squalls cry"
          ],
          "medium": [
            "The coastal bells ring sharp with frost|The piers are white by dawn's first light|A harbor wife can smell bad weather|Long before the surf turns white",
            "Black stone, white foam, and iron cold|Make Frozenfar's coast plain to read|A careful crew trusts lamp and reef|And never more than winter's speed",
            "Along the coastal walls the spray|Turns rope and rail to salted glass|The wise step slow, speak low, and wait|For harsher weather yet to pass"
          ],
          "long": [
            "The coastal rocks of Frozenfar|Wear rime instead of green|The surf strikes hard, the gulls fly low|The sky stays iron lean|A dockhand lifts the lantern shield|And squints into the foam|For coastal weather there makes clear|How dearly folk earn home",
            "By black stone piers and frozen slips|The tide keeps up its war|It salts the rail, it stiffens net|It rattles every spar|Yet coastal folk keep soup and fire|For all who reach the quay|Because the weather takes enough|Without their help that day",
            "When coastal spray comes knife and white|Across the harbor wall|The bells ring thin, the shutters shake|The saint-lamps burn though small|A fisher rows the last skiff in|And ties with numbing hands|For coastal weather honors most|The one who understands"
          ]
        },
        "inland": {
          "short": [
            "Inland in Frozenfar the snow lies wide as judgment laid|And every sled-track looks like script the winter itself made",
            "The tundra wind combs birch and moss till both bow white and low|A traveler there trusts smoke at dusk more than the drifted road",
            "Far inland all the weather speaks through antler, snow, and hide|And those who live by northern trails keep patience at their side"
          ],
          "medium": [
            "Inland the snowfields take the moon|And throw it back in patient blue|A trapper reads the weather there|By what the reindeer choose to do",
            "The birches crack, the sled-runners sing|The sky goes pale from end to end|In Frozenfar the inland wise|Make weather into working friend",
            "Where road is drift and hill is white|A chimney means more than a crown|The inland folk of Frozenfar know|How fast proud weather knocks men down"
          ],
          "long": [
            "Far inland Frozenfar lies wide|In drift and birch and bone|The sky can arch for half a day|And still leave travelers lone|A trapper watches fox and deer|Before he shifts his line|For inland weather teaches most|The folk who read its sign",
            "The tundra takes the snowfall first|And holds it without end|A sledge track lasts until the gale|Decides it needs to bend|Yet inland hearts burn slow and sure|Beside the evening flame|For Frozenfar rewards the ones|Who greet hard weather same",
            "When daylight thins on inland drifts|And birches darken blue|The old trails vanish one by one|Though each was plain and true|A hunter banks his little fire|And waits the squall to tire|For inland weather loves the soul|That wastes no step nor fire"
          ]
        },
        "underwater": {
          "short": [
            "Below Frozenfar the water glows like bottle-glass and steel|And every current carries cold enough for bone to feel",
            "Under the ice the green light bends on kelp and broken spar|The sea keeps quieter weather there, but never kinder far",
            "Frozenfar below the waves is black, is green, is slow|A diver learns the weight of cold in every muted flow"
          ],
          "medium": [
            "Below the floes the daylight sifts|In green along the broken kelp|A diver knows the colder currents|Need no words to ask for help",
            "The underwater roads run dark|Beneath the ice and whaling ground|In Frozenfar even the sea|Makes weather with a quieter sound",
            "Cold water folds through reef and wreck|And presses thought to slower pace|A swimmer there learns northern calm|From every seal-dark passing face"
          ],
          "long": [
            "Below the ice of Frozenfar|The daylight travels green|It finds the wrecks, it finds the weed|It shows what cold can mean|A diver moves with careful hands|Where silence rules the bar|For underwater weather there|Is slower, not less hard",
            "The currents under Frozenfar|Run dark beneath the floe|They turn the kelp, they stir the silt|They pull the long weeds low|A swimmer reads them by the skin|Before the eye can tell|For underwater weather keeps|Its warnings mute but well",
            "Where broken spars lie furred with weed|And seal-shapes pass above|The sea keeps house in northern green|Too cold for haste or love|A diver learns to spare his breath|And move with quieter art|For underwater weather there|Can seize a reckless heart"
          ]
        },
        "underdark": {
          "short": [
            "Beneath Frozenfar the old dwarf roads wear rime instead of rain|And every draft comes cold enough to wake the rock to pain",
            "The deep halls keep a frost-bit hush where lantern echoes roam|A traveler there trusts heated stone more than he trusts a home",
            "In Frozenfar's underdark the air moves thin, then still, then wrong|And wise folk heed the smallest draft before it grows too strong"
          ],
          "medium": [
            "Below the cliffs the caverns breathe|With cold that never learns the day|A miner says the deeper drafts|Can turn a brave man's will away",
            "Rime on chain and dripstone white|Mark routes the unwary should not choose|The underdark of Frozenfar|Makes weather out of little clues",
            "The deep roads hold their silence long|Till one thin draft disturbs the flame|Then every wiser traveler knows|The cave has shifted all the same"
          ],
          "long": [
            "Beneath Frozenfar the stone goes cold|And keeps the cold it won|No tide is seen, no gull is heard|No memory of the sun|A lantern flickers at one turn|Where hidden drafts conspire|For underdark weather there can speak|By one uneasy fire",
            "The old dwarf roads run dark and hard|With rime on rail and chain|A traveler hears the weather there|In whisper, not in rain|One colder breath along the wall|One sudden dying flame|These are the signs the deep earth gives|Before it shifts its frame",
            "In caverns far below the quay|The silence carries weight|The air stays still until it stirs|And then the wise men wait|A scout lays palm to frozen stone|To see how lamplights bend|For underdark weather under Frozenfar|Can change before the end"
          ]
        }
      }
    }
  },
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

