"""栏目4 秋招 Landing routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.schemas.common import ok
from app.schemas.landing import (
    ChecklistItemIn,
    ChecklistItemUpdate,
    PolishMessageRequest,
)
from app.services import landing_service

router = APIRouter(prefix="/landing", tags=["landing"])


@router.get("/checklist")
async def get_checklist(db: AsyncSession = Depends(get_db)):
    rows = await landing_service.get_checklist(db)
    return ok([r.model_dump() for r in rows])


@router.post("/checklist")
async def add_checklist(item: ChecklistItemIn, db: AsyncSession = Depends(get_db)):
    row = await landing_service.add_item(db, item)
    return ok(row.model_dump())


@router.put("/checklist")
async def update_checklist(upd: ChecklistItemUpdate, db: AsyncSession = Depends(get_db)):
    row = await landing_service.update_item(db, upd)
    if not row:
        raise NotFoundError("清单项不存在")
    return ok(row.model_dump())


@router.delete("/checklist/{item_id}")
async def delete_checklist(item_id: int, db: AsyncSession = Depends(get_db)):
    okd = await landing_service.delete_item(db, item_id)
    if not okd:
        raise NotFoundError("清单项不存在")
    return ok({"deleted": item_id})


@router.post("/polish-message")
async def polish_message(req: PolishMessageRequest):
    result = landing_service.polish_message(req.message, req.audience, req.scenario, req.channel)
    return ok(result.model_dump())
