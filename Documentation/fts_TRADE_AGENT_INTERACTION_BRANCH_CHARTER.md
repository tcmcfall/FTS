# FTS Trade Agent Interaction Branch Charter

This document defines the purpose, scope, and design goals of the `codex/trade-agent-interactions` branch.

The branch exists to explore and define the next major expansion of FTS beyond date, weather, map metadata, and route capture: a modular trade-and-interaction layer that can support living markets, automated trade agents, route risk, and GM-facing narrative consequences inside Roll20.

The immediate goal of this branch is not to rush implementation. The immediate goal is to establish a clear and durable design direction before code is written.

Companion documents:

- `fts_TRADE_AUTHORING_UX_PROCEDURE_SPEC.md`
- `fts_TRADE_CANONICAL_LIBRARY.md`

## Branch Identity

- Branch name: `codex/trade-agent-interactions`
- Working focus: trade agents, shared interaction resolution, route-aware commerce, and optional scheduler automation
- Campaign inspiration: Ghosts of Velen
- Product goal: a reusable Roll20 API suite that can enrich one campaign deeply while remaining portable for other GMs and other campaign settings

## Why This Branch Exists

FTS already has strong foundations for campaign time, weather, page metadata, and route/map-point capture.

Those systems are useful on their own, but they also suggest a larger possibility:

- map points can become markets, ports, villages, pirate coves, depots, shrines, fisheries, and city districts
- routes can become trade lanes, convoy paths, smuggling channels, pilgrimage roads, and patrol circuits
- time and season can influence production, travel, danger, and demand
- weather can shape the safety, speed, and cost of movement
- NPCs and ships can become active participants in the world rather than passive flavor

This branch is where FTS begins defining that larger world simulation layer.

## Vision

The long-term vision is a FTS ecosystem in which:

- places have economic identities
- goods have meaningful uses and downstream consequences
- traders, smugglers, pirates, explorers, and caravans can act as autonomous agents
- routes carry both opportunity and risk
- the calendar and weather meaningfully affect commerce and movement
- the GM can understand not only what happened, but why it happened

The suite should be able to support both of these play styles:

- background simulation that quietly keeps the world moving between player scenes
- foreground interaction where the GM can zoom into a specific ship, trader, port, raid, shortage, or opportunity

## Core Product Goals

### 1. Preserve Modularity

This branch must reinforce the suite's modular structure rather than erode it.

That means:

- `fts_calendar` remains the authoritative owner of date and time state
- `fts_weather` remains the authoritative owner of regional and locale weather state
- `fts_geo` remains the authoritative owner of map routes and map points
- the future trade/actor/scheduler layers must integrate with those systems without duplicating their core responsibilities

### 2. Preserve Reusability

The trade layer cannot be built only for one campaign's lore.

Ghosts of Velen is the motivating use case, but the design must remain broadly reusable by:

- other DMs using Forgotten Realms or adjacent settings
- GMs who want only a trade network without pirate automation
- GMs who want living NPC trade agents without detailed market simulation
- GMs who want deep simulation with custom data overrides

### 3. Preserve NPC and Token Workflows

This branch explicitly supports the use of:

- NPCs as identifiable actors with custom rolls, behavior, and role flavor
- tokens as visual anchors, route-capture tools, and optional live mirrors of world entities

The design should not force the GM to abandon NPC-based thinking in order to gain automation.

### 4. Support Interaction, Not Just Automation

A key branch goal is to move beyond isolated scripts that take turns independently.

The system should support meaningful interaction such as:

- a village buying and selling based on current reserves
- a merchant ship being intercepted by a pirate ship
- a trader rerouting because a new market offers better landed value
- a shortage in one market affecting demand and prices elsewhere
- weather or route danger changing trade behavior

### 5. Prioritize Explainable Outcomes

The suite will become complex. That is acceptable.

What is not acceptable is complexity that becomes unreadable or unmanageable for the GM.

