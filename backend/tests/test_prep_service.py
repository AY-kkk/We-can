import pytest

from app.providers.mock import MockSearchProvider
from app.services import prep_service


@pytest.mark.asyncio
async def test_question_bank_meets_min_100():
    for track in ["product", "operation", "algorithm", "market", "frontend"]:
        resp = await prep_service.build_question_bank(track, "", MockSearchProvider())
        assert resp.total >= 100, f"{track} only {resp.total}"
        cats = {c.key for c in resp.categories}
        assert cats == {"written", "technical", "behavioral", "business"}
        assert resp.references and resp.references[0].url
        assert resp.persona


def test_persona_switches_by_track():
    assert prep_service.persona_for("product")[0] == "AI 产品导师 Echo"
    assert prep_service.persona_for("operation")[0] == "产运导师 Nova"
    assert prep_service.persona_for("market")[0] == "产运导师 Nova"
    assert prep_service.persona_for("algorithm")[0] == "全栈大师"
    assert "前端" in prep_service.persona_for("frontend")[0]


def test_generate_questions_tailored():
    resp = prep_service.generate_questions("frontend", "- 主导组件库开发，复用率提升50%")
    assert resp.common_questions
    assert resp.tailored_questions


def test_mock_interview_flow():
    r1 = prep_service.run_mock_interview("product", "简历文本", None, None, [])
    assert r1.session_id
    assert not r1.finished
    assert r1.persona
    r2 = prep_service.run_mock_interview(
        "product",
        "简历文本",
        r1.session_id,
        "首先我认为核心是用户价值，提升了30%",
        r1.history,
    )
    assert r2.feedback is not None
    assert r2.feedback.depth_score > 0
