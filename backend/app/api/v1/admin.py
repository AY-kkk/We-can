"""Admin routes (require admin role)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_admin
from app.db.models import User
from app.db.session import get_db
from app.schemas.admin import ResetUserPasswordRequest, UpdateUserRequest
from app.schemas.common import ok
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def dashboard(_: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    stats = await admin_service.dashboard(db)
    return ok(stats.model_dump())


@router.get("/users")
async def list_users(
    q: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.list_users(db, q, page, page_size)
    return ok(result.model_dump())


@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    req: UpdateUserRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await admin_service.update_user(db, admin, user_id, req.is_active, req.role)
    return ok(result.model_dump())


@router.post("/users/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    req: ResetUserPasswordRequest,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.reset_user_password(db, user_id, req.new_password)
    return ok(None, message="密码已重置")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_user(db, admin, user_id)
    return ok({"deleted": user_id})
