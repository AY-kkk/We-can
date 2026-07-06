"""Load structured seed data (question bank, experiences) from JSON files."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_SEED_DIR = Path(__file__).resolve().parents[1] / "db" / "seeds"


@lru_cache
def load_question_bank() -> dict:
    path = _SEED_DIR / "questionbank.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache
def load_experiences() -> dict:
    path = _SEED_DIR / "experiences.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
