# FTS Wizard System Implementation Plan

This document defines the recommended architecture, workflow, and rollout plan for the next-generation FTS wizard system.

It is intended to be a practical implementation companion to:

- `fts_TRADE_AGENT_INTERACTION_BRANCH_CHARTER.md`
- `fts_TRADE_AUTHORING_UX_PROCEDURE_SPEC.md`
- `fts_TRADE_CANONICAL_LIBRARY.md`

The goal of this document is to turn the recent design discussion into a concrete, easy-to-follow plan that can guide future implementation work.

## Primary Goal

FTS needs a wizard system that is:

- easier to use than the current handout tree
- consistent across entity types
- narrow in the default path
- friendly to future automation
- resilient when tokens, pages, or route geometry change

The in-Roll20 wizard system supports these campaign-runtime authoring classes:

- `mapPoint`
- `mapRoute`
- `mapAgent`

Region and locale data remain configuration/import concerns outside the wizard layer. The wizard-owned entities form the campaign's runtime world-state layer for trade, travel, weather response, and automation.

## Summary Of The Decision

The recommended direction is:

- one `Wizard Menu` entry point from the Campaign Menu
- one shared Wizard Menu launcher
- feature-specific wizard modules that own their own durable handout surfaces
- one registry-style launcher list that keeps Campaign Menu wiring out of individual wizard modules
- one global Atlas surface for map browsing
- Atlas verify controls for maps, points, routes, agents, and related mule records

This replaces the current approach where one wizard may depend on:

- a launcher handout
- a primary handout
- multiple chooser handouts
- additional special-purpose handouts

The current approach works, but it produces too many steps and too much surface area.

## Hard Requirements

The new wizard system must preserve the following:

- controlled-choice first authoring
- progressive disclosure
- review summaries before save
- derived behavior instead of raw internal tuning in the basic path
- monthly and seasonal CU trade calendars for `mapPoint`
- graceful save behavior when selection changes mid-session
- compatibility with future automation tied to turn order and world-state processing

The new system must also acknowledge two long-term realities:

- region and locale authoring may eventually happen outside Roll20 through dedicated authoring tools
- Roll20 remains the runtime consumer and local campaign editor, but not necessarily the only authoring source

## What Changes And What Stays

### What Stays

- `fts_calendar` remains the owner of date and time
- `fts_weather` remains the owner of weather state
- `fts_mapMeta` remains the owner of page identity and page metadata
- `fts_mapMeta` remains the owner of page identity, page metadata, route geometry, and map-point geometry
- the monthly CU trade calendar remains part of `mapPoint`

### What Changes

- the wizard launcher becomes shared rather than wizard-specific
- authoring remains session-based inside the responsible feature wizard
- map browsing is separated from wizard editing
- route authoring shifts from token-point chaining toward path-segment management
- verification becomes an explicit supported tool instead of a side effect of startup logic

## User-Facing Surfaces

The recommended user-facing surfaces are below.

### 1. Campaign Menu

The Campaign Menu should expose:

- `Wizard Menu`
- `Show Atlas`
- Atlas verify controls
- existing core/module entries as appropriate

Expected result:

- the GM has one obvious place to begin authoring, browsing, and repair operations

### 2. Wizard Menu

The Wizard Menu opens from the Campaign Menu and whispers launch controls to the GM.

The Wizard Menu should:

- run a sync checkpoint first
- show the current page / map context
- list available wizards
- explain why a wizard is unavailable
- provide direct action links to open the selected wizard

Expected result:

- the GM sees a fresh, context-aware launcher every time
- token- or path-dependent wizards can fail cleanly before the editor opens

### 3. Feature Wizard Handouts

Each wizard owns its own durable handout surface:

- `Map Point Wizard`
- `Map Route Wizard`
- `Map Agent Wizard`

Feature wizard handouts should support these common views where they apply:

- `bind`
- `basic`
- `advanced`
- `review`

Expected result:

- the GM sees consistent controls without forcing unrelated workflows into one handout
- all wizard types behave consistently

