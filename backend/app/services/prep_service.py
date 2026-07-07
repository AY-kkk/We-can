"""栏目2 笔面准备 business logic (personas + seed-backed question bank)."""

from __future__ import annotations

import uuid

from app.providers.base import SearchProvider
from app.providers.prompts import (
    BACKEND_ARCHITECT,
    FRONTEND_DESIGNER,
    FULLSTACK_MASTER,
    PRODUCT_MENTOR_ECHO,
    PRODUCT_OPS_NOVA,
    SALES_COACH_VEGA,
)
from app.schemas.prep import (
    BankItem,
    CategoryBlock,
    MockFeedback,
    MockInterviewResponse,
    MockTurn,
    QuestionBankResponse,
    QuestionsResponse,
)
from app.services.seed_loader import load_experiences, load_question_bank
from app.utils.text import extract_experiences

CATEGORY_LABELS = {
    "written": "笔试题",
    "technical": "技术/专业面",
    "behavioral": "行为面(STAR)",
    "business": "业务/案例面",
}

# Persona作用域: 仅栏目2启用这套人格系统
TRACK_PERSONA = {
    "product": ("AI 产品导师 Echo", PRODUCT_MENTOR_ECHO),
    "operation": ("产运导师 Nova", PRODUCT_OPS_NOVA),
    "market": ("产运导师 Nova", PRODUCT_OPS_NOVA),
    "algorithm": ("全栈大师", FULLSTACK_MASTER),
    "frontend": ("前端设计师 + 全栈大师", FRONTEND_DESIGNER + "\n" + FULLSTACK_MASTER),
    "backend": ("后端架构师 Atlas", BACKEND_ARCHITECT),
    "sales": ("销售增长教练 Vega", SALES_COACH_VEGA),
}

TRACK_LABELS = {
    "product": "产品",
    "operation": "运营",
    "algorithm": "算法",
    "market": "市场",
    "frontend": "前端",
    "backend": "后端",
    "sales": "销售",
}


def _normalize_track(track: str) -> str:
    return track if track in TRACK_LABELS else "product"


def persona_for(track: str) -> tuple[str, str]:
    return TRACK_PERSONA[_normalize_track(track)]


async def build_question_bank(
    track: str, keyword: str, search: SearchProvider
) -> QuestionBankResponse:
    track = _normalize_track(track)
    persona_name, _ = persona_for(track)
    bank = load_question_bank().get(track, {})
    categories_raw = bank.get("categories", {})
    categories = [
        CategoryBlock(
            key=key,
            label=CATEGORY_LABELS.get(key, key),
            questions=categories_raw.get(key, []),
        )
        for key in ["written", "technical", "behavioral", "business"]
    ]
    total = bank.get("total", sum(len(c.questions) for c in categories))

    # references: prefer offline seed experiences, augment with live search
    refs: list[BankItem] = []
    seed_exp = load_experiences().get(track, [])
    for it in seed_exp[:6]:
        refs.append(
            BankItem(
                title=it["title"],
                url=it["url"],
                source=it["source"],
                summary=it["summary"],
            )
        )
    try:
        results = await search.search(f"{TRACK_LABELS[track]} {keyword} 面试题".strip(), limit=3)
        for r in results:
            refs.append(BankItem(title=r.title, url=r.url, source=r.source, summary=r.summary))
    except Exception:  # noqa: BLE001 - search is best-effort augmentation
        pass

    return QuestionBankResponse(
        track=track,
        label=TRACK_LABELS[track],
        persona=persona_name,
        total=total,
        categories=categories,
        references=refs,
    )


def generate_questions(track: str, resume_text: str) -> QuestionsResponse:
    track = _normalize_track(track)
    bank = load_question_bank().get(track, {})
    behavioral = bank.get("categories", {}).get("behavioral", [])
    common = behavioral[:5] or [f"你对{TRACK_LABELS[track]}岗位的理解是什么？"]
    exps = extract_experiences(resume_text)
    tailored = [f"关于「{e[:40]}」，请用 STAR 详细说明你的具体贡献与量化结果。" for e in exps[:5]]
    if not tailored:
        tailored = [
            "请挑一段你最深入的经历，说明你的角色、动作与结果。",
            "你在项目里做过哪些数据驱动的决策？",
        ]
    return QuestionsResponse(common_questions=common, tailored_questions=tailored)


def _question_pool(track: str, resume_text: str) -> list[str]:
    track = _normalize_track(track)
    bank = load_question_bank().get(track, {})
    cats = bank.get("categories", {})
    pool: list[str] = []
    if cats.get("behavioral"):
        pool.append(cats["behavioral"][0])  # self-intro
    if cats.get("technical"):
        pool.append(cats["technical"][0])
    exps = extract_experiences(resume_text)
    if exps:
        pool.append(f"关于「{exps[0][:40]}」，请用 STAR 说明你的贡献与量化结果。")
    if cats.get("business"):
        pool.append(cats["business"][0])
    if cats.get("behavioral") and len(cats["behavioral"]) > 1:
        pool.append(cats["behavioral"][1])
    return pool or ["请做个自我介绍。"]


def run_mock_interview(
    track: str,
    resume_text: str,
    session_id: str | None,
    answer: str | None,
    history: list[MockTurn],
) -> MockInterviewResponse:
    track = _normalize_track(track)
    persona_name, _ = persona_for(track)
    session_id = session_id or uuid.uuid4().hex[:12]
    pool = _question_pool(track, resume_text)
    hist = list(history)

    feedback = None
    if answer is not None:
        hist.append(MockTurn(role="candidate", content=answer))
        feedback = _score_answer(answer)

    asked = sum(1 for t in hist if t.role == "interviewer")
    if asked >= len(pool):
        return MockInterviewResponse(
            session_id=session_id,
            persona=persona_name,
            question="面试结束，感谢你的参与！以上是本轮反馈。",
            finished=True,
            feedback=feedback,
            history=hist,
        )

    next_q = pool[asked]
    hist.append(MockTurn(role="interviewer", content=next_q))
    return MockInterviewResponse(
        session_id=session_id,
        persona=persona_name,
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
    structure = 85 if has_structure else 60
    depth = min(100, 55 + length // 20 + (15 if has_quant else 0))
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
        structure_score=structure,
        depth_score=depth,
        expression_score=expression,
        suggestions=suggestions,
    )
