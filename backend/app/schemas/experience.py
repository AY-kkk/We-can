"""Pydantic models for 栏目5 经验帖集合."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ExperienceItem(BaseModel):
    title: str
    url: str
    source: str
    summary: str
    track: str


class ExperienceListResponse(BaseModel):
    track: str
    query: str
    items: list[ExperienceItem]


class CollectRequest(BaseModel):
    title: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    source: str = ""
    summary: str = ""
    track: str = "other"


class CollectedItem(BaseModel):
    id: int
    title: str
    url: str
    source: str
    summary: str
    track: str
