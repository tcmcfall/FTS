# FTS Trade Canonical Library

This document defines the official controlled-choice libraries for the `codex/trade-agent-interactions` branch.

It is the authoritative source for:

- mapPoint profile choices
- development and wealth tiers
- trade goods
- culture selections
- faith and deity selections
- power and faction selections
- offense and defense tiers and types

This document exists so the future FTS trade UX can be built from stable, human-readable, GM-friendly lists rather than ad hoc field-by-field inventions.

## Design Intent

These lists are intended to satisfy four goals at once:

- keep the GM-facing configuration surface narrow
- preserve a rich narrative range through combinations of controlled choices
- ensure the same meaning uses the same words across the suite
- give future menus, tooltips, notes parsers, and validation logic one canonical vocabulary source

## Library Boundaries

This library is deliberately split into two layers.

### Layer 1: Suite-Core Libraries

These lists should remain broadly reusable across campaigns and settings.

They include:

- mapPoint profile families
- mapPoint profiles
- development tiers
- wealth tiers
- offense and defense tiers
- offense and defense types
- trade goods

### Layer 2: Setting-Facing Starter Libraries

These lists are still official, but they are more setting-aware.

For this branch, the starter set is aligned to:

- Forgotten Realms
- Lands of Intrigue
- Ghosts of Velen style maritime play

They include:

- cultures
- faiths and deities
- powers and factions

Future setting packs may extend or filter these lists, but this document is the approved starting library for current branch design work.

## Key Rules

- All internal keys must be lower-case snake_case.
- All GM-facing labels must be short and readable.
- `custom` should never appear as a default option in the basic path.
- Custom entries belong to an explicit advanced override path.
- Tooltips and summaries should be generated from these canonical choices rather than authored from scratch.

## Profile Family Library

The UI should narrow the profile list by family before presenting the final profile dropdown.

| Key | Label | Meaning |
| --- | --- | --- |
| `maritime` | Maritime | Coastal, river, harbor, and sea-facing settlements and sites |
| `rural_production` | Rural Production | Villages, camps, and production-focused sites tied to land or raw materials |
| `inland_trade` | Inland Trade | Inland markets, crossroads, and caravan-facing settlements |
| `security` | Security | Defensive, patrol, military, and order-maintaining sites |
| `special_interest` | Special Interest | Religious, ruin, lighthouse, and other specialized points |

## MapPoint Profile Library

These profiles are the approved starting set for static mapPoints.

### Maritime Profiles

| Key | Label | Meaning |
| --- | --- | --- |
| `small_fishing_village` | Small Fishing Village | Small coastal settlement built around daily catch, preservation, and basic trade |
| `fishing_port_town` | Fishing Port Town | Established fishing town with docks, warehousing, and regular market flow |
| `trade_port` | Trade Port | General cargo port with mixed imports, exports, and regional traffic |
| `shipyard_port` | Shipyard Port | Port where repair, refit, timber, rope, pitch, and shipwright labor dominate |
| `river_port` | River Port | Port linking inland and maritime trade through river movement |
| `smuggler_cove` | Smuggler Cove | Hidden or discreet maritime site built around illicit exchange and secrecy |
| `pirate_cove` | Pirate Cove | Maritime base oriented toward raiding, concealment, fencing, and intimidation |
| `lighthouse_station` | Lighthouse Station | Small coastal support site tied to navigation safety, lamp fuel, and repair |

### Rural Production Profiles

| Key | Label | Meaning |
| --- | --- | --- |
| `farm_hamlet` | Farm Hamlet | Small agricultural settlement focused on staple food output |
| `frontier_village` | Frontier Village | Isolated village with mixed subsistence, low reserves, and modest external trade |
| `craft_hamlet` | Craft Hamlet | Small settlement known for a specific workshop trade or handcrafted export |
| `logging_camp` | Logging Camp | Extraction site oriented toward timber, lumber, pitch, and rough labor |
| `mining_camp` | Mining Camp | Extraction site oriented toward ore, stone, and hazardous labor |
| `estate_manor` | Estate Manor | Controlled rural seat producing wealth through land, tenancy, or specialty goods |

