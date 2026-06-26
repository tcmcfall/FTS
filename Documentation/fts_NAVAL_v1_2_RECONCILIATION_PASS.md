# FTS Naval v1.2 Reconciliation Pass

Status: Draft for implementation
Scope: Reconcile naming, class mappings, and standardized stat bands across:
- `FTS_Naval_Ruleset_Integration_v1_1.docx`
- `FTSA_Naval_Integration_Roadmap_v1_REFRESHED.docx`
- `fts_ship_match_matrix.xlsx`
- `ship_classification_comparison_limithron_vs_naval_code_RECREATED.xlsx`

## 1) Canonical Naming Normalization Rules (v1.2)

### 1.1 Product and Ruleset Naming
- Canonical product name in prose: `FTS Naval`
- Disallowed variants in canonical documents: `FTSA Naval`, `FTS_Naval`, `FTS naval`

### 1.2 Schema ID Pattern
- Canonical schema ID pattern: `fts.camelCase.version`
- Required regex: `^fts\.[a-z][a-zA-Z0-9]*\.v[0-9]+$`
- Canonical examples:
  - `fts.ship.v1`
  - `fts.fleet.v1`
  - `fts.route.v1`
  - `fts.tradeProfile.v1`
  - `fts.navalEncounter.v1`
  - `fts.weatherState.v1`

### 1.3 Ship Name Canonicalization
- Canonical rate format: `1st Rate`, `2nd Rate`, `3rd Rate`, `4th Rate`, `5th Rate`, `6th Rate`
- Canonical family names:
  - `Man-O-War` (normalize `Man - O - War`, `Man o' War`)
  - `Half-Galley` (normalize `Half - Galley`)
  - `Ship of the Line` (title case, no abbreviations in canonical docs)
  - `Ketch` (normalize `Kelch`)

### 1.4 Data Key Naming
- JSON keys: lower camelCase
- Keep these canonical keys from the ruleset draft:
  - `officerStations`, `powerProfile`, `tradeProfile`, `specialRules`
- Disallow snake_case or hyphenated keys in canonical schemas.

## 2) Exact Corrected Class Mappings

### 2.1 Conflict Corrections (Old -> New)
- `Cutter`: from Naval Code `Unrated` classification -> canonical `Small Craft`
- `Schooner`: from Naval Code `2nd Rate` representation -> canonical `Unrated`
- `Brig`: from Naval Code `2nd Rate` representation -> canonical alias of `Brigantine` in `Unrated`
- `Kelch`: canonicalized to `Ketch` in `Unrated`
- `Man - O - War` and `Man o' War`: canonicalized to `Man-O-War`
- `Pink`: from Naval Code `1st Rate` representation -> canonical `Unrated` merchant analog
- `Frigate`: from mixed `Large`/`2nd Rate` source labels -> canonical `6th Rate` baseline

### 2.2 Canonical Ship Crosswalk (All Distinct Source Ships)

| Source Ship Name | Canonical Ship Name | Canonical Class | Base Canonical Rate | Allowed Rate Band |
|---|---|---|---|---|
| Raft | Raft | Small Craft | Small Craft | Small Craft |
| Canoe | Canoe | Small Craft | Small Craft | Small Craft |
| Rowboat | Rowboat | Small Craft | Small Craft | Small Craft |
| Piragua | Piragua | Small Craft | Small Craft | Small Craft |
| Longboat | Longboat | Small Craft | Small Craft | Small Craft |
| Half - Galley | Half-Galley | Small Craft | Small Craft | Small Craft |
| Cutter | Cutter | Small Craft | Small Craft | Small Craft |
| Braque | Braque | Unrated | Unrated | Unrated |
| Brigantine | Brigantine | Unrated | Unrated | Unrated |
| Brig | Brigantine (Alias) | Unrated | Unrated | Unrated |
| Corvette | Corvette | Unrated | Unrated | Unrated |
| Dhow | Dhow | Unrated | Unrated | Unrated |
| Ketch | Ketch | Unrated | Unrated | Unrated |
| Kelch | Ketch (Alias) | Unrated | Unrated | Unrated |
| Schooner | Schooner | Unrated | Unrated | Unrated |
| Sloop | Sloop | Unrated | Unrated | Unrated |
| Tartane | Tartane | Unrated | Unrated | Unrated |
| Carvel | Carvel | Unrated | Unrated | Unrated |
| Pink | Pink | Unrated | Unrated | Unrated |
| Flute | Flute | Rated | 6th Rate | Unrated-6th |
| Frigate | Frigate | Rated | 6th Rate | 6th-5th |
| Clipper | Clipper | Rated | 6th Rate | Unrated-6th |
| 6th Rate Man o' War | Man-O-War | Rated | 6th Rate | 6th-5th |
| Galley | Galley | Rated | 5th Rate | 6th-5th |
| 5th Rate Man o' War | Man-O-War | Rated | 5th Rate | 5th-4th |
| 4th Rate Ship of the Line | Ship of the Line | Rated | 4th Rate | 4th-3rd |
| Trade Galleon | Galleon (Trade) | Rated | 4th Rate | 5th-3rd |
| 3rd Rate Ship of the Line | Ship of the Line | Rated | 3rd Rate | 3rd-2nd |
| War Galleon | Galleon (War) | Rated | 3rd Rate | 4th-2nd |
| Galleon | Galleon | Rated | 3rd Rate | 3rd-1st |
| Carrack | Carrack | Rated | 3rd Rate | 3rd-2nd |
| Man - O - War | Man-O-War | Rated | 3rd Rate | 3rd-1st |
| 2nd Rate Ship of the Line | Ship of the Line | Rated | 2nd Rate | 2nd-1st |
| East Indiaman | East Indiaman | Rated | 2nd Rate | 2nd-1st |
| Merchant | Merchant | Rated | 2nd Rate | 2nd-1st |
| Guineaman | Guineaman | Rated | 2nd Rate | 2nd-1st |
| Junk | Junk | Rated | 2nd Rate | 2nd-1st |
| 1st Rate Ship of the Line | Ship of the Line | Rated | 1st Rate | 1st |

