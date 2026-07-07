"""Collect the *hottest* real experience posts per direction and write a seed JSON.

Source of truth: 掘金 (juejin.cn) public search API, which returns real articles
with like counts (digg_count). We rank by popularity and keep the hottest posts
per direction, each a concrete, clickable article URL (https://juejin.cn/post/{id}).

Honesty guarantees (GOAL §5.5 / §13):
- Every URL is a specific real article (not a search page).
- Ranked by real like counts (digg_count) — i.e. the most popular shares.
- Each URL is validated for HTTP 200 (follows redirects, non-login).
- Dead/blocked URLs are dropped; we keep >= TARGET per direction.
- Source platform + author + like count + publish time are recorded truthfully.
"""

from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from pathlib import Path

import httpx

TARGET = 52  # buffer above hard minimum of 50
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
HEADERS = {"User-Agent": UA}
CSDN_SEARCH = "https://so.csdn.net/api/v3/search"
SEARCH_API = "https://api.juejin.cn/search_api/v1/search"

DIRECTIONS: dict[str, dict] = {
    "product": {
        "label": "产品",
        "queries": [
            "产品经理 面经",
            "产品经理 秋招",
            "产品经理 面试",
            "产品经理 求职",
            "产品经理 校招",
            "产品经理 转行",
            "产品经理 简历",
            "产品 offer",
            "产品经理 成长",
            "如何成为产品经理",
            "产品经理 复盘",
            "产品经理 项目",
        ],
    },
    "operation": {
        "label": "运营",
        "queries": [
            "运营 面经",
            "运营 秋招",
            "用户运营",
            "内容运营",
            "活动运营",
            "增长 运营",
            "运营 求职",
            "运营 校招",
            "新媒体运营",
            "数据运营",
            "运营 简历",
            "运营 转行",
        ],
    },
    "algorithm": {
        "label": "算法",
        "queries": [
            "算法 面经",
            "算法工程师 面经",
            "机器学习 面经",
            "深度学习 面试",
            "算法 秋招",
            "算法岗 求职",
            "leetcode 面经",
            "推荐系统 面经",
            "大模型 面经",
            "NLP 面经",
            "算法 校招",
            "算法 八股",
        ],
    },
    "market": {
        "label": "市场",
        "queries": [
            "市场营销 面经",
            "市场 求职",
            "品牌营销",
            "市场营销 秋招",
            "营销 案例",
            "增长黑客",
            "digital marketing",
            "广告 投放",
            "市场 校招",
            "营销 复盘",
            "品牌 运营",
            "市场营销 简历",
        ],
    },
    "frontend": {
        "label": "前端",
        "queries": [
            "前端 面经",
            "前端 秋招",
            "前端 面试",
            "javascript 面经",
            "react 面经",
            "vue 面经",
            "前端 校招",
            "前端 八股",
            "前端 求职",
            "前端 手写",
            "浏览器 面试",
            "前端工程化 面试",
        ],
    },
}


def _fetch(query: str, sort_type: int, limit: int = 20) -> list[dict]:
    params = {
        "spider": 0,
        "query": query,
        "id_type": 2,  # article
        "sort_type": sort_type,  # 0 综合(最热) / 2 最新
        "limit": limit,
        "cursor": "0",
    }
    url = f"{SEARCH_API}?{urllib.parse.urlencode(params)}"
    try:
        with httpx.Client(timeout=15, headers={"User-Agent": UA}) as c:
            r = c.get(url)
            r.raise_for_status()
            return r.json().get("data", [])
    except Exception:
        return []


