from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from fts_toolkit.naming import transform_keys_to_fts_camel, validate_fts_camel_keys


def model_to_fts_json(model: BaseModel) -> dict[str, Any]:
    raw = model.model_dump(exclude_none=True)
    converted = transform_keys_to_fts_camel(raw)
    if "schemaName" in converted:
        converted["schema"] = converted.pop("schemaName")
    validate_fts_camel_keys(converted)
    return converted


def write_json_file(data: dict[str, Any], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return output_path
