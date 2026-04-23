# FTS Trade Authoring UX Procedure Specification

This document defines the GM-facing authoring UX for the `codex/trade-agent-interactions` branch.

It is a formal companion to the branch charter in `fts_TRADE_AGENT_INTERACTION_BRANCH_CHARTER.md`.

Canonical controlled-choice libraries are defined in:

- `fts_TRADE_CANONICAL_LIBRARY.md`

This specification is intentionally strict.

It assumes:

- no placeholder logic
- no backward-compatibility burden
- no freeform-first configuration model
- no requirement that the GM understand the full simulation internals in order to use the system effectively

The purpose of this document is to define a clean, modular, step-by-step creation flow for the major trade entities that the future branch will support.

## Primary UX Goal

The GM should be able to create a relatively rich and reactive trade configuration by following a short sequence of understandable choices.

The future interface should therefore be built around:

- controlled lists
- progressive disclosure
- review summaries
- derived behavior
- reusable templates

The GM should primarily choose identity, intent, and posture.

FTS should derive the deeper simulation behavior from those choices unless the GM explicitly opens advanced overrides.

## Hard UX Rules

These rules are not suggestions. They are design constraints for this branch.

### 1. The Authoring Surface Must Stay Narrow

The default path should ask for only the information required to produce a valid, useful object.

If an object can be created from six well-chosen decisions, the UX should not ask for twenty.

### 2. Controlled Choices Take Priority Over Free Text

Free text should be limited to:

- display name
- short notes
- optional flavor description

All structural configuration should be driven by explicit choices, toggles, scales, or templates.

### 3. Every Complex Choice Must Be Human-Readable

No raw weights, opaque codes, or unexplained flags should appear in the default authoring flow.

If the GM selects a choice, the UI must be able to describe what that choice means in plain language.

### 4. Advanced Controls Must Never Pollute The Basic Path

The default authoring path should feel safe and fast.

Advanced controls should exist, but they should remain behind an intentional expansion step.

### 5. Derived Behavior Is Preferred

Whenever possible:

- the GM chooses a profile
- FTS derives the internal values

The system should not ask the GM to directly author internal simulation machinery when a profile can express the same intent more cleanly.

### 6. No Wizard Step Should Present An Unfiltered Wall Of Options

If a dropdown would exceed twelve primary choices, the flow should first ask a narrowing question.

This keeps selection lists digestible and prevents visual overload.

### 7. Every Creation Flow Must End With A Review Summary

Before save, the GM should see a short generated summary of:

- what was created
- what it mainly does
- what it mainly wants
- what major behavior it will exhibit

This is essential for confidence and correction.

### 8. Authoring Fields And Display Fields Must Not Be Confused

The future system must distinguish between:

- authoring fields the GM directly configures
- derived simulation state that FTS calculates
- display fields shown in tooltips, summaries, and reports

The GM should configure the smallest practical set of canonical inputs.

The tooltip may show a richer description, but that richer description should be built from the canonical inputs rather than typed from scratch.

### 9. Required Authoring Fields Must Use Canonical Option Families

If a field is required for configuration, it should not ask the GM to invent a value unless there is no reusable category that can reasonably express the idea.

The default assumption for required fields should be:

- dropdown
- checkbox group
- radio group
- compact scale

Free text is the exception, not the rule.

### 10. The Same Meaning Must Reuse The Same Vocabulary Everywhere

If the suite uses a concept such as risk, knowledge, severity, or loyalty, it should use one canonical option family for that concept across markets, actors, routes, and goods unless there is a strong reason not to.

The GM should not have to learn three different words for the same underlying idea.

### 11. Small Canonical Sets Are Better Than Large Exhaustive Menus

When possible, a field should be represented by:

- three options for simple polarity
- five options for meaningful scale
- seven options only if the concept truly needs the extra nuance

The branch should strongly avoid large flat vocabularies that create decision fatigue.

### 12. One Field Should Represent One Concept

A single field should not bundle multiple meanings.

For example:

- `threat_level` is good
- `danger_and_law_pressure` is bad

This is necessary if the GM is expected to configure the system through short, predictable menus.

## Authoring Layers

The future trade UX should treat every configured object as three separate layers.

### Layer 1: Canonical GM Input

This is the only layer the GM should be expected to author in the basic path.

It should consist of:

- templates
- tags
- scales
- toggles
- a small number of required identity fields

### Layer 2: Derived Simulation State

This layer should be built by FTS from the canonical input.

It may include:

- route preference scores
- landed-value logic
- reserve stress behavior
- substitution pressure
- enforcement avoidance
- weather avoidance
- shortage escalation

