from app.services import resume_service

RESUME = """
教育
XX大学 计算机科学 本科
经历
- 主导校园二手交易平台开发，用户从200提升到1500
- 负责后台接口设计与优化，接口响应时间降低40%
技能
Python, React, SQL
"""


def test_parse_resume_extracts_experiences():
    parsed = resume_service.parse_resume(RESUME)
    assert parsed.raw_text
    assert len(parsed.experiences) >= 2
    assert "经历" in parsed.sections or "教育" in parsed.sections


def test_polish_produces_star_and_html():
    result = resume_service.polish_resume(RESUME, "招聘后端开发，要求Python")
    assert result.items
    for item in result.items:
        assert set(item.star.keys()) == {"S", "T", "A", "R"}
    assert "<html" in result.resume_html.lower()


def test_generate_intros_three_versions():
    intros = resume_service.generate_intros(RESUME, "")
    assert intros.five_min and intros.two_min and intros.one_min
    assert len(intros.five_min) > len(intros.one_min)
