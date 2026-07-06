# 鉴权设计（AUTH）

## 选型调研与结论（2026）

对比了三类主流 Web 鉴权方案：

| 方案 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- |
| Session + Cookie（服务端会话） | 简单、易吊销 | 需要服务端共享存储、横向扩展稍麻烦 | 不选 |
| **JWT（access + refresh）** | 无状态、易水平扩展、前后端分离友好 | 需处理刷新与吊销 | **选用（基线）** |
| 第三方托管（Auth0/Clerk 等） | 省心、功能全 | 引入外部依赖与成本、离线不可用 | 不选（保持可离线跑通） |

结论：采用 **JWT access + refresh** 双令牌方案，密码用 **bcrypt** 加盐哈希。
该方案与 FastAPI + SPA 架构最契合，且无需任何外部服务即可离线跑通。
若后续需要更完整的用户体系，可平滑迁移到 `fastapi-users`（接口已按可替换设计）。

## 令牌设计

- **access token**：短时（默认 30 分钟），`type=access`，载荷含 `sub`(user id)、`role`。
  前端存内存 / localStorage，随请求 `Authorization: Bearer` 头发送。
- **refresh token**：长时（默认 7 天），`type=refresh`，含唯一 `jti`，落库 `refresh_tokens` 表。
  刷新时**旋转**（旧 token 置 `revoked`，发新 token），降低泄漏风险。
  生产建议存 httpOnly cookie；本项目为演示在响应体返回。
- **登出**：将该 refresh token 的 `jti` 标记 `revoked`。

## 密码与安全

- 密码使用 `bcrypt`（自动加盐）哈希存储，接口**永不返回**明文或哈希。
- 注册校验：邮箱格式（email-validator）、用户名 2–40 字、密码 ≥8 位且含字母+数字。
- 登录限流：连续失败 `LOGIN_MAX_ATTEMPTS`(默认 5) 次后锁定 `LOGIN_LOCKOUT_MINUTES`(默认 10) 分钟。
- CORS 白名单由 `CORS_ORIGINS` 控制；异常统一 `{code,message,data}`，不泄漏堆栈。
- 密钥（`JWT_SECRET`）仅从环境变量读取，仓库不含真实密钥。

## 角色与守卫

- 角色枚举：`user` / `admin`。
- 依赖注入守卫：`get_current_user`（登录）、`get_current_admin`（管理员）。
- 五个业务栏目均要求登录，且数据按 `user_id` 隔离（用户只见自己的简历/复盘/清单/收藏）。
- `/api/v1/admin/*` 需 admin 角色；普通用户访问返回 403（前端路由亦拦截）。

## 端点

`/api/v1/auth`：`register` / `login` / `refresh` / `logout` / `me` / `forgot-password` / `reset-password`。

## 种子管理员

首次启动（lifespan）自动创建管理员账号，邮箱/密码来自 env：
`ADMIN_EMAIL` / `ADMIN_USERNAME` / `ADMIN_PASSWORD`（见 `.env.example`）。
默认：`admin@wecan.dev` / `Admin@12345`（**请在生产环境务必修改**）。
