"""Auth request/response schemas."""

from __future__ import annotations

import re

from pydantic import BaseModel, EmailStr, Field, field_validator

_PW_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, max_length=40)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _strength(cls, v: str) -> str:
        if not _PW_RE.match(v):
            raise ValueError("密码至少 8 位，且同时包含字母和数字")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool
    created_at: str
    last_login: str | None = None


class AuthResult(BaseModel):
    user: UserOut
    tokens: TokenPair


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    reset_token: str
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _strength(cls, v: str) -> str:
        if not _PW_RE.match(v):
            raise ValueError("密码至少 8 位，且同时包含字母和数字")
        return v
