# 架构说明

## 总览

We-can 采用「前后端分离 + 分层解耦 + Provider 可插拔」架构。

```
┌────────────────────────────────────────────────────────────┐
│                     Frontend (React 18)                     │
│  Pages(5) → api(axios) ──HTTP──▶ Backend                    │
│  Zustand(theme) · Tailwind/shadcn 风格 · Recharts · Framer   │
└────────────────────────────────────────────────────────────┘
                              │  /api/v1/*
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  api (路由层, 不写业务)                                       │
│      ▼ Depends 注入                                          │
│  services (业务逻辑, 可单测)                                  │
│      ▼                    ▼                                  │
│  db (SQLAlchemy 2.0)   providers (LLM/Search/Transcriber)   │
│  SQLite / Postgres     mock 默认 · openai_like 真实(env)     │
└────────────────────────────────────────────────────────────┘
```

## 分层职责

| 层 | 目录 | 职责 |
| --- | --- | --- |
| 路由 | `app/api/v1/` | 参数解析、依赖注入、调用 service、返回统一 envelope |
| 业务 | `app/services/` | 纯业务逻辑，无框架耦合，便于单测 |
| 数据 | `app/db/` | ORM 模型、session、建表 |
| 外部能力 | `app/providers/` | LLM/搜索/转写抽象接口 + mock + 真实实现 + 工厂 |
| 模型 | `app/schemas/` | Pydantic 请求/响应校验 |
| 核心 | `app/core/` | 配置、日志、异常、依赖 |

## 数据流（以栏目1为例）

1. 前端上传简历文件 → `POST /resume/parse` → `utils/files` 抽取文本 → `resume_service.parse_resume`。
2. 前端提交文本+JD → `POST /resume/polish` → service 按 STAR 逐条润色 + 生成 A4 HTML。
3. `POST /resume/intro` 生成 5/2/1 分钟自我介绍。
4. 导出：前端 `react-to-print`（首选）/ `POST /resume/export-pdf`（weasyprint 兜底）。

## Provider 可插拔

- `providers/base.py` 定义 `LLMProvider / SearchProvider / TranscriberProvider` 抽象接口。
- `providers/mock.py` 默认实现，无密钥即可跑通 demo。
- `providers/openai_like.py` 真实实现，读环境变量。
- `providers/factory.py` 根据 env 选择实现；新增实现只需实现接口 + 改工厂一行。

## 统一响应

所有接口返回 `{code, message, data}`。`code=0` 表示成功；异常由 `core/exceptions.py`
全局 handler 捕获并转换为统一 envelope。
