# 各环节集成的开源 Skill / 库（GOAL v2 §7）

每引入一个库记录：用途、版本、许可证、集成位置。需密钥/大模型的默认 mock，真实实现在 provider 中经 env 开启。

| 栏目/环节 | 库 / 方案 | 版本 | 许可证 | 集成位置 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 简历解析 | pdfplumber | ≥0.11 | MIT | `app/utils/files.py` | PDF 文本抽取 |
| 简历解析 | python-docx | ≥1.1 | MIT | `app/utils/files.py` | DOCX 文本抽取 |
| 简历 PDF 导出 | weasyprint | ≥61 | BSD-3 | `services/resume_service.py` | 后端兜底导出；前端 react-to-print 首选 |
| 简历 A4 模板 | OpenResume（参考其数据结构与 A4 排版思路） | - | MIT | `services/resume_service.py` | 参考实现，未直接依赖 |
| 题库/案例搜索 | httpx + SearchProvider 抽象 | ≥0.27 | BSD/MIT | `providers/*` | mock 默认；`http` 真实实现经 env 开启 |
| 案例搜集 | 自研可达性校验采集脚本 | - | 本仓库 | `scripts/build_experiences.py` | 真实多源链接 + HTTP 200 校验，落地 seed JSON |
| 语音转写 | faster-whisper / whisper.cpp（真实实现方向） | - | MIT | `providers/openai_like.py` (HttpTranscriber) | 无本地模型时降级 mock |
| 鉴权 | PyJWT | ≥2.8 | MIT | `core/security.py` | JWT access/refresh |
| 鉴权 | bcrypt | ≥4.1 | Apache-2.0 | `core/security.py` | 密码哈希 |
| 鉴权 | email-validator | ≥2.1 | 见包 | `schemas/auth.py` | 邮箱格式校验 |
| 鉴权（备选） | fastapi-users | - | MIT | - | 已按可平滑迁移设计，当前用轻量自研基线 |
| 生图素材 | ark-cli seeddream (doubao-seedream-4-0) | 0.1.17 | 内部工具 | `scripts/gen_assets.sh` | 生成品牌素材，见 DESIGN.md |
| 前端图表 | recharts | ^2.12 | MIT | 复盘/看板 | 趋势与仪表盘 |
| 前端动效 | framer-motion | ^11 | MIT | 布局/页面 | 页面过渡与微交互 |
| 前端图标 | lucide-react | ^0.44 | ISC | 全站 | 线性统一图标 |
| 前端打印 | react-to-print | ^3 | MIT | 栏目1 | A4 简历导出首选 |

集成失败或不达标不阻塞主流程 —— 先 mock 兜底保证跑通，再迭代替换真实实现。
