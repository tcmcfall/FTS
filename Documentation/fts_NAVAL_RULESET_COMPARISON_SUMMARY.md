# FTS Naval Ruleset Comparison Summary

Date: 2026-05-07  
Scope: `Limithron's Guide to Naval Combat` vs `The Naval Code`  
Goal: define how FTS map-agent statistics can support drop-in use with either ruleset.

## 1) Executive Summary

Limithron and The Naval Code are both naval frameworks for 5e-style play, but they optimize for different outcomes.

- Limithron prioritizes speed, low cognitive load, and immediate table usability.
- The Naval Code prioritizes simulation detail, officer-role depth, and system-level campaign management.
- FTS should treat both as first-class targets by using a **shared core ship model** plus **ruleset-specific overlays**.

This means one map agent can be exported in either mode if FTS stores a superset of both systems' required fields.

## 2) Limithron Approach (Profile)

Core design direction:

- Fast, approachable ship combat.
- Ships behave like simplified monster stat blocks.
- Fewer tactical subsystems; focus on momentum and play speed.

Key characteristics:

- Tactical scale uses 50 ft hexes.
- Captain assigns Action Points each round.
- Characters support ship checks through action stations and sailing dice.
- Single primary ship HP model with conditions like `Stressed` and `Derelict`.
- Optional or lightweight wind handling.
- Simple ship table and streamlined ammo/attack options.

Best fit:

- Groups that want naval combat to run quickly without sacrificing cinematic moments.
- Campaigns where ship combat is recurring but not the full simulation focus.

## 3) The Naval Code Approach (Profile)

Core design direction:

- Comprehensive naval simulation with modular complexity tiers.
- Officer identity and ship operations are central gameplay loops.
- Rich tactical and campaign integration (crew, journeys, upgrades, casualties).

Key characteristics:

- Tactical scale uses 25 ft hexes.
- Officer-position model with role-specific actions and constraints.
- Detailed ship class framework (1st Rate, 2nd Rate, Unrated) with base and variant blocks.
- Multiple interacting durability systems: Ship HP, Rigging HP, Effective HP, Damage Threshold, Casualty Damage.
- Explicit movement, pilot checks, wind states, weather conditions, boarding procedures, and casualty charts.
- Broad customization economy for ships, siege weapons, and crew structure.

Best fit:

- Groups that want deep naval identity and operational realism.
- Campaigns centered on maritime strategy, logistics, and role specialization.

## 4) Side-by-Side Difference Matrix

| Dimension | Limithron | The Naval Code | FTS Map-Agent Impact |
|---|---|---|---|
| Design Priority | Fast, simple, cinematic | Detailed, modular, simulation-heavy | Need configurable fidelity level per export/profile |
| Tactical Grid | 50 ft hexes | 25 ft hexes | Store tactical scale as explicit ruleset property |
| Ship Taxonomy | Size + CR oriented ship roster | Class-centric naval architecture (1st/2nd/Unrated) plus many ship blocks | Support both `size_tier` and `naval_class` fields |
| Action Economy | Captain Action Points drive ship actions | Officer-based one-action flow on ship initiative | Support both AP pool and officer-action state |
| Officer Model | Action stations, lightweight specialization | Deep officer positions, travel roles, restricted action access | Add officer schema with role metadata and optional strictness |
| Movement Model | Streamlined forward movement + turning | Pilot checks, turn geometry, stop constraints, maneuver actions | Add movement policy profile and pilot-check metadata |
| Wind/Weather | Simple and optional wind effects | Multi-state wind + weather conditions with mechanical consequences | Add normalized wind/weather objects with ruleset transformers |
| Damage Model | Primarily single hull track + conditions | Hull + rigging + threshold + effective HP + casualties | Keep multi-pool durability model; down-convert for Limithron |
| Crew Model | Crew requirement mostly abstracted | Skilled/unskilled crew economy, casualties, staffing rules | Add crew composition and availability fields |
| Weapon Model | Simplified ship attacks + ammo variants | Full siege weapon ecosystem, gunners, load cycles, properties | Store weapon profiles as structured entities, not one damage string |
| Boarding | Simple transition toward close combat | Formal contested boarding pipeline and grapple state | Add boarding state machine for Naval Code; soft mode for Limithron |
| Travel Layer | Light travel abstraction | Formal journey cycle, travel roles, pace, night shift | Support optional travel subsystem block |
| Magic Integration | Minimal special treatment | Explicit movement/displacement interactions and edge rules | Add optional spell-interaction hooks per ruleset |
| Upgrade Depth | Basic ship customization concepts | Extensive enhancements/upgrades and compatibility constraints | Need upgrade compatibility matrix in map agent schema |
| Complexity Budget | Low-medium | Medium-high | Expose ruleset profile switch in authoring/export |

## 5) Compatibility Strategy for FTS

To remain drop-in for both systems, FTS should treat map agents as:

- A **shared naval core**
- Plus **Limithron adapter**
- Plus **Naval Code adapter**

### Shared Core (Required Baseline)

At minimum, map agents should preserve:

- Ship identity: `name`, `ship_type`, `faction`, `size_tier`
- Combat movement: `speed_tactical`, `turn_rules_profile`
- Survivability: `hull_hp_max`, `hull_hp_current`, `ac`
- Crew capacity: `crew_min`, `crew_max`, `crew_current`
- Weapons: array of structured weapon entries with range, damage, tags
- Ruleset metadata: `ruleset_profile`, `export_mode`, `fidelity_level`

### Naval Code Overlay (Additional Required Fields)

- `naval_class` (1st/2nd/Unrated)
- `damage_threshold`
- `effective_hp`
- `rigging_hp_max`, `rigging_hp_current`
- `casualty_damage_round`
- Officer allocation and role permissions
- Boarding bonus and boarding state
- Travel pace + journey role support

### Limithron Overlay (Additional Required Fields)

- Captain AP budget fields
- Action-station support
- `stressed` / `derelict` conditions
- Simplified ammo mode and chain/grape modifiers

## 6) Highest-Risk Divergence Areas

These are the highest-risk translation points between systems:

- Hull-only durability vs multi-pool durability (hull/rigging/effective/casualties).
- AP-based command economy vs officer-action economy.
- Lightweight crew abstraction vs casualty-driven crew operations.
- Simple fire arcs vs formal field-of-fire and target-type logic.
- Optional wind model vs condition-heavy movement simulation.

If these are modeled natively in FTS core, both exports become straightforward. If not, conversion logic will be brittle.

## 7) Implementation Guidance (Practical)

For lowest engineering effort with highest compatibility:

1. Build one canonical FTS naval entity model as a superset.
2. Add `ruleset_profile` transformers for Limithron and Naval Code exports.
3. Keep advanced Naval Code properties nullable so Limithron authoring stays lightweight.
4. Validate exports with ruleset-specific checks instead of forcing one strict authoring flow.

This keeps the FTS user experience fast while preserving full-fidelity support for deeper naval campaigns.
