"""FastAPI dependency providers (DB + external providers)."""

from __future__ import annotations

from app.db.session import get_db  # noqa: F401  re-export
from app.providers.factory import (
    get_llm_provider,
    get_search_provider,
    get_transcriber_provider,
)

__all__ = [
    "get_db",
    "get_llm_provider",
    "get_search_provider",
    "get_transcriber_provider",
]
