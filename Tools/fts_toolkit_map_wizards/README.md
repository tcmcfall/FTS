# FTS Toolkit Map Wizards

Version: `0.2.0-alpha.2`

This package provides a lightweight Python CLI for creating validated FTS map hierarchy JSON:

- `mapRegion`
- `mapLocale`
- `mapPoint`
- `mapRoute`
- `mapAgent`

The prior `nationState` layer has been removed entirely.

## Windows PowerShell setup

From this project directory:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e .
```

If PowerShell blocks activation, run this once for your current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:

```powershell
.\.venv\Scripts\Activate.ps1
```

Alternative without activation:

```powershell
.\.venv\Scripts\python.exe -m pip install -e .
.\.venv\Scripts\fts-toolkit.exe --version
```

## macOS / Linux setup

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
```

## Commands

Show version:

```bash
fts-toolkit --version
```

Create a map point:

```bash
fts-toolkit entity create --type mapPoint
```

Create other entity types:

```bash
fts-toolkit entity create --type mapRegion
fts-toolkit entity create --type mapLocale
fts-toolkit entity create --type mapRoute
fts-toolkit entity create --type mapAgent
```

Validate exported JSON shape:

```bash
fts-toolkit entity validate-json-shape exports/mapPoint_oakbottom.json
```

## Export behavior

Python uses snake_case internally. Exported FTS JSON uses FTS modified camelCase.

## Power Profile

All power values use a 0-5 scale:

- `offense`
- `defense`
- `aggression`
- `mobility`

Projection values:

- `site`
- `local`
- `regional`
- `multiRegional`
- `global`

## MapAgent 5e-Adjacent Profile

`mapAgent` now captures a 5e-adjacent baseline:

- AC, HP, Hit Dice, Proficiency Bonus, CR, Initiative, Passive Perception
- STR/DEX/CON/INT/WIS/CHA ability scores
- Walk/Swim/Fly speeds
- Optional ship capacity fields (crew/passengers/cargo, damage threshold)

It also captures controlled `0-5` posture tiers and multi-select behavior tags:

- risk and threat posture
- enforcement/weather sensitivity
- route preferences
- role/cargo intent/threat sources

## Seasonal Trade Profile

Trade is organized by season:

```json
"tradeProfile": {
  "spring": { "has": [], "wants": [], "needs": [] },
  "summer": { "has": [], "wants": [], "needs": [] },
  "autumn": { "has": [], "wants": [], "needs": [] },
  "winter": { "has": [], "wants": [], "needs": [] }
}
```

## Notes

This is a CLI skeleton intended for iterative FTS development. It contains no backward compatibility layer for the removed `nationState` concept.
