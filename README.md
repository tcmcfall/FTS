# dwt
Date | Weather | Trade

What It Is
DWT is a Roll20 Mod/API suite that unifies campaign calendar, weather, map metadata, and travel/route tools behind a single !dwt command shell. The core module also owns a shared Campaign Log panel, help handout, UI palette, and startup provisioning for companion modules.

Who It's For
Primary persona: a Roll20 GM running a fantasy campaign who wants in-game time, regional weather, map context, and route/location tracking managed from chat commands, handouts, and macros. This is inferred from the repo's Roll20 API dependencies, GM-only controls, handout creation, and macro provisioning.

What It Does
1.	Provides a unified !dwt panel, help system, and Campaign Log macro.
2.	Creates and updates a Campaign Calendar handout with Harptos dates and navigation links.
3.	Tracks weather state, history, events, and an animated windsock token on the active page.
4.	Loads regional weather profiles from separate regionWeather.* modules.
5.	Captures active-page map metadata and stores it as JSON for reuse by other modules.
6.	Builds named routes and static map locations from token positions and map metadata.
