from __future__ import annotations

import json
from pathlib import Path

import typer
from rich.console import Console

from fts_toolkit import __version__
from fts_toolkit.wizards.map_wizards import create_map_agent, create_map_locale, create_map_point, create_map_region, create_map_route

app = typer.Typer(name="fts-toolkit", help="Fantasy Trade Simulator Toolkit CLI.")
entity_app = typer.Typer(help="Create and validate FTS map hierarchy entities.")
app.add_typer(entity_app, name="entity")
console = Console()


@app.callback()
def main(version: bool = typer.Option(False, "--version", help="Show version and exit.")) -> None:
    if version:
        console.print(f"fts-toolkit {__version__}")
        raise typer.Exit()


@entity_app.command("create")
def entity_create(
    entity_type: str = typer.Option(..., "--type", "-t", help="mapRegion, mapLocale, mapPoint, mapRoute, or mapAgent."),
    output_dir: Path = typer.Option(Path("exports"), "--output-dir", "-o", help="Directory where exported JSON files are written."),
) -> None:
    handlers = {
        "mapRegion": create_map_region,
        "mapLocale": create_map_locale,
        "mapPoint": create_map_point,
        "mapRoute": create_map_route,
        "mapAgent": create_map_agent,
    }
    handler = handlers.get(entity_type.strip())
    if handler is None:
        console.print("[red]Invalid entity type.[/red] Use mapRegion, mapLocale, mapPoint, mapRoute, or mapAgent.")
        raise typer.Exit(1)
    handler(output_dir)


@entity_app.command("validate-json-shape")
def entity_validate_json_shape(file_path: Path = typer.Argument(..., help="Path to exported FTS JSON.")) -> None:
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
    except Exception as exc:
        console.print(f"[red]Could not read JSON:[/red] {exc}")
        raise typer.Exit(1)

    required = ["schema", "key", "name", "entityType", "region", "locale"]
    missing = [key for key in required if key not in data]
    if missing:
        console.print(f"[red]Missing required key(s):[/red] {', '.join(missing)}")
        raise typer.Exit(1)

    allowed_types = {"mapRegion", "mapLocale", "mapPoint", "mapRoute", "mapAgent"}
    if data["entityType"] not in allowed_types:
        console.print(f"[red]Invalid entityType:[/red] {data['entityType']}")
        raise typer.Exit(1)

    profile_key = f"{data['entityType']}Profile"
    if profile_key not in data:
        console.print(f"[red]Missing matching profile:[/red] {profile_key}")
        raise typer.Exit(1)

    console.print("[green]Exported FTS JSON shape is valid.[/green]")
