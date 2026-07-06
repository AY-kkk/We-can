"""Provider factory: pick implementation by env, injectable via Depends."""

from __future__ import annotations

from app.core.config import settings
from app.providers.base import LLMProvider, SearchProvider, TranscriberProvider
from app.providers.mock import (
    MockLLMProvider,
    MockSearchProvider,
    MockTranscriberProvider,
)


def get_llm_provider() -> LLMProvider:
    if settings.llm_provider == "openai_like":
        from app.providers.openai_like import OpenAILikeLLMProvider

        return OpenAILikeLLMProvider()
    return MockLLMProvider()


def get_search_provider() -> SearchProvider:
    if settings.search_provider == "http":
        from app.providers.openai_like import HttpSearchProvider

        return HttpSearchProvider()
    return MockSearchProvider()


def get_transcriber_provider() -> TranscriberProvider:
    if settings.transcriber_provider == "http":
        from app.providers.openai_like import HttpTranscriberProvider

        return HttpTranscriberProvider()
    return MockTranscriberProvider()
