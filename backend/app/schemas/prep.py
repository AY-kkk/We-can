"""Pydantic models for 栏目2 笔面准备."""

from __future__ import annotations

from pydantic import BaseModel, Field

TRACKS = ["product", "operation", "algorithm", "market", "frontend"]


class QuestionBankRequest(BaseModel):
    track: str = Field("product", description="方向: product/operation/algorithm/market/frontend")
    keyword: str = ""


class BankItem(BaseModel):
    title: str
    url: str
    source: str
    summary: str


class CategoryBlock(BaseModel):
    key: str
    label: str
    questions: list[str]


class QuestionBankResponse(BaseModel):
    track: str
    label: str
    persona: str
    total: int
    categories: list[CategoryBlock]
    references: list[BankItem]


class QuestionsRequest(BaseModel):
    track: str = "product"
    resume_text: str = ""


class QuestionsResponse(BaseModel):
    common_questions: list[str]
    tailored_questions: list[str]


class MockTurn(BaseModel):
    role: str  # "interviewer" | "candidate"
    content: str


class MockInterviewRequest(BaseModel):
    track: str = Field("product")
    resume_text: str = ""
    session_id: str | None = None
    answer: str | None = None
    history: list[MockTurn] = []


class MockFeedback(BaseModel):
    structure_score: int
    depth_score: int
    expression_score: int
    suggestions: list[str]


class MockInterviewResponse(BaseModel):
    session_id: str
    persona: str
    question: str
    finished: bool = False
    feedback: MockFeedback | None = None
    history: list[MockTurn] = []
