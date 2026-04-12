// name:        fts_region.moonshaes.js
// version:     0.1.0-alpha.1
// description: Unified Moonshaes region module for fts_weather and fts_mapMeta.
// provides:    fts_mule ability: regions (root JSON; regions.moonshaes), version entry fts_region.moonshaes_0.1.0-alpha.1
// depends:     fts_weather >= 0.1.0-alpha.1 (recommended), fts_core >= 0.1.0-alpha.1 (optional startup registration), Roll20 API.
// author:      tcm (AI-assisted)
// Semantic Versioning (SemVer) Policy:
// - FTS uses SemVer in the form MAJOR.MINOR.PATCH[-PRERELEASE].
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
  var REGION_KEY = 'moonshaes';
  var MODULE_NAME = 'fts_region.' + REGION_KEY;
  var _startupRegistered = false;

  // Tolkien-inspired quip scaffold:
  // - short: 2 lines, AA
  // - medium: 4 lines, ACBC
  // - long: 8 lines, ABCBDEFE
  // Keep the voice conversational, lightly rhythmic, and maritime where possible.
  // Calendar month keys use Harptos month names (hammer..nightal); festival keys use between-month festival keys.

  var REGION_ENTRY = {
  "schema": "fts.region.v4",
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
        "Documentation/fts_README_weathermapping.docx"
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
        "Documentation/fts_README_weathermapping.docx"
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
        "Documentation/fts_README_weathermapping.docx"
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
    "Climate analogue: Scotland & Western Ireland, per Documentation/fts_README_weathermapping.docx.",
    "Monthly temperature, precipitation, and prevailing-wind defaults are aligned to the analogue using ECMWF ERA5 climatology.",
    "Seasonal surface and subsurface water temperatures are checked against NOAA OISST and Copernicus Marine global ocean-physics guidance.",
    "Water-column sampling uses surface plus 20/60/80% depths for inland and coastal columns, while offshore defaults use 1, 5, and 10 fathoms.",
    "Exact-clock diurnal controls follow a North Atlantic maritime regime, with long-lived fronts offshore and muted subterranean variance below ground."
  ],

    "tradePoints": {
      "notes": [
        "Map Point Wizard ships with built-in trade-point templates already.",
        "The templates array below adds or overrides options when this region is selected.",
        "Keep these templates simple: a key, a short label, a short summary, and defaults that stay easy to edit.",
        "Defaults may omit any field the GM should always choose manually."
      ],
    "templates": [
      {
        "key": "fishing_village",
        "label": "Fishing Village",
        "summary": "Small coastal trade node with dependable catch, modest wealth, and simple defenses.",
        "defaults": {
          "locale": "coastal",
          "population": "350",
          "development": "2",
          "wealth": "2",
          "faiths": ["chauntea", "umberlee"],
          "factions": ["fishers_guild", "town_council"],
          "offense_level": "1",
          "offense_types": ["militia", "scouts"],
          "defense_level": "2",
          "defense_types": ["harbor_patrols", "natural_barriers"],
          "tradeGoods": [
            { "stance": "has", "goodKey": "fish_fresh", "windows": [{ "key": "spring", "cu": "6" }, { "key": "summer", "cu": "10" }, { "key": "autumn", "cu": "8" }] },
            { "stance": "has", "goodKey": "fish_salted", "windows": [{ "key": "annual", "cu": "4" }] },
            { "stance": "wants", "goodKey": "grain", "windows": [{ "key": "annual", "cu": "5" }] },
            { "stance": "needs", "goodKey": "lamp_oil", "windows": [{ "key": "annual", "cu": "2" }] }
          ]
        }
      },
      {
        "key": "pirate_smuggler_cove",
        "label": "Pirate / Smuggler Cove",
        "summary": "Hidden maritime exchange point with illicit traffic, sharper offense, and fragile legitimacy.",
        "defaults": {
          "locale": "coastal",
          "population": "220",
          "development": "2",
          "wealth": "3",
          "faiths": ["mask", "umberlee"],
          "factions": ["smugglers_ring", "pirate_captains"],
          "offense_level": "3",
          "offense_types": ["raiders", "armed_ships", "saboteurs"],
          "defense_level": "2",
          "defense_types": ["hidden_channels", "safehouses", "natural_barriers"],
          "tradeGoods": [
            { "stance": "has", "goodKey": "stolen_goods", "windows": [{ "key": "annual", "cu": "3" }] },
            { "stance": "has", "goodKey": "smuggled_luxuries", "windows": [{ "key": "summer", "cu": "4" }, { "key": "autumn", "cu": "5" }] },
            { "stance": "wants", "goodKey": "ship_repair_supplies", "windows": [{ "key": "annual", "cu": "4" }] },
            { "stance": "needs", "goodKey": "medicinal_herbs", "windows": [{ "key": "annual", "cu": "1" }] }
          ]
        }
      },
      {
        "key": "minor_trade_hub",
        "label": "Minor Trade Hub",
        "summary": "Modest inland market center with steady caravan traffic and practical civic infrastructure.",
        "defaults": {
          "locale": "inland",
          "population": "1200",
          "development": "3",
          "wealth": "3",
          "faiths": ["waukeen"],
          "factions": ["merchants_guild", "town_council"],
          "offense_level": "2",
          "offense_types": ["militia", "trained_guard"],
          "defense_level": "2",
          "defense_types": ["walls", "patrols"],
          "tradeGoods": [
            { "stance": "has", "goodKey": "warehousing", "windows": [{ "key": "annual", "cu": "6" }] },
            { "stance": "has", "goodKey": "iron_tools", "windows": [{ "key": "annual", "cu": "4" }] },
            { "stance": "wants", "goodKey": "grain", "windows": [{ "key": "annual", "cu": "6" }] },
            { "stance": "needs", "goodKey": "rope", "windows": [{ "key": "annual", "cu": "2" }] }
          ]
        }
      },
      {
        "key": "moderate_trade_hub",
        "label": "Moderate Trade Hub",
        "summary": "Established trade city with deeper reserves, stronger customs presence, and broader seasonal throughput.",
        "defaults": {
          "locale": "coastal",
          "population": "4200",
          "development": "4",
          "wealth": "4",
          "faiths": ["waukeen", "tyr"],
          "factions": ["merchants_guild", "customs_office", "harbormaster_office"],
          "offense_level": "3",
          "offense_types": ["trained_guard", "marines"],
          "defense_level": "3",
          "defense_types": ["fortified_docks", "walls", "harbor_patrols"],
          "tradeGoods": [
            { "stance": "has", "goodKey": "warehousing", "windows": [{ "key": "annual", "cu": "10" }] },
            { "stance": "has", "goodKey": "passage_transport", "windows": [{ "key": "spring", "cu": "5" }, { "key": "summer", "cu": "8" }, { "key": "autumn", "cu": "6" }] },
            { "stance": "wants", "goodKey": "metal_ingots", "windows": [{ "key": "annual", "cu": "6" }] },
            { "stance": "needs", "goodKey": "ship_repair_supplies", "windows": [{ "key": "annual", "cu": "4" }] }
          ]
        }
      },
      {
        "key": "major_trade_hub",
        "label": "Major Trade Hub",
        "summary": "Major regional trade city with exceptional throughput, powerful institutions, and year-round cargo demand.",
        "defaults": {
          "locale": "coastal",
          "population": "12000",
          "development": "5",
          "wealth": "5",
          "faiths": ["waukeen", "gond", "tyr"],
          "factions": ["merchants_guild", "customs_office", "harbormaster_office", "town_guard"],
          "offense_level": "4",
          "offense_types": ["trained_guard", "marines", "armed_ships"],
          "defense_level": "4",
          "defense_types": ["fortified_docks", "walls", "gatehouses", "harbor_chain"],
          "tradeGoods": [
            { "stance": "has", "goodKey": "warehousing", "windows": [{ "key": "annual", "cu": "18" }] },
            { "stance": "has", "goodKey": "shipwright_services", "windows": [{ "key": "annual", "cu": "10" }] },
            { "stance": "has", "goodKey": "spices", "windows": [{ "key": "spring", "cu": "4" }, { "key": "summer", "cu": "7" }, { "key": "autumn", "cu": "6" }] },
            { "stance": "wants", "goodKey": "grain", "windows": [{ "key": "annual", "cu": "14" }] },
            { "stance": "needs", "goodKey": "lumber", "windows": [{ "key": "annual", "cu": "8" }] }
          ]
        }
      }
    ]
  },
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
          "Moonshae weather smells of peat, of kelp, of rain-swept stone|And every cliff-road learns to bend before the western groan",
          "Where mist climbs heather and old stones stare outward over foam|A wiser folk light lamps at dusk and call the weather home",
          "In Moonshae seas the gulls cry low, the clouds ride wide and gray|Yet every crofter reads the rain as part of living day"
        ],
        "medium": [
          "The Moonshae weather shifts with mist|And lays gray wool on cliff and bay|A sailor trusts the standing stones|Almost as much as break of day",
          "There rain can sweeten peat and thatch|And wind can comb the heather plain|Yet island folk keep easy pace|As if they long expected rain",
          "On Moonshae coasts the clouds sit low|The surf runs white, the grass runs dark|A druid says the weather there|Can bless a man and test his bark"
        ],
        "long": [
          "The Moonshaes wear a shawl of mist|And rain along the stone|The sea comes gray beneath the cliffs|The hills keep peat and bone|A crofter reads the western cloud|Before he trusts the day|For island weather turns as quick|As seals beneath the spray",
          "Where standing stones and heather meet|Above the foaming shore|The wind can sing through gorse and grass|Like some old island lore|A druid lifts his face to rain|And listens for its tune|For Moonshae weather speaks in mist|From dawn until the moon",
          "The Moonshae rain comes soft at first|Then harder off the sea|It darkens roof and brightens peat|And scents the hawthorn tree|Yet island folk set lamps and soup|For all who beat it home|Because the weather there asks less|Of fear than patience grown"
        ]
      },
      "locales": {
        "offshore": {
          "short": [
            "Off Moonshae coasts the swells breathe long beneath a sky of lead|And every seal-dark wave suggests old shipwrecks of the dead",
            "The outer water wears a mist as faithful as a cloak|A helmsman there trusts bell and gull more than a stranger spoke",
            "Far offshore west of Moonshae cliffs the weather broods and sings|And every wake is quickly lost beneath the gray wind's wings"
          ],
          "medium": [
            "Beyond the islands long swells roll|And fog can take the cliffs from sight|A pilot learns the offshore way|By bell and current more than light",
            "The western weather comes with weight|Through mist, through brine, through driving foam|Moonshae crews reef early there|And never boast of getting home",
            "Offshore the sky and sea grow one|In pewter, slate, and woolen gray|A mariner reads weather there|By how the seals refuse to play"
          ],
          "long": [
            "Offshore beyond the Moonshae cliffs|The swells come deep and slow|The mist can close around a mast|Before the crew can know|A lookout strains for bell and bird|Where sight will not suffice|For offshore weather there is old|And patient as sea-ice",
            "The outer lanes of Moonshae seas|Run cold beneath the gray|The waves breathe long, the fog hangs near|And blurs the headlands away|A captain trusts the pull below|And keeps his canvas spare|For offshore weather west of there|Can empty pride with air",
            "Far offshore Moonshae weather broods|In seal-dark swell and rain|The islands fade, the bells go thin|The compass feels like chain|Yet crews that know the western routes|Hold steady through the foam|For offshore weather honors those|Who make no boasts of home"
          ]
        },
        "coastal": {
          "short": [
            "Along Moonshae cliffs the surf climbs white below the dripping stone|And weather hangs from every ledge as if the isle had grown",
            "The coastal rain smells half of peat and half of bitter brine|A harbor there grows dearer still whenever lamps align",
            "On Moonshae quays the gulls cry low and mist invades the lane|A fisher knows the hour by taste of salt and coming rain"
          ],
          "medium": [
            "The coastal weather brings gray mist|To cliff, to cove, to chapel wall|A fishwife reads the coming wind|By how the harbor lights burn small",
            "White surf below and peat smoke up|Make Moonshae coasts a weather chart|The wise tie twice, speak once, and wait|Before they trust the sea's soft heart",
            "Along the piers the spray runs cold|The gulls fly low, the heather bends|Moonshae coastal weather tests|How well a steady lantern tends"
          ],
          "long": [
            "Along the Moonshae coastal roads|The rain comes in from west|It beads the wool, it salts the rail|It lets no stone keep rest|A fisher hauls the final creel|Before the squall grows near|For coastal weather there can turn|From blessing into fear",
            "The cliffs stand dark above the foam|The coves lie gray below|The mist can fold a harbor in|Before the bells all know|Yet coastal folk keep fire and broth|For any driven home|Because the weather takes enough|Without the adding of their own",
            "When Moonshae surf climbs white and hard|Against the harbor stair|The ropes grow black, the dogs stay in|The wet gets in the air|A widow trims the chapel lamp|A boy runs in the net|For coastal weather there reminds|What duty must not forget"
          ]
        },
        "inland": {
          "short": [
            "Inland on Moonshae moors the rain moves sideways through the heath|And every stone circle listens as the weather breathes beneath",
            "Peat smoke, bent grass, and dripping thorn make inland weather plain|A traveler there counts standing stones the way a sailor counts the rain",
            "Across the inland heather-land the wind runs dark and free|And every crofter thanks the wall, the hearth, the thatch, the tree"
          ],
          "medium": [
            "Inland the heather takes the rain|And turns the moor to purple black|A shepherd reads the weather there|By which sheep refuse the track",
            "The inland air smells peat and fern|And wet stone older than the hall|Moonshae folk learn patient weather|By how the curlews rise and call",
            "Where standing stones hold mist at dawn|And gorse keeps bright against the gray|The inland weather teaches hearts|To bend, endure, and bide the day"
          ],
          "long": [
            "Across the Moonshae inland moors|The weather walks in rain|It darkens heather, wets the stone|And brightens fern again|A shepherd counts his flock by sound|When mist takes half the hill|For inland weather there rewards|The folk who learn to still",
            "The peat-smoke climbs from croft and fold|Beneath a woolen sky|The wind moves low through heather roots|And never hurries by|A druid stands beside old stones|And lets the rainfall run|For inland weather there belongs|To moon, to root, to sun",
            "When moorland rain comes thin and slant|And hides the farther sheep|The world grows close to wall and fire|And older vows to keep|Yet inland hearts on Moonshae hills|Do not grow hard with weather|They learn instead to bind their days|Like gorse and stone together"
          ]
        },
        "underwater": {
          "short": [
            "Below Moonshae seas the kelp runs long through green and pewter light|And currents turn like seal-slick thoughts before they come to sight",
            "Under the islands wrecks lie furred with weed and silver sand|A diver there feels weather most by how the shoals all stand",
            "Moonshae water under cliffs is cold, is clear, is deep|And every cave-mouth under surf keeps weather in its sleep"
          ],
          "medium": [
            "Below the isles the daylight falls|Through kelp, through wreck, through seal-dark green|A diver learns the turning tide|Before he knows what it may mean",
            "The underwater roads run cold|Beneath the cliffs and weeping stone|Moonshae currents teach the skin|To trust no seeming calm alone",
            "Below the coves the weed bows slow|And silver fish move thin as mail|A swimmer reads the underwater weather|By where the quieter waters fail"
          ],
          "long": [
            "Below the Moonshae coastal cliffs|The daylight travels green|It paints the kelp, it finds old wrecks|It slips through seams unseen|A diver feels the turning tide|Before his eyes can tell|For underwater weather there|Keeps patient warnings well",
            "The sea-caves under Moonshae rock|Lie cold beneath the foam|The currents breathe in hidden ways|That never quite seem home|A swimmer spares his breath and strength|Where weed and shadow meet|For underwater weather there|Can turn a cove to sleet",
            "Where seal-shapes pass above the weed|And wrecked masts whiten slow|The water keeps an island mood|Of beauty edged with woe|A pearl-diver minds the tug below|And watches silt unroll|For underwater weather there|Can trouble even soul"
          ]
        },
        "underdark": {
          "short": [
            "Below the Moonshae hills the caves keep dripping root and stone|And every draft through buried halls sounds older than the bone",
            "The underdark beneath the isles smells half of moss and brine|A traveler there can read the deep by how the torch-flames line",
            "In Moonshae deep roads weather moves by whisper, damp, and seam|And wise folk heed the smallest chill as if it were a dream"
          ],
          "medium": [
            "Below the moors the caverns breathe|With damp that never leaves the wall|Moonshae underdark weather turns|By hidden vents too small to call",
            "Dripstone, root, and briny draft|Make weather under islands strange|A scout there watches torch and dust|To see when all the stillness change",
            "The deep roads under Moonshae hills|Can hold dead calm for half a day|Then one cold breath through worked old stone|Will send the wiser folk away"
          ],
          "long": [
            "Beneath the Moonshae standing stones|The deeper tunnels wind|With root-hung roofs and briny damp|And weather of their kind|A lantern flares at one blind turn|Where hidden drafts descend|For underdark weather there can speak|Before the stone will bend",
            "The caverns under island peat|Lie wet with seep and hush|No gull is heard, no surf is seen|Yet damp winds start to rush|A scout lays hand on dripping wall|And watches lamplight lean|For underdark weather Moonshae-born|Moves sideways and unseen",
            "In buried roads below the crofts|The silence carries brine|The air stays still until some crack|Lets through a thinner line|A traveler trusts that smallest breath|More than the brightest map|For underdark weather under isles|Can close a careless gap"
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
    RT.ftsRegionQ = RT.ftsRegionQ || [];
    var next = [];
    for(var i=0;i<RT.ftsRegionQ.length;i++){
      var item = RT.ftsRegionQ[i];
      if(item && item.moduleName !== MODULE_NAME) next.push(item);
    }
    next.push({ entry: REGION_ENTRY, moduleName: MODULE_NAME, version: VERSION });
    RT.ftsRegionQ = next;
  }

  function registerRegion(){
    try{
      if(RT.fts_weather && typeof RT.fts_weather.registerRegionEntry === 'function'){
        RT.fts_weather.registerRegionEntry(REGION_ENTRY, MODULE_NAME, VERSION);
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

    RT.ftsQ = RT.ftsQ || [];
    RT.ftsQ.push(function(fts){
      if(fts && typeof fts.registerStartup === 'function'){
        fts.registerStartup(MODULE_NAME, function(){
          registerRegion();
        });
      }
    });

    if(RT.fts && typeof RT.fts.registerStartup === 'function'){
      RT.fts.registerStartup(MODULE_NAME, function(){
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
