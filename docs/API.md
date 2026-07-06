# API 文档

后端启动后可访问交互式 OpenAPI 文档：<http://localhost:8000/docs>。

统一响应格式：`{ "code": 0, "message": "ok", "data": <payload> }`。

## 系统
- `GET /health` — 健康检查。

## 栏目1 简历打磨 `/api/v1/resume`
- `POST /parse` — 上传简历文件(PDF/DOCX/TXT/MD)，抽取文本、经历、分节。
- `POST /polish` — body `{resume_text, jd_text}`，STAR 逐条润色 + A4 HTML。
- `POST /intro` — body `{resume_text, jd_text}`，返回 5/2/1 分钟自我介绍。
- `POST /export-pdf` — body `{html}`，weasyprint 兜底导出 PDF（二进制流）。

## 栏目2 笔面准备 `/api/v1/prep`
- `POST /question-bank` — body `{role, keyword}`，题库 + 高频题 + 参考来源。
- `POST /questions` — body `{role, resume_text}`，通用题 + 简历定制题。
- `POST /mock-interview` — body `{role, resume_text, session_id?, answer?, history[]}`，
  多轮模拟面试；提交 answer 时返回结构化打分。

## 栏目3 面试复盘 `/api/v1/review`
- `POST /upload` — 上传音频文件，返回 `file_id`。
- `POST /transcribe` — body `{file_id}`，转写为文本。
- `POST /analyze` — body `{transcript, title}`，生成复盘报告并入库。
- `GET /history` — 历史复盘列表（用于趋势图）。

## 栏目4 秋招 Landing `/api/v1/landing`
- `GET /checklist` — 材料清单（首次自动写入默认项）。
- `POST /checklist` — 新增自定义项。
- `PUT /checklist` — 更新（勾选/备注/标题）。
- `DELETE /checklist/{id}` — 删除。
- `POST /polish-message` — body `{message, audience, scenario, channel}`，
  返回温和版/直接版双版本 + 润色说明。

## 栏目5 经验帖集合 `/api/v1/experience`
- `GET /?track=&q=` — 按方向 + 关键词搜索经验帖（带原文链接）。
- `POST /collect` — 收藏一条经验帖。
- `GET /collected` — 收藏列表。
- `DELETE /collected/{id}` — 取消收藏。
