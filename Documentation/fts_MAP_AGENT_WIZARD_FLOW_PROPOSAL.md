# FTS Map Agent Wizard Flow Proposal

Status: proposed  
Version target: `v0.1.0-alpha.3` planning baseline  
Date: 2026-05-07

## 1. Purpose

Define a practical, implementation-ready `mapAgent` wizard flow that:

- uses short question/prompt steps
- standardizes tiered responses to `0-5` wherever possible
- uses multi-select checkboxes for plural traits
- stays aligned with current FTS architecture and roadmap direction
- supports both lightweight and naval-heavy campaigns
- remains token-agnostic in online authoring

## 2. Current State Review

## 2.1 Roll20 wizard state

- `Map Agent Wizard` is present in the launcher list but currently inactive.
- `Map Point Wizard` is the only active authoring wizard and already uses section-driven flow and controlled-choice libraries.

Reference:

- `Modules/Wizards/fts_wizards_0.1.0-alpha.1.js`
- `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js`

## 2.2 Toolkit CLI state

- `mapAgent` creation currently captures only one agent-specific field: `size`.
- Shared fields exist (`politics`, `power_profile`, seasonal trade, tags), but no actor-focused questions yet.

Reference:

- `Tools/fts_toolkit_map_wizards/fts_toolkit/wizards/map_wizards.py`
- `Tools/fts_toolkit_map_wizards/fts_toolkit/schemas/map_entities.py`

## 2.3 Existing direction already documented

Current FTS docs already point toward richer agent authoring:

- actor type, home/base, operating region, cargo intent
- risk posture, threat response, weather/enforcement sensitivity
- roll profile and future route/scheduler integration

Reference:

- `Documentation/fts_WIZARD_SYSTEM_IMPLEMENTATION_PLAN.md`
- `Documentation/fts_TRADE_AGENT_INTERACTION_BRANCH_CHARTER.md`
- `Documentation/fts_NAVAL_RULESET_COMPARISON_SUMMARY.md`

## 3. Refinement Decisions

1. Keep one shared wizard shell: `start -> basic -> advanced -> review -> export`.
2. Make `Basic` path usable in under 3 minutes.
3. Use `0-5` canonical scales for posture/capability fields.
4. Use checkboxes for plural fields (roles, cargo classes, route preferences, threat sources, relationships).
5. Support both non-naval and naval actors through profile overlays, not separate incompatible wizards.
6. Preserve deterministic export behavior and strict save validation.
7. Do not require token selection in the online wizard.

## 4. Canonical 0-5 Tier Labels

Use one shared family across fields unless explicitly overridden:

| Value | Label | Meaning |
|---|---|---|
| 0 | none | Absent or not applicable |
| 1 | low | Minimal capability or impact |
| 2 | modest | Functional but limited |
| 3 | standard | Baseline expected capability |
| 4 | high | Strong above-average capability |
| 5 | extreme | Dominant or specialized peak |

Field-specific help text should explain how the same `0-5` scale applies to that concept.

## 5. Proposed Wizard Flow

## Step 0: Start Context (No Token Binding)

Prompt type: single select + auto-detect

Questions:

- Start a new `mapAgent` draft?
- Resume an existing draft by key?

Save-blocking checks:

- GM permission
- unique key validity
- required context availability (region/locale libraries)

## Step 1: Agent Class + Template (Basic)

Prompt type: single select

Questions:

- `actor_class`: `merchant`, `pirate`, `escort`, `smuggler`, `caravan`, `patrol`, `monster`, `faction_proxy`
- `platform_type`: `ship`, `overland`, `static_network`, `mixed`
- `template`: narrowed by class + platform

Notes:

- Template pre-seeds defaults for posture, cargo classes, and movement behavior.

## Step 2: Identity + Operating Base (Basic)

Prompt type: short text + single select

Questions:

- `name` (required)
- `key` (auto-normalized, editable)
- `home_point_key` (single select)
- `operating_region` (single select)
- `operating_locale` (single select with custom locale support)

## Step 3: Core Role and Intent (Basic)

Prompt type: multi-select checkboxes

Questions:

- `primary_roles[]` (choose 1-3):
  - `hauler`, `broker`, `speculator`, `raider`, `enforcer`, `scout`, `blockade_runner`, `convoy_support`
- `cargo_intent[]`:
  - `bulk_staples`, `luxury`, `military`, `contraband`, `passengers`, `mixed`
- `trade_stance[]`:
  - `profit_first`, `stability_first`, `faction_loyalty`, `survivalist`

## Step 4: Posture Scales (Basic, 0-5)

Prompt type: tiered selectors

Questions:

- `risk_tolerance` (0-5)
- `threat_response` (0-5)
- `enforcement_sensitivity` (0-5)
- `weather_sensitivity` (0-5)
- `knowledge_range` (0-5)
- `diplomatic_bias` (0-5, low = hostile, high = cooperative)

## Step 5: Capacity and Resources (Basic)

Prompt type: mixed (0-5 + numeric + multi-select)

Questions:

