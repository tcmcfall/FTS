# DWT Narration Gap Analysis

Generated on 2026-03-28 from the built-in narration inventory and direct source review of the runtime modules.

Historical note: this analysis reflects the pre-overhaul quip layout and should be read as migration context rather than current module truth.

## Executive Summary

- The strongest existing quip material currently lives in the festival, season, and generic pools in `Modules/dwt_quips_0.1.0-alpha.1.js`.
- The weakest narration lives in the region-specific quip pools for Frozenfar, Lands of Intrigue, Sword Coast, and Sword Coast North. These are not exact duplicates, but they are heavily template-driven and frequently degrade into awkward or broken phrasing.
- `dwt_weather` has solid system-facing narrative templates, but its fallback quips are too thin to carry a full flavor layer on their own.
- `dwt_calendar` has structural drift from `dwt_quips`: incomplete overlay coverage, a festival-key mismatch, and a long/medium lookup mismatch.
- All current quip buckets already respect the required line counts: short `2`, medium `4`, long `8`.
- Recommendation: use the strongest existing pools as reference material, rewrite the weak region pools from scratch, and align calendar and weather around the canonical campaign standard in `Documentation/dwt_QUIP_CANONICAL_STANDARD.md`.

## Canonical Campaign Standard Impact

The target has now been clarified by the campaign standard:

- short quips must read as `AA`
- medium quips must read as `ACBC`
- long quips must read as `ABCBDEFE`
- quips should sound like naturally spoken maritime sayings inside Ghosts of Velen
- structural variety matters as much as grammar

What this changes:

- The current corpus is healthier on bucket length than expected. Across all 1900 quips, the short, medium, and long pools already match the required 2/4/8-line structure.
- The real compliance gap is now voice, rhyme discipline, and setting fit.
- Some of the best-written existing quips are still only reference-quality if they do not sound like sailor or villager speech in Ghosts of Velen.
- The weakest region pools still remain full rewrite candidates, but the standard also raises the bar for what counts as "done" in the stronger pools.

## 1. Duplication and Repetition

### Exact Duplicates

- Exact duplicate full entries in the `dwt_quips` corpus: `0`
- Conclusion: the main problem is not copy-paste duplication. The real problem is structural duplication through repeated templates with swapped nouns, places, and factions.

### Structural Duplication

The region pools are dominated by a small set of repeating sentence skeletons:

- Long pools: `In <place> the <thing> lingers into <thing>...`
- Medium pools: `In <place> the <thing> draws close like <thing>...`
- Short pools: `<place> listens under <thing> and <thing>...`

### Template Saturation by Pool

| Pool | Entries | Entries using the dominant template |
| --- | ---: | ---: |
| `quips.frozenfar.long` | 36 | 35 |
| `quips.frozenfar.medium` | 40 | 37 |
| `quips.frozenfar.short` | 49 | 45 |
| `quips.landsofintrigue.long` | 42 | 41 |
| `quips.landsofintrigue.medium` | 42 | 40 |
| `quips.landsofintrigue.short` | 48 | 45 |
| `quips.swordcoast.long` | 38 | 37 |
| `quips.swordcoast.medium` | 42 | 39 |
| `quips.swordcoast.short` | 48 | 45 |
| `quips.swordcoastnorth.long` | 45 | 44 |
| `quips.swordcoastnorth.medium` | 41 | 39 |
| `quips.swordcoastnorth.short` | 47 | 44 |
| `quips.generic.long` | 20 | 0 |
| `quips.generic.medium` | 45 | 0 |
| `quips.generic.short` | 49 | 0 |
| `quips.season.winter.long` | 20 | 0 |
| `quips.season.winter.medium` | 47 | 0 |
| `quips.season.winter.short` | 49 | 0 |

### Why This Matters

- The authored pools feel distinct because they vary image, rhythm, and sentence shape.
- The region pools feel repetitive because they mostly permute the same grammar shell.
- This means the region pools should be treated as rewrite candidates, not line-edit candidates.

## 2. Tone Clashes

### Authored Verse vs Slot-Filled Verse

The strongest pools open with concrete imagery and a clear regional point of view:

- `quips.festival.midwinter.long`
- `quips.season.winter.long`
- `quips.generic.long`

