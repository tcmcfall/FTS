from __future__ import annotations

import re
from typing import Any


def snake_to_fts_camel(value: str) -> str:
    parts = str(value).split("_")
    return parts[0] + "".join(part[:1].upper() + part[1:] for part in parts[1:])


def normalize_key(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", " ", str(value or "")).strip()
    if not cleaned:
        return ""
    parts = cleaned.split()
    first = parts[0].lower()
    rest = [p[:1].upper() + p[1:].lower() for p in parts[1:]]
    return first + "".join(rest)


def transform_keys_to_fts_camel(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {snake_to_fts_camel(str(k)): transform_keys_to_fts_camel(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [transform_keys_to_fts_camel(item) for item in obj]
    return obj


def validate_fts_camel_keys(obj: Any, path: str = "$") -> None:
    if isinstance(obj, dict):
        for key, value in obj.items():
            if "_" in key or " " in key:
                raise ValueError(f"Invalid FTS JSON key at {path}: {key}")
            validate_fts_camel_keys(value, f"{path}.{key}")
    elif isinstance(obj, list):
        for index, item in enumerate(obj):
            validate_fts_camel_keys(item, f"{path}[{index}]")
