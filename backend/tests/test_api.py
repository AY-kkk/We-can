import io

import pytest


async def auth_headers(client, email="apiuser@test.com"):
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "username": "api", "password": "Passw0rd1"},
    )
    login = await client.post("/api/v1/auth/login", json={"email": email, "password": "Passw0rd1"})
    tok = login.json()["data"]["tokens"]["access_token"]
    return {"Authorization": f"Bearer {tok}"}


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "healthy"


@pytest.mark.asyncio
async def test_resume_parse_and_polish(client):
    h = await auth_headers(client, "resume@test.com")
    content = b"education\n- led a project, users up 200 to 1500\nskills: python"
    files = {"file": ("resume.txt", io.BytesIO(content), "text/plain")}
    r = await client.post("/api/v1/resume/parse", files=files, headers=h)
    assert r.status_code == 200
    text = r.json()["data"]["raw_text"]
    r2 = await client.post(
        "/api/v1/resume/polish",
        json={"resume_text": text, "jd_text": "python backend"},
        headers=h,
    )
    assert r2.status_code == 200
    assert r2.json()["data"]["items"]


@pytest.mark.asyncio
async def test_prep_endpoints(client):
    h = await auth_headers(client, "prep@test.com")
    r = await client.post(
        "/api/v1/prep/question-bank",
        json={"track": "product", "keyword": ""},
        headers=h,
    )
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total"] >= 100
    assert data["references"]

    r2 = await client.post("/api/v1/prep/mock-interview", json={"track": "algorithm"}, headers=h)
    assert r2.status_code == 200
    assert r2.json()["data"]["session_id"]
    assert r2.json()["data"]["persona"]


@pytest.mark.asyncio
async def test_review_flow(client):
    h = await auth_headers(client, "review@test.com")
    files = {"file": ("a.webm", io.BytesIO(b"12345" * 300), "audio/webm")}
    up = await client.post("/api/v1/review/upload", files=files, headers=h)
    fid = up.json()["data"]["file_id"]
    tr = await client.post("/api/v1/review/transcribe", json={"file_id": fid}, headers=h)
    transcript = tr.json()["data"]["transcript"]
    an = await client.post(
        "/api/v1/review/analyze",
        json={"transcript": transcript, "title": "第一次"},
        headers=h,
    )
    assert an.status_code == 200
    hist = await client.get("/api/v1/review/history", headers=h)
    assert len(hist.json()["data"]) >= 1


@pytest.mark.asyncio
async def test_landing_flow(client):
    h = await auth_headers(client, "landing@test.com")
    r = await client.get("/api/v1/landing/checklist", headers=h)
    assert r.status_code == 200
    items = r.json()["data"]
    assert items
    upd = await client.put(
        "/api/v1/landing/checklist",
        json={"id": items[0]["id"], "done": True},
        headers=h,
    )
    assert upd.json()["data"]["done"] is True

    p = await client.post(
        "/api/v1/landing/polish-message",
        json={"message": "确认报到时间", "audience": "HR"},
        headers=h,
    )
    assert len(p.json()["data"]["versions"]) == 2


@pytest.mark.asyncio
async def test_experience_flow(client):
    h = await auth_headers(client, "exp@test.com")
    r = await client.get("/api/v1/experience", params={"track": "product", "q": ""}, headers=h)
    assert r.status_code == 200
    items = r.json()["data"]["items"]
    assert items
    c = await client.post("/api/v1/experience/collect", json=items[0], headers=h)
    assert c.status_code == 200
    col = await client.get("/api/v1/experience/collected", headers=h)
    assert len(col.json()["data"]) >= 1


@pytest.mark.asyncio
async def test_data_isolation_between_users(client):
    h1 = await auth_headers(client, "iso1@test.com")
    h2 = await auth_headers(client, "iso2@test.com")
    # user1 collects one
    exp = await client.get("/api/v1/experience", params={"track": "frontend"}, headers=h1)
    item = exp.json()["data"]["items"][0]
    await client.post("/api/v1/experience/collect", json=item, headers=h1)
    # user2 should see none
    col2 = await client.get("/api/v1/experience/collected", headers=h2)
    assert col2.json()["data"] == []


@pytest.mark.asyncio
async def test_validation_error_envelope(client):
    h = await auth_headers(client, "val@test.com")
    r = await client.post("/api/v1/resume/polish", json={"jd_text": "x"}, headers=h)
    assert r.status_code == 422
    assert r.json()["code"] == 422
