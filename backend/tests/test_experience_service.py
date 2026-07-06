import pytest

from app.providers.mock import MockSearchProvider
from app.services import experience_service


@pytest.mark.asyncio
async def test_search_experiences_has_links():
    resp = await experience_service.search_experiences("product", "秋招", MockSearchProvider())
    assert resp.track == "product"
    assert resp.items
    for item in resp.items:
        assert item.url
