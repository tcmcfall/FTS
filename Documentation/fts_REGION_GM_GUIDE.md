# FTS Region Module Guide

This guide covers the `fts.region.v4` format used by `fts_weather`, `fts_mapMeta`, and the shipped regional modules.

## Overview

Each region module now writes one authoritative entry into the `fts_mule` character macro / ability named `regions`.

- Module key naming: `fts_regionRegionName` (for module/version identity), while `region` remains the canonical lower-case lookup key used in page parsing.
- Storage path: `root.regions[<regionKey>]`
- Schema: `fts.region.v4`

The region entry drives:

- page-name parsing through region and locale keys
- default locale and campaign location metadata
- Harptos month and festival weather baselines
- exact-clock diurnal temperature control inside each time-of-day band
- seasonal ocean current patterns
- locale drift and override behavior
- governor caps for temperature, rain, skies, wind, and currents
- activation windows for skies, precipitation, and critical events
- critical-event weights and severity
- GM manual weather tables

## Canonical Sources

The shipped modules do not rely on a single global dataset, because no one official product covers atmospheric climatology, sea-surface temperature, and subsurface current structure equally well.

- ECMWF ERA5: monthly air temperature, precipitation, and prevailing-wind defaults
- Copernicus Marine Global Ocean Physics: seasonal current direction, strength, and subsurface temperature structure
- NOAA NCEI OISST: sea-surface temperature checks for ocean and coastline layers
- NOAA Ocean Service wave mechanics guidance plus the NWS wave glossary: local wind waves depend on wind speed, wind duration, and fetch, and should not be treated as distant swell
- NOAA NDBC buoy climatology / Copernicus Marine wave reanalysis: wave-chop sanity checks and exposed-water reference baselines
- NOAA World Ocean Atlas / NOAA Science On a Sphere depth-temperature guidance: colder water with depth and weaker seasonal swings below the upper ocean
- NOAA Ocean Service light-depth guidance: sunlight zone to about 200 m, twilight to about 1,000 m, and aphotic darkness below that
- NOAA CoastWatch Kd490 guidance: body-type clarity sanity check for how quickly water light attenuates in clear versus turbid water
- U.S. National Park Service cave-climate guidance: underdark-style temperatures remain near the local annual mean, and airflow is usually dead calm to only a slight breeze
- USGS streamflow guidance: 20/60/80% sampling logic for inland and coastal water columns

## Installation

Load the shipped regional modules you want to use from `Modules/Regions/fts_regionRegionName_0.1.0-alpha.1.js`, restart the Roll20 API sandbox, and run `!fts --weather verify`.

## Page Naming

Pages now follow this pattern:

- `region.locale.mapname`
- `region.locale_<depth>.mapname`
- `region.region`
- `mapname.global`

Examples:

- `frozenfar.coastal.iceplains`
- `moonshaes.underwater_90.sunkenhall`
- `swordcoast.underdark_2mi.deeproad`
- `swordcoast.coastal_+100.cliffwatch`
- `landsofintrigue.region`
- `faerun.global`

Notes:

- page names are case- and space-insensitive, and canonical output is lower-case with no spaces
- the locale segment is the locale key
- `region.region` designates a whole-region overview map that may contain many locales, routes, and points
- `mapname.global` designates a multi-region overview map keyed by its first segment
- bare depth values use the current weather units
- append `mi` or `km` to force large units
- prefix `+` for elevation
- `underwater` pages drive the `fts_windsock` token with the underwater layer family, and `underdark` pages use the underdark layer family
- underwater depth tags also drive page-specific current sampling, temperature shift, and visibility falloff
- underdark depth tags keep the locale in cave-air mode; visibility stays dark by default and airflow remains mostly still unless a draft or critical event is introduced

## Required Structure

Every region entry must define:

- `schema`
- `region`
- `displayName`
- `defaultLocale`
- `locales`
- `campaignLocations`
- `referenceSources`
- `sourceNotes`
- `localeDefinitions`
- `weather.climateControl`
- `weather.periods`
- `weather.seasonalCurrents`

The canonical locale keys still need to exist:

- `offshore`
- `coastal`
- `inland`
- `underwater`
- `underdark`

You can add extra locale keys for custom areas such as magical forests, volcanic badlands, or dead-magic lakes.

## Weather Periods

`weather.periods` is keyed by Harptos months and festivals:

- `hammer`
- `midwinter`
- `alturiak`
- `ches`
- `tarsakh`
- `greengrass`
- `mirtul`
- `kythorn`
- `flamerule`
- `midsummer`
- `shieldmeet`
- `eleasis`
- `eleint`
- `highharvestide`
- `marpenoth`
- `uktar`
- `feastofthemoon`
- `nightal`

Each period must define:

- `temperature.avgF`
- `temperature.lowF`
- `temperature.highF`
- `precipitation.chancePct`
- `precipitation.type`
- `precipitation.intensityWeights`
- `wind.directionWeights`
- `wind.strengthWeights`
- `critical.chancePct`
- `critical.eventWeights`
- `critical.severityWeights`
- `drift.temperature`
- `drift.precipitation`
- `drift.skies`
- `drift.wind`
- `drift.directionChangePct`
- `drift.timeofdaySegments`

