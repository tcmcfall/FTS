# FTS MapAgent 5e Standardization

Status: draft  
Date: 2026-05-07

## 1. Objective

Standardize `mapAgent` attributes to be formal or 5e-adjacent so that:

- GMs can read agents as familiar 5e stat blocks
- FTS logic remains deterministic and configurable
- Limithron and Naval Code overlays remain compatible

## 2. Canonical Field Groups

## 2.1 Universal Core

Required for every `mapAgent`:

- `actor_class`
- `platform_type`
- `home_point_key`
- `operating_region`
- `operating_locale`
- `ruleset_profile`

## 2.2 5e Stat-Block Core

Use standard 5e semantics:

- `armor_class`
- `hit_points_max`
- `hit_points_current`
- `hit_dice`
- `proficiency_bonus`
- `challenge_rating`
- `initiative_bonus`
- `passive_perception`
- `abilities`:
  - `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`
- `speeds`:
  - `walk`, `swim`, `fly`

Optional but recommended:

- `saving_throw_proficiencies[]`
- `skill_proficiencies[]`
- `senses[]`
- `languages[]`

## 2.3 Vehicle/Ship Adjacent Core

For naval and transport agents:

- `damage_threshold`
- `crew_min`
- `crew_max`
- `crew_current`
- `passengers_capacity`
- `cargo_capacity_tons`

## 2.4 Behavior and Simulation Core (`0-5`)

The following are FTS-native but 5e-adjacent control fields:

- `risk_tolerance`
- `threat_response`
- `enforcement_sensitivity`
- `weather_sensitivity`
- `knowledge_range`
- `diplomatic_bias`
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

## 3. 0-5 Tier Meaning

| Tier | Label | Operational Meaning |
|---|---|---|
| 0 | none | absent or effectively non-functional |
| 1 | low | weak, unreliable, narrow effect |
| 2 | modest | functional with clear limits |
| 3 | standard | baseline expected capability |
| 4 | high | strong and dependable |
| 5 | extreme | dominant, specialized, or elite |

## 4. 5e-Adjacent Interpretation Rules

1. Do not replace formal 5e stats with tier-only fields.
2. Treat tier fields as behavior controls layered on top of formal stats.
3. Keep ability scores raw (1-30), not just modifiers.
4. Keep AC/HP/speed values explicit and system-readable.
5. Use `ruleset_profile` adapters for format differences instead of rewriting source data.

## 5. Controlled Multi-Select Sets

To preserve consistency:

- `primary_roles[]`
- `cargo_intent[]`
- `route_preferences[]`
- `threat_sources[]`

These fields should only accept canonical tokens from shared libraries.

## 6. Profile Modes

- `standard`: generic 5e-adjacent FTS actor
- `limithron`: adds AP/action-station expectations
- `naval_code`: adds deeper crew/rigging/threshold expectations
- `hybrid`: superset mode, export-targeted at runtime

## 7. Validation Requirements

Hard validation:

- all `0-5` fields are integers in range
- `hit_points_current <= hit_points_max`
- `crew_min <= crew_max`
- `crew_current <= crew_max`
- `platform_type=ship` requires non-zero crew capacity

Soft warnings:

- high risk with low crew readiness
- high load with low maintenance
- high weather sensitivity with weather-exposed preferences

## 8. Migration Guidance

For legacy `mapAgentProfile(size)` records:

1. Set defaults for formal 5e core (`AC 10`, `HP 1`, `PB 2`, ability scores 10).
2. Set all posture tiers to `3`.
3. Keep `size` unchanged.
4. Prompt review/edit on next wizard open.

## 9. Online Wizard Handoff Model

For hosted/online authoring:

1. Wizard remains token-agnostic.
2. Wizard exports canonical JSON payload.
3. GM copies exported JSON into target token GM notes in Roll20.
4. Parsing/import behavior remains a separate runtime concern.
