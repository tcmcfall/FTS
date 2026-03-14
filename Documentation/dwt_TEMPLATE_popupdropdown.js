// dwt_template_popupDropdown.js
// Purpose: Template module demonstrating a one-click pop-up (Roll Query) with dropdowns for Year / Month-or-Festival / Day / Time.
// Relationship: Standalone DWT template. Integrates with dwt_core if present (adds a card & help). Publishes selections to dwt_mule_calendar.
// Version: 1.0.0
// Dependencies: Roll20 API sandbox. (Optional) dwt_core (for palette + log/help registry). (Optional) Meta-Toolbox for broader mule usage.
//
// === Help & Config (Template Reference)
// Category: Pop-up Dropdown Pattern
// Purpose: Provide a "Set Date" button that, with a single click, opens Roll Query dropdowns for Year, Month/Festival, Day, and Time.
//          On submit, selections are validated (festival/day exclusivity; Shieldmeet leap-year requirement), written to state.dwt.now,
//          and mirrored to the mule `dwt_mule`. The mule is auto-healed (created if missing).
// ===

(function(){
  'use strict';

  // === Constants & Version ====================================================
  var SCRIPT = 'dwt_tpl';              // command namespace
  var VERSION = '1.0.0';
  var CORE_MULE = 'dwt_mule';
  var CAL_MULE  = 'dwt_mule';
  var TITLE     = 'Set Date';
  var MIN_YEAR  = 1350;
  var MAX_YEAR  = 1600;

  // === Calendar Data (Harptos) ================================================
  var MONTHS = [
    { name:'Hammer (Deepwinter)',           short:'Hammer'     },
    { name:'Alturiak (The Claw of Winter)', short:'Alturiak'   },
    { name:'Ches (The Claw of Sunsets)',    short:'Ches'       },
    { name:'Tarsakh (The Claw of Storms)',  short:'Tarsakh'    },
    { name:'Mirtul (The Melting)',          short:'Mirtul'     },
    { name:'Kythorn (The Time of Flowers)', short:'Kythorn'    },
    { name:'Flamerule (Summertide)',        short:'Flamerule'  },
    { name:'Eleasis (Highsun)',             short:'Eleasis'    },
    { name:'Eleint (The Fading)',           short:'Eleint'     },
    { name:'Marpenoth (Leafall)',           short:'Marpenoth'  },
    { name:'Uktar (The Rotting)',           short:'Uktar'      },
    { name:'Nightal (The Drawing Down)',    short:'Nightal'    }
  ];
  var BETWEEN = [
    { key:'Midwinter',      afterMonth:1,  label:'Midwinter (between Hammer & Alturiak)' },
    { key:'Greengrass',     afterMonth:4,  label:'Greengrass (between Tarsakh & Mirtul)' },
    { key:'Midsummer',      afterMonth:7,  label:'Midsummer (between Flamerule & Eleasis)' },
    { key:'Shieldmeet',     afterMonth:7,  label:'Shieldmeet (day after Midsummer — leap years only)', leap:true },
    { key:'Highharvestide', afterMonth:9,  label:'Highharvestide (between Eleint & Marpenoth)' },
    { key:'Feast of the Moon', afterMonth:11, label:'Feast of the Moon (between Uktar & Nightal)' }
  ];

  // === Utilities ==============================================================
  function isLeap(y){ return (y%4)===0; }
  function clampYear(y){ return Math.max(MIN_YEAR, Math.min(MAX_YEAR, y)); }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function hrefAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
  function isGM(pid){ try{ return typeof playerIsGM==='function' && playerIsGM(pid); }catch(e){ return false; } }
  function say(html){ sendChat('dwt', html); }
  function whisperTo(pid, html){ var p=getObj('player',pid), who=p?(p.get('displayname')||'GM'):'GM'; sendChat('dwt', '/w \"'+who+'\" '+html); }

  // === Core-awareness (palette) ==============================================
  function getCoreMule(){ return findObjs({_type:'character', name: CORE_MULE})[0] || null; }
  function getAttr(ch, name){
    var a = ch && findObjs({_type:'attribute', _characterid: ch.id, name: name })[0];
    return a ? String(a.get('current')||'') : '';
  }
  function currentPalette(){
    var core = getCoreMule();
    var fromCore = getAttr(core, 'palette');
    if (fromCore) return fromCore;
    if (state.dwt && state.dwt.ui && state.dwt.ui.palette) return state.dwt.ui.palette;
    return 'none';
  }
  var PALETTES = {
    none: null,
    dark: { bg:'#222', fg:'#eee', border:'#111', tableBorder:'#555', card:'#2f2f2f', accent:'#3a7' },
    parchment: { bg:'#f8f1e1', fg:'#3b2f1a', border:'#111', tableBorder:'#b79b74', card:'#efe3c7', accent:'#9a6e37' },
    contrast: { bg:'#000', fg:'#fff', border:'#111', tableBorder:'#888', card:'#111', accent:'#0aa' },
    powder:{ bg:'#eef6ff', fg:'#1f2a44', border:'#7aa7d9', tableBorder:'#9ec3ea', card:'#f2f7ff', accent:'#9ec3ea' }
  };
  function cssVars(){
    var pal = PALETTES[currentPalette()];
    if(!pal){ return { container:'', title:'', card:'', link:'text-decoration:none; color:#4ea3ff;' }; }
    return {
      container:'display:block;width:80%;margin:0 auto;border:3px solid '+pal.border+';padding:10px 12px;background:'+pal.bg+';color:'+pal.fg+';font:14px/1.32 Georgia,serif;',
      title:'font-weight:bold;font-size:17px;margin-bottom:6px;color:'+pal.fg+';',
      card:'margin-top:8px;border:1px solid '+pal.tableBorder+';background:'+pal.card+';color:'+pal.fg+';padding:12px;',
      link:'text-decoration:none; color:'+pal.accent+';'
    };
  }
  function shell(title){ var v=cssVars(); return '<div style=\"'+v.container+'\"><div style=\"'+v.title+'\">'+esc(title)+'</div>'; }
  function endShell(){ return '</div>'; }

  // === State (shared with suite) =============================================
  function assureState(){
    state.dwt = state.dwt || {};
    state.dwt.version = state.dwt.version || VERSION;
    state.dwt.now = state.dwt.now || { year:1492, month:6, day:14, time:'Eventide', festival:'' };
    state.dwt.ui  = state.dwt.ui  || { palette:'none' };
  }

  // === Mule (calendar) =======================================================
  function ensureCalendarMule(){
    var c = findObjs({ _type:'character', name: CAL_MULE })[0];
    if (!c){
      c = createObj('character', { name: CAL_MULE, inplayerjournals:'', controlledby:'', archived:false });
    } else {
      c.set({ inplayerjournals:'', archived:false });
    }
    return c;
  }
  function setAttrDirect(ch, name, value){
    var a = ch && findObjs({ _type:'attribute', _characterid: ch.id, name: name })[0];
    if (a) a.set('current', String(value));
    else if (ch) createObj('attribute', { _characterid: ch.id, name: name, current: String(value) });
  }
  function mirrorNowToMule(){
    var c = ensureCalendarMule();
    var n = state.dwt.now||{};
    setAttrDirect(c, 'year', n.year||1492);
    setAttrDirect(c, 'month', n.month||6);
    setAttrDirect(c, 'day', n.day||14);
    setAttrDirect(c, 'time', n.time||'Eventide');
    setAttrDirect(c, 'festival', n.festival||'');
    setAttrDirect(c, 'version', VERSION);
    return c;
  }

  // === Validation / Normalization ============================================
  function normalizeFestivalKey(k){
    var s = String(k||'').trim().toLowerCase();
    for (var i=0;i<BETWEEN.length;i++){
      if (BETWEEN[i].key.toLowerCase()===s) return BETWEEN[i].key;
    }
    return '';
  }
  function normalizeTime(t){
    var s = String(t||'').trim().toLowerCase();
    if (s==='keep') return 'keep';
    var map = { deepnight:'Deepnight', firstlight:'Firstlight', daytide:'Daytide', eventide:'Eventide' };
    return map[s] || null;
  }
  function listLeapYears(){
    var out=[]; for (var y=MIN_YEAR;y<=MAX_YEAR;y++){ if(isLeap(y)) out.push(y); } return out;
  }

  // === UI: Config Card =======================================================
  function narrativeLine(now){
    if (now.festival){ return 'It is currently '+now.time+' on '+now.festival+', '+now.year+' DR.'; }
    return 'It is currently '+now.time+' on '+now.day+' '+MONTHS[now.month-1].short+', '+now.year+' DR.';
  }
  function renderCard(pid){
    var v = cssVars(); assureState();
    var now = state.dwt.now;

    // Build 1-click Roll Query button (Year + Month/Festival (+Day) + Time)
    var years = []; for (var y=MIN_YEAR; y<=MAX_YEAR; y++){ years.push(y); }
    var yearOptions = ['keep,keep'].concat(years.map(function(Y){ return (isLeap(Y)?(Y+' (L)'):String(Y)) + ', ' + Y; })).join('|');

    // Day sub-query (escaped for nesting)
    var dayQueryRaw = '?{Day|keep,keep'+Array.apply(null,Array(30)).map(function(_,i){ var d=i+1; return '|'+d+', '+d; }).join('')+'}';
    var dayQueryEsc = dayQueryRaw.replace(/\|/g,'&amp;#124;').replace(/,/g,'&amp;#44;').replace(/\{/g,'&amp;#123;').replace(/\}/g,'&amp;#125;');

    // Month/Festival options
    var monthOptionsArr = [];
    monthOptionsArr.push('keep, --month keep --day '+dayQueryEsc);
    for (var m=1;m<=12;m++){
      monthOptionsArr.push(MONTHS[m-1].short+' ('+m+'), --month '+m+' --day '+dayQueryEsc);
      for (var i=0;i<BETWEEN.length;i++){
        var b=BETWEEN[i]; if (b.afterMonth===m){ monthOptionsArr.push(b.label+', --month keep --day keep --festival '+b.key); }
      }
    }
    var monthOptions = monthOptionsArr.join('|');

    var timeOptions = [
      'keep,keep',
      'Deepnight (0000-0600),deepnight',
      'Firstlight (0600-1200),firstlight',
      'Daytide (1200-1800),daytide',
      'Eventide (1800-2400),eventide'
    ].join('|');

    var setHref = '!'+SCRIPT+' --setdate --year ?{Year|'+yearOptions+'} ?{Month/Festival|'+monthOptions+'} --time ?{Time of Day|'+timeOptions+'}';

    var html = shell(TITLE)
            + '<div>'+esc(narrativeLine(now))+'</div>'
            + '<div style=\"'+v.card+'\">'
            +   '<a href=\"'+hrefAttr(setHref)+'\" style=\"'+v.link+'\">Set Date</a>'
            + '</div>'
            + endShell();
    return html;
  }

  // === Parse & Apply ==========================================================
  function parseFlags(txt){
    var parts = String(txt||'').trim().split(/\s+--/), flags = {};
    for (var i=1;i<parts.length;i++){
      var m = parts[i].match(/^([A-Za-z-]+)(?:\s+(.+))?$/);
      if (!m) continue;
      flags[String(m[1]||'').toLowerCase()] = String(m[2]||'').trim();
    }
    return flags;
  }

  function applySetFromFlags(flags, pid){
    var changed=false; assureState();
    var now = state.dwt.now;

    // Prompts handled by roll-query; here we only validate supplied tokens.
    // Year
    if (Object.prototype.hasOwnProperty.call(flags, 'year')){
      if (flags.year==='keep'){ /* no-op */ }
      else {
        var Y=parseInt(flags.year,10);
        if (isNaN(Y) || Y<MIN_YEAR || Y>MAX_YEAR){ whisperTo(pid,'Year must be '+MIN_YEAR+'–'+MAX_YEAR+'.'); return false; }
        now.year = Y; changed=true;
      }
    }
    // Month
    if (Object.prototype.hasOwnProperty.call(flags, 'month')){
      if (flags.month==='keep'){ /* no-op */ }
      else {
        var M=parseInt(flags.month,10);
        if (isNaN(M) || M<1 || M>12){ whisperTo(pid,'Month must be 1–12.'); return false; }
        now.month = M; now.festival=''; changed=true;
      }
    }
    // Day
    if (Object.prototype.hasOwnProperty.call(flags, 'day')){
      if (flags.day==='keep'){ /* no-op */ }
      else {
        var D=parseInt(flags.day,10);
        if (isNaN(D) || D<1 || D>30){ whisperTo(pid,'Day must be 1–30.'); return false; }
        now.day = D; now.festival=''; changed=true;
      }
    }
    // Festival
    if (Object.prototype.hasOwnProperty.call(flags, 'festival')){
      if (flags.festival==='keep'){ /* no-op */ }
      else {
        var fk = normalizeFestivalKey(flags.festival);
        if (!fk){ whisperTo(pid, 'Festival must be one of: '+BETWEEN.map(function(b){return '<code>'+b.key.toLowerCase()+'</code>';}).join(', ')); return false; }
        now.festival = fk; changed=true;
      }
    }
    // Exclusivity
    if (now.festival && Object.prototype.hasOwnProperty.call(flags,'day') && flags.day!=='keep'){
      whisperTo(pid,'Invalid: you cannot specify a <b>festival</b> and a <b>day</b> together.'); return false;
    }
    // Time
    if (Object.prototype.hasOwnProperty.call(flags, 'time')){
      if (flags.time==='keep'){ /* no-op */ }
      else {
        var T = normalizeTime(flags.time);
        if (!T){ whisperTo(pid,'Time must be one of: deepnight, firstlight, daytide, eventide, or keep.'); return false; }
        now.time = T; changed=true;
      }
    }
    // Shieldmeet rule
    if (now.festival === 'Shieldmeet'){
      if (!isLeap(now.year)){
        whisperTo(pid,'Shieldmeet requires a leap year. Try one of: '+listLeapYears().join(', '));
        return false;
      }
    }
    // Clamp
    now.year = clampYear(now.year||1492);
    if (now.day<1) now.day=1; if (now.day>30) now.day=30;

    if (changed){ mirrorNowToMule(); }
    return changed;
  }

  // === Integration: Core (log card + help) ===================================
  function registerWithCore(){
    if (!globalThis.dwt) return;
    try{
      if (typeof dwt.addLogCard==='function'){
        dwt.addLogCard(15, function(pid){ return renderCard(pid); }); // appears above Core
      }
      if (typeof dwt.addHelpSection==='function'){
        dwt.addHelpSection(15, 'Template: Pop-up Dropdown', function(){
          return [
            'Open Set Date panel:', '!'+SCRIPT,
            'One-click Set Date (opens dropdown choices):', '!'+SCRIPT+' --setdate (via button)',
            '',
            'Parameters (validated, GM or player as you prefer):',
            '--year N ( '+MIN_YEAR+'–'+MAX_YEAR+' or keep )',
            '--month 1–12 (or keep)',
            '--day 1–30 (or keep)',
            '--festival midwinter|greengrass|midsummer|shieldmeet|highharvestide|feast of the moon (or keep)',
            '--time deepnight|firstlight|daytide|eventide (or keep)',
            '',
            'Rules: day and festival are mutually exclusive; Shieldmeet requires a leap year.'
          ];
        });
      }
    }catch(e){ /* ignore */ }
  }

  // === Router ================================================================
  function handleMessage(msg){
    if (msg.type!=='api') return;
    var content = String(msg.content||'').trim();
    if (!new RegExp('^!'+SCRIPT+'(\\b|$)','i').test(content)) return;

    var pid = msg.playerid;
    assureState();
    ensureCalendarMule();

    var flags = parseFlags(content);
    if (Object.prototype.hasOwnProperty.call(flags,'setdate')){
      // This flag is a marker. The actual values are in other flags populated by the roll query.
      var changed = applySetFromFlags(flags, pid);
      var v = cssVars();
      var html = shell(TITLE) + '<div style=\"'+v.card+'\">'+esc(narrativeLine(state.dwt.now))+'</div>' + endShell();
      whisperTo(pid, html);
      return;
    }

    // Default: show card
    whisperTo(pid, renderCard(pid));
  }

  // === Bootstrap =============================================================
  on('ready', function(){
    assureState();
    ensureCalendarMule();
    registerWithCore();
    log('dwt_template_popupDropdown v'+VERSION+' ready.');
  });
  on('chat:message', handleMessage);
})();
