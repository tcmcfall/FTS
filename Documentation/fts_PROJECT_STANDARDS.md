# FTS Project Standards

Status: active standard

This document defines the project-wide conventions used by Fantasy Trade Simulator modules, templates, commands, data files, and documentation. New code should follow these rules unless a later standards document explicitly replaces them.

## Naming Standards

### Commands and switches

Public Roll20 commands and switches use lower camelCase for canonical spelling.

Examples:

- `!fts --mapMeta`
- `!fts --mapMeta set routePoint <pointName>`
- `!fts --calendar set timeOfDay early morning`
- `!fts --calendar show monthOrFestival`
- `!fts --weather set skies partlyCloudy`
- `!fts --weather set wind deadCalm`
- `!fts --weather roll event [eventKey] [light|moderate|heavy|severe]`
- `!fts --mapPointWizard --cargoUnits 6`

Command and switch structure must remain intact. Command names, command fields, subcommands, and switch names are documented as one-token forms and must not accept space, hyphen, underscore, or punctuation variants.

Accepted command/switch examples:

- `--mapMeta`
- `routePoint`
- `timeOfDay`
- `monthOrFestival`
- `cargoUnits`

Rejected command/switch examples:

- `--map meta`
- `--map-meta`
- `route point`
- `time of day`
- `month or festival`
- `cargo units`

Command matching may be case-insensitive for player convenience, but it must not be space-insensitive or separator-insensitive. Help text, generated buttons, handout labels, and error messages should display the canonical lower camelCase spelling.

### User-entered values

User-entered values are the forgiving part of FTS input. Values that identify stored keys, enum-like choices, regions, locales, months, festivals, weather states, and similar controlled values should be matched case-insensitively and separator-insensitively, then sanitized for storage and lookup as lowercase with no spaces.

Accepted value examples:

- `!fts --calendar set month Hammer`
- `!fts --calendar set month haMMer`
- `!fts --calendar set month Deepwinter`
- `!fts --calendar set month deep_winTER`
- `!fts --calendar set month Deep Winter`
- `!fts --calendar set month 1`

All of the month examples above resolve to the same calendar value.

Value normalization applies to identifier-like values, not to freeform prose. Display names, narration, notes, labels, and other descriptive text may preserve spacing and capitalization while still storing a separate sanitized key when lookup is required.

### Data keys and persisted state

Persisted schema keys are not renamed only for style. Internal keys may remain stable when they are state contracts, region-module schema contracts, asset identifiers, or historical data written into the Roll20 campaign.

Current intentional exceptions include:

- Calendar state: `timeofday`, `monthfestival`
- Weather schema: `timeofdaySegments`, `partly_cloudy`, `crit_light`, `crit_moderate`, `crit_heavy`, `crit_severe`
- Weather windsock storage and token side keys: `uw_*`, `ud_*`, `cw_*`, `cd_*`
- Region profile keys required by `fts.region.v4`

Code that exposes these concepts to users should translate them to the canonical public names.

### Directories and files

The repository keeps the existing hybrid directory and file style. Do not force every directory or filename into pure camelCase.

Top-level directories:

- `Documentation`
- `Modules`
- `Templates`
- `Tools`
- `Backups`

Module filenames:

- Use `fts_<moduleName>_<semver>.js`.
- Use lower camelCase for multi-word module names.
- Examples: `fts_core_0.2.0-alpha.1.js`, `fts_mapMeta_0.2.0-alpha.1.js`, `fts_weather_0.2.0-alpha.1.js`, `fts_wizards_0.1.0-alpha.1.js`.

Region module filenames:

- Use `fts_regionRegionName_<semver>.js`.
- Keep the module filename in CamelCase form, and keep `REGION_ENTRY.region` as the compact lowercase stable key.
- Example: `fts_regionSwordCoast_0.1.0-alpha.1.js` with `REGION_ENTRY.region = "swordcoast"`.

Wizard module filenames:

- Place feature-specific wizard modules in `Modules/Wizard Modules`.
- Use the same module filename convention.
- Example: `fts_mapPointWizard_0.2.0-alpha.1.js`.

Template filenames:

- Place all templates in `Templates`.
- Use `fts_TEMPLATE_<purpose>.<ext>` for general templates.
- Examples: `fts_TEMPLATE_module.docx`, `fts_TEMPLATE_region.js`, `fts_TEMPLATE_popupdropdown.js`.

Documentation filenames:

- Place human-facing project documentation in `Documentation`.
- Existing documentation may use `fts_<UPPER_SNAKE_TOPIC>.md` or established descriptive filenames.
- Do not rename documentation only for case style unless a rename is part of an explicit cleanup task.

## Module Standards

Each Roll20 Mod API module should keep a clear header containing name, version, date, description, dependencies, and provided commands.

