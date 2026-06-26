from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class FtsBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True, use_enum_values=True)


class EntityType(str, Enum):
    map_region = "mapRegion"
    map_locale = "mapLocale"
    map_point = "mapPoint"
    map_route = "mapRoute"
    map_agent = "mapAgent"


class LocaleKey(str, Enum):
    offshore = "offshore"
    coastal = "coastal"
    inland = "inland"
    underwater = "underwater"
    underdark = "underdark"


class Projection(str, Enum):
    site = "site"
    local = "local"
    regional = "regional"
    multi_regional = "multiRegional"
    global_ = "global"


class AgentSize(str, Enum):
    individual = "individual"
    small = "small"
    medium = "medium"
    large = "large"
    massive = "massive"


class ActorClass(str, Enum):
    merchant = "merchant"
    pirate = "pirate"
    escort = "escort"
    smuggler = "smuggler"
    caravan = "caravan"
    patrol = "patrol"
    monster = "monster"
    faction_proxy = "faction_proxy"


class PlatformType(str, Enum):
    ship = "ship"
    overland = "overland"
    static_network = "static_network"
    mixed = "mixed"


class RulesetProfile(str, Enum):
    standard = "standard"
    limithron = "limithron"
    naval_code = "naval_code"
    hybrid = "hybrid"


class RoleTag(str, Enum):
    hauler = "hauler"
    broker = "broker"
    speculator = "speculator"
    raider = "raider"
    enforcer = "enforcer"
    scout = "scout"
    blockade_runner = "blockade_runner"
    convoy_support = "convoy_support"


class CargoIntent(str, Enum):
    bulk_staples = "bulk_staples"
    luxury = "luxury"
    military = "military"
    contraband = "contraband"
    passengers = "passengers"
    mixed = "mixed"


class RoutePreference(str, Enum):
    shortest_time = "shortest_time"
    lowest_risk = "lowest_risk"
    highest_margin = "highest_margin"
    faction_safe = "faction_safe"
    weather_safe = "weather_safe"
    law_avoidant = "law_avoidant"


class ThreatSource(str, Enum):
    piracy = "piracy"
    patrols = "patrols"
    storms = "storms"
    scarcity = "scarcity"
    warfare = "warfare"
    monsters = "monsters"


class SeasonalTrade(FtsBaseModel):
    has: list[str] = Field(default_factory=list)
    wants: list[str] = Field(default_factory=list)
    needs: list[str] = Field(default_factory=list)


class TradeProfile(FtsBaseModel):
    spring: SeasonalTrade = Field(default_factory=SeasonalTrade)
    summer: SeasonalTrade = Field(default_factory=SeasonalTrade)
    autumn: SeasonalTrade = Field(default_factory=SeasonalTrade)
    winter: SeasonalTrade = Field(default_factory=SeasonalTrade)


class PoliticsProfile(FtsBaseModel):
    government: str = ""
    stability: int = Field(default=3, ge=0, le=5)
    law_level: int = Field(default=3, ge=0, le=5)
    corruption_level: int = Field(default=3, ge=0, le=5)


class PowerProfile(FtsBaseModel):
    offense: int = Field(default=0, ge=0, le=5)
    defense: int = Field(default=0, ge=0, le=5)
    aggression: int = Field(default=0, ge=0, le=5)
    projection: Projection = Projection.local
    mobility: int = Field(default=0, ge=0, le=5)


class RelationshipProfile(FtsBaseModel):
    allies: list[str] = Field(default_factory=list)
    enemies: list[str] = Field(default_factory=list)


class MapRegionProfile(FtsBaseModel):
    locales: list[LocaleKey] = Field(default_factory=list)
    default_locale: LocaleKey = LocaleKey.coastal


class MapLocaleProfile(FtsBaseModel):
    parent_region: str
    climate_analogue: str = ""
    environment: str = ""


class MapPointProfile(FtsBaseModel):
    population: int = Field(default=0, ge=0)
    development: int = Field(default=0, ge=0, le=5)
    wealth: int = Field(default=0, ge=0, le=5)
    security: int = Field(default=0, ge=0, le=5)


