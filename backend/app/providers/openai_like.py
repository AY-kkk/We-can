"""Real providers hitting OpenAI-compatible / HTTP APIs (opt-in via env)."""

from __future__ import annotations

import httpx

from app.core.config import settings
from app.core.exceptions import ProviderError
from app.providers.base import LLMProvider, SearchProvider, SearchResult, TranscriberProvider


class OpenAILikeLLMProvider(LLMProvider):
    """Chat Completions compatible provider."""

    async def complete(self, system: str, prompt: str, *, temperature: float = 0.4) -> str:
        if not settings.llm_api_key:
            raise ProviderError("未配置 LLM_API_KEY")
        url = f"{settings.llm_api_base.rstrip('/')}/chat/completions"
        payload = {
            "model": settings.llm_model,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        }
        headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except (httpx.HTTPError, KeyError, IndexError) as exc:
            raise ProviderError(f"LLM 调用失败: {exc}") from exc


class HttpSearchProvider(SearchProvider):
    """Generic HTTP search API returning a list of {title,url,source,summary}."""

    async def search(self, query: str, *, limit: int = 10) -> list[SearchResult]:
        if not settings.search_api_base:
            raise ProviderError("未配置 SEARCH_API_BASE")
        headers = {}
        if settings.search_api_key:
            headers["Authorization"] = f"Bearer {settings.search_api_key}"
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    settings.search_api_base,
                    params={"q": query, "limit": limit},
                    headers=headers,
                )
                resp.raise_for_status()
                items = resp.json().get("results", [])
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError(f"搜索调用失败: {exc}") from exc
        return [
            SearchResult(
                title=i.get("title", ""),
                url=i.get("url", ""),
                source=i.get("source", ""),
                summary=i.get("summary", ""),
            )
            for i in items[:limit]
        ]


class HttpTranscriberProvider(TranscriberProvider):
    async def transcribe(self, audio_bytes: bytes, *, filename: str = "audio") -> str:
        if not settings.transcriber_api_base:
            raise ProviderError("未配置 TRANSCRIBER_API_BASE")
        headers = {}
        if settings.transcriber_api_key:
            headers["Authorization"] = f"Bearer {settings.transcriber_api_key}"
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    settings.transcriber_api_base,
                    files={"file": (filename, audio_bytes)},
                    headers=headers,
                )
                resp.raise_for_status()
                return resp.json().get("text", "")
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError(f"转写调用失败: {exc}") from exc
