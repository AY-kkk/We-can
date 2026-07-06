# We-can · 秋招小助手 🎓

> 从 **简历打磨 → 笔面准备 → 面试复盘 → 秋招 Landing → 经验汲取**，
> 一站式陪跑秋招同学走完求职全链路的网页版小助手。

每个栏目背后对应一个「智能体人格」，通过可插拔的 Provider 抽象接入 LLM / 搜索 / 转写能力，
**默认 mock，无需任何密钥即可跑通完整 demo**。

## ✨ 功能栏目

| 栏目 | 人格 | 核心能力 |
| --- | --- | --- |
| 简历打磨 | 全栈大师 / 前端设计师 | 简历解析 → STAR 逐条润色 → A4 简历导出 → 5/2/1 分钟自我介绍 |
| 笔面准备 | AI 产品导师 Echo / 产运导师 Nova | 岗位题库 + 高频题 + 简历定制追问 + 多轮模拟面试打分 |
| 面试复盘 | 产运导师 Nova | 录音/上传 → 转写 → 复盘报告（时间线/优劣/行动项）→ 趋势图 |
| 秋招 Landing | 高情商话术润色 | 入职材料 checklist（持久化）+ 话术润色（温和/直接双版本） |
| 经验帖集合 | 产运导师 Nova | 按方向聚合经验帖（带原文链接）+ 筛选 + 搜索 + 收藏 |

## 🖼️ 界面预览

| 简历打磨 | 笔面准备 |
| --- | --- |
| ![resume](docs/screenshots/resume.png) | ![prep](docs/screenshots/prep.png) |

| 面试复盘 | 秋招 Landing |
| --- | --- |
| ![review](docs/screenshots/review.png) | ![landing](docs/screenshots/landing.png) |

| 经验帖集合 |
| --- |
| ![experience](docs/screenshots/experience.png) |

## 🧱 技术栈

- **前端**：React 18 + TypeScript + Vite · Tailwind CSS + shadcn 风格组件 + Framer Motion ·
  Zustand · Recharts · react-router v6 · react-to-print · lucide-react
- **后端**：FastAPI (Python 3.11) + Pydantic v2 · SQLAlchemy 2.0 (async) · SQLite（可切 Postgres）
- **能力接入**：`LLMProvider / SearchProvider / TranscriberProvider` 抽象，mock 默认、真实实现走 env
- **测试**：pytest（后端，关键 service ≥ 60%）· vitest + testing-library（前端）
- **工程**：Docker + docker-compose · GitHub Actions（lint + test + build）

## 🚀 本地启动

### 方式一：docker-compose（推荐）

```bash
docker compose up --build
# 前端 http://localhost:5173  后端 http://localhost:8000/docs
```

### 方式二：手动启动

**后端**

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate   # 或 uv venv .venv
pip install -e ".[dev]"                                  # 或 uv pip install -e ".[dev]"
cp ../.env.example .env                                   # 可选，默认值已可跑
uvicorn app.main:app --reload --port 8000
```

**前端**

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env    # 可选
npm run dev        # http://localhost:5173
```

> 前端 dev 已配置 `/api` 代理到 `http://localhost:8000`，两端同时启动即可端到端联调。

## ✅ 测试与质量

```bash
# 后端
cd backend && source .venv/bin/activate
ruff check app tests && black --check app tests
pytest --cov=app --cov-report=term-missing        # 覆盖率约 81%

# 前端
cd frontend
npm run lint && npm test && npm run build
```

## 🔧 环境变量

见 [`.env.example`](.env.example)。核心项：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite+aiosqlite:///./wecan.db` | 数据库；可切 Postgres |
| `LLM_PROVIDER` | `mock` | `mock` / `openai_like` |
| `LLM_API_KEY` | 空 | 真实 LLM 密钥（仅后端读取，禁止前端直连） |
| `SEARCH_PROVIDER` | `mock` | `mock` / `http` |
| `TRANSCRIBER_PROVIDER` | `mock` | `mock` / `http` |
| `MAX_UPLOAD_MB` | `15` | 上传大小上限 |
| `VITE_API_BASE_URL` | `http://localhost:8000` | 前端后端地址 |

> 所有密钥仅通过环境变量注入，仓库内不含任何密钥。缺省 mock 保证无密钥可跑通。

## 📁 目录结构

```
We-can/
├─ backend/            # FastAPI 后端（api / services / db / providers / schemas / core）
│  ├─ app/
│  └─ tests/           # pytest
├─ frontend/           # React 前端（pages / components / layouts / api / store / theme）
│  └─ src/
├─ docs/               # ARCHITECTURE.md / API.md / screenshots
├─ docker-compose.yml
└─ .github/workflows/  # CI
```

更多：[架构说明](docs/ARCHITECTURE.md) · [API 文档](docs/API.md)

## 📄 License

[MIT](LICENSE)
