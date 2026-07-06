"""Admin dashboard + user management logic."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, NotFoundError
from app.core.security import hash_password
from app.db.models import Role, UsageEvent, User
from app.schemas.admin import AdminUserOut, DashboardStats, UserListResponse


def _to_admin_out(u: User) -> AdminUserOut:
    return AdminUserOut(
        id=u.id,
        email=u.email,
        username=u.username,
        role=u.role.value if isinstance(u.role, Role) else str(u.role),
        is_active=u.is_active,
        created_at=u.created_at.isoformat() if u.created_at else "",
        last_login=u.last_login.isoformat() if u.last_login else None,
    )


async def list_users(db: AsyncSession, q: str, page: int, page_size: int) -> UserListResponse:
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    stmt = select(User)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(func.lower(User.email).like(like) | func.lower(User.username).like(like))
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    rows = (
        (
            await db.execute(
                stmt.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size)
            )
        )
        .scalars()
        .all()
    )
    return UserListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[_to_admin_out(u) for u in rows],
    )


async def update_user(
    db: AsyncSession,
    actor: User,
    user_id: int,
    is_active: bool | None,
    role: str | None,
) -> AdminUserOut:
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError("用户不存在")
    if user.id == actor.id and (is_active is False or role == "user"):
        raise AppError("不能对当前登录的管理员降级或禁用", code=400, status_code=400)
    if is_active is not None:
        user.is_active = is_active
    if role is not None:
        if role not in (Role.user.value, Role.admin.value):
            raise AppError("非法角色", code=400, status_code=400)
        user.role = Role(role)
    await db.commit()
    await db.refresh(user)
    return _to_admin_out(user)


async def reset_user_password(db: AsyncSession, user_id: int, new_password: str) -> None:
    if len(new_password) < 8:
        raise AppError("密码至少 8 位", code=422, status_code=422)
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError("用户不存在")
    user.password_hash = hash_password(new_password)
    await db.commit()


async def delete_user(db: AsyncSession, actor: User, user_id: int) -> None:
    if actor.id == user_id:
        raise AppError("不能删除当前登录的管理员", code=400, status_code=400)
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError("用户不存在")
    await db.delete(user)
    await db.commit()


async def dashboard(db: AsyncSession) -> DashboardStats:
    now = datetime.now(UTC)
    total = (await db.execute(select(func.count(User.id)))).scalar_one()
    active = (
        await db.execute(select(func.count(User.id)).where(User.is_active.is_(True)))
    ).scalar_one()
    admins = (
        await db.execute(select(func.count(User.id)).where(User.role == Role.admin))
    ).scalar_one()
    week_ago = now - timedelta(days=7)
    new_7d = (
        await db.execute(select(func.count(User.id)).where(User.created_at >= week_ago))
    ).scalar_one()

    usage_rows = (
        await db.execute(
            select(UsageEvent.column, func.count(UsageEvent.id)).group_by(UsageEvent.column)
        )
    ).all()
    column_usage = {c: n for c, n in usage_rows}

    # signups per day for last 7 days
    users = (
        (await db.execute(select(User.created_at).where(User.created_at >= week_ago)))
        .scalars()
        .all()
    )
    buckets: dict[str, int] = {}
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).strftime("%m-%d")
        buckets[day] = 0
    for c in users:
        if c:
            key = c.strftime("%m-%d")
            if key in buckets:
                buckets[key] += 1
    signups = [{"day": d, "count": n} for d, n in buckets.items()]

    return DashboardStats(
        total_users=total,
        active_users=active,
        admin_users=admins,
        new_users_7d=new_7d,
        column_usage=column_usage,
        signups_by_day=signups,
    )


async def record_usage(db: AsyncSession, user_id: int | None, column: str, action: str) -> None:
    db.add(UsageEvent(user_id=user_id, column=column, action=action))
    await db.commit()
