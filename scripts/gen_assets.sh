#!/usr/bin/env bash
# Generate brand assets with ark-cli seeddream (doubao-seedream-4-0).
# Usage: bash scripts/gen_assets.sh
# Each asset's prompt is documented in docs/DESIGN.md for reproducibility.
set -euo pipefail

GROOT="$(npm root -g)"
ARK="$GROOT/@byted-aml/ark-cli/bin/arkcli-darwin-arm64"
OUT="frontend/src/assets/generated"
MODEL="doubao-seedream-4-0"
SIZE="2048x2048"
mkdir -p "$OUT"

gen () {
  local name="$1"; shift
  local prompt="$1"; shift
  echo ">> generating $name"
  ( cd "$OUT" && "$ARK" +gen --model "$MODEL" --size "$SIZE" "$prompt" >/tmp/ark_$name.json 2>&1 || true
    if [ -f ark-gen.jpeg ]; then mv -f ark-gen.jpeg "$name.jpeg"; fi )
}

STYLE="扁平矢量插画风格，靛蓝(#1f8f74 薄荷绿)与珊瑚橙(#ff7a45)配色，柔和圆角，充足留白，简洁教育科技风，纯白背景，无文字水印"

gen "mascot" "求职助手品牌吉祥物：一只友好的猫头鹰戴学士帽，微笑鼓励的姿态，$STYLE"
gen "mascot-wave" "求职助手吉祥物猫头鹰戴学士帽，挥手打招呼的姿态，$STYLE"
gen "empty" "空状态插画：一个打开的空文件夹与放大镜，柔和，$STYLE"
gen "success" "成功状态插画：一枚对勾徽章与彩带庆祝元素，$STYLE"
gen "error" "错误状态插画：一个温和的警示图标与断开的连接线，$STYLE"
gen "auth-hero" "登录页品牌插画：戴学士帽的猫头鹰坐在书本与笔记本电脑旁，温暖鼓励氛围，$STYLE"
gen "hero-resume" "简历打磨模块头图：一份整洁的简历文档与星星润色元素，$STYLE"
gen "hero-prep" "笔面准备模块头图：对话气泡与题库卡片，$STYLE"
gen "hero-review" "面试复盘模块头图：麦克风与上升的折线图表，$STYLE"
gen "hero-landing" "入职landing模块头图：清单与握手沟通元素，$STYLE"
gen "hero-experience" "经验帖模块头图：一叠卡片与书签收藏元素，$STYLE"

echo "done. outputs in $OUT"
