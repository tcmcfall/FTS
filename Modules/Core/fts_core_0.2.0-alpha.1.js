// name:        fts_core.js
// version:     0.2.0-alpha.1
// description: unified Fantasy Trade Simulator shell: registry/router/help & unified Campaign Log, palette owner.
// depends:     Meta-Toolbox (APILogic + Muler) : https://wiki.roll20.net/Meta-Toolbox
// provides:    !fts (unified panel), !fts --help, !fts --core set palette <value> [sc], fts.addLogCard(...), fts.cssVars() for modules
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

(function(){
  'use strict';

  var root = (typeof globalThis!=='undefined') ? globalThis
           : (typeof window!=='undefined')     ? window
           : (typeof self!=='undefined')       ? self
           : (typeof global!=='undefined')     ? global
           : {};

  var VERSION   = '0.2.0-alpha.1';
  var CORE_MULE = 'fts_mule';
  var HELP_HANDOUT_NAME = 'FTS Help';
  var SCRIPTCARDS_THEME_LABEL_ACTIVE = 'fts_palette_active';
  var SCRIPTCARDS_THEME_LABEL_PREFIX = 'fts_palette_';

  var fts = { VERSION: VERSION, COMMANDS:{}, HELP_SECTIONS:[], LOG_CARDS:[] };

  function ensureCoreState(){
    if (!root.state) root.state = {};
    if (!root.state.fts) root.state.fts = {};
    if (!root.state.fts.ui) root.state.fts.ui = { palette: 'parchment', scriptcardTheme: '' };
    if (!root.state.fts.ui.palette) root.state.fts.ui.palette = 'parchment';
    if (typeof root.state.fts.ui.scriptcardTheme !== 'string') root.state.fts.ui.scriptcardTheme = '';
    return root.state.fts;
  }
  var STARTUP_HOOKS = [];

  function registerStartup(name, fn){
    if('function' !== typeof fn){ return; }
    STARTUP_HOOKS.push({ name: String(name || 'module'), fn: fn });
  }

  function runStartupHooks(reason){
    try{
      ensureCoreState();
      var mule = ensureMule();
      mirrorCoreToMule();
      var hooks = STARTUP_HOOKS.slice();
      for(var i=0;i<hooks.length;i++){
        try{
          hooks[i].fn(mule, (reason || ''));
        }catch(e){
          log('fts startup ['+hooks[i].name+'] err: '+e);
        }
      }
    }catch(e){
      log('fts runStartupHooks err: '+e);
    }
  }


  function abilityActionLength(ability){
    try{ return String((ability && ability.get('action')) || '').length; }catch(e){ return 0; }
  }

  function abilityText(ability){
    try{ return String((ability && ability.get('action')) || ''); }catch(e){ return ''; }
  }

  function normalizeAbilityName(name){
    return String(name || '').toLowerCase().replace(/\s+/g,'');
  }

  function safeParseJSON(text){
    try{ return JSON.parse(String(text || '')); }catch(e){ return null; }
  }

  function regionsRootQuality(text){
    var parsed = safeParseJSON(text);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = (parsed.schema === 'fts.regions.root.v1') ? 50 : 0;
    var regions = parsed.regions;
    if(!regions || typeof regions !== 'object' || Array.isArray(regions)) return score;
    var keys = Object.keys(regions);
    score += keys.length * 5;
    for(var i=0;i<keys.length;i++){
      var payload = regions[keys[i]];
      if(!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      if(payload.schema === 'fts.region.v4') score += 200;
      if(payload.weather && typeof payload.weather === 'object' && !Array.isArray(payload.weather)) score += 100;
      if(payload.region) score += 10;
      if(payload.locales) score += 10;
    }
    return score;
  }

  function weatherRootQuality(text){
    var parsed = safeParseJSON(text);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return -1;
    var score = 0;
    if(parsed.meta && parsed.meta.rootSchema === 'fts.weather.root.v2') score += 200;
    if(parsed.settings && (parsed.settings.units === 'imperial' || parsed.settings.units === 'metric')) score += 25;
    if(parsed.current && typeof parsed.current === 'object' && !Array.isArray(parsed.current)) score += 25;
    if(parsed.history && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) score += 25;
    return score;
  }

  function abilitySortScore(name, ability){
    var text = abilityText(ability);
    var key = normalizeAbilityName(name || (ability && ability.get && ability.get('name')) || '');
    var base = abilityActionLength(ability);
    if(key === 'regions') return regionsRootQuality(text) * 1000000 + base;
    if(key === 'weather') return weatherRootQuality(text) * 1000000 + base;
    return base;
  }

  function namedAbilities(character, name){
    if(!character) return [];
    var list = findObjs({ _type:'ability', _characterid:character.id, name:name }) || [];
    list.sort(function(a, b){ return abilitySortScore(name, b) - abilitySortScore(name, a); });
    return list;
  }

  function upsertAbility(character, name, action){
    if(!character) return;
    var abilities = namedAbilities(character, name);
    if(abilities.length){
      for(var i=0;i<abilities.length;i++){
        abilities[i].set({ action:String(action||'') });
      }
    }else{
      createObj('ability', {
        characterid: character.id,
        name: name,
        action: String(action||''),
        istokenaction: false
      });
    }
  }

  function getAbilityAction(character, name){
    if(!character) return '';
    var ability = namedAbilities(character, name)[0];
    return ability ? String(ability.get('action')||'') : '';
  }

  function parseVersionRoot(raw){
    var root = {};
    raw = String(raw || '').split('\r').join('');
    if(!raw) return root;
    var lines = raw.split('\n');
    for(var i=0;i<lines.length;i++){
      var line = String(lines[i] || '').trim();
      if(!line) continue;
      var eq = line.indexOf('=');
      if(eq <= 0) continue;
      var key = String(line.slice(0, eq) || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
      var val = String(line.slice(eq + 1) || '').trim();
      if(key && val){ root[key] = val; }
    }
    return root;
  }

  function serializeVersionRoot(root){
    var lines = [];
    Object.keys(root || {}).sort().forEach(function(k){
      var key = String(k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
      var val = String(root[k] || '').trim();
      if(key && val){ lines.push(key + '=' + val); }
    });
    return lines.join('\n');
  }

  function mergeVersionEntry(character, moduleKey, moduleVersion){
    if(!character) return;
    var key = String(moduleKey || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
    if(!key) return;
    var root = parseVersionRoot(getAbilityAction(character, 'version'));
    var version = String(moduleVersion || '').trim();
    root[key] = version;
    upsertAbility(character, 'version', serializeVersionRoot(root));
  }


  function playerName(pid){
    try{ var p=getObj('player',pid); return p ? (p.get('displayname')||'GM') : 'GM'; }catch(e){ return 'GM'; }
  }
  function whisper(pid, html){ try{ sendChat('fts','/w "'+playerName(pid)+'" '+html); }catch(e){} }
  function esc(s){ return String(s||'').replace(/[<>&"']/g,function(c){return c=='<'?'&lt;':c=='>'?'&gt;':c=='&'?'&amp;':c=='"'?'&quot;':'&#39;';}); }
  function hrefAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
  function literal(s){ return '<code>'+esc(s)+'</code>'; }

  function uniqueIds(ids){
    var out = [];
    var seen = {};
    ids = Array.isArray(ids) ? ids : [];
    for(var i=0;i<ids.length;i++){
      var pid = String(ids[i] || '');
      if(!pid || seen[pid]) continue;
      seen[pid] = true;
      out.push(pid);
    }
    return out;
  }

  function playerIds(includeGMs){
    var out = [];
    var players = findObjs({_type:'player'}) || [];
    for(var i=0;i<players.length;i++){
      var pid = String((players[i] && players[i].id) || '');
      if(!pid) continue;
      var isGM = false;
      try{ isGM = !!playerIsGM(pid); }catch(e){}
      if(!includeGMs && isGM) continue;
      out.push(pid);
    }
    return uniqueIds(out);
  }

  function gmPlayerIds(){
    var out = [];
    var players = findObjs({_type:'player'}) || [];
    for(var i=0;i<players.length;i++){
      var pid = String((players[i] && players[i].id) || '');
      if(!pid) continue;
      try{
        if(playerIsGM(pid)) out.push(pid);
      }catch(e){}
    }
    return uniqueIds(out);
  }

  function ribbonPlayerIds(playerspecificpages){
    var split = {};
    var out = [];
    playerspecificpages = (playerspecificpages && typeof playerspecificpages === 'object') ? playerspecificpages : {};
    for(var pid in playerspecificpages){
      if(playerspecificpages.hasOwnProperty(pid) && pid){
        split[String(pid)] = true;
      }
    }
    var players = playerIds(false);
    for(var i=0;i<players.length;i++){
      if(!split[players[i]]) out.push(players[i]);
    }
    return uniqueIds(out);
  }

  function effectivePageIdForPlayer(pid, playerspecificpages, ribbonPageId){
    playerspecificpages = (playerspecificpages && typeof playerspecificpages === 'object') ? playerspecificpages : {};
    if(pid && playerspecificpages[pid]) return String(playerspecificpages[pid] || '');
    return String(ribbonPageId || '');
  }

  function changedPlayerspecificPageIds(prevPSP, nowPSP){
    var out = [];
    var seen = {};
    prevPSP = (prevPSP && typeof prevPSP === 'object') ? prevPSP : {};
    nowPSP = (nowPSP && typeof nowPSP === 'object') ? nowPSP : {};
    var pid;
    for(pid in prevPSP){ if(prevPSP.hasOwnProperty(pid)) seen[String(pid)] = true; }
    for(pid in nowPSP){ if(nowPSP.hasOwnProperty(pid)) seen[String(pid)] = true; }
    for(pid in seen){
      if(!seen.hasOwnProperty(pid)) continue;
      if(String(prevPSP[pid] || '') !== String(nowPSP[pid] || '')){
        out.push(String(pid));
      }
    }
    return uniqueIds(out);
  }

  function syncMapMetaForPlayer(pid, pageId){
    try{
      if(root.RT && root.RT.fts && typeof root.RT.fts.mapMetaSyncActivePage === 'function'){
        return root.RT.fts.mapMetaSyncActivePage(pid, { pageId: pageId });
      }
    }catch(e){}
    return null;
  }

  function syncCampaignContextForPlayer(pid, opts){
    opts = opts || {};
    var pageId = String(opts.pageId || fts.getEffectivePageId(pid) || '');
    if(!pageId) return { ok:false, error:'No page resolved for sync.' };
    try{ syncMapMetaForPlayer(pid, pageId); }catch(e){}
    try{
      if(root.RT && root.RT.fts && typeof root.RT.fts.weatherSyncActivePage === 'function'){
        root.RT.fts.weatherSyncActivePage(pid || 'API', { silent:true, pageId: pageId });
      }else if(root.RT && root.RT.fts && typeof root.RT.fts.weatherVerifySyncActivePage === 'function'){
        root.RT.fts.weatherVerifySyncActivePage(pid || 'API', { silent:true, pageId: pageId });
      }
    }catch(e2){}
    return { ok:true, pageId:pageId };
  }

  function whisperCampaignMenuBatch(pids, opts){
    pids = uniqueIds(pids);
    opts = opts || {};
    if(!pids.length) return;
    try{ ensureGlobalCampaignLogMacro(); }catch(e){}
    for(var i=0;i<pids.length;i++){
      try{ ensureCampaignLogMacroForPlayer(pids[i]); }catch(e2){}
    }
    if(opts.runStartup){
      try{ runStartupHooks(opts.reason || 'command'); }catch(e3){ log('fts core runStartupHooks ['+(opts.reason||'menu')+'] err: '+e3); }
    }
    try{ syncCampaignContextForPlayer(pids[0], { pageId: opts.pageId }); }catch(e4){ log('fts core context sync err: '+e4); }
    if(opts.refreshMapRecords){
      try{
        if(root.RT && root.RT.fts_mapMeta && typeof root.RT.fts_mapMeta.refreshActiveMapRecords === 'function'){
          root.RT.fts_mapMeta.refreshActiveMapRecords({ pageId: opts.pageId });
        }
      }catch(e5){ log('fts core mapMeta route/point refresh err: '+e5); }
    }
    for(var j=0;j<pids.length;j++){
      whisper(pids[j], campaignLogPanel(pids[j], opts));
    }
  }

  function autoOpenCampaignMenuForPageChange(kind, opts){
    opts = opts || {};
    var campaign = opts.campaign || null;
    if(!campaign){
      try{ campaign = Campaign(); }catch(e){}
    }
    if(!campaign) return;

    var ribbonPageId = String(campaign.get('playerpageid') || '');
    var nowPSP = campaign.get('playerspecificpages') || {};

    if(kind === 'split'){
      var prevPSP = (opts.prev && opts.prev.playerspecificpages) || {};
      var changed = changedPlayerspecificPageIds(prevPSP, nowPSP);
      var grouped = {};
      for(var i=0;i<changed.length;i++){
        var pid = changed[i];
        var pageId = effectivePageIdForPlayer(pid, nowPSP, ribbonPageId);
        if(!pageId) continue;
        grouped[pageId] = grouped[pageId] || [];
        grouped[pageId].push(pid);
      }
      for(var pageKey in grouped){
        if(grouped.hasOwnProperty(pageKey)){
          whisperCampaignMenuBatch(grouped[pageKey], { pageId: pageKey, refreshMapRecords:true });
        }
      }
      return;
    }

    var targets = ribbonPlayerIds(nowPSP).concat(gmPlayerIds());
    whisperCampaignMenuBatch(targets, { pageId: ribbonPageId, refreshMapRecords:true });
  }

  function addHelpSection(order, title, linesFn){
    fts.HELP_SECTIONS.push({ order:(order|0), title:String(title||'Help'), lines:linesFn });
    fts.HELP_SECTIONS.sort(function(a,b){ return a.order - b.order; });
  }
  function registerCommands(map){
    map=map||{}; for (var k in map){ if(map.hasOwnProperty(k)){ fts.COMMANDS[String(k||'').toLowerCase()] = map[k]; } }
  }
  function parseCommandSegment(segment){
    var text = String(segment || '').trim();
    if(!text) return null;
    var m = text.match(/^([A-Za-z0-9]+)\b(.*)$/);
    if(!m) return null;
    return { key:String(m[1] || '').toLowerCase(), val:String(m[2] || '').trim() };
  }
  var PALETTES = {
    none: null,
    dark: {
      bg:'#222', fg:'#eee', border:'#111', tableBorder:'#555', cell:'#2a2a2a',
      today:'#4b8', accent:'#9b6dff', accentText:'#fff', note:'#ffe9a6', subtle:'#ccc', card:'#2f2f2f',
      btnBg:'transparent', btnText:'#9b6dff', btnBorder:'#9b6dff'
    },
    mint: {
      bg:'#f4fff7', fg:'#1f3a28', border:'#9cd1b2', tableBorder:'#b6e2c6', cell:'#ecfbf0',
      today:'#2b6643', todayText:'#eaffef',
      accent:'#278251', accentText:'#eaffef', note:'#5ea87b', subtle:'#406b54', card:'#e3f9e8',
      btnBg:'#278251', btnText:'#eaffef', btnBorder:'#1c5e3c'
    },
    parchment: {
      bg:'#f8f1e1', fg:'#3b2f1a', border:'#5a472d', tableBorder:'#b79b74', cell:'#efe6cf',
      today:'#a36b2a', accent:'#5a3a17', accentText:'#f3e6c9', note:'#7a4a1f', subtle:'#6b5a44', card:'#efe3c7',
      btnBg:'#6f4215', btnText:'#f3e6c9', btnBorder:'#4c3113'
    },
    powder: {
      bg:'#eef6ff', fg:'#1f2a44', border:'#7aa5ff', tableBorder:'#b6ccff', cell:'#f5f9ff',
      today:'#1b355c', todayText:'#eef6ff',
      accent:'#1b355c', accentText:'#eef6ff', note:'#3a567a', subtle:'#3a567a', card:'#f2f7ff',
      btnBg:'#1b355c', btnText:'#eef6ff', btnBorder:'#0b1b34'
    },
    rosebud: {
      bg:'#fff5f6', fg:'#3a1f1f', border:'#e3a3a9', tableBorder:'#e6b7bd', cell:'#ffeef0',
      today:'#b04c5f', todayText:'#fff7f8',
      accent:'#a73f55', accentText:'#fff7f8', note:'#c76270', subtle:'#7f4a4a', card:'#ffe8ea',
      btnBg:'#a73f55', btnText:'#fff7f8', btnBorder:'#7f2e3f'
    }
  };
  var PALETTE_NAMES = ['none','dark','mint','parchment','powder','rosebud'];

  function paletteCommandSyntax(){
    return '!fts --core set palette <'+PALETTE_NAMES.join('|')+'> [sc]';
  }

  function paletteSelectionQueryCommand(){
    return '!fts --core set palette ?{Palette|'+PALETTE_NAMES.join('|')+'} ?{Apply matching ScriptCard theme?|Yes,sc|No,}';
  }

  function scriptCardsAvailability(){
    try{
      if(root.API_Meta && (root.API_Meta.ScriptCards || root.API_Meta.Scriptcards)){
        return { available:true, status:'available', reason:'API_Meta marker detected.' };
      }
    }catch(e){}
    try{
      if(root.ScriptCards || root.Scriptcards){
        return { available:true, status:'available', reason:'Root ScriptCards object detected.' };
      }
    }catch(e2){}
    try{
      if(root.state && (root.state.ScriptCards || root.state.Scriptcards)){
        return { available:true, status:'available', reason:'ScriptCards state detected.' };
      }
    }catch(e3){}
    try{
      if((findObjs({_type:'character', name:'ScriptCards_Storage'}) || [])[0]){
        return { available:true, status:'available', reason:'ScriptCards_Storage character detected.' };
      }
    }catch(e4){}
    try{
      if((findObjs({_type:'character', name:'ScriptCards_Triggers'}) || [])[0]){
        return { available:true, status:'available', reason:'ScriptCards_Triggers character detected.' };
      }
    }catch(e5){}
    return { available:false, status:'unverified', reason:'No ScriptCards runtime markers detected.' };
  }

  function paletteThemeData(name){
    name = String(name || '').trim().toLowerCase();
    var pal = PALETTES[name];
    if(pal){
      return {
        key: name,
        bg: pal.bg,
        fg: pal.fg,
        border: pal.border,
        tableBorder: pal.tableBorder,
        cell: pal.cell,
        card: pal.card,
        accent: pal.accent,
        accentText: pal.accentText || pal.bg,
        btnBg: pal.btnBg || 'transparent',
        btnText: pal.btnText || pal.accent,
        btnBorder: pal.btnBorder || pal.accent,
        today: pal.today || '',
        todayText: pal.todayText || pal.fg,
        note: pal.note || '',
        subtle: pal.subtle || pal.fg
      };
    }
    return {
      key: 'none',
      bg: '#ffffff',
      fg: '#111111',
      border: '#d0d0d0',
      tableBorder: '#d0d0d0',
      cell: '#ffffff',
      card: '#f7f7f7',
      accent: '#f1f1f1',
      accentText: '#111111',
      btnBg: '#ffffff',
      btnText: '#ba2e68',
      btnBorder: '#d0d0d0',
      today: '',
      todayText: '',
      note: '',
      subtle: ''
    };
  }

  function scriptCardThemeSettings(name){
    var pal = paletteThemeData(name);
    return {
      titleFontFace: 'Georgia',
      titleFontSize: '17px',
      subtitleFontFace: 'Georgia',
      subtitleFontSize: '13px',
      bodyFontFace: 'Georgia',
      bodyFontSize: '14px',
      buttonFontFace: 'Georgia',
      buttonFontSize: '13px',
      titleCardBackground: pal.accent,
      titleFontColor: pal.accentText,
      subtitleFontColor: pal.accentText,
      tableBGcolor: pal.bg,
      tableBorder: '3px solid '+pal.border+';',
      titleCardBottomBorder: '1px solid '+pal.tableBorder+';',
      tableBorderRadius: '0px;',
      tableShadow: '0px 0px 0px 0px transparent;',
      oddRowBackground: pal.cell,
      oddRowFontColor: pal.fg,
      evenRowBackground: pal.card,
      evenRowFontColor: pal.fg,
      buttonBackground: pal.btnBg,
      buttonTextColor: pal.btnText,
      buttonBorderColor: pal.btnBorder,
      usersetting0: pal.key,
      usersetting1: pal.today || '',
      usersetting2: pal.todayText || '',
      usersetting3: pal.note || '',
      usersetting4: pal.subtle || '',
      usersetting5: pal.bg,
      usersetting6: pal.fg,
      usersetting7: pal.border,
      usersetting8: pal.tableBorder,
      usersetting9: pal.card
    };
  }

  function buildScriptCardThemeMacro(name){
    var pal = paletteThemeData(name);
    var settings = scriptCardThemeSettings(pal.key);
    var lines = [
      '!scriptcard {{',
      '  --/|FTS ScriptCards theme: '+pal.key
    ];
    Object.keys(settings).forEach(function(k){
      lines.push('  --#'+k+'|'+String(settings[k] || ''));
    });
    lines.push('  --Ssettings|'+pal.key);
    lines.push('  --Ssettings|'+SCRIPTCARDS_THEME_LABEL_PREFIX+pal.key);
    lines.push('  --Ssettings|'+SCRIPTCARDS_THEME_LABEL_ACTIVE);
    lines.push('  --#hideCard|1');
    lines.push('  --X|');
    lines.push('}}');
    return lines.join('\n');
  }

  function syncScriptCardThemesToMule(character, opts){
    if(!character) return { available:false, status:'unverified', reason:'No mule character.' };
    opts = opts || {};
    var palette = String(opts.palette || currentPalette() || 'none').trim().toLowerCase();
    var activeTheme = String(opts.scriptcardTheme || '').trim().toLowerCase();
    var availability = opts.availability || scriptCardsAvailability();
    var themes = {};

    for(var i=0;i<PALETTE_NAMES.length;i++){
      var key = PALETTE_NAMES[i];
      themes[key] = {
        labels: [key, SCRIPTCARDS_THEME_LABEL_PREFIX+key],
        macro: buildScriptCardThemeMacro(key)
      };
    }

    upsertAbility(character, 'scriptcards', JSON.stringify({
      version: VERSION,
      palette: palette,
      activeTheme: activeTheme,
      availability: availability.status,
      reason: availability.reason,
      activeLabel: SCRIPTCARDS_THEME_LABEL_ACTIVE,
      themes: themes
    }, null, 2));

    setAttrDirect(character, 'scriptcard_theme', activeTheme);
    setAttrDirect(character, 'scriptcards_status', availability.status);
    return availability;
  }

  function applyScriptCardThemeForPalette(name){
    var pal = paletteThemeData(name);
    var availability = scriptCardsAvailability();
    var themeMacro = buildScriptCardThemeMacro(pal.key);

    try{
      sendChat('fts', themeMacro);
      if(!availability.available){
        return {
          applied:false,
          availability:availability,
          note:'Palette updated and a best-effort ScriptCards theme apply was sent, but ScriptCards availability could not be confirmed. Matching theme entries were refreshed inside fts_mule -> scriptcards.'
        };
      }
      return { applied:true, availability:availability };
    }catch(e){
      log('fts core ScriptCards apply err: '+e);
      return {
        applied:false,
        availability:availability,
        note:'Palette updated, but applying the matching ScriptCards theme failed gracefully: '+e
      };
    }
  }

  function parsePaletteSelection(value, requireSetKeyword){
    var raw = String(value || '').trim();
    if(requireSetKeyword){
      var m = raw.match(/^set\s+palette(?:\s+(.+))?$/i);
      if(!m){
        return { error:'Unknown core command. Use: '+paletteCommandSyntax() };
      }
      raw = String(m[1] || '').trim();
    }

    if(!raw){
      return { error:'Missing palette value. Use: '+paletteCommandSyntax() };
    }

    var parts = raw.split(/\s+/);
    var palette = String(parts.shift() || '').trim().toLowerCase();
    var applyScriptCards = false;

    if(parts.length){
      if(parts.length === 1 && /^sc$/i.test(parts[0])){
        applyScriptCards = true;
      }else{
        return { error:'Unknown palette switch. Use: '+paletteCommandSyntax() };
      }
    }

    return { palette:palette, applyScriptCards:applyScriptCards };
  }

  function currentPalette(){ var S=ensureCoreState(); return (S.ui && S.ui.palette) || 'none'; }

  function cssVars(){
    var pal = PALETTES[currentPalette()];
    if(!pal){
      return {
        container:'', title:'', card:'',
        link:'display:inline;background:transparent;border:none;box-shadow:none;border-radius:0;padding:0;margin:0;color:#ba2e68;text-decoration:none;font:inherit;line-height:inherit;',
        btn:'',
        table:'', th:'', td:function(){ return ''; }, dayLine:'', dot:'',
        helpColsTable:'width:100%;border-collapse:separate;border-spacing:10px 0;',
        helpCol:'width:50%;vertical-align:top;',
        helpSingleCol:'width:100%;max-width:720px;margin:0 auto;',
        helpSectionCard:'margin-top:10px;border:1px solid #d0d0d0;background:#ffffff;color:#111;padding:0;overflow:hidden;',
        helpHeaderBar:'padding:6px 10px;font-weight:bold;font-size:14px;background:#f1f1f1;color:#111;',
        helpBody:'padding:10px 12px;color:#111;font-size:13px;line-height:1.35;',
        helpRowsTable:'width:100%;border-collapse:collapse;table-layout:fixed;',
        helpRowSep:'border-top:1px solid #d0d0d0;',
        helpKey:'padding:6px 10px;vertical-align:top;width:55%;',
        helpVal:'padding:6px 10px;vertical-align:top;width:45%;',
        helpCode:'display:block;padding:6px 8px;border-radius:4px;border:1px solid #d0d0d0;background:#f7f7f7;color:#111;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;font-size:12px;white-space:pre-wrap;',
        helpNote:'margin-top:6px;color:#111;opacity:0.92;font-size:12px;',
        esc:esc, hrefAttr:hrefAttr, literal:literal
      };
    }
    var container = 'display:block;width:80%;margin:0 auto;'
                  + 'border:3px solid '+pal.border+';'
                  + 'padding:10px 12px;'
                  + 'background:'+pal.bg+';'
                  + 'color:'+pal.fg+';font:14px/1.32 Georgia,serif;';
    var title     = 'font-weight:bold;font-size:17px;margin-bottom:6px;color:'+pal.fg+';';
    var card      = 'margin-top:8px;border:1px solid '+pal.tableBorder+';background:'+pal.card+';color:'+pal.fg+';padding:12px;';
    var link      = 'text-decoration:none; color:'+pal.accent+';';

    var btnBorder = (pal.btnBorder || pal.accent);
    var btnBg     = (pal.btnBg     || 'transparent');
    var btnText   = (pal.btnText   || pal.accent);
    var btn       = 'display:inline-block;padding:5px 10px;border:1px solid '+btnBorder+';'
                  + 'background:'+btnBg+';color:'+btnText+';border-radius:4px;text-decoration:none;';

    var table     = 'width:100%;border:1px solid '+pal.tableBorder+';border-collapse:collapse;table-layout:fixed;font-size:14px;color:'+pal.fg+';';
    var th        = 'border:1px solid '+pal.tableBorder+';padding:0;text-align:center;height:8px;';
    var td        = function(isToday){
                      var bg = isToday ? pal.today : pal.cell;
                      var textColor = (isToday && pal.todayText) ? pal.todayText : pal.fg;
                      return 'border:1px solid '+pal.tableBorder+';text-align:center;padding:12px 16px;vertical-align:top;'
                           + 'background:'+bg+';color:'+textColor+';min-width:52px;';
                    };
    var dayLine   = 'display:block;white-space:nowrap;font-weight:600;';
    var dot       = 'display:block;margin-top:4px;font-size:12px;line-height:1;text-align:center;';

    return {
      container: container,
      title: title,
      card: card,
      link: link,
      btn: btn,
      table: table,
      th: th,
      td: td,
      dayLine: dayLine,
      dot: dot,

      // Help/Handout styles (palette-aware, used by the FTS Help handout)
      helpColsTable: 'width:100%;border-collapse:separate;border-spacing:10px 0;',
      helpCol: 'width:50%;vertical-align:top;',
      helpSingleCol: 'width:100%;max-width:720px;margin:0 auto;',
      helpSectionCard: 'margin-top:10px;border:1px solid '+pal.tableBorder+';background:'+pal.card+';color:'+pal.fg+';padding:0;overflow:hidden;',
      helpHeaderBar: 'padding:6px 10px;font-weight:bold;font-size:14px;background:'+pal.accent+';color:'+(pal.accentText || pal.bg)+';',
      helpBody: 'padding:10px 12px;color:'+pal.fg+';font-size:13px;line-height:1.35;',
      helpRowsTable: 'width:100%;border-collapse:collapse;table-layout:fixed;',
      helpRowSep: 'border-top:1px solid '+pal.tableBorder+';',
      helpKey: 'padding:6px 10px;vertical-align:top;width:55%;',
      helpVal: 'padding:6px 10px;vertical-align:top;width:45%;',
      helpCode: 'display:block;padding:6px 8px;border-radius:4px;border:1px solid '+(currentPalette()==='dark' ? '#555' : '#d0d0d0')+';'
              + 'background:'+(currentPalette()==='dark' ? '#2b2b2b' : '#f1f1f1')+';'
              + 'color:'+pal.fg+';font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;font-size:12px;white-space:pre-wrap;',
      helpNote: 'margin-top:6px;color:'+pal.fg+';opacity:0.92;font-size:12px;',

      esc: esc, hrefAttr:hrefAttr, literal:literal
    };
  }

  function shell(title){ var v=cssVars(); return '<div style="'+v.container+'"><div style="'+v.title+'">'+esc(title)+'</div>'; }
  function endShell(){ return '</div>'; }
  // Campaign Menu action controls share one stacked layout so every card aligns its buttons the same way.
  function actionLinkAttrs(target){
    var v = cssVars();
    var href = (v.hrefAttr ? v.hrefAttr(target) : target);
    var btnStyle = v.btn || '';
    var linkStyle = v.link || '';
    var layoutStyle = 'display:block;text-align:center;';
    var attrs = ' href="'+href+'"';
    if(btnStyle){
      attrs += ' role="button" style="'+btnStyle+layoutStyle+'"';
    }else if(linkStyle){
      attrs += ' style="'+linkStyle+layoutStyle+'"';
    }else{
      attrs += ' style="'+layoutStyle+'"';
    }
    return attrs;
  }

  function addLogCard(order, renderFn){
    fts.LOG_CARDS.push({ order:(order|0), render:renderFn });
    fts.LOG_CARDS.sort(function(a,b){ return a.order - b.order; });
  }

  function helpPanel(pid, opts){
    opts = opts || {};
    var v = cssVars();
    var html = (opts.includeTitle === false)
      ? '<div style="' + (v.container || '') + '">'
      : shell(HELP_HANDOUT_NAME);

    // Global note (ubiquitous by design; do not repeat inside each module section).
    html += '<div style="margin:6px 0 10px 0;'+(currentPalette()==='dark' ? 'opacity:0.92;' : 'opacity:0.95;')+'font-size:12.5px;">'
         +  esc('Value inputs are fault-tolerant and normalize where stored as keys; command and switch tokens use the documented one-token forms.')
         +  '</div>';

    function helpKey(s){
      return String(s||'').toLowerCase().replace(/[^a-z]/g,'');
    }

    // Auto-generate from registered help sections.
    var sections = [];
    for (var i=0;i<fts.HELP_SECTIONS.length;i++){
      var h = fts.HELP_SECTIONS[i];
      try{
        var lines = (typeof h.lines==='function') ? h.lines(pid) : (h.lines||[]);
        sections.push({ title:String(h.title||''), lines:(lines||[]) });
      }catch(e){
        log('fts help err: '+e);
      }
    }

    // Ordering (always): Core, Calendar, Weather, Map Information, Map Records and Routes, then everything else.
    var ORDER = {
      'core': 10,
      'calendar': 20,
      'weather': 30,
      'mapinformation': 40,
      'mapmeta': 40,
      'maprecordsandroutes': 50,
      'maprecords': 50,
      'routes': 50
    };
    sections.sort(function(a,b){
      var ka = helpKey(a.title);
      var kb = helpKey(b.title);
      var ra = (ORDER[ka]!=null) ? ORDER[ka] : 999;
      var rb = (ORDER[kb]!=null) ? ORDER[kb] : 999;
      if(ra!==rb) return ra-rb;
      return ka<kb ? -1 : (ka>kb ? 1 : 0);
    });

    function extractCommandsFromLine(line){
      var s = String(line||'');
      var m = s.match(/!fts\b[^\n]*/i);
      if(!m) return null;
      var idx = s.toLowerCase().indexOf('!fts');
      var before = s.slice(0, idx).trim();
      var cmdPart = s.slice(idx).trim();
      return { before: before, cmds: [cmdPart], after: '' };
    }

    function looksLikeCmd(line){
      var s = String(line||'').trim();
      return /^!fts\b/i.test(s);
    }

    function renderTextBlock(txt){
      if(!txt) return '';
      return '<p style="margin:0 0 8px 0;">'+esc(txt)+'</p>';
    }

    function renderCodeBlock(codeLine){
      if(!codeLine) return '';
      return '<div style="'+v.helpCode+'margin:0;">'+literal(codeLine)+'</div><div style="height:8px;"></div>';
    }

    function renderSpacer(){
      return '<div style="height:8px;"></div>';
    }

    function renderHeading(label){
      return '<div style="margin:10px 0 6px 0;font-weight:bold;">'+esc(label)+'</div>';
    }

    function dropRedundantTitleLine(secTitle, lines){
      if(!lines || !lines.length) return lines||[];
      var a = helpKey(secTitle||'');
      var b = helpKey(lines[0]||'');
      if(a && b && a===b) return lines.slice(1);
      return lines;
    }


    function coreFormatter(sec){
      var raw = dropRedundantTitleLine(sec.title, sec.lines||[]);

      var helpCmd = '!fts --help';
      var palCmd  = paletteCommandSyntax();
      var palSyncCmd = '!fts --core set palette mint sc';

      // Prefer actual registered commands if present.
      for(var i=0;i<raw.length;i++){
        var line = String(raw[i]||'').trim();
        if(!line) continue;
        var ex = extractCommandsFromLine(line);
        if(ex){
          line = (ex.cmds && ex.cmds[0]) ? ex.cmds[0] : line;
        }
        if(/^!fts\s+--help\b/i.test(line)) helpCmd = line.replace(/\s+/g,' ').trim();
        if(/^!fts\s+--core\s+set\s+palette\b/i.test(line)) palCmd = line.replace(/\s+/g,' ').trim();
        if(/^!fts\s+--core\s+set\s+palette\s+\S+\s+sc\b/i.test(line)) palSyncCmd = line.replace(/\s+/g,' ').trim();
      }

      var out = '';
      out += '<div style="'+v.helpSectionCard+'">';
      out +=   '<div style="'+v.helpHeaderBar+'">'+esc(sec.title||'Core')+'</div>';
      out +=   '<div style="'+v.helpBody+'">';

      out += renderHeading('Show Help');
      out += renderCodeBlock(helpCmd);

      out += renderHeading('Palette switch');
      out += renderCodeBlock(palCmd);
      out += renderTextBlock('Add sc at the end to also apply the matching ScriptCards theme if ScriptCards is available.');
      out += renderCodeBlock(palSyncCmd);

      out +=   '</div>';
      out += '</div>';
      return out;
    }

    function calendarFormatter(sec){
      var raw = dropRedundantTitleLine(sec.title, sec.lines||[]);

      var navCmd = null;
      var backExample = null;
      var setCmd = null;

      for(var i=0;i<raw.length;i++){
        var line = String(raw[i]||'').trim();
        if(!line) continue;

        var ex = extractCommandsFromLine(line);
        if(ex){
          line = (ex.cmds && ex.cmds[0]) ? ex.cmds[0] : line;
        }

        if(/--calendar\s+today\s*\|/i.test(line) && !navCmd){
          navCmd = line.replace(/\s+/g,' ').trim();
          continue;
        }

        if(/^!fts\s+--calendar\s+back\s+\d+\s*m\b/i.test(line) && !backExample){
          backExample = line.replace(/\s+/g,' ').trim();
          continue;
        }

        if(/^!fts\s+--calendar\s+set\b/i.test(line) && !setCmd){
          setCmd = line.replace(/\s+/g,' ').trim();
          continue;
        }
      }

      if(!navCmd) navCmd = '!fts --calendar today | back | forward <value>';
      if(!backExample) backExample = '!fts --calendar back 4m';
      if(!setCmd) setCmd = '!fts --calendar set hour|timeOfDay|day|monthOrFestival|season|year <value>';

      var out = '';
      out += '<div style="'+v.helpSectionCard+'">';
      out +=   '<div style="'+v.helpHeaderBar+'">'+esc(sec.title||'Calendar')+'</div>';
      out +=   '<div style="'+v.helpBody+'">';

      out += renderHeading('Calendar Navigation');
      out += renderCodeBlock(navCmd);
      out += renderTextBlock('Value is expressed as #d | m | y. For instance, to move the calendar view back four months:');
      out += renderCodeBlock(backExample);

      out += renderHeading('GM-Only Commands');
      out += renderCodeBlock(setCmd);
      out += renderTextBlock('Months can be specified either by name (short or long) or number:');
      out += renderCodeBlock('!fts --calendar set month 1 | hammer | Deep Winter');

      out +=   '</div>';
      out += '</div>';
      return out;
    }

    function weatherFormatter(sec){
      var raw = dropRedundantTitleLine(sec.title, sec.lines||[]);
      var bulletOpen = false;
      function closeBullets(){
        if(!bulletOpen) return '';
        bulletOpen = false;
        return '</ul>';
      }

      var out = '';
      out += '<div style="'+v.helpSectionCard+'">';
      out +=   '<div style="'+v.helpHeaderBar+'">'+esc(sec.title||'Weather')+'</div>';
      out +=   '<div style="'+v.helpBody+'">';

      for(var i=0;i<raw.length;i++){
        var line = String(raw[i]||'').trim();
        if(!line){
          out += closeBullets();
          out += renderSpacer();
          continue;
        }

        if(/^commands$/i.test(line) || /^gm-only commands$/i.test(line)){
          out += closeBullets();
          out += renderHeading(line);
          continue;
        }

        if(looksLikeCmd(line)){
          out += closeBullets();
          out += renderCodeBlock(line);
          continue;
        }

        if(/^- /.test(line)){
          if(!bulletOpen){
            out += '<ul style="margin:0 0 8px 18px;padding:0;">';
            bulletOpen = true;
          }
          out += '<li style="margin:0 0 4px 0;">'+esc(line.replace(/^- /, ''))+'</li>';
          continue;
        }

        var ex = extractCommandsFromLine(line);
        if(ex){
          out += closeBullets();
          if(ex.before) out += renderTextBlock(ex.before);
          if(ex.cmds && ex.cmds[0]) out += renderCodeBlock(ex.cmds[0].trim());
          continue;
        }

        out += closeBullets();
        out += renderTextBlock(line);
      }

      out += closeBullets();
      out +=   '</div>';
      out += '</div>';
      return out;
    }

    function hasExplicitHelpHeadings(lines){
      for(var i=0;i<(lines||[]).length;i++){
        var line = String(lines[i]||'').trim();
        if(/^commands$/i.test(line) || /^gm-only commands$/i.test(line)) return true;
      }
      return false;
    }

    function defaultFormatter(sec){
      var raw = dropRedundantTitleLine(sec.title, sec.lines||[]);

      if(hasExplicitHelpHeadings(raw)){
        var ordered = '';
        ordered += '<div style="'+v.helpSectionCard+'">';
        ordered +=   '<div style="'+v.helpHeaderBar+'">'+esc(sec.title||'')+'</div>';
        ordered +=   '<div style="'+v.helpBody+'">';

        for(var r=0;r<raw.length;r++){
          var line0 = String(raw[r]||'').trim();
          if(!line0){
            ordered += renderSpacer();
            continue;
          }

          if(/^commands$/i.test(line0) || /^gm-only commands$/i.test(line0)){
            ordered += renderHeading(line0);
            continue;
          }

          if(looksLikeCmd(line0)){
            ordered += renderCodeBlock(line0);
            continue;
          }

          var ex0 = extractCommandsFromLine(line0);
          if(ex0){
            if(ex0.before) ordered += renderTextBlock(ex0.before);
            if(ex0.cmds && ex0.cmds[0]) ordered += renderCodeBlock(ex0.cmds[0].trim());
            continue;
          }

          ordered += renderTextBlock(line0);
        }

        ordered +=   '</div>';
        ordered += '</div>';
        return ordered;
      }

      var desc = [];
      var cmds = [];
      var gmCmds = [];

      for(var i=0;i<raw.length;i++){
        var line = String(raw[i]||'');
        if(!line.trim()){
          desc.push('');
          continue;
        }

        if(looksLikeCmd(line)){
          if(/\bset\b/i.test(line) || /gm\s*-?\s*only/i.test(line)) gmCmds.push(line.trim());
          else cmds.push(line.trim());
          continue;
        }

        var ex = extractCommandsFromLine(line);
        if(ex){
          if(ex.before) desc.push(ex.before);
          var c = (ex.cmds && ex.cmds[0]) ? ex.cmds[0].trim() : '';
          if(c){
            if(/\bset\b/i.test(c) || /gm\s*-?\s*only/i.test(line)) gmCmds.push(c);
            else cmds.push(c);
          }
          continue;
        }

        desc.push(line.trim());
      }

      var out = '';
      out += '<div style="'+v.helpSectionCard+'">';
      out +=   '<div style="'+v.helpHeaderBar+'">'+esc(sec.title||'')+'</div>';
      out +=   '<div style="'+v.helpBody+'">';

      var para = [];
      for(var i=0;i<desc.length;i++){
        var t = desc[i];
        if(!t){
          if(para.length){
            out += renderTextBlock(para.join(' '));
            para = [];
          }
          continue;
        }
        para.push(t);
      }
      if(para.length) out += renderTextBlock(para.join(' '));

      if(cmds.length){
        out += renderHeading('Commands');
        for(var j=0;j<cmds.length;j++) out += renderCodeBlock(cmds[j]);
      }
      if(gmCmds.length){
        out += renderHeading('GM-Only Commands');
        for(var k=0;k<gmCmds.length;k++) out += renderCodeBlock(gmCmds[k]);
      }

      out +=   '</div>';
      out += '</div>';
      return out;
    }

    function renderSection(sec){
      var k = helpKey(sec.title);
      if(k === 'core') return coreFormatter(sec);
      if(k === 'calendar') return calendarFormatter(sec);
      if(k === 'weather') return weatherFormatter(sec);
      return defaultFormatter(sec);
    }

    html += '<div style="'+v.helpSingleCol+'">'+(sections.map(renderSection).join(''))+'</div>';
    html += endShell();
    return html;
  }


  function helpHandout(){
    return findObjs({_type:'handout', name:HELP_HANDOUT_NAME})[0] || null;
  }

  function upsertHelpHandout(html){
    var h = helpHandout();

    if(!h){
      h = createObj('handout', {
        name: HELP_HANDOUT_NAME,
        inplayerjournals: 'all',
        controlledby: ''
      });
    } else {
      try{
        h.set({ name:HELP_HANDOUT_NAME, inplayerjournals:'all', controlledby:'' });
      }catch(e){}
    }

    if(html != null){
      try{ h.set('notes', html); }catch(e){}
    }

    return h;
  }

  function refreshHelpHandout(pid){
    try{
      return upsertHelpHandout(helpPanel(pid||null, { includeTitle:false }));
    }catch(e){
      log('refreshHelpHandout err: '+e);
      return null;
    }
  }

  function muleScore(character){
    if(!character) return -1;
    var abilities = findObjs({_type:'ability', _characterid:character.id}) || [];
    var score = 0;
    for(var i=0;i<abilities.length;i++){
      var ability = abilities[i];
      var name = '';
      try{ name = normalizeAbilityName(ability.get('name') || ''); }catch(e){}
      var weighted = abilitySortScore(name, ability);
      score += weighted;
      if(name === 'regions' || name === 'weather' || name === 'mapmeta') score += weighted;
      else if(name === 'version' || name === 'core') score += Math.max(0, weighted);
    }
    return score + abilities.length;
  }

  function ensureMule(){
    var matches = findObjs({_type:'character', name:CORE_MULE}) || [];
    var ch = null;
    var bestScore = -1;
    for(var i=0;i<matches.length;i++){
      var score = muleScore(matches[i]);
      if(score > bestScore){
        bestScore = score;
        ch = matches[i];
      }
    }

    if(!ch){
      ch = createObj('character', {
        name: CORE_MULE,
        inplayerjournals: '',
        controlledby: '',
        archived: false
      });
    } else {
      ch.set({
        inplayerjournals: '',
        controlledby: ''
      });
    }

    return ch;
  }

  function setAttrDirect(ch, name, value){
    var attrs = findObjs({_type:'attribute', _characterid:ch.id, name:name}) || [];
    if(attrs.length){
      for(var i=0;i<attrs.length;i++){
        try{ attrs[i].set('current', String(value)); }catch(e){}
      }
    }else{
      createObj('attribute', { _characterid:ch.id, name:name, current:String(value) });
    }
  }
  function mirrorCoreToMule(){
    var S = ensureCoreState();
    var palette = (S.ui&&S.ui.palette)||'none';
    var scriptcardTheme = (S.ui && typeof S.ui.scriptcardTheme === 'string') ? S.ui.scriptcardTheme : '';
    var ch = ensureMule();
    var availability = syncScriptCardThemesToMule(ch, {
      palette: palette,
      scriptcardTheme: scriptcardTheme
    });
    upsertAbility(ch, 'core', JSON.stringify({
      version: VERSION,
      palette: palette,
      scriptcardTheme: scriptcardTheme,
      scriptcardsStatus: availability.status
    }));
    mergeVersionEntry(ch, 'core', VERSION);

    // Attributes mirror for non-Meta-Toolbox consumers.
    setAttrDirect(ch, 'palette', palette);
    setAttrDirect(ch, 'scriptcard_theme', scriptcardTheme);
    setAttrDirect(ch, 'scriptcards_status', availability.status);
    setAttrDirect(ch, 'version', VERSION);
    return ch;
  }

  function coreConfigCard(pid){
    var v = cssVars();
    var html = '<div style="'+(v.card||'')+'">';
    var isGM = false;

    try{
      if (typeof playerIsGM === 'function') {
        isGM = playerIsGM(pid);
      }
    }catch(e){
      isGM = false;
    }

    // Ensure a help handout exists and is up-to-date.
    var helpHtml = helpPanel(pid, { includeTitle:false });
    var h = null;
    try{
      if (helpHtml){
        h = upsertHelpHandout(helpHtml);
      }
    }catch(e){}

    html += '<div>';

    // GM-only Set Palette control (styled like mapMeta config button). Opens sequential Roll Query dropdowns.
    if (isGM){
      var paletteCmd = paletteSelectionQueryCommand();
      html += '<div><a'+actionLinkAttrs(paletteCmd)+'>Set Palette</a></div>';
    }

    // Show Help button - opens the help handout window
    if (h && h.id){
      var url = 'https://journal.roll20.net/handout/'+h.id;
      html += '<div style="'+(isGM ? 'margin-top:8px;' : '')+'"><a'+actionLinkAttrs(url)+' target="_blank">Show Help</a></div>';
    }

    html += '</div>';
    html += '</div>';
    return html;
  }

  function campaignLogPanel(pid, opts){
    var v = cssVars(), html = shell('Campaign Menu');
    for (var i=0;i<fts.LOG_CARDS.length;i++){
      try{ html += (fts.LOG_CARDS[i].render(pid, opts)||''); }catch(e){ log('fts card err: '+e); }
    }
    html += coreConfigCard(pid);
    html += endShell();
    return html;
  }

  function applyPaletteChange(value, opts){
    var S = ensureCoreState();
    opts = opts || {};
    var p = String(value||'').trim().toLowerCase();
    var legal = {};
    for(var i=0;i<PALETTE_NAMES.length;i++){ legal[PALETTE_NAMES[i]] = 1; }
    if (legal[p]){
      var changed = (String((S.ui && S.ui.palette) || 'none').toLowerCase() !== p);
      S.ui.palette = p;
      var pid = String(opts.pid || '');

      var applySC = !!opts.applyScriptCards;
      if(applySC){
        var scResult = applyScriptCardThemeForPalette(p);
        if(scResult.applied){
          if(String((S.ui && S.ui.scriptcardTheme) || '').toLowerCase() !== p){ changed = true; }
          S.ui.scriptcardTheme = p;
        }
        mirrorCoreToMule();
        if(changed){
          try{
            if(root.RT && root.RT.fts_mapPointWizard && typeof root.RT.fts_mapPointWizard.refresh === 'function'){
              root.RT.fts_mapPointWizard.refresh(pid);
            }
          }catch(e3){
            log('fts core palette notify mapPointWizard err: '+e3);
          }
        }
        return {
          changed: true,
          note: scResult.note || ''
        };
      }

      mirrorCoreToMule();
      if(changed){
        try{
          if(root.RT && root.RT.fts_mapPointWizard && typeof root.RT.fts_mapPointWizard.refresh === 'function'){
            root.RT.fts_mapPointWizard.refresh(pid);
          }
        }catch(e4){
          log('fts core palette notify mapPointWizard err: '+e4);
        }
      }
      return {changed:changed};
    }
    return {error:'Unknown palette: '+p};
  }

  registerCommands({
    'core': { access:'player', handler:function(a){
      var parsed = parsePaletteSelection(a.val, true);
      if(parsed.error){ return {error:parsed.error}; }
      return applyPaletteChange(parsed.palette, { applyScriptCards: parsed.applyScriptCards, pid: a.pid });
    }},
    'palette': { access:'player', handler:function(a){
      var parsed = parsePaletteSelection(a.val, false);
      if(parsed.error){ return {error:parsed.error}; }
      return applyPaletteChange(parsed.palette, { applyScriptCards: parsed.applyScriptCards, pid: a.pid });
    }},
    // Pass-through for --calendar: do NOT echo the unified panel.
    'calendar': { access:'player', handler:function(a){
      try{
        var expr = String(a.val||'').trim();

        // Calendar commands are routed to the calendar module namespace handler.
        // NOTE!!! Regarding the Show Calendar link displayed in the unified menu:
        // Roll20 constrains us here: Handouts can store HTML, but no JS.
        // Interactivity is designed to come from clickable links that fire chat messages.
        // We work around standard href restrictions with (very sensitive) hrefAttr / Meta-Toolbox plumbing.
        //
        // The calendar's nav buttons are basically:
        //   <a href="!fts --calendar back 1m">back</a>
        //   <a href="!fts --calendar today"><b>today</b></a>
        //   <a href="!fts --calendar forward 1m">forward</a>
        //
        // Supported surface:
        //   today | back <#d/m/y> | forward <#d/m/y>
        //   set <hour|timeOfDay|day|month|festival|monthOrFestival|season|year> <value...>
        //
        // The calendar module enforces GM-only restrictions for set operations.

        if (root.RT && root.RT.fts_calendar && typeof root.RT.fts_calendar._ns === 'function'){
          root.RT.fts_calendar._ns(expr, a.pid);
          return { changed:false };
        }
        return { error:'Calendar module missing.', changed:false };
      }catch(e){
        log('fts core calendar handler err: '+e);
        return { error:'Calendar error.', changed:false };
      }
    }}
    });

  function handleMessage(msg){
    if (msg.type!=='api') return;
    var content = (msg.content||'').trim();
    if (!/^!fts(\b|$)/i.test(content)) return;

    var pid = msg.playerid;

    var parts = content.split(/\s+--/), flags = {};
    for (var i=1;i<parts.length;i++){
      var parsed = parseCommandSegment(parts[i]);
      if (!parsed || !parsed.key) continue;
      flags[parsed.key] = parsed.val;
    }

    var anyFlags = Object.keys(flags).length>0;
    var filtered={}, keys=[];
    for (var k in flags){
      if (!flags.hasOwnProperty(k)) continue;
      if (k==='help'){ whisper(pid, helpPanel(pid)); return; }
      if (fts.COMMANDS.hasOwnProperty(k)){ filtered[k]=flags[k]; keys.push(k); }
    }

    if (anyFlags && keys.length===0){
      return;
    }

    if (!anyFlags){
      whisperCampaignMenuBatch([pid], {
        pageId: fts.getEffectivePageId(pid) || (function(){ try{ return String(Campaign().get('playerpageid') || ''); }catch(e){ return ''; } })(),
        runStartup: true,
        refreshMapRecords: true,
        reason: 'command',
        msg: msg
      });
      return;
    }

    for (var i2=0;i2<keys.length;i2++){
      var cmd = fts.COMMANDS[keys[i2]];
      try{
        if(!cmd || typeof cmd.handler !== 'function'){
          continue;
        }
        if(cmd && String(cmd.access || '').toLowerCase() === 'gm' && !playerIsGM(pid)){
          whisper(pid, '<div>'+esc('Only the GM may use this command.')+'</div>');
          continue;
        }
        var res = cmd.handler({ pid:pid, key:keys[i2], val:filtered[keys[i2]] });
        if (res && res.error){ whisper(pid, '<div>'+esc(res.error)+'</div>'); }
        if (res && res.note){ whisper(pid, '<div>'+esc(res.note)+'</div>'); }
        if (res && res.changed){ whisper(pid, campaignLogPanel(pid)); }
      }catch(e){ whisper(pid, '<div>Error: '+esc(e)+'</div>'); }
    }
  }

  function ensureCampaignLogMacroForPlayer(pid){
    try{
      var m=(findObjs({_type:'macro',name:'Campaign.Log',playerid:pid})||[])[0]||null;
      if(!m){
        createObj('macro',{name:'Campaign.Log',action:'!fts',playerid:pid,inbar:true,istokenaction:false});
      }else{
        m.set('action','!fts');m.set('inbar',true);m.set('istokenaction',false);
      }
    }catch(e){log('ensureCampaignLogMacroForPlayer err: '+e);}
  }

  function ensureGlobalCampaignLogMacro(){
    try{
      // Use a real playerid (prefer a GM); empty playerid is invalid in newer sandboxes.
      var gmId = null, ps = findObjs({_type:'player'})||[];
      try{
        for(var i=0;i<ps.length;i++){
          if(playerIsGM(ps[i].id)){ gmId = ps[i].id; break; }
        }
      }catch(e){}
      if(!gmId && ps.length){ gmId = ps[0].id; }
      if(!gmId){ return; }

      var m=(findObjs({_type:'macro',name:'Campaign.Log',playerid:gmId})||[])[0]||null;
      if(!m){
        createObj('macro',{name:'Campaign.Log',action:'!fts',playerid:gmId,visibleto:'all',inbar:true,istokenaction:false});
      }else{
        m.set('action','!fts');m.set('visibleto','all');m.set('inbar',true);m.set('istokenaction',false);
      }
    }catch(e){log('ensureGlobalCampaignLogMacro err: '+e);}
  }
  function provisionBarMacros(){
    try{
      ensureGlobalCampaignLogMacro();
      var players=findObjs({_type:'player'})||[];
      for(var i=0;i<players.length;i++){ ensureCampaignLogMacroForPlayer(players[i].id); }
    }catch(e){ log('provisionBarMacros err: '+e); }
  }

  fts.addHelpSection     = addHelpSection;
  fts.registerCommands   = registerCommands;
  fts.addLogCard         = addLogCard;
  fts.actionLinkAttrs    = actionLinkAttrs;
  fts.cssVars            = cssVars;
  fts.ensureCoreState    = ensureCoreState;
  fts.ensureMule         = ensureMule;
  // Effective page resolution (supports split-party pages).
  fts.getEffectivePageId = function(pid){
    try{
      var c = Campaign();
      var psp = c.get('playerspecificpages') || {};
      if(pid && psp[pid]) return String(psp[pid]);
      return String(c.get('playerpageid'));
    }catch(e){}
    return '';
  };

  // Pages that currently have players (unique pageId list).
  fts.getActivePlayerPageIds = function(){
    var out = {};
    try{
      var c = Campaign();
      var psp = c.get('playerspecificpages') || {};
      for(var pid in psp){ if(psp.hasOwnProperty(pid)){ out[String(psp[pid])] = true; } }
      // Players not in split-party mapping are on ribbon page; include it.
      var ribbon = String(c.get('playerpageid'));
      if(ribbon) out[ribbon] = true;
    }catch(e){}
    var arr = [];
    for(var k in out){ if(out.hasOwnProperty(k) && k){ arr.push(k); } }
    return arr;
  };


  fts.registerStartup    = registerStartup;
  fts.refreshHelpHandout = refreshHelpHandout;
  fts.runStartupHooks    = runStartupHooks;
  fts.autoOpenCampaignMenuForPageChange = autoOpenCampaignMenuForPageChange;
  fts.scriptCardsAvailability = scriptCardsAvailability;
  fts.buildScriptCardThemeMacro = buildScriptCardThemeMacro;
  fts.applyScriptCardThemeForPalette = applyScriptCardThemeForPalette;
  fts.esc                = esc;
  fts.hrefAttr           = hrefAttr;
  fts.literal            = literal;


  // Publish both namespace shapes used by current modules:
  // root.RT.fts for explicit shared namespacing, and root.fts for RT = globalThis access.
  try{
    root.RT = root.RT || {};
    root.RT.fts = fts;
    root.fts = fts;
  }catch(e){}

  addHelpSection(999, 'Core', function(){ return [
    'Show Help:', '!fts --help',
    'Palette switch:', paletteCommandSyntax(),
    'Palette + ScriptCards sync:', '!fts --core set palette mint sc'
  ]; });

  on('chat:message', handleMessage);
  on('ready', function(){
    ensureCoreState();
    mirrorCoreToMule();
    try{ runStartupHooks('ready'); }catch(e){ log('fts core startup err: '+e); }
    try{
      upsertHelpHandout(helpPanel(null, { includeTitle:false }));
    }catch(e){}
    provisionBarMacros();
  });
  on('change:player:_online', function(p){
    try{
      if(p && p.id){
        ensureCampaignLogMacroForPlayer(p.id);
      }
    }catch(e){ log('online macro provision err: '+e); }
  });
  try{
    on('change:campaign:playerpageid', function(obj, prev){
      try{
        fts.autoOpenCampaignMenuForPageChange('ribbon', {
          campaign: (typeof Campaign === 'function') ? Campaign() : null
        });
      }catch(e2){ log('fts core autosync playerpageid err: '+e2); }
    });
    on('change:campaign:playerspecificpages', function(obj, prev){
      try{
        fts.autoOpenCampaignMenuForPageChange('split', {
          campaign: (typeof Campaign === 'function') ? Campaign() : null,
          prev: prev || {}
        });
      }catch(e3){ log('fts core autosync playerspecificpages err: '+e3); }
    });
  }catch(e1){}

})();