`drift.timeofdaySegments` is keyed by the eight FTS time-of-day segments:

- `earlypredawn`
- `latepredawn`
- `earlymorning`
- `latemorning`
- `earlyafternoon`
- `lateafternoon`
- `earlyevening`
- `lateevening`

Each time-of-day segment block defines how the slowly-changing-weather rule should lean during that segment. The shipped modules use:

- `temperatureSwingPct`
- `temperatureDelta`
- `precipitationDelta`
- `skiesDelta`
- `windDelta`
- `windStrengthDeltaPct`
- `directionChangePct`

These period values are the regional baseline. Locale definitions can drift from them or fully override them.

## Climate Control

`weather.climateControl` is required in `fts.region.v4`.

It defines:

- `diurnal.lowTimeHHMM`
- `diurnal.highTimeHHMM`
- `diurnal.riseCurve`
- `diurnal.fallCurve`
- `governor.temperatureMaxDeltaF`
- `governor.rainMaxStep`
- `governor.skyMaxStep`
- `governor.windMaxStep`
- `governor.currentStrengthMaxDeltaPct`
- `governor.currentTemperatureMaxDeltaF`
- `governor.currentDirectionMaxStep`
- `governor.interpolateWindStrength`
- `governor.interpolateCurrentStrength`
- `governor.interpolateCurrentTemperature`
- `activation.skyLeadMinutes`
- `activation.precipitationDurationMinutes`
- `activation.eventStartOffsetMinutes`
- `activation.eventTailBufferMinutes`

Locale definitions can optionally add `climateControl` to override those defaults for special places such as magical storms, volcanic vents, or sheltered inland basins.

## Seasonal Currents

`weather.seasonalCurrents` defines one current profile per season:

- `winter`
- `spring`
- `summer`
- `autumn`

Each current block contains:

- `direction`
- `readings.surface`
- `readings.shallow`
- `readings.mid`
- `readings.deep`

Each reading contains:

- `direction`
- `temperatureF`
- `strengthPct`

The active locale supplies the sampling depth through `localeDefinitions.<locale>.waterProfile`.

- Inland/coastal/lake/river-style water columns use the USGS three-point rule:
  20%, 60%, and 80% of the total depth.
- Open-ocean defaults use fixed fathom samples:
  1, 5, and 10 fathoms.
- The representative current used by the runtime is the mean of the shallow and deep strengths, with the mid-depth temperature used as the representative water temperature.

Use this for offshore, coastal, or underwater locales whenever current patterns matter.

## Subsurface Modeling

Subsurface locales are intentionally not copies of the surface weather loop.

- `underwater` locales still use `weather.seasonalCurrents`, but the active page now samples the current profile at the page depth when a depth token is present.
- Water temperature gets colder with depth by shifting the rendered page temperature against the active seasonal current sample instead of reusing the same value at every depth.
- Underwater visibility uses NOAA light-depth zones as the global baseline and then applies a conservative body-type penalty informed by Kd490 guidance, so reef, coastal, lake, and river water darken faster than clear open ocean.
- The runtime does not fetch live clarity or Secchi-depth grids; the body-type visibility bands are fixed heuristics informed by those sources.
- `underdark` locales are treated as cave climates. Their baseline temperatures are stabilized around the locale's annual mean instead of following open-air swings.
- Underdark airflow is modeled as cave ventilation rather than surface wind. Stable passages default to `ud_dead_calm`, with only brief drafts reaching `ud_20%` and stronger airflow normally reserved for narratively introduced or critical conditions.
- Ambient underdark visibility is dark by default unless the scene supplies its own light source, bioluminescence, or creature vision.

## Surface Chop

Surface chop is intentionally narrower than a full sea-state or swell model.

- FTS currently models `chop` only on offshore and coastal surface locales.
- Chop is treated as local short-period wind-wave roughness, not as total seas or distant swell.
- The runtime derives chop directly from the live wind band, so dead calm always yields `none`.
- `!fts --weather set chop none|light|moderate|heavy|severe` is a convenience command that raises or lowers wind to the nearest compliant marine band.
- Depth-tagged surface pages do not model chop, because those pages are already treated as subsurface views rather than exposed surface-water maps.

## Locale Definitions

`localeDefinitions` controls how each locale behaves on top of the region baseline.

Useful fields:

- `label`
- `token` (optional display alias; page names use locale keys)
- `environment`
- `biome`
- `climateMode`
- `inherits`
- `useSeasonalCurrent`
- `waterProfile`
- `periods`
- `manualTables`

`waterProfile` is required whenever `useSeasonalCurrent` is true. Useful fields:

- `bodyType`
- `totalDepthFeet`
- `sampleMode`
- `sampleFractions`
- `sampleDepthsFathoms`

The shipped defaults use `coastline` as the standard coastal biome.