### Inland Trade Profiles

| Key | Label | Meaning |
| --- | --- | --- |
| `market_town` | Market Town | Stable inland settlement with regular exchange and local market reach |
| `caravan_stop` | Caravan Stop | Waypoint built around lodging, resupply, stabling, repairs, and travelers |
| `city_district` | City District | One district or quarter within a larger city economy |
| `trade_crossroads` | Trade Crossroads | Inland point where routes meet and goods shift direction or ownership |

### Security Profiles

| Key | Label | Meaning |
| --- | --- | --- |
| `fortified_post` | Fortified Post | Defensive outpost focused on control, deterrence, and limited logistics |
| `watch_keep` | Watch Keep | Guarded site oriented toward observation, signaling, and local order |
| `naval_station` | Naval Station | Maritime security point supporting patrol, marines, and armed vessels |

### Special Interest Profiles

| Key | Label | Meaning |
| --- | --- | --- |
| `religious_site` | Religious Site | Temple, shrine, monastery, or pilgrimage site with faith-driven traffic |
| `ruin_site` | Ruin Site | Abandoned, reclaimed, or hazardous site with unusual value or threat potential |

## Development Tier Library

Development measures civic complexity, infrastructure quality, administrative maturity, and service reliability.

| Value | Key | Label | Meaning |
| --- | --- | --- | --- |
| `1` | `underdeveloped` | Underdeveloped | Sparse infrastructure, weak civic organization, unreliable services |
| `2` | `developing` | Developing | Limited but functional infrastructure with clear gaps and bottlenecks |
| `3` | `established` | Established | Stable baseline infrastructure, routine services, and dependable trade habits |
| `4` | `developed` | Developed | Robust infrastructure, multiple specialists, and stronger logistics |
| `5` | `advanced` | Advanced | Exceptional infrastructure, refined institutions, and uncommon logistical sophistication |

## Wealth Tier Library

Wealth measures purchasing power, visible prosperity, trade liquidity, and the ability to absorb stress.

| Value | Key | Label | Meaning |
| --- | --- | --- | --- |
| `1` | `poor` | Poor | Little surplus, weak reserves, and highly visible scarcity |
| `2` | `modest` | Modest | Limited surplus with some room to trade and maintain basics |
| `3` | `comfortable` | Comfortable | Stable trade posture and enough surplus to manage ordinary disruption |
| `4` | `wealthy` | Wealthy | Strong reserves, flexible purchasing power, and visible prosperity |
| `5` | `opulent` | Opulent | Extraordinary surplus, luxury circulation, and elite spending power |

## Shared Strength Tier Library

These labels should be reused for both offense and defense level selections.

| Value | Key | Label | Meaning |
| --- | --- | --- | --- |
| `1` | `weak` | Weak | Limited capacity; can resist or project force only in minor ways |
| `2` | `capable` | Capable | Functional capacity; can respond to common threats but not prolonged pressure |
| `3` | `strong` | Strong | Reliable force presence with credible deterrence or strike ability |
| `4` | `formidable` | Formidable | Serious regional force with strong discipline, assets, or reach |
| `5` | `mighty` | Mighty | Dominant military posture for the local scale of play |

## Trade Goods Library

This is the approved starter goods list for branch design work.

The list is intentionally curated rather than exhaustive.

It is large enough to cover maritime trade, village exchange, frontier pressure, piracy, smuggling, and ordinary fantasy commerce without creating an unmanageable first-pass dropdown.

