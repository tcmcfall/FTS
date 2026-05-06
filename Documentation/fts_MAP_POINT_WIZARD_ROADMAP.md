# FTS Map Point Wizard Roadmap

Status: proposed implementation roadmap  
Date: 2026-04-24  
Owner: FTS GM + implementation branch maintainers

## 1. Purpose

This document provides a full, modular roadmap for Map Point Wizard evolution, with explicit **Adopt / Postpone / Reject** decisions, implementation steps, source-backed rationale, and a concrete end-state definition.

Primary goals:

1. Keep current wizard UX gains intact (iterative sections, compact lists, handout-based trade editing, Save/Exit behavior).
2. Align Map Point output with the standardized stat specification where it belongs to **point** scope.
3. Add strong validation and derivation without unauthorized placeholder logic or backward-compatibility shims.
4. Stay compliant with template, module, and standards contracts already active in FTS.

## 2. Scope And Assumptions

- This roadmap targets `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js` first.
- Related touchpoints are expected in:
  - `Modules/Wizards/fts_wizards_0.1.0-alpha.1.js`
  - `Modules/Core/fts_mapMeta_0.2.0-alpha.1.js`
  - `Modules/Core/fts_atlas_0.1.0-alpha.1.js`
  - `Documentation/` standards and help docs
- "Documents directory" is interpreted as repository `Documentation/` to match active project structure.

## 3. Source Corpus (Quoted Evidence)

## 3.1 Standards and project contracts

> "Avoid placeholder logic, unused scaffolds, and backward-compatibility shims that are not explicitly authorized."  
Source: `Documentation/fts_PROJECT_STANDARDS.md:129`

> "Template-compatible code must preserve the contracts in `Templates`."  
Source: `Documentation/fts_PROJECT_STANDARDS.md:143`

> "Wizard save must require the data needed to create a valid map point."  
Source: `Documentation/fts_PROJECT_STANDARDS.md:186`

> "Wizard reset must clear only the active wizard draft."  
Source: `Documentation/fts_PROJECT_STANDARDS.md:187`

> "Do not introduce migration shims unless the task explicitly authorizes backward compatibility."  
Source: `Documentation/fts_PROJECT_STANDARDS.md:201`

## 3.2 Canonical source policy

> "Canonical sources used by the shipped modules:"  
Source: `README.md:47`

> "S. John Ross, `medieval-demographics-made-easy.pdf`..."  
Source: `README.md:58`

## 3.3 Standardized stat system

> "All tags use snake_case."  
Source: `Documentation/fts_STANDARDIZED_STAT_SYSTEM_SPECIFICATION.docx` paragraph 18

> "All values are lowercase."  
Source: `Documentation/fts_STANDARDIZED_STAT_SYSTEM_SPECIFICATION.docx` paragraph 19

> "combat_power = offense_points + defense_points"  
Source: `Documentation/fts_STANDARDIZED_STAT_SYSTEM_SPECIFICATION.docx` paragraph 107

> "route_score = trade_attractiveness - route_threat + (risk_tolerance - 3)"  
Source: `Documentation/fts_STANDARDIZED_STAT_SYSTEM_SPECIFICATION.docx` paragraph 133

## 3.4 Proposed wizard improvements (instructional, not directive)

> "It defines structure, not authority."  
Source: `Documentation/fts_PROPOSED_WIZARD_IMPROVEMENTS.docx` paragraph 7

> "A constraint engine enforcing simulation validity"  
Source: `Documentation/fts_PROPOSED_WIZARD_IMPROVEMENTS.docx` paragraph 187

> "Add a strict validation + derivation layer..."  
Source: `Documentation/fts_PROPOSED_WIZARD_IMPROVEMENTS.docx` paragraph 244

## 3.5 Demographic heuristics (canonical reference)

> "range from 30 per square mile"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 1

> "will support around 180 people"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 3

> "one functioning castle for every 50,000 people"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 3

> "one law officer ... for every 150 citizens"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 5

> "one University for every 27.3 million people"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 5

> "Typically from 15-25 dwellings per acre"  
Source: `Documentation/medieval-demographics-made-easy.pdf` page 6

## 4. Current Wizard Baseline (Observed In Code)

Current strengths worth preserving:

1. Iterative section flow exists (`SECTION_SEQUENCE`, 17 sections).  
   Source: `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:60`
