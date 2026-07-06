"""Text helpers for splitting resume experiences into bullet items."""

from __future__ import annotations

import re

_BULLET_RE = re.compile(r"^[\s]*[-•·*▪●\d\.\)]+\s*")


def split_lines(text: str) -> list[str]:
    lines = [ln.strip() for ln in text.replace("\r", "\n").split("\n")]
    return [ln for ln in lines if ln]


def extract_experiences(text: str) -> list[str]:
    """Heuristically pull experience-like bullet lines from resume text."""
    items: list[str] = []
    for ln in split_lines(text):
        cleaned = _BULLET_RE.sub("", ln).strip()
        if len(cleaned) >= 8 and not cleaned.endswith(("：", ":")):
            items.append(cleaned)
    # de-dup while preserving order
    seen: set[str] = set()
    result = []
    for it in items:
        if it not in seen:
            seen.add(it)
            result.append(it)
    return result[:20]


def guess_sections(text: str) -> dict[str, list[str]]:
    """Very light section grouping by common headers."""
    headers = {
        "教育": ["教育", "education", "学历"],
        "经历": ["经历", "experience", "实习", "工作", "项目", "project"],
        "技能": ["技能", "skill", "能力"],
        "其他": [],
    }
    sections: dict[str, list[str]] = {k: [] for k in headers}
    current = "其他"
    for ln in split_lines(text):
        low = ln.lower()
        matched = None
        for name, kws in headers.items():
            if any(kw in low for kw in kws) and len(ln) <= 20:
                matched = name
                break
        if matched:
            current = matched
            continue
        sections[current].append(ln)
    return {k: v for k, v in sections.items() if v}
