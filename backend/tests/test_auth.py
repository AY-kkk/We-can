import pytest


@pytest.mark.asyncio
async def test_register_login_me_refresh_logout(client):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "u1@test.com", "username": "u1", "password": "Passw0rd1"},
    )
    assert reg.status_code == 200
    tokens = reg.json()["data"]["tokens"]
    access = tokens["access_token"]
    refresh = tokens["refresh_token"]

    # me
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access}"})
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "u1@test.com"
    assert me.json()["data"]["role"] == "user"

    # refresh rotates
    rf = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert rf.status_code == 200
    assert rf.json()["data"]["access_token"]

    # logout old refresh; login again works
    await client.post("/api/v1/auth/logout", json={"refresh_token": refresh})
    login = await client.post(
        "/api/v1/auth/login", json={"email": "u1@test.com", "password": "Passw0rd1"}
    )
    assert login.status_code == 200


@pytest.mark.asyncio
async def test_duplicate_email_rejected(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@test.com", "username": "dup", "password": "Passw0rd1"},
    )
    again = await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@test.com", "username": "dup", "password": "Passw0rd1"},
    )
    assert again.status_code == 409


@pytest.mark.asyncio
async def test_weak_password_rejected(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@test.com", "username": "w", "password": "short"},
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_protected_requires_token(client):
    r = await client.get("/api/v1/review/history")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wp@test.com", "username": "wp", "password": "Passw0rd1"},
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": "wp@test.com", "password": "nope1234"}
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_change_password_flow(client):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "cp@test.com", "username": "cp", "password": "Passw0rd1"},
    )
    access = reg.json()["data"]["tokens"]["access_token"]
    old_refresh = reg.json()["data"]["tokens"]["refresh_token"]
    hdr = {"Authorization": f"Bearer {access}"}

    # wrong current password rejected
    bad = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "nope1234", "new_password": "NewPass99"},
        headers=hdr,
    )
    assert bad.status_code == 400

    # same-as-old rejected
    same = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "Passw0rd1", "new_password": "Passw0rd1"},
        headers=hdr,
    )
    assert same.status_code == 400

    # weak new password rejected (validation)
    weak = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "Passw0rd1", "new_password": "short"},
        headers=hdr,
    )
    assert weak.status_code == 422

    # success: returns a fresh token pair
    okr = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "Passw0rd1", "new_password": "NewPass99"},
        headers=hdr,
    )
    assert okr.status_code == 200
    assert okr.json()["data"]["access_token"]

    # old refresh token is revoked
    rf = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert rf.status_code == 401

    # can log in with the new password; old password fails
    good = await client.post(
        "/api/v1/auth/login", json={"email": "cp@test.com", "password": "NewPass99"}
    )
    assert good.status_code == 200
    oldpw = await client.post(
        "/api/v1/auth/login", json={"email": "cp@test.com", "password": "Passw0rd1"}
    )
    assert oldpw.status_code == 401


@pytest.mark.asyncio
async def test_change_password_requires_auth(client):
    r = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "x", "new_password": "NewPass99"},
    )
    assert r.status_code == 401
