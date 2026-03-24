#!/usr/bin/env python3
"""Validate shipped DWT region modules against the live weather schema."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEATHER_MODULE = ROOT / "Modules" / "dwt_weather_0.1.0-alpha.1.js"
REGION_DIR = ROOT / "Modules" / "Region Modules"
CANONICAL_LOCALES = ["offshore", "coastal", "inland", "underwater", "underdark"]
SEASONS = ["winter", "spring", "summer", "autumn"]
CURRENT_SAMPLE_KEYS = ["surface", "shallow", "mid", "deep"]
TIMEOFDAY_SEGMENT_KEYS = [
    "earlypredawn",
    "latepredawn",
    "earlymorning",
    "latemorning",
    "earlyafternoon",
    "lateafternoon",
    "earlyevening",
    "lateevening",
]
REQUIRED_PERIOD_BLOCK_KEYS = [
    "temperature",
    "precipitation",
    "wind",
    "critical",
    "drift",
]
REQUIRED_LOCALE_KEYS = [
    "label",
    "environment",
    "biome",
    "climateMode",
]
REGION_FILE_PATTERN = "dwt_region.*_*.js"


def load_period_order(weather_path: Path) -> list[str]:
    text = weather_path.read_text(encoding="utf-8")
    marker = "var PERIOD_ORDER = ["
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f"Could not find PERIOD_ORDER in {weather_path}")
    start += len(marker)
    end = text.find("];", start)
    if end < 0:
        raise RuntimeError(f"Could not parse PERIOD_ORDER in {weather_path}")
    block = text[start:end]
    periods = re.findall(r"'([^']+)'", block)
    if not periods:
        raise RuntimeError(f"PERIOD_ORDER was empty in {weather_path}")
    return periods


def extract_region_entry(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    start_marker = "var REGION_ENTRY = "
    end_marker = "\n\n  function queueRegion(){"
    start = text.find(start_marker)
    if start < 0:
        raise RuntimeError(f"{path.name}: REGION_ENTRY start marker not found")
    start += len(start_marker)
    end = text.find(end_marker, start)
    if end < 0:
        raise RuntimeError(f"{path.name}: REGION_ENTRY end marker not found")
    raw = text[start:end].strip()
    if raw.endswith(";"):
        raw = raw[:-1].rstrip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{path.name}: REGION_ENTRY is not valid JSON: {exc}") from exc


def validate_period_block(label: str, block: dict, issues: list[str]) -> None:
    if not isinstance(block, dict):
        issues.append(f"{label} must be an object")
        return
    for key in REQUIRED_PERIOD_BLOCK_KEYS:
        if key not in block:
            issues.append(f"{label} is missing {key}")
    if "climateControl" in block:
        validate_climate_control(f"{label}.climateControl", block["climateControl"], issues, require_full=False)
    drift = block.get("drift")
    if not isinstance(drift, dict):
        issues.append(f"{label}.drift must be an object")
        return
    timeofday_segments = drift.get("timeofdaySegments")
    if not isinstance(timeofday_segments, dict):
        issues.append(f"{label}.drift.timeofdaySegments must be an object")
        return
    for segment_key in TIMEOFDAY_SEGMENT_KEYS:
        if not isinstance(timeofday_segments.get(segment_key), dict):
            issues.append(f"{label}.drift.timeofdaySegments.{segment_key} must be an object")


def validate_climate_control(
    label: str,
    control: dict,
    issues: list[str],
    *,
    require_full: bool,
) -> None:
    if not isinstance(control, dict):
        issues.append(f"{label} must be an object")
        return
    diurnal = control.get("diurnal")
    governor = control.get("governor")
    activation = control.get("activation")
    if diurnal is not None and not isinstance(diurnal, dict):
        issues.append(f"{label}.diurnal must be an object")
    elif require_full and not isinstance(diurnal, dict):
        issues.append(f"{label}.diurnal must be an object")
    elif isinstance(diurnal, dict):
        for key in ("lowTimeHHMM", "highTimeHHMM", "riseCurve", "fallCurve"):
            if require_full and key not in diurnal:
                issues.append(f"{label}.diurnal is missing {key}")
    if governor is not None and not isinstance(governor, dict):
        issues.append(f"{label}.governor must be an object")
    elif require_full and not isinstance(governor, dict):
        issues.append(f"{label}.governor must be an object")
    elif isinstance(governor, dict):
        for key in (
            "temperatureMaxDeltaF",
            "rainMaxStep",
            "skyMaxStep",
            "windMaxStep",
            "currentStrengthMaxDeltaPct",
            "currentTemperatureMaxDeltaF",
            "currentDirectionMaxStep",
            "interpolateWindStrength",
            "interpolateCurrentStrength",
            "interpolateCurrentTemperature",
        ):
            if require_full and key not in governor:
                issues.append(f"{label}.governor is missing {key}")
    if activation is not None and not isinstance(activation, dict):
        issues.append(f"{label}.activation must be an object")
    elif require_full and not isinstance(activation, dict):
        issues.append(f"{label}.activation must be an object")
    elif isinstance(activation, dict):
        for key in (
            "skyLeadMinutes",
            "precipitationDurationMinutes",
            "eventStartOffsetMinutes",
            "eventTailBufferMinutes",
        ):
            if require_full and not isinstance(activation.get(key), dict):
                issues.append(f"{label}.activation.{key} must be an object")
            elif key in activation and not isinstance(activation.get(key), dict):
                issues.append(f"{label}.activation.{key} must be an object")


def validate_locale_definition(label: str, locale_def: dict, period_order: list[str], issues: list[str]) -> None:
    if not isinstance(locale_def, dict):
        issues.append(f"{label} must be an object")
        return
    for key in REQUIRED_LOCALE_KEYS:
        if key not in locale_def:
            issues.append(f"{label} is missing {key}")
    if locale_def.get("useSeasonalCurrent") and not isinstance(locale_def.get("waterProfile"), dict):
        issues.append(f"{label}.waterProfile must exist when useSeasonalCurrent is true")
    if "climateControl" in locale_def:
        validate_climate_control(
            f"{label}.climateControl",
            locale_def["climateControl"],
            issues,
            require_full=False,
        )
    periods = locale_def.get("periods")
    if periods is None:
        return
    if not isinstance(periods, dict):
        issues.append(f"{label}.periods must be an object")
        return
    for period_key, period_block in periods.items():
        if period_key not in period_order:
            issues.append(f"{label}.periods.{period_key} is not a supported period")
            continue
        if not isinstance(period_block, dict):
            issues.append(f"{label}.periods.{period_key} must be an object")
            continue
        for field in REQUIRED_PERIOD_BLOCK_KEYS:
            if field in period_block and not isinstance(period_block[field], dict):
                issues.append(f"{label}.periods.{period_key}.{field} must be an object")
        if "climateControl" in period_block:
            validate_climate_control(
                f"{label}.periods.{period_key}.climateControl",
                period_block["climateControl"],
                issues,
                require_full=False,
            )


def validate_region_entry(path: Path, entry: dict, period_order: list[str]) -> list[str]:
    issues: list[str] = []
    region_name = entry.get("region")
    if entry.get("schema") != "dwt.region.v4":
        issues.append(f"schema is {entry.get('schema')!r}, expected 'dwt.region.v4'")
    if not isinstance(region_name, str) or not region_name.strip():
        issues.append("region is missing")
    match = re.match(r"^dwt_region\.(?P<region>.+?)_\d", path.name)
    stem_region = match.group("region") if match else ""
    if not stem_region:
        issues.append("filename does not match expected dwt_region.<region>_<version>.js pattern")
    elif isinstance(region_name, str) and region_name != stem_region:
        issues.append(f"region {region_name!r} does not match filename key {stem_region!r}")
    locales = entry.get("locales")
    if not isinstance(locales, list) or not locales:
        issues.append("locales is missing or empty")
        locales = []
    locale_set = set(locales)
    for locale in CANONICAL_LOCALES:
        if locale not in locale_set:
            issues.append(f"missing canonical locale {locale}")
    default_locale = entry.get("defaultLocale")
    if default_locale not in locale_set:
        issues.append("defaultLocale is not present in locales")
    if not isinstance(entry.get("campaignLocations"), list) or not entry["campaignLocations"]:
        issues.append("campaignLocations is missing or empty")
    if not isinstance(entry.get("sourceNotes"), list) or not entry["sourceNotes"]:
        issues.append("sourceNotes is missing or empty")
    if not isinstance(entry.get("referenceSources"), list) or not entry["referenceSources"]:
        issues.append("referenceSources is missing or empty")

    locale_definitions = entry.get("localeDefinitions")
    if not isinstance(locale_definitions, dict):
        issues.append("localeDefinitions is missing or invalid")
        locale_definitions = {}
    for locale in locales:
        if locale not in locale_definitions:
            issues.append(f"localeDefinitions is missing {locale}")
            continue
        validate_locale_definition(
            f"localeDefinitions.{locale}",
            locale_definitions[locale],
            period_order,
            issues,
        )

    weather = entry.get("weather")
    if not isinstance(weather, dict):
        issues.append("weather is missing or invalid")
        return issues
    validate_climate_control(
        "weather.climateControl",
        weather.get("climateControl"),
        issues,
        require_full=True,
    )

    periods = weather.get("periods")
    if not isinstance(periods, dict):
        issues.append("weather.periods is missing or invalid")
    else:
        actual_periods = list(periods.keys())
        if actual_periods != period_order:
            issues.append(
                "weather.periods keys do not match PERIOD_ORDER: "
                + f"expected {period_order}, got {actual_periods}"
            )
        for period_key in period_order:
            validate_period_block(f"weather.periods.{period_key}", periods.get(period_key), issues)

    seasonal_currents = weather.get("seasonalCurrents")
    if not isinstance(seasonal_currents, dict):
        issues.append("weather.seasonalCurrents is missing or invalid")
    else:
        actual_seasons = list(seasonal_currents.keys())
        if actual_seasons != SEASONS:
            issues.append(
                "weather.seasonalCurrents keys do not match expected seasons: "
                + f"expected {SEASONS}, got {actual_seasons}"
            )
        for season in SEASONS:
            block = seasonal_currents.get(season)
            if not isinstance(block, dict):
                issues.append(f"weather.seasonalCurrents.{season} must be an object")
                continue
            if "direction" not in block:
                issues.append(f"weather.seasonalCurrents.{season} is missing direction")
            readings = block.get("readings")
            if not isinstance(readings, dict):
                issues.append(f"weather.seasonalCurrents.{season}.readings must be an object")
                continue
            for sample_key in CURRENT_SAMPLE_KEYS:
                sample = readings.get(sample_key)
                if not isinstance(sample, dict):
                    issues.append(f"weather.seasonalCurrents.{season}.readings.{sample_key} must be an object")
                    continue
                for field in ("temperatureF", "strengthPct"):
                    if field not in sample:
                        issues.append(
                            f"weather.seasonalCurrents.{season}.readings.{sample_key} is missing {field}"
                        )

    return issues


def main() -> int:
    period_order = load_period_order(WEATHER_MODULE)
    region_files = sorted(REGION_DIR.glob(REGION_FILE_PATTERN))
    if not region_files:
        print(f"No region module files found under {REGION_DIR}", file=sys.stderr)
        return 1

    failures = 0
    for path in region_files:
        try:
            entry = extract_region_entry(path)
            issues = validate_region_entry(path, entry, period_order)
        except RuntimeError as exc:
            failures += 1
            print(f"FAIL {path.name}: {exc}")
            continue

        if issues:
            failures += 1
            print(f"FAIL {path.name}")
            for issue in issues:
                print(f"  - {issue}")
            continue

        print(f"OK   {path.name}")

    if failures:
        print(f"\nRegion module verification failed: {failures} file(s) have issues.", file=sys.stderr)
        return 1

    print(f"\nVerified {len(region_files)} region module(s) against {WEATHER_MODULE.name}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

