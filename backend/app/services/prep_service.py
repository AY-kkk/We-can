"""栏目2 笔面准备 business logic."""

from __future__ import annotations

import uuid

from app.providers.base import SearchProvider
from app.schemas.prep import (
    BankItem,
    MockFeedback,
    MockInterviewResponse,
    MockTurn,
    QuestionBankResponse,
    QuestionsResponse,
)
from app.utils.text import extract_experiences

_WRITTEN_TYPES_BY_ROLE = {
    "产品": ["产品设计题", "逻辑推理", "案例分析", "行测数量关系"],
    "运营": ["活动策划题", "数据分析题", "文案写作", "行测言语理解"],
    "算法": ["数据结构与算法", "机器学习基础", "编程题", "概率统计"],
    "前端": ["JavaScript 编程", "算法题", "浏览器原理", "框架原理"],
    "销售": ["情景应对题", "案例分析", "行测", "沟通表达"],
}

_COMMON_QUESTIONS = [
    "请做一个简单的自我介绍。",
    "你为什么选择我们公司/这个岗位？",
    "说一个你最有成就感的项目，遇到的最大挑战是什么？",
    "你的职业规划是怎样的？",
    "你如何在压力下完成任务？",
]


def _match_role_key(role: str) -> str:
    for key in _WRITTEN_TYPES_BY_ROLE:
        if key in role:
            return key
    return ""


async def build_question_bank(
    role: str, keyword: str, search: SearchProvider
) -> QuestionBankResponse:
    key = _match_role_key(role)
    written = _WRITTEN_TYPES_BY_ROLE.get(key, ["行测", "专业基础题", "案例分析", "编程/逻辑题"])
    query = f"{role} {keyword} 面试题".strip()
    results = await search.search(query, limit=6)
    refs = [BankItem(title=r.title, url=r.url, source=r.source, summary=r.summary) for r in results]
    interview_qs = _COMMON_QUESTIONS + [
        f"针对{role}岗位，你认为最核心的能力是什么？",
        f"如果让你负责一个{role}相关的项目，你会如何拆解？",
    ]
    return QuestionBankResponse(
        role=role,
        written_types=written,
        interview_questions=interview_qs,
        references=refs,
    )


def generate_questions(role: str, resume_text: str) -> QuestionsResponse:
    common = _COMMON_QUESTIONS + [f"你对{role}岗位的理解是什么？"]
    exps = extract_experiences(resume_text)
    tailored = [f"关于「{e[:40]}」，请用 STAR 详细说明你的具体贡献与量化结果。" for e in exps[:5]]
    if not tailored:
        tailored = [
            "请挑一段你最深入的经历，说明你的角色、动作与结果。",
            "你在项目里做过哪些数据驱动的决策？",
        ]
    return QuestionsResponse(common_questions=common, tailored_questions=tailored)


def _question_pool(role: str, resume_text: str) -> list[str]:
    q = generate_questions(role, resume_text)
    return q.common_questions[:3] + q.tailored_questions[:3]


def run_mock_interview(
    role: str,
    resume_text: str,
    session_id: str | None,
    answer: str | None,
    history: list[MockTurn],
) -> MockInterviewResponse:
    """Stateless multi-turn: state lives in `history` passed by client."""
    session_id = session_id or uuid.uuid4().hex[:12]
    pool = _question_pool(role, resume_text)
    hist = list(history)

    feedback = None
    if answer is not None:
        hist.append(MockTurn(role="candidate", content=answer))
        feedback = _score_answer(answer)

    asked = sum(1 for t in hist if t.role == "interviewer")
    if asked >= len(pool):
        return MockInterviewResponse(
            session_id=session_id,
            question="面试结束，感谢你的参与！以上是本轮反馈。",
            finished=True,
            feedback=feedback,
            history=hist,
        )

    next_q = pool[asked]
    hist.append(MockTurn(role="interviewer", content=next_q))
    return MockInterviewResponse(
        session_id=session_id,
        question=next_q,
        finished=False,
        feedback=feedback,
        history=hist,
    )


def _score_answer(answer: str) -> MockFeedback:
    length = len(answer.strip())
    has_quant = any(c.isdigit() for c in answer)
    has_structure = any(
        k in answer for k in ["首先", "其次", "第一", "第二", "STAR", "因为", "所以"]
    )
    content = min(100, 55 + length // 20 + (15 if has_quant else 0))
    structure = 85 if has_structure else 60
    expression = min(100, 60 + length // 25)
    suggestions = []
    if not has_quant:
        suggestions.append("加入可量化的成果（百分比、规模、时长）增强说服力。")
    if not has_structure:
        suggestions.append("使用 STAR 或分点结构，让回答层次更清晰。")
    if length < 60:
        suggestions.append("回答略短，可补充背景与你的具体动作。")
    if not suggestions:
        suggestions.append("表达完整、结构清晰，继续保持并注意控制时长。")
    return MockFeedback(
        content_score=content,
        structure_score=structure,
        expression_score=expression,
        suggestions=suggestions,
    )
