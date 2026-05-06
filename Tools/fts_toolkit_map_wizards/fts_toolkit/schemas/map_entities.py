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


class MapAgentProfile(FtsBaseModel):
    size: AgentSize = AgentSize.small


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
