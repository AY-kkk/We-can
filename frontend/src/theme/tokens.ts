// Design tokens single source of truth (mirrors tailwind.config.ts).
// 60-30-10: 中性背景 60% / 品牌辅助 30% / 珊瑚橙 CTA 10%。
export const tokens = {
  color: {
    brand: "#1f8f74",
    brandSoft: "#eef7f4",
    accent: "#ff7a45",
  },
  radius: { card: 12, btn: 8, pill: 9999 },
  space: [4, 8, 12, 16, 24, 32, 48, 64],
  motion: { enter: "ease-out", leave: "ease-in", duration: 220 },
} as const;

export type Track = "product" | "sales" | "operation" | "algorithm" | "frontend" | "other";

export const TRACKS: { key: Track; label: string }[] = [
  { key: "product", label: "产品" },
  { key: "operation", label: "运营" },
  { key: "algorithm", label: "算法" },
  { key: "frontend", label: "前端" },
  { key: "sales", label: "销售" },
  { key: "other", label: "其他" },
];
