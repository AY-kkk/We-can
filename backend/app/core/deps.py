"""FastAPI dependency providers (DB + providers + auth guards)."""

from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.core.security import decode_token
from app.db.models import Role, User
from app.db.session import get_db
from app.providers.factory import (
    get_llm_provider,
    get_search_provider,
    get_transcriber_provider,
)

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if creds is None:
        raise AppError("未登录或缺少令牌", code=401, status_code=401)
    try:
        payload = decode_token(creds.credentials)
    except Exception as exc:  # noqa: BLE001
        raise AppError("令牌无效或已过期", code=401, status_code=401) from exc
    if payload.get("type") != "access":
        raise AppError("令牌类型错误", code=401, status_code=401)
    user = await db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise AppError("用户不可用", code=403, status_code=403)
    return user


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != Role.admin:
        raise AppError("需要管理员权限", code=403, status_code=403)
    return user


__all__ = [
    "get_db",
    "get_current_user",
    "get_current_admin",
    "get_llm_provider",
    "get_search_provider",
    "get_transcriber_provider",
]