### Food and Staples

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `fish_fresh` | Fresh Fish | `food` | sustenance, trade_resale |
| `fish_salted` | Salted Fish | `food` | sustenance, trade_resale |
| `shellfish` | Shellfish | `food` | sustenance, trade_resale |
| `walrus_meat` | Walrus Meat | `food` | sustenance, light |
| `cured_meat` | Cured Meat | `food` | sustenance, transport |
| `grain` | Grain | `food` | sustenance, craft_input |
| `flour` | Flour | `food` | sustenance, craft_input |
| `bread_rations` | Bread Rations | `food` | sustenance, transport |
| `fruit_citrus` | Citrus Fruit | `food` | sustenance, medicine, luxury |
| `livestock` | Livestock | `livestock` | sustenance, breeding, labor |
| `cheese` | Cheese | `food` | sustenance, trade_resale |
| `wine` | Wine | `luxury` | sustenance, status, trade_resale |

### Fuel and Light

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `lamp_oil` | Lamp Oil | `fuel` | light, trade_resale |
| `charcoal` | Charcoal | `fuel` | heat, craft_input |
| `firewood` | Firewood | `fuel` | heat |
| `peat` | Peat | `fuel` | heat |
| `candles` | Candles | `finished_good` | light, ritual |

### Raw Materials and Building Inputs

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `salt` | Salt | `craft_material` | preservation, trade_resale |
| `lumber` | Lumber | `craft_material` | building, repair |
| `hardwood` | Hardwood | `craft_material` | craft_input, building |
| `stone_block` | Stone Block | `craft_material` | building, fortification |
| `clay` | Clay | `craft_material` | pottery, building |
| `hemp_fiber` | Hemp Fiber | `craft_material` | rope, sailcloth |
| `wool` | Wool | `craft_material` | clothing, trade_resale |
| `hides` | Hides | `craft_material` | leatherworking, trade_resale |
| `leather` | Leather | `craft_material` | repair, clothing, tack |
| `linen_cloth` | Linen Cloth | `craft_material` | clothing, sails, household goods |
| `rope` | Rope | `craft_material` | repair, vessel_supply, building |
| `sailcloth` | Sailcloth | `craft_material` | vessel_supply, repair |
| `tar_pitch` | Tar and Pitch | `craft_material` | waterproofing, ship repair |
| `iron_ore` | Iron Ore | `craft_material` | smelting, trade_resale |
| `silver_ore` | Silver Ore | `craft_material` | craft_input, trade_resale, status |
| `metal_ingots` | Metal Ingots | `craft_material` | tools, weapons, repair |

### Finished Goods and Common Commerce

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `furniture_handcrafted` | Handcrafted Furniture | `finished_good` | household, status, trade_resale |
| `furniture_mass_produced` | Mass-Produced Furniture | `finished_good` | household, trade_resale |
| `pottery` | Pottery | `finished_good` | household, storage, trade_resale |
| `glassware` | Glassware | `finished_good` | household, status, trade_resale |
| `clothing_common` | Common Clothing | `finished_good` | household, trade_resale |
| `clothing_fine` | Fine Clothing | `luxury` | status, trade_resale |
| `iron_tools` | Iron Tools | `tool` | repair, craft_input, building |
| `books_ledgers` | Books and Ledgers | `finished_good` | administration, knowledge, status |
| `paper` | Paper | `finished_good` | administration, knowledge, trade_resale |
| `jewelry` | Jewelry | `luxury` | status, wealth, trade_resale |
| `dyes` | Dyes | `luxury` | status, craft_input |
| `spices` | Spices | `luxury` | sustenance, status, trade_resale |
| `incense` | Incense | `luxury` | ritual, status |
| `medicinal_herbs` | Medicinal Herbs | `craft_material` | medicine, ritual |

### Services and Operational Commerce

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `shipwright_services` | Shipwright Services | `service` | repair, transport |
| `healing_services` | Healing Services | `service` | medicine |
| `mercenary_contracts` | Mercenary Contracts | `service` | military, security |
| `caravan_guarding` | Caravan Guarding | `service` | transport, security |
| `warehousing` | Warehousing | `service` | storage, trade_resale |
| `passage_transport` | Passage Transport | `service` | transport |
| `labor_contracts` | Labor Contracts | `service` | building, loading, harvest |
| `navigation_charts` | Navigation Charts | `finished_good` | navigation, knowledge, transport |