Implementation rule: if two source rows disagree, canonical value above wins and source value is retained only as `sourceLabel`.

## 3) Standardized Stat-Range Adjustments (v1.2)

These adjustments reconcile v1.1 ranges with the spreadsheet-derived ship examples, especially the Unrated/Large crossover and Naval Code compressed-rate source bands.

### 3.1 Hull HP (Canonical)

| Band | v1.1 | v1.2 |
|---|---|---|
| Small Craft | 20-60 | 20-80 |
| Unrated | 60-120 | 80-160 |
| 6th Rate | 120-180 | 140-220 |
| 5th Rate | 180-240 | 210-300 |
| 4th Rate | 240-320 | 280-380 |
| 3rd Rate | 320-420 | 360-480 |
| 2nd Rate | 420-520 | 460-620 |
| 1st Rate | 520-700 | 620-800 |

### 3.2 Rigging HP (Canonical)

| Band | v1.1 | v1.2 |
|---|---|---|
| Small Craft | 10-20 | 0-20 |
| Unrated | 20-40 | 30-60 |
| 6th Rate | 40-60 | 50-80 |
| 5th Rate | 60-80 | 70-110 |
| 4th Rate | 80-100 | 90-140 |
| 3rd Rate | 100-140 | 120-180 |
| 2nd Rate | 140-180 | 160-220 |
| 1st Rate | 180-240 | 210-300 |

### 3.3 Damage Threshold (Canonical)

| Band | v1.1 | v1.2 |
|---|---|---|
| Small Craft | 0 | 0 |
| Unrated | 5 | 6 |
| 6th Rate | 8 | 9 |
| 5th Rate | 10 | 11 |
| 4th Rate | 12 | 13 |
| 3rd Rate | 15 | 16 |
| 2nd Rate | 18 | 19 |
| 1st Rate | 22 | 23 |

### 3.4 Cargo Units (CU)

| Band | v1.1 | v1.2 |
|---|---|---|
| Small Craft | 1-5 | 1-8 |
| Unrated | 5-20 | 10-30 |
| 6th Rate | 20-40 | 25-50 |
| 5th Rate | 40-60 | 50-80 |
| 4th Rate | 60-90 | 80-120 |
| 3rd Rate | 90-140 | 120-180 |
| 2nd Rate | 140-220 | 180-280 |
| 1st Rate | 220-350 | 280-420 |

### 3.5 AP and Tactical Speed
- AP scale unchanged (v1.1 retained): `1,2,3,4,5,6,7,8` by band.
- Tactical speed scale unchanged (v1.1 retained) and should be tuned per hull profile, not per source label.

### 3.6 Crew Baseline Bands (Added for v1.2 Consistency)

| Band | Min Crew | Optimal Crew | Max Crew |
|---|---|---|---|
| Small Craft | 1 | 3 | 8 |
| Unrated | 8 | 20 | 40 |
| 6th Rate | 16 | 32 | 55 |
| 5th Rate | 24 | 48 | 80 |
| 4th Rate | 40 | 70 | 120 |
| 3rd Rate | 55 | 100 | 170 |
| 2nd Rate | 70 | 140 | 260 |
| 1st Rate | 100 | 220 | 400 |

## 4) Required v1.2 Textual Corrections in Existing Drafts

### 4.1 Ruleset v1.1 Example Ship Correction
`Standardized Example: Cape Velen Armed Brigantine` currently conflicts with Unrated/AP bands in the same document.

Recommended corrected baseline:
- Classification: `Unrated`
- Hull HP: `140` (fits v1.2 Unrated band 80-160)
- Rigging HP: `50` (fits v1.2 Unrated band 30-60)
- Damage Threshold: `6`
- AP: `2` (not `3`)
- Speed: `5`
- Cargo Capacity: `24 CU`
- Crew: `18 / 32 / 55`

### 4.2 Roadmap Naming Correction
- Replace all `FTSA Naval` references with `FTS Naval`.
- Keep schema IDs consistent with `fts.camelCase.version`.

## 5) Migration Rules for Data Files

- Add two explicit columns to all ship matrices:
  - `canonicalShipName`
  - `canonicalRate`
- Preserve original source terminology in:
  - `sourceShipName`
  - `sourceClassificationOrRate`
- Add `normalizationRuleId` per row (example: `NR-MANOWAR-001`, `NR-KELCH-001`) for auditability.
- Enforce canonical naming and class mappings as import-time validation constraints.

## 6) Acceptance Criteria for v1.2 Reconciliation Completion

- No unresolved alias names remain in canonical fields.
- All rows in both spreadsheets map to one canonical ship name and one canonical base rate.
- No ship example violates its class band for Hull HP, Rigging HP, Damage Threshold, AP, or CU.
- All schemas conform to `fts.camelCase.version`.
- All prose uses `FTS Naval`.
