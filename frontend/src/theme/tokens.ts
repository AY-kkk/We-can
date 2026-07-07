// Design tokens single source of truth (mirrors tailwind.config.ts).
// 60-30-10: 中性背景 60% / 品牌辅助 30% / 珊瑚橙 CTA 10%。
export const tokens = {
  color: {
    brand: "#1f8f74",
    brandSoft: "#eef7f4",
    accent: "#ff7a45",
  },
  radius: { card: 16, btn: 8, pill: 9999 },
  space: [4, 8, 12, 16, 24, 32, 48, 64],
  motion: { enter: "ease-out", leave: "ease-in", duration: 220 },
} as const;

// 五方向与栏目2/栏目5保持一致
export type Track =
  | "product"
  | "operation"
  | "algorithm"
  | "market"
  | "frontend"
  | "backend"
  | "sales";

export const TRACKS: { key: Track; label: string; persona: string }[] = [
  { key: "product", label: "产品", persona: "AI 产品导师 Echo" },
  { key: "operation", label: "运营", persona: "产运导师 Nova" },
  { key: "algorithm", label: "算法", persona: "全栈大师" },
  { key: "market", label: "市场", persona: "产运导师 Nova" },
  { key: "frontend", label: "前端", persona: "前端设计师 + 全栈大师" },
  { key: "backend", label: "后端", persona: "后端架构师 Atlas" },
  { key: "sales", label: "销售", persona: "销售增长教练 Vega" },
];
