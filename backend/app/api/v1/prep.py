"""栏目2 笔面准备 routes (persona-switchable, seed-backed bank)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.providers.base import SearchProvider
from app.providers.factory import get_search_provider
from app.schemas.common import ok
from app.schemas.prep import (
    MockInterviewRequest,
    QuestionBankRequest,
    QuestionsRequest,
)
from app.services import admin_service, prep_service

router = APIRouter(prefix="/prep", tags=["prep"])


@router.post("/question-bank")
async def question_bank(
    req: QuestionBankRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    search: SearchProvider = Depends(get_search_provider),
):
    result = await prep_service.build_question_bank(req.track, req.keyword, search)
    await admin_service.record_usage(db, user.id, "prep", "question-bank")
    return ok(result.model_dump())


@router.post("/questions")
async def questions(req: QuestionsRequest, user: User = Depends(get_current_user)):
    result = prep_service.generate_questions(req.track, req.resume_text)
    return ok(result.model_dump())


@router.post("/mock-interview")
async def mock_interview(
    req: MockInterviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = prep_service.run_mock_interview(
        req.track, req.resume_text, req.session_id, req.answer, req.history
    )
    await admin_service.record_usage(db, user.id, "prep", "mock-interview")
    return ok(result.model_dump())
