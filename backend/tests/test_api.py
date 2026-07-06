import io

import pytest


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "healthy"


@pytest.mark.asyncio
async def test_resume_parse_and_polish(client):
    content = b"education\n- led a project, users up 200 to 1500\nskills: python"
    files = {"file": ("resume.txt", io.BytesIO(content), "text/plain")}
    r = await client.post("/api/v1/resume/parse", files=files)
    assert r.status_code == 200
    text = r.json()["data"]["raw_text"]
    r2 = await client.post(
        "/api/v1/resume/polish", json={"resume_text": text, "jd_text": "python backend"}
    )
    assert r2.status_code == 200
    assert r2.json()["data"]["items"]


@pytest.mark.asyncio
async def test_prep_endpoints(client):
    r = await client.post("/api/v1/prep/question-bank", json={"role": "产品", "keyword": ""})
    assert r.status_code == 200
    assert r.json()["data"]["references"]

    r2 = await client.post("/api/v1/prep/mock-interview", json={"role": "产品"})
    assert r2.status_code == 200
    assert r2.json()["data"]["session_id"]


@pytest.mark.asyncio
async def test_review_flow(client):
    files = {"file": ("a.webm", io.BytesIO(b"12345" * 300), "audio/webm")}
    up = await client.post("/api/v1/review/upload", files=files)
    fid = up.json()["data"]["file_id"]
    tr = await client.post("/api/v1/review/transcribe", json={"file_id": fid})
    transcript = tr.json()["data"]["transcript"]
    an = await client.post(
        "/api/v1/review/analyze", json={"transcript": transcript, "title": "第一次"}
    )
    assert an.status_code == 200
    hist = await client.get("/api/v1/review/history")
    assert len(hist.json()["data"]) >= 1


@pytest.mark.asyncio
async def test_landing_flow(client):
    r = await client.get("/api/v1/landing/checklist")
    assert r.status_code == 200
    items = r.json()["data"]
    assert items
    upd = await client.put("/api/v1/landing/checklist", json={"id": items[0]["id"], "done": True})
    assert upd.json()["data"]["done"] is True

    p = await client.post(
        "/api/v1/landing/polish-message",
        json={"message": "确认报到时间", "audience": "HR"},
    )
    assert len(p.json()["data"]["versions"]) == 2


@pytest.mark.asyncio
async def test_experience_flow(client):
    r = await client.get("/api/v1/experience", params={"track": "product", "q": "秋招"})
    assert r.status_code == 200
    items = r.json()["data"]["items"]
    assert items
    c = await client.post("/api/v1/experience/collect", json=items[0])
    assert c.status_code == 200
    col = await client.get("/api/v1/experience/collected")
    assert len(col.json()["data"]) >= 1


@pytest.mark.asyncio
async def test_validation_error_envelope(client):
    r = await client.post("/api/v1/resume/polish", json={"jd_text": "x"})
    assert r.status_code == 422
    body = r.json()
    assert body["code"] == 422