### Military, Risk, and Illicit Commerce

| Key | Label | Category | Typical Uses |
| --- | --- | --- | --- |
| `weapons_common` | Common Weapons | `military_supply` | military, deterrence |
| `armor_common` | Common Armor | `military_supply` | military, deterrence |
| `arrows_bolts` | Arrows and Bolts | `military_supply` | military, hunting |
| `siege_supplies` | Siege Supplies | `military_supply` | military, fortification |
| `ship_repair_supplies` | Ship Repair Supplies | `vessel_supply` | repair, transport |
| `stolen_goods` | Stolen Goods | `contraband` | illicit resale |
| `smuggled_luxuries` | Smuggled Luxuries | `contraband` | illicit resale, status |
| `forbidden_tomes` | Forbidden Tomes | `contraband` | ritual, knowledge, status |

## Culture Library

This is the approved starter culture library for the current branch.

It favors broad, DM-readable cultural identities over hyper-granular ethnicity modeling.

### Human Cultures

| Key | Label | Meaning |
| --- | --- | --- |
| `amnian` | Amnian | Trade-minded culture tied to Amn and its mercantile habits |
| `calishite` | Calishite | Southern coastal and desert-influenced culture tied to Calimshan |
| `chondathan` | Chondathan | Broadly traveled Heartlands trade and town culture |
| `tethyrian` | Tethyrian | Mixed western Heartlands and borderland culture tied to Tethyr |
| `illuskan` | Illuskan | Northern seafaring and raiding-rooted culture |
| `turami` | Turami | Southern Heartlands culture with wider mercantile links |
| `mulan` | Mulan | Eastern-derived high-culture and administrative tradition |
| `shaaran` | Shaaran | Southern grassland and caravan-rooted culture |

### Non-Human and Broad Peoples

| Key | Label | Meaning |
| --- | --- | --- |
| `dwarven` | Dwarven | Broad dwarven craft, hold, and clan culture |
| `elven_sun` | Sun Elf | Refined high-elven culture |
| `elven_moon` | Moon Elf | Widely traveled and adaptive elven culture |
| `halfling_lightfoot` | Lightfoot Halfling | Mobile halfling trade and travel culture |
| `halfling_strongheart` | Strongheart Halfling | Settled halfling community culture |
| `gnome_rock` | Rock Gnome | Inventive and workshop-oriented gnomish culture |
| `drow` | Drow | Underdark drow culture |
| `duergar` | Duergar | Underdark gray dwarf culture |
| `orcish` | Orcish | Broad orcish raiding and clan-rooted culture |
| `goblinoid` | Goblinoid | Broad goblinoid military and tribal culture |

## Faith and Deity Library

This is the approved starter faith library for the current branch.

Each entry is presented the way a GM is likely to recognize and choose it in a dropdown.

| Key | Label | Meaning |
| --- | --- | --- |
| `akadi` | Akadi | Faith of air, wind, and the free sky |
| `chauntea` | Chauntea | Faith of agriculture, growth, and sustenance |
| `eldath` | Eldath | Faith of peace, springs, and quiet refuge |
| `gond` | Gond | Faith of craft, invention, and making |
| `helm` | Helm | Faith of guardianship, vigilance, and duty |
| `ilmater` | Ilmater | Faith of endurance, suffering, and mercy |
| `lathander` | Lathander | Faith of dawn, renewal, and hopeful beginnings |
| `mask` | Mask | Faith of shadows, intrigue, and thieves |
| `mystra` | Mystra | Faith of magic, knowledge, and arcane order |
| `selune` | Selune | Faith of moonlight, navigation, and travelers by night |
| `shar` | Shar | Faith of loss, secrecy, and darkness |
| `siamorphe` | Siamorphe | Faith of noblesse, legitimacy, and ruling order |
| `talos` | Talos | Faith of storms, destruction, and violent weather |
| `tempus` | Tempus | Faith of battle, valor, and martial honor |
| `tymora` | Tymora | Faith of luck, risk, and favorable fortune |
| `tyr` | Tyr | Faith of justice, law, and rightful judgment |
| `torm` | Torm | Faith of duty, loyalty, and righteous service |
| `umberlee` | Umberlee | Faith of the sea's danger, fear, and appeasement |
| `waukeen` | Waukeen | Faith of wealth, trade, and mercantile success |

