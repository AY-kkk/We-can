"""Pydantic models for 栏目5 经验帖集合."""

from __future__ import annotations

from pydantic import BaseModel, Field

TRACKS = ["product", "operation", "algorithm", "market", "frontend", "backend", "sales"]


class ExperienceItem(BaseModel):
    title: str
    url: str
    source: str
    summary: str
    track: str
    author: str = ""
    published_at: str = ""


class ExperienceListResponse(BaseModel):
    track: str
    query: str
    total: int
    items: list[ExperienceItem]


class CollectRequest(BaseModel):
    title: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    source: str = ""
    summary: str = ""
    track: str = "product"


class CollectedItem(BaseModel):
    id: int
    title: str
    url: str
    source: str
    summary: str
    track: str
