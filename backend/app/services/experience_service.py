"""栏目5 经验帖集合 business logic."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import CollectedPost
from app.providers.base import SearchProvider
from app.schemas.experience import (
    CollectedItem,
    CollectRequest,
    ExperienceItem,
    ExperienceListResponse,
)

TRACKS = {
    "product": "产品",
    "sales": "销售",
    "operation": "运营",
    "algorithm": "算法",
    "frontend": "前端",
    "other": "其他",
}


async def search_experiences(
    track: str, query: str, search: SearchProvider
) -> ExperienceListResponse:
    track = track if track in TRACKS else "other"
    track_cn = TRACKS[track]
    q = f"{track_cn} {query} 秋招 经验".strip()
    results = await search.search(q, limit=9)
    items = [
        ExperienceItem(
            title=r.title,
            url=r.url,
            source=r.source,
            summary=r.summary,
            track=track,
        )
        for r in results
    ]
    return ExperienceListResponse(track=track, query=query, items=items)


async def collect(db: AsyncSession, req: CollectRequest) -> CollectedItem:
    existing = (
        (await db.execute(select(CollectedPost).where(CollectedPost.url == req.url)))
        .scalars()
        .first()
    )
    if existing:
        row = existing
    else:
        row = CollectedPost(
            title=req.title,
            url=req.url,
            source=req.source,
            summary=req.summary,
            track=req.track if req.track in TRACKS else "other",
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return CollectedItem(
        id=row.id,
        title=row.title,
        url=row.url,
        source=row.source,
        summary=row.summary,
        track=row.track,
    )


async def list_collected(db: AsyncSession) -> list[CollectedItem]:
    rows = (
        (await db.execute(select(CollectedPost).order_by(CollectedPost.created_at.desc())))
        .scalars()
        .all()
    )
    return [
        CollectedItem(
            id=r.id,
            title=r.title,
            url=r.url,
            source=r.source,
            summary=r.summary,
            track=r.track,
        )
        for r in rows
    ]


async def remove_collected(db: AsyncSession, item_id: int) -> bool:
    row = await db.get(CollectedPost, item_id)
    if not row:
        return False
    await db.delete(row)
    await db.commit()
    return True
