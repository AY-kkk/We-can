import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { Outlet } from "react-router-dom";
import { assets } from "@/assets";

export function AuthLayout() {
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
          <img
            src={assets.authHero}
            alt="We-can 吉祥物"
            className="w-72 rounded-card"
          />
          <h2 className="mt-8 max-w-sm text-center text-2xl font-semibold">
            从简历到 offer，一站式陪跑
          </h2>
          <p className="mt-3 max-w-sm text-center text-white/75">
            简历打磨 · 笔面准备 · 面试复盘 · 秋招 Landing · 经验汲取
          </p>
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
