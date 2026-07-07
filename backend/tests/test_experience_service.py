import pytest

from app.providers.mock import MockSearchProvider
from app.services import experience_service
from app.services.seed_loader import load_experiences


@pytest.mark.asyncio
async def test_search_experiences_has_links():
    resp = await experience_service.search_experiences("product", "", MockSearchProvider())
    assert resp.track == "product"
    assert resp.items
    for item in resp.items:
        assert item.url.startswith("http")


@pytest.mark.asyncio
async def test_mock_provider_does_not_inject_placeholder_links():
    # Under the default mock search provider, only vetted seed posts are shown;
    # placeholder/dead links (example.com) must never leak to users.
    resp = await experience_service.search_experiences("product", "", MockSearchProvider())
    assert all("example.com" not in item.url for item in resp.items)
    sources = {item.source for item in resp.items}
    assert not any("示例" in s for s in sources)


def test_seed_meets_min_50_per_direction():
    data = load_experiences()
    for track in [
        "product",
        "operation",
        "algorithm",
        "market",
        "frontend",
        "backend",
        "sales",
    ]:
        items = data.get(track, [])
        assert len(items) >= 50, f"{track} under 50"
        # multi-source
        sources = {i["source"] for i in items}
        assert len(sources) >= 3
        for i in items:
            assert i["url"].startswith("http")
        # 顺序须多来源交叉: 前 8 条不能被单一来源垄断(防止某来源扎堆置顶)
        head_sources = {i["source"] for i in items[:8]}
        assert len(head_sources) >= 3, f"{track} 顶部来源过于单一: {head_sources}"
        # 且没有任何来源占比超过 45%
        from collections import Counter

        counts = Counter(i["source"] for i in items)
        top_share = max(counts.values()) / len(items)
        assert top_share <= 0.45, f"{track} 来源 {counts.most_common(1)} 占比过高 {top_share:.0%}"


@pytest.mark.asyncio
async def test_sources_endpoint(client):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "src@test.com", "username": "src", "password": "Passw0rd1"},
    )
    access = reg.json()["data"]["tokens"]["access_token"]
    hdr = {"Authorization": f"Bearer {access}"}
    r = await client.get("/api/v1/experience/sources?track=frontend", headers=hdr)
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) >= 3
    assert all("source" in d and "count" in d for d in data)
    # counts sum equals per-track total (frontend seeded with 85)
    assert sum(d["count"] for d in data) >= 50


@pytest.mark.asyncio
async def test_list_filtered_by_source(client):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "srcf@test.com", "username": "srcf", "password": "Passw0rd1"},
    )
    access = reg.json()["data"]["tokens"]["access_token"]
    hdr = {"Authorization": f"Bearer {access}"}
    r = await client.get("/api/v1/experience?track=frontend&source=掘金", headers=hdr)
    assert r.status_code == 200
    items = r.json()["data"]["items"]
    assert items
    assert all(it["source"] == "掘金" for it in items)
    # 小红书来源已彻底移除
    none = await client.get(
        "/api/v1/experience?track=frontend&source=小红书", headers=hdr
    )
    assert none.json()["data"]["items"] == []
