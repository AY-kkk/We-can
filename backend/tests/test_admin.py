import pytest

from app.core.config import settings


async def _admin_token(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )
    return r.json()["data"]["tokens"]["access_token"]


async def _user_token(client, email="ru@test.com"):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "username": "ru", "password": "Passw0rd1"},
    )
    return r.json()["data"]["tokens"]["access_token"]


@pytest.mark.asyncio
async def test_admin_seeded_and_dashboard(client):
    tok = await _admin_token(client)
    r = await client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    assert r.json()["data"]["total_users"] >= 1


@pytest.mark.asyncio
async def test_admin_lists_and_updates_user(client):
    admin = await _admin_token(client)
    await _user_token(client, "target@test.com")
    lst = await client.get(
        "/api/v1/admin/users",
        params={"q": "target"},
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert lst.status_code == 200
    items = lst.json()["data"]["items"]
    assert items
    uid = items[0]["id"]
    upd = await client.patch(
        f"/api/v1/admin/users/{uid}",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert upd.json()["data"]["is_active"] is False


@pytest.mark.asyncio
async def test_user_cannot_access_admin(client):
    tok = await _user_token(client, "plain@test.com")
    r = await client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
