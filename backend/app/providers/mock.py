"""Deterministic mock providers so the app runs with no API keys."""

from __future__ import annotations

import hashlib

from app.providers.base import LLMProvider, SearchProvider, SearchResult, TranscriberProvider


class MockLLMProvider(LLMProvider):
    """Returns short, plausible text. Deterministic given the prompt."""

    async def complete(self, system: str, prompt: str, *, temperature: float = 0.4) -> str:
        seed = hashlib.md5((system + prompt).encode("utf-8")).hexdigest()[:6]
        first_line = prompt.strip().splitlines()[0] if prompt.strip() else ""
        return (
            "【Mock LLM 输出】基于系统人格生成的示例内容。\n"
            f"针对输入「{first_line[:60]}」，建议突出可量化成果与结构化表达。\n"
            f"(mock-seed: {seed})"
        )


class MockSearchProvider(SearchProvider):
    async def search(self, query: str, *, limit: int = 10) -> list[SearchResult]:
        base = [
            SearchResult(
                title=f"{query} 高频面试题与答题思路整理",
                url="https://example.com/interview/guide",
                source="牛客网(示例)",
                summary=f"围绕「{query}」整理的高频考点与结构化答题模板，含 STAR 示例。",
            ),
            SearchResult(
                title=f"{query} 秋招上岸经验帖：从投递到 offer",
                url="https://example.com/experience/autumn",
                source="知乎(示例)",
                summary=f"一位同学分享「{query}」方向的秋招时间线、笔试准备与面试复盘。",
            ),
            SearchResult(
                title=f"{query} 岗位能力模型与项目拆解",
                url="https://example.com/skills/model",
                source="掘金(示例)",
                summary=f"拆解「{query}」岗位的核心能力项与可落地的项目练习路径。",
            ),
        ]
        return base[:limit]


class MockTranscriberProvider(TranscriberProvider):
    async def transcribe(self, audio_bytes: bytes, *, filename: str = "audio") -> str:
        size_kb = max(1, len(audio_bytes) // 1024)
        return (
            "面试官：请先做个简单的自我介绍。\n"
            "我：您好，我是一名应届生，主要方向是产品/技术，曾主导过一个校园项目，"
            "把活跃用户从 200 提升到 1500。\n"
            "面试官：你在项目里遇到的最大挑战是什么？\n"
            "我：最大的挑战是需求频繁变更，我通过建立优先级评审机制把返工率降低了 40%。\n"
            f"(mock 转写，音频约 {size_kb}KB)"
        )
