"""Pydantic models for 栏目2 笔面准备."""

from __future__ import annotations

from pydantic import BaseModel, Field


class QuestionBankRequest(BaseModel):
    role: str = Field(..., min_length=1, description="目标岗位")
    keyword: str = ""


class BankItem(BaseModel):
    title: str
    url: str
    source: str
    summary: str


class QuestionBankResponse(BaseModel):
    role: str
    written_types: list[str]
    interview_questions: list[str]
    references: list[BankItem]


class QuestionsRequest(BaseModel):
    role: str = Field(..., min_length=1)
    resume_text: str = ""


class QuestionsResponse(BaseModel):
    common_questions: list[str]
    tailored_questions: list[str]


class MockTurn(BaseModel):
    role: str  # "interviewer" | "candidate"
    content: str


class MockInterviewRequest(BaseModel):
    role: str = Field(..., min_length=1)
    resume_text: str = ""
    session_id: str | None = None
    answer: str | None = None
    history: list[MockTurn] = []


class MockFeedback(BaseModel):
    content_score: int
    structure_score: int
    expression_score: int
    suggestions: list[str]


class MockInterviewResponse(BaseModel):
    session_id: str
    question: str
    finished: bool = False
    feedback: MockFeedback | None = None
    history: list[MockTurn] = []
