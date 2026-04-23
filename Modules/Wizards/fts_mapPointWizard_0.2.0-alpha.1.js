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
// This module is primarily chat-driven. Trade-category calendars are edited in
// an ephemeral handout while other interactions stay in whisper panels.
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
  var TRADE_PANEL_TITLE = 'Trade Goods Categories';
  var LIBRARY_ABILITY = 'mapPointWizard';
  var TRADE_STANCE_ORDER = ['has', 'wants', 'needs'];
  var TOOLTIP_MAX_CHARS = 150;
  var TOOLTIP_LINE_BREAK = '\u2028';
  var WIZARD_ACTIONS = {
    panel:1, start:1, cancel:1, reset:1, resume:1, finish:1, back:1, next:1, section:1,
    chooser:1, tradeview:1, pick:1, set:1,
    multiadd:1, multicustom:1, multiedit:1, multiremove:1, multiclear:1,
    tradeclear:1, tradewindow:1, tradecell:1, tradegroupadd:1
  };
  var WIZARD_FLAG_ALIASES = {
    token:'token', confirm:'confirm', force:'force', field:'field', value:'value',
    label:'label', score:'score', group:'group', good:'good', window:'window', key:'key', move:'move',
    stance:'stance', action:'action', period:'period', note:'note',
    cargounits:'cu'
  };
  var SECTION_SEQUENCE = [
    { key:'bind',          view:'bind',                  label:'Bind Token',       requiresSession:false },
    { key:'template',      view:'chooser:template',      label:'Template',         requiresSession:true  },
    { key:'name',          view:'step:name',             label:'Name',             requiresSession:true  },
    { key:'region',        view:'chooser:region',        label:'Region',           requiresSession:true  },
    { key:'locale',        view:'chooser:locale',        label:'Locale',           requiresSession:true  },
    { key:'population',    view:'step:population',       label:'Population',       requiresSession:true  },
    { key:'development',   view:'chooser:development',   label:'Development',      requiresSession:true  },
    { key:'wealth',        view:'chooser:wealth',        label:'Wealth',           requiresSession:true  },
    { key:'cultures',      view:'chooser:cultures',      label:'Cultures',         requiresSession:true  },
    { key:'faiths',        view:'chooser:faiths',        label:'Faiths',           requiresSession:true  },
    { key:'factions',      view:'chooser:factions',      label:'Factions',         requiresSession:true  },
    { key:'allies',        view:'chooser:allies',        label:'Allies',           requiresSession:true  },
    { key:'enemies',       view:'chooser:enemies',       label:'Enemies',          requiresSession:true  },
    { key:'offense_types', view:'chooser:offense_types', label:'Offense Types',    requiresSession:true  },
    { key:'defense_types', view:'chooser:defense_types', label:'Defense Types',    requiresSession:true  },
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

  var SINGLE_CHOOSER_FIELDS = ['template', 'region', 'locale', 'development', 'wealth'];
  var CHOOSER_FIELD_ORDER = SINGLE_CHOOSER_FIELDS.concat(['cultures', 'faiths', 'factions', 'allies', 'enemies', 'offense_types', 'defense_types']);
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
    {
      key:'fishing_village',
      label:'Fishing Village',
      summary:'Small coastal trade node with dependable catch, modest wealth, and simple defenses.',
      defaults:{
        locale:'coastal',
        population:'350',
        development:'2',
        wealth:'2',
        faiths:['chauntea', 'umberlee'],
        factions:['fishers_guild', 'town_council'],
        offense_types:['militia', 'scouts'],
        defense_types:['harbor_patrols', 'natural_barriers'],
        tradeGoods:[
          { stance:'has',   goodKey:'fish_fresh',      windows:[{ key:'spring', cu:'6' }, { key:'summer', cu:'10' }, { key:'autumn', cu:'8' }] },
          { stance:'has',   goodKey:'fish_salted',     windows:[{ key:'annual', cu:'4' }] },
          { stance:'wants', goodKey:'grain',           windows:[{ key:'annual', cu:'5' }] },
          { stance:'needs', goodKey:'lamp_oil',        windows:[{ key:'annual', cu:'2' }] }
        ]
      }
    },
    {
      key:'pirate_smuggler_cove',
      label:'Pirate / Smuggler Cove',
      summary:'Hidden maritime exchange point with illicit traffic, sharper offense, and fragile legitimacy.',
      defaults:{
        locale:'coastal',
        population:'220',
        development:'2',
        wealth:'3',
        faiths:['mask', 'umberlee'],
        factions:['pirate_captains', 'smugglers_ring'],
        offense_types:['armed_ships', 'raiders', 'saboteurs'],
        defense_types:['hidden_channels', 'natural_barriers', 'safehouses'],
        tradeGoods:[
          { stance:'has',   goodKey:'stolen_goods',        windows:[{ key:'annual', cu:'3' }] },
          { stance:'has',   goodKey:'smuggled_luxuries',   windows:[{ key:'summer', cu:'4' }, { key:'autumn', cu:'5' }] },
          { stance:'wants', goodKey:'ship_repair_supplies',windows:[{ key:'annual', cu:'4' }] },
          { stance:'needs', goodKey:'medicinal_herbs',     windows:[{ key:'annual', cu:'1' }] }
        ]
      }
    },
    {
      key:'minor_trade_hub',
      label:'Minor Market Location',
      summary:'Modest inland market center with steady caravan traffic and practical civic infrastructure.',
      defaults:{
        locale:'inland',
        population:'1200',
        development:'3',
        wealth:'3',
        faiths:['waukeen'],
        factions:['merchants_guild', 'town_council'],
        offense_types:['militia', 'trained_guard'],
        defense_types:['patrols', 'walls'],
        tradeGoods:[
          { stance:'has',   goodKey:'iron_tools',  windows:[{ key:'annual', cu:'4' }] },
          { stance:'has',   goodKey:'warehousing', windows:[{ key:'annual', cu:'6' }] },
          { stance:'wants', goodKey:'grain',       windows:[{ key:'annual', cu:'6' }] },
          { stance:'needs', goodKey:'rope',        windows:[{ key:'annual', cu:'2' }] }
        ]
      }
    },
    {
      key:'moderate_trade_hub',
      label:'Moderate Market Location',
      summary:'Established trade city with deeper reserves, stronger customs presence, and broader seasonal throughput.',
      defaults:{
        locale:'coastal',
        population:'4200',
        development:'4',
        wealth:'4',
        faiths:['tyr', 'waukeen'],
        factions:['customs_office', 'harbormaster_office', 'merchants_guild'],
        offense_types:['marines', 'trained_guard'],
        defense_types:['fortified_docks', 'harbor_patrols', 'walls'],
        tradeGoods:[
          { stance:'has',   goodKey:'warehousing',       windows:[{ key:'annual', cu:'10' }] },
          { stance:'has',   goodKey:'passage_transport', windows:[{ key:'spring', cu:'5' }, { key:'summer', cu:'8' }, { key:'autumn', cu:'6' }] },
          { stance:'wants', goodKey:'metal_ingots',      windows:[{ key:'annual', cu:'6' }] },
          { stance:'needs', goodKey:'ship_repair_supplies', windows:[{ key:'annual', cu:'4' }] }
        ]
      }
    },
    {
      key:'major_trade_hub',
      label:'Major Market Location',
      summary:'Major regional trade city with exceptional throughput, powerful institutions, and year-round cargo demand.',
      defaults:{
        locale:'coastal',
        population:'12000',
        development:'5',
        wealth:'5',
        faiths:['gond', 'tyr', 'waukeen'],
        factions:['customs_office', 'harbormaster_office', 'merchants_guild', 'town_guard'],
        offense_types:['armed_ships', 'marines', 'trained_guard'],
        defense_types:['fortified_docks', 'gatehouses', 'harbor_chain', 'walls'],
        tradeGoods:[
          { stance:'has',   goodKey:'shipwright_services', windows:[{ key:'annual', cu:'10' }] },
          { stance:'has',   goodKey:'spices',              windows:[{ key:'spring', cu:'4' }, { key:'summer', cu:'7' }, { key:'autumn', cu:'6' }] },
          { stance:'has',   goodKey:'warehousing',         windows:[{ key:'annual', cu:'18' }] },
          { stance:'wants', goodKey:'grain',               windows:[{ key:'annual', cu:'14' }] },
          { stance:'needs', goodKey:'lumber',              windows:[{ key:'annual', cu:'8' }] }
        ]
      }
    }
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
  }

  /* ======================================================================== */
  /* Chat Surface                                                              */
  /* ======================================================================== */

  function chooserPanelTitle(field){
    return CHOOSER_PANEL_TITLES[field] || ('Map Point ' + titleCaseToken(field));
  }

  function renderChooserPanel(pid, field){
    return renderChooserViewPanel(field, pid);
  }

  function renderTradePanel(pid){
    var session = currentSession(pid);
    if(currentBlankView(pid)) session = null;
    return session ? renderTradeGoodsSelectionPanel(pid, session) : renderTradeGoodsSelectionLauncher(pid);
  }

  function renderActivePanel(pid){
    var view = currentView(pid);
    if(view === 'bind') return renderBindSectionPanel(pid);
    if(view === 'step:name') return renderNameSectionPanel(pid);
    if(view === 'step:population') return renderPopulationSectionPanel(pid);
    if(view === 'review') return renderReviewSectionPanel(pid);
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
        tradeGroup:{},
        tradeHandout:{},
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
      if(!S.tradeGroup) S.tradeGroup = {};
      if(!S.tradeHandout) S.tradeHandout = {};
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

  function normalizeTradeTemplateDefaults(raw, regionKey){
    var out = normalizePartialData(raw || {});
    if(!out.region && regionKey) out.region = regionKey;
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
    return {
      key: templateStorageKey(regionKey, key),
      templateKey: key,
      regionKey: String(regionKey || ''),
      label: label,
      displayLabel: label,
      desc: String(raw.summary || raw.desc || raw.description || '').trim(),
      defaults: normalizeTradeTemplateDefaults(raw.defaults || {}, regionKey)
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
    var root = safeParseJSON(getAbilityAction(mule, 'regions'), { schema:'fts.regions.root.v1', regions:{} });
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
    destroyTradeHandout(pid);
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
      region: String(data.region || ''),
      locale: String(data.locale || ''),
      population: String(data.population || ''),
      development: String(data.development || ''),
      wealth: String(data.wealth || ''),
      cultures: Array.isArray(data.cultures) ? data.cultures.length : 0,
      faiths: Array.isArray(data.faiths) ? data.faiths.length : 0,
      factions: Array.isArray(data.factions) ? data.factions.length : 0,
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

    destroyTradeHandout(pid);

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
    data.cultures = sortFieldValues('cultures', data.cultures || []);
    data.faiths = sortFieldValues('faiths', data.faiths || []);
    data.factions = sortFieldValues('factions', data.factions || []);
    data.allies = sortFieldValues('allies', data.allies || []);
    data.enemies = sortFieldValues('enemies', data.enemies || []);
    data.offense_types = sortFieldValues('offense_types', data.offense_types || []);
    data.defense_types = sortFieldValues('defense_types', data.defense_types || []);
    data.offense_level = strengthTierValue(strengthPoints('offense', data.offense_types));
    data.defense_level = strengthTierValue(strengthPoints('defense', data.defense_types));
    data.tradeGoods = normalizeTradeGoods(data.tradeGoods || []);
    return data;
  }

  function syncDerivedPartialData(out){
    out = out || {};
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
      tradeGoods: raw.tradeGoods || []
    });
  }

  function normalizePartialData(raw){
    raw = raw || {};
    var out = {};
    var keys = ['name', 'template', 'region', 'locale', 'depth_elevation', 'population', 'development', 'wealth', 'offense_level', 'defense_level'];
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
    return syncDerivedPartialData(out);
  }

  function mergeSnapshotIntoData(base, snapshot){
    var out = snapshotData(base);
    snapshot = snapshot || {};
    var keys = ['name', 'template', 'region', 'locale', 'depth_elevation', 'population', 'development', 'wealth', 'offense_level', 'defense_level'];
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

  function strengthSummaryText(kind, data){
    var points = strengthPoints(kind, data[(kind === 'defense') ? 'defense_types' : 'offense_types'] || []);
    var value = String(data[(kind === 'defense') ? 'defense_level' : 'offense_level'] || '');
    var tier = tierByValue(STRENGTH_TIERS, value) || { label:value };
    return points + ' pts - ' + String(tier.label || value) + ' (' + value + ')';
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
    html += '<div style="margin-top:8px;">';
    html += inlineActionLink(tradePanelHref(groupKey), 'Refresh Category', false);
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
    html += '<div style="' + cardStyle + '">';
    html += renderSectionHeading(group.label);
    html += '<div style="margin-top:4px;">' + esc(tradeGoodGroupDescription(group.key)) + '</div>';
    html += muted('Use the category-wide grids below to record general trade posture for the entire ' + lower(group.label) + ' category.');
    html += renderTradeSeasonMatrix(list, target);
    html += renderTradeGoodsMatrix(list, target);
    html += renderTradeCategoryControls(pid, group.key);
    html += '</div>';
    return html;
  }

  function tradeCategoryEchoLine(list, groupKey, stance){
    var entry = tradeEntryFor(list, stance, tradeGroupTargetKey(groupKey));
    return entry ? tradeScheduleSummary(entry) : 'none';
  }

  function tradeCategoryEchoLines(list, groupKey, stance){
    var entry = tradeEntryFor(list, stance, tradeGroupTargetKey(groupKey));
    return entry ? tradeScheduleLines(entry) : [];
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
        html += '<div style="margin-top:4px;"><b>' + esc(tradeStanceLabel(stance)) + ':</b></div>';
        html += '<ul style="margin:2px 0 0 18px;padding:0;">';
        for(var li=0;li<lines.length;li++){
          html += '<li style="margin:2px 0;">' + esc(lines[li]) + '</li>';
        }
        html += '</ul>';
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
    return 'Map Point Wizard Trade Categories - ' + token + ' - ' + playerName(pid || '');
  }

  function renderTradeHandoutNotes(pid, session, activeGroupKey){
    var list = normalizeTradeGoods((session && session.data && session.data.tradeGoods) || []);
    var html = '<div style="font:14px/1.32 Georgia,serif;color:#111;">';
    html += '<h3 style="margin:0 0 8px 0;">Map Point Wizard Trade Categories</h3>';
    html += '<div style="margin-bottom:8px;">Bound location: <b>' + esc(boundTokenSpecifics(session)) + '</b></div>';
    html += renderTradeGoodsSelectionToolbar(pid, activeGroupKey);
    html += renderTradeGoodsSelectionCategories(list, pid, activeGroupKey);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += actionLink(tradePanelHref(activeGroupKey), 'Refresh Handout', false);
    html += '</div>';
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
      url: 'https://journal.roll20.net/handout/' + handout.id
    };
  }

  function renderTradeHandoutOpenLink(url, label){
    return '<a href="' + hrefAttr(url || '#') + '" target="_blank" rel="noopener noreferrer" style="' + linkStyle(false) + '">' + esc(label) + '</a>';
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
      html += renderTradeHandoutOpenLink(handoutState.url, 'Open Trade Categories Handout');
      html += actionLink(tradePanelHref(handoutState.activeGroupKey), 'Refresh Handout Contents', false);
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
      return 'Base templates always appear here. Region-specific templates join the list after you choose a region.';
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

  function compactToggleLink(href, label, selected){
    var tone = compactToggleTone(selected);
    var style = 'display:block;margin-top:4px;padding:4px 6px;text-decoration:none;line-height:1.25;'
      + 'border:1px solid ' + tone.border + ';background:' + tone.background + ';color:' + tone.color + ';'
      + 'border-radius:4px;text-align:left;';
    style += selected ? 'font-weight:bold;' : '';
    var attrs = ' href="' + hrefAttr(href) + '" style="' + style + '"';
    if(String(href || '').charAt(0) !== '#' && RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      attrs = RT.fts.actionLinkAttrs(href);
      attrs = mergeStyleAttr(attrs, style);
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
        var lines = tradeScheduleLines(entry).map(function(line){
            return esc(line);
          });
        return '<b>' + esc(tradeGoodLabel(entry.goodKey)) + '</b><br>' + lines.join('<br>');
      }).join('<br>');
    }

    row('Template', esc(template ? template.displayLabel : 'None selected'));
    row('Name', esc(data.name || ''));
    row('Region', esc(resolveRegionLabel(data.region)));
    row('Locale', esc(resolveLocaleLabel(data.region, data.locale)));
    row('Population', esc(String(data.population || '')));
    row('Development', esc(data.development + ' - ' + valueLabel('development', data.development, session)));
    row('Wealth', esc(data.wealth + ' - ' + valueLabel('wealth', data.wealth, session)));
    row('Culture', listValue('cultures'));
    row('Faith & Deities', listValue('faiths'));
    row('Prominent Factions', listValue('factions'));
    row('Prominent Allies', listValue('allies'));
    row('Prominent Enemies', listValue('enemies'));
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
    var tone = {
      border:'rgba(44, 90, 160, 0.35)',
      bg:'rgba(44, 90, 160, 0.08)',
      title:'Notice'
    };
    if(status.level === 'error'){
      tone = {
        border:'rgba(122, 27, 27, 0.38)',
        bg:'rgba(122, 27, 27, 0.08)',
        title:'Attention'
      };
    }else if(status.level === 'success'){
      tone = {
        border:'rgba(38, 112, 52, 0.38)',
        bg:'rgba(38, 112, 52, 0.10)',
        title:'Saved'
      };
    }
    return '<div style="' + (cssVars().card || '')
      + 'border:1px solid ' + tone.border + ';background:' + tone.bg + ';">'
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
    var rowA = [
      'Region: ' + resolveRegionLabel(applied.region || ''),
      'Locale: ' + resolveLocaleLabel(applied.region || '', applied.locale || ''),
      'Population: ' + (String(applied.population || '').trim() || 'unset')
    ];
    var rowB = [
      'Development: ' + (String(applied.development || '').trim() || 'unset'),
      'Wealth: ' + (String(applied.wealth || '').trim() || 'unset'),
      'Cultures: ' + String(applied.cultures || 0),
      'Faiths: ' + String(applied.faiths || 0),
      'Factions: ' + String(applied.factions || 0),
      'Trade Categories: ' + String(applied.tradeCategories || 0)
    ];
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Template Applied:</b> ' + esc(applied.label || applied.key || 'Unknown') + '</div>';
    html += '<div style="margin-top:4px;">' + esc(rowA.join(' | ')) + '</div>';
    html += '<div style="margin-top:4px;">' + esc(rowB.join(' | ')) + '</div>';
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
    var nextEnabled = !!nextMeta && (!nextMeta.requiresSession || !!session);
    var saveEnabled = !!session;

    var html = '<div style="' + controlAreaStyle() + '">';
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
    html += renderInlineField('Current Population', renderSingleValue(session.data.population || 'Not set'), inlineActionLink(fieldSetHref('population', 'Average Population', session.data.population || ''), 'Set Population', false));
    html += '</div>';
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  function renderReviewSectionPanel(pid){
    var session = sectionSession(pid);
    if(!session){
      setView(pid, 'bind');
      return renderBindSectionPanel(pid);
    }
    var html = shell(TITLE);
    html += renderStatusBanner(pid);
    html += sectionProgressCard(pid);
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div style="margin-top:4px;">Review all values below, then use <b>Save and Exit</b> when you are ready.</div>';
    html += renderReviewBlock(session);
    html += '</div>';
    html += renderPendingFinishChoice(session);
    html += renderSectionNavigation(pid);
    html += endShell();
    return html;
  }

  /* ======================================================================== */
  /* Save Output                                                               */
  /* ======================================================================== */

  function tooltipLineForStance(stance, labels, mode){
    labels = Array.isArray(labels) ? labels.slice() : [];
    if(!labels.length){
      return tradeStanceLabel(stance) + ': none';
    }
    if(mode === 'count' && labels.length > 1){
      return tradeStanceLabel(stance) + ': ' + labels.length + ' categories';
    }
    if(mode === 'compact' && labels.length > 2){
      return tradeStanceLabel(stance) + ': ' + labels.slice(0, 2).join(', ') + ' +' + (labels.length - 2);
    }
    return tradeStanceLabel(stance) + ': ' + labels.join(', ');
  }

  function buildTooltipText(session){
    var data = session.data;
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
    var lines = [
      String(data.name || '').trim() || 'Location',
      tooltipLineForStance('has', has),
      tooltipLineForStance('wants', wants),
      tooltipLineForStance('needs', needs)
    ];
    var tooltip = lines.join(TOOLTIP_LINE_BREAK);
    if(tooltip.length <= TOOLTIP_MAX_CHARS) return tooltip;
    lines = [
      String(data.name || '').trim() || 'Location',
      tooltipLineForStance('has', has, 'compact'),
      tooltipLineForStance('wants', wants, 'compact'),
      tooltipLineForStance('needs', needs, 'compact')
    ];
    tooltip = lines.join(TOOLTIP_LINE_BREAK);
    if(tooltip.length <= TOOLTIP_MAX_CHARS) return tooltip;
    lines = [
      String(data.name || '').trim() || 'Location',
      tooltipLineForStance('has', has, 'count'),
      tooltipLineForStance('wants', wants, 'count'),
      tooltipLineForStance('needs', needs, 'count')
    ];
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
    var cultures = fieldDisplayValues('cultures', data.cultures || [], session);
    var faiths = fieldDisplayValues('faiths', data.faiths || [], session);
    var factions = fieldDisplayValues('factions', data.factions || [], session);
    var allies = fieldDisplayValues('allies', data.allies || [], session);
    var enemies = fieldDisplayValues('enemies', data.enemies || [], session);
    var offenseTypes = fieldDisplayValues('offense_types', data.offense_types || [], session);
    var defenseTypes = fieldDisplayValues('defense_types', data.defense_types || [], session);
    var lines = [
      '[FTS_TRADEPOINT]',
      'name: ' + String(data.name || '').trim(),
      'template: ' + String(template.key || ''),
      'template_label: ' + String(template.label || ''),
      'template_region: ' + String(template.regionKey || ''),
      'region: ' + String(data.region || ''),
      'region_label: ' + resolveRegionLabel(data.region),
      'locale: ' + String(data.locale || ''),
      'locale_label: ' + resolveLocaleLabel(data.region, data.locale),
      'avg_population: ' + String(data.population || ''),
      'development: ' + String(data.development || ''),
      'development_label: ' + String(development.label || ''),
      'wealth: ' + String(data.wealth || ''),
      'wealth_label: ' + String(wealth.label || ''),
      'culture: ' + cultures.join('; '),
      'faiths: ' + faiths.join('; '),
      'prominent_factions: ' + factions.join('; '),
      'prominent_allies: ' + allies.join('; '),
      'prominent_enemies: ' + enemies.join('; '),
      'offense_level: ' + String(data.offense_level || ''),
      'offense_level_label: ' + String(offense.label || ''),
      'offense_points: ' + String(offensePoints),
      'offense_types: ' + offenseTypes.join('; '),
      'defense_level: ' + String(data.defense_level || ''),
      'defense_level_label: ' + String(defense.label || ''),
      'defense_points: ' + String(defensePoints),
      'defense_types: ' + defenseTypes.join('; '),
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

  function finalizeSession(pid, session, explicitTokenId){
    var err = validateAllRequired(session);
    if(err) return { error:err };

    explicitTokenId = String(explicitTokenId || '').trim();
    var token = getObj('graphic', explicitTokenId || session.tokenId);
    if(!token) return { error:'The selected token no longer exists.' };

    var page = getObj('page', token.get('pageid') || session.pageId);
    var gmNotes = buildGMNotesText(session, token, page);
    var tooltip = buildTooltipText(session);

    token.set('name', String(session.data.name || '').trim());
    token.set('gmnotes', gmNotes);
    token.set('tooltip', tooltip);
    try{ token.set('show_tooltip', true); }catch(e1){}
    try{ token.set('disableTokenMenu', true); }catch(e2){}
    token.set('lockMovement', true);

    saveInstanceForToken(token.id, (page && page.id) || session.pageId, session.data);
    syncMapLocationFromWizard(pid, token, session);
    clearSession(pid);
    setBlankView(pid, true);
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
        session.data.template = '';
        clearTemplateAppliedSummary(session);
        return '';
      }
      var template = resolveTemplateChoice(session, value);
      if(!template) return 'Unknown template.';
      var token = getObj('graphic', session.tokenId);
      var page = getObj('page', session.pageId);
      var resetBase = defaultSessionData(token, page);
      resetBase.name = session.data.name || resetBase.name;
      session.data = mergeSnapshotIntoData(resetBase, template.defaults || {});
      session.data.template = template.key;
      setTemplateAppliedSummary(session, template);
      return '';
    }
    if(field === 'region'){
      if(!value || lower(value) === 'clear'){
        session.data.region = '';
        session.data.locale = '';
        session.data.template = '';
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
        session.data.template = '';
        clearTemplateAppliedSummary(session);
      }
      return '';
    }
    if(field === 'locale'){
      if(!value || lower(value) === 'clear'){
        session.data.locale = '';
        return '';
      }
      var opts = localeOptionsForRegion(session.data.region);
      var ok = false;
      for(var j=0;j<opts.length;j++){
        if(opts[j].key === value){ ok = true; break; }
      }
      if(!ok) return 'Unknown locale for the selected region.';
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
        touchSession(panelStart.session);
        storeSession(pid, panelStart.session);
        clearStatus(pid);
      }else{
        if(session) clearPendingFinishChoice(session);
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

    if(parsed.action === 'start'){
      var startToken = String(parsed.flags.token || '').trim();
      var started = startSession(pid, msg, startToken, !!startToken);
      if(started.error){
        setStatus(pid, 'error', started.error);
        setView(pid, 'bind');
        refreshChatView(pid);
        return;
      }
      clearPendingFinishChoice(started.session);
      touchSession(started.session);
      storeSession(pid, started.session);
      setStatus(pid, 'info', tokenDisplayName(started.token) + ' is ready in the Map Point Wizard.');
      setView(pid, 'chooser:template');
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
      clearStatus(pid);
      storeSession(pid, session);
      refreshChatView(pid);
      return;
    }

    if(parsed.action === 'finish'){
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
      var finished = finalizeSession(pid, session, parsed.flags.token || '');
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

    if(parsed.action === 'pick'){
      error = applyPick(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
    }
    else if(parsed.action === 'set') error = applySet(session, lower(parsed.flags.field || ''), parsed.flags.value || '');
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
      '!fts --mapPointWizard tradeGroupAdd --label <name>',
      '',
      'GM-only behavior',
      'Wizard Menu is the primary GM launcher for Map Point Wizard.',
      'Wizard Menu opens the section-based chat wizard after refreshing shared FTS state.',
      'The first section binds the selected token; later sections ask one focused question at a time.',
      'Every section ends with Back, Next, Reset, and Save and Exit buttons.',
      'Trade goods are edited in an ephemeral handout opened from the trade section and stay category-level with has / wants / needs calendar entries.',
      'Trade category selection uses compact toggle lists and supports custom GM-added categories.',
      'Templates are built into the wizard by default, and each loaded region may add or override templates through tradePoints.templates.',
      'Offense and defense levels are derived automatically from the selected offense and defense types using weighted point values.',
      'Start Map Point Wizard binds to the currently selected token only and warns if nothing is selected.',
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
