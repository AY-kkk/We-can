"""Pydantic models for 栏目4 秋招 Landing."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChecklistItemIn(BaseModel):
    category: str = "通用"
    title: str = Field(..., min_length=1)
    done: bool = False
    note: str = ""
    is_custom: bool = True


class ChecklistItemUpdate(BaseModel):
    id: int
    done: bool | None = None
    note: str | None = None
    title: str | None = None


class ChecklistItemOut(BaseModel):
    id: int
    category: str
    title: str
    done: bool
    note: str
    is_custom: bool


class PolishMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    audience: str = "HR"
    scenario: str = "入职沟通"
    channel: str = "微信"


class PolishedVersion(BaseModel):
    tone: str  # 温和版 | 直接版
    text: str


class PolishMessageResponse(BaseModel):
    goal_anchor: str
    audience_value: str
    interest_link: str
    versions: list[PolishedVersion]
    explanation: str
