"""栏目4 秋招 Landing routes (user-scoped)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.exceptions import NotFoundError
from app.db.models import User
from app.db.session import get_db
from app.schemas.common import ok
from app.schemas.landing import (
    ChecklistItemIn,
    ChecklistItemUpdate,
    PolishMessageRequest,
)
from app.services import admin_service, landing_service

router = APIRouter(prefix="/landing", tags=["landing"])


@router.get("/checklist")
async def get_checklist(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await landing_service.get_checklist(db, user_id=user.id)
    return ok([r.model_dump() for r in rows])


@router.post("/checklist")
async def add_checklist(
    item: ChecklistItemIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await landing_service.add_item(db, item, user_id=user.id)
    return ok(row.model_dump())


@router.put("/checklist")
async def update_checklist(
    upd: ChecklistItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await landing_service.update_item(db, upd, user_id=user.id)
    if not row:
        raise NotFoundError("清单项不存在")
    return ok(row.model_dump())


@router.delete("/checklist/{item_id}")
async def delete_checklist(
    item_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    okd = await landing_service.delete_item(db, item_id, user_id=user.id)
    if not okd:
        raise NotFoundError("清单项不存在")
    return ok({"deleted": item_id})


@router.post("/polish-message")
async def polish_message(
    req: PolishMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = landing_service.polish_message(req.message, req.audience, req.scenario, req.channel)
    await admin_service.record_usage(db, user.id, "landing", "polish")
    return ok(result.model_dump())