2. Bind-first workflow with clear token instruction text.  
   Source: `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:3672`
3. Trade categories are compact toggle lists and handout-driven.  
   Sources:  
   - `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:3006`  
   - `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:3108`
4. Offense/defense tier is derived from selected types.  
   Source: `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:2277`
5. Save writes structured notes and finalizes token state.  
   Sources:  
   - `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:3804`  
   - `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:3936`

Current gaps (relative to point spec and improvement critique):

1. Validation is mostly required-field checks, not cross-field simulation constraints.  
   Source: `Modules/Wizards/fts_mapPointWizard_0.2.0-alpha.1.js:2440`
2. Point spec fields missing from wizard/session/save:
   - `point_type`
   - `threat_rating`
   - `threat_behavior`
   - `influence_range`
   - `terrain`
   - `climate`
   - `seasonal_modifiers`
   - `trade_priority`
   - `combat_priority`
   - `risk_tolerance`
3. Some saved note keys are project-local aliases (`avg_population`, `development`, `wealth`) rather than strict spec forms (`population`, `development_level`, `wealth_level`).

## 5. Decision Ledger (Adopt / Postpone / Reject)

## 5.1 Adopt

### A1. Add missing point-spec fields to Map Point Wizard

- **What changes**: Add sections + storage + save serialization for missing point-level fields.
- **Why**: Standardized point block includes these fields; they are currently absent.
- **How**:
  1. Extend `defaultSessionData`, `snapshotData`, `mergeSnapshotIntoData`.
  2. Add chooser/step sections and field libraries.
  3. Add to review panel and GM note serialization.
- **Done when**:
  - Every point field from spec section 3 is represented either directly or as documented equivalent.
  - `buildGMNotesText` contains canonical point outputs.

### A2. Introduce a strict validation + derivation layer

- **What changes**: Replace single-pass required validation with rule-engine style validators.
- **Why**: Current model is structurally valid but under-constrained.
- **How**:
  1. Add `collectValidationFindings(session, context)` returning `{errors,warnings}`.
  2. Keep `validateAllRequired` as a thin wrapper that fails on `errors`.
  3. Expose warnings in review card (non-blocking unless marked hard).
- **Done when**:
  - Save is blocked by hard failures.
  - Warnings are visible and deterministic.

### A3. Enforce cross-field coherence rules for demographics/economy/combat

- **What changes**: Add hard and soft rules such as:
  - hard: `trade_has` cannot overlap `trade_needs` same category/period.
  - hard: required enum/range conformance.
  - soft: supply/demand imbalance advisories.
- **Why**: Prevent impossible or self-contradictory states while keeping authoring flexible.
- **How**:
  1. Build normalized helper views (`effectiveHas`, `effectiveNeeds`, `supplyScore`, `demandScore`).
  2. Add rule IDs and deterministic error text.
  3. Track justifications only where necessary (no placeholder flags).
- **Done when**:
  - Rules produce stable results from same input.
  - Review screen clearly shows every failing rule.

### A4. Keep offense/defense derived locking and formalize it

- **What changes**: Preserve derived tier behavior and formalize as non-editable derived fields.
- **Why**: Already aligned with "derived field locking" recommendation.
- **How**:
  1. Keep manual edit blocked for derived tiers.
  2. Document formula source and field ownership in code comments.
  3. Add tests for derivation determinism.
- **Done when**:
  - No command path can set offense/defense tier directly.

### A5. Use medieval demographics as advisory heuristics, not hard blockers

- **What changes**: Add advisory calculators for template defaults and warning cards.
- **Why**: Source is explicitly a simplified worldbuilding tool; best used for plausibility guidance.
- **How**:
  1. Add a `demographicAdvisor` helper with page-scoped/context-scoped estimates.
  2. Show advisory ranges in relevant sections (population/development/wealth/trade).
  3. Never block save solely on heuristic mismatch.
- **Done when**:
  - Wizard can present demographic guidance without forcing false precision.

### A6. Map-aware validation at point scope

- **What changes**: Validate selected fields against known map state where possible.
- **Why**: System-level sanity checks catch world incoherence early.
- **How**:
  1. Use current map records (`points/routes`) during review/save.
  2. Add warnings for isolated high-complexity locations without route context.
  3. Keep this as warning-tier for point wizard unless explicitly escalated.
