# API 文档

后端启动后交互式文档：<http://localhost:8000/docs>。统一响应：`{ "code": 0, "message": "ok", "data": <payload> }`。

除 `/auth/*`、`GET /experience`（搜索）外，业务接口均需 `Authorization: Bearer <access_token>`。

## 系统
- `GET /health` — 健康检查。

## 鉴权 `/api/v1/auth`
- `POST /register` — `{email, username, password}` → 用户 + 令牌对。
- `POST /login` — `{email, password}` → 用户 + 令牌对（失败限流/锁定）。
- `POST /refresh` — `{refresh_token}` → 新令牌对（旋转旧 token）。
- `POST /logout` — `{refresh_token}` → 吊销该 refresh。
- `GET /me` — 当前用户信息（需 access token）。
- `POST /forgot-password` — `{email}` → 重置令牌（演示直接返回）。
- `POST /reset-password` — `{reset_token, new_password}`。
- `POST /change-password` — `{current_password, new_password}` → 新令牌对（校验旧密码，成功后吊销该用户全部 refresh，其他设备需重新登录）。

## 管理员 `/api/v1/admin`（需 admin 角色）
- `GET /dashboard` — 注册/活跃/管理员数、近 7 日新增、各栏目使用量。
- `GET /users?q=&page=&page_size=` — 用户列表（搜索+分页）。
- `PATCH /users/{id}` — `{is_active?, role?}` 启用禁用/改角色（禁止对自己降级/禁用）。
- `POST /users/{id}/reset-password` — `{new_password}`。
- `DELETE /users/{id}` — 删除用户（禁止删自己）。

## 栏目1 简历 `/api/v1/resume`
`POST /parse`（文件）、`POST /polish`、`POST /intro`、`POST /export-pdf`。

## 栏目2 笔面 `/api/v1/prep`
- `POST /question-bank` — `{track, keyword}` → 四类题库(116/方向) + 人格 + 参考来源。
- `POST /questions` — `{track, resume_text}` → 通用题 + 简历定制题。
- `POST /mock-interview` — `{track, resume_text, session_id?, answer?, history[]}` → 人格化多轮 + 三维打分。

## 栏目3 复盘 `/api/v1/review`
`POST /upload`、`POST /transcribe`、`POST /analyze`、`GET /history`（均按 user 隔离）。

## 栏目4 Landing `/api/v1/landing`
`GET/POST/PUT /checklist`、`DELETE /checklist/{id}`、`POST /polish-message`（按 user 隔离）。

## 栏目5 经验 `/api/v1/experience`
- `GET /?track=&q=&source=` — 多源真实经验帖（85/方向，带原文链接，可按 source 过滤）。
- `GET /sources?track=` — 该方向可选来源及数量（供前端来源筛选）。
- `POST /collect`、`GET /collected`、`DELETE /collected/{id}`（收藏按 user 隔离）。
