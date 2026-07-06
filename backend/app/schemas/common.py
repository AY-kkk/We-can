"""Shared response envelope helpers."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    data: T | None = None


def ok(data: object = None, message: str = "ok") -> dict:
    return {"code": 0, "message": message, "data": data}