Every module should:

- Register commands through `fts_core` when available.
- Register help through `fts_core.addHelpSection`.
- Avoid standalone menu injection when a shared FTS shell mechanism exists.
- Use GM gates for state-changing or campaign-administrative actions.
- Return structured command results where the local module pattern uses them.
- Keep user-facing errors actionable and specific.
- Avoid placeholder logic, unused scaffolds, and backward-compatibility shims that are not explicitly authorized.

Feature modules should remain modular:

- `fts_core`: unified router, menu shell, help, shared palette and utility APIs.
- `fts_calendar`: calendar state and time advancement. Treat this module as fragile and minimize unrelated edits.
- `fts_weather`: weather state, region climate profiles, active weather updates, quips, and verification.
- `fts_mapMeta`: map metadata capture, depth/elevation, map locations, routes, and route points.
- `fts_atlas`: map-facing atlas handout/view generation and atlas verification.
- `fts_wizards`: GM-only wizard menu dispatch and shared wizard menu behavior.
- `fts_mapPointWizard`, `fts_mapRouteWizard`, `fts_mapAgentWizard`: feature-specific wizard implementations.

## Template Compatibility

Template-compatible code must preserve the contracts in `Templates`.

For modules:

- Keep the header block aligned with `fts_TEMPLATE_module.docx`.
- Keep version strings SemVer-compatible.
- Keep public command lists accurate.
- Keep integration points explicit.

For region modules:

- Follow `fts_TEMPLATE_region.js`.
- Export `fts.region.v4` data through the established region registration pattern.
- Preserve required locale, period, drift, water, chop, current, narration, and source fields.
- Run region verification after editing region data.

For UI snippets:

- Reuse shared palette and shell helpers where available.
- Generated chat buttons should use canonical command names.
- UI controls should call real handlers only. Do not emit inactive placeholder commands.

## Command Parsing And Validation

The command parser standard is:

1. Split `!fts` input into top-level `--command` segments.
2. Read the first command token exactly as the command name, allowing only documented one-token command forms.
3. Lowercase the command token for matching, but do not remove spaces, hyphens, underscores, or punctuation.
4. Parse switches as documented one-token switch names.
5. Normalize user-entered values separately from command and switch parsing.
6. Validate required values before mutating state.
7. Reject contradictions instead of silently coercing them.

Examples of required sanity checks:

- Calendar season changes must agree with the current month or festival.
- Calendar date and time values must resolve to valid Harptos fields.
- Weather `deadCalm` cannot retain an active direction.
- Weather rainfall and skies must be reconciled by the weather model.
- Weather chop and current controls must be rejected on locales that do not support them.
- Map depth/elevation input must parse into a valid supported depth context.
- Map route and routePoint commands must require a captured map when token position is needed.
- Wizard save must require the data needed to create a valid map point.
- Wizard reset must clear only the active wizard draft.

## State And Storage

Project state is rooted under `state.fts`.

Persistent campaign data should be stored through the existing mule and ability patterns when the module already uses them. New storage should not create parallel roots or hidden schemas without a documented reason.

Standards:

- Use `fts_mule` and existing JSON ability storage where established.
- Keep version and migration metadata explicit.
- Prefer additive schema evolution over destructive rewrites.
- Do not remove or rename persisted keys solely for style.
- Do not introduce migration shims unless the task explicitly authorizes backward compatibility.
- Verification should report unsupported branches, missing required fields, and stale ability names.

## Weather Mapping Standard

Weather mapping is the shared contract between page names, region modules, weather runtime, map metadata, and atlas output.

### Page naming

Supported page names for page-wide weather:

- `region.locale.mapname`
- `region.locale_depth.mapname`
- `region.region`
- `mapname.global`

Page-name tokens are case-insensitive and space-insensitive. Canonical weather lookup keys are lowercase with spaces removed.

Region overview pages fall back to the region default locale. Global overview pages are valid map shells but require localized region and locale context for weather details.

Depth and elevation:

- Bare depth values use the current weather unit setting.
- Use `mi` or `km` suffixes for large-unit input.
- Prefix with `+` for elevation above the surface context.
- Depth and elevation must resolve to a supported locale/depth context.

### Region schema

Region modules must use the `fts.region.v4` shape and must pass `!fts --weather verify`.

Required weather profile areas include:

- Region metadata and source list.
- Locale definitions.
- Seasonal or period definitions.
- Drift controls, including `timeofdaySegments`.
- Temperature, precipitation, skies, wind, chop, current, and water profile data where the locale supports them.
- Critical event configuration.
- Narration and quip data using the current narration standards.

### Weather data mapping sources

Region weather data should be traceable to reliable public datasets or clearly identified design assumptions.

Accepted source families currently ingested by FTS include:

- ECMWF ERA5 for historical climate reanalysis.
- Copernicus Marine Global Ocean Physics for broad marine current and water profiles.
- NOAA NCEI OISST for sea-surface temperature.
- NOAA Ocean Service and National Weather Service for coastal context.
- NOAA NDBC and Copernicus wave products for marine surface conditions.
- NOAA World Ocean Atlas and NOAA Science On a Sphere for broad ocean climatology.
- NOAA CoastWatch Kd490 for water clarity and light attenuation.
- National Park Service cave climate references for subterranean patterns.
- USGS streamflow references for river and current assumptions.
- S. John Ross, `medieval-demographics-made-easy.pdf`, for settlement-density, population-spread, and support-value demographic heuristics used by location templates and wizard authoring guidance.

When source data is adapted into fantasy geography, document the source analogue and the design transformation.

### Weather runtime behavior

Weather runtime should:

- Update by Harptos `timeOfDay` segments.
- Use climate control and drift rules to prevent unrealistic step changes.
- Preserve active event state until the event naturally resolves or is replaced.
- Reconcile rainfall and skies after manual or rolled changes.
- Respect water locale support for chop, currents, and subsurface behavior.
- Keep player-facing output concise and use detailed reports for GM diagnostics.

### Windsock standard

Windsock output is side-based and uses a 30-side token order.

Side families:

- Clear wind: `uw_*`
- Directed wind: `ud_*`
- Clear current: `cw_*`
- Directed current: `cd_*`

Do not rename windsock side keys for style. They are asset and Roll20 token contracts.

## Calendar Standard

Calendar commands use canonical public fields:

- `hour`
- `timeOfDay`
- `day`
- `month`
- `monthOrFestival`
- `season`
- `year`

The calendar module internally preserves older state names where they are part of the stored campaign schema. Public help and generated messages should use the canonical names above.

Calendar edits must preserve date consistency. In particular, a manual `season` value must agree with the current `monthOrFestival` context.

## Map Metadata And Atlas Standards

`mapMeta` owns map capture, page metadata, depth/elevation state, route records, routePoint records, and map location records.

Canonical user-facing names:

- `mapMeta`
- `routePoint`
- `location`
- `depth`
- `elevation`

`atlas` consumes map metadata for map-facing views and verification. Atlas controls should remain GM-only unless a player-facing atlas feature is explicitly designed.

The active atlas commands are:

- `!fts --atlas`
- `!fts --atlas open`
- `!fts --atlas current`
- `!fts --atlas page <pageId>`
- `!fts --atlas refresh`
- `!fts --atlas verify campaign`
- `!fts --atlas verify page`
- `!fts --atlas verify repairCampaign`
- `!fts --atlas verify repairPage`

Verification repair commands must perform real repair work or be removed from help.

## Wizard Standards

`fts_wizards` owns only the shared GM wizard menu. Feature-specific wizard behavior belongs in its feature wizard module.

The wizard menu:

- Is GM-only.
- Performs a global FTS update before presenting wizard choices.
- Whispers wizard buttons to the GM.
- Uses active buttons only for implemented wizard modules.

Current active wizard entry:

- `Map Point Wizard` -> `!fts --mapPointWizard start`

Future wizard entries must become active only when their corresponding modules and handouts are implemented.

Wizard modules should:

- Use canonical switch names in generated buttons.
- Keep switch names to documented one-token forms.
- Normalize stored identifier values case-insensitively and separator-insensitively.
- Keep draft state scoped to the active wizard.
- Provide save and reset flows with sanity checks.
- Avoid placeholder steps and fake buttons.

## Documentation Standards

Documentation should be specific, current, and traceable to implemented behavior.

Rules:

- Do not document placeholder commands.
- Do not document removed modules or retired region/locale wizard concepts.
- Prefer canonical command spellings.
- Call out intentional internal-schema exceptions when they look different from public command style.
- Keep source-driven standards linked to their source family or source document.

Current supporting standards and references include:

- `Documentation/fts_QUIP_CANONICAL_STANDARD.md`
- `Documentation/fts_WEATHER_NARRATION_STYLE_STANDARD.md`
- `Documentation/fts_WEATHER_NARRATIVE_PERMUTATIONS.md`
- `Documentation/fts_REGION_GM_GUIDE.md`
- `Documentation/fts_README_weathermapping.docx`
- Trade authoring and branch-charter documents in `Documentation`

## Verification Checklist

Before considering a standards-related change complete:

- Run JavaScript syntax checks for all files under `Modules`.
- Run `!fts --weather verify`.
- Run `git diff --check`.
- Search for stale public command spellings in modules and documentation.
- Confirm generated help text uses canonical spellings.
- Confirm internal schema exceptions are intentional and documented.
