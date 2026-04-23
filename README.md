# FTS
Fantasy Trade Simulator

What It Is

FTS is a Roll20 Mod/API suite that unifies campaign calendar, weather, map metadata, and travel/route tools behind a single !fts command shell. The core module also owns a shared Campaign Log panel, help handout, UI palette, and startup provisioning for companion modules.

Who It's For

Primary persona: a Roll20 GM running a fantasy campaign who wants in-game time, regional weather, map context, and route/location tracking managed from chat commands, handouts, and macros. This is inferred from the repo's Roll20 API dependencies, GM-only controls, handout creation, and macro provisioning.

What It Does

1.	Provides a unified !fts panel, help system, and Campaign Log macro.
2.	Creates and updates a Campaign Calendar handout with Harptos dates and navigation links.
3.	Tracks weather state, history, regional currents, critical events, derived marine surface chop, and an animated windsock token on the active page, with surface, underwater, and underdark layer families driven by page naming and live conditions. Underwater pages now render current strength, temperature shift, and visibility against the active page depth, while underdark pages default to cave-still airflow unless a draft or critical event is in play.
4.	Loads unified `fts.region.v4` region modules with Harptos month and festival weather periods, required `weather.climateControl` diurnal/governor settings, explicit per-segment `drift.timeofdaySegments`, depth-aware seasonal current readings, configurable locale `waterProfile` data, manual weather tables, and built-in critical-event templates.
5.	Captures active-page map metadata and stores it as JSON for reuse by other modules, including region and locale page metadata plus optional depth or elevation metadata on any unified locale page.
6.	Builds named routes and static map locations from token positions and map metadata.

Current shipped region modules live in `Modules/Regions/fts_regionRegionName_0.1.0-alpha.1.js` naming, while each module keeps the canonical lower-case region key inside `REGION_ENTRY.region`.

Source verification: run `python Tools/verify_region_modules.py` to validate every shipped region module against the active `fts_weather` period set and required `fts.region.v4` structure.

Repository layout:

```text
FTS/
  Backups/
  Documentation/
  Modules/
    Core/
      fts_atlas_0.1.0-alpha.1.js
      fts_calendar_0.2.0-alpha.1.js
      fts_core_0.2.0-alpha.1.js
      fts_mapMeta_0.2.0-alpha.1.js
      fts_weather_0.2.0-alpha.1.js
    Regions/
      fts_region<RegionName>_0.1.0-alpha.1.js
    Wizards/
      fts_mapPointWizard_0.2.0-alpha.1.js
      fts_wizards_0.1.0-alpha.1.js
  Templates/
  Tools/
```

Canonical weather/current sources used by the shipped modules:

- ECMWF ERA5 for monthly air temperature, precipitation, and prevailing-wind climatology
- Copernicus Marine Global Ocean Physics for seasonal current direction, strength, and subsurface temperature structure
- NOAA NCEI OISST for sea-surface temperature checks
- NOAA World Ocean Atlas / NOAA Science On a Sphere depth-temperature guidance for colder, more seasonally stable water at depth
- NOAA Ocean Service wave mechanics guidance plus the NWS wave glossary for treating chop as local short-period wind waves rather than total seas or distant swell
- NOAA NDBC buoy climatology and Copernicus Marine wave reanalysis for wave/chop sanity checks and future exposed-water baselines
- NOAA Ocean Service light-depth guidance plus NOAA CoastWatch Kd490 clarity guidance for underwater visibility falloff
- U.S. National Park Service cave-climate guidance for near-constant underdark temperatures and mostly dead-calm airflow
- USGS streamflow-measurement guidance for 20/60/80% inland and coastal water-column sampling

The underwater visibility bands are conservative body-type heuristics informed by NOAA light-depth and Kd490 guidance; FTS does not fetch live water-clarity grids at runtime.

Surface `chop` is currently modeled only for offshore and coastal surface locales. It is treated as local wind-driven wave roughness, so `!fts --weather set chop none|light|moderate|heavy|severe` simply raises or lowers the live wind band to the nearest compliant state, and dead calm always yields chop `none`.