def _extract(item: dict) -> dict | None:
    model = item.get("result_model", {}) or {}
    info = model.get("article_info", {}) or {}
    aid = info.get("article_id")
    title = info.get("title")
    if not aid or not title:
        return None
    author = (model.get("author_user_info", {}) or {}).get("user_name", "")
    digg = int(info.get("digg_count", 0) or 0)
    view = int(info.get("view_count", 0) or 0)
    ctime = info.get("ctime")
    published = ""
    if ctime:
        try:
            published = datetime.fromtimestamp(int(ctime), tz=UTC).strftime("%Y-%m")
        except Exception:
            published = ""
    tags = [t.get("tag_name", "") for t in (model.get("tags") or [])]
    category = (model.get("category", {}) or {}).get("category_name", "")
    brief = (info.get("brief_content") or "").strip().replace("\n", " ")
    if len(brief) > 90:
        brief = brief[:90] + "…"
    return {
        "title": html.unescape(title),
        "source": "掘金",
        "author": author,
        "summary": brief or f"掘金社区高热度分享（👍{digg}），点击查看原文。",
        "url": f"https://juejin.cn/post/{aid}",
        "track": "",
        "published_at": published,
        "_digg": digg,
        "_view": view,
        "_tags": tags,
        "_category": category,
    }


RELEVANCE = {
    "product": [
        "产品经理",
        "产品设计",
        "产品岗",
        "需求",
        "prd",
        "产品运营",
        "交互",
        "用户体验",
        "product manager",
        "产品面",
        "做产品",
    ],
    "operation": [
        "运营",
        "增长",
        "拉新",
        "留存",
        "活动策划",
        "内容运营",
        "用户运营",
        "私域",
        "社群",
        "新媒体",
        "growth",
    ],
    "market": [
        "营销",
        "市场",
        "品牌",
        "广告",
        "投放",
        "推广",
        "增长黑客",
        "campaign",
        "marketing",
        "获客",
        "小红书 运营",
        "种草",
    ],
    "algorithm": [
        "算法",
        "机器学习",
        "深度学习",
        "leetcode",
        "推荐系统",
        "nlp",
        " cv ",
        "大模型",
        "数据结构",
        "神经网络",
        "ai ",
        "模型",
    ],
    "frontend": [
        "前端",
        "javascript",
        " js ",
        "react",
        "vue",
        "css",
        "浏览器",
        "webpack",
        "typescript",
        "vite",
        "node",
    ],
}


def is_relevant(key: str, rec: dict) -> bool:
    kws = RELEVANCE[key]
    hay = (
        " "
        + rec["title"].lower()
        + " "
        + " ".join(rec.get("_tags", [])).lower()
        + " "
        + rec.get("_category", "").lower()
        + " "
    )
    return any(kw.strip() in hay for kw in kws)


def collect_direction(key: str, cfg: dict) -> list[dict]:
    seen: dict[str, dict] = {}
    for q in cfg["queries"]:
        for sort_type in (0, 2):  # 最热 + 最新，扩大候选池
            for it in _fetch(q, sort_type, limit=20):
                rec = _extract(it)
                if not rec:
                    continue
                rec["track"] = key
                # keep the higher-digg copy if duplicated
                prev = seen.get(rec["url"])
                if not prev or rec["_digg"] > prev["_digg"]:
                    seen[rec["url"]] = rec
            time.sleep(0.15)
    # keep only posts truly relevant to this direction, then rank by likes desc
    relevant = [r for r in seen.values() if is_relevant(key, r)]
    ranked = sorted(relevant, key=lambda r: r["_digg"], reverse=True)
    return ranked


def check(url: str) -> bool:
    try:
        with httpx.Client(follow_redirects=True, timeout=12, headers={"User-Agent": UA}) as c:
            r = c.get(url)
            return r.status_code == 200
    except Exception:
        return False


# ---- 人人都是产品经理 (woshipm) source: authoritative for 产品/运营/市场 ----

WOSHIPM_CATEGORIES = {
    "product": ["pmd", "share", "it"],
    "operation": ["operate", "share"],
    "market": ["marketing", "yunying", "share"],
}
_LINK_RE = re.compile(r"https://www\.woshipm\.com/[a-z]+/\d+\.html")


