# Ghosts of Velen / Fantasy Trade Simulator
## Online FTS Wizards Development & Deployment Plan

Version: `0.1.0-alpha.2`  
Date: `2026-05-06`  
Target platform: `ghostsofvelen.com`  
Target stack: `PHP 8.3`, `MariaDB 10.11`, `React + Vite + TypeScript`

## 1. Executive Summary

This alpha.2 plan fully replaces alpha.1 and resolves the six review findings with explicit, line-referenced replacements, a concrete migration set, and a formal export compatibility matrix against the current `fts_toolkit_map_wizards` schema.

The hosted platform remains an authoring and configuration workbench. Roll20 remains the runtime consumer. The hosted system persists canonical campaign authoring data, validates and exports deterministic FTS JSON, and supports future import alignment without reintroducing removed `nationState` concepts.

## 2. Scope and Non-Scope

### 2.1 In Scope

- Hosted authenticated wizard workspace under `ghostsofvelen.com/fts`.
- Authoring for `mapRegion`, `mapLocale`, `mapPoint`, `mapRoute`, `mapAgent`.
- Period-fidelity trade storage across Harptos periods/festivals with seasonal derivation for toolkit-compatible export.
- Reusable libraries for trade, factions, religions, relationships, tags, and content packs.
- Deterministic export generation for `fts.mapEntity.v1` and `fts.contentPack.v1`.
- Audit-complete operations covering create/update/delete/export/import/login/logout/migration events.
- Development, test, deployment, backup, and restore workflow.

### 2.2 Out of Scope for Initial Hosted Alpha

- Live Roll20 API synchronization.
- Multi-tenant public SaaS operations.
- Payments, licensing, or marketplace functionality.
- Replacing Roll20 runtime modules.
- Reintroducing `nationState`.

## 3. FTS Alignment Contracts (Normative)

1. Runtime ownership: hosted system does not replace runtime modules.
2. Entity hierarchy: only `mapRegion`, `mapLocale`, `mapPoint`, `mapRoute`, `mapAgent`.
3. Key normalization bridge:
   - Export-facing keys remain stable identifiers.
   - Lookup keys are stored as lowercase-alphanumeric values and are authoritative for runtime matching.
4. Locale extensibility:
   - Canonical locale families remain supported (`offshore`, `coastal`, `inland`, `underwater`, `underdark`).
   - Custom locale keys are allowed and retained.
5. Trade fidelity:
   - Period-level trade (month/festival granularity) is canonical in hosted storage.
   - Seasonal `has/wants/needs` export arrays are derived deterministically.
6. Relationship determinism:
   - Relationship matrix exports to allies/enemies via explicit mapping rules.
7. Route forward-compatibility:
   - Baseline route profile stays toolkit-compatible.
   - Segment-level route data is stored for roadmap alignment.

## 4. Architecture and Technology Decisions

- Frontend:
  - React + Vite + TypeScript.
  - Strict typed API client contracts.
  - Schema-driven validation for wizard input.
- API:
  - PHP 8.3 with explicit DTO validation.
  - Prepared statements only.
  - Transaction-bounded writes for entity graph updates.
- Database:
  - MariaDB 10.11 with strict FK, CHECK, and indexing discipline.
  - Deterministic lookup-key indexes.
- Operational quality:
  - Request IDs propagated through API and audit logs.
  - Deterministic export sorting and payload hashing (`SHA-256`).

## 5. Canonical Export Contract

Toolkit-compatible entity export target remains `fts.mapEntity.v1`.

Example payload shape:

