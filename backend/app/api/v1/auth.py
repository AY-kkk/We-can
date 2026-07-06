"""Auth routes: register/login/refresh/logout/me/forgot/reset."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.schemas.auth import (
    AuthResult,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.schemas.common import ok
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user, tokens = await auth_service.register(db, req.email, req.username, req.password)
    result = AuthResult(user=auth_service.to_user_out(user), tokens=tokens)
    return ok(result.model_dump(), message="注册成功")


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, tokens = await auth_service.login(db, req.email, req.password)
    result = AuthResult(user=auth_service.to_user_out(user), tokens=tokens)
    return ok(result.model_dump(), message="登录成功")


@router.post("/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    tokens = await auth_service.refresh(db, req.refresh_token)
    return ok(tokens.model_dump())


@router.post("/logout")
async def logout(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.logout(db, req.refresh_token)
    return ok(None, message="已登出")


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return ok(auth_service.to_user_out(user).model_dump())


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    token = await auth_service.forgot_password(db, req.email)
    # In production this token is emailed; here we return it (mock delivery).
    return ok({"reset_token": token, "message": "重置令牌已生成（演示环境直接返回）"})


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.reset_password(db, req.reset_token, req.new_password)
    return ok(None, message="密码已重置，请重新登录")