## Powers and Factions Library

This library intentionally mixes generic local power blocks with named regional and transregional factions.

That reflects how a GM often thinks about allies and enemies at the table:

- some are local institutions
- some are broad organizations
- some are covert networks

### Local Civic and Trade Powers

| Key | Label | Meaning |
| --- | --- | --- |
| `town_council` | Town Council | Civil ruling body for a town or port |
| `local_nobility` | Local Nobility | Noble houses, estate holders, and hereditary elites |
| `merchants_guild` | Merchants' Guild | Organized merchants and trade brokers |
| `fishers_guild` | Fishers' Guild | Organized fishers and catch processors |
| `shipwrights_guild` | Shipwrights' Guild | Organized shipbuilders and repair specialists |
| `harbormaster_office` | Harbormaster Office | Dock authority, berthing control, and harbor oversight |
| `customs_office` | Customs Office | Tariff, inspection, and port entry authority |
| `town_guard` | Town Guard | Standing local guard force |
| `local_militia` | Local Militia | Civilian levy or reserve defenders |
| `temple_council` | Temple Council | Organized local religious leadership |

### Covert, Violent, and Maritime Networks

| Key | Label | Meaning |
| --- | --- | --- |
| `smugglers_ring` | Smugglers' Ring | Illicit local or regional smuggling network |
| `pirate_captains` | Pirate Captains | Loose pirate leadership or raider coalition |
| `privateer_interest` | Privateer Interest | Licensed or semi-licensed raiders with political backing |
| `mercenary_company` | Mercenary Company | Hired soldiers or guards acting for pay |
| `slavers` | Slavers | Organized traffickers in people and captive labor |

### Named Realms-Wide or Regional Factions

| Key | Label | Meaning |
| --- | --- | --- |
| `harpers` | Harpers | Covert good-aligned network of watchers and meddlers |
| `zhentarim` | Zhentarim | Trade, coercion, and influence network with sharp edges |
| `emerald_enclave` | Emerald Enclave | Druidic and ranger-aligned environmental faction |
| `lords_alliance` | Lords' Alliance | Alliance of cities and rulers defending shared interests |
| `order_of_the_gauntlet` | Order of the Gauntlet | Zealous martial order focused on active righteousness |
| `knights_of_the_shield` | Knights of the Shield | Secretive mercantile and political influence network |
| `shadow_thieves` | Shadow Thieves | Powerful criminal network with organized underworld reach |

## Offense Type Library

Offense types describe how a location or actor projects force beyond simple raw strength.

These are multi-select modifiers layered onto the chosen offense tier.

| Key | Label | Meaning |
| --- | --- | --- |
| `militia` | Militia | Civilian levy capable of fielding numbers with mixed quality |
| `trained_guard` | Trained Guard | Paid guard force with discipline and patrol competence |
| `marines` | Marines | Shipboard or dock-trained combatants suited to boarding and harbor fighting |
| `armed_ships` | Armed Ships | Vessels equipped to project force on water routes |
| `privateers` | Privateers | Aggressive raiders operating with political or legal cover |
| `raiders` | Raiders | Fast strike force built around intimidation and opportunistic violence |
| `mercenaries` | Mercenaries | Hired professionals available for offensive operations |
| `cavalry` | Cavalry | Mounted force suitable for inland pursuit and shock action |
| `scouts` | Scouts | Reconnaissance and skirmishing force with strong mobility |
| `skirmishers` | Skirmishers | Light troops for harassment, ambush, and pressure |
| `spellcasters` | Spellcasters | Magical force projection, battlefield disruption, or elite support |
| `siege_assets` | Siege Assets | Heavy gear used for breaching, bombardment, or coercive display |
| `saboteurs` | Saboteurs | Stealth-focused operatives for arson, disruption, and covert damage |
| `monster_allies` | Monster Allies | Allied creatures or controlled beasts adding unusual threat |

