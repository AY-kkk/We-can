"""栏目5 经验帖集合 business logic (seed-backed, multi-source)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import CollectedPost
from app.providers.base import SearchProvider
from app.schemas.experience import (
    CollectedItem,
    CollectRequest,
    ExperienceItem,
    ExperienceListResponse,
)
from app.services.seed_loader import load_experiences

TRACKS = {
    "product": "产品",
    "operation": "运营",
    "algorithm": "算法",
    "market": "市场",
    "frontend": "前端",
}


def _normalize_track(track: str) -> str:
    return track if track in TRACKS else "product"


async def search_experiences(
    track: str,
    query: str,
    search: SearchProvider,
    source: str = "",
) -> ExperienceListResponse:
    track = _normalize_track(track)
    seed = load_experiences().get(track, [])

    items = [
        ExperienceItem(
            title=it["title"],
            url=it["url"],
            source=it["source"],
            summary=it["summary"],
            track=track,
            author=it.get("author", ""),
            published_at=it.get("published_at", ""),
        )
        for it in seed
    ]

    if query:
        ql = query.lower()
        items = [it for it in items if ql in it.title.lower() or ql in it.summary.lower()]
    if source:
        items = [it for it in items if it.source == source]

    # Best-effort live augmentation, ONLY when a real HTTP search provider is
    # configured. Under the default mock provider we skip this so users never
    # see placeholder/dead links (e.g. example.com) mixed into real posts.
    if settings.search_provider == "http":
        try:
            results = await search.search(f"{TRACKS[track]} {query} 秋招 经验".strip(), limit=3)
            seen = {it.url for it in items}
            for r in results:
                if r.url not in seen:
                    items.append(
                        ExperienceItem(
                            title=r.title,
                            url=r.url,
                            source=r.source,
                            summary=r.summary,
                            track=track,
                        )
                    )
                    seen.add(r.url)
        except Exception:  # noqa: BLE001
            pass

    return ExperienceListResponse(track=track, query=query, total=len(items), items=items)


async def collect(
    db: AsyncSession, req: CollectRequest, user_id: int | None = None
) -> CollectedItem:
    existing = (
        (
            await db.execute(
                select(CollectedPost).where(
                    CollectedPost.url == req.url,
                    CollectedPost.user_id == user_id,
                )
            )
        )
        .scalars()
        .first()
    )
    if existing:
        row = existing
    else:
        row = CollectedPost(
            user_id=user_id,
            title=req.title,
            url=req.url,
            source=req.source,
            summary=req.summary,
            track=_normalize_track(req.track),
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


async def list_collected(db: AsyncSession, user_id: int | None = None) -> list[CollectedItem]:
    stmt = (
        select(CollectedPost)
        .where(CollectedPost.user_id == user_id)
        .order_by(CollectedPost.created_at.desc())
    )
    rows = (await db.execute(stmt)).scalars().all()
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


async def remove_collected(db: AsyncSession, item_id: int, user_id: int | None = None) -> bool:
    row = await db.get(CollectedPost, item_id)
    if not row or row.user_id != user_id:
        return False
    await db.delete(row)
    await db.commit()
    return True