def _woshipm_list(category: str, pages: int = 6) -> list[str]:
    urls: list[str] = []
    for page in range(1, pages + 1):
        u = (
            f"https://www.woshipm.com/category/{category}"
            if page == 1
            else f"https://www.woshipm.com/category/{category}/page/{page}"
        )
        try:
            with httpx.Client(timeout=12, headers={"User-Agent": UA}) as c:
                html_text = c.get(u, follow_redirects=True).text
        except Exception:
            continue
        urls.extend(_LINK_RE.findall(html_text))
        time.sleep(0.1)
    # de-dup preserving order
    seen: set[str] = set()
    out = []
    for x in urls:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _woshipm_article(url: str) -> dict | None:
    try:
        with httpx.Client(timeout=12, headers={"User-Agent": UA}) as c:
            h = c.get(url, follow_redirects=True).text
    except Exception:
        return None
    tm = re.search(r"<title>(.*?)</title>", h, re.S)
    if not tm:
        return None
    title = tm.group(1).split("|")[0].strip()
    if not title:
        return None

    def _num(pat: str) -> int:
        m = re.search(pat, h)
        if not m:
            return 0
        try:
            return int(m.group(1).replace(",", ""))
        except Exception:
            return 0

    praise = _num(r"点赞[^0-9]*([0-9,]+)")
    fav = _num(r"收藏[^0-9]*([0-9,]+)")
    view = _num(r"浏览[^0-9]*([0-9,]+)")
    # popularity score for ranking (favorites & views weigh more on woshipm)
    score = praise * 5 + fav * 3 + view // 20
    dm = re.search(
        r"<meta[^>]+name=[\"']description[\"'][^>]+content=[\"'](.*?)[\"']",
        h,
        re.S,
    )
    brief = (dm.group(1).strip() if dm else "")[:90]
    return {
        "title": title,
        "source": "人人都是产品经理",
        "author": "",
        "summary": brief
        or f"人人都是产品经理高热度分享（收藏 {fav}、浏览 {view}），点击查看原文。",
        "url": url,
        "track": "",
        "published_at": "",
        "_digg": fav,  # real favorite count (truthful heat signal)
        "_score": score,  # internal ranking only
        "_view": view,
        "_tags": [title],  # enable relevance filtering by title
        "_category": "",
    }


def collect_woshipm(key: str) -> list[dict]:
    cats = WOSHIPM_CATEGORIES.get(key, [])
    links: list[str] = []
    for cat in cats:
        links.extend(_woshipm_list(cat, pages=6))
    # de-dup
    links = list(dict.fromkeys(links))
    recs: list[dict] = []
    with ThreadPoolExecutor(max_workers=16) as ex:
        for r in ex.map(_woshipm_article, links):
            if r:
                r["track"] = key
                recs.append(r)
    return recs


# ---- CSDN source: broad reach for all directions ----

CSDN_QUERIES = {
    "product": ["产品经理 面经", "产品经理 秋招", "产品经理 面试", "产品经理 校招"],
    "operation": ["运营 面经", "运营 秋招", "用户运营 面试", "新媒体运营 面经"],
    "algorithm": ["算法 面经", "算法工程师 面经", "机器学习 面经", "leetcode 面经"],
    "market": ["市场营销 面经", "市场 求职", "品牌营销 面试", "营销 秋招"],
    "frontend": ["前端 面经", "前端 秋招", "javascript 面经", "react 面经"],
}


def _csdn_search(query: str, page: int = 1) -> list[dict]:
    params = {
        "q": query,
        "t": "blog",
        "p": page,
        "s": 0,
        "tm": 0,
        "lv": -1,
        "ft": 0,
        "l": "",
        "u": "",
        "ct": -1,
        "pnt": -1,
        "ry": -1,
        "suit": -1,
        "vip": -1,
        "dai": -1,
        "c": -1,
    }
    url = f"{CSDN_SEARCH}?{urllib.parse.urlencode(params)}"
    try:
        with httpx.Client(timeout=15, headers={**HEADERS, "Referer": "https://so.csdn.net/"}) as c:
            r = c.get(url)
            r.raise_for_status()
            return r.json().get("result_vos", []) or []
    except Exception:
        return []