```json
{
  "schema": "fts.mapEntity.v1",
  "key": "oakbottom",
  "name": "Oakbottom",
  "entityType": "mapPoint",
  "region": "landsofintrigue",
  "locale": "inland",
  "demographics": {},
  "politics": { "government": "villageCouncil", "stability": 4, "lawLevel": 3, "corruptionLevel": 1 },
  "majorFactions": [],
  "majorReligions": ["chauntea", "waukeen"],
  "powerProfile": { "offense": 1, "defense": 2, "aggression": 0, "projection": "local", "mobility": 1 },
  "tradeProfile": {
    "spring": { "has": ["whiskey"], "wants": ["tools"], "needs": ["grain"] },
    "summer": { "has": ["whiskey"], "wants": [], "needs": [] },
    "autumn": { "has": ["whiskey"], "wants": ["barrels"], "needs": [] },
    "winter": { "has": ["whiskey"], "wants": ["coal"], "needs": ["grain"] }
  },
  "relationships": { "allies": [], "enemies": [] },
  "tags": [],
  "mapPointProfile": { "population": 420, "development": 2, "wealth": 3, "security": 2 }
}
```

## 6. Database Plan and Migration Set

Migration files:

1. `Documentation/ghosts_of_velen_fts_wizards/migrations/001_core.sql`
2. `Documentation/ghosts_of_velen_fts_wizards/migrations/002_libraries.sql`
3. `Documentation/ghosts_of_velen_fts_wizards/migrations/003_relationships.sql`
4. `Documentation/ghosts_of_velen_fts_wizards/migrations/004_exports_audit.sql`

### 6.1 Core Corrections in Alpha.2

- `locale_key` is now extensible (`VARCHAR`) with optional `canonical_locale_group`.
- Explicit `entity_lookup_key`, `region_lookup_key`, `locale_lookup_key` added.
- Trade entries store `period_key` fidelity rather than season-only records.
- Route segment storage added to avoid near-term schema rewrites.
- Relationship export mapping table introduced for deterministic allies/enemies projection.
- Export and audit schemas completed and FK-consistent with declared model.

## 7. API Endpoint Plan

- `POST /api/fts/auth/login` authenticate.
- `POST /api/fts/auth/logout` terminate session.
- `GET /api/fts/health` authenticated service health.
- `GET /api/fts/entities` list entities with filters.
- `POST /api/fts/entities` create entity graph.
- `GET /api/fts/entities/{id}` read entity graph.
- `PUT /api/fts/entities/{id}` update entity graph.
- `DELETE /api/fts/entities/{id}` deactivate entity.
- `POST /api/fts/exports/entity/{id}` generate entity export artifact.
- `POST /api/fts/exports/content-pack/{id}` generate content pack export artifact.

## 8. Security Requirements

- Session-based auth with strong password hashing.
- Server-side authorization on every state-changing endpoint.
- CSRF required for state-changing requests.
- Prepared statements for all SQL.
- Import validation for JSON payloads before persistence.
- Rate limits for login/import endpoints.
- Secrets outside web root and outside Git.
- Full audit logging for create/update/delete/export/import/auth/migration actions.

## 9. Deployment Plan (Ionos)

### 9.1 Pre-Deployment

1. Confirm PHP 8.3, DB connectivity, SSL, and non-public secrets.
2. Create full file + DB backup.
3. Build frontend locally and deploy build artifacts only.

### 9.2 Deployment Steps

1. Deploy `/fts/` frontend and `/api/fts/` backend paths.
2. Apply migrations in strict order: `001`, `002`, `003`, `004`.
3. Seed campaign/admin/canonical periods and baseline libraries.
4. Run smoke tests (auth, CRUD, save/reload, export, audit writes).
5. Tag deployed commit.

## 10. Testing Strategy and Gates

- Migration gate: apply cleanly on empty and seeded DB.
- Contract gate: exports validate against toolkit schema.
- Determinism gate: unchanged source data yields stable JSON and hash.
- Fidelity gate: month/festival CU data round-trips without loss.
- Security gate: unauthenticated and CSRF-invalid requests blocked.
- Regression gate: public Ghosts of Velen pages remain intact.

## 11. Phased Roadmap