- **Done when**:
  - Review step can display map-context findings.

## 5.2 Postpone

### P1. Agent-only mechanics (targeting logic, speed, operational range)

- **Why postponed**: Agent scope, not point scope.
- **Move to**: Map Agent Wizard roadmap.

### P2. Full threat propagation simulation across route network

- **Why postponed**: Requires mature route and agent systems and consistent threat model ownership.
- **Move to**: Map Route + Map Agent integration phase.

### P3. Hard normalization caps for behavior triad (`trade_priority + combat_priority <= 7`)

- **Why postponed**: Introduce fields first; gather campaign usage data; set caps only after empirical review.
- **Move to**: post-field rollout tuning milestone.

### P4. Deterministic economy engine from trade scores

- **Why postponed**: Current need is authoring integrity, not full autonomous simulation engine in wizard layer.
- **Move to**: simulator/runtime iteration, not authoring UI first pass.

## 5.3 Reject (for this roadmap scope)

### R1. "No free text" for controlled enums as a blanket rule

- **Rejected because**: Current project requirements explicitly allow custom entries for many categories.
- **Replacement**: controlled custom entries with normalization, plus stronger validation.

### R2. Hard-failing all heuristic outliers from demographic source

- **Rejected because**: Medieval source is a guide, not immutable simulation law for every fantasy campaign.
- **Replacement**: advisory warnings + optional stricter profile modes later.

### R3. Large implicit rewrites of legacy map/token data at runtime

- **Rejected because**: violates no-shim/no-unauthorized-migration guidance.
- **Replacement**: explicit one-time migration command only when approved.

## 6. Full Step-By-Step Implementation Guide

## Phase 0 - Freeze Contracts And Baseline (No behavior change)

1. Record current external contracts:
   - chat commands
   - section navigation behavior
   - save/reset semantics
2. Add source references to documentation (completed for PDF).
3. Build a baseline acceptance checklist from current desired UX.

Output: baseline checklist and test script notes.  
Exit criteria: all current critical flows still pass.

## Phase 1 - Data Contract Expansion (Point Stat Coverage)

1. Add new fields to `defaultSessionData`.
2. Add serialization/deserialization support:
   - `snapshotData`
   - `mergeSnapshotIntoData`
3. Add new section definitions and renderers:
   - `point_type`
   - `terrain`, `climate`, `seasonal_modifiers`
   - `threat_rating`, `threat_behavior`, `influence_range`
   - `trade_priority`, `combat_priority`, `risk_tolerance`
4. Update review panel and save serializer (`buildGMNotesText`).

Output: wizard can author full point-level stat set.  
Exit criteria: all new fields can be set, reviewed, saved, and reloaded.

## Phase 2 - Validation Engine Refactor

1. Create rule-based validators:
   - format/range validators
   - cross-field consistency validators
   - map-context validators
2. Replace direct single-string return pattern with finding objects:
   - `errors[]` (hard fail)
   - `warnings[]` (advisory)
3. Update review panel to show findings before save.

Output: deterministic validation pipeline.  
Exit criteria: identical input yields identical findings every run.

## Phase 3 - Economic and Trade Coherence Rules

1. Add overlap checks (`has` vs `needs`) per category-period.
2. Add wealth-linked minimum viability rules (configurable thresholds).
3. Compute and surface:
   - `supply_score`
   - `demand_score`
   - imbalance warning tiers
4. Keep custom categories valid under same coherence rules.

Output: trade authoring integrity without overconstraint.  
Exit criteria: contradictory trade states are blocked; weak states are warned.

## Phase 4 - Demographic Advisory Layer

1. Add helper calculators informed by medieval source:
   - density range advisory
   - cultivated land estimate
   - services/defense density heuristics
2. Surface advisories in compact review cards.
3. Keep advisory layer non-blocking by default.

Output: GM sees plausibility guidance while retaining campaign freedom.  
Exit criteria: advisories render consistently and never force save failure unless explicitly configured.

## Phase 5 - Map-Aware Checks And Integration

1. Consume map records for local-context warnings:
   - route isolation for high-complexity locations
   - suspicious mismatches between selected profile and map context
2. Ensure Save/Exit pipeline still:
   - writes token and mule state
   - syncs map location records
   - clears bound token/session
   - whispers GM Campaign Menu
