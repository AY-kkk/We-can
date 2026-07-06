import pytest

from app.providers.mock import MockSearchProvider
from app.services import prep_service


@pytest.mark.asyncio
async def test_question_bank():
    resp = await prep_service.build_question_bank("产品经理", "增长", MockSearchProvider())
    assert resp.written_types
    assert resp.interview_questions
    assert resp.references and resp.references[0].url


def test_generate_questions_tailored():
    resp = prep_service.generate_questions("前端", "- 主导组件库开发，复用率提升50%")
    assert resp.common_questions
    assert resp.tailored_questions


def test_mock_interview_flow():
    r1 = prep_service.run_mock_interview("产品", "简历文本", None, None, [])
    assert r1.session_id
    assert not r1.finished
    r2 = prep_service.run_mock_interview(
        "产品", "简历文本", r1.session_id, "首先我认为核心是用户价值，提升了30%", r1.history
    )
    assert r2.feedback is not None
    assert r2.feedback.content_score > 0
