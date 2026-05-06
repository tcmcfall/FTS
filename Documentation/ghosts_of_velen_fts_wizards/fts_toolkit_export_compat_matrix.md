# Hosted FTS Wizards Export Compatibility Matrix

Status: `v0.1.0-alpha.2`  
Scope: Hosted model -> `Tools/fts_toolkit_map_wizards` schema (`fts.mapEntity.v1`)

## Legend

- `Direct`: same shape/value contract.
- `Transform`: deterministic transformation required.
- `Hosted-only`: retained in hosted DB, not emitted in toolkit export.
- `Not supported`: cannot round-trip without schema changes.

## Root Envelope

| Hosted Field | Toolkit Field | Status | Rule |
|---|---|---|---|
| `schema_name` | `schema` | Transform | Emit literal `fts.mapEntity.v1`. |
| `entity_key` | `key` | Direct | Emit stable identifier. |
| `name` | `name` | Direct | Copy. |
| `entity_type` | `entityType` | Direct | Must be one of `mapRegion/mapLocale/mapPoint/mapRoute/mapAgent`. |
| `region_key` | `region` | Transform | Emit value; runtime lookup uses `region_lookup_key`. |
| `locale_key` | `locale` | Transform | Emit value; runtime lookup uses `locale_lookup_key`. |

## Shared Structures

| Hosted Structure | Toolkit Structure | Status | Rule |
|---|---|---|---|
| demographics KV rows | `demographics` object | Transform | Fold rows into object keys. |
| politics table | `politics` | Direct | Map `law_level` -> `lawLevel`, etc. |
| power profile table | `powerProfile` | Direct | Enforce 0-5 constraints in persistence layer. |
| entity-faction join | `majorFactions[]` | Transform | Emit normalized keys sorted ascending. |
| entity-religion join | `majorReligions[]` | Transform | Emit normalized keys sorted ascending. |
| entity-tag join | `tags[]` | Transform | Emit normalized keys sorted ascending. |

## Trade Compatibility

| Hosted Structure | Toolkit Structure | Status | Rule |
|---|---|---|---|
| Period-level trade rows (`period_key`, `stance`, `good`) | `tradeProfile.<season>.<stance>[]` | Transform | Aggregate period rows to season buckets, dedupe, sort. |
| `cargo_units`, `volume`, `price_modifier`, `notes` | none | Hosted-only | Preserved for fidelity and future import logic; omitted from toolkit entity export. |

## Relationship Compatibility

| Hosted Structure | Toolkit Structure | Status | Rule |
|---|---|---|---|
| Relationship matrix (`status`, `visibility`) | `relationships.allies[]`, `relationships.enemies[]` | Transform | Apply `fts_relationship_export_rules` deterministically. |
| statuses `neutral/tense/covert` | none | Hosted-only | Stored and queryable in hosted system, excluded from allies/enemies arrays. |

## Type-Specific Profiles

| Entity Type | Hosted Data | Toolkit Profile | Status | Rule |
|---|---|---|---|---|
| mapRegion | default locale + supported locales | `mapRegionProfile` | Direct+Transform | Emit locale array + default locale. |
| mapLocale | parent region + climate/environment | `mapLocaleProfile` | Direct | Copy mapped fields. |
| mapPoint | population/development/wealth/security | `mapPointProfile` | Direct | 1:1 map. |
| mapRoute | origin/destination/stops/distance | `mapRouteProfile` | Direct | 1:1 for shared baseline fields. |
| mapRoute segments | segment metadata + geometry | none | Hosted-only | Kept for route roadmap; omitted from current toolkit export. |
| mapAgent | size | `mapAgentProfile` | Direct | 1:1 map. |

## Deterministic Export Rules (Normative)

1. Emit exactly one type profile object for the selected `entityType`.
2. Sort every emitted string list lexicographically.
3. Exclude inactive entities.
4. Exclude relationship rows that fail visibility + export rule checks.
5. Reject export when required profile rows are missing.
6. Emit stable key casing based on contract and include lookup normalization in runtime ingestion path.

## Validation Gates

1. Hosted API schema validation.
2. Toolkit shape validation: `fts-toolkit entity validate-json-shape <file>`.
3. Snapshot tests proving deterministic output for unchanged source rows.

