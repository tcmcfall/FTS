// name:        fts_mapPointWizard.js
// version:     0.2.0-alpha.1
// description: Guided static location authoring wizard for selected tokens. Uses section-based chat prompts, writes standardized GM notes, player tooltip text, and locks the token in place.
// depends:     Roll20 Mod API. (Optional) fts_core >= 0.2.0-alpha.1 for palette-aware UI, menu card, and help integration. (Optional) fts_mapMeta >= 0.2.0-alpha.1 for page-name-aware region/locale defaults.
// provides:    !fts --mapPointWizard
//              !fts --mapPointWizard start
//              !fts --mapPointWizard panel
//              !fts --mapPointWizard back
//              !fts --mapPointWizard next
//              !fts --mapPointWizard finish
//              !fts --mapPointWizard chooser --field <fieldKey>
//              !fts --mapPointWizard templateView [--category <categoryKey>]
//              !fts --mapPointWizard tradeView [--group <groupKey>]
// author:      tcm (AI-assisted)
// Semantic Versioning (SemVer) Policy:
// - FTS uses SemVer in the form MAJOR.MINOR.PATCH[-PRERELEASE].
// - Pre-release versions stay in 0.y.z. Anything may change and the API is not yet considered stable.
// - Increment PATCH for non-breaking bug fixes.
// - Increment MINOR for new non-breaking functionality.
// - Increment MAJOR only when the public API becomes stable and/or incompatible breaking changes are introduced.
// - Pre-release labels such as alpha, beta, or rc mark unstable builds and sort lower than the matching normal release.
// - Once a version is released, its contents must not be changed; further edits require a new version.
// - Header comments, internal VERSION constants, filenames, generated module text, and documentation references must stay aligned.
// - Dependency notes should use SemVer-friendly wording such as ">= 0.1.0-alpha.1" rather than informal forms like "5.1.0+".
// This module is primarily chat-driven. Template and trade-category calendars
// are edited in ephemeral handouts while other interactions stay in whisper panels.
// API command links apply mutually exclusive per-period selections.
//
(function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  var MODULE_KEY = 'mappointwizard';
  var VERSION    = '0.2.0-alpha.1';
  var COMMAND    = 'mapPointWizard';
  var FTS_MULE   = 'fts_mule';
  var TITLE      = 'Map Point Wizard';
  var STATE_ROOT = 'mapPointWizard';
  var TEMPLATE_PANEL_TITLE = 'Map Point Templates';
  var POI_PANEL_TITLE = 'Map Point Points of Interest';
  var TRADE_PANEL_TITLE = 'Trade Goods Categories';
  var REVIEW_PANEL_TITLE = 'Map Point Final Review';
  var MULTI_HANDOUT_FIELDS = {
    cultures:1,
    faiths:1,
    factions:1,
    allies:1,
    enemies:1
  };
  var LIBRARY_ABILITY = 'mapPointWizard';
  var TRADE_STANCE_ORDER = ['has', 'wants', 'needs'];
  var TOOLTIP_MAX_CHARS = 420;
  var TOOLTIP_LINE_BREAK = '\u2028';
  var WIZARD_ACTIONS = {
    panel:1, start:1, cancel:1, reset:1, resume:1, finish:1, back:1, next:1, section:1,
    chooser:1, templateview:1, templateapply:1, poiview:1, tradeview:1, pick:1, set:1, sanityresolve:1,
    poiset:1, poiremove:1, poiclear:1, poicustom:1, poirename:1,
    multiadd:1, multicustom:1, multiedit:1, multiremove:1, multiclear:1,
    tradeclear:1, tradewindow:1, tradecell:1, tradegroupadd:1
  };
  var WIZARD_FLAG_ALIASES = {
    token:'token', confirm:'confirm', force:'force', field:'field', value:'value',
    label:'label', score:'score', category:'category', group:'group', good:'good', window:'window', key:'key', move:'move',
    choice:'choice', count:'count', show:'show',
    stance:'stance', action:'action', period:'period', note:'note',
    cargounits:'cu'
  };
  var SECTION_SEQUENCE = [
    { key:'bind',          view:'bind',                  label:'Bind Token',       requiresSession:false },
    { key:'region',        view:'chooser:region',        label:'Region',           requiresSession:true  },
    { key:'locale',        view:'chooser:locale',        label:'Locale',           requiresSession:true  },
    { key:'template',      view:'chooser:template',      label:'Template',         requiresSession:true  },
    { key:'name',          view:'step:name',             label:'Name',             requiresSession:true  },
    { key:'population',    view:'step:population',       label:'Population',       requiresSession:true  },
    { key:'development',   view:'chooser:development',   label:'Development',      requiresSession:true  },
    { key:'wealth',        view:'chooser:wealth',        label:'Wealth',           requiresSession:true  },
    { key:'poi',           view:'poi',                   label:'Points of Interest',requiresSession:true  },
    { key:'cultures',      view:'chooser:cultures',      label:'Cultures',         requiresSession:true  },
    { key:'faiths',        view:'chooser:faiths',        label:'Faiths',           requiresSession:true  },
    { key:'factions',      view:'chooser:factions',      label:'Factions',         requiresSession:true  },
    { key:'allies',        view:'chooser:allies',        label:'Allies',           requiresSession:true  },
    { key:'enemies',       view:'chooser:enemies',       label:'Enemies',          requiresSession:true  },
    { key:'trade',         view:'trade',                 label:'Trade Goods',      requiresSession:true  },
    { key:'review',        view:'review',                label:'Review',           requiresSession:true  }
  ];

  /* ======================================================================== */
  /* Canonical Libraries                                                      */
  /* ======================================================================== */

  var CALENDAR_PERIODS = [
    { key:'hammer',           label:'Hammer',             season:'winter' },
    { key:'midwinter',        label:'Midwinter',          season:'winter' },
    { key:'alturiak',         label:'Alturiak',           season:'winter' },
    { key:'ches',             label:'Ches',               season:'spring' },
    { key:'tarsakh',          label:'Tarsakh',            season:'spring' },
    { key:'greengrass',       label:'Greengrass',         season:'spring' },
    { key:'mirtul',           label:'Mirtul',             season:'spring' },
    { key:'kythorn',          label:'Kythorn',            season:'summer' },
    { key:'flamerule',        label:'Flamerule',          season:'summer' },
    { key:'midsummer',        label:'Midsummer',          season:'summer' },
    { key:'shieldmeet',       label:'Shieldmeet',         season:'summer' },
    { key:'eleasis',          label:'Eleasis',            season:'summer' },
    { key:'eleint',           label:'Eleint',             season:'autumn' },
    { key:'highharvestide',   label:'Highharvestide',     season:'autumn' },
    { key:'marpenoth',        label:'Marpenoth',          season:'autumn' },
    { key:'uktar',            label:'Uktar',              season:'autumn' },
    { key:'feastofthemoon',   label:'Feast of the Moon',  season:'autumn' },
    { key:'nightal',          label:'Nightal',            season:'winter' }
  ];

  var CALENDAR_PERIOD_INDEX = {};
  for(var cpi=0;cpi<CALENDAR_PERIODS.length;cpi++){
    CALENDAR_PERIOD_INDEX[CALENDAR_PERIODS[cpi].key] = cpi;
  }

  var WINDOW_PRESETS = [
    { key:'winter', label:'Winter Season', periods:['hammer', 'midwinter', 'alturiak', 'nightal'] },
    { key:'spring', label:'Spring Season', periods:['ches', 'tarsakh', 'greengrass', 'mirtul'] },
    { key:'summer', label:'Summer Season', periods:['kythorn', 'flamerule', 'midsummer', 'shieldmeet', 'eleasis'] },
    { key:'autumn', label:'Autumn Season', periods:['eleint', 'highharvestide', 'marpenoth', 'uktar', 'feastofthemoon'] },
    { key:'annual', label:'Year-Round', periods: CALENDAR_PERIODS.map(function(p){ return p.key; }) }
  ];

  var FESTIVAL_PERIOD_KEYS = {
    midwinter:true,
    greengrass:true,
    midsummer:true,
    shieldmeet:true,
    highharvestide:true,
    feastofthemoon:true
  };

  var CALENDAR_MONTH_NUMBER = {};
  var CALENDAR_MONTH_KEY_BY_NUMBER = {};
  (function buildMonthNumbers(){
    var monthNumber = 1;
    for(var i=0;i<CALENDAR_PERIODS.length;i++){
      if(FESTIVAL_PERIOD_KEYS[CALENDAR_PERIODS[i].key]) continue;
      CALENDAR_MONTH_NUMBER[CALENDAR_PERIODS[i].key] = monthNumber;
      CALENDAR_MONTH_KEY_BY_NUMBER[monthNumber] = CALENDAR_PERIODS[i].key;
      monthNumber += 1;
    }
  })();

  var DEVELOPMENT_TIERS = [
    { value:'1', key:'underdeveloped', label:'Underdeveloped', desc:'Sparse infrastructure and unreliable services.' },
    { value:'2', key:'developing',     label:'Developing',     desc:'Limited but functional infrastructure.' },
    { value:'3', key:'established',    label:'Established',    desc:'Stable baseline infrastructure and trade habits.' },
    { value:'4', key:'developed',      label:'Developed',      desc:'Robust infrastructure and stronger logistics.' },
    { value:'5', key:'advanced',       label:'Advanced',       desc:'Exceptional infrastructure and refined institutions.' }
  ];

  var WEALTH_TIERS = [
    { value:'1', key:'poor',        label:'Poor',        desc:'Little surplus and visible scarcity.' },
    { value:'2', key:'modest',      label:'Modest',      desc:'Limited surplus with room to maintain basics.' },
    { value:'3', key:'comfortable', label:'Comfortable', desc:'Stable trade posture and ordinary resilience.' },
    { value:'4', key:'wealthy',     label:'Wealthy',     desc:'Strong reserves and visible prosperity.' },
    { value:'5', key:'opulent',     label:'Opulent',     desc:'Extraordinary surplus and elite spending power.' }
  ];

  var STRENGTH_TIERS = [
    { value:'1', key:'weak',       label:'Weak',       desc:'Limited capacity for force projection or resistance.' },
    { value:'2', key:'capable',    label:'Capable',    desc:'Functional force suited to common threats.' },
    { value:'3', key:'strong',     label:'Strong',     desc:'Reliable deterrence or strike ability.' },
    { value:'4', key:'formidable', label:'Formidable', desc:'Serious regional force presence.' },
    { value:'5', key:'mighty',     label:'Mighty',     desc:'Dominant military posture for the local scale.' }
  ];

  var STRENGTH_SCORE_TIERS = [
    { max:4,  value:'1' },
    { max:10, value:'2' },
    { max:21, value:'3' },
    { max:31, value:'4' },
    { max:999, value:'5' }
  ];

  var POINT_TYPES = [
    { key:'settlement', label:'Settlement' },
    { key:'port',       label:'Port' },
    { key:'fort',       label:'Fort' },
    { key:'lair',       label:'Lair' },
    { key:'ruin',       label:'Ruin' },
    { key:'tradepost',  label:'Tradepost' },
    { key:'temple',     label:'Temple' },
    { key:'outpost',    label:'Outpost' }
  ];

  var POINT_TYPE_MAP = {};
  (function buildPointTypeMap(){
    for(var i=0;i<POINT_TYPES.length;i++){
      POINT_TYPE_MAP[POINT_TYPES[i].key] = POINT_TYPES[i];
    }
  }());

  var TEMPLATE_CATEGORIES = [
    {
      key:'cities_towns_villages',
      label:'Cities, Towns and Villages',
      desc:'General-purpose settlements ranging from small rural communities to major urban centers.'
    },
    {
      key:'temples_towers_guildhalls',
      label:'Temples, Towers and Guildhalls',
      desc:'Dedicated-purpose civic, scholarly, spiritual, and institutional sites.'
    },
    {
      key:'forts_keeps_defenses',
      label:'Forts, Keeps and Defensive Sites',
      desc:'Strategic and military locations built for control, warning, and defense.'
    },
    {
      key:'trade_travel_infrastructure',
      label:'Trade and Travel Infrastructure',
      desc:'Crossing points, logistics hubs, and transport-driven market locations.'
    },
    {
      key:'lairs_ruins_dungeons',
      label:'Lairs, Ruins and Dungeons',
      desc:'Hazardous, abandoned, or hidden sites used for exploration and conflict.'
    },
    {
      key:'natural_points_of_interest',
      label:'Natural Points of Interest',
      desc:'Landform and wilderness landmarks with strategic, cultural, or narrative value.'
    },
    {
      key:'underdark_locations',
      label:'Underdark Locations',
      desc:'Subsurface route, settlement, and strongpoint locations in deep environments.'
    },
    {
      key:'underwater_locations',
      label:'Underwater Locations',
      desc:'Submerged and littoral locations ranging from reefs to drowned districts.'
    }
  ];

  var TEMPLATE_CATEGORY_MAP = {};
  (function buildTemplateCategoryMap(){
    for(var i=0;i<TEMPLATE_CATEGORIES.length;i++){
      TEMPLATE_CATEGORY_MAP[TEMPLATE_CATEGORIES[i].key] = TEMPLATE_CATEGORIES[i];
    }
  }());

  // Trade goods operate at the category level only.
  var TRADE_GOOD_GROUPS = [
    { key:'alchemy_and_medicine', label:'Alchemy and Medicine' },
    { key:'armor_and_protection', label:'Armor and Protection' },
    { key:'contraband', label:'Contraband' },
    { key:'foodstuffs', label:'Foodstuffs' },
    { key:'fuel_and_light', label:'Fuel and Light' },
    { key:'household_and_civic_goods', label:'Household and Civic Goods' },
    { key:'livestock_and_mounts', label:'Livestock and Mounts' },
    { key:'luxury_goods_and_art', label:'Luxury Goods and Art' },
    { key:'metals_and_minerals', label:'Metals and Minerals' },
    { key:'military_supplies', label:'Military Supplies' },
    { key:'raw_materials', label:'Raw Materials' },
    { key:'services', label:'Services' },
    { key:'textiles_and_leather', label:'Textiles and Leather' },
    { key:'tools_and_craft_goods', label:'Tools and Craft Goods' },
    { key:'vehicles_and_transport', label:'Vehicles and Transport' },
    { key:'vessel_supplies', label:'Vessel Supplies' },
    { key:'weapons_and_ammunition', label:'Weapons and Ammunition' }
  ];

  // Group descriptions drive the GM-facing trade-goods panel. Keep them
  // short, plain-language, and easy for a GM to extend alongside the library.
  var TRADE_GOOD_GROUP_DETAILS = {
    alchemy_and_medicine:'Potent substances, remedies, and ritual consumables drawn from the PHB tool and gear tables.',
    armor_and_protection:'Protective stock, shields, and war-ready outfitting for guards, militias, and caravan escorts.',
    contraband:'Illicit or controlled goods whose presence implies secrecy, corruption, or black-market demand.',
    foodstuffs:'Staple food cargo, preserved catch, spices, and seasonings that feed households, fleets, and caravans.',
    fuel_and_light:'Bulk commodities that keep homes, ships, workshops, and watchposts lit or heated.',
    household_and_civic_goods:'Domestic, civic, and recordkeeping goods that support ordinary settled life.',
    livestock_and_mounts:'Living animals moved for labor, breeding, transport, food supply, or caravan support.',
    luxury_goods_and_art:'Prestige cargo, imported finery, art objects, and high-margin wares that signal status.',
    metals_and_minerals:'Trade metals, ores, ingots, and gem cargo used by smiths, mints, masons, and jewelers.',
    military_supplies:'War-footing cargo reserved for fortifications, siege trains, powder, and heavier operational demand.',
    raw_materials:'Unrefined practical materials commonly pulled into construction, tanning, medicine, or daily craft.',
    services:'Contracted labor and specialist throughput represented as market-facing civic capacity.',
    textiles_and_leather:'Fibers, cloth, and finished garments that support households, sails, and everyday outfitting.',
    tools_and_craft_goods:'Working implements and crafted utility goods that expand local productivity and repair capacity.',
    vehicles_and_transport:'High-value conveyances, carts, harness, and ship hulls sold or provisioned through major hubs.',
    vessel_supplies:'Maritime rigging, rope, and repair stock needed to keep traffic moving safely.',
    weapons_and_ammunition:'Armed trade stock intended for militias, guards, raiders, or caravan defense.'
  };

  var TRADE_GOOD_GROUP_MAP = {};
  (function buildTradeGoodMaps(){
    for(var gi=0;gi<TRADE_GOOD_GROUPS.length;gi++){
      var group = TRADE_GOOD_GROUPS[gi];
      TRADE_GOOD_GROUP_MAP[group.key] = { key:group.key, label:group.label };
    }
  })();

  function upsertTradeGoodGroupRecord(groupKey, label, desc){
    groupKey = normalizeKey(groupKey || '');
    label = String(label || '').trim();
    desc = String(desc || '').trim();
    if(!groupKey || !label) return null;
    if(TRADE_GOOD_GROUP_MAP[groupKey]){
      TRADE_GOOD_GROUP_MAP[groupKey].label = label;
      for(var i=0;i<TRADE_GOOD_GROUPS.length;i++){
        if(String(TRADE_GOOD_GROUPS[i].key || '') === groupKey){
          TRADE_GOOD_GROUPS[i].label = label;
          break;
        }
      }
    }else{
      TRADE_GOOD_GROUP_MAP[groupKey] = { key:groupKey, label:label };
      TRADE_GOOD_GROUPS.push({ key:groupKey, label:label });
    }
    if(desc) TRADE_GOOD_GROUP_DETAILS[groupKey] = desc;
    return { key:groupKey, label:label, desc:desc };
  }

  function normalizeCustomTradeGroupRecord(raw){
    raw = raw || {};
    var key = normalizeKey(raw.key || '');
    var label = String(raw.label || raw.name || '').trim();
    var desc = String(raw.desc || raw.description || '').trim();
    if(!key && label) key = 'custom_' + normalizeKey(label);
    if(!key) return null;
    if(!label) label = titleCaseToken(String(key || '').replace(/^custom_/, ''));
    if(String(key).indexOf('custom_') !== 0) key = 'custom_' + key;
    return { key:key, label:label, desc:desc };
  }

  function syncCustomTradeGroupsFromStateRoot(root){
    var source = Array.isArray(root && root.customTradeGroups) ? root.customTradeGroups : [];
    var seen = {};
    var out = [];
    for(var i=0;i<source.length;i++){
      var normalized = normalizeCustomTradeGroupRecord(source[i]);
      if(!normalized) continue;
      if(seen[normalized.key]) continue;
      seen[normalized.key] = true;
      upsertTradeGoodGroupRecord(normalized.key, normalized.label, normalized.desc);
      out.push(normalized);
    }
    if(root) root.customTradeGroups = out;
  }

  var CULTURES = [
    { key:'amnian',               label:'Amnian' },
    { key:'bedine',               label:'Bedine' },
    { key:'calishite',            label:'Calishite' },
    { key:'chondathan',           label:'Chondathan' },
    { key:'dambrathan',           label:'Dambrathan' },
    { key:'drow',                 label:'Drow' },
    { key:'duergar',              label:'Duergar' },
    { key:'dwarven',              label:'Dwarven' },
    { key:'elven_moon',           label:'Moon Elf' },
    { key:'elven_sun',            label:'Sun Elf' },
    { key:'ffolk',                label:'Ffolk' },
    { key:'gnome_rock',           label:'Rock Gnome' },
    { key:'goblinoid',            label:'Goblinoid' },
    { key:'halfling_lightfoot',   label:'Lightfoot Halfling' },
    { key:'halfling_strongheart', label:'Strongheart Halfling' },
    { key:'halruaan',             label:'Halruaan' },
    { key:'illuskan',             label:'Illuskan' },
    { key:'mulan',                label:'Mulan' },
    { key:'orcish',               label:'Orcish' },
    { key:'reghed',               label:'Reghed' },
    { key:'shaaran',              label:'Shaaran' },
    { key:'shou',                 label:'Shou' },
    { key:'tethyrian',            label:'Tethyrian' },
    { key:'turami',               label:'Turami' },
    { key:'uthgardt',             label:'Uthgardt' }
  ];

  var FAITHS = [
    { key:'amaunator',  label:'Amaunator' },
    { key:'azuth',      label:'Azuth' },
    { key:'beshaba',    label:'Beshaba' },
    { key:'akadi',     label:'Akadi' },
    { key:'chauntea',  label:'Chauntea' },
    { key:'deneir',    label:'Deneir' },
    { key:'eldath',    label:'Eldath' },
    { key:'gond',      label:'Gond' },
    { key:'grumbar',   label:'Grumbar' },
    { key:'helm',      label:'Helm' },
    { key:'ilmater',   label:'Ilmater' },
    { key:'lathander', label:'Lathander' },
    { key:'malar',     label:'Malar' },
    { key:'mask',      label:'Mask' },
    { key:'mielikki',  label:'Mielikki' },
    { key:'mystra',    label:'Mystra' },
    { key:'selune',    label:'Selune' },
    { key:'shar',      label:'Shar' },
    { key:'siamorphe', label:'Siamorphe' },
    { key:'silvanus',  label:'Silvanus' },
    { key:'sune',      label:'Sune' },
    { key:'talos',     label:'Talos' },
    { key:'tempus',    label:'Tempus' },
    { key:'torm',      label:'Torm' },
    { key:'tymora',    label:'Tymora' },
    { key:'tyr',       label:'Tyr' },
    { key:'umberlee',  label:'Umberlee' },
    { key:'waukeen',   label:'Waukeen' }
  ];

  var FACTIONS = [
    { key:'town_council',          label:'Town Council' },
    { key:'local_nobility',        label:'Local Nobility' },
    { key:'merchants_guild',       label:'Merchants\' Guild' },
    { key:'fishers_guild',         label:'Fishers\' Guild' },
    { key:'shipwrights_guild',     label:'Shipwrights\' Guild' },
    { key:'harbormaster_office',   label:'Harbormaster Office' },
    { key:'customs_office',        label:'Customs Office' },
    { key:'town_guard',            label:'Town Guard' },
    { key:'local_militia',         label:'Local Militia' },
    { key:'temple_council',        label:'Temple Council' },
    { key:'smugglers_ring',        label:'Smugglers\' Ring' },
    { key:'pirate_captains',       label:'Pirate Captains' },
    { key:'privateer_interest',    label:'Privateer Interest' },
    { key:'mercenary_company',     label:'Mercenary Company' },
    { key:'slavers',               label:'Slavers' },
    { key:'harpers',               label:'Harpers' },
    { key:'zhentarim',             label:'Zhentarim' },
    { key:'emerald_enclave',       label:'Emerald Enclave' },
    { key:'lords_alliance',        label:'Lords\' Alliance' },
    { key:'order_of_the_gauntlet', label:'Order of the Gauntlet' },
    { key:'knights_of_the_shield', label:'Knights of the Shield' },
    { key:'shadow_thieves',        label:'Shadow Thieves' }
  ];

  var OFFENSE_TYPES = [
    { key:'armed_ships',    label:'Armed Ships',    score:8 },
    { key:'cavalry',        label:'Cavalry',        score:5 },
    { key:'marines',        label:'Marines',        score:5 },
    { key:'mercenaries',    label:'Mercenaries',    score:5 },
    { key:'militia',        label:'Militia',        score:3 },
    { key:'monster_allies', label:'Monster Allies', score:7 },
    { key:'privateers',     label:'Privateers',     score:6 },
    { key:'raiders',        label:'Raiders',        score:5 },
    { key:'saboteurs',      label:'Saboteurs',      score:4 },
    { key:'scouts',         label:'Scouts',         score:2 },
    { key:'siege_assets',   label:'Siege Assets',   score:8 },
    { key:'skirmishers',    label:'Skirmishers',    score:3 },
    { key:'spellcasters',   label:'Spellcasters',   score:7 },
    { key:'trained_guard',  label:'Trained Guard',  score:4 }
  ];

  var DEFENSE_TYPES = [
    { key:'alarm_network',    label:'Alarm Network',    score:3 },
    { key:'allied_support',   label:'Allied Support',   score:6 },
    { key:'fortified_docks',  label:'Fortified Docks',  score:8 },
    { key:'gatehouses',       label:'Gatehouses',       score:6 },
    { key:'harbor_chain',     label:'Harbor Chain',     score:7 },
    { key:'harbor_patrols',   label:'Harbor Patrols',   score:4 },
    { key:'hidden_channels',  label:'Hidden Channels',  score:3 },
    { key:'marines',          label:'Marines',          score:5 },
    { key:'militia_drill',    label:'Militia Drill',    score:2 },
    { key:'natural_barriers', label:'Natural Barriers', score:4 },
    { key:'palisades',        label:'Palisades',        score:7 },
    { key:'patrols',          label:'Patrols',          score:3 },
    { key:'safehouses',       label:'Safehouses',       score:2 },
    { key:'scouts',           label:'Scouts',           score:2 },
    { key:'spell_wards',      label:'Spell Wards',      score:8 },
    { key:'trained_guard',    label:'Trained Guard',    score:5 },
    { key:'walls',            label:'Walls',            score:10 },
    { key:'watchtowers',      label:'Watchtowers',      score:5 }
  ];

  var MULTI_LIBRARY = {
    cultures:      { label:'Culture',            options:CULTURES },
    faiths:        { label:'Faith & Deities',    options:FAITHS },
    factions:      { label:'Prominent Factions', options:FACTIONS },
    allies:        { label:'Prominent Allies',   options:FACTIONS },
    enemies:       { label:'Prominent Enemies',  options:FACTIONS },
    offense_types: { label:'Offense Types',      options:OFFENSE_TYPES },
    defense_types: { label:'Defense Types',      options:DEFENSE_TYPES }
  };

  var POI_CATEGORY_DEFS = [
    { key:'food_production_distribution', label:'Food Production and Distribution' },
    { key:'crafting_manufacturing',       label:'Crafting and Manufacturing' },
    { key:'trade_commerce',               label:'Trade and Commerce' },
    { key:'hospitality_vice',             label:'Hospitality and Vice' },
    { key:'civic_government',             label:'Civic and Government' },
    { key:'military_establishments',      label:'Military Establishments' },
    { key:'religious_cultural',           label:'Religious and Cultural' },
    { key:'magical_infrastructure',       label:'Magical Infrastructure' },
    { key:'transport_animal_services',    label:'Transport and Animal Services' },
    { key:'power_hidden_structures',      label:'Power and Hidden Structures' },
    { key:'offense_types',    label:'Offense Capabilities' },
    { key:'defense_types',    label:'Defense Capabilities' }
  ];

  var POI_CATEGORY_MAP = {};
  (function buildPoiCategoryMap(){
    for(var i=0;i<POI_CATEGORY_DEFS.length;i++){
      POI_CATEGORY_MAP[POI_CATEGORY_DEFS[i].key] = POI_CATEGORY_DEFS[i];
    }
  }());

  var POI_LIBRARY = {
    food_production_distribution: [
      { key:'apiary',             label:'Apiary' },
      { key:'bakery',             label:'Bakery' },
      { key:'brewery',            label:'Brewery' },
      { key:'butcher_shop',       label:'Butcher Shop' },
      { key:'cheese_house',       label:'Cheese House' },
      { key:'dairy',              label:'Dairy' },
      { key:'distillery',         label:'Distillery' },
      { key:'farmstead',          label:'Farmstead' },
      { key:'fishery',            label:'Fishery' },
      { key:'fish_market',        label:'Fish Market' },
      { key:'fish_oil_renderer',  label:'Fish-Oil Renderer' },
      { key:'food_market_plaza',  label:'Food Market Plaza' },
      { key:'fungal_garden',      label:'Fungal Garden' },
      { key:'grain_mill',         label:'Grain Mill' },
      { key:'granary',            label:'Granary' },
      { key:'oil_press',          label:'Oil Press' },
      { key:'orchard',            label:'Orchard' },
      { key:'ranch',              label:'Ranch' },
      { key:'salt_house',         label:'Salt House' },
      { key:'slaughterhouse',     label:'Slaughterhouse' },
      { key:'smokehouse',         label:'Smokehouse' },
      { key:'vegetable_market',   label:'Vegetable Market' },
      { key:'vineyard',           label:'Vineyard' }
    ],
    crafting_manufacturing: [
      { key:'armorer_forge',         label:'Armorer Forge' },
      { key:'blacksmith_forge',      label:'Blacksmith Forge' },
      { key:'bowyer_fletcher_shop',  label:'Bowyer and Fletcher Shop' },
      { key:'carpenter_workshop',    label:'Carpenter Workshop' },
      { key:'cartwright_yard',       label:'Cartwright Yard' },
      { key:'chandlery',             label:'Chandlery' },
      { key:'cobbler_shop',          label:'Cobbler Shop' },
      { key:'cooperage',             label:'Cooperage' },
      { key:'dye_works',             label:'Dye Works' },
      { key:'glassworks',            label:'Glassworks' },
      { key:'jeweler_shop',          label:'Jeweler Shop' },
      { key:'leatherworks',          label:'Leatherworks' },
      { key:'mason_yard',            label:'Mason Yard' },
      { key:'paper_mill',            label:'Paper Mill' },
      { key:'pottery_kiln',          label:'Pottery Kiln' },
      { key:'ropewalk',              label:'Ropewalk' },
      { key:'shipwright_yard',       label:'Shipwright Yard' },
      { key:'tailor_shop',           label:'Tailor Shop' },
      { key:'tannery',               label:'Tannery' },
      { key:'weaponsmith_forge',     label:'Weaponsmith Forge' },
      { key:'weavers_house',         label:'Weaver House' },
      { key:'wheelwright_shop',      label:'Wheelwright Shop' }
    ],
    trade_commerce: [
      { key:'auction_house',        label:'Auction House' },
      { key:'bonded_warehouse',     label:'Bonded Warehouse' },
      { key:'broker_house',         label:'Broker House' },
      { key:'caravan_yard',         label:'Caravan Yard' },
      { key:'consortium_hall',      label:'Consortium Hall' },
      { key:'counting_house',       label:'Counting House' },
      { key:'covered_bazaar',       label:'Covered Bazaar' },
      { key:'customs_house',        label:'Customs House' },
      { key:'general_store',        label:'General Store' },
      { key:'guild_bank',           label:'Guild Bank' },
      { key:'market_square',        label:'Market Square' },
      { key:'merchants_guildhall',  label:'Merchants Guildhall' },
      { key:'open_air_market',      label:'Open-Air Market' },
      { key:'pawn_broker',          label:'Pawn Broker' },
      { key:'seasonal_fairgrounds', label:'Seasonal Fairgrounds' },
      { key:'tax_office',           label:'Tax Office' },
      { key:'trade_exchange',       label:'Trade Exchange' },
      { key:'warehouse_complex',    label:'Warehouse Complex' },
      { key:'weigh_house',          label:'Weigh House' }
    ],
    hospitality_vice: [
      { key:'alehouse',            label:'Alehouse' },
      { key:'banquet_hall',        label:'Banquet Hall' },
      { key:'bathhouse',           label:'Bathhouse' },
      { key:'boarding_house',      label:'Boarding House' },
      { key:'brothel',             label:'Brothel' },
      { key:'coffee_house',        label:'Coffee House' },
      { key:'festival_square',     label:'Festival Square' },
      { key:'fight_pit',           label:'Fight Pit' },
      { key:'gambling_hall',       label:'Gambling Hall' },
      { key:'inn',                 label:'Inn' },
      { key:'lodging_house',       label:'Lodging House' },
      { key:'music_hall',          label:'Music Hall' },
      { key:'roadside_hostel',     label:'Roadside Hostel' },
      { key:'smuggler_safehouse',  label:'Smuggler Safehouse' },
      { key:'storyteller_stage',   label:'Storyteller Stage' },
      { key:'tavern',              label:'Tavern' },
      { key:'theater',             label:'Theater' },
      { key:'wine_house',          label:'Wine House' }
    ],
    civic_government: [
      { key:'aqueduct_house',      label:'Aqueduct House' },
      { key:'census_office',       label:'Census Office' },
      { key:'city_watch_hq',       label:'City Watch Headquarters' },
      { key:'civic_storehouse',    label:'Civic Storehouse' },
      { key:'council_chamber',     label:'Council Chamber' },
      { key:'courthouse',          label:'Courthouse' },
      { key:'execution_ground',    label:'Execution Ground' },
      { key:'magistrate_office',   label:'Magistrate Office' },
      { key:'prison',              label:'Prison' },
      { key:'public_well',         label:'Public Well' },
      { key:'record_archive',      label:'Record Archive' },
      { key:'road_wardens_office', label:'Road Wardens Office' },
      { key:'sewer_works',         label:'Sewer Works' },
      { key:'tax_office',          label:'Tax Office' },
      { key:'town_hall',           label:'Town Hall' },
      { key:'watch_post',          label:'Watch Post' }
    ],
    military_establishments: [
      { key:'admiralty_office',       label:'Admiralty Office',       units:14,  offense:1, defense:2 },
      { key:'armory',                 label:'Armory',                 units:15,  offense:1, defense:2 },
      { key:'beacon_hill',            label:'Beacon Hill',            units:6,   offense:1, defense:1 },
      { key:'border_fort',            label:'Border Fort',            units:40,  offense:2, defense:3 },
      { key:'cavalry_stables',        label:'Cavalry Stables',        units:16,  offense:2, defense:1 },
      { key:'citadel',                label:'Citadel',                units:120, offense:4, defense:5 },
      { key:'coastal_battery',        label:'Coastal Battery',        units:16,  offense:2, defense:3 },
      { key:'coastal_fort',           label:'Coastal Fort',           units:70,  offense:3, defense:4 },
      { key:'field_camp',             label:'Field Camp',             units:24,  offense:2, defense:1 },
      { key:'fort_keep',              label:'Fort Keep',              units:60,  offense:3, defense:4 },
      { key:'gatehouse',              label:'Gatehouse',              units:12,  offense:1, defense:2 },
      { key:'guard_barracks',         label:'Guard Barracks',         units:20,  offense:2, defense:3 },
      { key:'harbor_chain_station',   label:'Harbor Chain Station',   units:10,  offense:1, defense:2 },
      { key:'lighthouse_signal_tower',label:'Lighthouse Signal Tower',units:8,   offense:1, defense:2 },
      { key:'military_shipyard',      label:'Military Shipyard',      units:20,  offense:2, defense:2 },
      { key:'militia_drill_square',   label:'Militia Drill Square',   units:18,  offense:2, defense:1 },
      { key:'naval_barracks',         label:'Naval Barracks',         units:24,  offense:2, defense:2 },
      { key:'siege_camp',             label:'Siege Camp',             units:35,  offense:3, defense:1 },
      { key:'signal_beacon',          label:'Signal Beacon',          units:6,   offense:1, defense:1 },
      { key:'supply_depot',           label:'Supply Depot',           units:18,  offense:1, defense:2 },
      { key:'training_grounds',       label:'Training Grounds',       units:20,  offense:2, defense:1 },
      { key:'watchtower',             label:'Watchtower',             units:10,  offense:1, defense:2 }
    ],
    religious_cultural: [
      { key:'almshouse',           label:'Almshouse' },
      { key:'cathedral',           label:'Cathedral' },
      { key:'charity_kitchen',     label:'Charity Kitchen' },
      { key:'chapel',              label:'Chapel' },
      { key:'hospice',             label:'Hospice' },
      { key:'library',             label:'Library' },
      { key:'memorial_hall',       label:'Memorial Hall' },
      { key:'monastery',           label:'Monastery' },
      { key:'museum_relic_hall',   label:'Museum and Relic Hall' },
      { key:'orphanage',           label:'Orphanage' },
      { key:'pilgrimage_hostel',   label:'Pilgrimage Hostel' },
      { key:'pilgrimage_site',     label:'Pilgrimage Site' },
      { key:'schoolhouse',         label:'Schoolhouse' },
      { key:'scriptorium',         label:'Scriptorium' },
      { key:'shrine',              label:'Shrine' },
      { key:'temple',              label:'Temple' },
      { key:'university_college',  label:'University College' }
    ],
    magical_infrastructure: [
      { key:'arcane_academy',      label:'Arcane Academy' },
      { key:'arcane_guildhall',    label:'Arcane Guildhall' },
      { key:'component_shop',      label:'Component Shop' },
      { key:'diviner_parlor',      label:'Diviner Parlor' },
      { key:'enchanter_workshop',  label:'Enchanter Workshop' },
      { key:'hedge_mage_sanctum',  label:'Hedge Mage Sanctum' },
      { key:'herbalist_shop',      label:'Herbalist Shop' },
      { key:'mage_tower',          label:'Mage Tower' },
      { key:'potion_lab',          label:'Potion Laboratory' },
      { key:'ritual_complex',      label:'Ritual Complex' },
      { key:'runeforge',           label:'Runeforge' },
      { key:'scrying_chamber',     label:'Scrying Chamber' },
      { key:'scroll_scriptorium',  label:'Scroll Scriptorium' },
      { key:'teleportation_circle',label:'Teleportation Circle' },
      { key:'wardstone_network',   label:'Wardstone Network' }
    ],
    transport_animal_services: [
      { key:'bridge_tollhouse',    label:'Bridge Tollhouse' },
      { key:'carriage_house',      label:'Carriage House' },
      { key:'cargo_dock',          label:'Cargo Dock' },
      { key:'courier_post',        label:'Courier Post' },
      { key:'dockyard',            label:'Dockyard' },
      { key:'drydock',             label:'Drydock' },
      { key:'ferry_landing',       label:'Ferry Landing' },
      { key:'harbormaster_office', label:'Harbormaster Office' },
      { key:'lighthouse',          label:'Lighthouse' },
      { key:'messenger_roost',     label:'Messenger Roost' },
      { key:'pack_animal_market',  label:'Pack Animal Market' },
      { key:'pier_complex',        label:'Pier Complex' },
      { key:'stables',             label:'Stables' },
      { key:'wagon_yard',          label:'Wagon Yard' },
      { key:'waystation_post',     label:'Waystation Post' }
    ],
    power_hidden_structures: [
      { key:'black_market',         label:'Black Market' },
      { key:'embassy',              label:'Embassy' },
      { key:'guild_headquarters',   label:'Guild Headquarters' },
      { key:'manor_house',          label:'Manor House' },
      { key:'noble_estate',         label:'Noble Estate' },
      { key:'palace',               label:'Palace' },
      { key:'rebel_council_cellar', label:'Rebel Council Cellar' },
      { key:'rebel_hideout',        label:'Rebel Hideout' },
      { key:'secret_cult_site',     label:'Secret Cult Site' },
      { key:'secret_sanctum',       label:'Secret Sanctum' },
      { key:'slum_safehouse',       label:'Slum Safehouse' },
      { key:'smuggler_tunnel',      label:'Smuggler Tunnel' },
      { key:'thieves_guild_den',    label:'Thieves Guild Den' },
      { key:'trade_consortium_hall',label:'Trade Consortium Hall' }
    ],
    offense_types: OFFENSE_TYPES.map(function(entry){
      return { key:entry.key, label:entry.label };
    }),
    defense_types: DEFENSE_TYPES.map(function(entry){
      return { key:entry.key, label:entry.label };
    })
  };

  var POI_LIBRARY_MAP = {};
  (function buildPoiLibraryMap(){
    Object.keys(POI_LIBRARY).forEach(function(categoryKey){
      var bucket = {};
      (POI_LIBRARY[categoryKey] || []).forEach(function(entry){
        bucket[String(entry.key || '')] = entry;
      });
      POI_LIBRARY_MAP[categoryKey] = bucket;
    });
  }());

  var SINGLE_CHOOSER_FIELDS = ['template', 'region', 'locale', 'development', 'wealth'];
  var CHOOSER_FIELD_ORDER = SINGLE_CHOOSER_FIELDS.concat(['cultures', 'faiths', 'factions', 'allies', 'enemies']);
  var CHOOSER_PANEL_TITLES = {
    template:'Map Point Templates',
    region:'Map Point Regions',
    locale:'Map Point Locales',
    development:'Map Point Development',
    wealth:'Map Point Wealth',
    cultures:'Map Point Cultures',
    faiths:'Map Point Faiths',
    factions:'Map Point Factions',
    allies:'Map Point Allies',
    enemies:'Map Point Enemies',
    offense_types:'Map Point Offense Types',
    defense_types:'Map Point Defense Types'
  };

  var FESTIVAL_HEADER_META = {
    midwinter:      { icon:'&#10052;',  bg:'rgba(96, 145, 214, 0.42)', color:'#e9f5ff' },
    greengrass:     { icon:'&#127807;', bg:'rgba(90, 150, 72, 0.44)', color:'#f0ffe9' },
    midsummer:      { icon:'&#9728;',   bg:'rgba(210, 145, 35, 0.46)', color:'#fff6da' },
    shieldmeet:     { icon:'&#128737;', bg:'rgba(93, 111, 166, 0.44)', color:'#eef3ff' },
    highharvestide: { icon:'&#127806;', bg:'rgba(173, 112, 28, 0.46)', color:'#fff1dd' },
    feastofthemoon: { icon:'&#9789;',   bg:'rgba(97, 85, 157, 0.46)', color:'#f0ebff' }
  };

  var BASE_TRADE_TEMPLATES_RAW = [
    { key:'hamlet',                  category:'cities_towns_villages',       label:'Hamlet',                    summary:'Small rural settlement with household-scale production and sparse services.',                                defaults:{ point_type:'settlement', locale:'inland',     population:'150',   development:'1', wealth:'1' } },
    { key:'village',                 category:'cities_towns_villages',       label:'Village',                   summary:'Typical agrarian village with modest local exchange and limited civic capacity.',                             defaults:{ point_type:'settlement', locale:'inland',     population:'500',   development:'1', wealth:'1' } },
    { key:'fishing_village',         category:'cities_towns_villages',       label:'Fishing Village',           summary:'Coastal village with seasonal fisheries, curing operations, and modest maritime exchange.',                   defaults:{ point_type:'settlement', locale:'coastal',    population:'650',   development:'2', wealth:'2' } },
    { key:'market_village',          category:'cities_towns_villages',       label:'Market Village',            summary:'Village-scale market stop with periodic trade throughput and stronger services.',                             defaults:{ point_type:'settlement', locale:'inland',     population:'850',   development:'2', wealth:'2' } },
    { key:'town',                    category:'cities_towns_villages',       label:'Town',                      summary:'Established town-scale settlement with steady markets and broader craft support.',                             defaults:{ point_type:'settlement', locale:'inland',     population:'1800',  development:'3', wealth:'3' } },
    { key:'walled_town',             category:'cities_towns_villages',       label:'Walled Town',               summary:'Fortified town with durable local governance, market activity, and heightened defenses.',                     defaults:{ point_type:'settlement', locale:'inland',     population:'3200',  development:'3', wealth:'3' } },
    { key:'city',                    category:'cities_towns_villages',       label:'City',                      summary:'Regional urban center with stronger institutions, denser trade webs, and diverse services.',                  defaults:{ point_type:'settlement', locale:'inland',     population:'8000',  development:'4', wealth:'4' } },
    { key:'capital_city',            category:'cities_towns_villages',       label:'Capital City',              summary:'Administrative and economic center with major civic demand and high strategic value.',                        defaults:{ point_type:'settlement', locale:'inland',     population:'14000', development:'4', wealth:'4' } },
    { key:'metropolis',              category:'cities_towns_villages',       label:'Metropolis',                summary:'Large urban hub with extensive institutions, specialized trades, and year-round demand.',                     defaults:{ point_type:'settlement', locale:'inland',     population:'26000', development:'5', wealth:'5' } },

    { key:'shrine',                  category:'temples_towers_guildhalls',   label:'Shrine',                    summary:'Small sacred site supporting local rites, visitors, and limited attached services.',                          defaults:{ point_type:'temple',     locale:'inland',     population:'40',    development:'1', wealth:'1' } },
    { key:'temple_complex',          category:'temples_towers_guildhalls',   label:'Temple Complex',            summary:'Expanded sacred complex with regular pilgrim traffic and organized logistics.',                               defaults:{ point_type:'temple',     locale:'inland',     population:'450',   development:'2', wealth:'2' } },
    { key:'monastery',               category:'temples_towers_guildhalls',   label:'Monastery',                 summary:'Dedicated religious institution with stable stores, disciplined labor, and focused output.',                  defaults:{ point_type:'temple',     locale:'inland',     population:'180',   development:'2', wealth:'2' } },
    { key:'guildhall',               category:'temples_towers_guildhalls',   label:'Guildhall',                 summary:'Institutional craft or merchant hall supporting specialized services and contracts.',                          defaults:{ point_type:'tradepost',  locale:'inland',     population:'220',   development:'2', wealth:'2' } },
    { key:'university',              category:'temples_towers_guildhalls',   label:'University',                summary:'Scholarly complex with steady service demand, skilled labor concentration, and administrative support.',       defaults:{ point_type:'settlement', locale:'inland',     population:'650',   development:'3', wealth:'3' } },
    { key:'arcane_tower',            category:'temples_towers_guildhalls',   label:'Arcane Tower',              summary:'Focused specialist site with low resident count and concentrated high-skill activity.',                        defaults:{ point_type:'outpost',    locale:'inland',     population:'60',    development:'2', wealth:'2' } },
    { key:'observatory',             category:'temples_towers_guildhalls',   label:'Observatory',               summary:'Purpose-built research and watch site with modest logistics and precise mission scope.',                       defaults:{ point_type:'outpost',    locale:'inland',     population:'35',    development:'1', wealth:'2' } },

    { key:'watchtower',              category:'forts_keeps_defenses',        label:'Watchtower',                summary:'Small elevated defense and warning position with limited resident support.',                                   defaults:{ point_type:'fort',       locale:'inland',     population:'30',    development:'1', wealth:'1' } },
    { key:'keep',                    category:'forts_keeps_defenses',        label:'Keep',                      summary:'Defensive stronghold with a permanent garrison and supporting local logistics.',                               defaults:{ point_type:'fort',       locale:'inland',     population:'180',   development:'2', wealth:'2' } },
    { key:'border_fort',             category:'forts_keeps_defenses',        label:'Border Fort',               summary:'Forward military position securing routes and frontiers with regular supply demand.',                          defaults:{ point_type:'fort',       locale:'inland',     population:'260',   development:'2', wealth:'2' } },
    { key:'citadel',                 category:'forts_keeps_defenses',        label:'Citadel',                   summary:'Major fortified urban defense anchor with layered command and logistics.',                                     defaults:{ point_type:'fort',       locale:'inland',     population:'1200',  development:'3', wealth:'3' } },
    { key:'fortress',                category:'forts_keeps_defenses',        label:'Fortress',                  summary:'Heavy defense complex with high military throughput and persistent support needs.',                            defaults:{ point_type:'fort',       locale:'inland',     population:'2800',  development:'3', wealth:'3' } },

    { key:'tradepost',               category:'trade_travel_infrastructure', label:'Tradepost',                 summary:'Compact exchange node linking caravans and nearby settlements through routine market flow.',                   defaults:{ point_type:'tradepost',  locale:'inland',     population:'340',   development:'2', wealth:'2' } },
    { key:'caravanserai',            category:'trade_travel_infrastructure', label:'Caravanserai',              summary:'Route stop focused on lodging, stock turnover, and waypoint provisioning.',                                   defaults:{ point_type:'tradepost',  locale:'inland',     population:'180',   development:'2', wealth:'2' } },
    { key:'bridgehead',              category:'trade_travel_infrastructure', label:'Bridgehead',                summary:'Crossing control site supporting tolls, route supervision, and nearby trade transfer.',                       defaults:{ point_type:'outpost',    locale:'inland',     population:'140',   development:'1', wealth:'1' } },
    { key:'dockyard',                category:'trade_travel_infrastructure', label:'Dockyard',                  summary:'Coastal loading district with high transport services and seasonal logistics spikes.',                         defaults:{ point_type:'port',       locale:'coastal',    population:'520',   development:'3', wealth:'3' } },
    { key:'shipyard',                category:'trade_travel_infrastructure', label:'Shipyard',                  summary:'Industrial maritime yard focused on construction, repair, and specialist labor.',                             defaults:{ point_type:'port',       locale:'coastal',    population:'760',   development:'3', wealth:'3' } },
    { key:'customs_house',           category:'trade_travel_infrastructure', label:'Customs House',             summary:'Checkpoint site enforcing tariffs, documentation, and regulated trade flow.',                                 defaults:{ point_type:'tradepost',  locale:'coastal',    population:'90',    development:'2', wealth:'2' } },
    { key:'ferry_landing',           category:'trade_travel_infrastructure', label:'Ferry Landing',             summary:'Small transport transfer point linking routes across water barriers.',                                         defaults:{ point_type:'port',       locale:'coastal',    population:'65',    development:'1', wealth:'1' } },
    { key:'waystation',              category:'trade_travel_infrastructure', label:'Waystation',                summary:'Travel support outpost for supplies, rest, and route continuity.',                                             defaults:{ point_type:'outpost',    locale:'inland',     population:'70',    development:'1', wealth:'1' } },

    { key:'lair',                    category:'lairs_ruins_dungeons',        label:'Lair',                      summary:'Hidden operational site with low resident count and uncertain local throughput.',                              defaults:{ point_type:'lair',       locale:'inland',     population:'45',    development:'1', wealth:'1' } },
    { key:'underwater_lair',         category:'lairs_ruins_dungeons',        label:'Underwater Lair',           summary:'Submerged hidden site with constrained movement, logistics, and local support.',                               defaults:{ point_type:'lair',       locale:'underwater', population:'55',    development:'1', wealth:'1' } },
    { key:'underdark_lair',          category:'lairs_ruins_dungeons',        label:'Underdark Lair',            summary:'Subsurface hidden site with route isolation and concentrated tactical pressure.',                              defaults:{ point_type:'lair',       locale:'underdark',  population:'55',    development:'1', wealth:'1' } },
    { key:'dungeon_complex',         category:'lairs_ruins_dungeons',        label:'Dungeon Complex',           summary:'Deep hazardous site with fragmented access, intermittent activity, and high risk.',                            defaults:{ point_type:'ruin',       locale:'inland',     population:'20',    development:'1', wealth:'1' } },
    { key:'ruined_town',             category:'lairs_ruins_dungeons',        label:'Ruined Town',               summary:'Abandoned settlement footprint suitable for reclamation, scavenging, or conflict staging.',                   defaults:{ point_type:'ruin',       locale:'inland',     population:'0',     development:'1', wealth:'1' } },
    { key:'ruined_city',             category:'lairs_ruins_dungeons',        label:'Ruined City',               summary:'Large abandoned urban zone with major structural remnants and layered hazards.',                               defaults:{ point_type:'ruin',       locale:'inland',     population:'0',     development:'1', wealth:'1' } },
    { key:'sunken_ruin',             category:'lairs_ruins_dungeons',        label:'Sunken Ruin',               summary:'Submerged ruin site with difficult access and salvage-oriented activity.',                                      defaults:{ point_type:'ruin',       locale:'underwater', population:'0',     development:'1', wealth:'1' } },
    { key:'crypt_tomb_complex',      category:'lairs_ruins_dungeons',        label:'Crypt and Tomb Complex',     summary:'Burial complex with localized traffic and high narrative hazard potential.',                                    defaults:{ point_type:'ruin',       locale:'inland',     population:'0',     development:'1', wealth:'1' } },

    { key:'mountain_pass',           category:'natural_points_of_interest',  label:'Mountain Pass',             summary:'Strategic natural corridor controlling movement, toll pressure, and defensive value.',                         defaults:{ point_type:'outpost',    locale:'inland',     population:'25',    development:'1', wealth:'1' } },
    { key:'river_confluence',        category:'natural_points_of_interest',  label:'River Confluence',          summary:'Natural transport convergence with strong market potential and route significance.',                            defaults:{ point_type:'tradepost',  locale:'inland',     population:'110',   development:'2', wealth:'2' } },
    { key:'sacred_grove',            category:'natural_points_of_interest',  label:'Sacred Grove',              summary:'Natural ceremonial site with low resident population and periodic service demand.',                             defaults:{ point_type:'temple',     locale:'inland',     population:'20',    development:'1', wealth:'1' } },
    { key:'volcanic_vent',           category:'natural_points_of_interest',  label:'Volcanic Vent',             summary:'Volatile natural landmark often tied to extraction, danger, and route avoidance.',                             defaults:{ point_type:'outpost',    locale:'inland',     population:'0',     development:'1', wealth:'1' } },
    { key:'island_landmark',         category:'natural_points_of_interest',  label:'Island Landmark',           summary:'Isolated natural marker with potential navigation and staging utility.',                                        defaults:{ point_type:'outpost',    locale:'coastal',    population:'35',    development:'1', wealth:'1' } },

    { key:'underdark_entrance',      category:'underdark_locations',         label:'Underdark Entrance',        summary:'Primary transition point between surface routes and subsurface networks.',                                     defaults:{ point_type:'outpost',    locale:'underdark',  population:'45',    development:'1', wealth:'1' } },
    { key:'subterranean_settlement', category:'underdark_locations',         label:'Subterranean Settlement',    summary:'Permanent deep settlement with localized production and route-dependent exchange.',                             defaults:{ point_type:'settlement', locale:'underdark',  population:'650',   development:'3', wealth:'2' } },
    { key:'subterranean_city',       category:'underdark_locations',         label:'Subterranean City',          summary:'Major deep urban location with high structural complexity and sustained demand.',                               defaults:{ point_type:'settlement', locale:'underdark',  population:'12000', development:'4', wealth:'4' } },
    { key:'deep_outpost',            category:'underdark_locations',         label:'Deep Outpost',              summary:'Remote subsurface support node securing routes and logistic continuity.',                                       defaults:{ point_type:'outpost',    locale:'underdark',  population:'120',   development:'2', wealth:'2' } },
    { key:'subterranean_port',       category:'underdark_locations',         label:'Subterranean Port',         summary:'Underground waterway transfer site linking deep corridors and cargo traffic.',                                  defaults:{ point_type:'port',       locale:'underdark',  population:'380',   development:'2', wealth:'2' } },

    { key:'underwater_settlement',   category:'underwater_locations',        label:'Underwater Settlement',     summary:'Submerged settlement with constrained logistics and strong dependence on specialized services.',                defaults:{ point_type:'settlement', locale:'underwater', population:'700',   development:'3', wealth:'2' } },
    { key:'underwater_city',         category:'underwater_locations',        label:'Underwater City',           summary:'Major submerged urban center with layered infrastructure and sustained regional demand.',                       defaults:{ point_type:'settlement', locale:'underwater', population:'12000', development:'4', wealth:'4' } },
    { key:'reef_complex',            category:'underwater_locations',        label:'Reef Complex',              summary:'Natural submerged zone serving as navigation obstacle, resource point, or defensive screen.',                  defaults:{ point_type:'outpost',    locale:'underwater', population:'40',    development:'1', wealth:'1' } },
    { key:'shipwreck_site',          category:'underwater_locations',        label:'Shipwreck Site',            summary:'Localized salvage and hazard area centered on submerged transport remains.',                                    defaults:{ point_type:'ruin',       locale:'underwater', population:'0',     development:'1', wealth:'1' } },
    { key:'drowned_temple',          category:'underwater_locations',        label:'Drowned Temple',            summary:'Submerged sacred ruin with intermittent expedition traffic and concentrated risk.',                             defaults:{ point_type:'temple',     locale:'underwater', population:'0',     development:'1', wealth:'1' } }
  ];

  /* ======================================================================== */
  /* Utilities                                                                 */
  /* ======================================================================== */

  function esc(s){
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hrefAttr(s){
    return String(s || '').replace(/"/g, '&quot;');
  }

  function lower(s){
    return String(s || '').toLowerCase();
  }

  function canonicalToken(s){
    return lower(String(s || '').replace(/[^a-z0-9]+/g, ''));
  }

  function sortLabelObjectsInPlace(list){
    if(!Array.isArray(list)) return list;
    list.sort(function(a, b){
      return alphaNumericCompare(String((a && a.label) || ''), String((b && b.label) || ''));
    });
    return list;
  }

  (function sortCanonicalLibraries(){
    sortLabelObjectsInPlace(CULTURES);
    sortLabelObjectsInPlace(FAITHS);
    sortLabelObjectsInPlace(FACTIONS);
    sortLabelObjectsInPlace(OFFENSE_TYPES);
    sortLabelObjectsInPlace(DEFENSE_TYPES);
    sortLabelObjectsInPlace(TRADE_GOOD_GROUPS);
  })();

  function isGM(pid){
    try{ return typeof playerIsGM === 'function' && playerIsGM(pid); }catch(e){ return false; }
  }

  function playerName(pid){
    try{
      var p = getObj('player', pid);
      return p ? String(p.get('displayname') || 'GM') : 'GM';
    }catch(e){
      return 'GM';
    }
  }

  function whisper(pid, html){
    pid = String(pid || '').trim();
    if(!pid) return;
    try{
      sendChat('fts', '/w "' + playerName(pid) + '" ' + String(html || ''));
    }catch(e){}
  }

  function whisperCampaignMenu(pid){
    pid = String(pid || '').trim();
    var targetPid = pid;
    if(!isGM(targetPid)){
      targetPid = firstGMPlayerId() || targetPid;
    }
    if(!targetPid) return;
    try{
      sendChat('player|' + targetPid, '!fts');
    }catch(e){}
  }

  function firstGMPlayerId(){
    try{
      var players = findObjs({ _type:'player' }) || [];
      for(var i=0;i<players.length;i++){
        var pid = String((players[i] && players[i].id) || '');
        if(pid && isGM(pid)) return pid;
      }
    }catch(e){}
    return '';
  }

  function isSelfChatMessage(msg){
    var pid = String((msg && msg.playerid) || '');
    var who = lower(String((msg && msg.who) || '').replace(/\s+\(gm\)$/i, '').trim());
    return pid === 'API' || who === 'fts';
  }

  function normalizeKey(s){
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function titleCaseToken(s){
    return String(s || '').replace(/[_-]+/g, ' ').replace(/\b([a-z])/g, function(m){ return m.toUpperCase(); });
  }

  function alphaNumericCompare(a, b){
    var left = String(a || '');
    var right = String(b || '');
    try{
      return left.localeCompare(right, undefined, { numeric:true, sensitivity:'base' });
    }catch(e){
      return left.localeCompare(right);
    }
  }

  function uniqueStrings(list){
    var out = [];
    var seen = {};
    list = Array.isArray(list) ? list : [];
    for(var i=0;i<list.length;i++){
      var raw = String(list[i] || '').trim();
      if(!raw) continue;
      var key = lower(raw);
      if(seen[key]) continue;
      seen[key] = true;
      out.push(raw);
    }
    return out;
  }

  function asInt(value){
    var n = parseInt(value, 10);
    return isNaN(n) ? null : n;
  }

  function safeParseJSON(text, fallback){
    try{ return JSON.parse(String(text || '')); }catch(e){ return fallback; }
  }

  function stringOrBlank(value){
    return (value == null) ? '' : String(value).trim();
  }

  function normalizeNumberString(n){
    var rounded = Math.round(n * 100) / 100;
    return String(rounded).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }

  function normalizeCargoUnits(value){
    var raw = String(value || '').trim();
    if(!raw) return '';
    if(raw.indexOf('-.') === 0) raw = '-0' + raw.slice(1);
    else if(raw.charAt(0) === '.') raw = '0' + raw;
    var n = parseFloat(raw);
    if(!isFinite(n) || n <= 0) return '';
    var rounded = Math.round(n * 100) / 100;
    if(Math.abs(rounded - n) > 0.000001) return '';
    return normalizeNumberString(rounded);
  }

  function isCargoUnitsClearValue(value){
    var raw = String(value || '').trim();
    if(!raw) return false;
    var n = parseFloat(raw);
    return isFinite(n) && Math.abs(n) < 0.000001;
  }

  function findByKey(list, key){
    key = String(key || '').trim();
    for(var i=0;i<list.length;i++){
      if(String(list[i].key || '') === key) return list[i];
    }
    return null;
  }

  function tierByValue(list, value){
    value = String(value || '').trim();
    for(var i=0;i<list.length;i++){
      if(String(list[i].value || '') === value) return list[i];
    }
    return null;
  }

  function escapeRollQueryValue(s){
    return String(s || '')
      .replace(/\|/g, '&#124;')
      .replace(/,/g, '&#44;')
      .replace(/\}/g, '&#125;')
      .replace(/\{/g, '&#123;');
  }

  function buildRollQuery(title, options){
    options = Array.isArray(options) ? options : [];
    var parts = [];
    for(var i=0;i<options.length;i++){
      parts.push(escapeRollQueryValue(options[i].label) + ',' + escapeRollQueryValue(options[i].value));
    }
    return '?{' + escapeRollQueryValue(title) + '|' + parts.join('|') + '}';
  }

  function cssVars(){
    if(RT.fts && typeof RT.fts.cssVars === 'function'){
      return RT.fts.cssVars();
    }
    return {
      container:'display:block;width:80%;margin:0 auto;border:1px solid #bbb;padding:10px;background:#fff;color:#111;font:14px/1.32 Georgia,serif;',
      title:'font-weight:bold;font-size:17px;margin-bottom:6px;color:#111;',
      card:'margin-top:8px;border:1px solid #d0d0d0;background:#f7f7f7;color:#111;padding:12px;',
      btn:'display:inline-block;padding:5px 10px;border:1px solid #555;background:#eee;color:#111;border-radius:4px;text-decoration:none;',
      link:'text-decoration:none;color:#ba2e68;',
      hrefAttr:hrefAttr
    };
  }

  function currentPaletteName(){
    try{
      if(RT.fts && typeof RT.fts.ensureCoreState === 'function'){
        var S = RT.fts.ensureCoreState();
        return String((((S || {}).ui || {}).palette) || 'none').toLowerCase();
      }
    }catch(e){}
    return 'none';
  }

  function controlAreaStyle(){
    var palette = currentPaletteName();
    var map = {
      none:{ bg:'rgba(80, 92, 108, 0.08)', border:'rgba(80, 92, 108, 0.20)' },
      dark:{ bg:'rgba(155, 109, 255, 0.10)', border:'rgba(155, 109, 255, 0.26)' },
      mint:{ bg:'rgba(82, 125, 82, 0.10)', border:'rgba(82, 125, 82, 0.26)' },
      parchment:{ bg:'rgba(154, 110, 55, 0.10)', border:'rgba(154, 110, 55, 0.26)' },
      powder:{ bg:'rgba(122, 167, 217, 0.12)', border:'rgba(122, 167, 217, 0.28)' },
      rosebud:{ bg:'rgba(186, 46, 104, 0.10)', border:'rgba(186, 46, 104, 0.26)' }
    };
    var tone = map[palette] || map.none;
    return (cssVars().card || '') + 'border:1px solid ' + tone.border + ';background:' + tone.bg + ';';
  }

  function sanityNoticeTone(){
    var palette = currentPaletteName();
    var map = {
      none:      { border:'rgba(173,108,14,0.55)', bg:'rgba(173,108,14,0.12)', text:'#7c4b08' },
      dark:      { border:'rgba(255,181,71,0.62)', bg:'rgba(255,181,71,0.18)', text:'#ffdca3' },
      mint:      { border:'rgba(180,126,53,0.60)', bg:'rgba(180,126,53,0.16)', text:'#6f3f00' },
      parchment: { border:'rgba(144,94,21,0.60)', bg:'rgba(144,94,21,0.16)', text:'#6d3b00' },
      powder:    { border:'rgba(177,120,38,0.60)', bg:'rgba(177,120,38,0.16)', text:'#7a4700' },
      rosebud:   { border:'rgba(237,173,79,0.62)', bg:'rgba(237,173,79,0.18)', text:'#733f00' }
    };
    return map[palette] || map.none;
  }

  function prominentHeadingTone(){
    var palette = currentPaletteName();
    var map = {
      none:'#2c3d52',
      dark:'#e8dcff',
      mint:'#1f4d34',
      parchment:'#6f4314',
      powder:'#234c70',
      rosebud:'#7f1b43'
    };
    return map[palette] || map.none;
  }

  function prominentHeadingStyle(){
    return 'font-size:20px;line-height:1.16;font-weight:800;color:' + prominentHeadingTone() + ';';
  }

  function shell(title){
    var v = cssVars();
    var container = String(v.container || '');
    if(container && !/;\s*$/.test(container)) container += ';';
    container += 'max-width:520px;width:80%;box-sizing:border-box;margin-left:auto;margin-right:auto;text-align:left;';
    return '<div style="' + container + '"><div style="' + (v.title || '') + '">' + esc(title) + '</div>';
  }

  function endShell(){ return '</div>'; }

  function linkStyle(selected){
    var v = cssVars();
    var base = v.btn || v.link || '';
    var extra = 'display:block;text-align:center;margin-top:6px;';
    if(selected && v.btn){
      extra += 'font-weight:bold;background:#345f8c;color:#fff;border-color:#21405e;box-shadow:inset 0 0 0 9999px rgba(255,255,255,0.06);';
    }else if(selected){
      extra += 'font-weight:bold;text-decoration:none;background:#345f8c;color:#fff;border:1px solid #21405e;';
    }
    return base + extra;
  }

  function mergeStyleAttr(attrs, extraStyle){
    attrs = String(attrs || '');
    extraStyle = String(extraStyle || '');
    if(!extraStyle) return attrs;
    if(/\sstyle="/i.test(attrs)){
      return attrs.replace(/\sstyle="([^"]*)"/i, function(match, existing){
        var merged = String(existing || '');
        if(merged && !/;\s*$/.test(merged)) merged += ';';
        merged += extraStyle;
        return ' style="' + merged + '"';
      });
    }
    return attrs + ' style="' + extraStyle + '"';
  }

  function actionLink(href, label, selected){
    var attrs = ' href="' + hrefAttr(href) + '" style="' + linkStyle(selected) + '"';
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, linkStyle(selected));
    }
    return '<a' + attrs + '>' + esc(label) + '</a>';
  }

  function actionLinkWithStyle(href, label, selected, extraStyle){
    extraStyle = String(extraStyle || '');
    var style = linkStyle(selected) + extraStyle;
    var attrs = ' href="' + hrefAttr(href) + '" style="' + style + '"';
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, style);
    }
    return '<a' + attrs + '>' + esc(label) + '</a>';
  }

  function inlineLinkStyle(selected){
    var v = cssVars();
    var base = v.btn || v.link || '';
    var extra = 'display:inline-block;margin:4px 8px 4px 0;padding:2px 8px;';
    if(selected && v.btn){
      extra += 'font-weight:bold;background:#345f8c;color:#fff;border-color:#21405e;box-shadow:inset 0 0 0 9999px rgba(255,255,255,0.06);';
    }else if(selected){
      extra += 'font-weight:bold;text-decoration:none;background:#345f8c;color:#fff;border:1px solid #21405e;';
    }
    return base + extra;
  }

  function inlineActionLink(href, label, selected){
    var attrs = ' href="' + hrefAttr(href) + '" style="' + inlineLinkStyle(selected) + '"';
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, inlineLinkStyle(selected));
    }
    return '<a' + attrs + '>' + esc(label) + '</a>';
  }

  function iconActionLink(href, iconHtml, titleText){
    return '<a href="' + hrefAttr(href) + '"'
      + ' title="' + esc(titleText || '') + '"'
      + ' style="display:inline-block;min-width:18px;height:18px;line-height:16px;margin-left:6px;padding:0 4px;'
      + 'border:1px solid rgba(122,27,27,0.35);border-radius:999px;background:rgba(122,27,27,0.08);'
      + 'color:#7a1b1b;text-align:center;text-decoration:none;font-size:12px;font-weight:bold;"'
      + '>'
      + iconHtml
      + '</a>';
  }

  function badge(text){
    return '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 6px;border:1px solid #999;border-radius:999px;font-size:11px;">' + esc(text) + '</span>';
  }

  function muted(text){
    return '<div style="margin-top:4px;font-size:12px;opacity:0.92;">' + text + '</div>';
  }

  function canonicalRegionKey(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function canonicalLocaleKey(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function defaultLocaleDefinition(localeKey){
    var defs = {
      offshore:   { key:'offshore',   label:'Offshore' },
      coastal:    { key:'coastal',    label:'Coastal' },
      inland:     { key:'inland',     label:'Inland' },
      underwater: { key:'underwater', label:'Underwater' },
      underdark:  { key:'underdark',  label:'Underdark' }
    };
    return defs[localeKey] || { key:localeKey, label:titleCaseToken(localeKey) };
  }

  function periodLabel(periodKey){
    var period = findByKey(CALENDAR_PERIODS, periodKey);
    return period ? period.label : titleCaseToken(periodKey);
  }

  function periodSortValue(periodKey){
    return Object.prototype.hasOwnProperty.call(CALENDAR_PERIOD_INDEX, periodKey) ? CALENDAR_PERIOD_INDEX[periodKey] : 9999;
  }

  function sortPeriodKeys(list){
    list = Array.isArray(list) ? list.slice() : [];
    list.sort(function(a, b){
      return periodSortValue(a) - periodSortValue(b);
    });
    return list;
  }

  function expandWindowKey(windowKey){
    windowKey = String(windowKey || '').trim();
    if(!windowKey) return [];
    var preset = findByKey(WINDOW_PRESETS, windowKey);
    if(preset) return preset.periods.slice();
    if(findByKey(CALENDAR_PERIODS, windowKey)) return [windowKey];
    return [];
  }

  function isFestivalPeriodKey(periodKey){
    return !!FESTIVAL_PERIOD_KEYS[String(periodKey || '').trim()];
  }

  // Visible period cells store visible period totals. Only season/year preset
  // buttons redistribute a typed total across their child periods.
  function distributedWindowCargoUnits(windowKey, stance, cu){
    var periods = expandWindowKey(windowKey);
    var preset = findByKey(WINDOW_PRESETS, windowKey);
    var normalized = normalizeCargoUnits(cu);
    var out = {};
    if(!periods.length || !normalized) return out;
    var total = parseFloat(normalized);

    function shareValue(n){
      if(n > 0 && n < 0.01) n = 0.01;
      return normalizeNumberString(n);
    }

    if(!preset){
      for(var pi=0;pi<periods.length;pi++) out[periods[pi]] = shareValue(total);
      return out;
    }

    var monthPeriods = periods.filter(function(periodKey){
      return !isFestivalPeriodKey(periodKey);
    });
    var monthCount = monthPeriods.length || periods.length;
    var monthShare = total / monthCount;
    var festivalShare = monthShare;
    if(lower(stance) !== 'has'){
      festivalShare = monthShare / 30;
      if(festivalShare > 0 && festivalShare < 0.01) festivalShare = 0.01;
    }

    var monthValue = shareValue(monthShare);
    var festivalValue = shareValue(festivalShare);
    for(var i=0;i<periods.length;i++){
      out[periods[i]] = isFestivalPeriodKey(periods[i]) ? festivalValue : monthValue;
    }
    return out;
  }

  function tradeStanceLabel(stance){
    stance = lower(stance);
    if(stance === 'has') return 'Has';
    if(stance === 'wants') return 'Wants';
    if(stance === 'needs') return 'Needs';
    return titleCaseToken(stance);
  }

  function tradeGroupTargetKey(groupKey){
    return 'group__' + String(groupKey || '').trim();
  }

  function tradeGroupKeyFromTarget(goodKey){
    goodKey = String(goodKey || '').trim();
    return goodKey.indexOf('group__') === 0 ? goodKey.slice(7) : '';
  }

  function validTradeTargetKey(goodKey){
    goodKey = String(goodKey || '').trim();
    if(!goodKey) return false;
    var groupKey = tradeGroupKeyFromTarget(goodKey);
    return !!(groupKey && TRADE_GOOD_GROUP_MAP[groupKey]);
  }

  function tradeGoodLabel(goodKey){
    var groupKey = tradeGroupKeyFromTarget(goodKey);
    return (groupKey && TRADE_GOOD_GROUP_MAP[groupKey]) ? tradeGoodGroupLabel(groupKey) : titleCaseToken(goodKey);
  }

  function tradeGoodGroupLabel(groupKey){
    return TRADE_GOOD_GROUP_MAP[groupKey] ? TRADE_GOOD_GROUP_MAP[groupKey].label : titleCaseToken(groupKey);
  }

  function tradeGoodGroupDescription(groupKey){
    return String(TRADE_GOOD_GROUP_DETAILS[groupKey] || 'Standardized trade activity for reusable settlement and market authoring.').trim();
  }

  function tradeCategoryTarget(group){
    return {
      key: tradeGroupTargetKey(group.key),
      label: tradeGoodLabel(tradeGroupTargetKey(group.key)),
      group: group.key
    };
  }

  function tradeTargetGroupKey(goodKey){
    var groupKey = tradeGroupKeyFromTarget(goodKey);
    return groupKey || '';
  }

  function normalizeCalendarPeriodKey(raw){
    var token = canonicalToken(raw);
    for(var i=0;i<CALENDAR_PERIODS.length;i++){
      var period = CALENDAR_PERIODS[i];
      if(period.key === raw) return period.key;
      if(canonicalToken(period.key) === token) return period.key;
      if(canonicalToken(period.label) === token) return period.key;
    }
    return '';
  }

  function currentCalendarPeriodKey(){
    var now = (((RT || {}).state || {}).fts || {}).now || {};
    if(now.festival){
      return normalizeCalendarPeriodKey(now.festival);
    }
    if(now.month && Object.prototype.hasOwnProperty.call(CALENDAR_MONTH_KEY_BY_NUMBER, String(now.month))){
      return CALENDAR_MONTH_KEY_BY_NUMBER[String(now.month)];
    }
    if(Object.prototype.hasOwnProperty.call(CALENDAR_MONTH_KEY_BY_NUMBER, now.month)){
      return CALENDAR_MONTH_KEY_BY_NUMBER[now.month];
    }
    return 'hammer';
  }

  function tradeEntriesForPeriod(list, stance, periodKey){
    return tradeEntriesForStance(list, stance).filter(function(entry){
      return !!((entry && entry.periods) ? entry.periods[periodKey] : '');
    });
  }

  function calendarHeaderToken(periodKey){
    if(Object.prototype.hasOwnProperty.call(CALENDAR_MONTH_NUMBER, periodKey)){
      return String(CALENDAR_MONTH_NUMBER[periodKey]);
    }
    var meta = FESTIVAL_HEADER_META[periodKey] || {};
    return '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;'
      + 'padding:0 4px;border-radius:999px;background:rgba(255,255,255,0.18);'
      + 'box-shadow:inset 0 0 0 1px rgba(0,0,0,0.28);text-shadow:0 1px 1px rgba(0,0,0,0.45);">'
      + (meta.icon || '&#9673;')
      + '</span>';
  }

  function calendarHeaderCellStyle(periodKey){
    var base = 'padding:5px 3px;border:1px solid rgba(0,0,0,0.18);text-align:center;font-size:14px;font-weight:bold;min-width:48px;';
    if(!FESTIVAL_PERIOD_KEYS[periodKey]){
      return base + 'background:rgba(0,0,0,0.06);';
    }
    var meta = FESTIVAL_HEADER_META[periodKey] || {};
    return base
      + 'background:' + (meta.bg || 'rgba(0,0,0,0.10)') + ';'
      + 'color:' + (meta.color || '#f7f7f7') + ';'
      + 'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.10);';
  }

  function windowLabel(windowKey){
    var preset = findByKey(WINDOW_PRESETS, windowKey);
    return preset ? preset.label : titleCaseToken(windowKey);
  }

  function windowShortLabel(windowKey){
    if(windowKey === 'winter') return 'Winter';
    if(windowKey === 'spring') return 'Spring';
    if(windowKey === 'summer') return 'Summer';
    if(windowKey === 'autumn') return 'Autumn';
    if(windowKey === 'annual') return 'Year';
    return windowLabel(windowKey);
  }

  function normalizedTradeWindowTotals(raw){
    var out = {};

    function assignWindowTotal(windowKey, cu){
      windowKey = String(windowKey || '').trim();
      cu = normalizeCargoUnits(cu);
      if(!findByKey(WINDOW_PRESETS, windowKey) || !cu) return;
      out[windowKey] = cu;
    }

    var rawWindowTotals = (raw && raw.windowTotals && typeof raw.windowTotals === 'object' && !Array.isArray(raw.windowTotals))
      ? raw.windowTotals
      : {};
    Object.keys(rawWindowTotals).forEach(function(windowKey){
      assignWindowTotal(windowKey, rawWindowTotals[windowKey]);
    });

    var rawWindows = Array.isArray(raw && raw.windows) ? raw.windows : [];
    for(var i=0;i<rawWindows.length;i++){
      assignWindowTotal(rawWindows[i] && rawWindows[i].key, rawWindows[i] && rawWindows[i].cu);
    }

    return out;
  }

  function sortedTradeGoodGroups(){
    return TRADE_GOOD_GROUPS.slice().sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  function blankViewKey(pid){
    return String(pid || '');
  }

  function currentBlankView(pid){
    return !!ensureState().blankView[blankViewKey(pid)];
  }

  function setBlankView(pid, enabled){
    ensureState().blankView[blankViewKey(pid)] = !!enabled;
    return !!enabled;
  }

  function normalizeSectionView(view){
    view = String(view || '').trim();
    if(!view || view === 'panel') return 'bind';
    for(var i=0;i<SECTION_SEQUENCE.length;i++){
      if(SECTION_SEQUENCE[i].view === view) return view;
    }
    return 'bind';
  }

  function sectionMetaByView(view){
    view = normalizeSectionView(view);
    for(var i=0;i<SECTION_SEQUENCE.length;i++){
      if(SECTION_SEQUENCE[i].view === view) return SECTION_SEQUENCE[i];
    }
    return SECTION_SEQUENCE[0];
  }

  function sectionMetaByKey(key){
    key = normalizeKey(key || '');
    for(var i=0;i<SECTION_SEQUENCE.length;i++){
      if(SECTION_SEQUENCE[i].key === key) return SECTION_SEQUENCE[i];
    }
    return null;
  }

  function sectionIndexByView(view){
    view = normalizeSectionView(view);
    for(var i=0;i<SECTION_SEQUENCE.length;i++){
      if(SECTION_SEQUENCE[i].view === view) return i;
    }
    return 0;
  }

  function currentView(pid){
    return normalizeSectionView(ensureState().view[String(pid || '')] || 'bind');
  }

  function setView(pid, view){
    view = normalizeSectionView(view);
    ensureState().view[String(pid || '')] = view;
    return view;
  }

  function sectionIndexForPlayer(pid){
    return sectionIndexByView(currentView(pid));
  }

  function currentSectionMeta(pid){
    return sectionMetaByView(currentView(pid));
  }

  function moveSection(pid, direction){
    var index = sectionIndexForPlayer(pid);
    if(lower(direction) === 'back'){
      index = Math.max(0, index - 1);
    }else{
      index = Math.min(SECTION_SEQUENCE.length - 1, index + 1);
    }
    return setView(pid, SECTION_SEQUENCE[index].view);
  }

  function availableTemplateCategoryKeys(session){
    var records = templateRecordsForRegion((session && session.data && session.data.region) || '');
    var seen = {};
    var out = [];
    for(var i=0;i<records.length;i++){
      var categoryKey = normalizeTemplateCategoryKey(records[i].categoryKey || '');
      if(!categoryKey || seen[categoryKey]) continue;
      seen[categoryKey] = true;
      out.push(categoryKey);
    }
    out.sort(function(a, b){
      return alphaNumericCompare(templateCategoryLabel(a), templateCategoryLabel(b));
    });
    return out;
  }

  function currentTemplateCategory(pid){
    return String(ensureState().templateCategory[String(pid || '')] || '');
  }

  function setTemplateCategory(pid, categoryKey){
    pid = String(pid || '');
    if(!pid) return '';
    categoryKey = normalizeTemplateCategoryKey(categoryKey || '');
    if(!categoryKey){
      delete ensureState().templateCategory[pid];
      return '';
    }
    ensureState().templateCategory[pid] = categoryKey;
    return categoryKey;
  }

  function resolveTemplateCategoryForPanel(pid, session){
    var selected = normalizeTemplateCategoryKey(currentTemplateCategory(pid));
    var available = availableTemplateCategoryKeys(session);
    if(selected && available.indexOf(selected) !== -1) return selected;

    if(session && session.data && session.data.template_category){
      selected = normalizeTemplateCategoryKey(session.data.template_category);
      if(selected && available.indexOf(selected) !== -1){
        setTemplateCategory(pid, selected);
        return selected;
      }
    }
    selected = available.length ? available[0] : '';
    setTemplateCategory(pid, selected);
    return selected;
  }

  function currentTemplateShowMode(pid){
    var value = String((ensureState().templateShowMode || {})[String(pid || '')] || '').toLowerCase();
    return value === 'all' ? 'all' : 'filtered';
  }

  function setTemplateShowMode(pid, mode){
    pid = String(pid || '');
    if(!pid) return 'filtered';
    mode = String(mode || '').toLowerCase();
    if(mode !== 'all' && mode !== 'filtered'){
      delete ensureState().templateShowMode[pid];
      return 'filtered';
    }
    ensureState().templateShowMode[pid] = mode;
    return mode;
  }

  function templateHandoutId(pid){
    return String((ensureState().templateHandout || {})[String(pid || '')] || '');
  }

  function setTemplateHandoutId(pid, handoutId){
    pid = String(pid || '');
    handoutId = String(handoutId || '');
    if(!pid) return '';
    if(!handoutId){
      delete ensureState().templateHandout[pid];
      return '';
    }
    ensureState().templateHandout[pid] = handoutId;
    return handoutId;
  }

  function currentTemplateHandout(pid){
    var id = templateHandoutId(pid);
    if(!id) return null;
    return getObj('handout', id) || null;
  }

  function destroyTemplateHandout(pid){
    var handout = currentTemplateHandout(pid);
    if(handout && typeof handout.remove === 'function'){
      try{ handout.remove(); }catch(e){}
    }
    setTemplateHandoutId(pid, '');
    setTemplateShowMode(pid, 'filtered');
  }

  function currentPoiCategory(pid){
    return String(ensureState().poiCategory[String(pid || '')] || '');
  }

  function setPoiCategory(pid, categoryKey){
    pid = String(pid || '');
    if(!pid) return '';
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey){
      delete ensureState().poiCategory[pid];
      return '';
    }
    ensureState().poiCategory[pid] = categoryKey;
    return categoryKey;
  }

  function resolvePoiCategoryForPanel(pid){
    var selected = normalizePoiCategoryKey(currentPoiCategory(pid));
    if(selected) return selected;
    var keys = Object.keys(POI_CATEGORY_MAP).sort(function(a, b){
      return alphaNumericCompare(poiCategoryLabel(a), poiCategoryLabel(b));
    });
    selected = keys.length ? keys[0] : '';
    setPoiCategory(pid, selected);
    return selected;
  }

  function poiHandoutId(pid){
    return String((ensureState().poiHandout || {})[String(pid || '')] || '');
  }

  function setPoiHandoutId(pid, handoutId){
    pid = String(pid || '');
    handoutId = String(handoutId || '');
    if(!pid) return '';
    if(!handoutId){
      delete ensureState().poiHandout[pid];
      return '';
    }
    ensureState().poiHandout[pid] = handoutId;
    return handoutId;
  }

  function currentPoiHandout(pid){
    var id = poiHandoutId(pid);
    if(!id) return null;
    return getObj('handout', id) || null;
  }

  function destroyPoiHandout(pid){
    var handout = currentPoiHandout(pid);
    if(handout && typeof handout.remove === 'function'){
      try{ handout.remove(); }catch(e){}
    }
    setPoiHandoutId(pid, '');
    setPoiCategory(pid, '');
  }

  function currentTradeGroup(pid){
    return String(ensureState().tradeGroup[String(pid || '')] || '');
  }

  function setTradeGroup(pid, groupKey){
    groupKey = normalizeKey(groupKey || '');
    if(!TRADE_GOOD_GROUP_MAP[groupKey]) groupKey = '';
    ensureState().tradeGroup[String(pid || '')] = groupKey;
    return groupKey;
  }

  function tradeHandoutId(pid){
    return String((ensureState().tradeHandout || {})[String(pid || '')] || '');
  }

  function setTradeHandoutId(pid, handoutId){
    pid = String(pid || '');
    handoutId = String(handoutId || '');
    if(!pid) return '';
    if(!handoutId){
      delete ensureState().tradeHandout[pid];
      return '';
    }
    ensureState().tradeHandout[pid] = handoutId;
    return handoutId;
  }

  function currentTradeHandout(pid){
    var id = tradeHandoutId(pid);
    if(!id) return null;
    return getObj('handout', id) || null;
  }

  function destroyTradeHandout(pid){
    var handout = currentTradeHandout(pid);
    if(handout && typeof handout.remove === 'function'){
      try{ handout.remove(); }catch(e){}
    }
    setTradeHandoutId(pid, '');
    setTradeGroup(pid, '');
  }

  function reviewHandoutId(pid){
    return String((ensureState().reviewHandout || {})[String(pid || '')] || '');
  }

  function setReviewHandoutId(pid, handoutId){
    pid = String(pid || '');
    handoutId = String(handoutId || '');
    if(!pid) return '';
    if(!handoutId){
      delete ensureState().reviewHandout[pid];
      return '';
    }
    ensureState().reviewHandout[pid] = handoutId;
    return handoutId;
  }

  function currentReviewHandout(pid){
    var id = reviewHandoutId(pid);
    if(!id) return null;
    return getObj('handout', id) || null;
  }

  function destroyReviewHandout(pid){
    var handout = currentReviewHandout(pid);
    if(handout && typeof handout.remove === 'function'){
      try{ handout.remove(); }catch(e){}
    }
    setReviewHandoutId(pid, '');
  }

  function isMultiHandoutField(field){
    field = normalizeKey(field || '');
    return !!MULTI_HANDOUT_FIELDS[field];
  }

  function multiHandoutStateKey(pid, field){
    pid = String(pid || '').trim();
    field = normalizeKey(field || '');
    return pid && field ? (pid + '::' + field) : '';
  }

  function multiHandoutId(pid, field){
    var key = multiHandoutStateKey(pid, field);
    return key ? String((ensureState().multiHandout || {})[key] || '') : '';
  }

  function setMultiHandoutId(pid, field, handoutId){
    var key = multiHandoutStateKey(pid, field);
    handoutId = String(handoutId || '');
    if(!key) return '';
    if(!handoutId){
      delete ensureState().multiHandout[key];
      return '';
    }
    ensureState().multiHandout[key] = handoutId;
    return handoutId;
  }

  function currentMultiHandout(pid, field){
    var id = multiHandoutId(pid, field);
    if(!id) return null;
    return getObj('handout', id) || null;
  }

  function destroyMultiHandout(pid, field){
    var handout = currentMultiHandout(pid, field);
    if(handout && typeof handout.remove === 'function'){
      try{ handout.remove(); }catch(e){}
    }
    setMultiHandoutId(pid, field, '');
  }

  function destroyAllMultiHandouts(pid){
    var keys = Object.keys(MULTI_HANDOUT_FIELDS);
    for(var i=0;i<keys.length;i++){
      destroyMultiHandout(pid, keys[i]);
    }
  }

  function refreshOpenMultiHandouts(pid, session){
    var keys = Object.keys(MULTI_HANDOUT_FIELDS);
    for(var i=0;i<keys.length;i++){
      if(currentMultiHandout(pid, keys[i])){
        ensureMultiHandout(pid, session, keys[i]);
      }
    }
  }

  /* ======================================================================== */
  /* Chat Surface                                                              */
  /* ======================================================================== */

  function chooserPanelTitle(field){
    return CHOOSER_PANEL_TITLES[field] || ('Map Point ' + titleCaseToken(field));
  }

  function renderChooserPanel(pid, field){
    if(field === 'template'){
      var session = currentSession(pid);
      if(currentBlankView(pid)) session = null;
      return session ? renderTemplateSelectionPanel(pid, session) : renderBindSectionPanel(pid);
    }
    return renderChooserViewPanel(field, pid);
  }

  function renderTradePanel(pid){
    var session = currentSession(pid);
    if(currentBlankView(pid)) session = null;
    return session ? renderTradeGoodsSelectionPanel(pid, session) : renderTradeGoodsSelectionLauncher(pid);
  }

  function renderPoiPanel(pid){
    var session = currentSession(pid);
    if(currentBlankView(pid)) session = null;
    return session ? renderPoiSelectionPanel(pid, session) : renderPoiSelectionLauncher(pid);
  }

  function renderActivePanel(pid){
    var view = currentView(pid);
    if(view === 'bind') return renderBindSectionPanel(pid);
    if(view === 'step:name') return renderNameSectionPanel(pid);
    if(view === 'step:population') return renderPopulationSectionPanel(pid);
    if(view === 'review') return renderReviewSectionPanel(pid);
    if(view === 'poi') return renderPoiPanel(pid);
    if(view === 'trade') return renderTradePanel(pid);
    if(view.indexOf('chooser:') === 0){
      var field = normalizeKey(view.slice('chooser:'.length));
      if(field && (MULTI_LIBRARY[field] || SINGLE_CHOOSER_FIELDS.indexOf(field) !== -1)){
        return renderChooserPanel(pid, field);
      }
      setView(pid, 'bind');
      return renderBindSectionPanel(pid);
    }
    setView(pid, 'bind');
    return renderBindSectionPanel(pid);
  }

  function refreshChatView(pid){
    pid = String(pid || '').trim();
    if(!pid) return null;
    try{
      var html = renderActivePanel(pid);
      whisper(pid, html);
      return html;
    }catch(e){
      log('fts_mapPointWizard refreshChatView err: ' + e);
      return null;
    }
  }

  /* ======================================================================== */
  /* Shared FTS / Mule Helpers                                                 */
  /* ======================================================================== */

  function ensureState(){
    if(!RT.state) RT.state = {};
    if(!RT.state.fts) RT.state.fts = {};
    if(!RT.state.fts[STATE_ROOT]){
      RT.state.fts[STATE_ROOT] = {
        sessions:{},
        lastSelection:{},
        blankView:{},
        recentMessages:{},
        status:{},
        view:{},
        templateCategory:{},
        templateShowMode:{},
        templateHandout:{},
        poiCategory:{},
        poiHandout:{},
        tradeGroup:{},
        tradeHandout:{},
        reviewHandout:{},
        multiHandout:{},
        customTradeGroups:[]
      };
    }else{
      var S = RT.state.fts[STATE_ROOT];
      if(!S.sessions) S.sessions = {};
      if(!S.lastSelection) S.lastSelection = {};
      if(!S.blankView) S.blankView = {};
      if(!S.recentMessages) S.recentMessages = {};
      if(!S.status) S.status = {};
      if(!S.view) S.view = {};
      if(!S.templateCategory) S.templateCategory = {};
      if(!S.templateShowMode) S.templateShowMode = {};
      if(!S.templateHandout) S.templateHandout = {};
      if(!S.poiCategory) S.poiCategory = {};
      if(!S.poiHandout) S.poiHandout = {};
      if(!S.tradeGroup) S.tradeGroup = {};
      if(!S.tradeHandout) S.tradeHandout = {};
      if(!S.reviewHandout) S.reviewHandout = {};
      if(!S.multiHandout) S.multiHandout = {};
      if(!S.customTradeGroups) S.customTradeGroups = [];
    }
    syncCustomTradeGroupsFromStateRoot(RT.state.fts[STATE_ROOT]);
    return RT.state.fts[STATE_ROOT];
  }

  function getOrCreateMule(){
    if(RT.fts && typeof RT.fts.ensureMule === 'function'){
      return RT.fts.ensureMule();
    }
    var mule = findObjs({_type:'character', name:FTS_MULE})[0] || null;
    if(!mule){
      mule = createObj('character', {
        name: FTS_MULE,
        inplayerjournals: '',
        controlledby: '',
        archived: false
      });
    }
    return mule;
  }

  function namedAbilities(character, name){
    if(!character) return [];
    var list = findObjs({ _type:'ability', _characterid:character.id, name:name }) || [];
    list.sort(function(a, b){
      var al = String((a && a.get && a.get('action')) || '').length;
      var bl = String((b && b.get && b.get('action')) || '').length;
      return bl - al;
    });
    return list;
  }

  function getAbilityAction(character, name){
    var ability = namedAbilities(character, name)[0];
    return ability ? String(ability.get('action') || '') : '';
  }

  function upsertAbility(character, name, action){
    if(!character) return;
    var abilities = namedAbilities(character, name);
    if(abilities.length){
      abilities[0].set({ action:String(action || '') });
      for(var i=1;i<abilities.length;i++) abilities[i].remove();
    }else{
      createObj('ability', {
        characterid: character.id,
        name: name,
        action: String(action || ''),
        istokenaction: false
      });
    }
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var raw = getAbilityAction(character, 'version');
    var map = {};
    String(raw || '').split('\n').forEach(function(line){
      line = String(line || '').trim();
      if(!line) return;
      var idx = line.indexOf('=');
      if(idx < 1) return;
      map[normalizeKey(line.slice(0, idx)).replace(/_/g, '')] = String(line.slice(idx + 1) || '').trim();
    });
    map[normalizeKey(moduleKey).replace(/_/g, '')] = String(moduleVersion || '').trim();
    var out = [];
    Object.keys(map).sort().forEach(function(key){
      if(key && map[key]) out.push(key + '=' + map[key]);
    });
    upsertAbility(character, 'version', out.join('\n'));
  }

  function emptyLibraryRoot(){
    return {
      schema:'fts.mapPointWizard.root.v1',
      version:VERSION,
      instances:{}
    };
  }

  function loadLibraryRoot(){
    var mule = getOrCreateMule();
    var root = safeParseJSON(getAbilityAction(mule, LIBRARY_ABILITY), null);
    if(!root || typeof root !== 'object' || Array.isArray(root) || root.schema !== 'fts.mapPointWizard.root.v1'){
      root = emptyLibraryRoot();
    }
    if(!root.instances || typeof root.instances !== 'object' || Array.isArray(root.instances)) root.instances = {};
    root.version = VERSION;
    return root;
  }

  function saveLibraryRoot(root){
    root = root || emptyLibraryRoot();
    root.schema = 'fts.mapPointWizard.root.v1';
    root.version = VERSION;
    upsertAbility(getOrCreateMule(), LIBRARY_ABILITY, JSON.stringify(root, null, 2));
    return root;
  }

  function instanceStorageKey(tokenId, pageId){
    return String(pageId || '') + '::' + String(tokenId || '');
  }

  function storedInstanceForToken(tokenId, pageId){
    var root = loadLibraryRoot();
    return root.instances[instanceStorageKey(tokenId, pageId)] || null;
  }

  function saveInstanceForToken(tokenId, pageId, data){
    var root = loadLibraryRoot();
    root.instances[instanceStorageKey(tokenId, pageId)] = {
      token_id: String(tokenId || ''),
      page_id: String(pageId || ''),
      updated_at: (new Date()).toISOString(),
      data: snapshotData(data)
    };
    saveLibraryRoot(root);
  }

  /* ======================================================================== */
  /* Region / Template Loading                                                */
  /* ======================================================================== */

  function normalizeTemplateCategoryKey(value){
    value = normalizeKey(value || '');
    return TEMPLATE_CATEGORY_MAP[value] ? value : '';
  }

  function resolveTemplateCategory(value){
    var key = normalizeTemplateCategoryKey(value);
    return key ? TEMPLATE_CATEGORY_MAP[key] : null;
  }

  function templateCategoryLabel(categoryKey){
    var category = resolveTemplateCategory(categoryKey);
    return category ? category.label : titleCaseToken(categoryKey);
  }

  function templateCategoryDescription(categoryKey){
    var category = resolveTemplateCategory(categoryKey);
    return category ? category.desc : '';
  }

  function pointTypeRecord(value){
    var key = normalizeKey(value || '');
    return POINT_TYPE_MAP[key] || null;
  }

  function pointTypeValue(value){
    var record = pointTypeRecord(value);
    return record ? record.key : '';
  }

  function pointTypeLabel(value){
    var record = pointTypeRecord(value);
    return record ? record.label : titleCaseToken(value);
  }

  function defaultPointTypeForCategory(categoryKey){
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    if(categoryKey === 'cities_towns_villages') return 'settlement';
    if(categoryKey === 'temples_towers_guildhalls') return 'temple';
    if(categoryKey === 'forts_keeps_defenses') return 'fort';
    if(categoryKey === 'trade_travel_infrastructure') return 'tradepost';
    if(categoryKey === 'lairs_ruins_dungeons') return 'ruin';
    if(categoryKey === 'natural_points_of_interest') return 'outpost';
    if(categoryKey === 'underdark_locations') return 'outpost';
    if(categoryKey === 'underwater_locations') return 'port';
    return 'settlement';
  }

  function demographicTemplateNote(categoryKey){
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    if(categoryKey === 'cities_towns_villages'){
      return 'Settlement defaults follow medieval ranges: villages (roughly 50-300), towns (~1,000-8,000), cities (~8,000+).';
    }
    if(categoryKey === 'temples_towers_guildhalls'){
      return 'Institution defaults assume low resident populations with service demand driven by visitors and attached labor.';
    }
    if(categoryKey === 'forts_keeps_defenses'){
      return 'Defense-site defaults use garrison-scale populations and logistics demand instead of broad civilian markets.';
    }
    if(categoryKey === 'trade_travel_infrastructure'){
      return 'Travel and trade defaults emphasize throughput and services over large permanent resident populations.';
    }
    if(categoryKey === 'lairs_ruins_dungeons'){
      return 'Hazard-site defaults keep resident counts low and preserve flexibility for encounter-driven customization.';
    }
    if(categoryKey === 'natural_points_of_interest'){
      return 'Natural landmark defaults model strategic geography first; resident counts are optional and typically low.';
    }
    if(categoryKey === 'underdark_locations'){
      return 'Underdark defaults are route-constrained and support deep-network logistics with adaptable social overlays.';
    }
    if(categoryKey === 'underwater_locations'){
      return 'Underwater defaults prioritize constrained movement, specialized support, and localized transport pressure.';
    }
    return 'Template defaults are editable and intended as a starting point.';
  }

  function clampValue(n, min, max){
    n = parseFloat(n);
    if(!isFinite(n)) n = min;
    if(n < min) return min;
    if(n > max) return max;
    return n;
  }

  function roundToStep(n, step){
    step = Math.max(1, asInt(step) || 1);
    return Math.round(n / step) * step;
  }

  function populationRoundStep(avg){
    avg = Math.max(0, asInt(avg) || 0);
    if(avg >= 20000) return 500;
    if(avg >= 8000) return 250;
    if(avg >= 1500) return 100;
    if(avg >= 400) return 50;
    if(avg >= 120) return 25;
    return 10;
  }

  function templatePopulationAverage(value){
    var n = asInt(value);
    if(n === null || n < 0) return 0;
    return n;
  }

  function templatePopulationRange(avg, categoryKey){
    avg = templatePopulationAverage(avg);
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    if(avg <= 0){
      return { min:0, max:0, avg:0, label:'0-0 (0)' };
    }
    var spread = 0.34;
    if(categoryKey === 'cities_towns_villages') spread = 0.30;
    else if(categoryKey === 'forts_keeps_defenses') spread = 0.28;
    else if(categoryKey === 'lairs_ruins_dungeons') spread = 0.45;
    else if(categoryKey === 'natural_points_of_interest') spread = 0.50;
    else if(categoryKey === 'underdark_locations' || categoryKey === 'underwater_locations') spread = 0.38;
    var step = populationRoundStep(avg);
    var min = Math.max(0, roundToStep(avg * (1 - spread), step));
    var max = Math.max(min, roundToStep(avg * (1 + spread), step));
    return {
      min:min,
      max:max,
      avg:avg,
      label:String(min) + '-' + String(max) + ' (' + String(avg) + ')'
    };
  }

  function wealthNarrativeExample(value){
    value = String(value || '').trim();
    if(value === '1') return 'Subsistence economy focused on staples, repairs, and local barter.';
    if(value === '2') return 'Modest coin flow where practical goods move reliably and luxuries are scarce.';
    if(value === '3') return 'Stable market activity with dependable artisans, services, and reserve stock.';
    if(value === '4') return 'Prosperous location with broad specialist access and regular imported wares.';
    if(value === '5') return 'High-surplus economy with elite demand, deep reserves, and premium services.';
    return 'Economy not yet classified.';
  }

  function developmentNarrativeExample(value){
    value = String(value || '').trim();
    if(value === '1') return 'Sparse infrastructure and mostly local self-support.';
    if(value === '2') return 'Foundational roads, storage, and civic organization.';
    if(value === '3') return 'Established institutions and dependable market logistics.';
    if(value === '4') return 'Expanded administration, specialists, and trade coordination.';
    if(value === '5') return 'Mature high-capacity systems with broad strategic reach.';
    return 'Development tier not set.';
  }

  function tradeCuDurabilityNote(groupKey, stance, localeKey){
    groupKey = String(groupKey || '').trim();
    stance = lower(stance);
    localeKey = canonicalLocaleKey(localeKey || '');
    if(groupKey === 'foodstuffs'){
      if(localeKey === 'coastal' || localeKey === 'underwater'){
        return '1 CU typically feeds or provisions about 25 residents for one month, including preserved fish and oils.';
      }
      return '1 CU typically feeds or provisions about 25 residents for one month.';
    }
    if(groupKey === 'metals_and_minerals'){
      return '1 CU of bulk salt, ore, or ingots usually supports one medium workshop chain for about two months.';
    }
    if(groupKey === 'tools_and_craft_goods'){
      return '1 CU of carpenter and builder tools usually supports one 4-person crew for one season before refill.';
    }
    if(groupKey === 'fuel_and_light'){
      return '1 CU of lamp oil, charcoal, and fuel stock usually supports about 20 households for one month.';
    }
    if(groupKey === 'services'){
      return '1 CU represents roughly one month of contracted routine civic and market labor capacity.';
    }
    if(groupKey === 'vessel_supplies'){
      return '1 CU of rope, pitch, and sail-repair stock usually supports 2-3 medium vessels for one month.';
    }
    if(groupKey === 'weapons_and_ammunition' || groupKey === 'military_supplies'){
      return '1 CU usually arms and sustains about one 20-person guard unit for one campaign month.';
    }
    if(stance === 'needs'){
      return '1 CU marks baseline monthly operational demand for this location.';
    }
    return '1 CU marks one typical month of trade throughput for this category.';
  }

  function tradeScaleFactor(population, development, wealth){
    var pop = Math.max(0, templatePopulationAverage(population));
    var dev = asInt(development); if(dev === null) dev = 3;
    var wth = asInt(wealth); if(wth === null) wth = 3;
    var popFactor = pop > 0 ? Math.sqrt(Math.max(1, pop) / 700) : 0.45;
    var factor = popFactor * (1 + ((dev - 3) * 0.12)) * (1 + ((wth - 3) * 0.10));
    return clampValue(factor, 0.4, 5);
  }

  function scaledCu(baseCu, factor){
    var n = parseFloat(baseCu);
    if(!isFinite(n) || n <= 0) return '';
    var out = normalizeCargoUnits(n * factor);
    return out || '0.1';
  }

  function templateTradeEntry(stance, groupKey, windows, localeKey, scaleFactor, noteText){
    windows = Array.isArray(windows) ? windows : [];
    var entry = {
      stance:String(stance || ''),
      goodKey:tradeGroupTargetKey(groupKey),
      windows:[]
    };
    var periods = {};
    var periodNotes = {};
    for(var i=0;i<windows.length;i++){
      var row = windows[i] || {};
      var windowKey = String(row.key || '').trim();
      var cu = scaledCu(row.cu, scaleFactor);
      if(!windowKey || !cu) continue;
      var targetPeriods = [];
      if(findByKey(WINDOW_PRESETS, windowKey)){
        entry.windows.push({ key:windowKey, cu:cu });
        targetPeriods = expandWindowKey(windowKey);
      }else if(findByKey(CALENDAR_PERIODS, windowKey)){
        periods[windowKey] = cu;
        targetPeriods = [windowKey];
      }
      var note = String((row && row.note) || noteText || '').trim();
      if(note){
        for(var pi=0;pi<targetPeriods.length;pi++){
          periodNotes[targetPeriods[pi]] = note;
        }
      }
    }
    if(Object.keys(periods).length) entry.periods = periods;
    if(Object.keys(periodNotes).length) entry.periodNotes = periodNotes;
    return entry;
  }

  function mergeTradeWindowRows(existingRows, incomingRows){
    existingRows = Array.isArray(existingRows) ? existingRows : [];
    incomingRows = Array.isArray(incomingRows) ? incomingRows : [];
    var merged = {};
    var order = [];

    function ingest(row){
      row = row || {};
      var key = String(row.key || '').trim();
      if(!key) return;
      if(!findByKey(WINDOW_PRESETS, key) && !findByKey(CALENDAR_PERIODS, key)) return;
      var cu = normalizeCargoUnits(row.cu);
      if(!cu) return;
      var note = String(row.note || '').trim();
      if(!Object.prototype.hasOwnProperty.call(merged, key)){
        merged[key] = { key:key, cu:cu };
        if(note) merged[key].note = note;
        order.push(key);
        return;
      }
      var existing = parseFloat(merged[key].cu || '0');
      var next = parseFloat(cu || '0');
      if(isFinite(next) && (!isFinite(existing) || next > existing)){
        merged[key].cu = normalizeNumberString(next);
      }
      if(note){
        merged[key].note = note;
      }
    }

    existingRows.forEach(ingest);
    incomingRows.forEach(ingest);

    return order.map(function(key){
      return merged[key];
    });
  }

  function addTemplateTradeSeed(seedMap, stance, groupKey, windows){
    stance = lower(stance);
    groupKey = String(groupKey || '').trim();
    if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return;
    if(!TRADE_GOOD_GROUP_MAP[groupKey]) return;
    var key = stance + '::' + groupKey;
    seedMap[key] = mergeTradeWindowRows(seedMap[key] || [], windows || []);
  }

  function scaleCuValue(cu, multiplier, minimum){
    var n = parseFloat(cu);
    if(!isFinite(n) || n <= 0) return '';
    multiplier = parseFloat(multiplier);
    if(!isFinite(multiplier) || multiplier <= 0) multiplier = 1;
    minimum = parseFloat(minimum);
    if(!isFinite(minimum) || minimum <= 0) minimum = 0.1;
    var next = Math.round(n * multiplier * 10) / 10;
    if(next < minimum) next = minimum;
    return normalizeNumberString(next);
  }

  function cuFromPoiCount(count, divisor, minValue, maxValue){
    count = normalizePoiCount(count);
    divisor = parseFloat(divisor);
    if(!isFinite(divisor) || divisor <= 0) divisor = 1;
    minValue = parseFloat(minValue);
    if(!isFinite(minValue) || minValue <= 0) minValue = 0.1;
    maxValue = parseFloat(maxValue);
    if(!isFinite(maxValue) || maxValue <= 0) maxValue = 999;
    if(count <= 0) return '';
    var out = count / divisor;
    if(out < minValue) out = minValue;
    if(out > maxValue) out = maxValue;
    out = Math.round(out * 10) / 10;
    return normalizeNumberString(out);
  }

  function addCategoryTradeSeeds(seedMap, categoryKey, localeKey){
    var coastal = (localeKey === 'coastal' || localeKey === 'offshore');
    var underwater = localeKey === 'underwater';
    var underdark = localeKey === 'underdark';

    if(categoryKey === 'cities_towns_villages'){
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [{ key:'spring', cu:'4' }, { key:'summer', cu:'5' }, { key:'autumn', cu:'5' }, { key:'winter', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'4' }]);
      addTemplateTradeSeed(seedMap, 'has', 'household_and_civic_goods', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'metals_and_minerals', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'textiles_and_leather', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'2' }]);
    }else if(categoryKey === 'temples_towers_guildhalls'){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'has', 'alchemy_and_medicine', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'textiles_and_leather', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'household_and_civic_goods', [{ key:'annual', cu:'1' }]);
    }else if(categoryKey === 'forts_keeps_defenses'){
      addTemplateTradeSeed(seedMap, 'has', 'military_supplies', [{ key:'annual', cu:'4' }]);
      addTemplateTradeSeed(seedMap, 'has', 'weapons_and_ammunition', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'has', 'armor_and_protection', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'4' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'metals_and_minerals', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'2' }]);
    }else if(categoryKey === 'trade_travel_infrastructure'){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'5' }]);
      addTemplateTradeSeed(seedMap, 'has', 'vehicles_and_transport', [{ key:'spring', cu:'4' }, { key:'summer', cu:'5' }, { key:'autumn', cu:'4' }]);
      addTemplateTradeSeed(seedMap, 'has', 'household_and_civic_goods', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'raw_materials', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'2' }]);
    }else if(categoryKey === 'lairs_ruins_dungeons'){
      addTemplateTradeSeed(seedMap, 'has', 'contraband', [{ key:'autumn', cu:'1' }, { key:'winter', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'has', 'raw_materials', [{ key:'spring', cu:'2' }, { key:'summer', cu:'2' }, { key:'autumn', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'weapons_and_ammunition', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'1' }]);
    }else if(categoryKey === 'natural_points_of_interest'){
      addTemplateTradeSeed(seedMap, 'has', 'raw_materials', [{ key:'spring', cu:'3' }, { key:'summer', cu:'4' }, { key:'autumn', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [{ key:'spring', cu:'2' }, { key:'summer', cu:'3' }, { key:'autumn', cu:'2' }, { key:'winter', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'services', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'vehicles_and_transport', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'1' }]);
    }else if(categoryKey === 'underdark_locations'){
      addTemplateTradeSeed(seedMap, 'has', 'metals_and_minerals', [{ key:'annual', cu:'4' }]);
      addTemplateTradeSeed(seedMap, 'has', 'contraband', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'has', 'tools_and_craft_goods', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'alchemy_and_medicine', [{ key:'annual', cu:'1' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'textiles_and_leather', [{ key:'annual', cu:'2' }]);
    }else if(categoryKey === 'underwater_locations'){
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [{ key:'spring', cu:'4' }, { key:'summer', cu:'5' }, { key:'autumn', cu:'4' }, { key:'winter', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'has', 'alchemy_and_medicine', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:'2' }, { key:'summer', cu:'3' }, { key:'autumn', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'tools_and_craft_goods', [{ key:'annual', cu:'3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'textiles_and_leather', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'metals_and_minerals', [{ key:'annual', cu:'2' }]);
    }else{
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'1' }]);
    }

    if(coastal || underwater){
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:'2' }, { key:'summer', cu:'3' }, { key:'autumn', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'vehicles_and_transport', [{ key:'annual', cu:'2' }]);
    }
    if(underdark){
      addTemplateTradeSeed(seedMap, 'has', 'metals_and_minerals', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2' }]);
    }
  }

  function addTemplateSpecificTradeSeeds(seedMap, templateKey, localeKey){
    if(templateKey === 'fishing_village'){
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [
        { key:'spring', cu:'5.5', note:'Fish and fish-oil production ramps in spring fleets.' },
        { key:'summer', cu:'8', note:'Peak fisheries, curing, and salting output.' },
        { key:'autumn', cu:'6.2', note:'Preserved catch and render stock before winter.' },
        { key:'winter', cu:'3.2', note:'Cold-season inshore catch and preserved stores.' }
      ]);
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:'2.5' }, { key:'summer', cu:'3.2' }, { key:'autumn', cu:'2.4' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'textiles_and_leather', [{ key:'annual', cu:'2.3', note:'Netting, sailcloth, and weatherproof leatherwork.' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'metals_and_minerals', [{ key:'annual', cu:'2.2', note:'Hooks, salt, and fittings for preservation and rigging.' }]);
    }else if(templateKey === 'shipyard' || templateKey === 'dockyard' || templateKey === 'subterranean_port'){
      addTemplateTradeSeed(seedMap, 'has', 'vehicles_and_transport', [{ key:'spring', cu:'4.5' }, { key:'summer', cu:'5.5' }, { key:'autumn', cu:'4.8' }]);
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:'3.5' }, { key:'summer', cu:'4.5' }, { key:'autumn', cu:'3.6' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'raw_materials', [{ key:'annual', cu:'3.2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'2.6' }]);
    }else if(templateKey === 'caravanserai' || templateKey === 'waystation' || templateKey === 'bridgehead'){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'4.2' }]);
      addTemplateTradeSeed(seedMap, 'has', 'vehicles_and_transport', [{ key:'spring', cu:'2.5' }, { key:'summer', cu:'3' }, { key:'autumn', cu:'2.6' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'2.5' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'1.8' }]);
    }else if(templateKey === 'citadel' || templateKey === 'fortress' || templateKey === 'border_fort'){
      addTemplateTradeSeed(seedMap, 'has', 'military_supplies', [{ key:'annual', cu:'5' }]);
      addTemplateTradeSeed(seedMap, 'has', 'weapons_and_ammunition', [{ key:'annual', cu:'4.2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'4.6' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'2.4' }]);
    }else if(templateKey === 'monastery' || templateKey === 'temple_complex'){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'3.3' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'2.8' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'textiles_and_leather', [{ key:'annual', cu:'1.8' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'household_and_civic_goods', [{ key:'annual', cu:'1.3' }]);
    }else if(templateKey === 'university' || templateKey === 'arcane_tower'){
      addTemplateTradeSeed(seedMap, 'has', 'alchemy_and_medicine', [{ key:'annual', cu:'2.1' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:'1.5' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'2' }]);
    }

    if(localeKey === 'offshore' || localeKey === 'coastal' || localeKey === 'underwater'){
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:'2.2' }, { key:'summer', cu:'3.2' }, { key:'autumn', cu:'2.4' }]);
    }
  }

  function poiCountMaps(list){
    var byCategory = {};
    var byKey = {};
    normalizePoiEntries(list || []).forEach(function(entry){
      var categoryKey = normalizePoiCategoryKey(entry.category || '');
      var key = normalizeKey(entry.key || '');
      var count = normalizePoiCount(entry.count);
      if(!categoryKey || !key || count <= 0) return;
      byCategory[categoryKey] = (byCategory[categoryKey] || 0) + count;
      byKey[key] = (byKey[key] || 0) + count;
    });
    return { category:byCategory, key:byKey };
  }

  function addPoiDrivenTradeSeeds(seedMap, poiList, localeKey){
    var maps = poiCountMaps(poiList || []);
    var category = maps.category;
    var key = maps.key;
    var coastal = (localeKey === 'coastal' || localeKey === 'offshore');
    var underwater = localeKey === 'underwater';
    var underdark = localeKey === 'underdark';

    var foodSites = category.food_production_distribution || 0;
    if(foodSites > 0){
      var foodBase = cuFromPoiCount(foodSites, 3.6, 0.8, 8);
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [
        { key:'spring', cu:scaleCuValue(foodBase, 1.15, 0.8) },
        { key:'summer', cu:scaleCuValue(foodBase, 1.35, 1) },
        { key:'autumn', cu:scaleCuValue(foodBase, 1.2, 0.9) },
        { key:'winter', cu:scaleCuValue(foodBase, 0.75, 0.6) }
      ]);
      addTemplateTradeSeed(seedMap, 'wants', 'tools_and_craft_goods', [{ key:'annual', cu:cuFromPoiCount(foodSites, 5.5, 0.8, 4) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:cuFromPoiCount(foodSites, 6.2, 0.8, 3.2) }]);
    }

    var craftSites = category.crafting_manufacturing || 0;
    if(craftSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'tools_and_craft_goods', [{ key:'annual', cu:cuFromPoiCount(craftSites, 3.3, 0.8, 7) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'raw_materials', [{ key:'annual', cu:cuFromPoiCount(craftSites, 3.6, 0.8, 6) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'metals_and_minerals', [{ key:'annual', cu:cuFromPoiCount(craftSites, 4.4, 0.7, 5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:cuFromPoiCount(craftSites, 5.5, 0.7, 4) }]);
    }

    var tradeSites = category.trade_commerce || 0;
    if(tradeSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:cuFromPoiCount(tradeSites, 2.8, 1, 8) }]);
      addTemplateTradeSeed(seedMap, 'has', 'household_and_civic_goods', [{ key:'annual', cu:cuFromPoiCount(tradeSites, 4.5, 0.8, 5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(tradeSites, 6.2, 0.6, 3.5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'vehicles_and_transport', [{ key:'annual', cu:cuFromPoiCount(tradeSites, 5.5, 0.8, 4) }]);
    }

    var hospitalitySites = category.hospitality_vice || 0;
    if(hospitalitySites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:cuFromPoiCount(hospitalitySites, 3, 0.8, 6) }]);
      addTemplateTradeSeed(seedMap, 'has', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(hospitalitySites, 6.5, 0.6, 3) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:cuFromPoiCount(hospitalitySites, 3.7, 0.8, 5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:cuFromPoiCount(hospitalitySites, 5.4, 0.6, 3.2) }]);
    }

    var civicSites = category.civic_government || 0;
    if(civicSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:cuFromPoiCount(civicSites, 3.8, 0.7, 5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'household_and_civic_goods', [{ key:'annual', cu:cuFromPoiCount(civicSites, 4.8, 0.7, 4) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:cuFromPoiCount(civicSites, 5.5, 0.6, 3.2) }]);
    }

    var militarySites = category.military_establishments || 0;
    if(militarySites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'military_supplies', [{ key:'annual', cu:cuFromPoiCount(militarySites, 2.2, 1.2, 9) }]);
      addTemplateTradeSeed(seedMap, 'has', 'weapons_and_ammunition', [{ key:'annual', cu:cuFromPoiCount(militarySites, 2.8, 1, 8) }]);
      addTemplateTradeSeed(seedMap, 'has', 'armor_and_protection', [{ key:'annual', cu:cuFromPoiCount(militarySites, 3.6, 0.8, 6) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:cuFromPoiCount(militarySites, 2.7, 1.1, 7) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:cuFromPoiCount(militarySites, 3.8, 0.8, 5) }]);
    }

    var religiousSites = category.religious_cultural || 0;
    if(religiousSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:cuFromPoiCount(religiousSites, 4.2, 0.7, 4) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:cuFromPoiCount(religiousSites, 4.5, 0.7, 4) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(religiousSites, 7.2, 0.5, 2.5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'household_and_civic_goods', [{ key:'annual', cu:cuFromPoiCount(religiousSites, 6.2, 0.5, 3) }]);
    }

    var magicalSites = category.magical_infrastructure || 0;
    if(magicalSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'alchemy_and_medicine', [{ key:'annual', cu:cuFromPoiCount(magicalSites, 2.8, 0.8, 5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'metals_and_minerals', [{ key:'annual', cu:cuFromPoiCount(magicalSites, 4.7, 0.6, 3.5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(magicalSites, 5.8, 0.6, 3) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:cuFromPoiCount(magicalSites, 5.5, 0.6, 3) }]);
    }

    var transportSites = category.transport_animal_services || 0;
    if(transportSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'vehicles_and_transport', [{ key:'spring', cu:cuFromPoiCount(transportSites, 2.9, 0.8, 6) }, { key:'summer', cu:cuFromPoiCount(transportSites, 2.6, 1, 7) }, { key:'autumn', cu:cuFromPoiCount(transportSites, 3, 0.9, 6.2) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'livestock_and_mounts', [{ key:'annual', cu:cuFromPoiCount(transportSites, 5.5, 0.6, 3.5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:cuFromPoiCount(transportSites, 5.2, 0.7, 3.5) }]);
      if(coastal || underwater){
        addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:cuFromPoiCount(transportSites, 4.2, 0.8, 5) }, { key:'summer', cu:cuFromPoiCount(transportSites, 3.8, 1, 6) }, { key:'autumn', cu:cuFromPoiCount(transportSites, 4.1, 0.8, 5.2) }]);
      }
    }

    var hiddenSites = category.power_hidden_structures || 0;
    if(hiddenSites > 0){
      addTemplateTradeSeed(seedMap, 'has', 'contraband', [{ key:'annual', cu:cuFromPoiCount(hiddenSites, 4.8, 0.5, 3.5) }]);
      addTemplateTradeSeed(seedMap, 'has', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(hiddenSites, 6.8, 0.5, 3) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'services', [{ key:'annual', cu:cuFromPoiCount(hiddenSites, 5.8, 0.5, 3) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'weapons_and_ammunition', [{ key:'annual', cu:cuFromPoiCount(hiddenSites, 7.5, 0.4, 2.5) }]);
    }

    var fishIndustry = (key.fishery || 0) + (key.fish_market || 0) + (key.fish_oil_renderer || 0);
    if(fishIndustry > 0){
      var fishCu = cuFromPoiCount(fishIndustry, 2.2, 1.1, 8);
      addTemplateTradeSeed(seedMap, 'has', 'foodstuffs', [
        { key:'spring', cu:scaleCuValue(fishCu, 1.1, 1) },
        { key:'summer', cu:scaleCuValue(fishCu, 1.3, 1.2) },
        { key:'autumn', cu:scaleCuValue(fishCu, 1.2, 1.1) },
        { key:'winter', cu:scaleCuValue(fishCu, 0.8, 0.7) }
      ]);
      addTemplateTradeSeed(seedMap, 'needs', 'metals_and_minerals', [{ key:'annual', cu:cuFromPoiCount(fishIndustry, 5.5, 0.7, 3) }]);
    }

    var shipIndustry = (key.shipwright_yard || 0) + (key.dockyard || 0) + (key.drydock || 0) + (key.military_shipyard || 0) + (key.pier_complex || 0) + (key.cargo_dock || 0);
    if(shipIndustry > 0){
      addTemplateTradeSeed(seedMap, 'has', 'vehicles_and_transport', [{ key:'spring', cu:cuFromPoiCount(shipIndustry, 2.2, 1, 7) }, { key:'summer', cu:cuFromPoiCount(shipIndustry, 1.9, 1.2, 8) }, { key:'autumn', cu:cuFromPoiCount(shipIndustry, 2.3, 1, 7.2) }]);
      addTemplateTradeSeed(seedMap, 'has', 'vessel_supplies', [{ key:'spring', cu:cuFromPoiCount(shipIndustry, 2.5, 0.9, 6) }, { key:'summer', cu:cuFromPoiCount(shipIndustry, 2.1, 1.1, 7) }, { key:'autumn', cu:cuFromPoiCount(shipIndustry, 2.6, 0.9, 6.2) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'raw_materials', [{ key:'annual', cu:cuFromPoiCount(shipIndustry, 3.6, 1, 6.5) }]);
    }

    var smithIndustry = (key.armorer_forge || 0) + (key.weaponsmith_forge || 0) + (key.blacksmith_forge || 0);
    if(smithIndustry > 0){
      addTemplateTradeSeed(seedMap, 'has', 'armor_and_protection', [{ key:'annual', cu:cuFromPoiCount(smithIndustry, 3.8, 0.6, 4.5) }]);
      addTemplateTradeSeed(seedMap, 'has', 'weapons_and_ammunition', [{ key:'annual', cu:cuFromPoiCount(smithIndustry, 3.5, 0.8, 5.5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'metals_and_minerals', [{ key:'annual', cu:cuFromPoiCount(smithIndustry, 2.8, 0.9, 6) }]);
    }

    var arcaneComplex = (key.arcane_academy || 0) + (key.arcane_guildhall || 0) + (key.mage_tower || 0) + (key.teleportation_circle || 0) + (key.ritual_complex || 0);
    if(arcaneComplex > 0){
      addTemplateTradeSeed(seedMap, 'has', 'alchemy_and_medicine', [{ key:'annual', cu:cuFromPoiCount(arcaneComplex, 2.4, 0.8, 5.5) }]);
      addTemplateTradeSeed(seedMap, 'wants', 'luxury_goods_and_art', [{ key:'annual', cu:cuFromPoiCount(arcaneComplex, 4.4, 0.6, 3.5) }]);
      addTemplateTradeSeed(seedMap, 'needs', 'metals_and_minerals', [{ key:'annual', cu:cuFromPoiCount(arcaneComplex, 4.1, 0.6, 3.8) }]);
    }

    if((category.offense_types || 0) > 0 || (category.defense_types || 0) > 0){
      addTemplateTradeSeed(seedMap, 'wants', 'military_supplies', [{ key:'annual', cu:'1.4' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'weapons_and_ammunition', [{ key:'annual', cu:'1.2' }]);
    }

    if(coastal || underwater){
      addTemplateTradeSeed(seedMap, 'needs', 'vessel_supplies', [{ key:'spring', cu:'1.2' }, { key:'summer', cu:'1.6' }, { key:'autumn', cu:'1.2' }]);
    }
    if(underdark){
      addTemplateTradeSeed(seedMap, 'has', 'contraband', [{ key:'annual', cu:'1.5' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'fuel_and_light', [{ key:'annual', cu:'1.8' }]);
    }
  }

  function templateCategoryTradeDefaults(categoryKey, templateKey, localeKey, population, development, wealth, poiList){
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    templateKey = normalizeKey(templateKey || '');
    localeKey = canonicalLocaleKey(localeKey || '');
    var scaleFactor = tradeScaleFactor(population, development, wealth);
    var seedMap = {};
    var out = [];
    var stanceOrder = { has:0, wants:1, needs:2 };

    addCategoryTradeSeeds(seedMap, categoryKey, localeKey);
    addTemplateSpecificTradeSeeds(seedMap, templateKey, localeKey);
    addPoiDrivenTradeSeeds(seedMap, poiList || [], localeKey);

    if(!Object.keys(seedMap).length){
      addTemplateTradeSeed(seedMap, 'has', 'services', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'wants', 'foodstuffs', [{ key:'annual', cu:'2' }]);
      addTemplateTradeSeed(seedMap, 'needs', 'tools_and_craft_goods', [{ key:'annual', cu:'1' }]);
    }

    Object.keys(seedMap).sort(function(left, right){
      var leftParts = String(left || '').split('::');
      var rightParts = String(right || '').split('::');
      var leftStance = leftParts[0] || '';
      var rightStance = rightParts[0] || '';
      var leftGroup = leftParts[1] || '';
      var rightGroup = rightParts[1] || '';
      var stanceCmp = (Object.prototype.hasOwnProperty.call(stanceOrder, leftStance) ? stanceOrder[leftStance] : 99)
        - (Object.prototype.hasOwnProperty.call(stanceOrder, rightStance) ? stanceOrder[rightStance] : 99);
      if(stanceCmp !== 0) return stanceCmp;
      return alphaNumericCompare(tradeGoodGroupLabel(leftGroup), tradeGoodGroupLabel(rightGroup));
    }).forEach(function(seedKey){
      var parts = String(seedKey || '').split('::');
      var stance = parts[0] || '';
      var groupKey = parts[1] || '';
      if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return;
      if(!TRADE_GOOD_GROUP_MAP[groupKey]) return;
      out.push(templateTradeEntry(
        stance,
        groupKey,
        seedMap[seedKey] || [],
        localeKey,
        scaleFactor,
        tradeCuDurabilityNote(groupKey, stance, localeKey)
      ));
    });

    return normalizeTradeGoods(out);
  }

  function recommendedTradeProfileForData(data){
    data = snapshotData(data || {});
    var template = resolveTemplateRecord(data.template || '');
    var categoryKey = normalizeTemplateCategoryKey((template && template.categoryKey) || data.template_category || '');
    var templateKey = normalizeKey((template && template.templateKey) || '');
    var localeKey = canonicalLocaleKey(data.locale || '');
    var development = String(data.development || recommendedDevelopmentForPopulation(data.population));
    var wealth = String(data.wealth || recommendedWealthForPopulation(data.population, localeKey, categoryKey));
    return normalizeTradeGoods(templateCategoryTradeDefaults(
      categoryKey,
      templateKey,
      localeKey,
      data.population,
      development,
      wealth,
      data.poi || []
    ) || []);
  }

  function mergeAutoTradeWithPreservedCustomTrade(autoTrade, existingTrade){
    var autoList = normalizeTradeGoods(autoTrade || []);
    var preservedCustom = normalizeTradeGoods(existingTrade || []).filter(function(entry){
      var groupKey = tradeGroupKeyFromTarget((entry && entry.goodKey) || '');
      return /^custom_/i.test(String(groupKey || ''));
    });
    return normalizeTradeGoods(autoList.concat(preservedCustom));
  }

  function reapplyPoiDrivenTradeProfile(session){
    if(!session || !session.data) return;
    var next = snapshotData(session.data);
    var autoTrade = recommendedTradeProfileForData(next);
    next.tradeGoods = mergeAutoTradeWithPreservedCustomTrade(autoTrade, next.tradeGoods || []);
    session.data = snapshotData(next);
  }

  function militaryDefaults(categoryKey, localeKey){
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    localeKey = canonicalLocaleKey(localeKey || '');
    var out = {
      offense_types:['militia', 'scouts'],
      defense_types:['patrols', 'alarm_network']
    };
    if(categoryKey === 'forts_keeps_defenses'){
      out.offense_types = ['trained_guard', 'militia', 'scouts'];
      out.defense_types = ['walls', 'gatehouses', 'watchtowers', 'patrols'];
    }
    if(categoryKey === 'lairs_ruins_dungeons'){
      out.offense_types = ['raiders', 'saboteurs', 'skirmishers'];
      out.defense_types = ['hidden_channels', 'safehouses', 'natural_barriers'];
    }
    if(categoryKey === 'underdark_locations'){
      out.offense_types = ['trained_guard', 'raiders', 'spellcasters'];
      out.defense_types = ['patrols', 'spell_wards', 'natural_barriers'];
    }
    if(localeKey === 'coastal' || localeKey === 'offshore' || localeKey === 'underwater'){
      out.offense_types = uniqueStrings((out.offense_types || []).concat(['marines']));
      out.defense_types = uniqueStrings((out.defense_types || []).concat(['harbor_patrols']));
    }
    return out;
  }

  function templatePoiEntry(category, key, count, label){
    return {
      category: normalizePoiCategoryKey(category),
      key: normalizeKey(key || label || ''),
      label: String(label || '').trim(),
      count: normalizePoiCount(count)
    };
  }

  function mdmeWatchCount(pop){
    pop = Math.max(0, templatePopulationAverage(pop));
    return Math.max(1, Math.round(pop / 150));
  }

  function mdmeMilitiaCount(pop){
    pop = Math.max(0, templatePopulationAverage(pop));
    return Math.max(1, Math.round(pop * 0.05));
  }

  function mdmeLevyCount(pop){
    pop = Math.max(0, templatePopulationAverage(pop));
    return Math.max(1, Math.round(pop * 0.10));
  }

  function poiScaledCount(pop, development, wealth, divisor, base, minValue, maxValue){
    pop = Math.max(0, templatePopulationAverage(pop));
    development = asInt(development); if(development === null) development = 3;
    wealth = asInt(wealth); if(wealth === null) wealth = 3;
    divisor = parseFloat(divisor); if(!isFinite(divisor) || divisor <= 0) divisor = 1;
    base = parseFloat(base); if(!isFinite(base)) base = 0;
    minValue = asInt(minValue); if(minValue === null || minValue < 0) minValue = 0;
    maxValue = asInt(maxValue);
    var raw = (pop / divisor) + base + ((development - 3) * 0.35) + ((wealth - 3) * 0.22);
    var out = Math.round(raw);
    if(out < minValue) out = minValue;
    if(maxValue !== null && maxValue > 0 && out > maxValue) out = maxValue;
    return out;
  }

  function baselinePoiCounts(population, development, wealth){
    var pop = Math.max(0, templatePopulationAverage(population));
    var dev = asInt(development); if(dev === null) dev = 3;
    var wth = asInt(wealth); if(wth === null) wth = 3;
    var guard = mdmeWatchCount(pop);
    return {
      population: pop,
      development: dev,
      wealth: wth,
      guard: guard,
      militia: mdmeMilitiaCount(pop),
      levy: mdmeLevyCount(pop),
      farmstead: poiScaledCount(pop, dev, wth, 260, 1.0, 1, null),
      fishery: poiScaledCount(pop, dev, wth, 3200, 0.0, 0, null),
      bakery: poiScaledCount(pop, dev, wth, 1400, 0.5, 1, null),
      butcher: poiScaledCount(pop, dev, wth, 1800, 0.4, 1, null),
      market: poiScaledCount(pop, dev, wth, 1800, 0.4, 1, null),
      generalStore: poiScaledCount(pop, dev, wth, 1500, 0.5, 1, null),
      inn: poiScaledCount(pop, dev, wth, 2300, 0.3, 1, null),
      tavern: poiScaledCount(pop, dev, wth, 1800, 0.4, 1, null),
      blacksmith: poiScaledCount(pop, dev, wth, 2600, 0.2, 1, null),
      carpenter: poiScaledCount(pop, dev, wth, 2200, 0.2, 1, null),
      tailor: poiScaledCount(pop, dev, wth, 2900, 0.1, 1, null),
      temple: poiScaledCount(pop, dev, wth, 2400, 0.3, 1, null),
      shrine: poiScaledCount(pop, dev, wth, 1200, 0.6, 1, null),
      stables: poiScaledCount(pop, dev, wth, 3000, 0.1, 1, null),
      warehouse: poiScaledCount(pop, dev, wth, 3200, 0.1, 1, null),
      watchPost: Math.max(1, Math.round(guard / 12)),
      guardBarracks: Math.max(1, Math.round(guard / 20)),
      watchtower: Math.max(1, Math.round(guard / 24)),
      gatehouse: Math.max(1, Math.round(guard / 35)),
      signalBeacon: Math.max(1, Math.round(guard / 40))
    };
  }

  function templateCategoryPoiDefaults(categoryKey, templateKey, localeKey, population, development, wealth){
    categoryKey = normalizeTemplateCategoryKey(categoryKey);
    templateKey = normalizeKey(templateKey || '');
    localeKey = canonicalLocaleKey(localeKey || '');
    var military = militaryDefaults(categoryKey, localeKey);
    var counts = baselinePoiCounts(population, development, wealth);
    var coastal = (localeKey === 'coastal' || localeKey === 'offshore');
    var underwater = localeKey === 'underwater';
    var underdark = localeKey === 'underdark';
    var out = [];

    function add(category, key, count, label){
      count = normalizePoiCount(count);
      if(count <= 0) return;
      if(!normalizePoiCategoryKey(category)) return;
      if(!normalizeKey(key || label || '')) return;
      out.push(templatePoiEntry(category, key, count, label));
    }

    function addSettlementCore(){
      add('food_production_distribution', 'farmstead', counts.farmstead);
      add('food_production_distribution', 'grain_mill', Math.max(1, Math.round(counts.farmstead / 3)));
      add('food_production_distribution', 'bakery', counts.bakery);
      add('food_production_distribution', 'butcher_shop', counts.butcher);
      add('food_production_distribution', 'granary', Math.max(1, Math.round(counts.market / 2)));
      add('crafting_manufacturing', 'blacksmith_forge', counts.blacksmith);
      add('crafting_manufacturing', 'carpenter_workshop', counts.carpenter);
      add('crafting_manufacturing', 'tailor_shop', counts.tailor);
      add('trade_commerce', 'general_store', counts.generalStore);
      add('trade_commerce', 'open_air_market', counts.market);
      add('trade_commerce', 'warehouse_complex', counts.warehouse);
      add('hospitality_vice', 'inn', counts.inn);
      add('hospitality_vice', 'tavern', counts.tavern);
      add('civic_government', 'town_hall', 1);
      add('civic_government', 'record_archive', 1);
      add('civic_government', 'watch_post', counts.watchPost);
      add('military_establishments', 'guard_barracks', counts.guardBarracks);
      add('military_establishments', 'watchtower', counts.watchtower);
      add('religious_cultural', 'shrine', counts.shrine);
      add('religious_cultural', 'temple', Math.max(1, Math.round(counts.temple / 2)));
      add('transport_animal_services', 'stables', counts.stables);
      add('transport_animal_services', 'courier_post', Math.max(1, Math.round(counts.stables / 2)));
    }

    function addCoastalCore(){
      add('food_production_distribution', 'fishery', Math.max(1, counts.fishery));
      add('food_production_distribution', 'fish_market', Math.max(1, Math.round(Math.max(1, counts.fishery) / 2)));
      add('transport_animal_services', 'dockyard', Math.max(1, Math.round(counts.market / 2)));
      add('transport_animal_services', 'harbormaster_office', 1);
      add('transport_animal_services', 'lighthouse', 1);
      add('military_establishments', 'naval_barracks', Math.max(1, Math.round(counts.guardBarracks / 2)));
    }

    function addUnderdarkCore(){
      add('food_production_distribution', 'fungal_garden', Math.max(1, Math.round(Math.max(1, counts.farmstead) / 2)));
      add('power_hidden_structures', 'black_market', Math.max(1, Math.round(counts.market / 2)));
      add('military_establishments', 'fort_keep', 1);
      add('magical_infrastructure', 'component_shop', 1);
    }

    function addUnderwaterCore(){
      add('food_production_distribution', 'fishery', Math.max(1, counts.fishery));
      add('food_production_distribution', 'fish_market', Math.max(1, Math.round(Math.max(1, counts.fishery) / 2)));
      add('transport_animal_services', 'dockyard', Math.max(1, Math.round(counts.market / 2)));
      add('transport_animal_services', 'drydock', 1);
      add('military_establishments', 'naval_barracks', Math.max(1, Math.round(counts.guardBarracks / 2)));
      add('military_establishments', 'lighthouse_signal_tower', 1);
    }

    if(categoryKey === 'cities_towns_villages'){
      addSettlementCore();
      if(counts.population >= 600){
        add('religious_cultural', 'temple', Math.max(1, Math.round(counts.temple)));
        add('civic_government', 'courthouse', 1);
      }
      if(counts.population >= 2500){
        add('trade_commerce', 'guild_bank', 1);
        add('hospitality_vice', 'theater', 1);
        add('civic_government', 'city_watch_hq', 1);
      }
      if(counts.population >= 8000){
        add('religious_cultural', 'university_college', 1);
        add('military_establishments', 'citadel', 1);
      }
    }else if(categoryKey === 'temples_towers_guildhalls'){
      add('religious_cultural', 'shrine', 1);
      add('religious_cultural', 'chapel', 1);
      add('religious_cultural', 'temple', 1);
      add('religious_cultural', 'library', 1);
      add('civic_government', 'record_archive', 1);
      add('hospitality_vice', 'boarding_house', 1);
      if(templateKey === 'shrine'){
        add('religious_cultural', 'shrine', 1);
      }else if(templateKey === 'temple_complex'){
        add('religious_cultural', 'temple', 2);
        add('religious_cultural', 'pilgrimage_hostel', 1);
        add('religious_cultural', 'charity_kitchen', 1);
      }else if(templateKey === 'monastery'){
        add('religious_cultural', 'monastery', 1);
        add('religious_cultural', 'scriptorium', 1);
        add('religious_cultural', 'hospice', 1);
      }else if(templateKey === 'guildhall'){
        add('trade_commerce', 'merchants_guildhall', 1);
        add('trade_commerce', 'counting_house', 1);
      }else if(templateKey === 'university'){
        add('religious_cultural', 'university_college', 1);
        add('religious_cultural', 'schoolhouse', 2);
      }else if(templateKey === 'arcane_tower'){
        add('magical_infrastructure', 'mage_tower', 1);
        add('magical_infrastructure', 'arcane_guildhall', 1);
      }else if(templateKey === 'observatory'){
        add('magical_infrastructure', 'scrying_chamber', 1);
      }
      add('military_establishments', 'guard_barracks', 1);
    }else if(categoryKey === 'forts_keeps_defenses'){
      add('military_establishments', 'guard_barracks', Math.max(2, counts.guardBarracks));
      add('military_establishments', 'fort_keep', 1);
      add('military_establishments', 'watchtower', Math.max(2, counts.watchtower));
      add('military_establishments', 'gatehouse', Math.max(1, counts.gatehouse));
      add('military_establishments', 'armory', Math.max(1, Math.round(counts.guardBarracks / 2)));
      add('military_establishments', 'training_grounds', Math.max(1, Math.round(counts.guardBarracks / 2)));
      add('military_establishments', 'supply_depot', 1);
      add('crafting_manufacturing', 'armorer_forge', 1);
      add('crafting_manufacturing', 'weaponsmith_forge', 1);
      add('civic_government', 'watch_post', counts.watchPost);
      if(templateKey === 'citadel' || templateKey === 'fortress'){
        add('military_establishments', 'citadel', 1);
      }
      if(templateKey === 'border_fort'){
        add('military_establishments', 'border_fort', 1);
        add('military_establishments', 'beacon_hill', Math.max(1, counts.signalBeacon));
      }
    }else if(categoryKey === 'trade_travel_infrastructure'){
      add('trade_commerce', 'general_store', Math.max(1, counts.generalStore));
      add('trade_commerce', 'market_square', Math.max(1, counts.market));
      add('trade_commerce', 'caravan_yard', Math.max(1, Math.round(counts.market / 2)));
      add('trade_commerce', 'counting_house', 1);
      add('trade_commerce', 'warehouse_complex', Math.max(1, counts.warehouse));
      add('trade_commerce', 'customs_house', 1);
      add('hospitality_vice', 'inn', Math.max(1, counts.inn));
      add('hospitality_vice', 'roadside_hostel', 1);
      add('transport_animal_services', 'stables', Math.max(1, counts.stables));
      add('transport_animal_services', 'wagon_yard', 1);
      add('transport_animal_services', 'courier_post', 1);
      add('military_establishments', 'guard_barracks', 1);
      add('military_establishments', 'watchtower', 1);
      if(templateKey === 'caravanserai'){
        add('hospitality_vice', 'boarding_house', 1);
        add('transport_animal_services', 'pack_animal_market', 1);
      }
      if(templateKey === 'bridgehead'){
        add('transport_animal_services', 'bridge_tollhouse', 1);
      }
      if(templateKey === 'waystation'){
        add('transport_animal_services', 'waystation_post', 1);
      }
    }else if(categoryKey === 'lairs_ruins_dungeons'){
      add('power_hidden_structures', 'black_market', 1);
      add('power_hidden_structures', 'secret_cult_site', 1);
      add('power_hidden_structures', 'smuggler_tunnel', 1);
      add('power_hidden_structures', 'rebel_hideout', 1);
      add('hospitality_vice', 'smuggler_safehouse', 1);
      add('military_establishments', 'watchtower', 1);
      add('military_establishments', 'field_camp', 1);
      if(templateKey === 'dungeon_complex' || templateKey === 'crypt_tomb_complex'){
        add('magical_infrastructure', 'ritual_complex', 1);
      }
      if(templateKey === 'ruined_city'){
        add('power_hidden_structures', 'thieves_guild_den', 1);
      }
    }else if(categoryKey === 'natural_points_of_interest'){
      add('transport_animal_services', 'waystation_post', 1);
      add('transport_animal_services', 'courier_post', 1);
      add('civic_government', 'watch_post', 1);
      add('military_establishments', 'signal_beacon', 1);
      if(templateKey === 'mountain_pass'){
        add('military_establishments', 'watchtower', 1);
      }
      if(templateKey === 'river_confluence'){
        add('transport_animal_services', 'ferry_landing', 1);
        add('trade_commerce', 'market_square', 1);
        add('food_production_distribution', 'fishery', 1);
      }
      if(templateKey === 'sacred_grove'){
        add('religious_cultural', 'shrine', 1);
        add('religious_cultural', 'pilgrimage_site', 1);
      }
      if(templateKey === 'island_landmark'){
        add('transport_animal_services', 'lighthouse', 1);
      }
    }else if(categoryKey === 'underdark_locations'){
      add('food_production_distribution', 'fungal_garden', Math.max(1, Math.round(counts.farmstead / 2)));
      add('food_production_distribution', 'smokehouse', 1);
      add('crafting_manufacturing', 'blacksmith_forge', Math.max(1, counts.blacksmith));
      add('trade_commerce', 'market_square', Math.max(1, counts.market));
      add('power_hidden_structures', 'black_market', Math.max(1, Math.round(counts.market / 2)));
      add('military_establishments', 'guard_barracks', Math.max(1, counts.guardBarracks));
      add('military_establishments', 'fort_keep', 1);
      add('military_establishments', 'watchtower', Math.max(1, counts.watchtower));
      add('military_establishments', 'armory', 1);
      add('magical_infrastructure', 'component_shop', 1);
      add('magical_infrastructure', 'arcane_guildhall', 1);
      add('transport_animal_services', 'wagon_yard', 1);
      add('transport_animal_services', 'waystation_post', 1);
      if(templateKey === 'subterranean_city'){
        add('civic_government', 'city_watch_hq', 1);
        add('military_establishments', 'citadel', 1);
        add('religious_cultural', 'university_college', 1);
      }
    }else if(categoryKey === 'underwater_locations'){
      add('food_production_distribution', 'fishery', Math.max(1, counts.fishery));
      add('food_production_distribution', 'fish_market', Math.max(1, Math.round(Math.max(1, counts.fishery) / 2)));
      add('food_production_distribution', 'salt_house', 1);
      add('transport_animal_services', 'dockyard', Math.max(1, Math.round(counts.market / 2)));
      add('transport_animal_services', 'drydock', 1);
      add('transport_animal_services', 'pier_complex', 1);
      add('transport_animal_services', 'harbormaster_office', 1);
      add('military_establishments', 'naval_barracks', Math.max(1, Math.round(counts.guardBarracks / 2)));
      add('military_establishments', 'coastal_battery', 1);
      add('military_establishments', 'lighthouse_signal_tower', 1);
      add('magical_infrastructure', 'potion_lab', 1);
      add('magical_infrastructure', 'diviner_parlor', 1);
      if(templateKey === 'underwater_city'){
        add('military_establishments', 'coastal_fort', 1);
        add('military_establishments', 'citadel', 1);
      }
      if(templateKey === 'shipwreck_site' || templateKey === 'sunken_ruin' || templateKey === 'drowned_temple'){
        add('power_hidden_structures', 'smuggler_tunnel', 1);
        add('power_hidden_structures', 'secret_sanctum', 1);
      }
    }else{
      addSettlementCore();
    }

    if(coastal || underwater){
      addCoastalCore();
    }
    if(underdark){
      addUnderdarkCore();
    }
    if(underwater){
      addUnderwaterCore();
    }

    (military.offense_types || []).forEach(function(key){
      add('offense_types', key, 1);
    });
    (military.defense_types || []).forEach(function(key){
      add('defense_types', key, 1);
    });

    return normalizePoiEntries(out);
  }

  function normalizeTradeTemplateDefaults(raw, regionKey, categoryKey, pointType, templateKey){
    var out = normalizePartialData(raw || {});
    categoryKey = normalizeTemplateCategoryKey(categoryKey) || 'cities_towns_villages';
    pointType = pointTypeValue(pointType) || defaultPointTypeForCategory(categoryKey);
    if(!out.point_type) out.point_type = pointType;
    out.point_type = pointTypeValue(out.point_type) || pointType;
    // Template defaults intentionally do not set region/culture/faith/faction.
    if(Object.prototype.hasOwnProperty.call(out, 'region')) delete out.region;
    if(Object.prototype.hasOwnProperty.call(out, 'cultures')) delete out.cultures;
    if(Object.prototype.hasOwnProperty.call(out, 'faiths')) delete out.faiths;
    if(Object.prototype.hasOwnProperty.call(out, 'factions')) delete out.factions;
    if(!out.allies || !out.allies.length) out.allies = [];
    if(!out.enemies || !out.enemies.length) out.enemies = [];
    var military = militaryDefaults(categoryKey, canonicalLocaleKey(out.locale || ''));
    if(!out.offense_types || !out.offense_types.length) out.offense_types = military.offense_types || [];
    if(!out.defense_types || !out.defense_types.length) out.defense_types = military.defense_types || [];
    out.poi = normalizePoiEntries(out.poi || []);
    if(!out.poi.length){
      out.poi = templateCategoryPoiDefaults(
        categoryKey,
        templateKey,
        canonicalLocaleKey(out.locale || ''),
        out.population,
        out.development,
        out.wealth
      );
    }
    out.tradeGoods = normalizeTradeGoods(out.tradeGoods || []);
    if(!out.tradeGoods.length){
      out.tradeGoods = templateCategoryTradeDefaults(
        categoryKey,
        templateKey,
        canonicalLocaleKey(out.locale || ''),
        out.population,
        out.development,
        out.wealth,
        out.poi
      );
    }
    return syncDerivedPartialData(out);
  }

  function templateStorageKey(regionKey, templateKey){
    return (regionKey ? String(regionKey) : 'builtin') + '::' + String(templateKey || '');
  }

  function normalizeTradeTemplate(raw, regionKey){
    raw = raw || {};
    var key = normalizeKey(raw.key || raw.label || raw.name || '');
    if(!key) return null;
    var label = String(raw.label || raw.name || titleCaseToken(key)).trim();
    var categoryKey = normalizeTemplateCategoryKey(raw.category || raw.categoryKey || '')
      || normalizeTemplateCategoryKey(raw.group || '')
      || 'cities_towns_villages';
    var pointType = pointTypeValue((raw.defaults || {}).point_type || raw.point_type || '')
      || defaultPointTypeForCategory(categoryKey);
    var defaults = normalizeTradeTemplateDefaults(raw.defaults || {}, regionKey, categoryKey, pointType, key);
    var popRange = templatePopulationRange(defaults.population, categoryKey);
    return {
      key: templateStorageKey(regionKey, key),
      templateKey: key,
      regionKey: String(regionKey || ''),
      label: label,
      displayLabel: label,
      categoryKey: categoryKey,
      categoryLabel: templateCategoryLabel(categoryKey),
      pointType: pointType,
      demographicNote: String(raw.demographicNote || raw.statNote || demographicTemplateNote(categoryKey)).trim(),
      populationRange: String(raw.populationRange || raw.population_range || popRange.label || '').trim(),
      populationMin: popRange.min,
      populationMax: popRange.max,
      populationAvg: popRange.avg,
      desc: String(raw.summary || raw.desc || raw.description || '').trim(),
      defaults: defaults
    };
  }

  function builtInTradeTemplates(){
    var out = [];
    for(var i=0;i<BASE_TRADE_TEMPLATES_RAW.length;i++){
      var template = normalizeTradeTemplate(BASE_TRADE_TEMPLATES_RAW[i], '');
      if(template) out.push(template);
    }
    out.sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
    return out;
  }

  function mergeTemplateRecords(baseList, extraList){
    var merged = {};
    baseList = Array.isArray(baseList) ? baseList : [];
    extraList = Array.isArray(extraList) ? extraList : [];

    baseList.forEach(function(template){
      if(template) merged[String(template.templateKey || template.key || '')] = template;
    });
    extraList.forEach(function(template){
      if(template) merged[String(template.templateKey || template.key || '')] = template;
    });

    return Object.keys(merged).map(function(key){
      return merged[key];
    }).sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  function loadKnownRegions(){
    var mule = getOrCreateMule();
    var root = null;
    try{
      if(RT.fts_weather && typeof RT.fts_weather.getUnifiedRegionsRoot === 'function'){
        root = RT.fts_weather.getUnifiedRegionsRoot();
      }
    }catch(e0){
      root = null;
    }
    if(!root || typeof root !== 'object' || Array.isArray(root)){
      root = safeParseJSON(getAbilityAction(mule, 'regions'), { schema:'fts.regions.root.v1', regions:{} });
    }
    if(!root || typeof root !== 'object' || Array.isArray(root)){
      root = { schema:'fts.regions.root.v1', regions:{} };
    }
    if(!root.regions || typeof root.regions !== 'object' || Array.isArray(root.regions)){
      root.regions = {};
    }
    var out = {};
    var regions = (root && root.regions && typeof root.regions === 'object' && !Array.isArray(root.regions)) ? root.regions : {};

    Object.keys(regions).forEach(function(rawKey){
      var payload = regions[rawKey];
      if(!payload || typeof payload !== 'object' || Array.isArray(payload)) return;

      var regionKey = canonicalRegionKey(payload.region || rawKey);
      if(!regionKey) return;

      var localeDefs = {};
      var locales = [];
      var rawDefs = (payload.localeDefinitions && typeof payload.localeDefinitions === 'object' && !Array.isArray(payload.localeDefinitions))
        ? payload.localeDefinitions
        : {};

      (Array.isArray(payload.locales) ? payload.locales : []).forEach(function(rawLocale){
        var localeKey = canonicalLocaleKey(rawLocale);
        if(!localeKey || locales.indexOf(localeKey) !== -1) return;
        locales.push(localeKey);
        var def = rawDefs[localeKey] || {};
        var base = defaultLocaleDefinition(localeKey);
        localeDefs[localeKey] = {
          key: localeKey,
          label: String(def.label || base.label || localeKey).trim()
        };
      });

      var rawTradePoints = (payload.tradePoints && typeof payload.tradePoints === 'object' && !Array.isArray(payload.tradePoints))
        ? payload.tradePoints
        : {};
      var tradeTemplates = [];
      (Array.isArray(rawTradePoints.templates) ? rawTradePoints.templates : []).forEach(function(templateRaw){
        var template = normalizeTradeTemplate(templateRaw, regionKey);
        if(template) tradeTemplates.push(template);
      });
      tradeTemplates.sort(function(a, b){
        return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
      });

      out[regionKey] = {
        regionKey: regionKey,
        displayName: String(payload.displayName || payload.region || rawKey).trim(),
        defaultLocale: canonicalLocaleKey(payload.defaultLocale || ''),
        locales: locales,
        localeDefinitions: localeDefs,
        tradeTemplates: tradeTemplates
      };
    });

    return out;
  }

  function templateRecordsForRegion(regionKey){
    var builtIns = builtInTradeTemplates();
    var known = loadKnownRegions();
    var canonicalRegion = canonicalRegionKey(regionKey);
    if(!canonicalRegion || !known[canonicalRegion]){
      return builtIns;
    }
    return mergeTemplateRecords(builtIns, known[canonicalRegion].tradeTemplates || []);
  }

  function regionOptions(){
    var known = loadKnownRegions();
    var keys = Object.keys(known);
    var out = [];
    for(var i=0;i<keys.length;i++){
      out.push({ key: keys[i], label: known[keys[i]].displayName || keys[i] });
    }
    out.sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
    return out;
  }

  function localeOptionsForRegion(regionKey){
    var known = loadKnownRegions();
    var region = known[canonicalRegionKey(regionKey)] || null;
    if(!region) return [];
    var out = [];
    for(var i=0;i<region.locales.length;i++){
      var localeKey = region.locales[i];
      var def = region.localeDefinitions[localeKey] || defaultLocaleDefinition(localeKey);
      out.push({ key: localeKey, label: def.label || titleCaseToken(localeKey) });
    }
    out.sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
    return out;
  }

  function resolveRegionLabel(regionKey){
    var known = loadKnownRegions();
    var region = known[canonicalRegionKey(regionKey)] || null;
    return region ? (region.displayName || regionKey) : titleCaseToken(regionKey);
  }

  function resolveLocaleLabel(regionKey, localeKey){
    var options = localeOptionsForRegion(regionKey);
    for(var i=0;i<options.length;i++){
      if(options[i].key === localeKey) return options[i].label;
    }
    return titleCaseToken(localeKey);
  }

  function resolveTemplateRecord(templateKey){
    var builtIns = builtInTradeTemplates();
    for(var bi=0;bi<builtIns.length;bi++){
      if(builtIns[bi].key === templateKey) return builtIns[bi];
    }
    var known = loadKnownRegions();
    var keys = Object.keys(known);
    for(var i=0;i<keys.length;i++){
      var templates = known[keys[i]].tradeTemplates || [];
      for(var j=0;j<templates.length;j++){
        if(templates[j].key === templateKey) return templates[j];
      }
    }
    return null;
  }

  function templateOptionsForSession(session){
    var out = [];
    var selectedRegion = canonicalRegionKey((session && session.data && session.data.region) || '');
    templateRecordsForRegion(selectedRegion).forEach(function(template){
      out.push({ key:template.key, label:template.label });
    });
    return out;
  }

  function templateLocaleKey(template){
    var locale = (template && template.defaults && template.defaults.locale) || '';
    return canonicalLocaleKey(locale);
  }

  function templateLocaleCompatible(templateLocale, selectedLocale){
    templateLocale = canonicalLocaleKey(templateLocale || '');
    selectedLocale = canonicalLocaleKey(selectedLocale || '');
    if(!selectedLocale || !templateLocale) return true;
    if(templateLocale === selectedLocale) return true;
    var allowed = {
      inland:['inland'],
      coastal:['coastal', 'offshore'],
      offshore:['offshore', 'coastal'],
      underdark:['underdark'],
      underwater:['underwater']
    };
    var list = allowed[selectedLocale] || [selectedLocale];
    return list.indexOf(templateLocale) !== -1;
  }

  function templateRecordsByCategoryForSession(session, categoryKey, showMode){
    categoryKey = normalizeTemplateCategoryKey(categoryKey || '');
    showMode = String(showMode || 'filtered').toLowerCase();
    if(showMode !== 'all') showMode = 'filtered';
    var selectedRegion = canonicalRegionKey((session && session.data && session.data.region) || '');
    var selectedLocale = canonicalLocaleKey((session && session.data && session.data.locale) || '');
    var records = templateRecordsForRegion(selectedRegion);
    if(categoryKey){
      records = records.filter(function(template){
        return String(template.categoryKey || '') === categoryKey;
      });
    }
    if(showMode !== 'all'){
      records = records.filter(function(template){
        return templateLocaleCompatible(templateLocaleKey(template), selectedLocale);
      });
    }
    return records.sort(function(a, b){
      var popA = templatePopulationAverage((a && a.defaults && a.defaults.population) || 0);
      var popB = templatePopulationAverage((b && b.defaults && b.defaults.population) || 0);
      if(popA !== popB) return popA - popB;
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  // Template buttons need a safer resolution path than other single-choice
  // fields because the stored keys include a namespace separator ("::").
  function resolveTemplateChoice(session, value){
    value = String(value || '').trim();
    if(!value) return null;
    var direct = resolveTemplateRecord(value);
    if(direct) return direct;

    var options = templateRecordsForRegion((session && session.data && session.data.region) || '');
    var normalizedValue = normalizeKey(value);
    for(var i=0;i<options.length;i++){
      var template = options[i];
      if(String(template.templateKey || '') === value) return template;
      if(normalizeKey(template.templateKey || '') === normalizedValue) return template;
      if(normalizeKey(template.label || '') === normalizedValue) return template;
    }
    return null;
  }

  /* ======================================================================== */
  /* Session Model                                                             */
  /* ======================================================================== */

  function defaultSessionData(token, page){
    var data = {
      name: (token && token.get('name')) ? String(token.get('name') || '').trim() : '',
      template: '',
      template_category: '',
      point_type: '',
      region: '',
      locale: '',
      depth_elevation: '0',
      population: '',
      development: '3',
      wealth: '3',
      cultures: [],
      faiths: [],
      factions: [],
      allies: [],
      enemies: [],
      offense_level: '1',
      offense_types: [],
      defense_level: '1',
      defense_types: [],
      poi: [],
      tradeGoods: []
    };

    try{
      if(page && RT.fts_mapMeta && typeof RT.fts_mapMeta.parsePageName === 'function'){
        var parsed = RT.fts_mapMeta.parsePageName(page.get('name') || '', getOrCreateMule(), { allowMissingDepth:true });
        if(parsed && parsed.region_valid && parsed.region_key) data.region = parsed.region_key;
        if(parsed && parsed.locale_valid && parsed.locale_key) data.locale = parsed.locale_key;
      }
    }catch(e){
      log('fts_mapPointWizard defaultSessionData parsePageName err: ' + e);
    }

    return data;
  }

  function currentSession(pid){
    return ensureState().sessions[String(pid || '')] || null;
  }

  function storeSession(pid, session){
    ensureState().sessions[String(pid || '')] = session;
    setBlankView(pid, false);
  }

  function clearSession(pid){
    delete ensureState().sessions[String(pid || '')];
    destroyTemplateHandout(pid);
    destroyPoiHandout(pid);
    destroyTradeHandout(pid);
    destroyReviewHandout(pid);
    destroyAllMultiHandouts(pid);
    setTemplateShowMode(pid, 'filtered');
    setBlankView(pid, true);
  }

  function currentStatus(pid){
    return ensureState().status[String(pid || '')] || null;
  }

  function clearStatus(pid){
    delete ensureState().status[String(pid || '')];
  }

  function setStatus(pid, level, text){
    text = String(text || '').trim();
    if(!text){
      clearStatus(pid);
      return;
    }
    ensureState().status[String(pid || '')] = {
      level: lower(level || 'info'),
      text: text
    };
  }

  function clearPendingFinishChoice(session){
    if(session && session.pendingFinishChoice){
      delete session.pendingFinishChoice;
    }
  }

  function clearPendingSanityChoice(session){
    if(session && session.pendingSanityChoice){
      delete session.pendingSanityChoice;
    }
  }

  function clearPendingTemplateApply(session){
    if(session && session.pendingTemplateApply){
      delete session.pendingTemplateApply;
    }
  }

  function clearTemplateAppliedSummary(session){
    if(session && session.lastAppliedTemplate){
      delete session.lastAppliedTemplate;
    }
  }

  function setTemplateAppliedSummary(session, template){
    if(!session) return;
    template = template || {};
    var data = session.data || {};
    session.lastAppliedTemplate = {
      key: String(template.key || ''),
      label: String(template.displayLabel || template.label || template.key || 'Template'),
      category: String(template.categoryKey || data.template_category || ''),
      categoryLabel: String(template.categoryLabel || templateCategoryLabel(data.template_category || '') || ''),
      pointType: String(data.point_type || template.pointType || ''),
      description: String(template.desc || ''),
      demographicNote: String(template.demographicNote || demographicTemplateNote(template.categoryKey || data.template_category || '')),
      region: String(data.region || ''),
      locale: String(data.locale || ''),
      population: String(data.population || ''),
      populationRange: String(template.populationRange || templatePopulationRange(data.population || 0, template.categoryKey || data.template_category || '').label || ''),
      development: String(data.development || ''),
      wealth: String(data.wealth || ''),
      poiEntries: normalizePoiEntries(data.poi || []).length,
      militarySites: poiEntriesForCategory(data.poi || [], 'military_establishments').reduce(function(total, entry){
        return total + normalizePoiCount(entry.count);
      }, 0),
      tradeCategories: normalizeTradeGoods(data.tradeGoods || []).length
    };
  }

  function selectedTokenFromEntries(entries){
    entries = Array.isArray(entries) ? entries : [];
    for(var i=0;i<entries.length;i++){
      var entry = entries[i];
      if(!entry || !entry._id || !entry._type) continue;
      var obj = getObj(entry._type, entry._id);
      if(obj && obj.get('type') === 'graphic') return obj;
    }
    return null;
  }

  function selectedTokenFromMessage(msg){
    return selectedTokenFromEntries((msg && msg.selected) || []);
  }

  function cacheSelection(pid, msg){
    if(!msg || !msg.selected) return;
    var out = [];
    for(var i=0;i<msg.selected.length;i++){
      var s = msg.selected[i];
      if(!s || !s._id || !s._type) continue;
      out.push({ _id:s._id, _type:s._type });
    }
    if(out.length){
      ensureState().lastSelection[String(pid || '')] = out;
    }
  }

  function lastSelectedTokenForPlayer(pid){
    var entries = ensureState().lastSelection[String(pid || '')] || [];
    return selectedTokenFromEntries(entries);
  }

  function clearCachedSelection(pid){
    delete ensureState().lastSelection[String(pid || '')];
  }

  function clearMapRecordSelection(pid){
    try{
      var mapRecords = getMapRecordsState();
      if(mapRecords && mapRecords.lastSelection){
        delete mapRecords.lastSelection[String(pid || '')];
      }
    }catch(e){
      log('fts_mapPointWizard clearMapRecordSelection err: ' + e);
    }
  }

  function shouldIgnoreRapidRepeat(pid, content){
    var stateRoot = ensureState();
    var recent = stateRoot.recentMessages || {};
    var now = Date.now();
    var key = String(pid || '') + '::' + String(content || '');
    var last = recent[key] || 0;
    Object.keys(recent).forEach(function(entryKey){
      if(now - recent[entryKey] > 5000) delete recent[entryKey];
    });
    recent[key] = now;
    stateRoot.recentMessages = recent;
    return !!last && (now - last) < 750;
  }

  function getSelectedTokenForPlayer(pid, msg){
    if(msg && msg.selected && msg.selected.length){
      cacheSelection(pid, msg);
      return selectedTokenFromEntries(msg.selected);
    }
    return lastSelectedTokenForPlayer(pid);
  }

  function getEffectivePageId(pid){
    if(RT.fts && typeof RT.fts.getEffectivePageId === 'function'){
      return String(RT.fts.getEffectivePageId(pid) || '');
    }
    try{
      var campaign = Campaign();
      var specific = campaign.get('playerspecificpages') || {};
      if(pid && specific[pid]) return String(specific[pid] || '');
      return String(campaign.get('playerpageid') || '');
    }catch(e){
      return '';
    }
  }

  function getMapMetaState(){
    if(!RT.state) RT.state = {};
    if(!RT.state.fts) RT.state.fts = {};
    if(!RT.state.fts.mapmeta){
      RT.state.fts.mapmeta = { last:null, byPage:{}, flash:{}, namingWarn:{} };
    }
    if(!RT.state.fts.mapmeta.byPage) RT.state.fts.mapmeta.byPage = {};
    return RT.state.fts.mapmeta;
  }

  function getMapRecordsState(){
    if(!RT.state) RT.state = {};
    if(!RT.state.fts) RT.state.fts = {};
    if(!RT.state.fts.mapRecords){
      RT.state.fts.mapRecords = { routes:{}, points:{}, currentRoute:{}, lastSelection:{} };
    }
    if(!RT.state.fts.mapRecords.routes) RT.state.fts.mapRecords.routes = {};
    if(!RT.state.fts.mapRecords.points) RT.state.fts.mapRecords.points = {};
    return RT.state.fts.mapRecords;
  }

  function mapKeyFromPageMeta(meta, page){
    var name = '';
    if(meta){
      name = String(meta.name || meta.raw_name || meta.page_name || '');
      if(!name && meta.id) return 'map' + String(meta.id || '');
    }
    if(!name && page){
      name = String(page.get('name') || '');
      if(!name && page.id) return 'map' + String(page.id || '');
    }
    return lower(name).replace(/[^a-z0-9]+/g, '');
  }

  function pageMetaForPage(page){
    if(!page) return null;
    var meta = getMapMetaState().byPage[String(page.id || '')] || null;
    if(meta) return meta;
    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.parsePageName === 'function'){
        return RT.fts_mapMeta.parsePageName(page.get('name') || '', getOrCreateMule(), { allowMissingDepth:true });
      }
    }catch(e){}
    return null;
  }

  function contextPageForWizard(pid, session){
    var page = null;
    if(session && session.pageId){
      page = getObj('page', session.pageId);
      if(page) return page;
    }
    var token = lastSelectedTokenForPlayer(pid);
    if(token){
      page = getObj('page', token.get('pageid') || '');
      if(page) return page;
    }
    var pageId = getEffectivePageId(pid);
    return pageId ? getObj('page', pageId) : null;
  }

  function summarizeContextLabels(labels, emptyText){
    labels = Array.isArray(labels) ? labels : [];
    if(!labels.length) return muted('<i>' + esc(emptyText) + '</i>');
    var out = [];
    for(var i=0;i<labels.length && i<6;i++){
      out.push(badge(labels[i]));
    }
    if(labels.length > 6){
      out.push(badge('+' + String(labels.length - 6) + ' more'));
    }
    return '<div style="margin-top:6px;">' + out.join('') + '</div>';
  }

  function resolveExplicitSelectedToken(msg, explicitTokenId){
    explicitTokenId = String(explicitTokenId || '').trim();
    if(/^@\{selected\|token_id\}$/i.test(explicitTokenId)) explicitTokenId = '';
    if(explicitTokenId){
      var explicit = getObj('graphic', explicitTokenId);
      if(explicit && explicit.get('type') === 'graphic') return explicit;
    }
    if(msg && msg.selected && msg.selected.length){
      return selectedTokenFromEntries(msg.selected);
    }
    return null;
  }

  function resolveTokenForStart(pid, msg, explicitTokenId, strictSelection){
    if(strictSelection) return resolveExplicitSelectedToken(msg, explicitTokenId);
    return getSelectedTokenForPlayer(pid, msg);
  }

  function startSession(pid, msg, explicitTokenId, strictSelection){
    var token = resolveTokenForStart(pid, msg, explicitTokenId, strictSelection);
    if(!token) return { error:'Select a token before starting the Map Point Wizard.' };

    var page = getObj('page', token.get('pageid'));
    if(!page) return { error:'The selected token is not on a valid page.' };

    var known = loadKnownRegions();
    if(!Object.keys(known).length){
      return { error:'No regions are loaded yet. Load one or more fts_regionRegionName modules first.' };
    }

    destroyTemplateHandout(pid);
    destroyPoiHandout(pid);
    destroyTradeHandout(pid);
    destroyReviewHandout(pid);
    destroyAllMultiHandouts(pid);

    var session = {
      tokenId: token.id,
      pageId: page.id,
      startedAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
      data: defaultSessionData(token, page)
    };
    var stored = storedInstanceForToken(token.id, page.id);
    if(stored && stored.data){
      session.data = mergeSnapshotIntoData(session.data, stored.data);
    }
    if(!session.data.region){
      var regionKeys = Object.keys(known).sort(function(a, b){
        return alphaNumericCompare(resolveRegionLabel(a), resolveRegionLabel(b));
      });
      if(regionKeys.length){
        session.data.region = String(regionKeys[0] || '');
      }
    }
    if(session.data.region && !session.data.locale){
      var regionRecord = known[canonicalRegionKey(session.data.region)] || known[session.data.region] || null;
      if(regionRecord){
        session.data.locale = String(regionRecord.defaultLocale || '').trim();
      }
    }
    if(session.data && session.data.template){
      var template = resolveTemplateRecord(session.data.template);
      if(template){
        session.data.template_category = template.categoryKey || session.data.template_category || '';
        if(!session.data.point_type) session.data.point_type = template.pointType || '';
        setTemplateAppliedSummary(session, template);
      }else{
        clearTemplateAppliedSummary(session);
      }
    }
    session.sanityNoticeTemplateKey = String((session.data && session.data.template) || '');
    clearPendingSanityChoice(session);
    storeSession(pid, session);
    return { session:session, token:token, page:page };
  }

  function syncSessionToCurrentSelection(pid, msg){
    var selectedToken = selectedTokenFromMessage(msg);
    var session = currentSession(pid);
    if(!selectedToken){
      setBlankView(pid, true);
      return { session:session, blank:true };
    }

    if(session
      && String(session.tokenId || '') === String(selectedToken.id || '')
      && String(session.pageId || '') === String(selectedToken.get('pageid') || '')
    ){
      setBlankView(pid, false);
      return { session:session, blank:false };
    }

    var started = startSession(pid, msg, selectedToken.id);
    if(started.error) return { error:started.error };
    touchSession(started.session);
    storeSession(pid, started.session);
    return { session:started.session, blank:false };
  }

  function touchSession(session){
    session.updatedAt = (new Date()).toISOString();
    session.data = snapshotData(session.data);
    return session;
  }

  /* ======================================================================== */
  /* Trade Goods Data Model                                                    */
  /* ======================================================================== */

  function tradeEntryKey(stance, goodKey){
    return lower(stance) + '::' + String(goodKey || '').trim();
  }

  function tradeEntryFor(list, stance, goodKey){
    list = Array.isArray(list) ? list : [];
    var targetKey = tradeEntryKey(stance, goodKey);
    for(var i=0;i<list.length;i++){
      if(tradeEntryKey(list[i].stance, list[i].goodKey) === targetKey) return list[i];
    }
    return null;
  }

  function normalizeTradeEntry(raw){
    raw = raw || {};
    var stance = lower(raw.stance || '');
    if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return null;

    var goodKey = String(raw.goodKey || '').trim();
    if(!goodKey) return null;
    var groupKey = tradeTargetGroupKey(goodKey);
    if(!groupKey || !TRADE_GOOD_GROUP_MAP[groupKey]) return null;
    var periods = {};
    var windowTotals = normalizedTradeWindowTotals(raw);
    var rawPeriods = (raw.periods && typeof raw.periods === 'object' && !Array.isArray(raw.periods)) ? raw.periods : {};
    var rawPeriodNotes = (raw.periodNotes && typeof raw.periodNotes === 'object' && !Array.isArray(raw.periodNotes)) ? raw.periodNotes : {};
    var periodNotes = {};

    Object.keys(windowTotals).forEach(function(windowKey){
      var distributed = distributedWindowCargoUnits(windowKey, stance, windowTotals[windowKey]);
      Object.keys(distributed).forEach(function(periodKey){
        periods[periodKey] = distributed[periodKey];
      });
    });

    Object.keys(rawPeriods).forEach(function(periodKey){
      if(!findByKey(CALENDAR_PERIODS, periodKey)) return;
      var cu = normalizeCargoUnits(rawPeriods[periodKey]);
      if(!cu) return;
      periods[periodKey] = cu;
    });

    var periodKeys = sortPeriodKeys(Object.keys(periods));
    if(!periodKeys.length) return null;

    var normalizedPeriods = {};
    for(var pk=0;pk<periodKeys.length;pk++){
      normalizedPeriods[periodKeys[pk]] = periods[periodKeys[pk]];
    }

    periodKeys.forEach(function(periodKey){
      var note = stringOrBlank(rawPeriodNotes[periodKey]);
      if(note){
        periodNotes[periodKey] = note;
      }
    });

    Object.keys(windowTotals).forEach(function(windowKey){
      var distributed = distributedWindowCargoUnits(windowKey, stance, windowTotals[windowKey]);
      var periodMatch = true;
      Object.keys(distributed).forEach(function(periodKey){
        if(String(normalizedPeriods[periodKey] || '') !== String(distributed[periodKey] || '')){
          periodMatch = false;
        }
      });
      if(!periodMatch) delete windowTotals[windowKey];
    });

    return {
      id: tradeEntryKey(stance, goodKey),
      stance: stance,
      goodKey: goodKey,
      group: groupKey,
      periodNotes: periodNotes,
      windowTotals: windowTotals,
      periods: normalizedPeriods
    };
  }

  function normalizeTradeGoods(rawList){
    rawList = Array.isArray(rawList) ? rawList : [];
    var merged = {};
    for(var i=0;i<rawList.length;i++){
      var normalized = normalizeTradeEntry(rawList[i]);
      if(!normalized) continue;
      var key = normalized.id;
      if(!merged[key]){
        merged[key] = normalized;
        continue;
      }
      var existingPeriods = merged[key].periods || {};
      var newPeriods = normalized.periods || {};
      var existingPeriodNotes = merged[key].periodNotes || {};
      var newPeriodNotes = normalized.periodNotes || {};
      var existingWindowTotals = merged[key].windowTotals || {};
      var newWindowTotals = normalized.windowTotals || {};
      Object.keys(newPeriods).forEach(function(periodKey){
        existingPeriods[periodKey] = newPeriods[periodKey];
      });
      Object.keys(newPeriodNotes).forEach(function(periodKey){
        existingPeriodNotes[periodKey] = newPeriodNotes[periodKey];
      });
      Object.keys(newWindowTotals).forEach(function(windowKey){
        existingWindowTotals[windowKey] = newWindowTotals[windowKey];
      });
      merged[key].periods = {};
      sortPeriodKeys(Object.keys(existingPeriods)).forEach(function(periodKey){
        merged[key].periods[periodKey] = existingPeriods[periodKey];
      });
      merged[key].periodNotes = {};
      sortPeriodKeys(Object.keys(existingPeriodNotes)).forEach(function(periodKey){
        if(existingPeriods[periodKey] && stringOrBlank(existingPeriodNotes[periodKey])){
          merged[key].periodNotes[periodKey] = stringOrBlank(existingPeriodNotes[periodKey]);
        }
      });
      merged[key].windowTotals = existingWindowTotals;
    }

    var out = Object.keys(merged).map(function(key){ return merged[key]; });
    out.sort(function(a, b){
      var stanceCmp = TRADE_STANCE_ORDER.indexOf(a.stance) - TRADE_STANCE_ORDER.indexOf(b.stance);
      if(stanceCmp !== 0) return stanceCmp;
      var aFirst = sortPeriodKeys(Object.keys(a.periods || {}))[0] || '';
      var bFirst = sortPeriodKeys(Object.keys(b.periods || {}))[0] || '';
      var periodCmp = periodSortValue(aFirst) - periodSortValue(bFirst);
      if(periodCmp !== 0) return periodCmp;
      var groupCmp = alphaNumericCompare(tradeGoodGroupLabel(a.group), tradeGoodGroupLabel(b.group));
      if(groupCmp !== 0) return groupCmp;
      return alphaNumericCompare(tradeGoodLabel(a.goodKey), tradeGoodLabel(b.goodKey));
    });
    return out;
  }

  function tradeEntriesForStance(list, stance){
    return normalizeTradeGoods(list).filter(function(entry){
      return entry.stance === stance;
    }).sort(function(a, b){
      var labelCmp = alphaNumericCompare(tradeGoodLabel(a.goodKey), tradeGoodLabel(b.goodKey));
      if(labelCmp !== 0) return labelCmp;
      var aFirst = sortPeriodKeys(Object.keys((a && a.periods) || {}))[0] || '';
      var bFirst = sortPeriodKeys(Object.keys((b && b.periods) || {}))[0] || '';
      return periodSortValue(aFirst) - periodSortValue(bFirst);
    });
  }

  function periodValuePairs(entry){
    var pairs = [];
    var periods = entry && entry.periods ? entry.periods : {};
    sortPeriodKeys(Object.keys(periods)).forEach(function(periodKey){
      pairs.push({
        period:periodKey,
        cu:periods[periodKey],
        note:stringOrBlank(entry && entry.periodNotes ? entry.periodNotes[periodKey] : '')
      });
    });
    return pairs;
  }

  function tradeScheduleSummary(entry){
    var pairs = periodValuePairs(entry);
    if(!pairs.length) return 'No active windows set.';
    return pairs.map(function(pair){
      var text = periodLabel(pair.period) + ' (' + pair.cu + ' CU)';
      if(pair.note) text += ' Note: ' + pair.note.replace(/[\r\n\u2028]+/g, ' / ');
      return text;
    }).join('; ');
  }

  function tradeScheduleLines(entry){
    var pairs = periodValuePairs(entry);
    if(!pairs.length) return ['No active windows set.'];
    return pairs.map(function(pair){
      var text = periodLabel(pair.period) + ' (' + pair.cu + ' CU)';
      if(pair.note) text += ' Note: ' + pair.note.replace(/[\r\n\u2028]+/g, ' / ');
      return text;
    });
  }

  function tradeScheduleLinesForReview(entry){
    var pairs = periodValuePairs(entry);
    if(!pairs.length) return ['No active windows set.'];
    var out = pairs.map(function(pair){
      return periodLabel(pair.period) + ' (' + pair.cu + ' CU)';
    });
    var notes = templateTradeEntryNote(entry);
    if(notes){
      out.push('Notes: ' + notes);
    }
    return out;
  }

  function tradePeriodState(list, goodKey, periodKey){
    list = normalizeTradeGoods(list);
    for(var i=0;i<TRADE_STANCE_ORDER.length;i++){
      var stance = TRADE_STANCE_ORDER[i];
      var entry = tradeEntryFor(list, stance, goodKey);
      if(entry && entry.periods && entry.periods[periodKey]){
        return {
          stance:stance,
          cu:entry.periods[periodKey],
          note:stringOrBlank(entry.periodNotes ? entry.periodNotes[periodKey] : ''),
          entry:entry
        };
      }
    }
    return null;
  }

  function clearTradePeriodAcrossStances(list, goodKey, periodKey){
    list = Array.isArray(list) ? list : [];
    // A category can only occupy one trade stance for a given visible period.
    for(var i=0;i<TRADE_STANCE_ORDER.length;i++){
      var entry = tradeEntryFor(list, TRADE_STANCE_ORDER[i], goodKey);
      if(entry && entry.periods){
        delete entry.periods[periodKey];
        if(entry.periodNotes) delete entry.periodNotes[periodKey];
        if(entry.windowTotals){
          Object.keys(entry.windowTotals).forEach(function(windowKey){
            var preset = findByKey(WINDOW_PRESETS, windowKey);
            if(preset && preset.periods.indexOf(periodKey) !== -1){
              delete entry.windowTotals[windowKey];
            }
          });
        }
      }
    }
    return list;
  }

  function setExclusiveTradePeriod(list, goodKey, periodKey, stance, cu){
    list = Array.isArray(list) ? list : [];
    clearTradePeriodAcrossStances(list, goodKey, periodKey);
    var entry = tradeEntryFor(list, stance, goodKey);
    if(!entry){
      entry = {
        id:tradeEntryKey(stance, goodKey),
        stance:stance,
        goodKey:goodKey,
        group:tradeTargetGroupKey(goodKey),
        periodNotes:{},
        periods:{}
      };
      list.push(entry);
    }
    entry.periods[periodKey] = cu;
    return normalizeTradeGoods(list);
  }

  function clearExclusiveTradePeriod(list, goodKey, periodKey){
    list = Array.isArray(list) ? list : [];
    clearTradePeriodAcrossStances(list, goodKey, periodKey);
    return normalizeTradeGoods(list);
  }

  function setTradePeriodNoteValue(list, stance, goodKey, periodKey, note){
    list = normalizeTradeGoods(list);
    var entry = tradeEntryFor(list, stance, goodKey);
    if(!entry) return list;
    entry.periodNotes = entry.periodNotes || {};
    note = stringOrBlank(note);
    if(note) entry.periodNotes[periodKey] = note;
    else delete entry.periodNotes[periodKey];
    return normalizeTradeGoods(list);
  }

  function setTradeWindowNotes(list, stance, goodKey, windowKey, note){
    list = normalizeTradeGoods(list);
    var periods = expandWindowKey(windowKey);
    for(var i=0;i<periods.length;i++){
      list = setTradePeriodNoteValue(list, stance, goodKey, periods[i], note);
    }
    return normalizeTradeGoods(list);
  }

  function setTradeWindowTotal(list, stance, goodKey, windowKey, cu){
    list = normalizeTradeGoods(list);
    var entry = tradeEntryFor(list, stance, goodKey);
    var normalizedCu = normalizeCargoUnits(cu);
    windowKey = String(windowKey || '').trim();
    if(!entry || !findByKey(WINDOW_PRESETS, windowKey) || !normalizedCu) return list;
    entry.windowTotals = entry.windowTotals || {};
    entry.windowTotals[windowKey] = normalizedCu;
    return normalizeTradeGoods(list);
  }

  /* ======================================================================== */
  /* Points of Interest Data Model                                             */
  /* ======================================================================== */

  function normalizePoiCategoryKey(value){
    value = normalizeKey(value || '');
    return POI_CATEGORY_MAP[value] ? value : '';
  }

  function poiCategoryLabel(categoryKey){
    var category = POI_CATEGORY_MAP[normalizePoiCategoryKey(categoryKey)];
    return category ? category.label : titleCaseToken(categoryKey);
  }

  function normalizePoiCount(value){
    var n = asInt(value);
    if(n === null || n < 0) return 0;
    return n;
  }

  function poiLibraryEntry(categoryKey, key){
    categoryKey = normalizePoiCategoryKey(categoryKey);
    key = normalizeKey(key || '');
    if(!categoryKey || !key) return null;
    return (POI_LIBRARY_MAP[categoryKey] || {})[key] || null;
  }

  function poiEntryLabel(categoryKey, key, fallback){
    fallback = String(fallback || '').trim();
    if(fallback) return fallback;
    var lib = poiLibraryEntry(categoryKey, key);
    if(lib && lib.label) return String(lib.label);
    return titleCaseToken(key || '');
  }

  function poiEntryId(categoryKey, key){
    return normalizePoiCategoryKey(categoryKey) + '::' + normalizeKey(key || '');
  }

  function normalizePoiEntry(raw){
    raw = raw || {};
    var category = normalizePoiCategoryKey(raw.category || raw.categoryKey || '');
    var key = normalizeKey(raw.key || raw.poiKey || raw.label || '');
    var count = normalizePoiCount(raw.count);
    if(!category || !key || count <= 0) return null;
    return {
      id: poiEntryId(category, key),
      category: category,
      key: key,
      label: poiEntryLabel(category, key, raw.label || raw.name || ''),
      count: count
    };
  }

  function normalizePoiEntries(rawList){
    rawList = Array.isArray(rawList) ? rawList : [];
    var merged = {};
    for(var i=0;i<rawList.length;i++){
      var normalized = normalizePoiEntry(rawList[i]);
      if(!normalized) continue;
      merged[normalized.id] = normalized;
    }
    var out = Object.keys(merged).map(function(id){ return merged[id]; });
    out.sort(function(a, b){
      var categoryCmp = alphaNumericCompare(poiCategoryLabel(a.category), poiCategoryLabel(b.category));
      if(categoryCmp !== 0) return categoryCmp;
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
    return out;
  }

  function poiEntriesForCategory(list, categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey);
    return normalizePoiEntries(list).filter(function(entry){
      return entry.category === categoryKey;
    }).sort(function(a, b){
      if(a.count !== b.count) return b.count - a.count;
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  function poiSetEntry(list, categoryKey, key, label, count){
    list = normalizePoiEntries(list);
    categoryKey = normalizePoiCategoryKey(categoryKey);
    key = normalizeKey(key || label || '');
    count = normalizePoiCount(count);
    if(!categoryKey || !key) return list;
    var id = poiEntryId(categoryKey, key);
    var merged = {};
    for(var i=0;i<list.length;i++){
      merged[list[i].id] = list[i];
    }
    if(count <= 0){
      delete merged[id];
    }else{
      merged[id] = normalizePoiEntry({
        category:categoryKey,
        key:key,
        label:poiEntryLabel(categoryKey, key, label),
        count:count
      });
    }
    return normalizePoiEntries(Object.keys(merged).map(function(entryId){
      return merged[entryId];
    }));
  }

  function poiRemoveEntry(list, categoryKey, key){
    return poiSetEntry(list, categoryKey, key, '', 0);
  }

  function poiCountFor(list, categoryKey, key){
    list = normalizePoiEntries(list);
    var id = poiEntryId(categoryKey, key);
    for(var i=0;i<list.length;i++){
      if(list[i].id === id) return list[i].count;
    }
    return 0;
  }

  function poiCombatPointTotals(list){
    list = normalizePoiEntries(list);
    var totals = { offense:0, defense:0, units:0 };
    for(var i=0;i<list.length;i++){
      var entry = list[i];
      var category = normalizePoiCategoryKey(entry.category || '');
      if(category !== 'military_establishments') continue;
      var lib = poiLibraryEntry(category, entry.key || '');
      if(!lib) continue;
      var count = normalizePoiCount(entry.count);
      if(count <= 0) continue;
      var unitsPerSite = Math.max(0, asInt(lib.units) || 0);
      var siteOffense = Math.max(0, asInt(lib.offense) || 0);
      var siteDefense = Math.max(0, asInt(lib.defense) || 0);
      var unitCapacity = unitsPerSite * count;
      var unitPointScale = Math.max(0, Math.round(unitCapacity / 20));
      totals.units += unitCapacity;
      totals.offense += (siteOffense * count) + Math.max(0, Math.round(unitPointScale * 0.8));
      totals.defense += (siteDefense * count) + unitPointScale;
    }
    return totals;
  }

  function poiKeysForCategory(list, categoryKey){
    return poiEntriesForCategory(list, categoryKey).map(function(entry){
      return normalizeKey(entry.key || '');
    }).filter(function(key){
      return !!key;
    });
  }

  /* ======================================================================== */
  /* Snapshot / Validation / Labels                                            */
  /* ======================================================================== */

  function sortFieldValues(field, values){
    values = uniqueStrings(values || []);
    values.sort(function(a, b){
      return alphaNumericCompare(String(valueLabel(field, a, null) || ''), String(valueLabel(field, b, null) || ''));
    });
    return values;
  }

  function strengthPoints(kind, values){
    values = uniqueStrings(values || []);
    var total = 0;
    var field = kind === 'defense' ? 'defense_types' : 'offense_types';
    for(var i=0;i<values.length;i++){
      total += valueScore(field, values[i]);
    }
    return total;
  }

  function strengthTierValue(points){
    points = asInt(points);
    if(points === null || points < 0) points = 0;
    for(var i=0;i<STRENGTH_SCORE_TIERS.length;i++){
      if(points <= STRENGTH_SCORE_TIERS[i].max) return STRENGTH_SCORE_TIERS[i].value;
    }
    return '5';
  }

  function syncDerivedFields(data){
    data = data || {};
    data.template_category = normalizeTemplateCategoryKey(data.template_category || '');
    data.point_type = pointTypeValue(data.point_type || '');
    if(data.template){
      var templateRecord = resolveTemplateRecord(data.template);
      if(templateRecord){
        if(!data.template_category) data.template_category = templateRecord.categoryKey;
        if(!data.point_type) data.point_type = templateRecord.pointType;
      }
    }
    if(!data.point_type && data.template_category){
      data.point_type = defaultPointTypeForCategory(data.template_category);
    }
    if(!data.point_type){
      data.point_type = defaultPointTypeForCategory(data.template_category || '');
    }
    data.poi = normalizePoiEntries(data.poi || []);
    var poiOffenseKeys = poiKeysForCategory(data.poi, 'offense_types');
    var poiDefenseKeys = poiKeysForCategory(data.poi, 'defense_types');
    data.cultures = sortFieldValues('cultures', data.cultures || []);
    data.faiths = sortFieldValues('faiths', data.faiths || []);
    data.factions = sortFieldValues('factions', data.factions || []);
    data.allies = sortFieldValues('allies', data.allies || []);
    data.enemies = sortFieldValues('enemies', data.enemies || []);
    data.offense_types = sortFieldValues('offense_types', poiOffenseKeys);
    data.defense_types = sortFieldValues('defense_types', poiDefenseKeys);
    var combatTotals = poiCombatPointTotals(data.poi || []);
    data.offense_level = strengthTierValue(strengthPoints('offense', data.offense_types) + combatTotals.offense);
    data.defense_level = strengthTierValue(strengthPoints('defense', data.defense_types) + combatTotals.defense);
    data.tradeGoods = normalizeTradeGoods(data.tradeGoods || []);
    return data;
  }

  function syncDerivedPartialData(out){
    out = out || {};
    if(Object.prototype.hasOwnProperty.call(out, 'template_category')){
      out.template_category = normalizeTemplateCategoryKey(out.template_category || '');
    }
    if(Object.prototype.hasOwnProperty.call(out, 'point_type')){
      out.point_type = pointTypeValue(out.point_type || '');
    }
    if(Object.prototype.hasOwnProperty.call(out, 'template')){
      var templateRecord = resolveTemplateRecord(out.template);
      if(templateRecord){
        if(!Object.prototype.hasOwnProperty.call(out, 'template_category') || !out.template_category){
          out.template_category = templateRecord.categoryKey;
        }
        if(!Object.prototype.hasOwnProperty.call(out, 'point_type') || !out.point_type){
          out.point_type = templateRecord.pointType;
        }
      }
    }
    if(out.template_category && (!out.point_type || !pointTypeRecord(out.point_type))){
      out.point_type = defaultPointTypeForCategory(out.template_category);
    }
    if(Object.prototype.hasOwnProperty.call(out, 'poi')){
      out.poi = normalizePoiEntries(out.poi || []);
      out.offense_types = poiKeysForCategory(out.poi, 'offense_types');
      out.defense_types = poiKeysForCategory(out.poi, 'defense_types');
    }
    if((Object.prototype.hasOwnProperty.call(out, 'point_type') || Object.prototype.hasOwnProperty.call(out, 'template_category')) && !out.point_type){
      out.point_type = defaultPointTypeForCategory(out.template_category || '');
    }
    ['cultures', 'faiths', 'factions', 'allies', 'enemies', 'offense_types', 'defense_types'].forEach(function(field){
      if(Object.prototype.hasOwnProperty.call(out, field)){
        out[field] = sortFieldValues(field, out[field] || []);
      }
    });
    if(Object.prototype.hasOwnProperty.call(out, 'offense_types') || Object.prototype.hasOwnProperty.call(out, 'offense_level')){
      out.offense_level = strengthTierValue(strengthPoints('offense', out.offense_types || []));
    }
    if(Object.prototype.hasOwnProperty.call(out, 'defense_types') || Object.prototype.hasOwnProperty.call(out, 'defense_level')){
      out.defense_level = strengthTierValue(strengthPoints('defense', out.defense_types || []));
    }
    if(
      Object.prototype.hasOwnProperty.call(out, 'poi')
      || Object.prototype.hasOwnProperty.call(out, 'offense_types')
      || Object.prototype.hasOwnProperty.call(out, 'offense_level')
      || Object.prototype.hasOwnProperty.call(out, 'defense_types')
      || Object.prototype.hasOwnProperty.call(out, 'defense_level')
    ){
      var partialCombat = poiCombatPointTotals(out.poi || []);
      out.offense_level = strengthTierValue(strengthPoints('offense', out.offense_types || []) + partialCombat.offense);
      out.defense_level = strengthTierValue(strengthPoints('defense', out.defense_types || []) + partialCombat.defense);
    }
    if(Object.prototype.hasOwnProperty.call(out, 'tradeGoods')){
      out.tradeGoods = normalizeTradeGoods(out.tradeGoods || []);
    }
    return out;
  }

  function snapshotData(raw){
    raw = raw || {};
    return syncDerivedFields({
      name: stringOrBlank(raw.name),
      template: stringOrBlank(raw.template),
      template_category: stringOrBlank(raw.template_category),
      point_type: stringOrBlank(raw.point_type),
      region: stringOrBlank(raw.region),
      locale: stringOrBlank(raw.locale),
      depth_elevation: stringOrBlank(raw.depth_elevation || '0'),
      population: stringOrBlank(raw.population),
      development: stringOrBlank(raw.development),
      wealth: stringOrBlank(raw.wealth),
      cultures: raw.cultures || [],
      faiths: raw.faiths || [],
      factions: raw.factions || [],
      allies: raw.allies || [],
      enemies: raw.enemies || [],
      offense_level: stringOrBlank(raw.offense_level),
      offense_types: raw.offense_types || [],
      defense_level: stringOrBlank(raw.defense_level),
      defense_types: raw.defense_types || [],
      poi: raw.poi || [],
      tradeGoods: raw.tradeGoods || []
    });
  }

  function normalizePartialData(raw){
    raw = raw || {};
    var out = {};
    var keys = ['name', 'template', 'template_category', 'point_type', 'region', 'locale', 'depth_elevation', 'population', 'development', 'wealth', 'offense_level', 'defense_level'];
    for(var i=0;i<keys.length;i++){
      if(Object.prototype.hasOwnProperty.call(raw, keys[i])){
        out[keys[i]] = stringOrBlank(raw[keys[i]]);
      }
    }
    var listKeys = ['cultures', 'faiths', 'factions', 'allies', 'enemies', 'offense_types', 'defense_types'];
    for(var j=0;j<listKeys.length;j++){
      if(Object.prototype.hasOwnProperty.call(raw, listKeys[j])){
        out[listKeys[j]] = raw[listKeys[j]] || [];
      }
    }
    if(Object.prototype.hasOwnProperty.call(raw, 'tradeGoods')){
      out.tradeGoods = raw.tradeGoods || [];
    }
    if(Object.prototype.hasOwnProperty.call(raw, 'poi')){
      out.poi = raw.poi || [];
    }
    return syncDerivedPartialData(out);
  }

  function mergeSnapshotIntoData(base, snapshot){
    var out = snapshotData(base);
    snapshot = snapshot || {};
    var keys = ['name', 'template', 'template_category', 'point_type', 'region', 'locale', 'depth_elevation', 'population', 'development', 'wealth', 'offense_level', 'defense_level'];
    for(var i=0;i<keys.length;i++){
      if(Object.prototype.hasOwnProperty.call(snapshot, keys[i])){
        out[keys[i]] = stringOrBlank(snapshot[keys[i]]);
      }
    }
    var listKeys = ['cultures', 'faiths', 'factions', 'allies', 'enemies', 'offense_types', 'defense_types'];
    for(var j=0;j<listKeys.length;j++){
      if(Object.prototype.hasOwnProperty.call(snapshot, listKeys[j])){
        out[listKeys[j]] = snapshot[listKeys[j]] || [];
      }
    }
    if(Object.prototype.hasOwnProperty.call(snapshot, 'tradeGoods')){
      out.tradeGoods = snapshot.tradeGoods || [];
    }
    if(Object.prototype.hasOwnProperty.call(snapshot, 'poi')){
      out.poi = snapshot.poi || [];
    }
    return syncDerivedFields(out);
  }

  function isStrengthTypeField(field){
    return field === 'offense_types' || field === 'defense_types';
  }

  function parseCustomLibraryValue(field, value){
    value = String(value || '').trim();
    if(value.indexOf('custom::') !== 0) return null;
    var parts = value.split('::');
    var encodedLabel = parts[2] || '';
    var label = '';
    try{
      label = decodeURIComponent(encodedLabel);
    }catch(e){
      label = encodedLabel;
    }
    label = String(label || '').trim();
    if(!label) label = titleCaseToken(parts[1] || 'custom');
    return {
      isCustom:true,
      slug:String(parts[1] || '').trim(),
      label:label,
      score:isStrengthTypeField(field) ? String(Math.max(0, asInt(parts[3]) || 0)) : ''
    };
  }

  function buildCustomLibraryValue(field, label, score){
    label = String(label || '').trim();
    if(!label) return '';
    var slug = normalizeKey(label) || 'custom';
    var value = 'custom::' + slug + '::' + encodeURIComponent(label);
    if(isStrengthTypeField(field)){
      score = asInt(score);
      value += '::' + String(score === null || score < 0 ? 0 : score);
    }
    return value;
  }

  function optionRecordForField(field, value){
    var custom = parseCustomLibraryValue(field, value);
    if(custom) return custom;
    if(field === 'cultures') return findByKey(CULTURES, value) || null;
    if(field === 'faiths') return findByKey(FAITHS, value) || null;
    if(field === 'factions' || field === 'allies' || field === 'enemies') return findByKey(FACTIONS, value) || null;
    if(field === 'offense_types') return findByKey(OFFENSE_TYPES, value) || null;
    if(field === 'defense_types') return findByKey(DEFENSE_TYPES, value) || null;
    return null;
  }

  function valueScore(field, value){
    var record = optionRecordForField(field, value);
    return record ? (asInt(record.score) || 0) : 0;
  }

  function valueLabel(field, value, session){
    var custom = parseCustomLibraryValue(field, value);
    if(custom) return custom.label;
    if(field === 'template'){
      var template = resolveTemplateRecord(value);
      return template ? template.displayLabel : titleCaseToken(value);
    }
    if(field === 'template_category'){
      return templateCategoryLabel(value);
    }
    if(field === 'point_type'){
      return pointTypeLabel(value);
    }
    if(field === 'region') return resolveRegionLabel(value);
    if(field === 'locale') return resolveLocaleLabel((session && session.data && session.data.region) || '', value);
    if(field === 'development') return (tierByValue(DEVELOPMENT_TIERS, value) || {}).label || value;
    if(field === 'wealth') return (tierByValue(WEALTH_TIERS, value) || {}).label || value;
    if(field === 'offense_level') return (tierByValue(STRENGTH_TIERS, value) || {}).label || value;
    if(field === 'defense_level') return (tierByValue(STRENGTH_TIERS, value) || {}).label || value;
    if(field === 'cultures' || field === 'faiths' || field === 'factions' || field === 'allies' || field === 'enemies' || field === 'offense_types' || field === 'defense_types'){
      return ((optionRecordForField(field, value) || {}).label) || titleCaseToken(value);
    }
    return String(value || '');
  }

  function validateAllRequired(session){
    var data = session.data || {};
    if(!String(data.name || '').trim()) return 'Name is required.';
    if(!loadKnownRegions()[canonicalRegionKey(data.region)]) return 'Choose a valid loaded region before saving.';

    var localeOpts = localeOptionsForRegion(data.region);
    var localeOk = false;
    for(var i=0;i<localeOpts.length;i++){
      if(localeOpts[i].key === data.locale){ localeOk = true; break; }
    }
    if(!localeOk) return 'Choose a valid locale for the selected region before saving.';
    if(asInt(data.population) === null || asInt(data.population) < 0) return 'Population must be a whole number equal to or greater than zero.';
    if(!tierByValue(DEVELOPMENT_TIERS, data.development)) return 'Choose a valid development tier before saving.';
    if(!tierByValue(WEALTH_TIERS, data.wealth)) return 'Choose a valid wealth tier before saving.';
    if(!tierByValue(STRENGTH_TIERS, data.offense_level)) return 'Select valid offense types before saving.';
    if(!tierByValue(STRENGTH_TIERS, data.defense_level)) return 'Select valid defense types before saving.';
    if(!normalizeTradeGoods(data.tradeGoods || []).length) return 'Add at least one trade goods entry before saving.';
    return '';
  }

  function manualSanityField(field){
    field = normalizeKey(field || '');
    return field === 'population' || field === 'development' || field === 'wealth' || field === 'locale';
  }

  function assignDirectFieldValue(data, field, value, action){
    data = snapshotData(data || {});
    field = normalizeKey(field || '');
    action = lower(action || '');
    value = decodeCommandValue(value);
    if(field === 'population'){
      var pop = asInt(value);
      if(pop === null || pop < 0) return null;
      data.population = String(pop);
      return data;
    }
    if(action !== 'pick') return null;
    if(field === 'development'){
      if(!tierByValue(DEVELOPMENT_TIERS, value)) return null;
      data.development = String(value);
      return data;
    }
    if(field === 'wealth'){
      if(!tierByValue(WEALTH_TIERS, value)) return null;
      data.wealth = String(value);
      return data;
    }
    if(field === 'locale'){
      if(!value) return null;
      var localeOpts = localeOptionsForRegion(data.region || '');
      var localeOk = false;
      for(var i=0;i<localeOpts.length;i++){
        if(String(localeOpts[i].key || '') === String(value || '')){
          localeOk = true;
          break;
        }
      }
      if(!localeOk) return null;
      data.locale = String(value);
      return data;
    }
    return null;
  }

  function recommendedDevelopmentForPopulation(population){
    var pop = Math.max(0, templatePopulationAverage(population));
    if(pop < 300) return '1';
    if(pop < 1000) return '2';
    if(pop < 4000) return '3';
    if(pop < 12000) return '4';
    return '5';
  }

  function recommendedWealthForPopulation(population, localeKey, categoryKey){
    var pop = Math.max(0, templatePopulationAverage(population));
    var wealth = 1;
    if(pop >= 400) wealth = 2;
    if(pop >= 1800) wealth = 3;
    if(pop >= 7000) wealth = 4;
    if(pop >= 18000) wealth = 5;
    localeKey = canonicalLocaleKey(localeKey || '');
    categoryKey = normalizeTemplateCategoryKey(categoryKey || '');
    if(localeKey === 'coastal' || localeKey === 'offshore') wealth += 1;
    if(localeKey === 'underwater') wealth += 1;
    if(categoryKey === 'forts_keeps_defenses' || categoryKey === 'lairs_ruins_dungeons') wealth -= 1;
    wealth = clampValue(wealth, 1, 5);
    return String(asInt(wealth) || 1);
  }

  function buildSanityRecommendation(data){
    data = snapshotData(data || {});
    var recommendedDev = recommendedDevelopmentForPopulation(data.population);
    var template = resolveTemplateRecord(data.template || '');
    var categoryKey = normalizeTemplateCategoryKey((template && template.categoryKey) || data.template_category || '');
    var localeKey = canonicalLocaleKey(data.locale || '');
    var recommendedWealth = recommendedWealthForPopulation(data.population, localeKey, categoryKey);
    var tradeDefaults = recommendedTradeProfileForData(mergeSnapshotIntoData(data, {
      development:String(recommendedDev || data.development || ''),
      wealth:String(recommendedWealth || data.wealth || '')
    }));
    return {
      development:String(recommendedDev || data.development || ''),
      wealth:String(recommendedWealth || data.wealth || ''),
      tradeGoods:mergeAutoTradeWithPreservedCustomTrade(tradeDefaults, data.tradeGoods || [])
    };
  }

  function buildSanityChoice(session, action, field, rawValue){
    if(!session || !session.data) return null;
    field = normalizeKey(field || '');
    action = lower(action || '');
    var candidate = assignDirectFieldValue(session.data, field, rawValue, action);
    if(!candidate) return null;
    if(String(candidate[field] || '') === String((session.data || {})[field] || '')) return null;
    var recommendation = buildSanityRecommendation(candidate);
    var patch = {};
    var changes = [];
    var adjustEconomyTiers = field !== 'locale';
    if(adjustEconomyTiers && field !== 'development' && String(candidate.development || '') !== String(recommendation.development || '')){
      patch.development = recommendation.development;
      changes.push('Development -> ' + recommendation.development + ' (' + valueLabel('development', recommendation.development, { data:candidate }) + ')');
    }
    if(adjustEconomyTiers && field !== 'wealth' && String(candidate.wealth || '') !== String(recommendation.wealth || '')){
      patch.wealth = recommendation.wealth;
      changes.push('Wealth -> ' + recommendation.wealth + ' (' + valueLabel('wealth', recommendation.wealth, { data:candidate }) + ')');
    }
    patch.tradeGoods = recommendation.tradeGoods;
    changes.push('Trade calendar -> reset to seasonal defaults matching locale, population, development, and wealth.');
    return {
      action:action,
      field:field,
      value:String(rawValue || ''),
      changeList:changes,
      patch:patch
    };
  }

  function sanityProceedHref(){
    return commandExpr('sanityResolve --choice proceed');
  }

  function sanityCancelHref(){
    return commandExpr('sanityResolve --choice cancel');
  }

  function applyPendingSanityChoice(session, choice){
    if(!session || !session.pendingSanityChoice) return 'No pending sanity check is active.';
    choice = normalizeKey(choice || '');
    if(choice === 'cancel'){
      clearPendingSanityChoice(session);
      return '';
    }
    if(choice !== 'proceed') return 'Unknown sanity-check decision.';
    var pending = session.pendingSanityChoice;
    var next = assignDirectFieldValue(session.data, pending.field, pending.value, pending.action);
    if(!next){
      clearPendingSanityChoice(session);
      return 'Could not apply the pending manual value.';
    }
    next = mergeSnapshotIntoData(next, pending.patch || {});
    session.data = snapshotData(next);
    clearPendingSanityChoice(session);
    return '';
  }

  function copyPoiEntriesForTemplateStep(entries){
    return normalizePoiEntries(entries || []).map(function(entry){
      return {
        category:String(entry.category || ''),
        key:String(entry.key || ''),
        label:String(entry.label || ''),
        count:normalizePoiCount(entry.count)
      };
    });
  }

  function copyTradeEntriesForTemplateStep(entries){
    return normalizeTradeGoods(entries || []).map(function(entry){
      return {
        stance:String(entry.stance || ''),
        goodKey:String(entry.goodKey || ''),
        windows:(entry.windows || []).map(function(window){
          return { key:String(window.key || ''), cu:String(window.cu || '') };
        }),
        periods:Object.assign({}, entry.periods || {}),
        periodNotes:Object.assign({}, entry.periodNotes || {})
      };
    });
  }

  function replacePoiCategoryEntries(currentList, categoryKey, replacementEntries){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return normalizePoiEntries(currentList || []);
    var base = normalizePoiEntries(currentList || []).filter(function(entry){
      return String(entry.category || '') !== categoryKey;
    });
    var next = copyPoiEntriesForTemplateStep(replacementEntries || []).filter(function(entry){
      return String(entry.category || '') === categoryKey;
    });
    return normalizePoiEntries(base.concat(next));
  }

  function replaceTradeStanceEntries(currentList, stance, replacementEntries){
    stance = lower(stance || '');
    if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return normalizeTradeGoods(currentList || []);
    var base = normalizeTradeGoods(currentList || []).filter(function(entry){
      return lower(entry.stance || '') !== stance;
    });
    var next = copyTradeEntriesForTemplateStep(replacementEntries || []).filter(function(entry){
      return lower(entry.stance || '') === stance;
    });
    return normalizeTradeGoods(base.concat(next));
  }

  function summarizeTemplateStepLines(lines, maxLines){
    lines = Array.isArray(lines) ? lines.slice() : [];
    maxLines = asInt(maxLines);
    if(maxLines === null || maxLines < 1) maxLines = 10;
    if(lines.length <= maxLines) return lines;
    var extra = lines.length - maxLines;
    lines = lines.slice(0, maxLines);
    lines.push('+' + String(extra) + ' additional entries');
    return lines;
  }

  function templateApplyCoreSummaryLines(template, target, session){
    template = template || {};
    target = target || {};
    var popProfile = templatePopulationRange(target.population || template.populationAvg || 0, template.categoryKey || target.template_category || '');
    var rangeLabel = String(template.populationRange || '').trim() || popProfile.label;
    var allies = fieldDisplayValues('allies', target.allies || [], session);
    var enemies = fieldDisplayValues('enemies', target.enemies || [], session);
    return [
      'Name: ' + (String(target.name || '').trim() || 'Location'),
      'Point Type: ' + pointTypeLabel(target.point_type || template.pointType || ''),
      'Population: ' + String(target.population || popProfile.avg || 0) + ' [' + rangeLabel + ']',
      'Development: ' + valueLabel('development', target.development || '', session),
      'Wealth: ' + valueLabel('wealth', target.wealth || '', session),
      'Allies: ' + (allies.length ? allies.join(', ') : 'none'),
      'Enemies: ' + (enemies.length ? enemies.join(', ') : 'none')
    ];
  }

  function buildPendingTemplateSteps(template, previousData, targetData, session){
    template = template || {};
    previousData = snapshotData(previousData || {});
    targetData = snapshotData(targetData || {});
    var steps = [];
    var corePatch = {
      name:String(targetData.name || ''),
      template_category:String(targetData.template_category || template.categoryKey || ''),
      point_type:String(targetData.point_type || template.pointType || ''),
      depth_elevation:String(targetData.depth_elevation || '0'),
      population:String(targetData.population || ''),
      development:String(targetData.development || ''),
      wealth:String(targetData.wealth || ''),
      allies:targetData.allies || [],
      enemies:targetData.enemies || []
    };
    steps.push({
      kind:'core',
      title:'Map Point Defaults',
      description:'Apply the base map-point profile defaults for this template.',
      lines:templateApplyCoreSummaryLines(template, targetData, session),
      patch:corePatch
    });

    var poiCategorySet = {};
    normalizePoiEntries(previousData.poi || []).forEach(function(entry){
      var categoryKey = normalizePoiCategoryKey(entry && entry.category);
      if(categoryKey) poiCategorySet[categoryKey] = true;
    });
    normalizePoiEntries(targetData.poi || []).forEach(function(entry){
      var categoryKey = normalizePoiCategoryKey(entry && entry.category);
      if(categoryKey) poiCategorySet[categoryKey] = true;
    });
    Object.keys(poiCategorySet).sort(function(a, b){
      return alphaNumericCompare(poiCategoryLabel(a), poiCategoryLabel(b));
    }).forEach(function(categoryKey){
      var entries = poiEntriesForCategory(targetData.poi || [], categoryKey);
      var lines = entries.map(function(entry){
        return String(entry.label || poiEntryLabel(entry.category, entry.key, '')) + ' (' + String(entry.count || 0) + ')';
      });
      if(!lines.length) lines = ['Clear this category.'];
      steps.push({
        kind:'poi_category',
        title:'POI: ' + poiCategoryLabel(categoryKey),
        description:'Apply starter points of interest for this category.',
        lines:summarizeTemplateStepLines(lines, 12),
        categoryKey:categoryKey,
        entries:copyPoiEntriesForTemplateStep(entries)
      });
    });

    TRADE_STANCE_ORDER.forEach(function(stance){
      var previousEntries = tradeEntriesForStance(previousData.tradeGoods || [], stance);
      var entries = tradeEntriesForStance(targetData.tradeGoods || [], stance);
      if(!entries.length && !previousEntries.length) return;
      var lines = entries.map(function(entry){
        return templateTradeEntrySummary(entry);
      });
      if(!lines.length) lines = ['Clear ' + tradeStanceLabel(stance).toLowerCase() + ' categories.'];
      steps.push({
        kind:'trade_stance',
        title:'Trade ' + tradeStanceLabel(stance),
        description:'Apply default ' + tradeStanceLabel(stance).toLowerCase() + ' trade categories for this template.',
        lines:summarizeTemplateStepLines(lines, 10),
        stance:stance,
        entries:copyTradeEntriesForTemplateStep(entries)
      });
    });

    return steps;
  }

  function buildTemplateApplyTargetData(session, template){
    var token = getObj('graphic', session.tokenId);
    var page = getObj('page', session.pageId);
    var resetBase = defaultSessionData(token, page);
    var preservedRegion = String(session.data.region || '');
    var preservedLocale = String(session.data.locale || '');
    var preservedCultures = uniqueStrings(session.data.cultures || []);
    var preservedFaiths = uniqueStrings(session.data.faiths || []);
    var preservedFactions = uniqueStrings(session.data.factions || []);
    resetBase.name = session.data.name || resetBase.name;

    var target = mergeSnapshotIntoData(resetBase, template.defaults || {});
    target.region = preservedRegion;
    target.locale = preservedLocale;
    target.cultures = preservedCultures;
    target.faiths = preservedFaiths;
    target.factions = preservedFactions;
    target.template = String(template.key || '');
    target.template_category = String(template.categoryKey || '');
    target.point_type = String(template.pointType || target.point_type || '');
    if(!String(target.name || '').trim()){
      target.name = String(template.label || template.templateKey || 'Location').trim();
    }
    return snapshotData(target);
  }

  function beginPendingTemplateApply(session, template){
    if(!session || !template) return { error:'Unknown template.' };
    var previousData = snapshotData(session.data || {});
    var targetData = buildTemplateApplyTargetData(session, template);
    var steps = buildPendingTemplateSteps(template, previousData, targetData, session);
    if(!steps.length) return { error:'Template has no defaults to apply.' };
    session.pendingTemplateApply = {
      templateKey:String(template.key || ''),
      templateLabel:String(template.displayLabel || template.label || template.key || 'Template'),
      templateCategory:String(template.categoryKey || ''),
      pointType:String(template.pointType || ''),
      previousData:previousData,
      steps:steps,
      index:0
    };
    clearTemplateAppliedSummary(session);
    return { stepCount:steps.length };
  }

  function finalizePendingTemplateApply(session, pending){
    if(!session || !pending) return;
    var template = resolveTemplateRecord(pending.templateKey || '');
    if(template){
      session.data.template = String(template.key || '');
      session.data.template_category = String(template.categoryKey || session.data.template_category || pending.templateCategory || '');
      session.data.point_type = String(session.data.point_type || template.pointType || pending.pointType || '');
      if(!String(session.data.name || '').trim()){
        session.data.name = String(template.label || template.templateKey || 'Location').trim();
      }
      setTemplateAppliedSummary(session, template);
    }else{
      session.data.template = String(pending.templateKey || session.data.template || '');
      session.data.template_category = String(pending.templateCategory || session.data.template_category || '');
      session.data.point_type = String(session.data.point_type || pending.pointType || '');
      clearTemplateAppliedSummary(session);
    }
    session.sanityNoticeTemplateKey = '';
    clearPendingSanityChoice(session);
    clearPendingTemplateApply(session);
  }

  function applyPendingTemplateChoice(session, choice){
    if(!session || !session.pendingTemplateApply){
      return { error:'No pending template category confirmation is active.' };
    }
    var pending = session.pendingTemplateApply;
    var steps = Array.isArray(pending.steps) ? pending.steps : [];
    if(!steps.length){
      clearPendingTemplateApply(session);
      return { error:'Pending template queue is empty.' };
    }

    choice = normalizeKey(choice || '');
    if(choice === 'accept' || choice === 'confirm' || choice === 'proceed') choice = 'apply';
    if(choice === 'reject') choice = 'skip';
    if(choice !== 'apply' && choice !== 'skip' && choice !== 'cancel'){
      return { error:'Unknown template apply choice.' };
    }

    if(choice === 'cancel'){
      session.data = snapshotData(pending.previousData || session.data);
      clearPendingTemplateApply(session);
      return {
        status:'canceled',
        message:'Template apply was canceled. Existing values were restored.'
      };
    }

    var index = asInt(pending.index);
    if(index === null || index < 0) index = 0;
    if(index >= steps.length){
      finalizePendingTemplateApply(session, pending);
      return {
        status:'complete',
        message:'Template defaults were applied.'
      };
    }

    var step = steps[index];
    if(choice === 'apply'){
      if(step.kind === 'core'){
        session.data = mergeSnapshotIntoData(session.data, step.patch || {});
      }else if(step.kind === 'poi_category'){
        session.data.poi = replacePoiCategoryEntries(session.data.poi || [], step.categoryKey || '', step.entries || []);
      }else if(step.kind === 'trade_stance'){
        session.data.tradeGoods = replaceTradeStanceEntries(session.data.tradeGoods || [], step.stance || '', step.entries || []);
      }
    }

    pending.index = index + 1;
    if(pending.index >= steps.length){
      finalizePendingTemplateApply(session, pending);
      return {
        status:'complete',
        stepTitle:String(step.title || 'Final Category'),
        message:'Template category confirmation is complete.'
      };
    }

    var nextStep = steps[pending.index] || null;
    return {
      status:(choice === 'apply' ? 'applied' : 'skipped'),
      stepTitle:String(step.title || 'Category'),
      nextTitle:nextStep ? String(nextStep.title || 'Category') : '',
      index:pending.index,
      total:steps.length,
      remaining:Math.max(0, steps.length - pending.index)
    };
  }

  /* ======================================================================== */
  /* Query Builders                                                            */
  /* ======================================================================== */

  function commandExpr(expr){
    var root = '!fts --' + COMMAND;
    return root + (expr ? (' ' + expr) : '');
  }

  function startWithSelectedHref(){
    return commandExpr('start');
  }

  function saveAndExitHref(){
    return commandExpr('finish');
  }

  function backSectionHref(){
    return commandExpr('back');
  }

  function nextSectionHref(){
    return commandExpr('next');
  }

  function sectionHref(sectionKey){
    return commandExpr('section --key ' + normalizeKey(sectionKey || ''));
  }

  function resetWizardHref(){
    return commandExpr('reset --confirm ' + buildRollQuery('Reset this wizard and discard all unsaved changes?', [
      { label:'No', value:'no' },
      { label:'Yes', value:'yes' }
    ]));
  }

  function chooserHref(field){
    return commandExpr('chooser --field ' + normalizeKey(field));
  }

  function templatePanelHref(categoryKey, showMode){
    categoryKey = normalizeTemplateCategoryKey(categoryKey || '');
    showMode = String(showMode || '').toLowerCase();
    if(showMode !== 'all' && showMode !== 'filtered') showMode = '';
    var expr = 'templateView' + (categoryKey ? (' --category ' + categoryKey) : '');
    if(showMode) expr += ' --show ' + showMode;
    return commandExpr(expr);
  }

  function templateApplyChoiceHref(choice){
    choice = normalizeKey(choice || '');
    if(choice !== 'apply' && choice !== 'skip' && choice !== 'cancel') choice = 'apply';
    return commandExpr('templateApply --choice ' + choice);
  }

  function templateStepEditHref(step){
    step = step || {};
    if(step.kind === 'poi_category'){
      return poiPanelHref(step.categoryKey || '');
    }
    if(step.kind === 'trade_stance'){
      var entries = Array.isArray(step.entries) ? step.entries : [];
      var firstGroup = '';
      for(var i=0;i<entries.length;i++){
        firstGroup = tradeGroupKeyFromTarget((entries[i] && entries[i].goodKey) || '');
        if(firstGroup) break;
      }
      return tradePanelHref(firstGroup);
    }
    return commandExpr('section --key review');
  }

  function poiPanelHref(categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    return commandExpr('poiView' + (categoryKey ? (' --category ' + categoryKey) : ''));
  }

  function poiSetHref(categoryKey, key, label, count){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    key = normalizeKey(key || label || '');
    label = String(label || '').trim();
    count = normalizePoiCount(count);
    if(count <= 0) count = 1;
    if(!categoryKey || !key) return commandExpr('poiView');
    return commandExpr(
      'poiSet --category ' + categoryKey
      + ' --key ' + key
      + ' --label ' + encodeCommandValue(label || key)
      + ' --count ?{Count|' + String(count) + '}'
    );
  }

  function poiRemoveHref(categoryKey, key){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    key = normalizeKey(key || '');
    if(!categoryKey || !key) return commandExpr('poiView');
    return commandExpr('poiRemove --category ' + categoryKey + ' --key ' + key);
  }

  function poiRenameHref(categoryKey, key, label){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    key = normalizeKey(key || '');
    label = String(label || '').trim();
    if(!categoryKey || !key) return commandExpr('poiView');
    return commandExpr(
      'poiRename --category ' + categoryKey
      + ' --key ' + key
      + ' --label ?{POI Display Name|' + escapeRollQueryValue(label || poiEntryLabel(categoryKey, key, '')) + '}'
    );
  }

  function poiClearCategoryHref(categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return commandExpr('poiClear');
    return commandExpr('poiClear --category ' + categoryKey);
  }

  function poiCategoryCustomHref(categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    var promptLabel = categoryKey ? (poiCategoryLabel(categoryKey) + ' Entry') : 'Points of Interest Entry';
    return commandExpr(
      'poiCustom --category ' + categoryKey
      + ' --label ?{' + escapeRollQueryValue(promptLabel) + '|}'
      + ' --count ?{Count|1}'
    );
  }

  function fieldSetHref(field, prompt, currentValue){
    return commandExpr('set --field ' + field + ' --value ?{' + escapeRollQueryValue(prompt) + '|' + escapeRollQueryValue(currentValue || '') + '}');
  }

  function encodeCommandValue(value){
    return encodeURIComponent(String(value || ''));
  }

  function decodeCommandValue(value){
    value = String(value || '').trim();
    if(!value) return '';
    try{
      return decodeURIComponent(value);
    }catch(e){
      return value;
    }
  }

  function multiCustomHref(field){
    var prompt = 'Custom ' + (MULTI_LIBRARY[field] ? MULTI_LIBRARY[field].label : titleCaseToken(field));
    var expr = 'multiCustom --field ' + field + ' --label ?{' + escapeRollQueryValue(prompt) + '|}';
    if(isStrengthTypeField(field)){
      expr += ' --score ?{Point Value|1}';
    }
    return commandExpr(expr);
  }

  function tradeCategoryClearHref(groupKey){
    return commandExpr('tradeClear --group ' + groupKey);
  }

  function tradePanelHref(groupKey){
    groupKey = normalizeKey(groupKey || '');
    return commandExpr('tradeView' + (groupKey ? (' --group ' + groupKey) : ''));
  }

  function tradeCategoryCustomHref(){
    return commandExpr('tradeGroupAdd --label ?{Custom Trade Category|}');
  }

  function tradeNotePromptValue(note){
    return String(note || '').replace(/[\r\n\u2028]+/g, ' / ');
  }

  function tradeSetActionValue(defaultCu, note){
    return 'set --cargoUnits ?{CU|' + escapeRollQueryValue(defaultCu) + '}'
      + ' --note ?{Transaction Note (optional)|' + escapeRollQueryValue(tradeNotePromptValue(note)) + '}';
  }

  function tradeEditActionValue(defaultCu, note){
    return buildRollQuery('Edit Entry', [
      {
        label:'Update',
        value: tradeSetActionValue(defaultCu, note)
      },
      {
        label:'Clear Note',
        value:'clear'
      },
      {
        label:'Delete Entry',
        value:'delete'
      }
    ]);
  }

  /* ======================================================================== */
  /* Rendering                                                                 */
  /* ======================================================================== */

  function renderInlineField(label, valueHtml, actionHtml){
    var html = '<div style="margin-top:6px;">'
      + '<div><b>' + esc(label) + ':</b> ' + valueHtml + '</div>';
    if(String(actionHtml || '').trim()){
      html += '<div style="margin-top:4px;">' + actionHtml + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderSingleValue(value){
    return esc(value || 'Not set');
  }

  function selectedValueText(field, value, session){
    var text = valueLabel(field, value, session);
    if(isStrengthTypeField(field)){
      text += ' (+' + valueScore(field, value) + ' pts)';
    }
    return text;
  }

  function renderBadges(field, values, session){
    values = Array.isArray(values) ? values : [];
    if(!values.length) return muted('<i>None selected.</i>');
    var out = [];
    for(var i=0;i<values.length;i++){
      out.push(badge(selectedValueText(field, values[i], session)));
    }
    return '<div style="margin-top:6px;">' + out.join('') + '</div>';
  }

  function fieldDisplayValues(field, values, session){
    values = sortFieldValues(field, values || []);
    return values.map(function(value){
      return selectedValueText(field, value, session);
    });
  }

  function renderSummary(session){
    var data = session.data;
    var rows = [
      '<div><b>Name:</b> ' + esc(data.name || '(unset)') + '</div>',
      '<div><b>Region:</b> ' + esc(data.region ? resolveRegionLabel(data.region) : '(unset)') + '</div>',
      '<div><b>Locale:</b> ' + esc(data.locale ? resolveLocaleLabel(data.region, data.locale) : '(unset)') + '</div>',
      '<div><b>Population:</b> ' + esc(data.population || '(unset)') + '</div>'
    ];
    return '<div style="' + (cssVars().card || '') + '">' + rows.join('') + '</div>';
  }

  function renderCurrentMapContext(pid, session){
    var page = contextPageForWizard(pid, session);
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Current Map Context</b></div>';
    if(!page){
      html += muted('<i>No active page context is available for this wizard right now.</i>');
      html += '</div>';
      return html;
    }

    var meta = pageMetaForPage(page);
    var mapKey = mapKeyFromPageMeta(meta, page);
    var records = getMapRecordsState();
    var points = mapKey ? (records.points[mapKey] || {}) : {};
    var routes = mapKey ? (records.routes[mapKey] || {}) : {};
    var pointLabels = Object.keys(points).sort().map(function(pointKey){
      var point = points[pointKey];
      return String((point && point.name) || pointKey || '');
    });
    var routeLabels = Object.keys(routes).sort().map(function(routeKey){
      var route = routes[routeKey];
      return String((route && route.name) || routeKey || '');
    });
    var regionLabel = '(unavailable)';
    var localeLabel = '(unavailable)';

    if(meta){
      if(meta.region_key){
        regionLabel = resolveRegionLabel(meta.region_key);
      }else if(meta.region_name || meta.raw_region){
        regionLabel = String(meta.region_name || meta.raw_region || '(unavailable)');
      }
      if(meta.page_scope === 'region'){
        localeLabel = 'Region Scope';
      }else if(meta.page_scope === 'global'){
        localeLabel = 'Global Scope';
      }else if(meta.locale_key){
        localeLabel = resolveLocaleLabel(meta.region_key || '', meta.locale_key);
      }else if(meta.locale_name || meta.raw_locale){
        localeLabel = String(meta.locale_name || meta.raw_locale || '(unavailable)');
      }
    }

    html += renderInlineField('Current Page', renderSingleValue(page.get('name') || 'Unnamed Page'), '');
    html += renderInlineField('Region', renderSingleValue(regionLabel), '');
    html += renderInlineField('Locale', renderSingleValue(localeLabel), '');
    html += renderInlineField('Stored Map Points', renderSingleValue(String(pointLabels.length)), '');
    html += summarizeContextLabels(pointLabels, 'No stored map points on this map.');
    html += renderInlineField('Stored Routes', renderSingleValue(String(routeLabels.length)), '');
    html += summarizeContextLabels(routeLabels, 'No stored routes on this map.');
    html += '</div>';
    return html;
  }

  function gridLinkStyle(selected){
    return linkStyle(selected)
      + 'display:flex;align-items:center;justify-content:flex-start;'
      + 'min-height:56px;height:100%;margin-top:0;padding:10px 12px;box-sizing:border-box;'
      + 'line-height:1.2;text-align:left;white-space:normal;';
  }

  function gridActionLink(href, label, selected){
    var attrs = ' href="' + hrefAttr(href) + '" style="' + gridLinkStyle(selected) + '"';
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, gridLinkStyle(selected));
    }
    return '<a' + attrs + '>' + esc(label) + '</a>';
  }

  function renderActionGrid(items, columns){
    items = Array.isArray(items) ? items : [];
    columns = Math.max(1, asInt(columns) || 2);
    if(!items.length) return '';
    var html = '<table style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:12px 18px;margin-top:10px;">';
    for(var i=0;i<items.length;i += columns){
      html += '<tr>';
      for(var j=0;j<columns;j++){
        var item = items[i + j];
        html += '<td style="padding:2px;vertical-align:top;height:64px;">';
        html += item ? gridActionLink(item.href, item.label, item.selected) : '&nbsp;';
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    return html;
  }

  function renderSectionHeading(label){
    return '<h2 style="margin:0 0 6px 0;font-size:16px;line-height:1.2;">' + esc(label) + '</h2>';
  }

  function handoutTopAnchor(anchorId){
    anchorId = normalizeKey(anchorId || 'handout_top');
    return '<a id="' + esc(anchorId) + '" name="' + esc(anchorId) + '"></a>';
  }

  function handoutTopHref(anchorId, topUrl){
    anchorId = normalizeKey(anchorId || 'handout_top');
    topUrl = String(topUrl || '').trim(); // retained for compatibility with older calls.
    return '#' + anchorId;
  }

  function handoutBackToTopLink(anchorId, topUrl){
    var href = handoutTopHref(anchorId, topUrl);
    return '<div style="margin-top:8px;"><a href="' + hrefAttr(href) + '" style="' + linkStyle(false) + '">Back to Top</a></div>';
  }

  function strengthSummaryText(kind, data){
    var points = strengthPoints(kind, data[(kind === 'defense') ? 'defense_types' : 'offense_types'] || []);
    var combatTotals = poiCombatPointTotals((data && data.poi) || []);
    var militaryPoints = kind === 'defense' ? combatTotals.defense : combatTotals.offense;
    var total = points + militaryPoints;
    var value = String(data[(kind === 'defense') ? 'defense_level' : 'offense_level'] || '');
    var tier = tierByValue(STRENGTH_TIERS, value) || { label:value };
    if(militaryPoints > 0){
      return total + ' pts (' + points + ' capabilities + ' + militaryPoints + ' military establishments, ~' + String(combatTotals.units || 0) + ' unit capacity) - ' + String(tier.label || value) + ' (' + value + ')';
    }
    return total + ' pts - ' + String(tier.label || value) + ' (' + value + ')';
  }

  function renderMultiField(field, session, showChooser){
    var library = MULTI_LIBRARY[field];
    if(!library) return '';
    var values = session.data[field] || [];
    showChooser = (showChooser !== false);
    return renderInlineField(
      library.label,
      renderBadges(field, values, session),
      showChooser ? inlineActionLink(chooserHref(field), 'Choose ' + library.label, false) : ''
    );
  }

  function templatePickHref(template){
    return commandExpr('pick --field template --value ' + encodeCommandValue(String((template && template.key) || '')));
  }

  function pluralizePoiLabel(label, count){
    label = String(label || '').trim();
    if(count === 1) return label;
    if(/s$/i.test(label)) return label;
    return label + 's';
  }

  function joinNaturalList(items){
    items = Array.isArray(items) ? items.filter(function(item){ return !!String(item || '').trim(); }) : [];
    if(!items.length) return '';
    if(items.length === 1) return items[0];
    if(items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, items.length - 1).join(', ') + ', and ' + items[items.length - 1];
  }

  function templatePoiNarrativeEntries(template){
    var defaults = (template && template.defaults) || {};
    var list = normalizePoiEntries(defaults.poi || []);
    var orderedCategories = [
      'food_production_distribution',
      'trade_commerce',
      'crafting_manufacturing',
      'civic_government',
      'military_establishments'
    ];
    var out = [];
    for(var ci=0;ci<orderedCategories.length && out.length < 4;ci++){
      var entries = poiEntriesForCategory(list, orderedCategories[ci]);
      for(var ei=0;ei<entries.length && out.length < 4;ei++){
        var entry = entries[ei];
        var count = normalizePoiCount(entry.count);
        var label = String(entry.label || poiEntryLabel(entry.category, entry.key, '')).toLowerCase();
        if(!label) continue;
        if(count === 1){
          out.push('a ' + label);
        }else{
          out.push(String(count) + ' ' + pluralizePoiLabel(label, count));
        }
      }
    }
    return out;
  }

  function templatePoiBulletLines(template){
    var defaults = (template && template.defaults) || {};
    var list = normalizePoiEntries(defaults.poi || []);
    if(!list.length) return [];
    var lines = [];
    var categories = Object.keys(POI_CATEGORY_MAP).sort(function(a, b){
      return alphaNumericCompare(poiCategoryLabel(a), poiCategoryLabel(b));
    });
    for(var i=0;i<categories.length;i++){
      var entries = poiEntriesForCategory(list, categories[i]);
      for(var j=0;j<entries.length;j++){
        lines.push(poiCategoryLabel(categories[i]) + ': ' + entries[j].label + ' (' + entries[j].count + ')');
      }
    }
    return lines;
  }

  function templateStatBlockRows(template, session){
    template = template || {};
    session = session || null;
    var defaults = template.defaults || {};
    var popProfile = templatePopulationRange(defaults.population || template.populationAvg || 0, template.categoryKey || '');
    var popRange = String(template.populationRange || '').trim() || popProfile.label;
    var dev = String(defaults.development || '');
    var wealth = String(defaults.wealth || '');
    var rows = [];
    rows.push('Point Type: ' + pointTypeLabel(defaults.point_type || template.pointType || ''));
    rows.push('Locale: ' + valueLabel('locale', defaults.locale || '', session));
    rows.push('Population Range: ' + popRange);
    rows.push('Default Population: ' + String(defaults.population || popProfile.avg || 0));
    rows.push('Development: ' + dev + ' - ' + valueLabel('development', defaults.development || '', session) + ' | ' + developmentNarrativeExample(dev));
    rows.push('Wealth: ' + wealth + ' - ' + valueLabel('wealth', defaults.wealth || '', session) + ' | ' + wealthNarrativeExample(wealth));
    rows.push('Threat Tendency: Offense ' + valueLabel('offense_level', defaults.offense_level || '1', session) + ' / Defense ' + valueLabel('defense_level', defaults.defense_level || '1', session));
    rows.push('Starter POI Baseline: ' + (joinNaturalList(templatePoiNarrativeEntries(template)) || 'none defined') + '.');
    rows.push('Demographic Note: ' + String(template.demographicNote || demographicTemplateNote(template.categoryKey || '')).trim());
    rows.push('Trade Baseline: seasonal has/wants/needs defaults are pre-applied and editable.');
    return rows;
  }

  function renderTemplateStatBlock(template, session){
    var rows = templateStatBlockRows(template, session);
    var html = '<ul style="margin:6px 0 0 18px;padding:0;">';
    for(var i=0;i<rows.length;i++){
      html += '<li style="margin:2px 0;">' + esc(rows[i]) + '</li>';
    }
    html += '</ul>';
    return html;
  }

  function templateTradeWindowLabels(entry){
    entry = entry || {};
    var windows = (entry.windowTotals && typeof entry.windowTotals === 'object') ? entry.windowTotals : {};
    var keys = Object.keys(windows).sort(function(a, b){
      var map = { winter:0, spring:1, summer:2, autumn:3, annual:4 };
      var left = Object.prototype.hasOwnProperty.call(map, a) ? map[a] : 99;
      var right = Object.prototype.hasOwnProperty.call(map, b) ? map[b] : 99;
      if(left !== right) return left - right;
      return alphaNumericCompare(String(a || ''), String(b || ''));
    });
    if(keys.length){
      return keys.map(function(key){
        return windowShortLabel(key) + ' ' + String(windows[key] || '') + ' CU';
      });
    }
    var periods = entry.periods || {};
    return sortPeriodKeys(Object.keys(periods)).map(function(periodKey){
      return periodLabel(periodKey) + ' ' + String(periods[periodKey] || '') + ' CU';
    });
  }

  function templateTradeEntryNote(entry){
    entry = entry || {};
    var notes = entry.periodNotes || {};
    var keys = sortPeriodKeys(Object.keys(notes));
    var unique = {};
    var out = [];
    for(var i=0;i<keys.length;i++){
      var note = String(notes[keys[i]] || '').trim();
      if(note && !unique[note]){
        unique[note] = true;
        out.push(note);
      }
    }
    return out.join(' / ');
  }

  function templateTradeEntrySummary(entry){
    entry = entry || {};
    var windows = templateTradeWindowLabels(entry);
    var note = templateTradeEntryNote(entry);
    var line = tradeGoodLabel(entry.goodKey || '');
    if(windows.length) line += ' [' + windows.join(', ') + ']';
    if(note) line += ' - ' + note;
    return line;
  }

  function templateTradeStanceSummary(list, stance){
    var entries = tradeEntriesForStance(list || [], stance);
    if(!entries.length) return 'none';
    return entries.map(templateTradeEntrySummary).join('; ');
  }

  function templateTooltipSectionLines(title, labels){
    labels = Array.isArray(labels) ? labels : [];
    if(!labels.length){
      return [title + ': none'];
    }
    var out = [title + ': ' + labels[0]];
    for(var i=1;i<labels.length;i++){
      out.push('       ' + labels[i]);
    }
    return out;
  }

  function templateSelectionTooltip(template){
    template = template || {};
    var defaults = template.defaults || {};
    var list = normalizeTradeGoods(defaults.tradeGoods || []);
    function labelsFor(stance){
      return tradeEntriesForStance(list, stance).map(function(entry){
        return tradeGoodLabel(entry.goodKey || '');
      });
    }
    var lines = [String(template.label || template.templateKey || 'Template'), ''];
    lines = lines.concat(templateTooltipSectionLines('Has', labelsFor('has')));
    lines.push('');
    lines = lines.concat(templateTooltipSectionLines('Wants', labelsFor('wants')));
    lines.push('');
    lines = lines.concat(templateTooltipSectionLines('Needs', labelsFor('needs')));
    return lines.join('\n');
  }

  function locationSizeDescriptor(population){
    var pop = templatePopulationAverage(population);
    if(pop <= 0) return 'vacant';
    if(pop < 200) return 'small';
    if(pop < 800) return 'modest';
    if(pop < 3000) return 'mid-sized';
    if(pop < 10000) return 'large';
    if(pop < 25000) return 'major';
    return 'metropolitan';
  }

  function templateNarrativeSummary(template, session){
    template = template || {};
    session = session || null;
    var defaults = template.defaults || {};
    var popProfile = templatePopulationRange(defaults.population || template.populationAvg || 0, template.categoryKey || '');
    var localeLabel = valueLabel('locale', defaults.locale || '', session).toLowerCase();
    var sizeToken = locationSizeDescriptor(popProfile.avg);
    var subtypeLabel = String(template.label || template.templateKey || 'location').toLowerCase();
    var poiNarrative = joinNaturalList(templatePoiNarrativeEntries(template));
    var sentence = 'With an average population of ' + String(popProfile.avg) + ' (' + popProfile.label + '), this '
      + sizeToken + ' ' + localeLabel + ' ' + subtypeLabel + ' starts with an editable default profile.';
    if(poiNarrative){
      sentence += ' It usually sustains ' + poiNarrative + '.';
    }
    return sentence;
  }

  function renderTemplateNarrativeBlock(template, session){
    template = template || {};
    session = session || null;
    var defaults = template.defaults || {};
    var list = normalizeTradeGoods(defaults.tradeGoods || []);
    var popProfile = templatePopulationRange(defaults.population || template.populationAvg || 0, template.categoryKey || '');
    var defaultPointType = pointTypeLabel(defaults.point_type || template.pointType || '');
    var localeText = valueLabel('locale', defaults.locale || '', session);
    var poiLines = templatePoiBulletLines(template);
    var hasLines = tradeEntriesForStance(list, 'has').map(templateTradeEntrySummary);
    var wantsLines = tradeEntriesForStance(list, 'wants').map(templateTradeEntrySummary);
    var needsLines = tradeEntriesForStance(list, 'needs').map(templateTradeEntrySummary);
    function bulletGroup(title, lines){
      var html = '<div style="margin-top:6px;"><b>' + esc(title) + ':</b></div>';
      if(!lines.length){
        html += '<div style="margin-top:2px;"><i>none</i></div>';
        return html;
      }
      html += '<ul style="margin:4px 0 0 18px;padding:0;">';
      for(var i=0;i<lines.length;i++){
        html += '<li style="margin:2px 0;">' + esc(lines[i]) + '</li>';
      }
      html += '</ul>';
      return html;
    }
    var html = '<div style="margin-top:6px;padding:8px;border:1px solid rgba(0,0,0,0.14);background:rgba(255,255,255,0.45);">';
    html += '<div><b>Profile</b></div>';
    html += '<div style="margin-top:4px;">' + esc(templateNarrativeSummary(template, session)) + '</div>';
    html += bulletGroup('MAP POINT DEFAULTS', [
      'Point Type: ' + defaultPointType,
      'Locale: ' + localeText,
      'Population: ' + String(popProfile.label) + ' (average ' + String(popProfile.avg) + ')',
      'Development: ' + valueLabel('development', defaults.development || '', session),
      'Wealth: ' + valueLabel('wealth', defaults.wealth || '', session),
      'Threat Tendency: Offense ' + valueLabel('offense_level', defaults.offense_level || '1', session)
        + ', Defense ' + valueLabel('defense_level', defaults.defense_level || '1', session)
    ]);
    html += bulletGroup('STARTER POI', poiLines);
    html += bulletGroup('DEFAULT HAS', hasLines);
    html += bulletGroup('DEFAULT WANTS', wantsLines);
    html += bulletGroup('DEFAULT NEEDS', needsLines);
    html += '</div>';
    return html;
  }

  function renderTemplateCategoryIndex(pid, session, activeCategoryKey, showMode){
    showMode = String(showMode || 'filtered').toLowerCase();
    if(showMode !== 'all') showMode = 'filtered';
    var categories = availableTemplateCategoryKeys(session);
    var html = '<div style="margin-top:10px;"><b>Category Index</b></div>';
    html += '<div style="margin-top:10px;"><b>Toggle Template Category Selections</b></div>';
    html += '<div style="margin-top:6px;">';
    for(var i=0;i<categories.length;i++){
      var categoryKey = categories[i];
      var selected = String(categoryKey) === String(activeCategoryKey || '');
      var marker = selected ? '[x] ' : '[ ] ';
      html += compactToggleLink(templatePanelHref(categoryKey, showMode), marker + templateCategoryLabel(categoryKey), selected);
    }
    html += '</div>';
    html += '<div style="margin-top:10px;"><b>Toggle Template Category Selections</b></div>';
    return html;
  }

  function renderTemplateSelectionCards(pid, session, activeCategoryKey, showMode, topUrl){
    showMode = String(showMode || 'filtered').toLowerCase();
    if(showMode !== 'all') showMode = 'filtered';
    var records = templateRecordsByCategoryForSession(session, activeCategoryKey, showMode);
    var pendingTemplateKey = String((session && session.pendingTemplateApply && session.pendingTemplateApply.templateKey) || '');
    var current = pendingTemplateKey || String((session && session.data && session.data.template) || '');
    var topAnchor = 'template_top';
    var localeLabel = resolveLocaleLabel((session && session.data && session.data.region) || '', (session && session.data && session.data.locale) || '');
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;"><b>Template Scope:</b> '
      + esc(showMode === 'all' ? 'All templates in this category' : ('Filtered for locale: ' + localeLabel))
      + '</div>';
    if(pendingTemplateKey){
      html += '<div style="margin-top:4px;"><b>Pending:</b> Confirm each category in chat to complete template apply.</div>';
    }
    html += '<div style="margin-top:4px;"><b>' + esc(templateCategoryLabel(activeCategoryKey)) + '</b></div>';
    html += '<div style="margin-top:4px;">' + esc(templateCategoryDescription(activeCategoryKey)) + '</div>';
    if(!records.length){
      html += '<div style="margin-top:6px;"><i>No templates are available for this category and locale filter.</i></div>';
      html += '</div>';
      return html;
    }
    for(var i=0;i<records.length;i++){
      var template = records[i];
      var selected = String(template.key || '') === current;
      var marker = selected ? '[x] ' : '[ ] ';
      var popProfile = templatePopulationRange((template.defaults || {}).population || 0, template.categoryKey || '');
      var popRange = String(template.populationRange || popProfile.label || '').trim();
      var toggleLabel = String(template.label || template.templateKey || '');
      if(popRange){
        toggleLabel += ' - ' + popRange;
      }
      html += '<div style="margin-top:8px;padding:8px;border:1px solid rgba(0,0,0,0.18);background:rgba(255,255,255,0.55);">';
      html += '<div style="' + prominentHeadingStyle() + 'margin-bottom:4px;">' + esc(String(template.label || template.templateKey || 'Template')) + '</div>';
      html += compactToggleLink(templatePickHref(template), marker + toggleLabel, selected, templateSelectionTooltip(template));
      if(String(template.desc || '').trim()){
        html += '<div style="margin-top:4px;">' + esc(String(template.desc || '').trim()) + '</div>';
      }
      html += renderTemplateStatBlock(template, session);
      html += renderTemplateNarrativeBlock(template, session);
      html += handoutBackToTopLink(topAnchor, topUrl);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function templateHandoutName(pid, session){
    var token = session ? tokenDisplayName(getObj('graphic', session.tokenId), session.tokenId) : 'Location';
    return TEMPLATE_PANEL_TITLE + ' - ' + token + ' - ' + playerName(pid || '');
  }

  function renderTemplateHandoutNotes(pid, session, activeCategoryKey, showMode){
    showMode = 'filtered';
    var topUrl = '';
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += handoutTopAnchor('template_top');
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Templates Handout</b></div>';
    html += '<div style="margin-top:4px;">Choose region and locale first, then choose a top-level category and subtype template.</div>';
    html += '<div style="margin-top:4px;">Templates are suggested but optional. If you do not select one, continue with manual values in later sections.</div>';
    html += '</div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += renderTemplateCategoryIndex(pid, session, activeCategoryKey, showMode);
    html += '</div>';
    html += renderTemplateSelectionCards(pid, session, activeCategoryKey, showMode, topUrl);
    html += renderTemplateAppliedSummaryCard(session);
    html += '<div style="' + (cssVars().card || '') + '"><i>This handout can be closed when finished.</i></div>';
    html += '</div>';
    return html;
  }

  function ensureTemplateHandout(pid, session){
    if(!session) return null;
    var activeCategoryKey = resolveTemplateCategoryForPanel(pid, session);
    var showMode = 'filtered';
    setTemplateShowMode(pid, 'filtered');
    var handout = currentTemplateHandout(pid);
    if(!handout){
      handout = createObj('handout', {
        name: templateHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        archived: false
      });
      if(!handout) return null;
      setTemplateHandoutId(pid, handout.id);
    }
    try{
      handout.set({
        name: templateHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        notes: renderTemplateHandoutNotes(pid, session, activeCategoryKey, showMode)
      });
    }catch(e){
      log('fts_mapPointWizard ensureTemplateHandout err: ' + e);
      return null;
    }
    return {
      handout: handout,
      activeCategoryKey: activeCategoryKey,
      url: handoutJournalUrl(handout.id, 'template_top')
    };
  }

  function renderHandoutOpenLink(url, label){
    url = String(url || '#');
    var style = linkStyle(false);
    return '<a href="' + hrefAttr(url) + '" style="' + style + '">' + esc(label) + '</a>';
  }

  function handoutJournalUrl(handoutId){
    handoutId = String(handoutId || '').trim();
    if(!handoutId) return '#';
    // Roll20 in-game journal links open reliably with the journal subdomain URL.
    // Anchor fragments are intentionally omitted here because routing behavior can
    // vary across clients and can force external navigation in some environments.
    return 'http://journal.roll20.net/handout/' + handoutId;
  }

  function renderTemplateSelectionPanel(pid, session){
    var hasRegion = !!String((session && session.data && session.data.region) || '').trim();
    var hasLocale = !!String((session && session.data && session.data.locale) || '').trim();
    if(!hasRegion || !hasLocale){
      var pendingHtml = shell(TITLE);
      pendingHtml += renderStatusBanner(pid);
      pendingHtml += sectionProgressCard(pid);
      pendingHtml += '<div style="' + (cssVars().card || '') + '">';
      pendingHtml += '<div><b>Template Filtering Needs Region and Locale</b></div>';
      pendingHtml += '<div style="margin-top:4px;">Set <b>Region</b> and <b>Locale</b> first, then template options will be filtered to logical matches for that area.</div>';
      pendingHtml += actionLink(chooserHref('region'), 'Open Region Section', false);
      pendingHtml += actionLink(chooserHref('locale'), 'Open Locale Section', false);
      pendingHtml += '</div>';
      pendingHtml += renderSectionNavigation(pid);
      pendingHtml += endShell();
      return pendingHtml;
    }
    var handout = currentTemplateHandout(pid);
    var handoutState = handout
      ? {
          handout: handout,
          activeCategoryKey: resolveTemplateCategoryForPanel(pid, session),
          url: handoutJournalUrl(handout.id, 'template_top')
        }
      : ensureTemplateHandout(pid, session);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += renderPendingTemplateApply(session);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Chat Panel</b></div>';
    html += '<div style="margin-top:4px;">Choose a top-level category and subtype template in the handout below. Template options are locale-filtered.</div>';
    html += '<div style="margin-top:4px;">After selection, defaults are confirmed and written one category at a time in chat.</div>';
    html += '<div style="margin-top:4px;">Templates are suggested but optional. Every selected value remains editable in later sections.</div>';
    if(handoutState && handoutState.url){
      html += renderHandoutOpenLink(handoutState.url, 'Open ' + TEMPLATE_PANEL_TITLE + ' Handout');
    }else{
      html += '<div style="margin-top:6px;">Could not open the template handout right now.</div>';
    }
    html += '</div>';
    html += renderTemplateAppliedSummaryCard(session);
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function poiCategoryDescription(categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey);
    if(categoryKey === 'food_production_distribution') return 'Add food production and food-market establishments.';
    if(categoryKey === 'crafting_manufacturing') return 'Add workshops, forges, and industrial establishments.';
    if(categoryKey === 'trade_commerce') return 'Add market, warehouse, and financial/trade establishments.';
    if(categoryKey === 'hospitality_vice') return 'Add lodging, social, entertainment, and vice establishments.';
    if(categoryKey === 'civic_government') return 'Add civic, legal, records, and infrastructure institutions.';
    if(categoryKey === 'military_establishments') return 'Add military establishments. Each site contributes estimated capacity to offense/defense ratings.';
    if(categoryKey === 'religious_cultural') return 'Add temples, libraries, schools, and social-care institutions.';
    if(categoryKey === 'magical_infrastructure') return 'Add magical service and arcane institutions.';
    if(categoryKey === 'transport_animal_services') return 'Add travel, maritime, logistics, and animal-service establishments.';
    if(categoryKey === 'power_hidden_structures') return 'Add power structures and hidden/informal institutions.';
    if(categoryKey === 'offense_types') return 'Set offensive capability tendencies. Selections update offense strength.';
    if(categoryKey === 'defense_types') return 'Set defensive capability tendencies. Selections update defense strength.';
    return 'Set categorized points of interest and unit counts for this location.';
  }

  function poiCategoryOptions(session, categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey);
    var bucket = {};
    var selectedLabels = {};
    poiEntriesForCategory((session && session.data && session.data.poi) || [], categoryKey).forEach(function(entry){
      var selectedKey = normalizeKey(entry && entry.key);
      if(!selectedKey) return;
      selectedLabels[selectedKey] = String(entry.label || '').trim();
    });
    (POI_LIBRARY[categoryKey] || []).forEach(function(entry){
      var key = normalizeKey(entry && entry.key);
      if(!key) return;
      bucket[key] = { key:key, label:String(selectedLabels[key] || entry.label || key).trim() };
    });
    poiEntriesForCategory((session && session.data && session.data.poi) || [], categoryKey).forEach(function(entry){
      var key = normalizeKey(entry && entry.key);
      if(!key) return;
      if(!bucket[key]){
        bucket[key] = { key:key, label:String(entry.label || key).trim() };
      }
    });
    return Object.keys(bucket).map(function(key){
      return bucket[key];
    }).sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  function renderPoiCategoryIndex(pid, activeCategoryKey){
    var categories = Object.keys(POI_CATEGORY_MAP).sort(function(a, b){
      return alphaNumericCompare(poiCategoryLabel(a), poiCategoryLabel(b));
    });
    var html = '<div style="margin-top:10px;"><b>Category Index</b></div>';
    html += '<div style="margin-top:10px;"><b>Toggle Points of Interest Category Selections</b></div>';
    html += '<div style="margin-top:6px;">';
    for(var i=0;i<categories.length;i++){
      var categoryKey = categories[i];
      var selected = String(categoryKey) === String(activeCategoryKey || '');
      var marker = selected ? '[x] ' : '[ ] ';
      html += compactToggleLink(poiPanelHref(categoryKey), marker + poiCategoryLabel(categoryKey), selected);
    }
    html += '</div>';
    html += '<div style="margin-top:10px;"><b>Toggle Points of Interest Category Selections</b></div>';
    return html;
  }

  function renderPoiCategoryEditor(pid, session, categoryKey, topUrl){
    categoryKey = normalizePoiCategoryKey(categoryKey);
    var options = poiCategoryOptions(session, categoryKey);
    var list = normalizePoiEntries((session && session.data && session.data.poi) || []);
    var selectedCount = poiEntriesForCategory(list, categoryKey).length;
    var toggleHeading = 'Toggle ' + poiCategoryLabel(categoryKey) + ' Selections';
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += renderSectionHeading(poiCategoryLabel(categoryKey));
    html += '<div style="margin-top:4px;">' + esc(poiCategoryDescription(categoryKey)) + '</div>';
    html += '<div style="margin-top:6px;">' + inlineActionLink(poiCategoryCustomHref(categoryKey), 'Add Custom Entry', false);
    if(selectedCount){
      html += inlineActionLink(poiClearCategoryHref(categoryKey), 'Clear Category', false);
    }
    html += '</div>';
    html += '<div style="margin-top:10px;"><b>' + esc(toggleHeading) + '</b></div>';
    html += '<div style="margin-top:6px;">';
    for(var i=0;i<options.length;i++){
      var option = options[i];
      var count = poiCountFor(list, categoryKey, option.key);
      var selected = count > 0;
      var marker = selected ? '[x] ' : '[ ] ';
      var label = String(option.label || option.key);
      if(selected) label += ' (' + count + ')';
      html += compactToggleLink(
        poiSetHref(categoryKey, option.key, option.label, selected ? count : 1),
        marker + label,
        selected
      );
      if(selected){
        html += '<div style="margin-top:2px;">'
          + inlineActionLink(poiSetHref(categoryKey, option.key, option.label, count), 'Set Count', false)
          + inlineActionLink(poiRenameHref(categoryKey, option.key, option.label), 'Rename', false)
          + inlineActionLink(poiRemoveHref(categoryKey, option.key), 'Remove', false)
          + '</div>';
      }
    }
    if(!options.length){
      html += '<div style="margin-top:4px;"><i>No entries are available in this category yet.</i></div>';
    }
    html += '</div>';
    html += '<div style="margin-top:10px;"><b>' + esc(toggleHeading) + '</b></div>';
    html += handoutBackToTopLink('poi_top', topUrl);
    html += '</div>';
    return html;
  }

  function renderPoiSummaryCard(session){
    var list = normalizePoiEntries((session && session.data && session.data.poi) || []);
    var categories = Object.keys(POI_CATEGORY_MAP).sort(function(a, b){
      return alphaNumericCompare(poiCategoryLabel(a), poiCategoryLabel(b));
    });
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Current POI Totals</b></div>';
    var rendered = 0;
    for(var i=0;i<categories.length;i++){
      var entries = poiEntriesForCategory(list, categories[i]);
      if(!entries.length) continue;
      rendered += 1;
      html += '<div style="margin-top:4px;"><b>' + esc(poiCategoryLabel(categories[i])) + ':</b> ' + esc(String(entries.length)) + '</div>';
    }
    if(!rendered){
      html += '<div style="margin-top:4px;"><i>No POI entries are currently selected.</i></div>';
    }
    html += '</div>';
    return html;
  }

  function poiHandoutName(pid, session){
    var token = session ? tokenDisplayName(getObj('graphic', session.tokenId), session.tokenId) : 'Location';
    return POI_PANEL_TITLE + ' - ' + token + ' - ' + playerName(pid || '');
  }

  function renderPoiHandoutNotes(pid, session, activeCategoryKey){
    var topUrl = '';
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += handoutTopAnchor('poi_top');
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Points of Interest Handout</b></div>';
    html += '<div style="margin-top:4px;">Choose a category, then toggle establishments and set counts (for example, 3 bakeries or 1 guard barracks).</div>';
    html += '<div style="margin-top:4px;">Use Rename on selected entries to set GM-facing POI names (for example, "Ye Olde Tavern on the Hill").</div>';
    html += '<div style="margin-top:4px;">POI count updates automatically refresh the map-point trade profile.</div>';
    html += '</div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += renderPoiCategoryIndex(pid, activeCategoryKey);
    html += '</div>';
    html += renderPoiCategoryEditor(pid, session, activeCategoryKey, topUrl);
    html += renderPoiSummaryCard(session);
    html += '<div style="' + (cssVars().card || '') + '"><i>This handout can be closed when finished.</i></div>';
    html += '</div>';
    return html;
  }

  function ensurePoiHandout(pid, session){
    if(!session) return null;
    var activeCategoryKey = resolvePoiCategoryForPanel(pid);
    setPoiCategory(pid, activeCategoryKey);
    var handout = currentPoiHandout(pid);
    if(!handout){
      handout = createObj('handout', {
        name: poiHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        archived: false
      });
      if(!handout) return null;
      setPoiHandoutId(pid, handout.id);
    }
    try{
      handout.set({
        name: poiHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        notes: renderPoiHandoutNotes(pid, session, activeCategoryKey)
      });
    }catch(e){
      log('fts_mapPointWizard ensurePoiHandout err: ' + e);
      return null;
    }
    return {
      handout: handout,
      activeCategoryKey: activeCategoryKey,
      url: handoutJournalUrl(handout.id, 'poi_top')
    };
  }

  function renderPoiSelectionPanel(pid, session){
    var handoutState = ensurePoiHandout(pid, session);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Chat Panel</b></div>';
    html += '<div style="margin-top:4px;">Points of Interest are edited in an ephemeral handout for compact category toggles and numeric counts.</div>';
    html += '<div style="margin-top:4px;">Selected POIs can be renamed and will automatically refresh the map-point trade profile.</div>';
    if(handoutState && handoutState.url){
      html += renderHandoutOpenLink(handoutState.url, 'Open ' + POI_PANEL_TITLE + ' Handout');
    }else{
      html += '<div style="margin-top:6px;">Could not open the POI handout right now.</div>';
    }
    html += '</div>';
    html += renderPoiSummaryCard(session);
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function renderPoiSelectionLauncher(pid){
    setView(pid, 'bind');
    return renderBindSectionPanel(pid);
  }

  function tradeNoteLabel(note){
    return String(note || '').trim().replace(/[\r\n\u2028]+/g, ' / ');
  }

  function tradePeriodNote(entry, periodKey){
    return stringOrBlank(entry && entry.periodNotes ? entry.periodNotes[periodKey] : '');
  }

  function tradeWindowNoteState(entry, windowKey){
    var periods = expandWindowKey(windowKey);
    var firstNote = null;
    var mixed = false;
    if(!entry || !periods.length) return { value:'', label:'', mixed:false };
    for(var i=0;i<periods.length;i++){
      var note = tradePeriodNote(entry, periods[i]);
      if(firstNote === null) firstNote = note;
      else if(String(firstNote) !== String(note)) mixed = true;
    }
    return {
      value: mixed ? '' : (firstNote || ''),
      label: mixed ? 'Mixed notes' : tradeNoteLabel(firstNote || ''),
      mixed: mixed
    };
  }

  function tradeEntryTooltip(entry, periodOrWindowLabel, cuLabel, noteLabel){
    if(!entry) return '';
    var parts = [
      tradeStanceLabel(entry.stance),
      periodOrWindowLabel,
      cuLabel
    ];
    noteLabel = tradeNoteLabel(noteLabel);
    if(noteLabel) parts.push(noteLabel);
    return parts.join(' | ');
  }

  function tradeMatrixCellHref(list, goodKey, periodKey, stance){
    var current = tradePeriodState(list, goodKey, periodKey);
    var defaultCu = current ? current.cu : '1';
    var currentNote = (current && current.stance === stance) ? tradePeriodNote(current.entry, periodKey) : '';
    if(current && current.stance === stance){
      return commandExpr(
        'tradeCell --good ' + goodKey
        + ' --period ' + periodKey
        + ' --stance ' + stance
        + ' --action ' + tradeEditActionValue(defaultCu, currentNote)
      );
    }
    return commandExpr(
      'tradeCell --good ' + goodKey
      + ' --period ' + periodKey
      + ' --stance ' + stance
      + ' --action ' + tradeSetActionValue(defaultCu, '')
    );
  }

  function tradeMatrixCellStyle(selected, stance){
    var background = 'transparent';
    var border = 'rgba(0,0,0,0.16)';
    if(selected && stance === 'has'){
      background = 'rgba(52, 146, 87, 0.18)';
      border = 'rgba(52, 146, 87, 0.55)';
    }else if(selected && stance === 'wants'){
      background = 'rgba(191, 125, 28, 0.20)';
      border = 'rgba(191, 125, 28, 0.55)';
    }else if(selected && stance === 'needs'){
      background = 'rgba(54, 105, 196, 0.18)';
      border = 'rgba(54, 105, 196, 0.55)';
    }
    return 'display:block;min-height:34px;min-width:48px;padding:5px 4px;border:1px solid ' + border + ';'
      + 'text-align:center;text-decoration:none;color:inherit;background:' + background + ';white-space:nowrap;';
  }

  function tradeWindowState(list, goodKey, windowKey, stance){
    var periods = expandWindowKey(windowKey);
    var preset = findByKey(WINDOW_PRESETS, windowKey);
    var entry = tradeEntryFor(list, stance, goodKey);
    if(!periods.length) return null;
    var assigned = 0;
    var firstCu = '';
    var uniformCu = true;
    var monthValues = [];
    var festivalValues = [];
    var monthPeriods = periods.filter(function(periodKey){
      return !isFestivalPeriodKey(periodKey);
    });
    var festivalPeriods = periods.filter(function(periodKey){
      return isFestivalPeriodKey(periodKey);
    });
    for(var i=0;i<periods.length;i++){
      var current = tradePeriodState(list, goodKey, periods[i]);
      if(current && current.stance === stance){
        assigned += 1;
        if(!firstCu) firstCu = current.cu;
        else if(String(firstCu) !== String(current.cu)) uniformCu = false;
        if(isFestivalPeriodKey(periods[i])) festivalValues.push(String(current.cu));
        else monthValues.push(String(current.cu));
      }
    }
    var monthUniform = monthValues.length === monthPeriods.length;
    for(var mi=1;mi<monthValues.length && monthUniform;mi++){
      if(String(monthValues[mi]) !== String(monthValues[0])) monthUniform = false;
    }
    var explicitTotal = normalizeCargoUnits(entry && entry.windowTotals ? entry.windowTotals[windowKey] : '');
    var derivedTotal = '';
    var festivalsMatchDistribution = true;
    if(preset && assigned === periods.length && monthPeriods.length && monthUniform){
      var monthValueNumber = parseFloat(monthValues[0] || '0') || 0;
      var expectedFestivalValue = normalizeNumberString(lower(stance) === 'has' ? monthValueNumber : (monthValueNumber / 30));
      if(lower(stance) !== 'has' && monthValueNumber > 0 && parseFloat(expectedFestivalValue || '0') < 0.01){
        expectedFestivalValue = '0.01';
      }
      festivalsMatchDistribution = festivalValues.length === festivalPeriods.length;
      for(var fi=0;fi<festivalValues.length && festivalsMatchDistribution;fi++){
        if(String(festivalValues[fi]) !== String(expectedFestivalValue)) festivalsMatchDistribution = false;
      }
      if(festivalsMatchDistribution){
        derivedTotal = normalizeNumberString(monthValueNumber * monthPeriods.length);
      }
    }
    var totalCu = explicitTotal || derivedTotal;
    var displayCu = '';
    if(assigned === periods.length){
      if(totalCu) displayCu = totalCu + ' CU total';
      else if(uniformCu && firstCu) displayCu = String(firstCu) + ' CU';
      else displayCu = 'Mixed CU';
    }
    return {
      selected: assigned === periods.length,
      partial: assigned > 0 && assigned < periods.length,
      cu: firstCu || '1',
      uniformCu: uniformCu,
      editCu: totalCu || firstCu || '1',
      displayCu: displayCu
    };
  }

  function tradeWindowCellHref(list, goodKey, windowKey, stance){
    var state = tradeWindowState(list, goodKey, windowKey, stance);
    var entry = tradeEntryFor(list, stance, goodKey);
    var defaultCu = (state && state.editCu) ? state.editCu : '1';
    var noteState = tradeWindowNoteState(entry, windowKey);
    if(state && state.selected){
      return commandExpr(
          'tradeWindow --good ' + goodKey
        + ' --window ' + windowKey
        + ' --stance ' + stance
        + ' --action ' + tradeEditActionValue(defaultCu, noteState.value)
      );
    }
    return commandExpr(
      'tradeWindow --good ' + goodKey
      + ' --window ' + windowKey
      + ' --stance ' + stance
      + ' --action ' + tradeSetActionValue(defaultCu, '')
    );
  }

  function tradeWindowCellStyle(selected, partial, stance){
    var style = tradeMatrixCellStyle(selected, stance);
    if(partial && !selected){
      style += 'background:rgba(0,0,0,0.08);border-style:dashed;';
    }
    return style;
  }

  function renderTradeWindowPresetCell(list, goodKey, windowKey, stance){
    var state = tradeWindowState(list, goodKey, windowKey, stance) || { selected:false, partial:false, cu:'1', uniformCu:true, editCu:'1', displayCu:'' };
    var entry = tradeEntryFor(list, stance, goodKey);
    var noteState = tradeWindowNoteState(entry, windowKey);
    var label = windowShortLabel(windowKey);
    var titleText = '';
    if(state.selected || state.partial){
      titleText = tradeEntryTooltip(
        entry,
        label,
        state.displayCu || (state.uniformCu ? (String(state.cu) + ' CU') : 'Mixed CU'),
        noteState.mixed ? 'Mixed notes' : noteState.label
      );
    }
    return '<td style="padding:0;">'
      + '<a href="' + hrefAttr(tradeWindowCellHref(list, goodKey, windowKey, stance)) + '"'
      + (titleText ? (' title="' + esc(titleText) + '"') : '')
      + ' style="' + tradeWindowCellStyle(state.selected, state.partial, stance) + '">'
      + '<div style="font-size:11px;line-height:1.1;font-weight:bold;">' + esc(label) + '</div>'
      + (state.selected
        ? ('<div style="margin-top:3px;font-size:10px;line-height:1.1;">' + esc(state.displayCu || (state.uniformCu ? (String(state.cu) + ' CU') : 'Mixed CU')) + '</div>')
        : '<div style="margin-top:3px;font-size:10px;line-height:1.1;">&nbsp;</div>')
      + '</a>'
      + '</td>';
  }

  function renderTradeSeasonMatrix(list, good){
    var html = '<div style="margin-top:6px;overflow-x:auto;">';
    html += '<table style="width:auto;min-width:100%;border-collapse:collapse;font-size:11px;">';
    html += '<tr>';
    html += '<th style="padding:4px 6px;border:1px solid rgba(0,0,0,0.18);background:rgba(0,0,0,0.06);text-align:left;width:72px;">Season</th>';
    for(var i=0;i<WINDOW_PRESETS.length;i++){
      html += '<th style="padding:5px 6px;border:1px solid rgba(0,0,0,0.18);background:rgba(0,0,0,0.06);text-align:center;font-size:12px;font-weight:bold;min-width:64px;">'
        + esc(windowShortLabel(WINDOW_PRESETS[i].key))
        + '</th>';
    }
    html += '</tr>';
    for(var si=0;si<TRADE_STANCE_ORDER.length;si++){
      var stance = TRADE_STANCE_ORDER[si];
      html += '<tr>';
      html += '<td style="padding:4px 6px;border:1px solid rgba(0,0,0,0.18);background:rgba(0,0,0,0.04);font-weight:bold;">' + esc(tradeStanceLabel(stance)) + '</td>';
      for(var wi=0;wi<WINDOW_PRESETS.length;wi++){
        html += renderTradeWindowPresetCell(list, good.key, WINDOW_PRESETS[wi].key, stance);
      }
      html += '</tr>';
    }
    html += '</table>';
    html += '</div>';
    return html;
  }

  function renderTradeMatrixCell(list, goodKey, periodKey, stance){
    var current = tradePeriodState(list, goodKey, periodKey);
    var selected = !!(current && current.stance === stance);
    var titleText = selected
      ? tradeEntryTooltip(current.entry, periodLabel(periodKey), String(current.cu || '') + ' CU', tradeNoteLabel(current.note))
      : '';
    return '<td style="padding:0;">'
      + '<a href="' + hrefAttr(tradeMatrixCellHref(list, goodKey, periodKey, stance)) + '"'
      + (titleText ? (' title="' + esc(titleText) + '"') : '')
      + ' style="' + tradeMatrixCellStyle(selected, stance) + '">'
      + '<div style="font-size:16px;line-height:1;">' + (selected ? '&#9679;' : '&#9675;') + '</div>'
      + (selected
        ? ('<div style="margin-top:3px;font-size:11px;line-height:1.1;">' + esc(String(current.cu || '')) + ' CU</div>')
        : '<div style="margin-top:3px;font-size:11px;line-height:1.1;">&nbsp;</div>')
      + '</a>'
      + '</td>';
  }

  function renderTradeGoodsMatrix(list, good){
    var html = '<div style="margin-top:6px;overflow-x:auto;">';
    html += '<table style="width:auto;min-width:100%;border-collapse:collapse;font-size:12px;">';
    html += '<tr>';
    html += '<th style="padding:4px 6px;border:1px solid rgba(0,0,0,0.18);background:rgba(0,0,0,0.06);text-align:left;width:72px;">List</th>';
    for(var i=0;i<CALENDAR_PERIODS.length;i++){
      var periodKey = CALENDAR_PERIODS[i].key;
      html += '<th style="' + calendarHeaderCellStyle(periodKey) + '">'
        + '<span title="' + esc(periodLabel(periodKey)) + '" style="display:block;line-height:1.1;font-size:16px;">' + calendarHeaderToken(periodKey) + '</span>'
        + '</th>';
    }
    html += '</tr>';

    for(var si=0;si<TRADE_STANCE_ORDER.length;si++){
      var stance = TRADE_STANCE_ORDER[si];
      html += '<tr>';
      html += '<td style="padding:4px 6px;border:1px solid rgba(0,0,0,0.18);background:rgba(0,0,0,0.04);font-weight:bold;">' + esc(tradeStanceLabel(stance)) + '</td>';
      for(var pi=0;pi<CALENDAR_PERIODS.length;pi++){
        html += renderTradeMatrixCell(list, good.key, CALENDAR_PERIODS[pi].key, stance);
      }
      html += '</tr>';
    }

    html += '</table>';
    html += '</div>';
    return html;
  }

  function resolveTradeGroupForPanel(pid){
    var groupKey = currentTradeGroup(pid);
    if(groupKey && TRADE_GOOD_GROUP_MAP[groupKey]) return groupKey;
    var groups = sortedTradeGoodGroups();
    return groups.length ? String(groups[0].key || '') : '';
  }

  function renderTradeGoodsCategoryIndex(pid, activeGroupKey){
    var html = '<div style="margin-top:10px;"><b>Category Index</b></div>';
    html += '<div style="margin-top:6px;">' + inlineActionLink(tradeCategoryCustomHref(), 'Add Custom Entry', false) + '</div>';
    html += '<div style="margin-top:10px;"><b>Toggle Trade Category Selections</b></div>';
    html += '<div style="margin-top:6px;">';
    sortedTradeGoodGroups().forEach(function(group){
      var selected = String(group.key || '') === String(activeGroupKey || '');
      var marker = selected ? '[x] ' : '[ ] ';
      html += compactToggleLink(tradePanelHref(group.key), marker + group.label, selected);
    });
    html += '</div>';
    html += '<div style="margin-top:10px;"><b>Toggle Trade Category Selections</b></div>';
    return html;
  }

  function renderTradeGoodsSelectionToolbar(pid, activeGroupKey){
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Each category includes a season matrix plus full calendar matrix. Use the selectable list below (including custom entries), then set Cargo Units directly on the matrices and attach note text to each season, month, or festival transaction.</div>';
    html += renderTradeGoodsCategoryIndex(pid, activeGroupKey);
    html += '</div>';
    return html;
  }

  function renderTradeCategoryControls(pid, groupKey){
    var html = '<div style="margin-top:8px;">';
    html += inlineActionLink(tradeCategoryClearHref(groupKey), 'Clear Calendar', false);
    html += '</div>';
    return html;
  }

  function renderTradeGoodsSelectionCategories(list, pid, activeGroupKey){
    var group = TRADE_GOOD_GROUP_MAP[activeGroupKey] ? findByKey(TRADE_GOOD_GROUPS, activeGroupKey) : null;
    if(!group){
      return '<div style="' + (cssVars().card || '') + '"><div><i>No trade-goods categories are available.</i></div></div>';
    }
    var html = '';
    var target = tradeCategoryTarget(group);
    var cardStyle = (cssVars().card || '');
    var topUrl = '';
    html += '<div style="' + cardStyle + '">';
    html += '<div style="' + prominentHeadingStyle() + 'margin:0 0 6px 0;">' + esc(group.label) + '</div>';
    html += '<div style="margin-top:4px;">' + esc(tradeGoodGroupDescription(group.key)) + '</div>';
    html += muted('Use the category-wide grids below to record general trade posture for the entire ' + lower(group.label) + ' category.');
    html += renderTradeSeasonMatrix(list, target);
    html += renderTradeGoodsMatrix(list, target);
    html += renderTradeCategoryControls(pid, group.key);
    html += handoutBackToTopLink('trade_top', topUrl);
    html += '</div>';
    return html;
  }

  function tradeCategoryEchoLines(list, groupKey, stance){
    var entry = tradeEntryFor(list, stance, tradeGroupTargetKey(groupKey));
    if(!entry) return [];
    return templateTradeWindowLabels(entry).map(function(windowText){
      return windowText;
    });
  }

  function tradeCategoryEchoNote(list, groupKey, stance){
    var entry = tradeEntryFor(list, stance, tradeGroupTargetKey(groupKey));
    return entry ? templateTradeEntryNote(entry) : '';
  }

  function tradeCategoryHasValues(list, groupKey){
    for(var i=0;i<TRADE_STANCE_ORDER.length;i++){
      if(tradeEntryFor(list, TRADE_STANCE_ORDER[i], tradeGroupTargetKey(groupKey))) return true;
    }
    return false;
  }

  function renderTradeCategoryEchoSummary(list){
    var groups = sortedTradeGoodGroups();
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Current Values (All Trade Categories)</b></div>';
    var rendered = 0;
    for(var i=0;i<groups.length;i++){
      var group = groups[i];
      if(!tradeCategoryHasValues(list, group.key)) continue;
      rendered += 1;
      html += '<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(0,0,0,0.14);">';
      html += '<div><b>' + esc(group.label) + '</b></div>';
      for(var si=0;si<TRADE_STANCE_ORDER.length;si++){
        var stance = TRADE_STANCE_ORDER[si];
        if(!tradeEntryFor(list, stance, tradeGroupTargetKey(group.key))) continue;
        var lines = tradeCategoryEchoLines(list, group.key, stance);
        var note = tradeCategoryEchoNote(list, group.key, stance);
        html += '<div style="margin-top:4px;"><b>' + esc(tradeStanceLabel(stance)) + ':</b></div>';
        html += '<ul style="margin:2px 0 0 18px;padding:0;">';
        for(var li=0;li<lines.length;li++){
          html += '<li style="margin:2px 0;">' + esc(lines[li]) + '</li>';
        }
        html += '</ul>';
        if(note){
          html += '<div style="margin-top:2px;"><i>Note: ' + esc(note) + '</i></div>';
        }
      }
      html += '</div>';
    }
    if(!rendered){
      html += '<div style="margin-top:6px;"><i>No trade category values are currently set.</i></div>';
    }
    html += '</div>';
    return html;
  }

  function tradeHandoutName(pid, session){
    var token = session ? tokenDisplayName(getObj('graphic', session.tokenId), session.tokenId) : 'Location';
    return TRADE_PANEL_TITLE + ' - ' + token + ' - ' + playerName(pid || '');
  }

  function renderTradeHandoutNotes(pid, session, activeGroupKey){
    var list = normalizeTradeGoods((session && session.data && session.data.tradeGoods) || []);
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += handoutTopAnchor('trade_top');
    html += '<h3 style="margin:0 0 8px 0;">Map Point Wizard Trade Categories</h3>';
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += renderTradeGoodsSelectionToolbar(pid, activeGroupKey);
    html += renderTradeGoodsSelectionCategories(list, pid, activeGroupKey);
    html += renderTradeCategoryEchoSummary(list);
    html += '<div style="' + (cssVars().card || '') + '"><i>This handout can be closed when finished.</i></div>';
    html += '</div>';
    return html;
  }

  function ensureTradeHandout(pid, session){
    if(!session) return null;
    var activeGroupKey = resolveTradeGroupForPanel(pid);
    setTradeGroup(pid, activeGroupKey);
    var handout = currentTradeHandout(pid);
    if(!handout){
      handout = createObj('handout', {
        name: tradeHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        archived: false
      });
      if(!handout) return null;
      setTradeHandoutId(pid, handout.id);
    }
    try{
      handout.set({
        name: tradeHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        notes: renderTradeHandoutNotes(pid, session, activeGroupKey)
      });
    }catch(e){
      log('fts_mapPointWizard ensureTradeHandout err: ' + e);
      return null;
    }
    return {
      handout: handout,
      activeGroupKey: activeGroupKey,
      url: handoutJournalUrl(handout.id, 'trade_top')
    };
  }

  function renderTradeHandoutOpenLink(url, label){
    return renderHandoutOpenLink(url, label);
  }

  function renderTradeGoodsSelectionFooter(pid){
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += actionLink(commandExpr('tradeClear'), 'Clear All Trade Calendars', false);
    html += '</div>';
    html += renderSectionNavigation(pid);
    return html;
  }

  function renderTradeGoodsSelectionPanel(pid, session){
    var handoutState = ensureTradeHandout(pid, session);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Trade category calendars are edited in an ephemeral handout for easier viewing and scrolling.</div>';
    if(handoutState && handoutState.url){
      html += renderTradeHandoutOpenLink(handoutState.url, 'Open ' + TRADE_PANEL_TITLE + ' Handout');
    }else{
      html += '<div style="margin-top:6px;">Could not open the trade handout right now.</div>';
    }
    html += '</div>';
    html += renderTradeGoodsSelectionFooter(pid);
    html += endShell();
    return html;
  }

  function renderTradeGoodsSelectionLauncher(pid){
    setView(pid, 'bind');
    return renderBindSectionPanel(pid);
  }

  function multiHandoutName(pid, session, field){
    var token = session ? tokenDisplayName(getObj('graphic', session.tokenId), session.tokenId) : 'Location';
    return chooserFieldLabel(field) + ' - ' + token + ' - ' + playerName(pid || '');
  }

  function renderMultiHandoutNotes(pid, session, field){
    field = normalizeKey(field || '');
    var anchor = 'multi_' + field + '_top';
    var values = uniqueStrings((session && session.data && session.data[field]) || []);
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += handoutTopAnchor(anchor);
    html += '<h3 style="margin:0 0 8px 0;">Map Point Wizard ' + esc(chooserFieldLabel(field)) + '</h3>';
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Handout</b></div>';
    html += '<div style="margin-top:4px;">Use the toggle list below to add or remove entries for this category.</div>';
    html += '<div style="margin-top:4px;">Selected entries: <b>' + String(values.length) + '</b></div>';
    html += '<div style="margin-top:6px;">' + inlineActionLink(multiCustomHref(field), 'Add Custom Entry', false) + '</div>';
    if(values.length){
      html += '<div style="margin-top:6px;">' + inlineActionLink(commandExpr('multiClear --field ' + field), 'Clear ' + chooserFieldLabel(field), false) + '</div>';
    }
    html += '</div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:10px;"><b>Toggle Selections</b></div>';
    html += renderCompactMultiToggleList(field, session);
    html += '</div>';
    html += '<div style="' + (cssVars().card || '') + '"><i>This handout can be closed when finished.</i></div>';
    html += '</div>';
    return html;
  }

  function ensureMultiHandout(pid, session, field){
    if(!session || !isMultiHandoutField(field)) return null;
    field = normalizeKey(field || '');
    var handout = currentMultiHandout(pid, field);
    if(!handout){
      handout = createObj('handout', {
        name: multiHandoutName(pid, session, field),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        archived: false
      });
      if(!handout) return null;
      setMultiHandoutId(pid, field, handout.id);
    }
    try{
      handout.set({
        name: multiHandoutName(pid, session, field),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        notes: renderMultiHandoutNotes(pid, session, field)
      });
    }catch(e){
      log('fts_mapPointWizard ensureMultiHandout err: ' + e);
      return null;
    }
    return {
      handout: handout,
      url: handoutJournalUrl(handout.id, 'multi_' + field + '_top')
    };
  }

  function renderMultiHandoutChooserPanel(field, pid, session){
    var handoutState = ensureMultiHandout(pid, session, field);
    var values = uniqueStrings((session && session.data && session.data[field]) || []);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Chat Panel</b></div>';
    html += '<div style="margin-top:4px;">Toggle lists for ' + esc(chooserFieldLabel(field)) + ' are edited in an ephemeral handout.</div>';
    html += '<div style="margin-top:4px;">Selected entries: <b>' + String(values.length) + '</b></div>';
    if(handoutState && handoutState.url){
      html += renderHandoutOpenLink(handoutState.url, 'Open ' + chooserFieldLabel(field) + ' Handout');
    }else{
      html += '<div style="margin-top:6px;">Could not open the handout right now.</div>';
    }
    html += '</div>';
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function chooserFieldLabel(field){
    if(field === 'template') return 'Template';
    if(field === 'region') return 'Region';
    if(field === 'locale') return 'Locale';
    if(field === 'development') return 'Development';
    if(field === 'wealth') return 'Wealth';
    return MULTI_LIBRARY[field] ? MULTI_LIBRARY[field].label : titleCaseToken(field);
  }

  function singleFieldOptionsForChooser(field, session){
    if(field === 'template') return templateOptionsForSession(session);
    if(field === 'region') return regionOptions();
    if(field === 'locale') return localeOptionsForRegion((session && session.data && session.data.region) || '');
    if(field === 'development') return DEVELOPMENT_TIERS.map(function(tier){
      return { key:tier.value, label:tier.label + ' (' + tier.value + ')' };
    });
    if(field === 'wealth') return WEALTH_TIERS.map(function(tier){
      return { key:tier.value, label:tier.label + ' (' + tier.value + ')' };
    });
    return [];
  }

  function singleChooserUsesPopupDropdown(field){
    field = normalizeKey(field || '');
    return field === 'region' || field === 'locale' || field === 'development' || field === 'wealth';
  }

  function singleChooserPopupOptions(field, session){
    var options = sortedSingleChooserOptions(field, session);
    var out = [];
    for(var i=0;i<options.length;i++){
      out.push({
        label: optionButtonLabel(field, options[i]),
        value: String(options[i].key || '')
      });
    }
    out.push({ label:'None', value:'clear' });
    return out;
  }

  function singleChooserPopupHref(field, session){
    var options = singleChooserPopupOptions(field, session);
    if(!options.length) return '';
    return commandExpr('pick --field ' + field + ' --value ' + buildRollQuery('Choose ' + chooserFieldLabel(field), options));
  }

  function sortedSingleChooserOptions(field, session){
    var options = singleFieldOptionsForChooser(field, session);
    if(field === 'development' || field === 'wealth'){
      return options.slice().sort(function(a, b){
        var left = asInt((a && a.key) || '');
        var right = asInt((b && b.key) || '');
        if(left !== null && right !== null) return left - right;
        if(left !== null) return -1;
        if(right !== null) return 1;
        return alphaNumericCompare(String((a && a.label) || ''), String((b && b.label) || ''));
      });
    }
    return options.slice().sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
  }

  function sortedMultiChooserOptions(field){
    var library = MULTI_LIBRARY[field];
    var options = library && Array.isArray(library.options) ? library.options.slice() : [];
    options.sort(function(a, b){
      return alphaNumericCompare(optionButtonLabel(field, a), optionButtonLabel(field, b));
    });
    return options;
  }

  function optionButtonLabel(field, option){
    option = option || {};
    var label = String(option.label || option.key || '').trim();
    if((field === 'offense_types' || field === 'defense_types') && option.score){
      label += ' (+' + option.score + ' pts)';
    }
    return label;
  }

  function chooserFieldDescription(field, session){
    if(field === 'template'){
      return 'Map point templates are organized in category/subtype form in the templates handout. Templates are suggested but optional.';
    }
    if(field === 'region'){
      return 'Loaded region modules define the available regions.';
    }
    if(field === 'locale'){
      return session.data.region
        ? 'Locales are limited to the currently selected region.'
        : 'Choose a region first to load its available locales.';
    }
    if(field === 'development' || field === 'wealth'){
      return 'These fields stay on the standardized five-step location scale.';
    }
    if(field === 'offense_types' || field === 'defense_types'){
      return 'Each selected type adds weighted points. The overall strength tier updates automatically.';
    }
    return 'Built-in options are alphabetized. Add custom entries when this location needs something local or unusual.';
  }

  function renderChooserToolbar(field, session){
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>How to Use This Chat Panel</b></div>';
    html += '<div style="margin-top:4px;">' + esc(chooserFieldDescription(field, session)) + '</div>';
    if(MULTI_LIBRARY[field]){
      html += '<div style="margin-top:4px;">Use the selectable list below for canonical entries, and use <b>Add Custom Entry</b> when this location needs something local or unusual.</div>';
    }else if(singleChooserUsesPopupDropdown(field)){
      html += '<div style="margin-top:4px;">Use the <b>Select ' + esc(chooserFieldLabel(field)) + '</b> button below to open a popup dropdown.</div>';
    }else{
      html += '<div style="margin-top:4px;">Click a list entry to set it. The selected value updates immediately.</div>';
    }
    html += '</div>';
    return html;
  }

  function renderSingleChooserSection(field, session){
    var options = sortedSingleChooserOptions(field, session);
    var current = session.data[field] || '';
    var html = '';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;"><b>Current:</b> ' + esc(current ? valueLabel(field, current, session) : 'Not set') + '</div>';
    if(field === 'locale' && !session.data.region){
      html += muted('<i>Choose a region first.</i>');
    }
    if(!options.length){
      html += muted('<i>No options available yet.</i>');
      html += '</div>';
      return html;
    }
    if(singleChooserUsesPopupDropdown(field)){
      var popupHref = singleChooserPopupHref(field, session);
      if(popupHref){
        html += '<div style="margin-top:8px;">' + inlineActionLink(popupHref, 'Select ' + chooserFieldLabel(field), false) + '</div>';
      }else{
        html += muted('<i>No options available yet.</i>');
      }
      html += '</div>';
      return html;
    }
    html += '<div style="margin-top:8px;">';
    for(var i=0;i<options.length;i++){
      var selected = String(options[i].key) === String(current || '');
      var marker = selected ? '[x] ' : '[ ] ';
      html += compactToggleLink(
        commandExpr('pick --field ' + field + ' --value ' + encodeCommandValue(options[i].key)),
        marker + optionButtonLabel(field, options[i]),
        selected
      );
    }
    var noneSelected = !String(current || '');
    html += compactToggleLink(
      commandExpr('pick --field ' + field + ' --value clear'),
      (noneSelected ? '[x] ' : '[ ] ') + 'None',
      noneSelected
    );
    html += '</div>';
    html += '</div>';
    return html;
  }

  function isCompactToggleField(field){
    field = normalizeKey(field || '');
    return (
      field === 'cultures'
      || field === 'faiths'
      || field === 'factions'
      || field === 'allies'
      || field === 'enemies'
      || field === 'offense_types'
      || field === 'defense_types'
    );
  }

  function compactToggleTone(selected){
    var palette = currentPaletteName();
    var map = {
      none:      { fg:'#1f2a37', bg:'rgba(80,92,108,0.05)',   border:'rgba(80,92,108,0.28)',   bgSelected:'rgba(80,92,108,0.18)',   borderSelected:'rgba(80,92,108,0.48)' },
      dark:      { fg:'#ece7ff', bg:'rgba(155,109,255,0.08)', border:'rgba(155,109,255,0.34)', bgSelected:'rgba(155,109,255,0.20)', borderSelected:'rgba(155,109,255,0.56)' },
      mint:      { fg:'#163122', bg:'rgba(82,125,82,0.08)',   border:'rgba(82,125,82,0.34)',   bgSelected:'rgba(82,125,82,0.20)',   borderSelected:'rgba(82,125,82,0.56)' },
      parchment: { fg:'#3b2811', bg:'rgba(154,110,55,0.08)',  border:'rgba(154,110,55,0.34)',  bgSelected:'rgba(154,110,55,0.20)',  borderSelected:'rgba(154,110,55,0.56)' },
      powder:    { fg:'#113149', bg:'rgba(122,167,217,0.08)', border:'rgba(122,167,217,0.34)', bgSelected:'rgba(122,167,217,0.22)', borderSelected:'rgba(122,167,217,0.58)' },
      rosebud:   { fg:'#4a0f2b', bg:'rgba(186,46,104,0.08)',  border:'rgba(186,46,104,0.34)',  bgSelected:'rgba(186,46,104,0.22)',  borderSelected:'rgba(186,46,104,0.58)' }
    };
    var tone = map[palette] || map.none;
    return {
      color: tone.fg,
      background: selected ? tone.bgSelected : tone.bg,
      border: selected ? tone.borderSelected : tone.border
    };
  }

  function compactToggleLink(href, label, selected, titleText){
    var tone = compactToggleTone(selected);
    var style = 'display:block;margin-top:4px;padding:4px 6px;text-decoration:none;line-height:1.25;'
      + 'border:1px solid ' + tone.border + ';background:' + tone.background + ';color:' + tone.color + ';'
      + 'border-radius:4px;text-align:left;';
    style += selected ? 'font-weight:bold;' : '';
    var attrs = ' href="' + hrefAttr(href) + '" style="' + style + '"' + (titleText ? (' title="' + esc(titleText) + '"') : '');
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, style);
      if(titleText && !/\stitle="/i.test(attrs)){
        attrs += ' title="' + esc(titleText) + '"';
      }
    }
    return '<a' + attrs + '>' + esc(label) + '</a>';
  }

  function compactToggleOptions(field, session){
    var values = uniqueStrings((session && session.data && session.data[field]) || []);
    var options = sortedMultiChooserOptions(field).map(function(option){
      return {
        key: String(option.key || ''),
        label: selectedValueText(field, option.key, session)
      };
    });
    var seen = {};
    for(var i=0;i<options.length;i++){
      seen[String(options[i].key || '')] = true;
    }
    for(var j=0;j<values.length;j++){
      var value = String(values[j] || '');
      if(!value || seen[value]) continue;
      seen[value] = true;
      options.push({
        key: value,
        label: selectedValueText(field, value, session)
      });
    }
    options.sort(function(a, b){
      return alphaNumericCompare(String(a.label || ''), String(b.label || ''));
    });
    return options;
  }

  function renderCompactMultiToggleList(field, session){
    var values = session.data[field] || [];
    var options = compactToggleOptions(field, session);
    var html = '<div style="margin-top:6px;">';
    for(var i=0;i<options.length;i++){
      var selected = values.indexOf(options[i].key) !== -1;
      var action = selected ? 'multiRemove' : 'multiAdd';
      var marker = selected ? '[x] ' : '[ ] ';
      html += compactToggleLink(
        commandExpr(action + ' --field ' + field + ' --value ' + encodeCommandValue(options[i].key)),
        marker + optionButtonLabel(field, options[i]),
        selected
      );
    }
    html += '</div>';
    return html;
  }

  function renderMultiChooserSelectionRows(field, session){
    var values = session.data[field] || [];
    if(!values.length) return muted('<i>None selected.</i>');
    var html = '<div style="margin-top:6px;">';
    for(var i=0;i<values.length;i++){
      var value = values[i];
      var titleText = 'Remove ' + selectedValueText(field, value, session) + ' from ' + chooserFieldLabel(field);
      html += '<div style="margin-top:6px;padding:8px;border:1px solid rgba(0,0,0,0.12);background:rgba(255,255,255,0.55);">';
      html += '<div><span style="display:inline-block;max-width:88%;vertical-align:top;"><b>' + esc(selectedValueText(field, value, session)) + '</b></span>'
         + '<span style="float:right;">' + iconActionLink(commandExpr('multiRemove --field ' + field + ' --value ' + encodeCommandValue(value)), '&#10005;', titleText) + '</span></div>';
      html += '<div style="clear:both;"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderMultiChooserSection(field, session){
    var library = MULTI_LIBRARY[field];
    var values = session.data[field] || [];
    var toggleCategoryLabel = (function(){
      var map = {
        cultures:'Culture',
        faiths:'Faith',
        factions:'Faction',
        allies:'Ally',
        enemies:'Enemy',
        offense_types:'Offense Type',
        defense_types:'Defense Type'
      };
      return map[normalizeKey(field || '')] || chooserFieldLabel(field);
    }());
    var toggleHeading = 'Toggle ' + toggleCategoryLabel + ' Selections';
    var html = '';
    html += '<div style="' + (cssVars().card || '') + '">';
    if(isCompactToggleField(field)){
      html += '<div style="margin-top:4px;"><b>Selected:</b> ' + esc(String(values.length)) + '</div>';
      html += '<div style="margin-top:6px;">' + inlineActionLink(multiCustomHref(field), 'Add Custom Entry', false) + '</div>';
      html += '<div style="margin-top:10px;"><b>' + esc(toggleHeading) + '</b></div>';
      html += renderCompactMultiToggleList(field, session);
      html += '<div style="margin-top:10px;"><b>' + esc(toggleHeading) + '</b></div>';
    }else{
      html += '<div style="margin-top:6px;"><b>Current Selections</b></div>';
      html += renderMultiChooserSelectionRows(field, session);
      html += '<div style="margin-top:6px;">' + inlineActionLink(multiCustomHref(field), 'Add Custom Entry', false);
      if(values.length){
        html += inlineActionLink(commandExpr('multiClear --field ' + field), 'Clear ' + library.label, false);
      }
      html += '</div>';
      html += '<div style="margin-top:10px;"><b>Built-In Options</b></div>';
      var options = sortedMultiChooserOptions(field);
      html += renderActionGrid(options.map(function(option){
        var selected = values.indexOf(option.key) !== -1;
        var action = selected ? 'multiRemove' : 'multiAdd';
        return {
          href: commandExpr(action + ' --field ' + field + ' --value ' + encodeCommandValue(option.key)),
          label: optionButtonLabel(field, option),
          selected: selected
        };
      }), 2);
      html += '<div style="margin-top:10px;">' + actionLink(commandExpr('multiClear --field ' + field), 'Reset', false) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderChooserEditorPanel(field, pid, session){
    if(isMultiHandoutField(field)){
      return renderMultiHandoutChooserPanel(field, pid, session);
    }
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += renderChooserToolbar(field, session);
    if(MULTI_LIBRARY[field]) html += renderMultiChooserSection(field, session);
    else html += renderSingleChooserSection(field, session);
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function renderChooserLauncher(field, pid){
    setView(pid, 'bind');
    return renderBindSectionPanel(pid);
  }

  function renderChooserViewPanel(field, pid){
    var session = currentSession(pid);
    if(currentBlankView(pid)) session = null;
    return session ? renderChooserEditorPanel(field, pid, session) : renderChooserLauncher(field, pid);
  }

  function renderReviewBlock(session){
    var data = session.data;
    var template = resolveTemplateRecord(data.template);
    var rows = [];
    function row(label, value){
      rows.push('<div style="margin-top:4px;"><b>' + esc(label) + ':</b> ' + value + '</div>');
    }
    function listValue(field){
      var values = data[field] || [];
      if(!values.length) return '<i>none</i>';
      return values.map(function(value){
        return esc(selectedValueText(field, value, session));
      }).join('<br>');
    }
    function tradeValue(bucket){
      var entries = tradeEntriesForStance(data.tradeGoods || [], bucket);
      if(!entries.length) return '<i>none</i>';
      return entries.map(function(entry){
        var lines = tradeScheduleLinesForReview(entry).map(function(line){
            return esc(line);
          });
        return '<b>' + esc(tradeGoodLabel(entry.goodKey)) + '</b><br>' + lines.join('<br>');
      }).join('<br>');
    }
    function poiValue(){
      var list = normalizePoiEntries(data.poi || []);
      if(!list.length) return '<i>none</i>';
      return list.map(function(entry){
        return esc(poiCategoryLabel(entry.category) + ': ' + entry.label + ' (' + entry.count + ')');
      }).join('<br>');
    }

    row('Template', esc(template ? template.displayLabel : 'None selected'));
    row('Template Category', esc(template ? templateCategoryLabel(template.categoryKey || '') : templateCategoryLabel(data.template_category || '')));
    row('Point Type', esc(pointTypeLabel(data.point_type || (template ? template.pointType : defaultPointTypeForCategory(data.template_category || '')))));
    row('Name', esc(data.name || ''));
    row('Region', esc(resolveRegionLabel(data.region)));
    row('Locale', esc(resolveLocaleLabel(data.region, data.locale)));
    var popRange = template ? String(template.populationRange || '') : '';
    if(!popRange){
      popRange = templatePopulationRange(data.population || 0, (template && template.categoryKey) || data.template_category || '').label;
    }
    row('Population', esc(String(data.population || '') + ' [' + popRange + ']'));
    row('Development', esc(data.development + ' - ' + valueLabel('development', data.development, session)));
    row('Wealth', esc(data.wealth + ' - ' + valueLabel('wealth', data.wealth, session)));
    row('Culture', listValue('cultures'));
    row('Faith & Deities', listValue('faiths'));
    row('Prominent Factions', listValue('factions'));
    row('Prominent Allies', listValue('allies'));
    row('Prominent Enemies', listValue('enemies'));
    row('Points of Interest', poiValue());
    row('Offense Strength', esc(strengthSummaryText('offense', data)));
    row('Offense Types', listValue('offense_types'));
    row('Defense Strength', esc(strengthSummaryText('defense', data)));
    row('Defense Types', listValue('defense_types'));
    row('Trade Has', tradeValue('has'));
    row('Trade Wants', tradeValue('wants'));
    row('Trade Needs', tradeValue('needs'));
    row('Tooltip Preview', esc(buildTooltipText(session)).replace(/[\n\u2028]/g, '<br>'));
    return '<div style="margin-top:6px;">' + rows.join('') + '</div>';
  }

  function renderStatusBanner(pid){
    var status = currentStatus(pid);
    if(!status || !status.text) return '';
    var palette = currentPaletteName();
    var toneMap = {
      info:{
        none:      { border:'rgba(44, 90, 160, 0.48)', bg:'rgba(44, 90, 160, 0.14)', text:'#19314f', title:'Notice' },
        dark:      { border:'rgba(136, 170, 255, 0.65)', bg:'rgba(98, 129, 210, 0.22)', text:'#edf3ff', title:'Notice' },
        mint:      { border:'rgba(46, 92, 131, 0.58)', bg:'rgba(64, 126, 175, 0.16)', text:'#0f334f', title:'Notice' },
        parchment: { border:'rgba(94, 79, 126, 0.58)', bg:'rgba(118, 104, 156, 0.16)', text:'#35265a', title:'Notice' },
        powder:    { border:'rgba(43, 85, 129, 0.62)', bg:'rgba(69, 126, 184, 0.18)', text:'#173a5b', title:'Notice' },
        rosebud:   { border:'rgba(98, 66, 132, 0.60)', bg:'rgba(121, 88, 158, 0.18)', text:'#2f1f4f', title:'Notice' }
      },
      error:{
        none:      { border:'rgba(160, 32, 32, 0.75)', bg:'rgba(160, 32, 32, 0.22)', text:'#681515', title:'Attention' },
        dark:      { border:'rgba(255, 125, 125, 0.80)', bg:'rgba(160, 55, 55, 0.32)', text:'#ffe9e9', title:'Attention' },
        mint:      { border:'rgba(171, 42, 42, 0.78)', bg:'rgba(177, 58, 58, 0.24)', text:'#6a1111', title:'Attention' },
        parchment: { border:'rgba(171, 58, 40, 0.80)', bg:'rgba(184, 74, 52, 0.24)', text:'#661b11', title:'Attention' },
        powder:    { border:'rgba(171, 41, 41, 0.80)', bg:'rgba(184, 67, 67, 0.24)', text:'#621515', title:'Attention' },
        rosebud:   { border:'rgba(171, 34, 67, 0.82)', bg:'rgba(183, 50, 83, 0.26)', text:'#5f0f2c', title:'Attention' }
      },
      success:{
        none:      { border:'rgba(30, 120, 58, 0.72)', bg:'rgba(30, 120, 58, 0.20)', text:'#124c25', title:'Notice' },
        dark:      { border:'rgba(122, 230, 156, 0.78)', bg:'rgba(58, 129, 90, 0.30)', text:'#e8fff0', title:'Notice' },
        mint:      { border:'rgba(35, 116, 60, 0.74)', bg:'rgba(43, 129, 75, 0.22)', text:'#0e4b25', title:'Notice' },
        parchment: { border:'rgba(67, 123, 46, 0.74)', bg:'rgba(88, 133, 63, 0.22)', text:'#274719', title:'Notice' },
        powder:    { border:'rgba(31, 116, 83, 0.76)', bg:'rgba(40, 128, 95, 0.22)', text:'#0f4b33', title:'Notice' },
        rosebud:   { border:'rgba(38, 118, 70, 0.78)', bg:'rgba(56, 134, 87, 0.24)', text:'#104629', title:'Notice' }
      }
    };
    var level = String(status.level || 'info').toLowerCase();
    if(level !== 'error' && level !== 'success') level = 'info';
    var paletteTones = toneMap[level] || toneMap.info;
    var tone = paletteTones[palette] || paletteTones.none;
    return '<div style="' + (cssVars().card || '')
      + 'border:2px solid ' + tone.border + ';background:' + tone.bg + ';color:' + tone.text + ';'
      + 'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14);">'
      + '<div><b>' + tone.title + '</b></div>'
      + '<div style="margin-top:4px;">' + esc(status.text) + '</div>'
      + '</div>';
  }

  function renderPendingFinishChoice(session){
    var pending = session && session.pendingFinishChoice;
    if(!pending) return '';
    var originalHref = commandExpr('finish --force yes --token ' + String(pending.originalTokenId || ''));
    var currentHref = pending.currentTokenId
      ? commandExpr('finish --force yes --token ' + String(pending.currentTokenId || ''))
      : '';
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Save Selection Check</b></div>';
    html += '<div style="margin-top:4px;">This session started on <b>' + esc(pending.originalLabel || 'Original Token') + '</b>.</div>';
    html += '<div style="margin-top:4px;">Current selection: <b>' + esc(pending.currentLabel || 'No token selected') + '</b>.</div>';
    html += '<div style="margin-top:4px;">Choose where these changes should be written.</div>';
    html += actionLink(originalHref, 'Save to Original Token', false);
    if(currentHref && String(pending.currentTokenId || '') !== String(pending.originalTokenId || '')){
      html += actionLink(currentHref, 'Save to Current Selection', false);
    }
    html += actionLink(commandExpr('resume'), 'Cancel Save Prompt', false);
    html += '</div>';
    return html;
  }

  function renderTemplateAppliedSummaryCard(session){
    var applied = session && session.lastAppliedTemplate;
    if(!applied) return '';
    var appliedTemplate = resolveTemplateRecord(applied.key || '');
    var popRange = String(applied.populationRange || '').trim();
    if(!popRange){
      popRange = (appliedTemplate && appliedTemplate.populationRange)
        ? String(appliedTemplate.populationRange)
        : templatePopulationRange(applied.population || 0, applied.category || '').label;
    }
    var rowA = [
      'Category: ' + (String(applied.categoryLabel || '').trim() || templateCategoryLabel(applied.category || '')),
      'Point Type: ' + pointTypeLabel(applied.pointType || ''),
      'Region: ' + resolveRegionLabel(applied.region || ''),
      'Locale: ' + resolveLocaleLabel(applied.region || '', applied.locale || ''),
      'Population: ' + (String(applied.population || '').trim() || 'unset') + ' [' + popRange + ']'
    ];
    var rowB = [
      'Development: ' + (String(applied.development || '').trim() || 'unset'),
      'Wealth: ' + (String(applied.wealth || '').trim() || 'unset'),
      'POI Entries: ' + String(applied.poiEntries || 0),
      'Military Sites: ' + String(applied.militarySites || 0),
      'Trade Categories: ' + String(applied.tradeCategories || 0)
    ];
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Template Applied:</b> ' + esc(applied.label || applied.key || 'Unknown') + '</div>';
    if(String(applied.description || '').trim()){
      html += '<div style="margin-top:4px;">' + esc(String(applied.description || '').trim()) + '</div>';
    }
    html += '<div style="margin-top:4px;">' + esc(rowA.join(' | ')) + '</div>';
    html += '<div style="margin-top:4px;">' + esc(rowB.join(' | ')) + '</div>';
    if(String(applied.demographicNote || '').trim()){
      html += '<div style="margin-top:4px;">' + esc(String(applied.demographicNote || '').trim()) + '</div>';
    }
    html += '<div style="margin-top:4px;"><i>All selected template values are editable in later wizard sections.</i></div>';
    html += '</div>';
    return html;
  }

  function renderPendingTemplateApply(session){
    var pending = session && session.pendingTemplateApply;
    if(!pending) return '';
    var steps = Array.isArray(pending.steps) ? pending.steps : [];
    if(!steps.length) return '';
    var index = asInt(pending.index);
    if(index === null || index < 0) index = 0;
    if(index >= steps.length) index = steps.length - 1;
    var step = steps[index] || null;
    if(!step) return '';

    var applyLabel = (index >= (steps.length - 1)) ? 'Apply Category and Finish' : 'Apply Category';
    var editHref = templateStepEditHref(step);
    var html = '<div style="' + (cssVars().card || '') + 'border:1px solid rgba(44, 90, 160, 0.35);background:rgba(44, 90, 160, 0.08);">';
    html += '<div><b>Template Category Confirmation</b></div>';
    html += '<div style="margin-top:4px;">Template: <b>' + esc(String(pending.templateLabel || pending.templateKey || 'Template')) + '</b></div>';
    html += '<div style="margin-top:4px;">Step <b>' + String(index + 1) + '</b> of <b>' + String(steps.length) + '</b>: <b>' + esc(String(step.title || 'Category')) + '</b></div>';
    if(String(step.description || '').trim()){
      html += '<div style="margin-top:4px;">' + esc(String(step.description || '').trim()) + '</div>';
    }
    var lines = Array.isArray(step.lines) ? step.lines : [];
    if(lines.length){
      html += '<ul style="margin:6px 0 0 18px;padding:0;">';
      for(var i=0;i<lines.length;i++){
        html += '<li style="margin:2px 0;">' + esc(String(lines[i] || '')) + '</li>';
      }
      html += '</ul>';
    }
    html += '<div style="margin-top:6px;"><i>Approve one category at a time. Each approval writes a checkpoint to the bound token endpoint.</i></div>';
    if(editHref){
      html += actionLink(editHref, 'Edit Category Before Approval', false);
    }
    html += actionLink(templateApplyChoiceHref('apply'), applyLabel, false);
    html += actionLink(templateApplyChoiceHref('cancel'), 'Cancel Template Apply', false);
    html += '</div>';
    return html;
  }

  function renderPendingSanityChoice(session){
    var pending = session && session.pendingSanityChoice;
    if(!pending) return '';
    var label = chooserFieldLabel(pending.field);
    var rawChosen = decodeCommandValue(pending.value || '');
    var chosen = pending.field === 'population'
      ? rawChosen
      : valueLabel(pending.field, rawChosen, session);
    var html = '<div style="' + (cssVars().card || '') + 'border:1px solid rgba(170, 120, 24, 0.45);background:rgba(170, 120, 24, 0.10);">';
    html += '<div><b>Rebalance Applied</b></div>';
    html += '<div style="margin-top:4px;">Manual update applied for <b>' + esc(label) + '</b>: <b>' + esc(chosen) + '</b>.</div>';
    html += '<div style="margin-top:4px;">Related template-driven defaults were automatically recalculated:</div>';
    html += '<ul style="margin:6px 0 0 18px;padding:0;">';
    var changes = Array.isArray(pending.changeList) ? pending.changeList : [];
    for(var i=0;i<changes.length;i++){
      html += '<li style="margin:2px 0;">' + esc(String(changes[i] || '')) + '</li>';
    }
    html += '</ul>';
    html += '<div style="margin-top:6px;"><i>This warning appears once for each newly selected template.</i></div>';
    html += '</div>';
    return html;
  }

  function sectionSession(pid){
    var session = currentSession(pid);
    if(currentBlankView(pid)) return null;
    return session || null;
  }

  function sectionProgressCard(pid){
    var index = sectionIndexForPlayer(pid);
    var meta = currentSectionMeta(pid);
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Section ' + String(index + 1) + ' of ' + String(SECTION_SEQUENCE.length) + ': ' + esc(meta.label) + '</b></div>';
    html += '</div>';
    return html;
  }

  function disabledNavButton(label){
    return '<span style="' + linkStyle(false) + 'opacity:0.45;cursor:not-allowed;">' + esc(label) + '</span>';
  }

  function renderSectionNavigation(pid){
    var section = currentSectionMeta(pid);
    var index = sectionIndexForPlayer(pid);
    var session = sectionSession(pid);
    var prevEnabled = index > 0;
    var nextMeta = SECTION_SEQUENCE[index + 1] || null;
    var nextEnabled = !!nextMeta
      && section.key !== 'bind'
      && (!nextMeta.requiresSession || !!session);
    var saveEnabled = !!session && !(session && session.pendingTemplateApply);

    var html = '';
    if(session){
      html += renderPendingSanityChoice(session);
    }
    html += '<div style="' + controlAreaStyle() + '">';
    html += prevEnabled ? actionLink(backSectionHref(), 'Back', false) : disabledNavButton('Back');
    html += nextEnabled ? actionLink(nextSectionHref(), 'Next', false) : disabledNavButton('Next');
    html += actionLink(resetWizardHref(), 'Reset', false);
    html += saveEnabled ? actionLink(saveAndExitHref(), 'Save and Exit', false) : disabledNavButton('Save and Exit');
    html += '</div>';
    return html;
  }

  function boundTokenSpecifics(session){
    if(!session || !session.tokenId) return 'none';
    var token = getObj('graphic', session.tokenId);
    var page = getObj('page', session.pageId || (token ? token.get('pageid') : ''));
    var label = tokenDisplayName(token, session.tokenId);
    var pageLabel = page ? String(page.get('name') || 'Unknown Page') : 'Unknown Page';
    return label + ' [token ' + String(session.tokenId || '') + '] on ' + pageLabel;
  }

  function renderBindSectionPanel(pid){
    var session = sectionSession(pid);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + controlAreaStyle() + '">';
    html += '<div><b>How To Use This Wizard</b></div>';
    html += '<div style="margin-top:4px;">Select the token you want to update/generate as a map point (location). Click <b>Start / Bind Selected Token</b> to begin.</div>';
    html += '<div style="margin-top:4px;">Current bound token: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += actionLink(startWithSelectedHref(), 'Start / Bind Selected Token', false);
    html += '</div>';
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function renderNameSectionPanel(pid){
    var session = sectionSession(pid);
    if(!session){
      setView(pid, 'bind');
      return renderBindSectionPanel(pid);
    }
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += renderTemplateAppliedSummaryCard(session);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Set the map point name that will be saved to the bound token.</div>';
    html += renderInlineField('Current Name', renderSingleValue(session.data.name || 'Not set'), inlineActionLink(fieldSetHref('name', 'Map Point Name', session.data.name || ''), 'Set Name', false));
    html += '</div>';
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function renderPopulationSectionPanel(pid){
    var session = sectionSession(pid);
    if(!session){
      setView(pid, 'bind');
      return renderBindSectionPanel(pid);
    }
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Set the average population for this map point. Use a whole number equal to or greater than zero.</div>';
    if(session.data.template){
      var template = resolveTemplateRecord(session.data.template);
      if(template){
        var popProfile = templatePopulationRange((template.defaults || {}).population || 0, template.categoryKey || '');
        html += '<div style="margin-top:4px;">Template range: <b>' + esc(String(template.populationRange || popProfile.label || '')) + '</b> (default average: <b>' + esc(String((template.defaults || {}).population || popProfile.avg || '0')) + '</b>).</div>';
      }
    }
    html += renderInlineField('Current Population', renderSingleValue(session.data.population || 'Not set'), inlineActionLink(fieldSetHref('population', 'Average Population', session.data.population || ''), 'Set Population', false));
    html += '</div>';
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function reviewHandoutName(pid, session){
    var token = session ? tokenDisplayName(getObj('graphic', session.tokenId), session.tokenId) : 'Location';
    return REVIEW_PANEL_TITLE + ' - ' + token + ' - ' + playerName(pid || '');
  }

  function renderReviewHandoutNotes(pid, session){
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += handoutTopAnchor('review_top');
    html += '<h3 style="margin:0 0 8px 0;">Map Point Wizard Final Review</h3>';
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Review Summary</b></div>';
    html += '<div style="margin-top:4px;">Review all map-point settings below. The chat panel still controls Back, Next, Reset, and Save and Exit.</div>';
    html += renderReviewBlock(session);
    html += '</div>';
    html += '<div style="' + (cssVars().card || '') + '"><i>This handout can be closed when finished.</i></div>';
    html += '</div>';
    return html;
  }

  function ensureReviewHandout(pid, session){
    if(!session) return null;
    var handout = currentReviewHandout(pid);
    if(!handout){
      handout = createObj('handout', {
        name: reviewHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        archived: false
      });
      if(!handout) return null;
      setReviewHandoutId(pid, handout.id);
    }
    try{
      handout.set({
        name: reviewHandoutName(pid, session),
        inplayerjournals: '',
        controlledby: String(pid || ''),
        notes: renderReviewHandoutNotes(pid, session)
      });
    }catch(e){
      log('fts_mapPointWizard ensureReviewHandout err: ' + e);
      return null;
    }
    return {
      handout: handout,
      url: handoutJournalUrl(handout.id, 'review_top')
    };
  }

  function renderReviewSectionPanel(pid){
    var session = sectionSession(pid);
    if(!session){
      setView(pid, 'bind');
      return renderBindSectionPanel(pid);
    }
    var handoutState = ensureReviewHandout(pid, session);
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Final review is shown in an ephemeral handout formatted for easy reading.</div>';
    if(handoutState && handoutState.url){
      html += renderHandoutOpenLink(handoutState.url, 'Open ' + REVIEW_PANEL_TITLE + ' Handout');
    }else{
      html += '<div style="margin-top:6px;">Could not open the review handout right now.</div>';
      html += renderReviewBlock(session);
    }
    html += '</div>';
    html += renderPendingFinishChoice(session);
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  /* ======================================================================== */
  /* Save Output                                                               */
  /* ======================================================================== */

  function tooltipSectionLines(stance, labels, mode){
    labels = Array.isArray(labels) ? labels.slice() : [];
    var title = tradeStanceLabel(stance) + ':';
    if(!labels.length){
      return [title + ' none'];
    }
    if(mode === 'count' && labels.length > 1){
      return [title + ' ' + labels.length + ' categories'];
    }
    if(mode === 'compact'){
      if(labels.length <= 2){
        return [title + ' ' + labels.join(', ')];
      }
      return [title + ' ' + labels.slice(0, 2).join(', ') + ', +' + (labels.length - 2)];
    }
    var out = [title + ' ' + labels[0]];
    for(var i=1;i<labels.length;i++){
      out.push('  ' + labels[i]);
    }
    return out;
  }

  function tooltipLinesForMode(data, mode){
    var periodKey = currentCalendarPeriodKey();
    function entryLabel(entry){
      var label = tradeGoodLabel(entry.goodKey);
      var note = tradeNoteLabel(tradePeriodNote(entry, periodKey));
      if(note) label += ' (' + note + ')';
      return label;
    }
    var has = tradeEntriesForPeriod(data.tradeGoods || [], 'has', periodKey).map(entryLabel);
    var wants = tradeEntriesForPeriod(data.tradeGoods || [], 'wants', periodKey).map(entryLabel);
    var needs = tradeEntriesForPeriod(data.tradeGoods || [], 'needs', periodKey).map(entryLabel);
    var lines = [String(data.name || '').trim() || 'Location', ''];
    lines = lines.concat(tooltipSectionLines('has', has, mode));
    lines.push('');
    lines = lines.concat(tooltipSectionLines('wants', wants, mode));
    lines.push('');
    lines = lines.concat(tooltipSectionLines('needs', needs, mode));
    return lines;
  }

  function buildTooltipText(session){
    var data = session.data || {};
    var lines = tooltipLinesForMode(data, 'full');
    var tooltip = lines.join(TOOLTIP_LINE_BREAK);
    if(tooltip.length <= TOOLTIP_MAX_CHARS) return tooltip;

    lines = tooltipLinesForMode(data, 'compact');
    tooltip = lines.join(TOOLTIP_LINE_BREAK);
    if(tooltip.length <= TOOLTIP_MAX_CHARS) return tooltip;

    lines = tooltipLinesForMode(data, 'count');
    tooltip = lines.join(TOOLTIP_LINE_BREAK);
    return tooltip.slice(0, TOOLTIP_MAX_CHARS);
  }

  function tradeSummaryLines(data, stance){
    var entries = tradeEntriesForStance(data.tradeGoods || [], stance);
    return entries.map(function(entry){
      return tradeGoodLabel(entry.goodKey) + ' [' + tradeScheduleSummary(entry) + ']';
    });
  }

  function tradeSummaryLine(data, stance){
    return tradeSummaryLines(data, stance).join('; ');
  }

  function buildGMNotesText(session, token, page){
    var data = session.data;
    var development = tierByValue(DEVELOPMENT_TIERS, data.development) || { label:'' };
    var wealth = tierByValue(WEALTH_TIERS, data.wealth) || { label:'' };
    var offense = tierByValue(STRENGTH_TIERS, data.offense_level) || { label:'' };
    var defense = tierByValue(STRENGTH_TIERS, data.defense_level) || { label:'' };
    var template = resolveTemplateRecord(data.template) || { key:'', label:'', regionKey:'' };
    var offensePoints = strengthPoints('offense', data.offense_types || []);
    var defensePoints = strengthPoints('defense', data.defense_types || []);
    var militaryTotals = poiCombatPointTotals(data.poi || []);
    var offenseTotalPoints = offensePoints + militaryTotals.offense;
    var defenseTotalPoints = defensePoints + militaryTotals.defense;
    var cultures = fieldDisplayValues('cultures', data.cultures || [], session);
    var faiths = fieldDisplayValues('faiths', data.faiths || [], session);
    var factions = fieldDisplayValues('factions', data.factions || [], session);
    var allies = fieldDisplayValues('allies', data.allies || [], session);
    var enemies = fieldDisplayValues('enemies', data.enemies || [], session);
    var offenseTypes = fieldDisplayValues('offense_types', data.offense_types || [], session);
    var defenseTypes = fieldDisplayValues('defense_types', data.defense_types || [], session);
    var poiList = normalizePoiEntries(data.poi || []);
    var pointType = pointTypeValue(
      data.point_type
      || template.pointType
      || defaultPointTypeForCategory(template.categoryKey || data.template_category || '')
      || 'settlement'
    );
    var popRange = templatePopulationRange(data.population || 0, template.categoryKey || data.template_category || '');
    var lines = [
      '[FTS_TRADEPOINT]',
      'name: ' + String(data.name || '').trim(),
      'template: ' + String(template.key || ''),
      'template_label: ' + String(template.label || ''),
      'template_category: ' + String(template.categoryKey || data.template_category || ''),
      'template_category_label: ' + String(template.categoryLabel || templateCategoryLabel(data.template_category || '')),
      'template_subtype: ' + String(template.templateKey || ''),
      'template_region: ' + String(template.regionKey || ''),
      'point_type: ' + String(pointType || ''),
      'region: ' + String(data.region || ''),
      'region_label: ' + resolveRegionLabel(data.region),
      'locale: ' + String(data.locale || ''),
      'locale_label: ' + resolveLocaleLabel(data.region, data.locale),
      'population: ' + String(data.population || ''),
      'avg_population: ' + String(data.population || ''),
      'population_range: ' + String((template.populationRange || popRange.label || '').trim()),
      'development: ' + String(data.development || ''),
      'development_label: ' + String(development.label || ''),
      'development_note: ' + developmentNarrativeExample(data.development),
      'wealth: ' + String(data.wealth || ''),
      'wealth_label: ' + String(wealth.label || ''),
      'wealth_note: ' + wealthNarrativeExample(data.wealth),
      'culture: ' + cultures.join('; '),
      'faiths: ' + faiths.join('; '),
      'prominent_factions: ' + factions.join('; '),
      'prominent_allies: ' + allies.join('; '),
      'prominent_enemies: ' + enemies.join('; '),
      'offense_level: ' + String(data.offense_level || ''),
      'offense_level_label: ' + String(offense.label || ''),
      'offense_points: ' + String(offensePoints),
      'offense_military_points: ' + String(militaryTotals.offense || 0),
      'offense_total_points: ' + String(offenseTotalPoints),
      'offense_types: ' + offenseTypes.join('; '),
      'defense_level: ' + String(data.defense_level || ''),
      'defense_level_label: ' + String(defense.label || ''),
      'defense_points: ' + String(defensePoints),
      'defense_military_points: ' + String(militaryTotals.defense || 0),
      'defense_total_points: ' + String(defenseTotalPoints),
      'military_unit_capacity: ' + String(militaryTotals.units || 0),
      'defense_types: ' + defenseTypes.join('; '),
      'poi_summary: ' + poiList.map(function(entry){
        return poiCategoryLabel(entry.category) + ' - ' + entry.label + ' (' + entry.count + ')';
      }).join('; '),
      'trade_has_summary: ' + tradeSummaryLine(data, 'has'),
      'trade_wants_summary: ' + tradeSummaryLine(data, 'wants'),
      'trade_needs_summary: ' + tradeSummaryLine(data, 'needs'),
    ];
    tradeSummaryLines(data, 'has').forEach(function(line){
      lines.push('trade_has: ' + line);
    });
    tradeSummaryLines(data, 'wants').forEach(function(line){
      lines.push('trade_wants: ' + line);
    });
    tradeSummaryLines(data, 'needs').forEach(function(line){
      lines.push('trade_needs: ' + line);
    });
    lines = lines.concat([
      'poi_json: ' + JSON.stringify(normalizePoiEntries(data.poi || [])),
      'trade_goods_json: ' + JSON.stringify(normalizeTradeGoods(data.tradeGoods || [])),
      'page_id: ' + String((page && page.id) || session.pageId || ''),
      'page_name: ' + String((page && page.get && page.get('name')) || ''),
      'token_id: ' + String((token && token.id) || session.tokenId || ''),
      'token_locked: true',
      'wizard_version: ' + VERSION,
      'updated_at: ' + (new Date()).toISOString(),
      '[/FTS_TRADEPOINT]'
    ]);
    return lines.join('\n');
  }

  function tokenDisplayName(token, fallbackId){
    var name = String((token && token.get && token.get('name')) || '').trim();
    if(name) return name;
    fallbackId = String(fallbackId || (token && token.id) || '').trim();
    return fallbackId ? ('Token ' + fallbackId) : 'Unknown Token';
  }

  function finishSelectionState(session, msg, explicitTokenId){
    var sessionToken = getObj('graphic', session.tokenId);
    var selectedToken = resolveExplicitSelectedToken(msg, explicitTokenId);
    if(!selectedToken && sessionToken){
      selectedToken = sessionToken;
    }
    var selectedId = String((selectedToken && selectedToken.id) || '');
    var sessionId = String(session.tokenId || '');
    return {
      sessionToken: sessionToken,
      selectedToken: selectedToken,
      matches: !!selectedToken && !!sessionId && selectedId === sessionId
    };
  }

  function syncMapLocationFromWizard(pid, token, session){
    token = token || null;
    if(!token || !token.id) return;
    var label = stringOrBlank((session && session.data && session.data.name) || token.get('name') || '');
    if(!label) return;

    try{
      var mapRecords = getMapRecordsState();
      if(!mapRecords.lastSelection) mapRecords.lastSelection = {};
      mapRecords.lastSelection[String(pid || '')] = [{ _id:String(token.id || ''), _type:'graphic' }];
    }catch(selectionErr){
      log('fts_mapPointWizard syncMapLocationFromWizard selection err: ' + selectionErr);
    }

    try{
      if(typeof mapMetaRecordsSection !== 'undefined'
        && mapMetaRecordsSection
        && typeof mapMetaRecordsSection.handleCommand === 'function'){
        var result = mapMetaRecordsSection.handleCommand({
          pid: String(pid || ''),
          val: 'set location ' + label,
          silent: true
        });
        if(result && result.error){
          log('fts_mapPointWizard syncMapLocationFromWizard mapMeta command err: ' + result.error);
        }
      }
    }catch(commandErr){
      log('fts_mapPointWizard syncMapLocationFromWizard mapMeta command exception: ' + commandErr);
    }

    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.refreshActiveMapRecords === 'function'){
        RT.fts_mapMeta.refreshActiveMapRecords();
      }
    }catch(refreshErr){
      log('fts_mapPointWizard syncMapLocationFromWizard refresh err: ' + refreshErr);
    }
  }

  function persistTemplateApplyCheckpoint(pid, session){
    if(!session || !session.data){
      return { error:'No active Map Point Wizard session is open.' };
    }
    var token = getObj('graphic', session.tokenId);
    if(!token){
      return { error:'The selected token no longer exists.' };
    }
    var page = getObj('page', token.get('pageid') || session.pageId);
    var gmNotes = buildGMNotesText(session, token, page);
    var tooltip = buildTooltipText(session);
    try{
      var draftName = String(session.data.name || '').trim();
      if(draftName) token.set('name', draftName);
      token.set('gmnotes', gmNotes);
      token.set('tooltip', tooltip);
    }catch(writeErr){
      return { error:'Could not write template checkpoint values to the token: ' + String(writeErr) };
    }
    try{ token.set('show_tooltip', true); }catch(e1){}
    saveInstanceForToken(token.id, (page && page.id) || session.pageId, session.data);
    syncMapLocationFromWizard(pid, token, session);
    return { token:token, page:page };
  }

  function finalizeSession(pid, session, explicitTokenId){
    var err = validateAllRequired(session);
    if(err) return { error:err };

    explicitTokenId = String(explicitTokenId || '').trim();
    var token = getObj('graphic', explicitTokenId || session.tokenId);
    if(!token) return { error:'The selected token no longer exists.' };

    var page = getObj('page', token.get('pageid') || session.pageId);
    var gmNotes = buildGMNotesText(session, token, page);
    var tooltip = buildTooltipText(session);

    try{
      token.set('name', String(session.data.name || '').trim());
      token.set('gmnotes', gmNotes);
      token.set('tooltip', tooltip);
    }catch(writeErr){
      return { error:'Could not write map point values to the token: ' + String(writeErr) };
    }
    try{ token.set('show_tooltip', true); }catch(e1){}
    try{ token.set('disableTokenMenu', true); }catch(e2){}
    try{ token.set('lockMovement', true); }catch(e3){}

    saveInstanceForToken(token.id, (page && page.id) || session.pageId, session.data);
    syncMapLocationFromWizard(pid, token, session);
    return { token:token, page:page, tooltip:tooltip, gmNotes:gmNotes };
  }

  /* ======================================================================== */
  /* Command Handling                                                          */
  /* ======================================================================== */

  function isWizardCommandContent(content){
    return extractWizardCommandTail(content) !== null;
  }

  function extractWizardCommandTail(content){
    content = String(content || '').trim();
    if(!/^!fts(\b|$)/i.test(content)) return null;
    var segments = content.split(/\s+--/);
    for(var i=1;i<segments.length;i++){
      var tokens = String(segments[i] || '').trim().split(/\s+/g).filter(function(tok){ return !!tok; });
      if(lower(tokens[0] || '') === lower(COMMAND)){
        var tail = tokens.slice(1).join(' ').trim();
        for(var j=i+1;j<segments.length;j++){
          tail += (tail ? ' ' : '') + '--' + String(segments[j] || '').trim();
        }
        return tail.trim();
      }
    }
    return null;
  }

  function normalizeWizardAction(action){
    var key = lower(action || '');
    return WIZARD_ACTIONS[key] ? key : key;
  }

  function normalizeWizardFlagKey(key){
    var normalized = lower(key || '');
    return WIZARD_FLAG_ALIASES[normalized] || normalized;
  }

  function normalizeWizardFlags(flags){
    flags = flags || {};
    var out = {};
    Object.keys(flags).forEach(function(key){
      out[normalizeWizardFlagKey(key)] = flags[key];
    });
    return out;
  }

  function parseFlagPart(part){
    var tokens = String(part || '').trim().split(/\s+/g).filter(function(tok){ return !!tok; });
    if(!tokens.length) return null;
    return { key:normalizeWizardFlagKey(tokens[0]), value:tokens.slice(1).join(' ').trim() };
  }

  function parseFlags(text){
    var flags = {};
    var raw = String(text || '').trim();
    if(!raw) return flags;
    var parts = (' ' + raw).split(/\s+--/);
    for(var i=1;i<parts.length;i++){
      var parsed = parseFlagPart(parts[i]);
      if(!parsed || !parsed.key) continue;
      flags[parsed.key] = parsed.value;
    }
    return flags;
  }

  function parseInnerCommand(text){
    text = String(text || '').trim();
    if(!text) return { action:'panel', flags:{} };
    var flagIdx = text.search(/(^|\s)--/);
    var actionText = flagIdx === -1 ? text : text.slice(0, flagIdx).trim();
    var flagsText = flagIdx === -1 ? '' : text.slice(flagIdx).trim();
    var actionTokens = actionText.split(/\s+/g).filter(function(tok){ return !!tok; });
    if(!actionTokens.length){
      return { action:'panel', flags:parseFlags(flagsText) };
    }
    return { action:normalizeWizardAction(actionTokens[0]), flags:parseFlags(flagsText) };
  }

  function applyPick(session, field, value){
    value = decodeCommandValue(value);
    if(field === 'template'){
      if(!value || lower(value) === 'clear'){
        clearPendingTemplateApply(session);
        session.data.template = '';
        session.data.template_category = '';
        session.data.point_type = '';
        session.sanityNoticeTemplateKey = '';
        clearPendingSanityChoice(session);
        clearTemplateAppliedSummary(session);
        return '';
      }
      var template = resolveTemplateChoice(session, value);
      if(!template) return 'Unknown template.';
      clearPendingSanityChoice(session);
      clearPendingFinishChoice(session);
      var pendingResult = beginPendingTemplateApply(session, template);
      if(pendingResult.error) return pendingResult.error;
      return '';
    }
    if(field === 'region'){
      if(!value || lower(value) === 'clear'){
        clearPendingTemplateApply(session);
        session.data.region = '';
        session.data.locale = '';
        session.data.template = '';
        session.data.template_category = '';
        session.data.point_type = '';
        session.sanityNoticeTemplateKey = '';
        clearPendingSanityChoice(session);
        clearTemplateAppliedSummary(session);
        return '';
      }
      var known = loadKnownRegions();
      value = canonicalRegionKey(value);
      if(!known[value]) return 'Unknown region.';
      session.data.region = value;
      var localeOpts = localeOptionsForRegion(value);
      var localeOk = false;
      for(var i=0;i<localeOpts.length;i++){
        if(localeOpts[i].key === session.data.locale){ localeOk = true; break; }
      }
      if(!localeOk) session.data.locale = known[value].defaultLocale || '';
      var template = resolveTemplateRecord(session.data.template);
      if(template && template.regionKey !== value){
        clearPendingTemplateApply(session);
        session.data.template = '';
        session.data.template_category = '';
        session.data.point_type = '';
        session.sanityNoticeTemplateKey = '';
        clearPendingSanityChoice(session);
        clearTemplateAppliedSummary(session);
      }
      return '';
    }
    if(field === 'locale'){
      if(!value || lower(value) === 'clear'){
        clearPendingTemplateApply(session);
        session.data.locale = '';
        return '';
      }
      var opts = localeOptionsForRegion(session.data.region);
      var ok = false;
      for(var j=0;j<opts.length;j++){
        if(opts[j].key === value){ ok = true; break; }
      }
      if(!ok) return 'Unknown locale for the selected region.';
      clearPendingTemplateApply(session);
      session.data.locale = value;
      return '';
    }
    if(field === 'development'){
      if(!value || lower(value) === 'clear'){
        session.data.development = '';
        return '';
      }
      if(!tierByValue(DEVELOPMENT_TIERS, value)) return 'Unknown development tier.';
      session.data.development = value;
      return '';
    }
    if(field === 'wealth'){
      if(!value || lower(value) === 'clear'){
        session.data.wealth = '';
        return '';
      }
      if(!tierByValue(WEALTH_TIERS, value)) return 'Unknown wealth tier.';
      session.data.wealth = value;
      return '';
    }
    if(field === 'offense_level'){
      return 'Offense strength is derived automatically from the selected offense types.';
    }
    if(field === 'defense_level'){
      return 'Defense strength is derived automatically from the selected defense types.';
    }
    return 'Unsupported pick target.';
  }

  function applySet(session, field, value){
    value = String(value || '').trim();
    if(field === 'name'){
      if(!value) return 'Name cannot be empty.';
      session.data.name = value;
      return '';
    }
    if(field === 'population'){
      var pop = asInt(value);
      if(pop === null || pop < 0) return 'Population must be a whole number equal to or greater than zero.';
      session.data.population = String(pop);
      return '';
    }
    return 'Unsupported set target.';
  }

  function normalizeMultiValue(field, value){
    value = decodeCommandValue(value);
    if(!value) return '';
    if(parseCustomLibraryValue(field, value)) return value;
    return optionRecordForField(field, value) ? value : '';
  }

  function applyMultiAdd(session, field, value){
    if(!MULTI_LIBRARY[field]) return 'Unsupported multi-select field.';
    value = normalizeMultiValue(field, value);
    if(!value) return 'Choose a value to add.';
    session.data[field] = uniqueStrings((session.data[field] || []).concat([value]));
    return '';
  }

  function applyMultiRemove(session, field, value){
    if(!MULTI_LIBRARY[field]) return 'Unsupported multi-select field.';
    value = decodeCommandValue(value);
    if(!value) return 'Choose a value to remove.';
    var list = session.data[field] || [];
    session.data[field] = list.filter(function(item){
      return String(item || '') !== value;
    });
    return '';
  }

  function applyMultiClear(session, field){
    if(!MULTI_LIBRARY[field]) return 'Unsupported multi-select field.';
    session.data[field] = [];
    return '';
  }

  function applyMultiCustom(session, field, label, score){
    if(!MULTI_LIBRARY[field]) return 'Unsupported multi-select field.';
    label = String(label || '').trim();
    if(!label) return 'Custom entry label cannot be empty.';
    return applyMultiAdd(session, field, buildCustomLibraryValue(field, label, score));
  }

  function applyPoiSet(session, categoryKey, key, label, count){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return 'Choose a valid POI category.';
    key = normalizeKey(key || '');
    label = decodeCommandValue(label);
    if(!key) key = normalizeKey(label || '');
    if(!key) return 'Choose a valid POI entry.';
    count = normalizePoiCount(count);
    if(count <= 0) return 'POI count must be a whole number equal to or greater than 1.';
    session.data.poi = poiSetEntry(session.data.poi || [], categoryKey, key, label, count);
    reapplyPoiDrivenTradeProfile(session);
    return '';
  }

  function applyPoiRemove(session, categoryKey, key){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return 'Choose a valid POI category.';
    key = normalizeKey(key || '');
    if(!key) return 'Choose a POI entry to remove.';
    session.data.poi = poiRemoveEntry(session.data.poi || [], categoryKey, key);
    reapplyPoiDrivenTradeProfile(session);
    return '';
  }

  function applyPoiClear(session, categoryKey){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey){
      session.data.poi = [];
      reapplyPoiDrivenTradeProfile(session);
      return '';
    }
    session.data.poi = normalizePoiEntries(session.data.poi || []).filter(function(entry){
      return String(entry.category || '') !== categoryKey;
    });
    reapplyPoiDrivenTradeProfile(session);
    return '';
  }

  function applyPoiCustom(session, categoryKey, label, count){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return 'Choose a valid POI category.';
    label = decodeCommandValue(label);
    label = String(label || '').trim();
    if(!label) return 'Custom POI label cannot be empty.';
    var key = normalizeKey(label || '');
    if(!key) return 'Custom POI label must include letters or numbers.';
    count = normalizePoiCount(count);
    if(count <= 0) return 'POI count must be a whole number equal to or greater than 1.';
    session.data.poi = poiSetEntry(session.data.poi || [], categoryKey, key, label, count);
    reapplyPoiDrivenTradeProfile(session);
    return '';
  }

  function applyPoiRename(session, categoryKey, key, label){
    categoryKey = normalizePoiCategoryKey(categoryKey || '');
    if(!categoryKey) return 'Choose a valid POI category.';
    key = normalizeKey(key || '');
    if(!key) return 'Choose a POI entry to rename.';
    label = decodeCommandValue(label);
    label = String(label || '').trim();
    if(!label) return 'POI display name cannot be empty.';
    var count = poiCountFor(session.data.poi || [], categoryKey, key);
    if(count <= 0) return 'Select a POI entry before renaming it.';
    session.data.poi = poiSetEntry(session.data.poi || [], categoryKey, key, label, count);
    return '';
  }

  function applyMultiEdit(session, field, value, label, score){
    if(!MULTI_LIBRARY[field]) return 'Unsupported multi-select field.';
    value = decodeCommandValue(value);
    var list = session.data[field] || [];
    var found = false;
    for(var i=0;i<list.length;i++){
      if(String(list[i] || '') === value){ found = true; break; }
    }
    if(!found) return 'That entry is not currently selected.';
    label = String(label || '').trim();
    if(!label) return 'Custom entry label cannot be empty.';
    var nextValue = buildCustomLibraryValue(field, label, score);
    if(!nextValue) return 'Could not update that custom entry.';
    session.data[field] = list.map(function(item){
      return String(item || '') === value ? nextValue : item;
    });
    return '';
  }

  function applyTradeCellChange(session, goodKey, periodKey, stance, action, cu, note){
    goodKey = String(goodKey || '').trim();
    periodKey = String(periodKey || '').trim();
    stance = lower(stance);
    action = lower(action || 'set');
    if(!validTradeTargetKey(goodKey)) return 'Choose a valid trade goods category.';
    if(!findByKey(CALENDAR_PERIODS, periodKey)) return 'Choose a valid month or festival.';
    if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return 'Choose whether the trade goods category belongs under has, wants, or needs.';
    var list = normalizeTradeGoods(session.data.tradeGoods || []);
    if(action === 'clear'){
      session.data.tradeGoods = setTradePeriodNoteValue(list, stance, goodKey, periodKey, '');
      return '';
    }
    if(action === 'delete'){
      session.data.tradeGoods = clearExclusiveTradePeriod(list, goodKey, periodKey);
      return '';
    }
    if(action !== 'set') return 'Unknown trade goods cell action.';
    if(isCargoUnitsClearValue(cu)){
      session.data.tradeGoods = clearExclusiveTradePeriod(list, goodKey, periodKey);
      return '';
    }
    var distributed = distributedWindowCargoUnits(periodKey, stance, cu);
    var periodValue = distributed[periodKey] || '';
    if(!periodValue) return 'Cargo units must be 0 to clear, or a positive number in 0.1 CU increments.';
    list = setExclusiveTradePeriod(list, goodKey, periodKey, stance, periodValue);
    session.data.tradeGoods = setTradePeriodNoteValue(list, stance, goodKey, periodKey, note);
    return '';
  }

  function applyTradeWindowChange(session, goodKey, windowKey, stance, action, cu, note){
    goodKey = String(goodKey || '').trim();
    windowKey = String(windowKey || '').trim();
    stance = lower(stance);
    action = lower(action || 'set');
    if(TRADE_STANCE_ORDER.indexOf(stance) === -1) return 'Choose whether the trade goods category belongs under has, wants, or needs.';
    if(!validTradeTargetKey(goodKey)) return 'Choose a valid trade goods category.';
    var periods = expandWindowKey(windowKey);
    if(!periods.length) return 'Choose a valid month or season window.';
    var list = normalizeTradeGoods(session.data.tradeGoods || []);

    if(action === 'clear'){
      session.data.tradeGoods = setTradeWindowNotes(list, stance, goodKey, windowKey, '');
      return '';
    }
    if(action === 'delete' || isCargoUnitsClearValue(cu)){
      for(var ci=0;ci<periods.length;ci++){
        list = clearExclusiveTradePeriod(list, goodKey, periods[ci]);
      }
      session.data.tradeGoods = normalizeTradeGoods(list);
      return '';
    }
    if(action !== 'set') return 'Unknown trade goods window action.';

    var distributed = distributedWindowCargoUnits(windowKey, stance, cu);
    var distributedKeys = Object.keys(distributed);
    if(!distributedKeys.length) return 'Cargo units must be 0 to clear, or a positive number in 0.1 CU increments.';
    for(var si=0;si<distributedKeys.length;si++){
      list = setExclusiveTradePeriod(list, goodKey, distributedKeys[si], stance, distributed[distributedKeys[si]]);
    }
    list = setTradeWindowTotal(list, stance, goodKey, windowKey, cu);
    session.data.tradeGoods = setTradeWindowNotes(list, stance, goodKey, windowKey, note);
    return '';
  }

  function applyTradeClear(session, groupKey){
    groupKey = String(groupKey || '').trim();
    if(!groupKey){
      session.data.tradeGoods = [];
      return '';
    }
    if(!TRADE_GOOD_GROUP_MAP[groupKey]) return 'Choose a valid trade goods category.';
    var targetKey = tradeGroupTargetKey(groupKey);
    session.data.tradeGoods = normalizeTradeGoods((session.data.tradeGoods || []).filter(function(entry){
      return String((entry && entry.goodKey) || '') !== targetKey;
    }));
    return '';
  }

  function findTradeGoodGroupByLabel(label){
    var token = canonicalToken(label);
    if(!token) return null;
    var groups = sortedTradeGoodGroups();
    for(var i=0;i<groups.length;i++){
      if(canonicalToken(groups[i].label || '') === token) return groups[i];
    }
    return null;
  }

  function nextCustomTradeGroupKey(label){
    var base = normalizeKey(label || '');
    if(!base) return '';
    var key = 'custom_' + base;
    if(!TRADE_GOOD_GROUP_MAP[key]) return key;
    var idx = 2;
    while(TRADE_GOOD_GROUP_MAP[key + '_' + String(idx)]){
      idx += 1;
    }
    return key + '_' + String(idx);
  }

  function saveCustomTradeGroupToState(group){
    group = normalizeCustomTradeGroupRecord(group);
    if(!group) return;
    var S = ensureState();
    var list = Array.isArray(S.customTradeGroups) ? S.customTradeGroups : [];
    var replaced = false;
    for(var i=0;i<list.length;i++){
      if(String((list[i] && list[i].key) || '') === group.key){
        list[i] = group;
        replaced = true;
        break;
      }
    }
    if(!replaced) list.push(group);
    S.customTradeGroups = list;
  }

  function applyTradeGroupAdd(pid, label){
    label = String(label || '').trim();
    if(!label) return { error:'Custom trade category label cannot be empty.' };
    var existing = findTradeGoodGroupByLabel(label);
    if(existing){
      setTradeGroup(pid, existing.key);
      return { group:existing };
    }
    var key = nextCustomTradeGroupKey(label);
    if(!key) return { error:'Custom trade category label must include letters or numbers.' };
    var desc = 'Custom trade category created by the GM for this campaign.';
    var created = upsertTradeGoodGroupRecord(key, label, desc);
    if(!created) return { error:'Could not create that custom trade category.' };
    saveCustomTradeGroupToState(created);
    setTradeGroup(pid, created.key);
    return { group:created };
  }

  function handleWizardMessage(msg){
    if(msg.type !== 'api') return;
    if(isSelfChatMessage(msg)) return;

    var content = String(msg.content || '').trim();
    if(!isWizardCommandContent(content)) return;
    if(shouldIgnoreRapidRepeat(msg.playerid, content)) return;

    var pid = msg.playerid;
    if(!isGM(pid)){
      return;
    }

    cacheSelection(pid, msg);

    var tail = extractWizardCommandTail(content);
    var parsed = parseInnerCommand(tail);
    parsed.action = normalizeWizardAction(parsed.action);
    parsed.flags = normalizeWizardFlags(parsed.flags);
    var session = currentSession(pid);
    var error = '';
    if(parsed.action === 'panel'){
      clearSession(pid);
      clearCachedSelection(pid);
      clearMapRecordSelection(pid);
      session = null;
      setView(pid, 'bind');
      var explicitTokenId = String(parsed.flags.token || '').trim();
      if(explicitTokenId){
        var panelStart = startSession(pid, msg, explicitTokenId);
        if(panelStart.error){
          setStatus(pid, 'error', panelStart.error);
          refreshChatView(pid);
          return;
        }
        clearPendingFinishChoice(panelStart.session);
        clearPendingSanityChoice(panelStart.session);
        touchSession(panelStart.session);
        storeSession(pid, panelStart.session);
        clearStatus(pid);
      }else{
        clearStatus(pid);
      }
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'section'){
      var targetSection = sectionMetaByKey(parsed.flags.key || '');
      if(!targetSection){
        setStatus(pid, 'error', 'Choose a valid wizard section.');
        refreshChatView(pid);
        return;
      }
      if(targetSection.requiresSession && !session){
        setStatus(pid, 'error', 'Start / Bind Selected Token before opening that section.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setView(pid, targetSection.view);
      clearStatus(pid);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'back' || parsed.action === 'next'){
      if(parsed.action === 'next' && currentSectionMeta(pid).key === 'bind'){
        setStatus(pid, 'error', 'Start / Bind Selected Token before moving to the next section.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      var currentIndex = sectionIndexForPlayer(pid);
      var targetIndex = lower(parsed.action) === 'back'
        ? Math.max(0, currentIndex - 1)
        : Math.min(SECTION_SEQUENCE.length - 1, currentIndex + 1);
      var targetMeta = SECTION_SEQUENCE[targetIndex];
      if(targetMeta.requiresSession && !session){
        setStatus(pid, 'error', 'Start / Bind Selected Token before moving to the next section.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setView(pid, targetMeta.view);
      clearStatus(pid);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'chooser'){
      var chooserField = normalizeKey(parsed.flags.field || '');
      if(!(chooserField && (MULTI_LIBRARY[chooserField] || SINGLE_CHOOSER_FIELDS.indexOf(chooserField) !== -1))){
        setStatus(pid, 'error', 'Choose a valid field for chooser view.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setView(pid, 'chooser:' + chooserField);
      clearStatus(pid);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'tradeview'){
      if(parsed.flags.group) setTradeGroup(pid, parsed.flags.group);
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setView(pid, 'trade');
      clearStatus(pid);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'poiview'){
      if(parsed.flags.category) setPoiCategory(pid, parsed.flags.category);
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setView(pid, 'poi');
      clearStatus(pid);
      if(currentPoiHandout(pid)){
        ensurePoiHandout(pid, session);
      }
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'templateview'){
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      setTemplateShowMode(pid, 'filtered');
      if(parsed.flags.category){
        setTemplateCategory(pid, parsed.flags.category);
      }else{
        resolveTemplateCategoryForPanel(pid, session);
      }
      setView(pid, 'chooser:template');
      clearStatus(pid);
      if(currentTemplateHandout(pid)){
        ensureTemplateHandout(pid, session);
      }
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'start'){
      var startToken = String(parsed.flags.token || '').trim();
      var started = startSession(pid, msg, startToken, true);
      if(started.error){
        setStatus(pid, 'error', started.error);
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      clearPendingFinishChoice(started.session);
      clearPendingSanityChoice(started.session);
      touchSession(started.session);
      storeSession(pid, started.session);
      setStatus(pid, 'success', tokenDisplayName(started.token) + ' is ready in the Map Point Wizard.');
      setView(pid, 'chooser:region');
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'sanityresolve'){
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      clearPendingSanityChoice(session);
      touchSession(session);
      storeSession(pid, session);
      if(currentTemplateHandout(pid)){
        ensureTemplateHandout(pid, session);
      }
      if(currentPoiHandout(pid)){
        ensurePoiHandout(pid, session);
      }
      if(currentTradeHandout(pid)){
        ensureTradeHandout(pid, session);
      }
      if(currentReviewHandout(pid) && currentView(pid) === 'review'){
        ensureReviewHandout(pid, session);
      }
      refreshOpenMultiHandouts(pid, session);
      setStatus(pid, 'info', 'Rebalancing now applies automatically and does not interrupt wizard flow.');
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'templateapply'){
      if(!session){
        setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      var templateChoice = parsed.flags.choice || parsed.flags.action || '';
      var templateApplyResult = applyPendingTemplateChoice(session, templateChoice);
      var checkpointResult = null;
      if(!templateApplyResult.error && templateApplyResult.status !== 'canceled'){
        checkpointResult = persistTemplateApplyCheckpoint(pid, session);
      }
      setView(pid, 'chooser:template');
      touchSession(session);
      storeSession(pid, session);
      if(currentTemplateHandout(pid)){
        ensureTemplateHandout(pid, session);
      }
      if(currentPoiHandout(pid)){
        ensurePoiHandout(pid, session);
      }
      if(currentTradeHandout(pid)){
        ensureTradeHandout(pid, session);
      }
      if(currentReviewHandout(pid) && currentView(pid) === 'review'){
        ensureReviewHandout(pid, session);
      }
      refreshOpenMultiHandouts(pid, session);
      if(templateApplyResult.error){
        setStatus(pid, 'error', templateApplyResult.error);
      }else if(checkpointResult && checkpointResult.error){
        setStatus(pid, 'error', checkpointResult.error);
      }else if(templateApplyResult.status === 'canceled'){
        setStatus(pid, 'info', templateApplyResult.message || 'Template apply was canceled.');
      }else if(templateApplyResult.status === 'complete'){
        setStatus(pid, 'success', (templateApplyResult.message || 'Template category confirmation is complete.') + ' Checkpoint saved to endpoint.');
      }else{
        var statusLine = (templateApplyResult.status === 'applied' ? 'Applied: ' : 'Skipped: ')
          + String(templateApplyResult.stepTitle || 'Category') + '.';
        if(templateApplyResult.nextTitle){
          statusLine += ' Next: ' + String(templateApplyResult.nextTitle || '') + '.';
        }
        statusLine += ' Checkpoint saved.';
        setStatus(pid, 'info', statusLine);
      }
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'cancel'){
      clearSession(pid);
      clearStatus(pid);
      setBlankView(pid, true);
      setView(pid, 'bind');
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'reset'){
      if(lower(parsed.flags.confirm || '') !== 'yes'){
        refreshChatView(pid);
        return;
      }
      clearSession(pid);
      setStatus(pid, 'info', 'Map Point Wizard was reset. Unsaved changes were discarded.');
      setBlankView(pid, true);
      setView(pid, 'bind');
      refreshChatView(pid);
      return;
    }

    if(!session){
      setStatus(pid, 'error', 'No active Map Point Wizard session is open.');
      setView(pid, 'bind');
      refreshChatView(pid);
      return;
    }

    if(parsed.action !== 'finish'){
      clearPendingFinishChoice(session);
    }
    touchSession(session);

    if(parsed.action === 'resume'){
      clearPendingFinishChoice(session);
      clearPendingSanityChoice(session);
      clearStatus(pid);
      storeSession(pid, session);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'finish'){
      if(session.pendingTemplateApply){
        setStatus(pid, 'info', 'Resolve the pending template category confirmation before saving.');
        refreshChatView(pid);
        return;
      }
      if(lower(parsed.flags.force || '') !== 'yes'){
        var selectionState = finishSelectionState(session, msg, parsed.flags.token || '');
        if(!selectionState.matches){
          session.pendingFinishChoice = {
            originalTokenId: String(session.tokenId || ''),
            originalLabel: tokenDisplayName(selectionState.sessionToken, session.tokenId),
            currentTokenId: String((selectionState.selectedToken && selectionState.selectedToken.id) || ''),
            currentLabel: selectionState.selectedToken ? tokenDisplayName(selectionState.selectedToken) : 'No token selected'
          };
          setStatus(pid, 'info', 'Choose which token should receive these wizard changes.');
          setView(pid, 'review');
          refreshChatView(pid);
          return;
        }
      }
      clearPendingFinishChoice(session);
      clearPendingSanityChoice(session);
      var finished;
      try{
        finished = finalizeSession(pid, session, parsed.flags.token || '');
      }catch(finalizeErr){
        finished = { error:'Save failed unexpectedly: ' + String(finalizeErr) };
      }
      if(finished.error){
        setStatus(pid, 'error', finished.error);
        setView(pid, 'review');
        refreshChatView(pid);
        return;
      }
      clearSession(pid);
      setView(pid, 'bind');
      clearStatus(pid);
      clearCachedSelection(pid);
      clearMapRecordSelection(pid);
      whisper(pid, '<div>' + esc('Saved Map Point Wizard settings to ' + tokenDisplayName(finished.token) + '.') + '</div>');
      whisperCampaignMenu(pid);
      return;
    }

    var autoSanity = null;
    clearPendingSanityChoice(session);
    if((parsed.action === 'pick' || parsed.action === 'set') && manualSanityField(parsed.flags.field || '')){
      autoSanity = buildSanityChoice(session, parsed.action, parsed.flags.field || '', parsed.flags.value || '');
    }

    if(parsed.action === 'poiset' || parsed.action === 'poiremove' || parsed.action === 'poiclear' || parsed.action === 'poicustom' || parsed.action === 'poirename'){
      setPoiCategory(pid, parsed.flags.category || '');
    }

    if(parsed.action === 'pick'){
      error = applyPick(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
    }
    else if(parsed.action === 'set') error = applySet(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
    else if(parsed.action === 'poiset') error = applyPoiSet(session, parsed.flags.category || '', parsed.flags.key || '', parsed.flags.label || '', parsed.flags.count || '');
    else if(parsed.action === 'poiremove') error = applyPoiRemove(session, parsed.flags.category || '', parsed.flags.key || '');
    else if(parsed.action === 'poiclear') error = applyPoiClear(session, parsed.flags.category || '');
    else if(parsed.action === 'poicustom') error = applyPoiCustom(session, parsed.flags.category || '', parsed.flags.label || '', parsed.flags.count || '');
    else if(parsed.action === 'poirename') error = applyPoiRename(session, parsed.flags.category || '', parsed.flags.key || '', parsed.flags.label || '');
    else if(parsed.action === 'multiadd') error = applyMultiAdd(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
    else if(parsed.action === 'multicustom') error = applyMultiCustom(session, lower(parsed.flags.field || ''), parsed.flags.label || '', parsed.flags.score || '');
    else if(parsed.action === 'multiedit') error = applyMultiEdit(session, lower(parsed.flags.field || ''), parsed.flags.value || '', parsed.flags.label || '', parsed.flags.score || '');
    else if(parsed.action === 'multiremove') error = applyMultiRemove(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
    else if(parsed.action === 'multiclear') error = applyMultiClear(session, lower(parsed.flags.field || ''));
    else if(parsed.action === 'tradeclear') error = applyTradeClear(session, parsed.flags.group || '');
    else if(parsed.action === 'tradegroupadd'){
      var addedTradeGroup = applyTradeGroupAdd(pid, parsed.flags.label || '');
      error = addedTradeGroup.error || '';
    }
    else if(parsed.action === 'tradewindow') error = applyTradeWindowChange(session, parsed.flags.good || '', parsed.flags.window || '', parsed.flags.stance || '', parsed.flags.action || '', parsed.flags.cu || '', parsed.flags.note || '');
    else if(parsed.action === 'tradecell') error = applyTradeCellChange(session, parsed.flags.good || '', parsed.flags.period || '', parsed.flags.stance || '', parsed.flags.action || '', parsed.flags.cu || '', parsed.flags.note || '');
    else error = 'Unknown Map Point Wizard command.';

    if(!error && autoSanity){
      session.data = mergeSnapshotIntoData(session.data, autoSanity.patch || {});
      var noticeTemplateKey = String((session.data && session.data.template) || '').trim();
      if(noticeTemplateKey && String(session.sanityNoticeTemplateKey || '') !== noticeTemplateKey){
        session.pendingSanityChoice = {
          field:autoSanity.field,
          value:autoSanity.value,
          changeList:autoSanity.changeList || []
        };
        session.sanityNoticeTemplateKey = noticeTemplateKey;
      }else{
        clearPendingSanityChoice(session);
      }
    }

    touchSession(session);
    storeSession(pid, session);
    if(error){
      setStatus(pid, 'error', error);
      refreshChatView(pid);
      return;
    }
    if(parsed.action === 'tradeclear' || parsed.action === 'tradegroupadd' || parsed.action === 'tradewindow' || parsed.action === 'tradecell'){
      if(currentTradeHandout(pid)){
        ensureTradeHandout(pid, session);
      }
    }
    if(parsed.action === 'poiset' || parsed.action === 'poiremove' || parsed.action === 'poiclear' || parsed.action === 'poicustom' || parsed.action === 'poirename'){
      if(currentPoiHandout(pid)){
        ensurePoiHandout(pid, session);
      }
    }
    if(parsed.action === 'multiadd' || parsed.action === 'multicustom' || parsed.action === 'multiedit' || parsed.action === 'multiremove' || parsed.action === 'multiclear'){
      var multiField = normalizeKey(parsed.flags.field || '');
      if(isMultiHandoutField(multiField) && currentMultiHandout(pid, multiField)){
        ensureMultiHandout(pid, session, multiField);
      }
    }
    if(parsed.action === 'pick' && (
      lower(parsed.flags.field || '') === 'template'
      || lower(parsed.flags.field || '') === 'region'
      || lower(parsed.flags.field || '') === 'locale'
    )){
      var pickedField = lower(parsed.flags.field || '');
      if(pickedField === 'locale'){
        setTemplateShowMode(pid, 'filtered');
      }
      setTemplateCategory(
        pid,
        (session.pendingTemplateApply && session.pendingTemplateApply.templateCategory)
          || session.data.template_category
          || ''
      );
      if(currentTemplateHandout(pid) && pickedField !== 'template'){
        ensureTemplateHandout(pid, session);
      }
      if(currentPoiHandout(pid)){
        ensurePoiHandout(pid, session);
      }
      if(currentTradeHandout(pid)){
        ensureTradeHandout(pid, session);
      }
    }
    if(currentReviewHandout(pid) && currentView(pid) === 'review'){
      ensureReviewHandout(pid, session);
    }
    clearStatus(pid);
    refreshChatView(pid);
  }

  /* ======================================================================== */
  /* Core Integration                                                          */
  /* ======================================================================== */

  function helpLines(){
    return [
      'Commands',
      '!fts --mapPointWizard',
      '!fts --mapPointWizard start',
      '!fts --mapPointWizard panel',
      '!fts --mapPointWizard back',
      '!fts --mapPointWizard next',
      '!fts --mapPointWizard reset --confirm yes',
      '!fts --mapPointWizard finish',
      '!fts --mapPointWizard templateView --category <categoryKey>',
      '!fts --mapPointWizard templateApply --choice <apply|cancel>',
      '!fts --mapPointWizard poiView --category <categoryKey>',
      '!fts --mapPointWizard poiRename --category <categoryKey> --key <poiKey> --label <displayName>',
      '!fts --mapPointWizard tradeGroupAdd --label <name>',
      '',
      'GM-only behavior',
      'Wizard Menu is the primary GM launcher for Map Point Wizard.',
      'Wizard Menu opens the section-based chat wizard after refreshing shared FTS state.',
      'The first section binds the selected token; later sections ask one focused question at a time.',
      'Every section ends with Back, Next, Reset, and Save and Exit buttons.',
      'Template selection is edited in an ephemeral handout opened from the template section and uses top-level categories plus subtype entries; defaults are then confirmed and written one category at a time in chat.',
      'Each confirmed template category writes an immediate checkpoint to the bound token endpoint before the next category is presented.',
      'Points of Interest are edited in an ephemeral handout with categorized toggle lists, numeric counts, GM-defined display names, and custom entries.',
      'Trade goods are edited in an ephemeral handout opened from the trade section and stay category-level with has / wants / needs calendar entries.',
      'Trade category selection uses compact toggle lists and supports custom GM-added categories.',
      'Templates are built into the wizard by default, and each loaded region may add or override templates through tradePoints.templates.',
      'Template defaults are aligned to medieval-demographics guidance and always remain editable in later sections.',
      'Manual edits to core economic fields auto-rebalance linked defaults without interrupting flow and show a one-time warning per selected template.',
      'Offense and defense levels are derived automatically from POI offense/defense capability selections using weighted point values.',
      'POI changes automatically recalculate a comprehensive trade profile for the map-point endpoint while preserving custom trade categories.',
      'Start Map Point Wizard binds to the currently selected token only and warns if nothing is selected.',
      'Final review is presented in an ephemeral handout while chat keeps Back, Next, Reset, and Save and Exit controls.',
      'Save and Exit writes a standardized [FTS_TRADEPOINT] block to gmnotes, writes a player-facing current-trade tooltip, stores an instance snapshot in the mule, enables tooltip display, disables the token menu, and sets lockMovement to true.',
      'Reset discards unsaved session changes and returns to the bind-token section.'
    ];
  }

  function registerWithCore(){
    try{
      if(!(RT.fts && typeof RT.fts.addHelpSection === 'function')) return;
      RT.fts.addHelpSection(24, 'Map Point Wizard', helpLines);
      if(typeof RT.fts.refreshHelpHandout === 'function'){
        RT.fts.refreshHelpHandout(null);
      }
    }catch(e2){
      log('fts_mapPointWizard registerWithCore err: ' + e2);
    }
  }

  function startup(){
    ensureState();
    mergeVersionEntry(getOrCreateMule(), MODULE_KEY, VERSION);
    registerWithCore();
  }

  on('ready', function(){
    startup();
    log('fts_mapPointWizard v' + VERSION + ' ready.');
  });

  on('chat:message', handleWizardMessage);
  on('chat:message', function(msg){
    try{
      if(msg.type !== 'api') return;
      if(isSelfChatMessage(msg)) return;
      var content = String(msg.content || '').trim();
      if(!isWizardCommandContent(content) && !/^!fts(\b|$)/i.test(content)) return;
      var tail = extractWizardCommandTail(content);
      if(tail !== null){
        var parsed = parseInnerCommand(tail);
        if(normalizeWizardAction(parsed.action) === 'finish') return;
      }
      cacheSelection(msg.playerid, msg);
    }catch(e){
      log('fts_mapPointWizard selection cache err: ' + e);
    }
  });

  try{
    RT.fts_mapPointWizard = {
      refresh: function(pid){
        return refreshChatView(pid || '');
      },
      getLaunchCommand: function(){
        return commandExpr('panel');
      }
    };
  }catch(e2){
    log('fts_mapPointWizard export err: ' + e2);
  }

})();
