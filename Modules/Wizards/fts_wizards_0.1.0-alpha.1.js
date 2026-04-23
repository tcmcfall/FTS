// name:        fts_wizards.js
// version:     0.1.0-alpha.1
// description: GM-only Wizard Menu launcher for FTS. Adds a Campaign Menu button that updates shared FTS state, then whispers wizard launch buttons to the GM.
// depends:     fts_core >= 0.2.0-alpha.1 (required), fts_atlas >= 0.1.0-alpha.1 (recommended), fts_mapPointWizard >= 0.2.0-alpha.1 (recommended), Roll20 Mod API
// provides:    !fts --wizards
//              !fts --wizards menu
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

var fts_wizards = (function(){
  'use strict';

  var RT = (typeof globalThis !== 'undefined') ? globalThis
         : (typeof window !== 'undefined')     ? window
         : (typeof self !== 'undefined')       ? self
         : (typeof global !== 'undefined')     ? global
         : this;

  var VERSION = '0.1.0-alpha.1';
  var MODULE_KEY = 'wizards';
  var MENU_COMMAND = '!fts --wizards menu';
  var _registered = false;

  var WIZARDS = [
    {
      key:'mapPoint',
      label:'Map Point Wizard',
      active:true,
      target:function(pid){
        if(RT.fts_mapPointWizard && typeof RT.fts_mapPointWizard.getLaunchCommand === 'function'){
          return RT.fts_mapPointWizard.getLaunchCommand(pid || '');
        }
        return '';
      }
    },
    { key:'mapRoute', label:'Map Route Wizard', active:false },
    { key:'mapAgent', label:'Map Agent Wizard', active:false }
  ];

  function esc(s){
    return String(s || '').replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c] || c;
    });
  }

  function lower(s){
    return String(s || '').toLowerCase();
  }

  function cssVars(){
    return (RT.fts && typeof RT.fts.cssVars === 'function')
      ? RT.fts.cssVars()
      : {
          container:'',
          title:'',
          card:'',
          link:'text-decoration:none;color:#2266aa;',
          btn:'display:block;text-align:center;',
          hrefAttr:function(s){ return String(s || '').replace(/"/g, '&quot;'); }
        };
  }

  function isGM(pid){
    try{
      return !!playerIsGM(pid);
    }catch(e){
      return false;
    }
  }

  function playerName(pid){
    try{
      var p = getObj('player', pid);
      return p ? (p.get('displayname') || 'GM') : 'GM';
    }catch(e){
      return 'GM';
    }
  }

  function whisper(pid, html){
    try{
      sendChat('fts', '/w "' + playerName(pid) + '" ' + html);
    }catch(e){}
  }

  function shell(title){
    var v = cssVars();
    return '<div style="' + (v.container || '') + '"><div style="' + (v.title || '') + '">' + esc(title) + '</div>';
  }

  function endShell(){
    return '</div>';
  }

  function actionLinkAttrs(target){
    if(RT.fts && typeof RT.fts.actionLinkAttrs === 'function'){
      return RT.fts.actionLinkAttrs(target);
    }
    var v = cssVars();
    var href = v.hrefAttr ? v.hrefAttr(target) : esc(target);
    return ' href="' + href + '" style="' + (v.btn || v.link || 'display:block;text-align:center;') + '"';
  }

  function directLinkAttrs(target){
    return actionLinkAttrs(target) + ' target="_blank" rel="noopener noreferrer"';
  }

  function inactiveButton(label){
    var v = cssVars();
    var style = String(v.btn || 'display:block;text-align:center;');
    if(style && !/;\s*$/.test(style)) style += ';';
    style += 'opacity:0.52;cursor:default;';
    return '<span style="' + style + '">' + esc(label) + '</span>';
  }

  function activeWizardTarget(wizard, pid){
    try{
      return wizard && typeof wizard.target === 'function' ? String(wizard.target(pid) || '') : '';
    }catch(e){
      log('fts_wizards activeWizardTarget err: ' + e);
      return '';
    }
  }

  // This mirrors the Campaign Atlas refresh path when that module is loaded.
  // Otherwise, refresh the shared state surfaces that affect wizard context:
  // startup hooks, map metadata, and map records.
  function runGlobalFtsUpdate(pid){
    try{
      if(RT.fts_atlas && typeof RT.fts_atlas.refreshFTS === 'function'){
        RT.fts_atlas.refreshFTS(pid || '', '');
        return;
      }
    }catch(e1){
      log('fts_wizards atlas refresh err: ' + e1);
    }

    var pageId = '';
    try{
      if(RT.fts && typeof RT.fts.getEffectivePageId === 'function'){
        pageId = String(RT.fts.getEffectivePageId(pid) || '');
      }
    }catch(e2){}

    try{
      if(RT.fts && typeof RT.fts.runStartupHooks === 'function'){
        RT.fts.runStartupHooks('wizard-menu');
      }
    }catch(e3){
      log('fts_wizards startup refresh err: ' + e3);
    }

    try{
      if(pageId && RT.fts_mapMeta && typeof RT.fts_mapMeta.syncPageMeta === 'function'){
        RT.fts_mapMeta.syncPageMeta(pid || 'API', { pageId:pageId });
      }
    }catch(e4){
      log('fts_wizards mapMeta refresh err: ' + e4);
    }

    try{
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.loadMapRecordsFromMule === 'function'){
        RT.fts_mapMeta.loadMapRecordsFromMule();
      }
      if(RT.fts_mapMeta && typeof RT.fts_mapMeta.refreshActiveMapRecords === 'function'){
        RT.fts_mapMeta.refreshActiveMapRecords();
      }
    }catch(e5){
      log('fts_wizards mapMeta route/point refresh err: ' + e5);
    }
  }

  function renderWizardButton(wizard, pid){
    var label = wizard.label || 'Wizard';
    if(!wizard.active){
      return '<div style="margin-top:6px;">' + inactiveButton(label) + '</div>';
    }

    var target = activeWizardTarget(wizard, pid);
    if(!target){
      return '<div style="margin-top:6px;">' + inactiveButton(label) + '</div>'
        + '<div style="margin-top:3px;font-size:12px;opacity:0.85;">' + esc(label) + ' module is not loaded.</div>';
    }

    if(String(target).charAt(0) === '!'){
      return '<div style="margin-top:6px;"><a' + actionLinkAttrs(target) + '>' + esc(label) + '</a></div>';
    }
    return '<div style="margin-top:6px;"><a' + directLinkAttrs(target) + '>' + esc(label) + '</a></div>';
  }

  function renderWizardMenu(pid){
    var html = shell('Wizard Menu');
    html += '<div style="' + (cssVars().card || '') + '">';
    html += '<div><b>Choose Wizard</b></div>';
    html += '<div style="margin-top:4px;">FTS state has been updated. Choose a wizard to open its panel.</div>';
    for(var i=0;i<WIZARDS.length;i++){
      html += renderWizardButton(WIZARDS[i], pid);
    }
    html += '</div>';
    html += endShell();
    return html;
  }

  function renderCampaignMenuCard(pid){
    if(!isGM(pid)) return '';
    var html = '<div style="' + (cssVars().card || '') + '">';
    html += '<a' + actionLinkAttrs(MENU_COMMAND) + '>Wizard Menu</a>';
    html += '</div>';
    return html;
  }

  function showWizardMenu(pid){
    runGlobalFtsUpdate(pid || '');
    whisper(pid, renderWizardMenu(pid || ''));
    return { changed:false };
  }

  function helpLines(){
    return [
      'Commands',
      '!fts --wizards',
      '!fts --wizards menu',
      '',
      'GM-only behavior',
      'The Campaign Menu contains a Wizard Menu button for GMs.',
      'Wizard Menu performs the global FTS update, then whispers Map Point Wizard, Map Route Wizard, and Map Agent Wizard launch controls to the GM.',
      'Map Point Wizard is the only active wizard launch button in this version.',
      'Map Point Wizard is chat-driven, including save validation, save-target checks, and reset confirmation.'
    ];
  }

  function handleWizardsCommand(args){
    var pid = args.pid;
    if(!isGM(pid)) return { error:'Only the GM may use Wizard Menu.' };
    var raw = String(args.val || '').trim();
    if(!raw || lower(raw) === 'menu'){
      return showWizardMenu(pid);
    }
    return { error:'Unknown Wizards command. Use !fts --wizards menu.' };
  }

  function registerWithCore(){
    try{
      if(!(RT.fts && !_registered && typeof RT.fts.registerCommands === 'function')) return;
      RT.fts.registerCommands({
        wizards: {
          access:'gm',
          handler:handleWizardsCommand
        }
      });
      if(typeof RT.fts.addLogCard === 'function'){
        RT.fts.addLogCard(28, function(pid){
          try{
            return renderCampaignMenuCard(pid);
          }catch(e){
            log('fts_wizards logCard err: ' + e);
            return '';
          }
        });
      }
      if(typeof RT.fts.addHelpSection === 'function'){
        RT.fts.addHelpSection(28, 'Wizard Menu', helpLines);
        if(typeof RT.fts.refreshHelpHandout === 'function'){
          RT.fts.refreshHelpHandout(null);
        }
      }
      _registered = true;
    }catch(e){
      log('fts_wizards registerWithCore err: ' + e);
    }
  }

  on('ready', function(){
    registerWithCore();
    log('fts_wizards v' + VERSION + ' ready.');
  });

  return {
    menu: showWizardMenu
  };
}());

try{
  var _ftsWizardsRoot = (typeof globalThis !== 'undefined') ? globalThis
                      : (typeof window !== 'undefined')     ? window
                      : (typeof self !== 'undefined')       ? self
                      : (typeof global !== 'undefined')     ? global
                      : this;
  _ftsWizardsRoot.RT = _ftsWizardsRoot.RT || {};
  _ftsWizardsRoot.RT.fts_wizards = fts_wizards;
  _ftsWizardsRoot.fts_wizards = fts_wizards;
}catch(e){}