class RouteStop(FtsBaseModel):
    key: str
    name: str = ""


class MapRouteProfile(FtsBaseModel):
    origin: str
    destination: str
    stops: list[RouteStop] = Field(default_factory=list)
    distance: str = ""


class AbilityScores(FtsBaseModel):
    strength: int = Field(default=10, ge=1, le=30)
    dexterity: int = Field(default=10, ge=1, le=30)
    constitution: int = Field(default=10, ge=1, le=30)
    intelligence: int = Field(default=10, ge=1, le=30)
    wisdom: int = Field(default=10, ge=1, le=30)
    charisma: int = Field(default=10, ge=1, le=30)


class SpeedProfile(FtsBaseModel):
    walk: int = Field(default=30, ge=0, le=1000)
    swim: int = Field(default=0, ge=0, le=1000)
    fly: int = Field(default=0, ge=0, le=1000)


class MapAgentProfile(FtsBaseModel):
    size: AgentSize = AgentSize.small
    actor_class: ActorClass = ActorClass.merchant
    platform_type: PlatformType = PlatformType.mixed
    ruleset_profile: RulesetProfile = RulesetProfile.standard

    # Core identity and operating footprint.
    home_point_key: str = ""
    operating_region: str = ""
    operating_locale: str = ""

    # 5e-adjacent combat baseline.
    armor_class: int = Field(default=10, ge=0, le=40)
    hit_points_max: int = Field(default=1, ge=1, le=20000)
    hit_points_current: int = Field(default=1, ge=0, le=20000)
    hit_dice: str = ""
    proficiency_bonus: int = Field(default=2, ge=0, le=12)
    initiative_bonus: int = Field(default=0, ge=-20, le=20)
    challenge_rating: str = ""
    passive_perception: int = Field(default=10, ge=0, le=50)
    abilities: AbilityScores = Field(default_factory=AbilityScores)
    speeds: SpeedProfile = Field(default_factory=SpeedProfile)
    saving_throw_proficiencies: list[str] = Field(default_factory=list)
    skill_proficiencies: list[str] = Field(default_factory=list)
    senses: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)

    # Optional durability and capacity details, useful for ships.
    damage_threshold: int = Field(default=0, ge=0, le=1000)
    crew_min: int = Field(default=0, ge=0, le=100000)
    crew_max: int = Field(default=0, ge=0, le=100000)
    crew_current: int = Field(default=0, ge=0, le=100000)
    passengers_capacity: int = Field(default=0, ge=0, le=100000)
    cargo_capacity_tons: float = Field(default=0.0, ge=0.0, le=1000000.0)

    # Controlled-choice behavior arrays.
    primary_roles: list[RoleTag] = Field(default_factory=list)
    cargo_intent: list[CargoIntent] = Field(default_factory=list)
    route_preferences: list[RoutePreference] = Field(default_factory=list)
    threat_sources: list[ThreatSource] = Field(default_factory=list)

    # 0-5 posture model used by the wizard and export adapters.
    risk_tolerance: int = Field(default=3, ge=0, le=5)
    threat_response: int = Field(default=3, ge=0, le=5)
    enforcement_sensitivity: int = Field(default=3, ge=0, le=5)
    weather_sensitivity: int = Field(default=3, ge=0, le=5)
    knowledge_range: int = Field(default=3, ge=0, le=5)
    diplomatic_bias: int = Field(default=3, ge=0, le=5)
    treasury_tier: int = Field(default=3, ge=0, le=5)
    crew_readiness: int = Field(default=3, ge=0, le=5)
    maintenance_reliability: int = Field(default=3, ge=0, le=5)
    current_load_state: int = Field(default=3, ge=0, le=5)
    operational_range_tier: int = Field(default=3, ge=0, le=5)
    schedule_rigidity: int = Field(default=3, ge=0, le=5)
    reroute_willingness: int = Field(default=3, ge=0, le=5)
    escort_dependence: int = Field(default=3, ge=0, le=5)
    intercept_readiness: int = Field(default=3, ge=0, le=5)
    stealth_emphasis: int = Field(default=3, ge=0, le=5)
    retreat_threshold: int = Field(default=3, ge=0, le=5)

    @field_validator(
        "home_point_key",
        "operating_region",
        "operating_locale",
        "hit_dice",
        "challenge_rating",
        mode="before",
    )
    @classmethod
    def normalize_text_fields(cls, value: Any) -> str:
        return str(value or "").strip()

    @field_validator(
        "saving_throw_proficiencies",
        "skill_proficiencies",
        "senses",
        "languages",
        mode="before",
    )
    @classmethod
    def normalize_string_lists(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            raise TypeError("Expected a list of strings.")
        return [str(item).strip() for item in value if str(item or "").strip()]

    @model_validator(mode="after")
    def validate_profile_coherence(self) -> "MapAgentProfile":
        if self.hit_points_current > self.hit_points_max:
            raise ValueError("hit_points_current may not exceed hit_points_max.")
        if self.crew_min > self.crew_max:
            raise ValueError("crew_min may not exceed crew_max.")
        if self.crew_current > self.crew_max:
            raise ValueError("crew_current may not exceed crew_max.")
        if self.platform_type == PlatformType.ship and self.crew_max <= 0:
            raise ValueError("ship platform_type requires crew_max greater than zero.")
        if self.ruleset_profile in (RulesetProfile.limithron, RulesetProfile.naval_code, RulesetProfile.hybrid):
            if self.platform_type not in (PlatformType.ship, PlatformType.mixed):
                raise ValueError("naval ruleset_profile requires platform_type ship or mixed.")
        return self


class FtsMapEntity(FtsBaseModel):
    schema_name: str = "fts.mapEntity.v1"
    key: str
    name: str
    entity_type: EntityType
    region: str
    locale: str
    demographics: dict[str, str] = Field(default_factory=dict)
    politics: PoliticsProfile = Field(default_factory=PoliticsProfile)
    major_factions: list[str] = Field(default_factory=list)
    major_religions: list[str] = Field(default_factory=list)
    power_profile: PowerProfile = Field(default_factory=PowerProfile)
    trade_profile: TradeProfile = Field(default_factory=TradeProfile)
    relationships: RelationshipProfile = Field(default_factory=RelationshipProfile)
    tags: list[str] = Field(default_factory=list)
    map_region_profile: MapRegionProfile | None = None
    map_locale_profile: MapLocaleProfile | None = None
    map_point_profile: MapPointProfile | None = None
    map_route_profile: MapRouteProfile | None = None
    map_agent_profile: MapAgentProfile | None = None

    @field_validator("key", "name", "region", "locale")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = str(value or "").strip()
        if not value:
            raise ValueError("Field may not be empty.")
        return value

    @field_validator("major_factions", "major_religions", "tags", mode="before")
    @classmethod
    def normalize_string_lists(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            raise TypeError("Expected a list of strings.")
        return [str(item).strip() for item in value if str(item or "").strip()]

    @model_validator(mode="after")
    def validate_type_specific_profile(self) -> "FtsMapEntity":
        profiles = {
            EntityType.map_region: self.map_region_profile,
            EntityType.map_locale: self.map_locale_profile,
            EntityType.map_point: self.map_point_profile,
            EntityType.map_route: self.map_route_profile,
            EntityType.map_agent: self.map_agent_profile,
        }
        if profiles[self.entity_type] is None:
            raise ValueError(f"{self.entity_type} requires its matching profile object.")
        for entity_type, profile in profiles.items():
            if entity_type != self.entity_type and profile is not None:
                raise ValueError(f"{self.entity_type} may not include profile for {entity_type}.")
        return self


def validate_map_entity(data: dict[str, Any]) -> FtsMapEntity:
    return FtsMapEntity.model_validate(data)


def explain_validation_error(error: ValidationError) -> list[str]:
    messages: list[str] = []
    for issue in error.errors():
        location = ".".join(str(part) for part in issue.get("loc", []))
        message = issue.get("msg", "Invalid value.")
        messages.append(f"{location}: {message}")
    return messages
