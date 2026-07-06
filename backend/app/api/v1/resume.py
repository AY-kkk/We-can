"""栏目1 简历打磨 routes (auth required, no persona)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.exceptions import ValidationAppError
from app.db.models import User
from app.db.session import get_db
from app.schemas.common import ok
from app.schemas.resume import ExportPdfRequest, IntroRequest, PolishRequest
from app.services import admin_service, resume_service
from app.utils.files import extract_resume_text

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/parse")
async def parse(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise ValidationAppError(f"文件超过 {settings.max_upload_mb}MB 限制")
    text = extract_resume_text(file.filename or "", data)
    if not text.strip():
        raise ValidationAppError("未能从文件中提取到文本")
    await admin_service.record_usage(db, user.id, "resume", "parse")
    return ok(resume_service.parse_resume(text).model_dump())


@router.post("/polish")
async def polish(
    req: PolishRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = resume_service.polish_resume(req.resume_text, req.jd_text)
    await admin_service.record_usage(db, user.id, "resume", "polish")
    return ok(result.model_dump())


@router.post("/intro")
async def intro(req: IntroRequest, user: User = Depends(get_current_user)):
    result = resume_service.generate_intros(req.resume_text, req.jd_text)
    return ok(result.model_dump())


@router.post("/export-pdf")
async def export_pdf(req: ExportPdfRequest, user: User = Depends(get_current_user)):
    pdf_bytes = resume_service.export_pdf(req.html)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"},
    )
