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


def test_seed_meets_min_50_per_direction():
    data = load_experiences()
    for track in ["product", "operation", "algorithm", "market", "frontend"]:
        assert len(data.get(track, [])) >= 50, f"{track} under 50"
        # multi-source
        sources = {i["source"] for i in data[track]}
        assert len(sources) >= 3
        for i in data[track]:
            assert i["url"].startswith("http")
