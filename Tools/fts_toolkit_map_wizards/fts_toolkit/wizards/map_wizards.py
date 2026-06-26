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
    AbilityScores,
    MapAgentProfile,
    MapLocaleProfile,
    MapPointProfile,
    MapRegionProfile,
    MapRouteProfile,
    RouteStop,
    SpeedProfile,
)
from fts_toolkit.wizards.common import (
    prompt_csv,
    prompt_multi_choice,
    prompt_politics_profile,
    prompt_power_profile,
    prompt_seasonal_trade,
    prompt_shared_fields,
    prompt_tier_0_5,
)

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
    actor_class = Prompt.ask(
        "Actor class",
        choices=["merchant", "pirate", "escort", "smuggler", "caravan", "patrol", "monster", "faction_proxy"],
        default="merchant",
    )
    platform_type = Prompt.ask(
        "Platform type",
        choices=["ship", "overland", "static_network", "mixed"],
        default="mixed",
    )
    ruleset_profile = Prompt.ask(
        "Ruleset profile",
        choices=["standard", "limithron", "naval_code", "hybrid"],
        default="standard",
    )
    home_point_key = normalize_key(Prompt.ask("Home point key", default=""))
    operating_region = normalize_key(Prompt.ask("Operating region key", default=fields["region"]))
    operating_locale = Prompt.ask(
        "Operating locale",
        choices=["offshore", "coastal", "inland", "underwater", "underdark"],
        default=fields["locale"],
    )

    armor_class = IntPrompt.ask("Armor Class (AC)", default=10)
    hit_points_max = IntPrompt.ask("Hit Points max", default=20)
    hit_points_current = IntPrompt.ask("Hit Points current", default=hit_points_max)
    hit_dice = Prompt.ask("Hit Dice", default="")
    proficiency_bonus = IntPrompt.ask("Proficiency Bonus", default=2)
    initiative_bonus = IntPrompt.ask("Initiative bonus", default=0)
    challenge_rating = Prompt.ask("Challenge Rating (CR)", default="")
    passive_perception = IntPrompt.ask("Passive Perception", default=10)

    console.print("[bold]Ability Scores[/bold] (5e style)")
    abilities = AbilityScores(
        strength=IntPrompt.ask("  STR", default=10),
        dexterity=IntPrompt.ask("  DEX", default=10),
        constitution=IntPrompt.ask("  CON", default=10),
        intelligence=IntPrompt.ask("  INT", default=10),
        wisdom=IntPrompt.ask("  WIS", default=10),
        charisma=IntPrompt.ask("  CHA", default=10),
    )

    console.print("[bold]Movement Speeds[/bold] in feet")
    speeds = SpeedProfile(
        walk=IntPrompt.ask("  Walk speed", default=30),
        swim=IntPrompt.ask("  Swim speed", default=0),
        fly=IntPrompt.ask("  Fly speed", default=0),
    )

    damage_threshold = IntPrompt.ask("Damage threshold", default=0)
    default_crew = 20 if platform_type == "ship" else 0
    crew_min = IntPrompt.ask("Crew minimum", default=0)
    crew_max = IntPrompt.ask("Crew maximum", default=default_crew)
    crew_current = IntPrompt.ask("Crew current", default=crew_max)
    passengers_capacity = IntPrompt.ask("Passengers capacity", default=0)
    cargo_capacity_raw = Prompt.ask("Cargo capacity (tons)", default="0")
    try:
        cargo_capacity_tons = float(cargo_capacity_raw)
    except ValueError:
        cargo_capacity_tons = 0.0
        console.print("[yellow]Invalid cargo capacity input. Using 0.[/yellow]")

    primary_roles = prompt_multi_choice(
        "Primary roles",
        ["hauler", "broker", "speculator", "raider", "enforcer", "scout", "blockade_runner", "convoy_support"],
    )
    cargo_intent = prompt_multi_choice(
        "Cargo intent",
        ["bulk_staples", "luxury", "military", "contraband", "passengers", "mixed"],
    )
    route_preferences = prompt_multi_choice(
        "Route preferences",
        ["shortest_time", "lowest_risk", "highest_margin", "faction_safe", "weather_safe", "law_avoidant"],
    )
    threat_sources = prompt_multi_choice(
        "Threat sources",
        ["piracy", "patrols", "storms", "scarcity", "warfare", "monsters"],
    )

    console.print("[bold]Posture Tiers[/bold] values use 0-5.")
    risk_tolerance = prompt_tier_0_5("Risk tolerance", default=3)
    threat_response = prompt_tier_0_5("Threat response", default=3)
    enforcement_sensitivity = prompt_tier_0_5("Enforcement sensitivity", default=3)
    weather_sensitivity = prompt_tier_0_5("Weather sensitivity", default=3)
    knowledge_range = prompt_tier_0_5("Knowledge range", default=3)
    diplomatic_bias = prompt_tier_0_5("Diplomatic bias", default=3)
    treasury_tier = prompt_tier_0_5("Treasury tier", default=3)
    crew_readiness = prompt_tier_0_5("Crew readiness", default=3)
    maintenance_reliability = prompt_tier_0_5("Maintenance reliability", default=3)
    current_load_state = prompt_tier_0_5("Current load state", default=3)
    operational_range_tier = prompt_tier_0_5("Operational range tier", default=3)
    schedule_rigidity = prompt_tier_0_5("Schedule rigidity", default=3)
    reroute_willingness = prompt_tier_0_5("Reroute willingness", default=3)
    escort_dependence = prompt_tier_0_5("Escort dependence", default=3)
    intercept_readiness = prompt_tier_0_5("Intercept readiness", default=3)
    stealth_emphasis = prompt_tier_0_5("Stealth emphasis", default=3)
    retreat_threshold = prompt_tier_0_5("Retreat threshold", default=3)

    entity = FtsMapEntity(
        **fields,
        map_agent_profile=MapAgentProfile(
            size=size,
            actor_class=actor_class,
            platform_type=platform_type,
            ruleset_profile=ruleset_profile,
            home_point_key=home_point_key,
            operating_region=operating_region,
            operating_locale=operating_locale,
            armor_class=armor_class,
            hit_points_max=hit_points_max,
            hit_points_current=hit_points_current,
            hit_dice=hit_dice,
            proficiency_bonus=proficiency_bonus,
            initiative_bonus=initiative_bonus,
            challenge_rating=challenge_rating,
            passive_perception=passive_perception,
            abilities=abilities,
            speeds=speeds,
            saving_throw_proficiencies=prompt_csv("Saving throw proficiencies", normalize=False),
            skill_proficiencies=prompt_csv("Skill proficiencies", normalize=False),
            senses=prompt_csv("Senses", normalize=False),
            languages=prompt_csv("Languages", normalize=False),
            damage_threshold=damage_threshold,
            crew_min=crew_min,
            crew_max=crew_max,
            crew_current=crew_current,
            passengers_capacity=passengers_capacity,
            cargo_capacity_tons=cargo_capacity_tons,
            primary_roles=primary_roles,
            cargo_intent=cargo_intent,
            route_preferences=route_preferences,
            threat_sources=threat_sources,
            risk_tolerance=risk_tolerance,
            threat_response=threat_response,
            enforcement_sensitivity=enforcement_sensitivity,
            weather_sensitivity=weather_sensitivity,
            knowledge_range=knowledge_range,
            diplomatic_bias=diplomatic_bias,
            treasury_tier=treasury_tier,
            crew_readiness=crew_readiness,
            maintenance_reliability=maintenance_reliability,
            current_load_state=current_load_state,
            operational_range_tier=operational_range_tier,
            schedule_rigidity=schedule_rigidity,
            reroute_willingness=reroute_willingness,
            escort_dependence=escort_dependence,
            intercept_readiness=intercept_readiness,
            stealth_emphasis=stealth_emphasis,
            retreat_threshold=retreat_threshold,
        ),
    )
    return _finish(entity, output_dir)
