"""Pytest fixtures: isolated in-memory-ish DB + httpx AsyncClient."""

from __future__ import annotations

import os
import tempfile

import pytest_asyncio

# Use a temp sqlite file per test session BEFORE importing app.
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_tmp.name}"
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()

from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.db.session import SessionLocal, init_db  # noqa: E402
from app.main import app  # noqa: E402
from app.services.auth_service import seed_admin  # noqa: E402


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _prepare_db():
    await init_db()
    async with SessionLocal() as db:
        await seed_admin(db)
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
