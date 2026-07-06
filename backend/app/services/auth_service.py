"""Authentication business logic: register/login/refresh/logout/reset."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AppError, NotFoundError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.models import RefreshToken, Role, User
from app.schemas.auth import TokenPair, UserOut


def _now() -> datetime:
    return datetime.now(UTC)


def _aware(dt: datetime | None) -> datetime | None:
    """SQLite returns naive datetimes; treat them as UTC for safe comparison."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=UTC)


def to_user_out(u: User) -> UserOut:
    return UserOut(
        id=u.id,
        email=u.email,
        username=u.username,
        role=u.role.value if isinstance(u.role, Role) else str(u.role),
        is_active=u.is_active,
        created_at=u.created_at.isoformat() if u.created_at else "",
        last_login=u.last_login.isoformat() if u.last_login else None,
    )


async def _issue_tokens(db: AsyncSession, user: User) -> TokenPair:
    access = create_access_token(str(user.id), user.role.value)
    refresh, jti, expires = create_refresh_token(str(user.id))
    db.add(RefreshToken(jti=jti, user_id=user.id, expires_at=expires))
    await db.commit()
    return TokenPair(access_token=access, refresh_token=refresh)


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    return (await db.execute(select(User).where(User.email == email.lower()))).scalars().first()


async def register(
    db: AsyncSession, email: str, username: str, password: str
) -> tuple[User, TokenPair]:
    if await get_by_email(db, email):
        raise AppError("该邮箱已被注册", code=409, status_code=409)
    user = User(
        email=email.lower(),
        username=username,
        password_hash=hash_password(password),
        role=Role.user,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    tokens = await _issue_tokens(db, user)
    return user, tokens


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, TokenPair]:
    user = await get_by_email(db, email)
    if not user:
        raise AppError("邮箱或密码错误", code=401, status_code=401)
    if user.locked_until and _aware(user.locked_until) > _now():
        raise AppError("登录尝试过多，账号已临时锁定，请稍后再试", code=423, status_code=423)
    if not verify_password(password, user.password_hash):
        user.failed_attempts += 1
        if user.failed_attempts >= settings.login_max_attempts:
            user.locked_until = _now() + timedelta(minutes=settings.login_lockout_minutes)
            user.failed_attempts = 0
        await db.commit()
        raise AppError("邮箱或密码错误", code=401, status_code=401)
    if not user.is_active:
        raise AppError("账号已被禁用，请联系管理员", code=403, status_code=403)
    user.failed_attempts = 0
    user.locked_until = None
    user.last_login = _now()
    await db.commit()
    tokens = await _issue_tokens(db, user)
    return user, tokens


async def refresh(db: AsyncSession, refresh_token: str) -> TokenPair:
    try:
        payload = decode_token(refresh_token)
    except Exception as exc:  # noqa: BLE001
        raise AppError("刷新令牌无效", code=401, status_code=401) from exc
    if payload.get("type") != "refresh":
        raise AppError("刷新令牌无效", code=401, status_code=401)
    jti = payload.get("jti")
    row = (await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))).scalars().first()
    if not row or row.revoked or _aware(row.expires_at) < _now():
        raise AppError("刷新令牌已失效，请重新登录", code=401, status_code=401)
    user = await db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise AppError("用户不可用", code=403, status_code=403)
    row.revoked = True  # rotate
    await db.commit()
    return await _issue_tokens(db, user)


async def logout(db: AsyncSession, refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token)
    except Exception:  # noqa: BLE001
        return
    row = (
        (await db.execute(select(RefreshToken).where(RefreshToken.jti == payload.get("jti"))))
        .scalars()
        .first()
    )
    if row:
        row.revoked = True
        await db.commit()


async def forgot_password(db: AsyncSession, email: str) -> str:
    """Return a short-lived reset token (mock email delivery)."""
    user = await get_by_email(db, email)
    if not user:
        # Do not leak existence; still return a token-like string.
        raise NotFoundError("若该邮箱已注册，将收到重置链接")
    token, _, _ = create_refresh_token(f"reset:{user.id}")
    return token


async def reset_password(db: AsyncSession, reset_token: str, new_password: str) -> None:
    try:
        payload = decode_token(reset_token)
    except Exception as exc:  # noqa: BLE001
        raise AppError("重置令牌无效或已过期", code=400, status_code=400) from exc
    sub = payload.get("sub", "")
    if not sub.startswith("reset:"):
        raise AppError("重置令牌无效", code=400, status_code=400)
    user = await db.get(User, int(sub.split(":", 1)[1]))
    if not user:
        raise NotFoundError("用户不存在")
    user.password_hash = hash_password(new_password)
    await db.commit()


async def seed_admin(db: AsyncSession) -> None:
    existing = await get_by_email(db, settings.admin_email)
    if existing:
        return
    admin = User(
        email=settings.admin_email.lower(),
        username=settings.admin_username,
        password_hash=hash_password(settings.admin_password),
        role=Role.admin,
    )
    db.add(admin)
    await db.commit()
