from __future__ import annotations

from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, IntPrompt, Prompt
from rich.table import Table

from fts_toolkit.exporter import model_to_fts_json, write_json_file
from fts_toolkit.naming import normalize_key
from fts_toolkit.schemas.map_entities import (
    FtsMapEntity,
    MapAgentProfile,
    MapLocaleProfile,
    MapPointProfile,
    MapRegionProfile,
    MapRouteProfile,
    RouteStop,
)
from fts_toolkit.wizards.common import prompt_csv, prompt_politics_profile, prompt_power_profile, prompt_seasonal_trade, prompt_shared_fields

console = Console()


def _review(entity: FtsMapEntity) -> None:
    table = Table(title=f"{entity.entity_type} Review")
    table.add_column("Field")
    table.add_column("Value")
    table.add_row("Key", entity.key)
    table.add_row("Name", entity.name)
    table.add_row("Region", entity.region)
    table.add_row("Locale", entity.locale)
    table.add_row("Factions", ", ".join(entity.major_factions) or "None")
    table.add_row("Religions", ", ".join(entity.major_religions) or "None")
    table.add_row("Tags", ", ".join(entity.tags) or "None")
    console.print(table)


def _finish(entity: FtsMapEntity, output_dir: Path) -> Path | None:
    _review(entity)
    if not Confirm.ask("Export this entity?", default=True):
        console.print("[yellow]Export cancelled.[/yellow]")
        return None
    data = model_to_fts_json(entity)
    output_path = output_dir / f"{entity.entity_type}_{entity.key}.json"
    write_json_file(data, output_path)
    console.print(f"[green]Exported:[/green] {output_path}")
    return output_path


def _shared_entity_kwargs(entity_type: str) -> dict:
    console.print(Panel.fit(f"FTS {entity_type} Wizard", title="Fantasy Trade Simulator Toolkit"))
    fields = prompt_shared_fields()
    fields["entity_type"] = entity_type
    fields["politics"] = prompt_politics_profile()
    fields["major_factions"] = prompt_csv("Major factions")
    fields["major_religions"] = prompt_csv("Major religions")
    fields["power_profile"] = prompt_power_profile()
    fields["trade_profile"] = prompt_seasonal_trade()
    fields["tags"] = prompt_csv("Tags")
    return fields


def create_map_region(output_dir: Path) -> Path | None:
    fields = _shared_entity_kwargs("mapRegion")
    locales = prompt_csv("Supported locales", normalize=True) or ["coastal"]
    default_locale = Prompt.ask("Default locale", choices=["offshore", "coastal", "inland", "underwater", "underdark"], default="coastal")
    entity = FtsMapEntity(**fields, map_region_profile=MapRegionProfile(locales=locales, default_locale=default_locale))
    return _finish(entity, output_dir)


def create_map_locale(output_dir: Path) -> Path | None:
    fields = _shared_entity_kwargs("mapLocale")
    parent_region = normalize_key(Prompt.ask("Parent region", default=fields["region"]))
    entity = FtsMapEntity(**fields, map_locale_profile=MapLocaleProfile(parent_region=parent_region, climate_analogue=Prompt.ask("Climate analogue", default=""), environment=Prompt.ask("Environment", default="")))
    return _finish(entity, output_dir)


def create_map_point(output_dir: Path) -> Path | None:
    fields = _shared_entity_kwargs("mapPoint")
    entity = FtsMapEntity(**fields, map_point_profile=MapPointProfile(population=IntPrompt.ask("Population", default=0), development=IntPrompt.ask("Development 0-5", default=0), wealth=IntPrompt.ask("Wealth 0-5", default=0), security=IntPrompt.ask("Security 0-5", default=0)))
    return _finish(entity, output_dir)


def create_map_route(output_dir: Path) -> Path | None:
    fields = _shared_entity_kwargs("mapRoute")
    origin = normalize_key(Prompt.ask("Origin map point key"))
    destination = normalize_key(Prompt.ask("Destination map point key"))
    stops: list[RouteStop] = []
    while Confirm.ask("Add an intermediate stop?", default=False):
        stop_name = Prompt.ask("Stop display name")
        stops.append(RouteStop(key=normalize_key(stop_name), name=stop_name))
    entity = FtsMapEntity(**fields, map_route_profile=MapRouteProfile(origin=origin, destination=destination, stops=stops, distance=Prompt.ask("Distance", default="")))
    return _finish(entity, output_dir)


def create_map_agent(output_dir: Path) -> Path | None:
    fields = _shared_entity_kwargs("mapAgent")
    size = Prompt.ask("Size", choices=["individual", "small", "medium", "large", "massive"], default="small")
    entity = FtsMapEntity(**fields, map_agent_profile=MapAgentProfile(size=size))
    return _finish(entity, output_dir)
