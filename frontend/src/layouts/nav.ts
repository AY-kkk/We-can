import {
  Briefcase,
  ClipboardCheck,
  FileText,
  MessagesSquare,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { to: "/resume", label: "简历打磨", desc: "STAR 润色 · 自我介绍", icon: FileText },
  { to: "/prep", label: "笔面准备", desc: "题库 · 模拟面试", icon: MessagesSquare },
  { to: "/review", label: "面试复盘", desc: "转写 · 复盘报告", icon: ClipboardCheck },
  { to: "/landing", label: "秋招 Landing", desc: "清单 · 话术润色", icon: Briefcase },
  { to: "/experience", label: "经验帖集合", desc: "聚合 · 收藏", icon: Newspaper },
];
