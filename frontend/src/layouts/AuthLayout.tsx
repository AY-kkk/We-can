import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { authIllustration } from "@/assets";

// 依据当前鉴权路由选择对应品牌插画（登录/注册/忘记密码各一张）。
function pickIllustration(pathname: string): { src: string; title: string; desc: string } {
  if (pathname.includes("/register")) {
    return {
      src: authIllustration.register,
      title: "开启你的秋招之旅",
      desc: "注册 We-can，和吉祥物一起从简历到 offer 稳步成长",
    };
  }
  if (pathname.includes("/forgot")) {
    return {
      src: authIllustration.forgot,
      title: "别担心，帮你找回",
      desc: "输入邮箱即可重置密码，安心继续你的求职计划",
    };
  }
  return {
    src: authIllustration.login,
    title: "从简历到 offer，一站式陪跑",
    desc: "简历打磨 · 笔面准备 · 面试复盘 · 秋招 Landing · 经验汲取",
  };
}

export function AuthLayout() {
  const { pathname } = useLocation();
  const art = pickIllustration(pathname);

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden flex-col justify-between bg-brand-600 p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-btn bg-white/15">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">We-can</p>
            <p className="text-sm text-white/70">秋招小助手</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <motion.img
            key={art.src}
            src={art.src}
            alt="We-can 品牌插画"
            className="w-72 rounded-card bg-white/95 shadow-float"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          />
          <h2 className="mt-8 max-w-sm text-center text-2xl font-semibold">
            {art.title}
          </h2>
          <p className="mt-3 max-w-sm text-center text-white/75">{art.desc}</p>
        </div>

        <p className="text-sm text-white/60">© 2026 We-can · MIT License</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
