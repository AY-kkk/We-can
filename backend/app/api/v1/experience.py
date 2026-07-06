"""栏目5 经验帖集合 routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.providers.base import SearchProvider
from app.providers.factory import get_search_provider
from app.schemas.common import ok
from app.schemas.experience import CollectRequest
from app.services import experience_service

router = APIRouter(prefix="/experience", tags=["experience"])


@router.get("")
async def list_experiences(
    track: str = Query("other"),
    q: str = Query(""),
    search: SearchProvider = Depends(get_search_provider),
):
    result = await experience_service.search_experiences(track, q, search)
    return ok(result.model_dump())


@router.post("/collect")
async def collect(req: CollectRequest, db: AsyncSession = Depends(get_db)):
    row = await experience_service.collect(db, req)
    return ok(row.model_dump())


@router.get("/collected")
async def collected(db: AsyncSession = Depends(get_db)):
    rows = await experience_service.list_collected(db)
    return ok([r.model_dump() for r in rows])


@router.delete("/collected/{item_id}")
async def remove_collected(item_id: int, db: AsyncSession = Depends(get_db)):
    okd = await experience_service.remove_collected(db, item_id)
    if not okd:
        raise NotFoundError("收藏不存在")
    return ok({"deleted": item_id})
