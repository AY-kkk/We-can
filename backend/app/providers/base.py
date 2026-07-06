"""Abstract provider interfaces for LLM / Search / Transcription."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SearchResult:
    title: str
    url: str
    source: str
    summary: str


class LLMProvider(ABC):
    """Chat-style LLM abstraction."""

    @abstractmethod
    async def complete(self, system: str, prompt: str, *, temperature: float = 0.4) -> str:
        """Return a text completion for the given system + user prompt."""


class SearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str, *, limit: int = 10) -> list[SearchResult]:
        """Return structured search results."""


class TranscriberProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, *, filename: str = "audio") -> str:
        """Return transcribed text from audio bytes."""
