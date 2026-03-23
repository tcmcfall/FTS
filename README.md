# dwt
Date | Weather | Trade

What It Is

DWT is a Roll20 Mod/API suite that unifies campaign calendar, weather, map metadata, and travel/route tools behind a single !dwt command shell. The core module also owns a shared Campaign Log panel, help handout, UI palette, and startup provisioning for companion modules.

Who It's For

Primary persona: a Roll20 GM running a fantasy campaign who wants in-game time, regional weather, map context, and route/location tracking managed from chat commands, handouts, and macros. This is inferred from the repo's Roll20 API dependencies, GM-only controls, handout creation, and macro provisioning.

What It Does

1.	Provides a unified !dwt panel, help system, and Campaign Log macro.
2.	Creates and updates a Campaign Calendar handout with Harptos dates and navigation links.
3.	Tracks weather state, history, regional currents, critical events, and an animated windsock token on the active page.
4.	Loads unified `dwt.region.v4` region modules with Harptos month and festival weather periods, required `weather.climateControl` diurnal/governor settings, explicit per-segment `drift.timeofdaySegments`, depth-aware seasonal current readings, configurable locale `waterProfile` data, manual weather tables, and built-in critical-event templates.
5.	Captures active-page map metadata and stores it as JSON for reuse by other modules, including region and locale page metadata plus optional depth or elevation metadata on any unified locale page.
6.	Builds named routes and static map locations from token positions and map metadata.

Current shipped region modules live in `Modules/Region Modules/dwt_region.<regionKey>_5.1.0.js`.

Source verification: run `python Tools/verify_region_modules.py` to validate every shipped region module against the active `dwt_weather` period set and required `dwt.region.v4` structure.

Canonical weather/current sources used by the shipped modules:

- ECMWF ERA5 for monthly air temperature, precipitation, and prevailing-wind climatology
- Copernicus Marine Global Ocean Physics for seasonal current direction, strength, and subsurface temperature structure
- NOAA NCEI OISST for sea-surface temperature checks
- USGS streamflow-measurement guidance for 20/60/80% inland and coastal water-column sampling