- Phase 0: this document approved and contracts locked.
- Phase 1: core migrations + API skeleton + mapPoint create/read.
- Phase 2: mapPoint wizard with period-level trade fidelity.
- Phase 3: mapRegion/mapLocale/mapRoute/mapAgent wizard coverage.
- Phase 4: library management + relationship matrix + export/audit verification.
- Phase 5: content pack import/export hardening.
- Phase 6: runtime import alignment validation.

## 12. Immediate Next Development Tasks

1. Create branch: `codex/fts-online-wizards`.
2. Apply and test migrations `001_core` -> `004_exports_audit`.
3. Implement `/api/fts/health` + auth bootstrap.
4. Implement mapPoint create/read/export transaction path.
5. Implement period-level trade editor and seasonal export derivation.
6. Add automated toolkit-compat validation in CI.

## 13. Hosted Alpha Acceptance Criteria

1. Admin can log in/log out.
2. Admin can create/save/reload mapPoint with period-level trade fidelity.
3. Admin can export valid `fts.mapEntity.v1` JSON.
4. Export excludes `nationState`.
5. Relationship matrix derives allies/enemies deterministically per mapping rules.
6. Public Ghosts of Velen pages remain fully functional.
7. Backup and restore runbook executed at least once pre-release.

## 14. Open Design Decisions

1. Route segment geometry representation (`WKT` only vs dual `WKT + GeoJSON`).
2. Audit snapshot strategy (full object vs field-level diff).
3. Alpha role model (`admin` only vs `admin/editor/viewer`).

## Appendix A. Exact Text Replacement Patch List (By Section/Line)

Source line references are from `ghosts_of_velen_fts_wizards_development_deployment_plan_extracted_allp.txt`.

1. Section 6, line 143:
   - Replace: `"region": "landsOfIntrigue"`
   - With: `"region": "landsofintrigue"` and explicit lookup-key normalization policy.
2. Section 7, lines 169-170:
   - Replace: `locale` fixed to five values only.
   - With: extensible locale string model plus canonical family classification.
3. Section 9, line 243:
   - Replace: `locale_key ENUM('offshore','coastal','inland','underwater','underdark') NOT NULL`
   - With: `locale_key VARCHAR(120) NOT NULL` and `canonical_locale_group ENUM(...) NULL`.
4. Section 9, line 244:
   - Replace: season-only trade persistence.
   - With: period-keyed trade persistence with CU fidelity.
5. Sections 8-9, lines 187-244:
   - Replace: partial/inconsistent model-vs-DDL baseline.
   - With: complete four-file migration chain and FK-consistent dependency order.
6. Section 13, lines 350-353:
   - Replace: non-deterministic relationship derivation.
   - With: explicit relationship export mapping table (`fts_relationship_export_rules`).
7. Section 6, line 158:
   - Replace: route profile limited to origin/destination/stops/distance only.
   - With: baseline route profile plus hosted segment-level route table for roadmap alignment.
8. Section 15, line 382:
   - Replace: branch strategy anchored to `feature/*`.
   - With: implementation branch `codex/fts-online-wizards` for this workstream.
9. Section 14, lines 378-379:
   - Replace: audit concept only.
   - With: concrete `fts_audit_log` schema with request tracing and JSON snapshot fields.
10. Section 21, line 497:
    - Replace: advisory CLI validation note.
    - With: mandatory automated export compatibility gate against toolkit schema.

## Appendix B. Migration File Manifest

- `Documentation/ghosts_of_velen_fts_wizards/migrations/001_core.sql`
- `Documentation/ghosts_of_velen_fts_wizards/migrations/002_libraries.sql`
- `Documentation/ghosts_of_velen_fts_wizards/migrations/003_relationships.sql`
- `Documentation/ghosts_of_velen_fts_wizards/migrations/004_exports_audit.sql`

## Appendix C. Formal Export Compatibility Matrix

See:

- `Documentation/ghosts_of_velen_fts_wizards/fts_toolkit_export_compat_matrix.md`