`climateMode` values:

- `offset`
  Use `avgDeltaF`, `chanceDeltaPct`, `strengthDeltaPct`, and similar delta fields.
- `override`
  Supply full `avgF`, `chancePct`, weights, or current values for that locale and period.

This lets you keep ordinary locales close to the regional baseline while still supporting special locales such as enchanted swamps, ash-choked coasts, or magically warmed harbors.

## Critical Events

Critical events use four severity levels:

- `light`
- `moderate`
- `heavy`
- `severe`

The active-page `fts_windsock` token must contain 30 sides in this exact order:

`dead_calm`, `20%`, `40%`, `60%`, `80%`, `100%`, `crit_light`, `crit_moderate`, `crit_heavy`, `crit_severe`, `uw_dead_calm`, `uw_20%`, `uw_40%`, `uw_60%`, `uw_80%`, `uw_100%`, `uw_crit_light`, `uw_crit_moderate`, `uw_crit_heavy`, `uw_crit_severe`, `ud_dead_calm`, `ud_20%`, `ud_40%`, `ud_60%`, `ud_80%`, `ud_100%`, `ud_crit_light`, `ud_crit_moderate`, `ud_crit_heavy`, `ud_crit_severe`

Surface pages use the original surface wind layers, `underwater` pages use the full `uw_*` current-strength and critical family, and `underdark` pages use the full `ud_*` airflow-strength and critical family.

For normal cave conditions, expect `ud_dead_calm` to be the steady state. `ud_20%` represents a brief draft rather than a sustained open-air breeze.

Default event templates already exist for common hazards such as:

- blizzards
- ice storms
- winter gales
- thunderstorms
- sea storms
- rogue waves
- hurricanes
- tornadoes
- sandstorms
- heat waves
- flash floods
- wildfires
- earthquakes
- volcanic eruptions
- ashfall
- cave-ins
- sinkholes
- toxic fog
- maelstroms

You can also add `weather.customCriticalEvents` for region-specific hazards.

## Manual Weather Tables

The GM can roll weather manually with:

- `!fts --weather roll`
- `!fts --weather roll event`
- `!fts --weather roll event <eventKey> <severity>`

Manual rolls now apply one immediate governed step at the current band. They obey the same caps as automatic drift instead of bypassing the governor.

If you want custom manual tables, define them under:

- `weather.manualTables`
- `localeDefinitions.<localeKey>.manualTables`

The runtime accepts either a direct table object or a period-scoped object with `default` and period keys.

Useful manual-table fields:

- `temperatureSteps`
- `precipitationSteps`
- `skySteps`
- `windSteps`
- `directionChangePct`
- `criticalChancePct`
- `eventWeights`
- `severityWeights`

## Authoring Workflow

1. Start from [fts_TEMPLATE_region.js](../Templates/fts_TEMPLATE_region.js).
2. Set `referenceSources` and `sourceNotes` first so the analogue, climatology source, water-current source, underwater visibility source, and cave-climate source are explicit.
3. Set `weather.climateControl` so low/high times, governor caps, and activation windows are explicit before you tune the monthly data.
4. Choose the regional default locale first and fill `weather.periods` around that climate.
5. Add `weather.seasonalCurrents` with seasonal current readings.
6. Define canonical locale behavior in `localeDefinitions`, including `waterProfile` for every current-driven locale.
7. Add optional locale `climateControl` overrides only where the locale truly behaves differently from the region.
8. Add any custom locales and pick biome presets for them.
9. Tune critical-event weights and manual tables.
10. Upload the script and run `!fts --weather verify`.
11. Confirm that locale pages like `region.locale.mapname`, region overview pages like `region.region`, and global overview pages like `mapname.global` resolve appropriately in map metadata and weather.
12. Complete the validation checklist in this guide and resolve any remaining warnings before release.

## Validation Checklist

- `region` matches the file/module name
- all five canonical locales are present
- `defaultLocale` exists in `locales`
- every Harptos period exists in `weather.periods`
- every season exists in `weather.seasonalCurrents`
- every locale key is unique inside the region
- every region lists `referenceSources`
- every region defines `weather.climateControl`
- every period defines temperature, precipitation, wind, critical, and drift data
- every period defines all eight `drift.timeofdaySegments`
- every current-driven locale defines `waterProfile`
- every seasonal current defines `surface`, `shallow`, `mid`, and `deep` readings
- every critical event key is either built-in or defined in `customCriticalEvents`
- page names use `region.locale.mapname`, `region.locale_<depth>.mapname`, `region.region`, or `mapname.global`

## Test Flow

1. Load `fts_core`, `fts_weather`, `fts_mapMeta`, and the region module.
2. Name a page with a valid region and locale.
3. Run `!fts --weather verify`.
4. Run `!fts --weather detail`.
5. Run `!fts --weather roll`.
6. Run `!fts --mapMeta`.
7. Run `!fts --weather verify` again after map metadata checks.
8. Advance time and confirm the active band reuses its stored snapshot while live temperature still moves with the exact clock.

