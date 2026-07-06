"""栏目2 笔面准备 routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.providers.base import SearchProvider
from app.providers.factory import get_search_provider
from app.schemas.common import ok
from app.schemas.prep import (
    MockInterviewRequest,
    QuestionBankRequest,
    QuestionsRequest,
)
from app.services import prep_service

router = APIRouter(prefix="/prep", tags=["prep"])


@router.post("/question-bank")
async def question_bank(
    req: QuestionBankRequest, search: SearchProvider = Depends(get_search_provider)
):
    result = await prep_service.build_question_bank(req.role, req.keyword, search)
    return ok(result.model_dump())


@router.post("/questions")
async def questions(req: QuestionsRequest):
    result = prep_service.generate_questions(req.role, req.resume_text)
    return ok(result.model_dump())


@router.post("/mock-interview")
async def mock_interview(req: MockInterviewRequest):
    result = prep_service.run_mock_interview(
        req.role, req.resume_text, req.session_id, req.answer, req.history
    )
    return ok(result.model_dump())
