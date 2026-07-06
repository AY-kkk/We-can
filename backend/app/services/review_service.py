"""栏目3 面试复盘 business logic."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ReviewRecord
from app.schemas.review import AnalyzeResponse, ReviewHistoryItem


def _analyze_transcript(transcript: str) -> dict:
    lines = [ln.strip() for ln in transcript.splitlines() if ln.strip()]
    n_turns = len(lines)
    total_len = len(transcript)
    has_quant = any(c.isdigit() for c in transcript)
    has_structure = any(k in transcript for k in ["首先", "其次", "第一", "因为", "所以"])

    clarity = min(100, 55 + total_len // 60)
    structure = 82 if has_structure else 62
    confidence = min(100, 60 + n_turns * 3 + (10 if has_quant else 0))
    overall = round((clarity + structure + confidence) / 3)

    timeline = [f"要点{i + 1}: {ln[:50]}" for i, ln in enumerate(lines[:6])]
    strengths = []
    if has_quant:
        strengths.append("回答中包含量化数据，说服力强。")
    if has_structure:
        strengths.append("表达具备逻辑结构，条理清晰。")
    if not strengths:
        strengths.append("整体表达完整，态度真诚。")

    improvements = []
    if not has_quant:
        improvements.append("补充可量化成果，增强结果导向。")
    if not has_structure:
        improvements.append("使用 STAR / 分点结构，提升条理性。")
    if total_len < 200:
        improvements.append("内容偏少，可展开背景与个人贡献。")
    if not improvements:
        improvements.append("控制语速与停顿，让重点更突出。")

    action_items = [
        "整理 3 个可量化的项目成果并背熟。",
        "用 STAR 重写最常被问的 2 个问题。",
        "录制一次自述并回放，检查语速与口头禅。",
    ]
    emotion = "整体表达自信、情绪稳定" if confidence >= 75 else "略显紧张，建议放慢语速、增加停顿"
    return {
        "clarity_score": clarity,
        "structure_score": structure,
        "confidence_score": confidence,
        "overall_score": overall,
        "timeline": timeline,
        "strengths": strengths,
        "improvements": improvements,
        "action_items": action_items,
        "emotion": emotion,
    }


async def analyze_and_save(db: AsyncSession, transcript: str, title: str) -> AnalyzeResponse:
    result = _analyze_transcript(transcript)
    record = ReviewRecord(
        title=title,
        transcript=transcript,
        overall_score=result["overall_score"],
        clarity_score=result["clarity_score"],
        structure_score=result["structure_score"],
        confidence_score=result["confidence_score"],
        analysis={
            "timeline": result["timeline"],
            "strengths": result["strengths"],
            "improvements": result["improvements"],
            "action_items": result["action_items"],
            "emotion": result["emotion"],
        },
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return AnalyzeResponse(
        id=record.id,
        title=record.title,
        overall_score=record.overall_score,
        clarity_score=record.clarity_score,
        structure_score=record.structure_score,
        confidence_score=record.confidence_score,
        timeline=result["timeline"],
        strengths=result["strengths"],
        improvements=result["improvements"],
        action_items=result["action_items"],
        emotion=result["emotion"],
    )


async def list_history(db: AsyncSession) -> list[ReviewHistoryItem]:
    rows = (
        (await db.execute(select(ReviewRecord).order_by(ReviewRecord.created_at.asc())))
        .scalars()
        .all()
    )
    return [
        ReviewHistoryItem(
            id=r.id,
            title=r.title,
            overall_score=r.overall_score,
            clarity_score=r.clarity_score,
            structure_score=r.structure_score,
            confidence_score=r.confidence_score,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in rows
    ]
