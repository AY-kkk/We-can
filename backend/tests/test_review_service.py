from app.services.review_service import _analyze_transcript


def test_analyze_transcript_scores():
    result = _analyze_transcript(
        "面试官：自我介绍。\n我：首先，我做过一个项目，用户增长了30%，因为优化了流程。"
    )
    assert 0 <= result["overall_score"] <= 100
    assert result["timeline"]
    assert result["strengths"]
    assert result["action_items"]
