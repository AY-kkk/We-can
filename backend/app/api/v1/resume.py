"""栏目1 简历打磨 routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response

from app.core.config import settings
from app.core.exceptions import ValidationAppError
from app.providers.base import LLMProvider
from app.providers.factory import get_llm_provider
from app.schemas.common import ok
from app.schemas.resume import (
    ExportPdfRequest,
    IntroRequest,
    PolishRequest,
)
from app.services import resume_service
from app.utils.files import extract_resume_text

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/parse")
async def parse(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise ValidationAppError(f"文件超过 {settings.max_upload_mb}MB 限制")
    text = extract_resume_text(file.filename or "", data)
    if not text.strip():
        raise ValidationAppError("未能从文件中提取到文本")
    return ok(resume_service.parse_resume(text).model_dump())


@router.post("/polish")
async def polish(req: PolishRequest, llm: LLMProvider = Depends(get_llm_provider)):
    result = resume_service.polish_resume(req.resume_text, req.jd_text, llm)
    return ok(result.model_dump())


@router.post("/intro")
async def intro(req: IntroRequest):
    result = resume_service.generate_intros(req.resume_text, req.jd_text)
    return ok(result.model_dump())


@router.post("/export-pdf")
async def export_pdf(req: ExportPdfRequest):
    pdf_bytes = resume_service.export_pdf(req.html)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"},
    )
