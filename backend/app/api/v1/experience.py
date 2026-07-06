"""栏目5 经验帖集合 routes (search public, collect user-scoped)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.exceptions import NotFoundError
from app.db.models import User
from app.db.session import get_db
from app.providers.base import SearchProvider
from app.providers.factory import get_search_provider
from app.schemas.common import ok
from app.schemas.experience import CollectRequest
from app.services import admin_service, experience_service

router = APIRouter(prefix="/experience", tags=["experience"])


@router.get("")
async def list_experiences(
    track: str = Query("product"),
    q: str = Query(""),
    source: str = Query(""),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    search: SearchProvider = Depends(get_search_provider),
):
    result = await experience_service.search_experiences(track, q, search, source=source)
    await admin_service.record_usage(db, user.id, "experience", "search")
    return ok(result.model_dump())


@router.post("/collect")
async def collect(
    req: CollectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await experience_service.collect(db, req, user_id=user.id)
    return ok(row.model_dump())


@router.get("/collected")
async def collected(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await experience_service.list_collected(db, user_id=user.id)
    return ok([r.model_dump() for r in rows])


@router.delete("/collected/{item_id}")
async def remove_collected(
    item_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    okd = await experience_service.remove_collected(db, item_id, user_id=user.id)
    if not okd:
        raise NotFoundError("收藏不存在")
    return ok({"deleted": item_id})
