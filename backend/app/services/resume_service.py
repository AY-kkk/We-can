"""栏目1 简历打磨 business logic."""

from __future__ import annotations

import html
import re

from app.providers.base import LLMProvider
from app.schemas.resume import (
    IntroResponse,
    PolishedItem,
    PolishResponse,
    ResumeParseResponse,
)
from app.utils.text import extract_experiences, guess_sections

_QUANT_HINTS = ["%", "倍", "万", "个", "人", "天", "小时", "提升", "降低", "增长"]


def parse_resume(raw_text: str) -> ResumeParseResponse:
    experiences = extract_experiences(raw_text)
    sections = guess_sections(raw_text)
    return ResumeParseResponse(raw_text=raw_text, sections=sections, experiences=experiences)


def _star_from_line(line: str, jd_text: str) -> dict[str, str]:
    """Deterministic STAR scaffold; enriched wording, quantified when possible."""
    has_quant = any(h in line for h in _QUANT_HINTS)
    situation = "在校园/实习项目中面对明确的业务目标与约束"
    task = "负责推进关键环节并对结果负责"
    action = f"{line}"
    result = "带来可衡量的正向结果" if not has_quant else "取得可量化的成果"
    if jd_text:
        task += "，并对齐目标岗位 JD 的核心要求"
    return {"S": situation, "T": task, "A": action, "R": result}


def _polish_line(line: str, star: dict[str, str]) -> str:
    verb = re.split(r"[，,。.\s]", line)[0][:6] or "主导"
    return (
        f"{verb}相关工作：{star['A']}，通过结构化推进与协作，{star['R']}"
        "（建议补充具体指标，如提升 30% / 覆盖 1000+ 用户）。"
    )


def polish_resume(resume_text: str, jd_text: str, llm: LLMProvider | None = None) -> PolishResponse:
    experiences = extract_experiences(resume_text) or [resume_text.strip()[:120]]
    items: list[PolishedItem] = []
    for line in experiences:
        star = _star_from_line(line, jd_text)
        items.append(PolishedItem(original=line, polished=_polish_line(line, star), star=star))
    resume_html = render_resume_html(resume_text, items)
    return PolishResponse(items=items, resume_html=resume_html)


def render_resume_html(resume_text: str, items: list[PolishedItem]) -> str:
    bullets = "\n".join(f"<li>{html.escape(it.polished)}</li>" for it in items)
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/>
<style>
@page {{ size: A4; margin: 18mm 16mm; }}
body {{ font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  color:#1f2933; line-height:1.6; font-size:12px; }}
h1 {{ font-size:20px; margin:0 0 4px; }}
h2 {{ font-size:13px; border-bottom:1px solid #cbd2d9; padding-bottom:2px;
  margin:14px 0 6px; color:#0b6b5b; }}
ul {{ margin:0; padding-left:18px; }}
li {{ margin-bottom:4px; }}
</style></head>
<body>
<h1>个人简历</h1>
<h2>STAR 润色后的经历</h2>
<ul>
{bullets}
</ul>
</body></html>"""


def generate_intros(resume_text: str, jd_text: str) -> IntroResponse:
    exps = extract_experiences(resume_text)
    highlight = exps[0] if exps else "拥有扎实的专业基础与项目经验"
    target = "，目标岗位高度匹配" if jd_text else ""
    five = (
        "各位面试官好，我先做个五分钟的完整介绍。我叫XXX，来自XX学校XX专业。"
        f"我最具代表性的经历是：{highlight}。在这个过程中我负责了从需求梳理到落地执行的关键环节，"
        "并通过数据复盘持续优化。除此之外我还具备良好的团队协作与沟通能力，"
        f"擅长把复杂问题结构化拆解{target}。我希望能把这些能力带到贵司的岗位上，谢谢。"
    )
    two = (
        f"面试官好，我是XXX。核心亮点是：{highlight}。"
        "我习惯用数据驱动决策，能独立承担关键任务并拿到结果，"
        f"与目标岗位的要求比较契合{target}，期待有机会深入交流。"
    )
    one = (
        f"您好，我是XXX，一句话介绍：{highlight}，" "结果导向、擅长协作，希望加入贵司持续创造价值。"
    )
    return IntroResponse(five_min=five, two_min=two, one_min=one)


def export_pdf(html_content: str) -> bytes:
    """Backend fallback export via weasyprint; raise if unavailable."""
    from app.core.exceptions import ProviderError

    try:
        from weasyprint import HTML  # type: ignore
    except Exception as exc:  # noqa: BLE001
        raise ProviderError(
            "后端 PDF 导出不可用（weasyprint 未安装），请使用前端打印导出。"
        ) from exc
    return HTML(string=html_content).write_pdf()
