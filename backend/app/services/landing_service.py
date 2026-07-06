"""栏目4 秋招 Landing business logic."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ChecklistItem
from app.schemas.landing import (
    ChecklistItemIn,
    ChecklistItemOut,
    ChecklistItemUpdate,
    PolishedVersion,
    PolishMessageResponse,
)

DEFAULT_CHECKLIST = [
    ("三方/合同", "确认三方协议条款并签署"),
    ("三方/合同", "确认劳动合同薪资、违约金、报到时间"),
    ("体检", "完成入职体检并领取报告"),
    ("材料", "准备身份证、毕业证、学位证复印件"),
    ("材料", "准备学历学位在线验证报告"),
    ("材料", "准备银行卡（工资卡）与一寸/二寸证件照"),
    ("报到", "确认报到地点、时间与对接人"),
    ("报到", "预订住宿 / 规划通勤路线"),
    ("其他", "迁移档案 / 党团关系（如需）"),
]


async def ensure_defaults(db: AsyncSession) -> None:
    count = (await db.execute(select(ChecklistItem.id).limit(1))).first()
    if count:
        return
    for cat, title in DEFAULT_CHECKLIST:
        db.add(ChecklistItem(category=cat, title=title, is_custom=False))
    await db.commit()


def _to_out(r: ChecklistItem) -> ChecklistItemOut:
    return ChecklistItemOut(
        id=r.id,
        category=r.category,
        title=r.title,
        done=r.done,
        note=r.note,
        is_custom=r.is_custom,
    )


async def get_checklist(db: AsyncSession) -> list[ChecklistItemOut]:
    await ensure_defaults(db)
    rows = (
        (await db.execute(select(ChecklistItem).order_by(ChecklistItem.id.asc()))).scalars().all()
    )
    return [_to_out(r) for r in rows]


async def add_item(db: AsyncSession, item: ChecklistItemIn) -> ChecklistItemOut:
    row = ChecklistItem(
        category=item.category,
        title=item.title,
        done=item.done,
        note=item.note,
        is_custom=item.is_custom,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return _to_out(row)


async def update_item(db: AsyncSession, upd: ChecklistItemUpdate) -> ChecklistItemOut | None:
    row = await db.get(ChecklistItem, upd.id)
    if not row:
        return None
    if upd.done is not None:
        row.done = upd.done
    if upd.note is not None:
        row.note = upd.note
    if upd.title is not None:
        row.title = upd.title
    await db.commit()
    await db.refresh(row)
    return _to_out(row)


async def delete_item(db: AsyncSession, item_id: int) -> bool:
    row = await db.get(ChecklistItem, item_id)
    if not row:
        return False
    await db.delete(row)
    await db.commit()
    return True


def polish_message(
    message: str, audience: str, scenario: str, channel: str
) -> PolishMessageResponse:
    goal = f"在「{scenario}」场景下，通过{channel}与{audience}达成共赢沟通"
    audience_value = f"{audience}关注效率与专业度，希望信息清晰、边界明确、便于决策"
    interest_link = "在表达诉求的同时，主动说明我方配合方式，降低对方成本"
    gentle = (
        f"您好{audience}，感谢您的时间。关于{scenario}，我这边的情况是：{message}。"
        "不知是否方便您帮忙看下？如需我补充任何材料我随时配合，非常感谢！"
    )
    direct = (
        f"{audience}您好，关于{scenario}，我的诉求是：{message}。"
        "希望能在本周内推进；我已准备好相关材料，您告知所需即可，谢谢。"
    )
    explanation = (
        "温和版侧重关系维护与低压力表达，适合首次沟通或对方较忙；"
        "直接版明确诉求与时间预期，适合需要推动进度的场景。"
        "两版都遵循：先锚定目标→连接对方价值→给出配合方案，减少来回沟通成本。"
    )
    return PolishMessageResponse(
        goal_anchor=goal,
        audience_value=audience_value,
        interest_link=interest_link,
        versions=[
            PolishedVersion(tone="温和版", text=gentle),
            PolishedVersion(tone="直接版", text=direct),
        ],
        explanation=explanation,
    )
