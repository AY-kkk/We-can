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

工具：`ark-cli`（`@byted-aml/ark-cli`）`+gen`（seeddream / doubao 图像模型）。
生成配置见 `scripts/gen_assets.sh`（可复现 / 再生）：

- Profile：`agent-plan_cn-beijing_personal`（其 `Resources.image.default` 指向 seedream 图像模型）。
- 尺寸：`2048x2048`（seedream 要求 ≥ 3,686,400 px），生成后用 `sips -Z 640` 压缩为 web 友好长边 640 的 JPEG。
- 统一风格串（STYLE）：
  > 扁平矢量插画风格，靛蓝薄荷绿(#1f8f74)与珊瑚橙(#ff7a45)配色，柔和圆角，充足留白，简洁教育科技风，纯白背景，无文字水印，无 emoji，克制不刺眼

运行：`bash scripts/gen_assets.sh`（全部）或 `bash scripts/gen_assets.sh mascot-cheer loading`（指定项）。
落地位置：`frontend/src/assets/generated/`，统一经 `frontend/src/assets/index.ts` 注册后引用；
提供语义映射 `mascotPose` / `columnHero` / `authIllustration` 便于复用。

### 亮 / 暗双主题适配
插画统一纯白背景 + 克制配色；在组件中由外层容器提供主题背景与轻投影
（亮色 `bg-brand-50`、暗色 `dark:bg-ink-800` + `shadow-card` / `shadow-float`），
从而在两种主题下都保持柔和对比，无需为暗色单独出图。

### 素材清单 · Prompt · 用途 · 引用组件

| 文件 | 类别 | Prompt 摘要 | 用途 | 引用组件（路径） |
| --- | --- | --- | --- | --- |
| `mascot.jpeg` | 吉祥物·欢迎 | 猫头鹰戴学士帽，微笑鼓励欢迎 | 欢迎/品牌 | `mascotPose.welcome` → `src/pages/auth/Login.tsx` |
| `mascot-wave.jpeg` | 吉祥物·招手 | 猫头鹰挥手打招呼 | 注册欢迎 | `mascotPose.wave` → `src/pages/auth/Register.tsx` |
| `mascot-cheer.jpeg` | 吉祥物·加油 | 猫头鹰双手握拳加油打气 | 导航陪跑卡 | `mascotPose.cheer` → `src/layouts/Sidebar.tsx` |
| `mascot-think.jpeg` | 吉祥物·思考 | 猫头鹰托腮思考+灯泡 | 模拟面试前引导 | `mascotPose.think` → `src/pages/Prep/index.tsx` |
| `empty.jpeg` | 状态·空 | 空文件夹与放大镜 | 空状态 | `assets.empty` → `src/components/States.tsx`（EmptyState） |
| `loading.jpeg` | 状态·加载 | 温和沙漏与漂浮圆点 | 加载态 | `assets.loading` → `src/components/States.tsx`（LoadingState） |
| `success.jpeg` | 状态·成功 | 对勾徽章与彩带 | 成功反馈 | `assets.success` → `src/components/States.tsx`（SuccessState）→ `src/pages/auth/ForgotPassword.tsx` |
| `error.jpeg` | 状态·错误 | 温和警示与断连线 | 错误态 | `assets.error` → `src/components/States.tsx`（ErrorState） |
| `auth-login.jpeg` | 鉴权·登录 | 猫头鹰坐书本与笔记本旁 | 登录页品牌插画 | `authIllustration.login` → `src/layouts/AuthLayout.tsx` |
| `auth-register.jpeg` | 鉴权·注册 | 猫头鹰迎接新朋友+小树苗 | 注册页品牌插画 | `authIllustration.register` → `src/layouts/AuthLayout.tsx` |
| `auth-forgot.jpeg` | 鉴权·找回 | 猫头鹰持钥匙面对锁 | 忘记密码页品牌插画 | `authIllustration.forgot` → `src/layouts/AuthLayout.tsx` |
| `hero-resume.jpeg` | 栏目头图·简历 | 整洁简历文档与润色星光 | 简历打磨 Hero | `columnHero.resume` → `src/pages/Resume/index.tsx` |
| `hero-prep.jpeg` | 栏目头图·笔面 | 对话气泡与题库卡片 | 笔面准备 Hero | `assets.heroPrep` → `src/pages/Prep/index.tsx` |
| `hero-review.jpeg` | 栏目头图·复盘 | 麦克风与上升折线图 | 面试复盘 Hero | `columnHero.review` → `src/pages/Review/index.tsx` |
| `hero-landing.jpeg` | 栏目头图·Landing | 清单勾选与握手 | 秋招 Landing Hero | `columnHero.landing` → `src/pages/Landing/index.tsx` |
| `hero-experience.jpeg` | 栏目头图·经验 | 一叠卡片与书签 | 经验帖 Hero | `assets.heroExperience` → `src/pages/Experience/index.tsx` |

> 降级策略：若某环境 `ark-cli` / seeddream 不可用，`scripts/gen_assets.sh` 会检测缺失并
> 打印 TODO 提示后 `exit 0`（不阻塞交付），沿用 `frontend/src/assets/generated/` 现有素材；
> 本表 prompt 完整保留，便于后续复用与再生。