### 4. Atlas

The map browser should remain, but as a browsing surface rather than a wizard.

The recommended name is:

- `Campaign Atlas`

It should provide:

- current-page map points
- current-page routes
- route and point summaries
- safe navigation links
- GM-only links to open related wizards

Expected result:

- the GM can inspect the map network without entering edit mode
- the atlas remains useful even when no wizard session is active

### 5. Atlas Verify

Verification lives inside Atlas and supports both campaign and active-page scopes.

The recommended name is:

- `Campaign Atlas`

It should provide:

- report-only checks
- optional explicit repair actions
- world-level and page-level scopes
- a clear summary of what was checked, what passed, what failed, and what was repaired

Expected result:

- the GM has one reliable maintenance tool for long-running campaigns

## Command Surface

The shared launcher exposes one namespace:

- `!fts --wizards`

Launcher commands:

- `!fts --wizards`
- `!fts --wizards menu`
- `!fts --mapPointWizard`
- `!fts --mapPointWizard start`

Atlas commands:

- `!fts --atlas`
- `!fts --atlas current`
- `!fts --atlas refresh`
- `!fts --atlas verify campaign`
- `!fts --atlas verify page`
- `!fts --atlas verify repairCampaign`
- `!fts --atlas verify repairPage`

Expected result:

- the launcher, feature wizard, and atlas command surfaces are explicit
- atlas verification is a first-class tool rather than a hidden maintenance behavior

## Shared Wizard Lifecycle

Every wizard should follow the same lifecycle.

### Step 1. Open

The GM opens the Wizard Menu or directly opens a specific wizard.

The system should:

- resolve the effective page
- sync `mapMeta` for that page
- refresh page-bound map context
- verify required selection or binding prerequisites

Expected result:

- the wizard starts from current campaign context rather than stale mule state

### Step 2. Bind

The wizard binds to the object it is meant to edit.

Examples:

- `mapPoint` binds to a selected token and, where possible, to an existing mapMeta point
- `mapRoute` binds to a selected path segment
- `mapAgent` binds to a selected token

Expected result:

- the session knows exactly what object it is editing
- the save path is explicit

### Step 3. Basic Authoring

The wizard presents only the smallest useful set of fields.

Expected result:

- the GM can complete a usable record quickly

### Step 4. Advanced Authoring

Optional advanced controls expose deeper overrides grouped by concept.

Expected result:

- advanced configuration exists without overwhelming the main path

### Step 5. Review

The wizard generates a short review summary before save.

Expected result:

- the GM can confirm intent before data is written

### Step 6. Save

The wizard writes canonical data to the appropriate FTS-owned store.

Expected result:

- the campaign state is updated
- mirrors such as tooltip text, GM notes, or summary handouts are refreshed

### Step 7. Mismatch Check

If the current selection no longer matches the original selection, the wizard warns and offers:

- save to original
- save to current selection
- cancel

Expected result:

- selection drift is handled safely and intentionally

## Shared Session Schema

Wizard modules should store active sessions under their own module-specific state roots.

Recommended root:

```js
state.fts.mapPointWizard = {
  schema: 'fts.mapPointWizard.root.v1',
  sessions: {
    [playerId]: {
      id: 'wiz_...',
      wizardKey: 'mapPoint',
      mode: 'create',
      step: 'basic',
      openedAt: 'ISO',
      updatedAt: 'ISO',
      binding: {
        type: 'token',
        original: {},
        saveMismatchPolicy: 'confirm'
      },
      context: {
        pageId: '...',
        mapKey: '...',
        regionKey: '...',
        localeKey: '...',
        syncAt: 'ISO'
      },
      draftSchema: 'fts.wizard.mapPoint.draft.v1',
      draft: {},
      ui: {}
    }
  }
};
```

Expected result:

- every wizard uses the same session shell
- only the draft payload changes by entity type

## Wizard Registry API

The framework should provide a registry so wizard modules plug into a shared shell.

Recommended registration shape:

