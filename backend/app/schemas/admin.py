"""Admin dashboard + user management schemas."""

from __future__ import annotations

from pydantic import BaseModel


class AdminUserOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool
    created_at: str
    last_login: str | None = None


class UserListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AdminUserOut]


class UpdateUserRequest(BaseModel):
    is_active: bool | None = None
    role: str | None = None


class ResetUserPasswordRequest(BaseModel):
    new_password: str


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    new_users_7d: int
    column_usage: dict[str, int]
    signups_by_day: list[dict]