By contrast, the weak region pools repeatedly fall into slot-filled constructions such as:

- `quips.landsofintrigue.long`
- `quips.swordcoast.long`
- `quips.swordcoastnorth.long`
- `quips.frozenfar.long`

Result:

- The corpus shifts from intentional poetry to procedural-sounding pseudo-poetry.
- The user experience is tonal whiplash rather than a coherent narrator voice.
- Under the canonical Ghosts of Velen standard, the problem is not just quality. It is also that slot-filled verse does not sound naturally spoken.

### System Narrator vs Bardic Narrator

`dwt_weather` uses grounded, simulation-facing narration:

- temperature and sky reporting
- wind/current statements
- visibility and depth lines
- critical-event summaries such as `Driving snow and biting wind choke roads and sightlines.`

That voice works well for utility. The quip corpus, however, is mostly lyrical and imagistic.

Result:

- When the campaign log combines a hard-edged weather report with a poetic quip, the switch can feel abrupt.
- This is not automatically bad, but it needs to be intentional.
- The overhaul should decide whether DWT has one narrator voice or a layered voice model:
  - system report
  - flavor quip
  - event stinger
- The quip layer should now be shaped by the Ghosts of Velen standard rather than by generic fantasy lyricism.

### Calendar Fallback Voice vs Quips-Corpus Voice

`dwt_calendar` fallback festival quips are compact, aphoristic four-line pieces. They are readable and usable, but they are simpler and blunter than the stronger festival pools in `dwt_quips`.

Result:

- The fallback material is serviceable, but it does not feel like the same tier of writing as the best festival corpus.
- This is acceptable for emergency fallback, but not ideal if users will see it often.

## 3. Weak Modules and Coverage Gaps

### A. Region Quip Pools Are the Weakest Runtime Module

Highest-risk paths:

- `quips.frozenfar.*`
- `quips.landsofintrigue.*`
- `quips.swordcoast.*`
- `quips.swordcoastnorth.*`

Symptoms:

- overwhelming template reuse
- awkward grammar
- frequent punctuation fractures
- weak local specificity despite named places
- faction/place substitutions that read like slot filling rather than authored lines

Assessment:

- Rewrite from scratch.
- Do not spend time polishing individual broken lines inside the current template structure.

### B. Moonshaes Has Region Support but No Region Quip Corpus

Current state:

- `dwt_weather` ships Moonshae weather fallback quips under `quips.weather.moonshaes.*`
- the quips corpus has no `quips.moonshaes.long|medium|short`

Result:

- Moonshaes exists as a weather region and as a region module, but not as a first-class narration region in `dwt_quips`.

Assessment:

- This is a clean content gap, not a quality bug.
- Backfill with a full Moonshaes region pool.

### C. Uktar Is Severely Underfilled

Current counts:

- `quips.festival.uktar.long`: `1`
- `quips.festival.uktar.medium`: `5`
- `quips.festival.uktar.short`: `47`

Result:

- Uktar has enough short texture to appear present, but not enough medium/long depth to feel complete.
- It will look thin beside the better-developed festivals.

Assessment:

- Backfill Uktar before doing style polish on already-healthy festivals.

### D. Calendar and Quips Are Out of Contract

Current issues in `Modules/dwt_calendar_0.2.0-alpha.1.js`:

- `FESTIVAL_QUIP` only covers six festivals.
- Calendar-local fallback pools also include `uktar` and `midwinters_eve`.
- `resolveFestivalLongQuip()` requests `quips.festival.<key>.medium`.
- The comments and fallback naming still refer to long quips.
- Calendar uses `midwinters_eve`, while `dwt_quips` uses `midwinterseve`.

Result:

- The module boundaries do not agree on festival naming or length semantics.
- This creates brittle behavior and makes future overhaul work harder than it needs to be.

Assessment:

- Fix the contract before rewriting large amounts of festival content.

### E. Weather Flavor Is Too Shallow

Current state in `Modules/dwt_weather_0.2.0-alpha.1.js`:

- `FALLBACK_WEATHER_QUIPS` contains 25 region-locale paths.
- Each path currently ships with one fallback line.
- The dynamic weather narration itself is strong and useful.

Result:

