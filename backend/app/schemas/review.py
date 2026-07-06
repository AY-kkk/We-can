"""Pydantic models for 栏目3 面试复盘."""

from __future__ import annotations

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int


class TranscribeRequest(BaseModel):
    file_id: str = Field(..., min_length=1)


class TranscribeResponse(BaseModel):
    transcript: str


class AnalyzeRequest(BaseModel):
    transcript: str = Field(..., min_length=1)
    title: str = "面试复盘"


class AnalyzeResponse(BaseModel):
    id: int
    title: str
    overall_score: int
    clarity_score: int
    structure_score: int
    confidence_score: int
    timeline: list[str]
    strengths: list[str]
    improvements: list[str]
    action_items: list[str]
    emotion: str


class ReviewHistoryItem(BaseModel):
    id: int
    title: str
    overall_score: int
    clarity_score: int
    structure_score: int
    confidence_score: int
    created_at: str