For that reason, one of the branch's most important goals is explanation quality. The GM should be able to ask:

- why did this market run short?
- why did this route lose traffic?
- why did this ship avoid that port?
- why did this price spike happen?

And the suite should be able to answer in plain language.

## Guiding Design Principles

### FTS Owns World State

Tokens, turn-order entries, and character sheets are useful interfaces, but they should not be the only source of truth.

Canonical state should live in FTS-owned structures so that:

- the system remains resilient if tokens are moved, deleted, or duplicated
- the suite can simulate off-screen activity
- the same actor or market can be rendered in multiple UI forms without splitting its truth across several objects

### Declarative Data Over Ad Hoc Script Blobs

Trade actors should be driven by structured data and behavior profiles rather than arbitrary custom code strings.

This preserves:

- portability
- readability
- safety
- testability
- reuse at scale

Custom behavior is still a goal, but it should be expressed through structured fields, templates, priorities, and named roll hooks wherever possible.

### Multi-Scale Time

The branch should not assume all simulation must occur at six-second combat cadence.

Different systems need different operational scales:

- combat scale
- scene scale
- travel scale
- commerce scale
- seasonal scale

The design should support optional turn-order integration without forcing the entire economy to update as though every background ship were in literal combat.

### 5e-Compatible, Abstract by Default

Encounters and trade risk should feel compatible with D&D 5e expectations, but background simulation should remain abstract enough to scale.

This means:

- use 5e-like checks, ratings, and consequences where appropriate
- avoid forcing full tactical combat for every background interaction
- allow the GM to zoom into a specific event when desired

### Authoring Must Be Layered

The UX should support both:

- a simple template-driven path for common use
- an advanced path for detailed economic and interaction tuning

The system should not assume every GM wants every knob from day one.

## Problem Statement

The branch is intended to solve the following design problem:

How can FTS model trade agents, markets, routes, and conflicts in a way that is:

- modular
- reusable
- token- and NPC-friendly
- compatible with existing FTS calendar, weather, and geo modules
- sufficiently deep to create emergent outcomes
- understandable enough to remain pleasant to use

## Desired Capabilities

The future branch work should enable FTS to model:

- market demand and supply across map points
- goods that are produced, imported, exported, consumed, required, or hoarded
- seasonal availability and route timing windows
- merchant, pirate, smuggler, caravan, explorer, and escort behaviors
- route danger, interruption, tolls, storms, and losses
- preference shifts when better deals become known
- cascading consequences when supply chains fail
- configurable interactions between agents that occupy the same route, segment, or region

## Conceptual Model

The current branch vision assumes four major kinds of entities.

### Trade Goods

A trade good is more than a name and a price.

A trade good should eventually be able to express:

- category
- units
- durability or perishability
- legality
- common uses
- substitutes
- value profile
- production requirements
- consumption requirements

Examples:

- walrus meat
- lamp oil
- handcrafted furniture
- mass-produced furniture
- rope
- salted fish
- timber
- iron tools

### Markets / Map Points

A map point can become an economic actor even if it is not a moving NPC.

A market-capable map point should eventually be able to express:

- what it offers
- what it seeks
- what it requires in order to remain stable
- what it produces locally
- what it consumes regularly
- what reserves it currently holds
- what happens if reserves or income fall
- how risk-tolerant it is
- how much information it has about neighboring routes and prices

Examples:

- a frozen village dependent on walrus meat for sustenance and lamp oil
- a timber settlement exporting handcrafted furniture
- a city district selling cheap manufactured furniture
- a pirate cove that buys stolen goods at a discount
- a lighthouse outpost that pays heavily for lamp oil and repair timber

### Trade Actors

Trade actors are the active participants that move, buy, sell, raid, scout, escort, or speculate.

They may be represented by NPCs, ships, caravans, crews, guild agents, or factions.

A trade actor should eventually be able to express:

- role
- home port or base
- cargo capacity
- current cargo
- treasury or purchasing power
- behavior profile
- risk tolerance
- knowledge range
- route preferences
- roll hooks
- diplomacy or hostility tendencies
- reaction rules for opportunities and threats

Examples:

- merchant ship
- smuggler brig
- pirate sloop
- overland caravan
- guild factor
- fisheries convoy

### Scheduler / Interaction Layer

Trade actors become interesting only when there is a shared system that can evaluate what happens between them.

This layer should eventually handle:

- step timing
- movement progression
- market arrival
- buy/sell resolution
- interception opportunities
- detection and pursuit
- abstract raids or defenses
- loss, delay, or reroute consequences
- explanation logging

## Economic Reasoning Model

The branch should avoid a shallow model in which actors chase only the lowest posted price.

Instead, decisions should be based on a broader concept of effective or landed value.

That includes:

- base purchase price
- transport cost
- time cost
- route danger
- spoilage or degradation risk
- taxation, tariffs, or bribes
- legality
- reliability of supplier
- urgency of need
- cultural or contractual preference
- known substitutes

This model allows the suite to produce better outcomes than simple price arbitrage.

## Need, Motivation, and Consequence

The branch should treat trade demand as motivated rather than purely abstract.

A market or actor should be able to distinguish between:

- wants
- needs
- dependencies
- luxuries
- strategic reserves

Each desired good or service should eventually be able to define:

- the reason for demand
- the priority of that demand
- the minimum reserve target
- acceptable substitutes
- how quickly the stock is consumed
- the consequence if the need goes unmet

This is essential for believable reactions.

In practical terms, it allows the system to express cases like:

- a village buys walrus meat because it is food
- the same village also depends on walrus-derived oil for lamps
- furniture exports help fund those imports
- cheaper outside furniture may damage local craft income
- reduced local income may shrink the village's import capacity
- reduced imports may create shortage pressure that changes pricing and behavior

## Knowledge and Information Delay

The branch should assume that agents do not have perfect information.

This means:

- a better route does not immediately reshape the whole network
- pirate attacks should not instantly be known everywhere
- shortages and price changes should spread through the network over time
- well-connected actors should react faster than isolated actors

Knowledge should therefore become part of the future simulation model.

This will help the world feel alive instead of mechanically omniscient.

## Interaction Model

The current design direction assumes a turn or step cycle similar to this:

1. Advance the scheduler at the chosen time scale.
2. Update movement and route progress for active actors.
3. Check for arrivals, proximity, shared route presence, and market access.
4. Evaluate opportunities, needs, and threats.
5. Resolve transactions, diversions, raids, escorts, or withdrawals.
6. Apply consequences to cargo, reserves, treasury, damage, morale, or timing.
7. Record an explanation log in readable GM-facing language.

This model is intended to support both market interactions and hostile interactions.

## Hostile / Threat Resolution

The branch should support an abstract but 5e-compatible threat and defense model.

That means future interactions may include:

- pirate interception attempts
- smuggler evasion
- merchant escort protection
- route patrol deterrence
- weather-caused vulnerability
- cargo loss or seizure
- damage, delay, retreat, or diversion

The default approach should be abstract resolution for scale.

The design should still leave room for an eventual "zoom in" path where the GM can elevate a background interaction into a live scene.

## UX Goals

The main UX challenge is not eliminating complexity. The main UX challenge is making complexity digestible.

This branch should therefore target the following UX qualities.

### Clear Authoring

The GM should be able to define useful content without filling every advanced field.

Good defaults and templates should exist for:

- ports
- villages
- city markets
- pirate coves
- merchant ships
- pirate ships
- caravans
- smugglers

### Readable Summaries

The suite should summarize market and actor state in concise, meaningful language.

Examples of useful summaries:

- what this location mainly exports
- what this actor urgently needs
- what route is most dangerous this month
- what caused a shortage or delay

### Explainable Consequences