### Layer 3: Display / Tooltip Output

This layer is what the GM and players read.

It may be more expressive and more detailed than the authoring layer, but it should still be traceable back to the canonical inputs.

This distinction is critical.

The system should not require the GM to author a tooltip directly in order to produce a good tooltip.

## Canonical Vocabulary Standard

Every future required configuration field should be designed using the following standard.

### Each Canonical Field Must Have

- an internal key
- a GM-facing label
- a short help description
- a fixed list of options or a defined multi-select group
- a clear downstream meaning

### Each Option Must Have

- a stable internal token
- a short readable label
- a one-sentence explanation for the UI

### Each Field Should Answer One Of These Questions

- what is this thing?
- what does it mainly do?
- what does it mainly want?
- how cautious or aggressive is it?
- how exposed is it?
- how informed is it?
- how lawful or illicit is it?
- what happens when it is stressed?

If a field does not clearly answer one of those questions, it probably does not belong in the basic path.

## Shared Authoring Pattern

All major creation flows in this branch should follow the same shell.

### Standard Wizard Shell

1. Choose entity type.
2. Choose template or starting profile.
3. Define identity and role.
4. Define needs, offers, or interaction posture.
5. Define risk, knowledge, and response posture.
6. Review generated summary.
7. Save.

### Advanced Override Shell

If the GM chooses to open advanced controls, the UI may then expose:

- additional modifiers
- explicit reserve behavior
- substitution rules
- route preference tuning
- roll-profile overrides
- enforcement or legality overrides

The advanced path must remain modular and grouped by concept.

It must not collapse into one giant raw settings form.

## Required Field Construction Rules

These rules govern how future required configuration fields should be built.

### Rule A: Prefer Templates Plus Modifiers

The GM should usually start from a template and then apply a few modifiers.

Example:

- settlement template: `fishing_port_town`
- plus modifiers: `smuggling_present`, `mine_expanding`, `politically_divided`

This is better than asking the GM to define every economic and social trait from zero.

### Rule B: Prefer Tags For Variety

If the system needs narrative diversity, it should usually come from combining:

- one template
- one or two scales
- a small set of tags

This keeps the authoring surface simple while still allowing many combinations.

### Rule C: Prefer Scales For Pressure

When a field expresses pressure or intensity, the default path should use a scale rather than a typed numeric value.

Examples:

- `none`
- `low`
- `moderate`
- `high`
- `severe`

### Rule D: Reserve Numbers For Advanced Overrides

If a value can be expressed as a scale in the basic path, the GM should not be asked to enter a raw number there.

Raw counts, percentages, and thresholds belong in advanced overrides if they are needed at all.

### Rule E: Multi-Select Should Be Narrow

Multi-select fields should be used only when the concept is genuinely plural.

Good uses:

- exports
- imports
- services
- threat sources
- market tags

Bad uses:

- identity
- role
- primary behavior

### Rule F: Tooltips Should Be Built, Not Authored

The tooltip for a configured object should be composed from the object's canonical fields and FTS's derived summary logic.

This ensures:

- consistency
- reuse
- lower GM effort
- easier future editing

## Canonical Library Strategy

The branch should maintain one shared library of reusable option families.

This library should be the source for:

- settlement templates
- market roles
- actor roles
- goods categories
- services
- risk scales
- knowledge scales
- legality scales
- route exposure scales
- loyalty scales
- behavior profiles

No individual module should casually invent its own synonyms for an established concept.

## Tooltip Rule

The tooltip is an output format, not the primary configuration format.

That means:

- the GM should configure canonical fields
- FTS should assemble the tooltip
- the tooltip may contain richer narrative phrasing
- the tooltip must remain standardized as `item: value`

For example, the GM should not be required to type:

- `market_role: fishing hub; fish-processing port; coastal trade stop; covert smuggling node`

Instead, the GM should choose:

- settlement template
- market role tags
- route tags
- illicit activity tag

Then FTS should compose the richer display line.

## Shared Choice Families

The following lists define the initial approved choice families for this branch.

These lists should be treated as canonical until deliberately revised.

## Goods: Category

Approved choices:

- `food`
- `fuel`
- `craft_material`
- `finished_good`
- `tool`
- `service`
- `luxury`
- `military_supply`
- `contraband`
- `livestock`
- `vessel_supply`

Purpose:

- used to group related goods
- used to narrow substitution and demand logic
- used to filter future dropdowns

## Goods: Unit

Approved choices:

- `piece`
- `bundle`
- `sack`
- `crate`
- `barrel`
- `cask`
- `chest`
- `load`
- `head`
- `day_of_service`
- `job`