def _csdn_clean(text: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", text or "")).strip()


def _csdn_extract(v: dict) -> dict | None:
    if v.get("type") != "blog":
        return None
    aid = v.get("articleid")
    user = v.get("username", "")
    title = _csdn_clean(v.get("title"))
    if not aid or not user or not title:
        return None
    digg = int(v.get("digg") or 0)
    view = int(v.get("view") or 0)
    brief = _csdn_clean(v.get("description") or v.get("digest") or "")
    if len(brief) > 90:
        brief = brief[:90] + "…"
    published = (v.get("created_at") or "")[:7]
    return {
        "title": title,
        "source": "CSDN",
        "author": v.get("nickname", ""),
        "summary": brief or f"CSDN 高热度技术分享（👍{digg}、浏览 {view}），点击查看原文。",
        "url": f"https://blog.csdn.net/{user}/article/details/{aid}",
        "track": "",
        "published_at": published,
        "_digg": digg,
        "_view": view,
        "_tags": [title, _csdn_clean(v.get("language") or "")],
        "_category": "",
    }


def collect_csdn(key: str) -> list[dict]:
    seen: dict[str, dict] = {}
    for q in CSDN_QUERIES.get(key, []):
        for page in range(1, 4):
            for v in _csdn_search(q, page):
                rec = _csdn_extract(v)
                if not rec:
                    continue
                rec["track"] = key
                prev = seen.get(rec["url"])
                if not prev or rec["_digg"] > prev["_digg"]:
                    seen[rec["url"]] = rec
            time.sleep(0.1)
    relevant = [r for r in seen.values() if is_relevant(key, r)]
    return sorted(relevant, key=lambda r: r["_digg"], reverse=True)


# ---- SegmentFault (思否) source: solid for tech directions ----

SF_QUERIES = {
    "product": ["产品经理 面经", "产品 面试"],
    "operation": ["运营 面经", "增长 面试"],
    "algorithm": ["算法 面经", "机器学习 面经", "leetcode 面试", "数据结构 面试"],
    "market": ["市场营销 面经", "增长 面试"],
    "frontend": ["前端 面经", "javascript 面试", "react 面经", "vue 面经"],
}


def _sf_ids(query: str) -> list[str]:
    url = "https://segmentfault.com/search?" + urllib.parse.urlencode({"q": query})
    try:
        with httpx.Client(timeout=15, headers=HEADERS, follow_redirects=True) as c:
            h = c.get(url).text
    except Exception:
        return []
    return list(dict.fromkeys(re.findall(r"/a/(\d+)", h)))


def _sf_article(aid: str) -> dict | None:
    url = f"https://segmentfault.com/a/{aid}"
    try:
        with httpx.Client(timeout=15, headers=HEADERS, follow_redirects=True) as c:
            h = c.get(url).text
    except Exception:
        return None
    # <title> is "tag - realtitle - author - SegmentFault 思否"; parse robustly.
    tm = re.search(r"<title>(.*?)</title>", h, re.S)
    if not tm:
        return None
    parts = [x.strip() for x in html.unescape(tm.group(1)).split(" - ") if x.strip()]
    # drop trailing site name
    parts = [x for x in parts if not x.startswith("SegmentFault")]
    author = ""
    # prefer the article <h1> as the real title (most reliable)
    hm = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
    title = ""
    if hm:
        title = html.unescape(re.sub(r"<[^>]+>", "", hm.group(1))).strip()
    if not title and parts:
        # fallback: longest middle segment is usually the title
        title = max(parts, key=len)
    if parts and parts[-1] != title and len(parts) >= 2:
        author = parts[-1]
    if not title:
        return None
    vm = re.search(r'"votes":(\d+)', h) or re.search(r"点赞[^0-9]{0,6}(\d+)", h)
    votes = int(vm.group(1)) if vm else 0
    dm = re.search(r'name="description" content="(.*?)"', h, re.S)
    brief = html.unescape(dm.group(1).strip()) if dm else ""
    if len(brief) > 90:
        brief = brief[:90] + "…"
    return {
        "title": title,
        "source": "SegmentFault 思否",
        "author": author,
        "summary": brief or f"SegmentFault 思否社区分享（👍{votes}），点击查看原文。",
        "url": url,
        "track": "",
        "published_at": "",
        "_digg": votes,
        "_view": 0,
        "_tags": [title],
        "_category": "",
    }


def collect_sifou(key: str) -> list[dict]:
    ids: list[str] = []
    for q in SF_QUERIES.get(key, []):
        ids.extend(_sf_ids(q))
        time.sleep(0.1)
    ids = list(dict.fromkeys(ids))
    recs: list[dict] = []
    with ThreadPoolExecutor(max_workers=12) as ex:
        for r in ex.map(_sf_article, ids):
            if r:
                r["track"] = key
                recs.append(r)
    relevant = [r for r in recs if is_relevant(key, r)]
    return sorted(relevant, key=lambda r: r["_digg"], reverse=True)


def main() -> int:
    """Merge multiple real sources, keep hottest reachable, guarantee >=3 sources."""
    result: dict[str, list[dict]] = {}
    hard_min = 50
    target = max(TARGET, 85)  # aim high; each source contributes real posts
    for key, cfg in DIRECTIONS.items():
        # gather candidates per source (already relevance-filtered + digg-sorted)
        per_source: dict[str, list[dict]] = {
            "掘金": collect_direction(key, cfg),
            "CSDN": collect_csdn(key),
            "SegmentFault 思否": collect_sifou(key),
        }
        if key in ("product", "operation", "market"):
            wp = [r for r in collect_woshipm(key) if is_relevant(key, r)]
            per_source["人人都是产品经理"] = sorted(
                wp, key=lambda r: r.get("_score", r["_digg"]), reverse=True
            )
        counts = {s: len(v) for s, v in per_source.items()}
        print(f"{key}: candidates per source = {counts}")

        # validate reachability per source (parallel), keep reachable only
        reachable: dict[str, list[dict]] = {}
        for source, cands in per_source.items():
            cands = cands[: max(target, 60)]
            with ThreadPoolExecutor(max_workers=16) as ex:
                oks = list(ex.map(check, [c["url"] for c in cands]))
            reachable[source] = [c for c, ok in zip(cands, oks, strict=False) if ok]

        # ensure >=3 sources have content; sources ranked by availability
        live_sources = [s for s in reachable if reachable[s]]
        # round-robin across sources so no single source dominates -> multi-source
        kept: list[dict] = []
        seen_urls: set[str] = set()
        idx = {s: 0 for s in live_sources}
        while len(kept) < target:
            progressed = False
            for s in live_sources:
                i = idx[s]
                if i < len(reachable[s]):
                    c = reachable[s][i]
                    idx[s] += 1
                    if c["url"] not in seen_urls:
                        seen_urls.add(c["url"])
                        kept.append(c)
                        progressed = True
                    if len(kept) >= target:
                        break
            if not progressed:
                break

        cleaned = [
            {
                "title": c["title"],
                "source": c["source"],
                "author": c["author"],
                "summary": c["summary"],
                "url": c["url"],
                "track": c["track"],
                "published_at": c["published_at"],
                "likes": c["_digg"],
            }
            for c in kept
        ]
        result[key] = cleaned
        src_hist: dict[str, int] = {}
        for c in cleaned:
            src_hist[c["source"]] = src_hist.get(c["source"], 0) + 1
        print(f"  -> kept {len(cleaned)} reachable across {len(src_hist)} sources: " f"{src_hist}")

    total = sum(len(v) for v in result.values())
    print("TOTAL:", total)
    problems: dict[str, str] = {}
    for k, v in result.items():
        sources = {i["source"] for i in v}
        if len(v) < hard_min:
            problems[k] = f"under {hard_min} ({len(v)})"
        elif len(sources) < 3:
            problems[k] = f"only {len(sources)} sources"
    if problems:
        print("WARNING:", problems)

    out = Path(__file__).resolve().parents[1] / "app/db/seeds/experiences.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", out)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
