"""Aggregate v1 routers."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import (
    admin,
    auth,
    experience,
    landing,
    prep,
    resume,
    review,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(resume.router)
api_router.include_router(prep.router)
api_router.include_router(review.router)
api_router.include_router(landing.router)
api_router.include_router(experience.router)
