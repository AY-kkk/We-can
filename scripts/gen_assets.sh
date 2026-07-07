#!/usr/bin/env bash
# Generate brand assets with ark-cli seeddream (doubao-seedream via agent-plan profile).
# Usage: bash scripts/gen_assets.sh [name1 name2 ...]   # empty = generate all
# Each asset's prompt is documented in docs/DESIGN.md for reproducibility.
#
# 降级策略：若 ark-cli 不可用，脚本打印提示并退出 0（不阻塞交付），
# 现有 frontend/src/assets/generated/*.jpeg 作为占位继续可用。
set -uo pipefail

GROOT="$(npm root -g 2>/dev/null || echo '')"
ARK="$GROOT/@byted-aml/ark-cli/bin/arkcli-darwin-arm64"
PROFILE="agent-plan_cn-beijing_personal"
OUT="frontend/src/assets/generated"
# seedream 要求 >= 3,686,400 px；2048x2048 满足。
SIZE="2048x2048"
# web 友好压缩目标边长
WEB_EDGE="640"
mkdir -p "$OUT"

if [ ! -x "$ARK" ]; then
  echo "[gen_assets] ark-cli 不可用（$ARK）。跳过生成，沿用现有占位素材。TODO：具备环境后重跑。"
  exit 0
fi

STYLE="扁平矢量插画风格，靛蓝薄荷绿(#1f8f74)与珊瑚橙(#ff7a45)配色，柔和圆角，充足留白，简洁教育科技风，纯白背景，无文字水印，无 emoji，克制不刺眼"

gen () {
  local name="$1"; shift
  local prompt="$1"; shift
  # 允许只生成指定素材
  if [ -n "${SELECTED:-}" ] && ! echo " $SELECTED " | grep -q " $name "; then
    return 0
  fi
  echo ">> generating $name"
  rm -f "$OUT/ark-gen.jpeg"
  "$ARK" --profile "$PROFILE" +gen --size "$SIZE" --save-to "$OUT" "$prompt" \
    >/tmp/ark_$name.json 2>&1 || { echo "   FAILED $name (see /tmp/ark_$name.json)"; return 0; }
  if [ -f "$OUT/ark-gen.jpeg" ]; then
    mv -f "$OUT/ark-gen.jpeg" "$OUT/$name.jpeg"
    # 压缩为 web 友好尺寸（保留纵横比，长边 640）
    command -v sips >/dev/null 2>&1 && sips -Z "$WEB_EDGE" "$OUT/$name.jpeg" >/dev/null 2>&1 || true
    echo "   OK $name.jpeg"
  else
    echo "   NO OUTPUT $name"
  fi
}

SELECTED="${*:-}"

# 1) 品牌吉祥物：≥4 姿态/表情（欢迎 / 加油 / 成功 / 思考）
gen "mascot"       "求职助手品牌吉祥物：一只友好的猫头鹰戴学士帽，微笑鼓励、欢迎的姿态，$STYLE"
gen "mascot-wave"  "求职助手吉祥物猫头鹰戴学士帽，挥手打招呼欢迎的姿态，$STYLE"
gen "mascot-cheer" "求职助手吉祥物猫头鹰戴学士帽，双手握拳加油打气、充满干劲的姿态，$STYLE"
gen "mascot-think" "求职助手吉祥物猫头鹰戴学士帽，一只翅膀托腮认真思考的姿态，旁边有一个灯泡，$STYLE"

# 2) 状态插画：空 / 加载 / 成功 / 错误
gen "empty"    "空状态插画：一个打开的空文件夹与放大镜，柔和友好，$STYLE"
gen "loading"  "加载状态插画：一个温和旋转的沙漏与漂浮的圆点，安静等待的氛围，$STYLE"
gen "success"  "成功状态插画：一枚对勾徽章与庆祝彩带丝带，鼓励喜悦但克制，$STYLE"
gen "error"    "错误状态插画：一个温和的警示三角图标与断开的连接线，友好不焦虑，$STYLE"

# 3) 五栏目模块头图（简历 / 笔面 / 复盘 / Landing / 经验）
gen "hero-resume"     "简历打磨模块头图：一份整洁的简历文档与润色星星光点，$STYLE"
gen "hero-prep"       "笔面准备模块头图：对话气泡与题库卡片，$STYLE"
gen "hero-review"     "面试复盘模块头图：麦克风与上升的折线图表，$STYLE"
gen "hero-landing"    "入职 Landing 模块头图：清单勾选与握手沟通元素，$STYLE"
gen "hero-experience" "经验帖模块头图：一叠卡片与书签收藏元素，$STYLE"

# 4) 鉴权品牌插画：登录 / 注册 / 忘记密码 各 1 张（区分场景）
gen "auth-login"   "登录页品牌插画：戴学士帽的猫头鹰坐在书本与笔记本电脑旁，温暖欢迎回来的氛围，$STYLE"
gen "auth-register" "注册页品牌插画：戴学士帽的猫头鹰挥手迎接新朋友，旁边有成长的小树苗，启程氛围，$STYLE"
gen "auth-forgot"  "忘记密码页品牌插画：戴学士帽的猫头鹰拿着一把钥匙面对一把锁，安心找回的氛围，$STYLE"

echo "done. outputs in $OUT"