## Defense Type Library

Defense types describe how a location withstands attack, disruption, or infiltration.

These are multi-select modifiers layered onto the chosen defense tier.

| Key | Label | Meaning |
| --- | --- | --- |
| `walls` | Walls | Stone or major built barriers |
| `palisades` | Palisades | Timber defensive barriers and rough perimeter works |
| `watchtowers` | Watchtowers | Elevated visual warning and missile positions |
| `gatehouses` | Gatehouses | Controlled access points with hardened entry |
| `fortified_docks` | Fortified Docks | Defensible piers, quays, and dockside hardpoints |
| `harbor_chain` | Harbor Chain | Physical harbor denial feature against hostile ships |
| `patrols` | Patrols | Regular land patrol coverage and response presence |
| `harbor_patrols` | Harbor Patrols | Waterborne security presence in near-port waters |
| `trained_guard` | Trained Guard | Disciplined stationed defenders |
| `marines` | Marines | Defenders trained for shipboard, dock, and boarding actions |
| `militia_drill` | Militia Drill | Organized reserve response better than an untrained levy |
| `scouts` | Scouts | Outriders, pickets, and early-warning lookouts |
| `spell_wards` | Spell Wards | Magical defensive measures and deterrent enchantments |
| `alarm_network` | Alarm Network | Bells, beacons, runners, and quick-warning systems |
| `safehouses` | Safehouses | Hidden fallback positions and covert support sites |
| `hidden_channels` | Hidden Channels | Secret inlets, back ways, caves, or concealed access knowledge |
| `natural_barriers` | Natural Barriers | Cliffs, shoals, marshes, reefs, or terrain that hinders attack |
| `allied_support` | Allied Support | Reliable nearby aid from allied powers or patrons |

## Immediate UX Implications

The future mapPoint creation flow should use these libraries in a narrow and repeatable pattern.

For the default path:

- `Name` remains free text
- `Region` is a validated region dropdown
- `Locale` is a validated locale dropdown
- `Profile` comes from the profile library above
- `Development`, `Wealth`, `Offense Level`, and `Defense Level` use the fixed 1-5 tier libraries
- `Trade Has`, `Trade Wants`, and `Trade Needs` draw from the trade goods library
- `Predominant Culture(s)` draw from the culture library
- `Predominant Faith(s)` draw from the faith library
- `Predominant Faction(s)`, `Allies`, and `Enemies` draw from the powers and factions library
- `Offense Type(s)` and `Defense Type(s)` draw from the corresponding type libraries

## Future Expansion Rules

When this library grows, it must grow carefully.

### A New Entry May Be Added Only If

- it cannot be expressed cleanly by an existing entry
- it represents a recurring concept, not a one-off note
- a GM is likely to understand and choose it without extra training
- it improves authoring clarity more than it increases dropdown weight

### A New Entry Should Not Be Added If

- it is only campaign flavor text
- it duplicates an existing meaning with a prettier synonym
- it belongs in a generated summary instead of a canonical field
- it would be better handled as an advanced modifier or tag

## Closing Statement

This library is the controlled-vocabulary backbone for the trade-agent branch.

If the future UI is meant to feel light, the discipline has to start here.

The GM should be able to build a complicated network by making simple, repeated choices from official lists that remain legible, stable, and reusable.
