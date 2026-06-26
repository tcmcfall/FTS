from __future__ import annotations

from rich.console import Console
from rich.prompt import IntPrompt, Prompt

from fts_toolkit.naming import normalize_key
from fts_toolkit.schemas.map_entities import PowerProfile, PoliticsProfile, SeasonalTrade, TradeProfile

console = Console()


def prompt_csv(label: str, normalize: bool = True) -> list[str]:
    raw = Prompt.ask(label, default="")
    values: list[str] = []
    for item in raw.split(","):
        text = item.strip()
        if text:
            values.append(normalize_key(text) if normalize else text)
    return values


def prompt_tier_0_5(label: str, default: int = 3) -> int:
    return IntPrompt.ask(label, default=default, choices=["0", "1", "2", "3", "4", "5"])


def _normalize_choice_token(value: str) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def prompt_multi_choice(label: str, choices: list[str], default: str = "") -> list[str]:
    normalized_map = {_normalize_choice_token(choice): choice for choice in choices}
    raw = Prompt.ask(f"{label} (comma-separated)", default=default)
    out: list[str] = []
    invalid: list[str] = []
    for item in raw.split(","):
        token = _normalize_choice_token(item)
        if not token:
            continue
        if token in normalized_map:
            value = normalized_map[token]
            if value not in out:
                out.append(value)
        else:
            invalid.append(str(item).strip())
    if invalid:
        console.print(f"[yellow]Ignored unknown {label} values:[/yellow] {', '.join(invalid)}")
    return out


def prompt_shared_fields() -> dict:
    name = Prompt.ask("Display name")
    key = normalize_key(Prompt.ask("Key", default=normalize_key(name)))
    region = normalize_key(Prompt.ask("Region", default="landsOfIntrigue"))
    locale = Prompt.ask("Locale", choices=["offshore", "coastal", "inland", "underwater", "underdark"], default="coastal")
    return {"key": key, "name": name, "region": region, "locale": locale}


def prompt_power_profile() -> PowerProfile:
    console.print("[bold]Power Profile[/bold] values use 0-5.")
    return PowerProfile(
        offense=IntPrompt.ask("Offense", default=0),
        defense=IntPrompt.ask("Defense", default=0),
        aggression=IntPrompt.ask("Aggression", default=0),
        projection=Prompt.ask("Projection", choices=["site", "local", "regional", "multiRegional", "global"], default="local"),
        mobility=IntPrompt.ask("Mobility", default=0),
    )


def prompt_politics_profile() -> PoliticsProfile:
    return PoliticsProfile(
        government=Prompt.ask("Government / authority", default=""),
        stability=IntPrompt.ask("Stability 0-5", default=3),
        law_level=IntPrompt.ask("Law level 0-5", default=3),
        corruption_level=IntPrompt.ask("Corruption level 0-5", default=3),
    )


def prompt_seasonal_trade() -> TradeProfile:
    seasons = {}
    for season in ["spring", "summer", "autumn", "winter"]:
        console.print(f"[bold]{season.title()} Trade[/bold]")
        seasons[season] = SeasonalTrade(
            has=prompt_csv("  Has", normalize=True),
            wants=prompt_csv("  Wants", normalize=True),
            needs=prompt_csv("  Needs", normalize=True),
        )
    return TradeProfile(**seasons)
