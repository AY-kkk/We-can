# 设计规范（DESIGN）

## 参考稿

GOAL v2 §6 新参考稿：<https://dribbble.com/shots/26957747-Platform-for-an-AI-Product-Seto>
（AI 产品平台风：干净的深浅对比、卡片化模块、克制强调色、精致图标与插画、充足留白、柔和圆角与轻投影。）

## Design Tokens（见 `frontend/src/theme/tokens.ts` 与 `tailwind.config.ts`）

- **主色**：靛蓝/薄荷绿 `brand`（#1f8f74 系列，9 级）——仅用于 CTA 与关键强调。
- **强调色**：珊瑚橙 `accent`（#ff7a45）——用于次级 CTA/高亮，遵循 60-30-10。
- **中性灰**：`ink` 9 级；背景用极浅灰（CSS 变量 `--bg`）而非纯白。
- **字体**：`system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`，正文行高 1.5–1.75。
- **间距**：8px 网格（4/8/12/16/24/32/48/64）。
- **圆角**：卡片 12–16px / 按钮 8px / 胶囊 9999px。
- **阴影**：`card` / `float` / `modal` 三层级。
- **动效**：进入 ease-out、离开 ease-in，150–300ms，支持 `prefers-reduced-motion`。
- **主题**：亮/暗双主题，CSS 变量切换。

## 「无 AI 味」自检清单

- 无刺眼紫蓝赛博大渐变、无 emoji 堆砌；图标统一 lucide 线性风格。
- 卡片有真实层次（留白+细边框+轻投影），信息分组遵循格式塔接近性。
- 真实空态/骨架屏/错误态插画（使用下方生成素材），非纯文字 Loading。
- 组件覆盖 Default/Hover/Focus/Disabled/Loading/Error/Empty 七态。
- 对比度 ≥ WCAG AA 4.5:1；响应式桌面/平板/移动三档。

## seeddream 生成素材

工具：`ark-cli`（`@byted-aml/ark-cli`）`+gen`，模型 `doubao-seedream-4-0`，尺寸 2048x2048，
生成后用 `sips -Z 640` 压缩为 web 友好尺寸。生成脚本：`scripts/gen_assets.sh`（可复现/再生）。
统一风格串（STYLE）：
> 扁平矢量插画风格，靛蓝薄荷绿与珊瑚橙配色，柔和圆角，充足留白，简洁教育科技风，纯白背景，无文字水印

落地位置：`frontend/src/assets/generated/`，通过 `frontend/src/assets/index.ts` 引用。

| 文件 | 用途 | Prompt 摘要 |
| --- | --- | --- |
| `mascot.jpeg` | 品牌吉祥物（侧边栏/首屏） | 友好的猫头鹰戴学士帽，微笑鼓励姿态 |
| `mascot-wave.jpeg` | 吉祥物（欢迎/注册） | 猫头鹰挥手打招呼 |
| `empty.jpeg` | 空状态插画 | 打开的空文件夹与放大镜 |
| `success.jpeg` | 成功状态 | 对勾徽章与彩带 |
| `error.jpeg` | 错误状态 | 温和警示图标与断开连接线 |
| `auth-hero.jpeg` | 登录/注册页品牌插画 | 猫头鹰坐在书本与笔记本旁 |
| `hero-resume.jpeg` | 栏目1 头图 | 整洁简历文档与润色星星 |
| `hero-prep.jpeg` | 栏目2 头图 | 对话气泡与题库卡片 |
| `hero-review.jpeg` | 栏目3 头图 | 麦克风与上升折线图 |
| `hero-landing.jpeg` | 栏目4 头图 | 清单与握手沟通 |
| `hero-experience.jpeg` | 栏目5 头图 | 一叠卡片与书签收藏 |

> 若 `ark-cli`/seeddream 在某环境不可用：保留 `scripts/gen_assets.sh` 与本表 prompt，
> 前端 `assets/index.ts` 可切换为占位插画，不阻塞交付。