Purpose:

- gives the GM a legible trading unit
- avoids requiring custom units during the basic path

## Goods: Durability

Approved choices:

- `stable`
- `sensitive`
- `perishable`
- `fragile`

Meaning:

- `stable`: safe to move and store over long periods
- `sensitive`: transport and storage matter, but spoilage is manageable
- `perishable`: delay and route conditions matter heavily
- `fragile`: loss and damage risk matter more than spoilage

## Goods: Legality

Approved choices:

- `open`
- `restricted`
- `licensed`
- `contraband`

Purpose:

- influences who may trade the good
- influences route and enforcement behavior
- influences actor willingness and smuggling logic

## Goods: Common Use

Approved choices:

- `sustenance`
- `light`
- `heat`
- `household`
- `craft_input`
- `repair`
- `building`
- `trade_resale`
- `status`
- `military`
- `ritual`
- `transport`
- `medicine`
- `administration`
- `knowledge`
- `navigation`
- `security`
- `storage`

Note:

The system should allow multiple common uses to be attached to a single good.

This is required for goods whose importance changes by context.

## Need Priority

Approved choices:

- `low`
- `important`
- `critical`
- `survival`

Meaning:

- `low`: nice to have; delay is acceptable
- `important`: preferred regular stock; shortages matter
- `critical`: behavior changes quickly when stock falls
- `survival`: the market or actor becomes unstable without it

## Reserve Target

Approved choices:

- `none`
- `short`
- `standard`
- `deep`
- `seasonal`

Meaning:

- `none`: no stockpiling intent
- `short`: minimal working reserve
- `standard`: normal reserve behavior
- `deep`: conservative reserve behavior
- `seasonal`: reserve target expands around seasonal pressure

## Price Posture

Approved choices:

- `cheap`
- `fair`
- `premium`
- `desperate_buying`
- `distress_selling`

Purpose:

- gives the GM a readable market stance
- allows price pressure without raw formulas in the basic path

## Quality Profile

Approved choices:

- `cheap`
- `serviceable`
- `good`
- `fine`
- `prestige`

Purpose:

- supports cases where cheaper substitutes do not fully replace premium or local goods
- supports narrative differences without requiring custom text logic

## Knowledge Scope

Approved choices:

- `local`
- `regional`
- `networked`

Meaning:

- `local`: reacts mostly to nearby conditions
- `regional`: notices changes across linked routes and neighboring markets
- `networked`: reacts quickly to broader trade changes

## Risk Tolerance

Approved choices:

- `averse`
- `cautious`
- `balanced`
- `bold`
- `reckless`

## Loyalty Profile

Approved choices:

- `opportunistic`
- `familiar`
- `contract_bound`

Purpose:

- determines how easily an actor or market abandons an established trade relationship for a better offer

## Behavior Profile

Approved choices:

- `subsistence`
- `steady_trade`
- `profit_seeking`
- `speculative`
- `protective`
- `predatory`
- `smuggling`

Purpose:

- defines the basic operating temperament of a market or trade actor

## Threat Level

Approved choices:

- `none`
- `low`
- `moderate`
- `high`
- `severe`

## Enforcement Level

Approved choices:

- `none`
- `light`
- `regular`
- `strict`

## Weather Sensitivity

Approved choices:

- `low`
- `moderate`
- `high`
- `extreme`

## Procedure A: Create A Trade Good

This flow defines the clean authoring path for a trade good.

### Step A1: Identity

GM selects:

- display name
- category
- unit

Control types:

- text field for display name
- dropdown for category
- dropdown for unit

Basic rule:

The GM should never need to define internal keys or formatting rules in the default path.

### Step A2: Handling Profile

GM selects:

- durability
- legality
- quality profile

Purpose:

- sets transport and storage expectations
- sets legal and enforcement exposure
- establishes baseline narrative distinction

### Step A3: Use Profile

GM selects one or more common uses:

- sustenance
- light
- heat
- household
- craft input
- repair
- building
- trade resale
- status
- military
- ritual
- transport
- medicine
- administration
- knowledge
- navigation
- security
- storage

Purpose:

- gives markets and actors a reason to want the good
- supports downstream consequence logic

### Step A4: Value Behavior

GM selects:

- price posture
- one stability choice

Approved stability choices:

- `scarce`
- `seasonal`
- `steady`
- `abundant`

Purpose:

- allows a readable baseline for value and reliability
- avoids exposing raw value weights in the default path

### Step A5: Review Summary

The review should generate a short summary such as:

"Walrus meat is a perishable food traded by barrel. It is openly legal, usually bought at fair value, and mainly serves sustenance and lamp-oil production."