```js
RT.fts_wizard.register({
  key: 'mapPoint',
  title: 'Map Point',
  order: 10,
  binding: {
    type: 'token',
    requireSelectionOnOpen: true,
    confirmOnSaveMismatch: true
  },
  availability: function(ctx){},
  open: function(ctx){},
  renderWorkspace: function(session, ctx){},
  act: function(session, action, ctx){},
  validate: function(session, ctx){},
  buildReview: function(session, ctx){},
  save: function(session, ctx){}
});
```

Framework responsibilities:

- session creation
- session lookup
- hub rendering
- workspace rendering
- shared bind logic
- save mismatch prompts
- shared command parsing

Wizard responsibilities:

- draft defaults
- field actions
- validation
- review content
- persistence

Expected result:

- new wizard types can be added without building a new UI stack each time

## Entity Plan

### Map Point

This is the first wizard that should be refactored.

The future `mapPoint` flow should be:

1. Bind to existing map point or selected token
2. Choose profile family
3. Choose profile
4. Set market identity
5. Set local production
6. Set ongoing needs
7. Set local consequence profile
8. Review
9. Save

Advanced sections may expose:

- substitutes
- reserve tuning
- contract favoritism
- knowledge tuning

Important preservation rule:

- the monthly and seasonal CU trade calendar must remain part of the system

Recommended treatment of the CU calendar:

- keep the existing normalized `tradeGoods` data model
- keep season, month, and festival storage fidelity
- move its editor into the shared workspace
- show a narrow summary first
- let the GM focus on one category at a time for detailed CU editing

Expected result:

- `mapPoint` remains rich, but the default path is much faster
- detailed CU calendars remain available without taking over the entire experience

### Map Route

`mapRoute` should be redesigned around path segments rather than token-dropped route points.

Recommended route authoring flow:

1. GM draws a line segment on the map
2. GM selects that path
3. GM opens `mapRoute`
4. Wizard sanity-checks the selected path
5. Wizard asks whether this segment:
   - creates a new route
   - continues an existing route
   - branches from an existing route
6. Wizard captures route and segment details
7. Wizard stores the segment as managed route geometry
8. Wizard moves the segment to a GM-only layer and locks it in place

Important design rule:

- route continuity should not rely on naming convention alone

The system may use names for display, but the actual relationship should be stored explicitly.

Recommended route structure:

- route-level identity and shared defaults
- segment-level geometry and overrides

Segment-level data may include:

- threat
- enforcement pressure
- weather sensitivity
- delay likelihood
- terrain / route type tags
- seasonal overrides

Expected result:

- routes become editable corridors rather than just ordered point lists
- each segment can express its own risk and travel profile

### Map Agent

The `mapAgent` wizard should manage:

- actor type
- identity
- home base
- operating region
- cargo intent
- risk posture
- threat response
- weather sensitivity
- enforcement sensitivity
- roll profile

Expected result:

- merchants, pirates, escorts, smugglers, caravans, and monsters can all use the same authoring shell

## Atlas Browser Plan

The current `Map Locations and Routes` handout should not be removed conceptually, but its role should be clarified.

It is not a wizard.

It is a browser and navigation surface.

Recommended replacement direction:

- one global `Campaign Atlas` handout
- current-page browsing
- route and point summaries
- safe navigation links
- GM-only wizard-launch links

Why this is better than many per-map handouts:

- it scales better as page count grows
- it avoids journal clutter
- it avoids dependence on Roll20 folder management for API-created handouts

Expected result:

- the GM always has one stable place to browse map network state

## Verification Plan

Verification should be an explicit GM tool, not a hidden background assumption.

### Verification Scopes

- `world`
- `page`

### Verification Modes

- report-only
- repair

### What Verify Should Check

#### Maps

- page exists
- page name parses correctly
- `mapMeta` is complete and current

#### Points

- owning page exists
- point payload is complete
- bound token or profile references still resolve where applicable
- orphaned points are detected

#### Routes

- owning page exists
- route payload is complete
- segment or point references still resolve
- route continuity is valid
- orphaned routes are detected