The GM should be able to inspect a shortage, missed delivery, or reroute and receive a short causal summary.

Example:

"Frozenfar's lamp oil reserve fell because furniture income dropped after a new city route undercut local craftsmen, and two inbound walrus shipments were delayed by ice and privateer activity."

### Optional Depth

The suite should welcome both:

- a GM who wants flavorful but mostly automatic behavior
- a GM who wants to tune reserve targets, substitution logic, tariffs, risk weights, and route thresholds

## Scope For This Branch

This branch is currently a design and foundation branch.

Its near-term purpose is to define:

- architecture boundaries
- data schema direction
- terminology
- interaction model
- phased implementation order
- UX requirements and explanation standards

This branch does not need to solve every implementation detail before any code is written.

It does need to prevent the project from drifting into a pile of disconnected one-off scripts.

## Non-Goals

This branch is not currently intended to:

- replace or rewrite the existing calendar, weather, mapMeta, or geo modules
- require every automated actor to be represented by a live token at all times
- force all trade simulation into literal six-second combat rounds
- create a perfect real-world economics simulator
- require all hostile interactions to become full tactical encounters
- rely on opaque script blobs as the main authoring path

## Proposed Future Module Boundaries

These names are provisional, but they reflect the current design direction.

### `fts_trade`

Potential responsibilities:

- trade goods
- market logic
- supply, demand, reserves, and dependency rules
- pricing and landed-value evaluation
- transaction resolution

### `fts_actors`

Potential responsibilities:

- actor templates
- actor instances
- role profiles
- behavior flags
- roll hooks
- cargo and treasury state

### `fts_scheduler`

Potential responsibilities:

- manual advancement
- auto-step control
- optional turn-order bridge
- step-scale management
- kill switches and safety guards

### Existing Module Relationships

The future modules should integrate with:

- `fts_calendar` for authoritative time
- `fts_weather` for weather and route-condition modifiers
- `fts_geo` for route and point identity, position, and travel structure
- `fts_core` for routing, help, shared UI, and menu integration

## Branch Success Criteria

This branch will be successful if it produces a design that:

- clearly defines the responsibilities of future trade-related modules
- preserves the existing FTS architecture instead of undermining it
- supports both NPC-based flavor and state-owned simulation
- allows meaningful interactions between agents, markets, and routes
- scales from simple use to advanced use
- keeps the GM informed about causes, not just results

## Suggested Phased Roadmap

### Phase 1: Branch Design Foundation

- define terminology
- define data families
- define ownership boundaries
- define UX standards for explanation and authoring

### Phase 2: Static Trade Schema

- define goods
- define market/map-point trade data
- define route trade metadata
- define actor templates and instances

### Phase 3: Manual Resolution

- allow the GM to inspect, set, and test markets and actors
- support manual single-step trade and interaction resolution
- validate explanation output

### Phase 4: Scheduled Resolution

- introduce a scheduler with manual advancement first
- add optional auto-step capability
- add safety controls and loop guards

### Phase 5: Turn-Order Integration

- allow turn order to act as an optional heartbeat for scripted actors
- preserve non-turn-order operation for broader campaign-scale simulation

### Phase 6: Advanced Interaction

- piracy
- escort behavior
- smuggling
- market knowledge spread
- rerouting
- shortages and substitution

## Immediate Next Design Tasks

Before implementation begins, this branch should define:

- the schema for a trade good
- the schema for a market-capable map point
- the schema for a trade actor template
- the schema for a live trade actor instance
- the schema for route threat and route economics
- the structure of an explanation log entry

## Closing Statement

This branch is the formal starting point for FTS's transition from a strong environmental and calendar framework into a living trade-and-interaction suite.

The goal is not complexity for its own sake.

The goal is a modular, customizable, well-commented system that can create believable movement, commerce, shortage, danger, and opportunity inside Roll20 while remaining understandable to the GM who runs it.