3. Re-verify handout refresh paths (`map records`, `atlas`).

Output: map-point authoring is context-aware and coherent with map systems.  
Exit criteria: no regressions in map location/route handouts or campaign menu behavior.

## Phase 6 - Documentation + Help + Template Compliance

1. Update help lines for new fields and validation semantics.
2. Update wizard documentation for new section order and rules.
3. Confirm module headers/versions/comments remain template-compliant.

Output: implementation and docs stay synchronized.  
Exit criteria: help output matches actual command behavior.

## Phase 7 - Verification and Hardening

1. Add deterministic test cases:
   - happy path saves
   - invalid combinations
   - warning-only combinations
2. Add regression checks for previously fixed issues:
   - token bind/reset behavior
   - save target behavior
   - GM menu return behavior
   - map records handout refresh behavior
3. Run full manual QA in GM chat width constraints.

Output: release candidate quality.  
Exit criteria: all acceptance checks pass.

## 7. Best-Practice Recommendations (Template And Goals Aligned)

1. **Prefer additive, explicit changes over implicit compatibility logic**  
   Rationale: standards prohibit unauthorized shims.
2. **Centralize rule constants in one module-local block**  
   Keeps validation transparent and auditable.
3. **Use deterministic rule IDs and message text**  
   Prevents QA ambiguity and player confusion.
4. **Keep UI compact and left-aligned lists in chat context**  
   Preserves existing narrow-panel usability goal.
5. **Separate hard errors from advisories**  
   Avoids overblocking while still enforcing integrity.
6. **Treat demographic source as guidance layer**  
   Respects fantasy variability while improving plausibility.
7. **Keep all user-facing labels canonical and explicit**  
   Aligns with command/value naming standards.
8. **No placeholder commands, no dead buttons**  
   Required by template and standards discipline.

## 8. Projected End State (When Are We Done?)

Work is complete when all of the following are true:

1. Map Point Wizard can author and persist the full point stat block required for point scope.
2. Validation engine enforces hard constraints and displays warning-tier advisories.
3. Save/Exit behavior is stable and unchanged where required:
   - saves data correctly
   - clears active token selection/session
   - returns GM Campaign Menu
4. Trade handout workflow remains compact and ephemeral with clear close instructions.
5. Map Locations and Routes handout remains synced after relevant actions.
6. Help, documentation, and module comments reflect the shipped behavior.
7. No unauthorized backward-compatibility shims or placeholder logic are introduced.

## 9. Deliverable Checklist By Module

### `fts_mapPointWizard`

- [ ] New point fields added and rendered
- [ ] Rule-engine validation integrated
- [ ] Review view shows hard + advisory findings
- [ ] Save serialization aligned to canonical point keys
- [ ] Regression checks pass

### `fts_wizards`

- [ ] No behavior regressions in wizard launch path
- [ ] Menu output and links remain chat-driven and GM-correct

### `fts_mapMeta` / `fts_atlas`

- [ ] Refresh hooks still fire after save/update
- [ ] Map records handout consistency maintained

### Documentation

- [ ] Roadmap accepted
- [ ] Help docs updated with final behavior
- [ ] Canonical sources list remains current

## 10. Change-Control Guardrails

1. No unauthorized module rewrites during this roadmap execution.
2. No runtime compatibility shims unless explicitly approved as a task.
3. Any scope expansion into Agent or Route simulation mechanics requires a separate approved roadmap update.
4. Any schema-key renaming requires explicit migration plan approval first.

---

## Appendix A - Point Scope Coverage Snapshot

Expected point-scope additions still needed in wizard coverage:

- `point_type`
- `threat_rating`
- `threat_behavior`
- `influence_range`
- `terrain`
- `climate`
- `seasonal_modifiers`
- `trade_priority`
- `combat_priority`
- `risk_tolerance`

---

## Appendix B - Practical Rule Starter Set

Hard rules (block save):

1. Required identifiers missing (`name`, valid `region`, valid `locale`)
2. Invalid enum/range values
3. Contradictory trade state (`has` and `needs` collision for same category-period)

Warning rules (allow save):

1. Extreme supply-demand imbalance
2. High wealth with very low production diversity
3. High threat profile with no supporting context in local map records
4. Demographic advisory outlier vs selected template profile

