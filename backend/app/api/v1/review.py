"""栏目3 面试复盘 routes."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationAppError
from app.db.session import get_db
from app.providers.base import TranscriberProvider
from app.providers.factory import get_transcriber_provider
from app.schemas.common import ok
from app.schemas.review import AnalyzeRequest, TranscribeRequest
from app.services import review_service

router = APIRouter(prefix="/review", tags=["review"])


def _upload_dir() -> Path:
    p = Path(settings.upload_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise ValidationAppError(f"文件超过 {settings.max_upload_mb}MB 限制")
    file_id = uuid.uuid4().hex[:16]
    ext = Path(file.filename or "audio").suffix or ".bin"
    dest = _upload_dir() / f"{file_id}{ext}"
    dest.write_bytes(data)
    return ok({"file_id": f"{file_id}{ext}", "filename": file.filename, "size": len(data)})


@router.post("/transcribe")
async def transcribe(
    req: TranscribeRequest,
    transcriber: TranscriberProvider = Depends(get_transcriber_provider),
):
    path = _upload_dir() / req.file_id
    if not path.exists():
        raise NotFoundError("音频文件不存在，请先上传")
    text = await transcriber.transcribe(path.read_bytes(), filename=req.file_id)
    return ok({"transcript": text})


@router.post("/analyze")
async def analyze(req: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    result = await review_service.analyze_and_save(db, req.transcript, req.title)
    return ok(result.model_dump())


@router.get("/history")
async def history(db: AsyncSession = Depends(get_db)):
    rows = await review_service.list_history(db)
    return ok([r.model_dump() for r in rows])