### Trade Good Advanced Overrides

Advanced controls may expose:

- substitute group
- exact substitute exceptions
- spoilage modifiers
- storage constraints
- season-specific value shifts
- production or processing links

The advanced controls should remain grouped under:

- handling
- value
- substitution
- production links

## Procedure B: Create A Market / Map Point Trade Profile

This flow assumes the map point already exists in mapMeta map records.

The trade flow attaches economic meaning to that point.

### Step B1: Bind To Existing Map Point

GM selects:

- existing map point

The flow should display:

- map point name
- region
- locale
- map name

Purpose:

- prevents duplicate location authoring
- keeps mapMeta authoritative for location identity

### Step B2: Settlement Profile

Approved choices:

- use the `Profile Family Library` and `MapPoint Profile Library` in `fts_TRADE_CANONICAL_LIBRARY.md`
- the UI should ask for profile family first
- the UI should then present only the profiles within that family

Purpose:

- gives the map point a recognizable starting economic posture
- drives default reserves, trade priorities, and knowledge scope

### Step B3: Market Identity

GM selects:

- behavior profile
- knowledge scope
- loyalty profile
- risk tolerance

Purpose:

- expresses how the market behaves when safer or cheaper alternatives appear
- avoids forcing the GM to set individual reaction weights

### Step B4: Local Production

GM selects one or more goods the market:

- produces
- processes
- exports

The UI should separate those three sub-groups.

Reason:

- `produces` means the good originates here
- `processes` means the good is made from another input here
- `exports` means it is a regular outward trade item

### Step B5: Ongoing Needs

GM selects one or more goods or services the market:

- seeks
- requires

Each selected need must also require:

- common use
- need priority
- reserve target
- price posture

Purpose:

- ensures every demand has a reason, urgency, and reserve behavior
- supports shortage logic and substitution later

### Step B6: Local Consequence Profile

GM selects one or more consequence sensitivities:

- `food_stress`
- `light_shortage`
- `craft_slowdown`
- `repair_delay`
- `export_loss`
- `security_strain`
- `luxury_decline`

Purpose:

- converts missing stock into readable world consequences
- supports narration and explanation logs

### Step B7: Review Summary

The review should generate a summary such as:

"Frozenfar is a cautious frontier village with regional trade awareness. It exports handcrafted furniture, depends on walrus products for food and light, and becomes unstable quickly if winter reserves fall."

### Market Advanced Overrides

Advanced controls may expose:

- substitute preferences by good
- reserve tuning by season
- local production modifiers
- treasury stress behavior
- contract favoritism
- market memory or information delay tuning

These must remain grouped under:

- supply
- demand
- reserves
- market behavior
- knowledge

## Procedure C: Create A Trade Actor

This flow defines merchant ships, pirate ships, caravans, smugglers, escorts, and similar entities.

### Step C1: Actor Type

Approved choices:

- `merchant_ship`
- `merchant_caravan`
- `smuggler_ship`
- `smuggler_caravan`
- `pirate_ship`
- `escort_ship`
- `escort_company`
- `guild_factor`
- `independent_trader`
- `explorer_vessel`

Purpose:

- narrows the downstream choice lists
- sets a default cargo and interaction profile

### Step C2: Identity

GM selects:

- display name
- home market or base
- primary operating region

Purpose:

- gives the actor a clear place in the network
- anchors route and knowledge defaults

### Step C3: Operating Profile

GM selects:

- behavior profile
- risk tolerance
- loyalty profile
- knowledge scope

Purpose:

- determines whether the actor chases profit, honors existing ties, or seeks safer routes

### Step C4: Cargo Intent

GM selects one or more goods or services the actor typically:

- buys
- sells
- carries on contract
- seeks opportunistically

Each selected good must also require:

- priority
- price posture
- quality profile

Purpose:

- avoids an actor being a generic "merchant" with no actual market character

### Step C5: Threat And Response Posture

GM selects:

- threat response
- weather sensitivity
- enforcement sensitivity

Approved threat response choices:

- `withdraw`
- `avoid`
- `hire_escort`
- `stand_firm`
- `pursue`

Approved enforcement sensitivity choices:

- `ignores`
- `notices`
- `respects`
- `fears`

Purpose:

- expresses how the actor behaves when trade becomes dangerous or illegal

### Step C6: Roll Profile

GM selects one roll profile set.

Approved roll profile choices:

- `merchant_standard`
- `merchant_cautious`
- `pirate_aggressive`
- `pirate_cunning`
- `smuggler_stealth`
- `escort_disciplined`
- `explorer_hardy`