#### Agents

- token exists
- home/base references still resolve
- route references still resolve
- profile payload is complete

### Repair Rules

Repair should:

- remove true orphans from canonical mule roots
- refresh derived mirrors
- rebuild atlas / browser outputs
- report exactly what changed

Repair should not:

- guess at missing intent
- silently invent entity records from arbitrary tabletop objects

Auto-add should happen only when a record has a clear explicit signature.

Expected result:

- campaign state stays clean over time
- the GM has confidence that the stored network matches the tabletop

## Storage Strategy

FTS should continue using FTS-owned canonical state, not token-only state.

Recommended authority model:

- canonical records live in FTS mule roots and `state`
- tokens, tooltips, and GM notes are mirrors
- handouts are browsers and workspaces, not the sole source of truth

Expected result:

- automation can run even when an entity is off-screen
- the suite remains resilient when tokens are duplicated, moved, or deleted

## Step-By-Step Implementation Roadmap

This is the recommended rollout order.

### Phase 1. Create The Shared Wizard Launcher

Work:

- add the `fts_wizards` launcher module
- add the `!fts --wizards` namespace
- add the Campaign Menu `Wizard Menu` button
- perform the global FTS update before presenting launch controls
- keep feature-specific sessions inside their owning wizard modules

Expected result:

- FTS has one common wizard launcher ready for feature modules

### Phase 2. Add Atlas And Verify

Work:

- add the Atlas surface
- add the Verify tool
- add explicit refresh / report / repair commands
- connect Atlas verify to `fts_mapMeta`

Expected result:

- browsing and maintenance are supported before deeper authoring refactors begin

### Phase 3. Refactor Map Point

Work:

- move `mapPoint` behind the shared Wizard Menu launcher
- preserve the current trade-goods model
- keep monthly and seasonal CU editing
- remove chooser-handout dependence
- keep save mismatch protection

Expected result:

- the first major wizard becomes dramatically simpler to use
- CU trade detail remains intact

### Phase 4. Introduce Route Segment Authoring

Work:

- add path binding support to the framework
- define route-level and segment-level schemas
- build the `mapRoute` wizard around selected path segments
- move managed route segments to a GM-only layer
- connect route wizard saves to atlas and verify

Expected result:

- routes become corridor-driven and segment-aware

### Phase 5. Add Map Agent

Work:

- build the `mapAgent` wizard
- define home/base, cargo intent, posture, and profile storage
- connect agents to points, routes, and future turn-order automation

Expected result:

- actor state becomes authorable in the same system as points and routes

### Phase 6. Integrate External Region / Locale Authoring

Work:

- define import format for region and locale data
- allow Roll20 runtime tools to consume imported records
- define safe local override boundaries

Expected result:

- external region and locale authoring can coexist cleanly with in-campaign editing

### Phase 7. Add Turn-Order Automation

Work:

- define agent runtime state
- define scheduler and pause controls
- define route progression logic
- define world-event and logbook hooks
- define automatic pause rules such as damage or major encounters

Expected result:

- FTS can move from authored world state to optional living world automation

## Immediate Next Coding Target

The next recommended implementation target is:

- Phase 1
- followed by Phase 2
- followed immediately by Phase 3

In practical terms, that means:

1. build the shared Wizard Menu launcher
2. build Atlas verify
3. refactor `mapPoint` first

This order is preferred because:

- the launcher must exist before multiple future wizards can share Campaign Menu wiring
- Atlas verify provides immediate safety and visibility
- `mapPoint` is already rich enough to prove whether the launcher flow is working

## Expected End State

When this plan is complete, the GM should be able to:

- open one Wizard Menu from the Campaign Menu
- launch a context-aware wizard for the selected entity
- complete a short guided path
- review the generated summary
- save confidently even if selection changed mid-flow
- browse the live network through Atlas
- run Atlas verify to detect or repair drift
- eventually allow the world to run in the background through automated agents and route logic

That is the intended destination for the next-generation FTS wizard system.
