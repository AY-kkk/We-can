from app.services import landing_service


def test_polish_message_two_versions():
    resp = landing_service.polish_message("希望确认报到时间", "HR", "入职沟通", "邮件")
    assert len(resp.versions) == 2
    tones = {v.tone for v in resp.versions}
    assert tones == {"温和版", "直接版"}
    assert resp.explanation