- `cargo_capacity_tier` (0-5)
- `treasury_tier` (0-5)
- `crew_readiness` (0-5)
- `maintenance_reliability` (0-5)
- `current_load_state` (0-5)
- `cargo_classes[]` multi-select from canonical goods categories

## Step 6: Movement + Route Preferences (Basic)

Prompt type: multi-select + tiered selectors

Questions:

- `route_preferences[]`:
  - `shortest_time`, `lowest_risk`, `highest_margin`, `faction_safe`, `weather_safe`, `law_avoidant`
- `operational_range_tier` (0-5)
- `schedule_rigidity` (0-5)
- `reroute_willingness` (0-5)

## Step 7: Threat and Interaction Rules (Advanced-default collapsed)

Prompt type: multi-select + tiered selectors

Questions:

- `threat_sources[]`:
  - `piracy`, `patrols`, `storms`, `scarcity`, `warfare`, `monsters`
- `escort_dependence` (0-5)
- `intercept_readiness` (0-5)
- `stealth_emphasis` (0-5)
- `retreat_threshold` (0-5)

## Step 8: Relationships and Alignment (Advanced-default collapsed)

Prompt type: multi-select checkboxes

Questions:

- `major_factions[]`
- `allies[]`
- `enemies[]`
- `neutral_watchlist[]` (hosted-only if not in current toolkit schema)

## Step 9: Ruleset Overlay (Advanced-default collapsed)

Prompt type: single select + conditional fields

Questions:

- `ruleset_profile`: `standard`, `limithron`, `naval_code`, `hybrid`

Conditional overlays:

- For `limithron`: AP/action-station fields
- For `naval_code`: class, rigging, threshold, casualty, officer-role fields
- For `hybrid`: superset with export profile switch

## Step 10: Review + Save

Prompt type: generated summary + explicit confirmation

Review must show:

- identity and base
- role and cargo intent
- `0-5` posture matrix
- top route preferences
- threat model and relationships
- overlay mode and export implications
- hard validation errors and soft warnings

Save writes:

- canonical authoring payload
- deterministic normalized keys
- audit-safe change record

## Step 11: Export and Roll20 Handoff

Prompt type: explicit export action

Export options:

- `Copy JSON`
- `Download JSON`
- `Copy Compact JSON for GM Notes`

Handoff guidance:

- Online wizard does not bind or write Roll20 tokens directly.
- GM pastes exported JSON into the target token's GM notes in Roll20.
- Optional future utility may automate paste/parse, but authoring remains decoupled.

## 6. Proposed Field Model (Map Agent v1)

## 6.1 Required basic fields

- `actor_class`
- `platform_type`
- `home_point_key`
- `operating_region`
- `operating_locale`
- `risk_tolerance`
- `threat_response`
- `cargo_capacity_tier`
- `crew_readiness`

## 6.2 Required scale fields (`0-5`)

- `risk_tolerance`
- `threat_response`
- `enforcement_sensitivity`
- `weather_sensitivity`
- `knowledge_range`
- `diplomatic_bias`
- `cargo_capacity_tier`
- `treasury_tier`
- `crew_readiness`
- `maintenance_reliability`
- `current_load_state`
- `operational_range_tier`
- `schedule_rigidity`
- `reroute_willingness`
- `escort_dependence`
- `intercept_readiness`
- `stealth_emphasis`
- `retreat_threshold`

## 6.3 Multi-select fields

- `primary_roles[]`
- `cargo_intent[]`
- `trade_stance[]`
- `cargo_classes[]`
- `route_preferences[]`
- `threat_sources[]`
- `major_factions[]`
- `allies[]`
- `enemies[]`

## 7. Validation Rules

## 7.1 Hard rules (save-blocking)

1. Required fields present.
2. All scale fields constrained to integer `0-5`.
3. `allies` and `enemies` cannot overlap.
4. `ship` platform requires at least one maritime-compatible route preference.
5. `ruleset_profile=naval_code` requires naval overlay minimums.

## 7.2 Soft rules (warning only)

1. High `risk_tolerance` with low `crew_readiness`.
2. High `current_load_state` with low `maintenance_reliability`.
3. High `weather_sensitivity` and weather-exposed route preference bias.
4. Hostile posture with no escape/retreat capacity.

## 8. Toolkit Alignment Path

Current toolkit `mapAgentProfile` supports only:

- `size`

Recommended evolution:

1. Add `MapAgentProfile` v2 fields matching sections 6-7.
2. Keep deterministic export to `fts.mapEntity.v1`.
3. Treat unsupported hosted-only fields as explicit non-exported metadata until schema is upgraded.

## 9. Implementation Order (Small, Safe Steps)

1. Add canonical option libraries for agent classes, roles, and preferences.
2. Implement wizard `start` and `basic` path only.
3. Add `0-5` posture fields and hard validation.
4. Add advanced threat/relationship sections.
5. Add ruleset overlay section and conditional validation.
6. Add review summary, export handoff step, and deterministic export tests.

This order keeps early deliverables usable while avoiding disruptive rewrites.
