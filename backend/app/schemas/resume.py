"""Pydantic models for 栏目1 简历打磨."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ResumeParseResponse(BaseModel):
    raw_text: str
    sections: dict[str, list[str]]
    experiences: list[str]


class PolishRequest(BaseModel):
    resume_text: str = Field(..., min_length=1)
    jd_text: str = Field("", description="目标岗位 JD 文本或链接")


class PolishedItem(BaseModel):
    original: str
    polished: str
    star: dict[str, str]


class PolishResponse(BaseModel):
    items: list[PolishedItem]
    resume_html: str


class IntroRequest(BaseModel):
    resume_text: str = Field(..., min_length=1)
    jd_text: str = ""


class IntroResponse(BaseModel):
    five_min: str
    two_min: str
    one_min: str


class ExportPdfRequest(BaseModel):
    html: str = Field(..., min_length=1)