Purpose:

- preserves narrative differentiation between actor types
- keeps the default path structured instead of raw custom formulas

### Step C7: Review Summary

The review should generate a summary such as:

"The Black Gull is a bold merchant ship based out of Velenport. It chases profitable cargo, tolerates moderate route danger, prefers fair long-term contracts, and will hire escort support rather than abandon a critical run."

### Trade Actor Advanced Overrides

Advanced controls may expose:

- cargo capacity tuning
- treasury tuning
- route blacklist and whitelist
- explicit hostile targets
- explicit allies and favored markets
- custom roll-hook overrides

These must remain grouped under:

- cargo
- finance
- relations
- route behavior
- rolls

## Procedure D: Create A Route Interaction Profile

This flow attaches trade and interaction meaning to an existing route.

mapMeta remains authoritative for route identity and geometry.

### Step D1: Bind To Existing Route

GM selects:

- existing route

The flow should display:

- route name
- route map
- route endpoints
- current point count

### Step D2: Route Type

Approved choices:

- `coastal_shipping`
- `blue_water_shipping`
- `river_trade`
- `overland_trade`
- `smuggling_lane`
- `patrol_route`
- `pilgrimage_route`
- `hazard_run`

Purpose:

- defines the route's basic economic and threat expectations

### Step D3: Exposure Profile

GM selects:

- threat level
- enforcement level
- weather sensitivity

Purpose:

- shapes travel risk and actor preferences

### Step D4: Economic Friction

GM selects:

- route cost posture
- delay likelihood

Approved route cost posture choices:

- `cheap`
- `manageable`
- `costly`
- `punishing`

Approved delay likelihood choices:

- `rare`
- `occasional`
- `common`
- `frequent`

Purpose:

- expresses whether a route is efficient, expensive, unstable, or regularly disrupted

### Step D5: Interaction Tone

GM selects:

- typical traffic profile
- common hostile pressure

Approved traffic profile choices:

- `quiet`
- `steady`
- `busy`
- `congested`

Approved hostile pressure choices:

- `none`
- `privateers`
- `pirates`
- `smugglers`
- `monsters`
- `mixed`

Purpose:

- supports both economic behavior and narrative explanation

### Step D6: Review Summary

The review should generate a summary such as:

"The North Ice Run is a costly coastal shipping route with high weather exposure and moderate pirate pressure. It carries steady traffic, suffers occasional delay, and is best suited to cautious or well-escorted traders."

### Route Interaction Advanced Overrides

Advanced controls may expose:

- seasonal danger shifts
- seasonal access windows
- enforcement spikes
- special toll or customs rules
- known ambush or hazard tags

These must remain grouped under:

- seasonality
- danger
- law and customs
- travel friction

## What FTS Must Derive Automatically

The following should be derived wherever possible instead of authored directly in the basic path:

- effective value pressure
- reserve stress behavior
- substitute pressure
- route preference scoring
- weather avoidance behavior
- enforcement avoidance behavior
- likely market switching pressure
- explanation strings

This is critical to keeping the UX clean.

## Review Screen Requirements

Every creation flow must end with the same review structure.

### Required Review Blocks

- identity
- main function
- main wants
- risk posture
- likely behavior summary

### Required Validation Rules

- no object may save without a valid type
- no market may save without at least one economic role
- no actor may save without at least one trade or interaction intent
- no route interaction profile may save without an exposure profile
- no selected need may save without a reason and a priority

## Explanation Requirements

The authoring UX must always preserve explainability.

That means:

- the system must know why a market wants a good
- the system must know why an actor changes routes
- the system must know why a route is avoided or favored
- the system must know why a shortage matters

If a field does not contribute to explainable behavior, it should not appear in the basic path.

## Anti-Patterns This Branch Must Avoid

The future UX should not:

- force the GM to author raw weights first
- expose simulation internals without explanation
- bury critical meaning in free-text notes
- require giant multi-purpose forms
- require support for weaker historical authoring shapes
- generate objects whose behavior cannot be summarized in one short review block

## Immediate Follow-On Specification Work

This procedure specification is the first UX companion document for the branch.

The next design documents should define:

- the exact schema behind each controlled choice
- the derivation rules from profile choice to simulation values
- the explanation-log structure for transactions, shortages, reroutes, and hostile encounters
- the menu or handout presentation rules for these future authoring flows

## Closing Statement

This branch should aim for a disciplined asymmetry:

- simple authoring on the surface
- rich simulation underneath

The GM should choose from small, understandable sets of options.

FTS should carry the burden of turning those choices into a world that behaves as though it were much more complicated than the UI ever feels.