- Weather has good status narration but weak flavor variation.
- Repeated exposure will make weather flavor feel static even when the mechanical conditions change.

Assessment:

- Keep the narrative templates.
- Expand the flavor layer.

## 4. Keep / Revise / Rewrite

### Keep As Reference Material

- festival quips that are already fully developed
- season quip pools
- generic quip pools
- weather narrative templates
- critical-event summary layer

Note:

- "Keep" no longer means "ship unchanged."
- It means these are the strongest inputs to adapt toward the canonical campaign standard.

### Revise

- calendar fallback festival quips
- weather fallback flavor coverage
- calendar/quips naming and lookup contract
- festival overlay one-line coverage

### Rewrite

- Frozenfar region quips
- Lands of Intrigue region quips
- Sword Coast region quips
- Sword Coast North region quips
- any future region pool generated from the same current template pattern

## 5. Proposed Overhaul Map

### Phase 1: Lock the Narration Contract

Define a single source of truth for:

- festival keys
- region keys
- locale keys
- length buckets (`short`, `medium`, `long`)
- which modules own lookup vs fallback behavior

Deliverables:

- unify `midwinters_eve` vs `midwinterseve`
- decide whether calendar should request `medium` or `long`
- add a validation check for missing narration paths

### Phase 2: Establish a Voice Bible

Decide on three distinct layers:

- System voice: weather/status reporting, clear and grounded
- Flavor voice: short atmospheric lines, vivid but concise
- Quip voice: lyrical or poetic, but still regionally specific

Rules to define:

- acceptable poetic density
- amount of setting specificity per line
- whether faction names are rare spice or common texture
- whether narration should favor aphorism, verse, prose-poetry, or mixed form

### Phase 3: Rewrite the Region Pools From Scratch

Priority order:

1. `quips.landsofintrigue.*`
2. `quips.swordcoast.*`
3. `quips.swordcoastnorth.*`
4. `quips.frozenfar.*`
5. add `quips.moonshaes.*`

Rewrite rule:

- Do not salvage the current line templates.
- Start from a regional image bank, faction list, and place list.
- Author each length tier independently instead of compressing one template into three forms.

### Phase 4: Fill Coverage Gaps

Content gaps to close:

- Uktar long and medium pools
- Moonshaes long, medium, and short pools
- weather flavor pools beyond one line per region-locale
- festival overlay one-liners for all supported festivals

### Phase 5: Expand Weather Flavor Properly

Move beyond one fallback line per region-locale.

Recommended structure:

- `quips.weather.<region>.<locale>.baseline`
- `quips.weather.<region>.<locale>.storm`
- `quips.weather.<region>.<locale>.clear`
- `quips.weather.<region>.<locale>.cold`
- `quips.weather.<region>.<locale>.heat`
- `quips.weather.<region>.<locale>.critical.<event>`

Goal:

- preserve the strong system narration
- add flavor that reacts to actual weather state
- avoid repeating the same one-liner every time a locale is visited

### Phase 6: Add Quality Gates

Introduce automated checks for:

- missing narration pools
- low-count pools
- key mismatches between modules
- overused template stems
- punctuation fractures
- obvious grammar anomalies

Suggested red flags:

- more than 80% of a pool sharing one first-line template
- any festival missing one of `short`, `medium`, `long`
- any supported region missing a region corpus
- any weather fallback path with fewer than 3 to 5 entries

## 6. Recommended Immediate Next Moves

1. Normalize festival keys and length semantics between `dwt_calendar` and `dwt_quips`.
2. Add Moonshaes region quip placeholders so the architecture is complete.
3. Rewrite the four existing region corpora from scratch.
4. Backfill Uktar medium and long content.
5. Expand weather flavor into a real pool structure instead of one-line fallbacks.
6. Add a validator so future narration drops cannot silently drift out of contract.

## Bottom Line

The project does not have a broad duplication problem. It has a narrower but more serious authorship problem:

- some narration is clearly authored and strong
- some narration is clearly templated and weak
- the module contract between calendar, quips, and weather is not yet stable

That is good news for the overhaul branch. The strongest material is worth preserving. The weakest material is easy to identify. The best path forward is a contract-first cleanup followed by a rewrite of the region pools, not a blanket rewrite of everything.
