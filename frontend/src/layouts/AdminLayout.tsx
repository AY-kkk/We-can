import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LayoutDashboard, Shield, Users } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const ADMIN_NAV = [
  { to: "/admin", label: "数据看板", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "用户管理", icon: Users, end: false },
];

export function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <div className="flex h-full">
      <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-btn bg-accent-500 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--text)]">管理员后台</p>
            <p className="text-xs text-[var(--text-muted)]">We-can Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {ADMIN_NAV.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-accent-500/10 text-accent-600"
                    : "text-[var(--text-muted)] hover:bg-ink-50 dark:hover:bg-ink-800"
                }`
              }
            >
              <i.icon className="h-5 w-5" />
              {i.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => nav("/resume")}
          className="m-3 flex items-center gap-2 rounded-btn px-3 py-2.5 text-sm text-[var(--text-muted)] hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          <ArrowLeft className="h-4 w-4" /> 返回应用
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur lg:px-8">
          <button
            onClick={() => nav("/resume")}
            className="flex items-center gap-1.5 rounded-btn px-2 py-1.5 text-sm text-[var(--text-muted)] hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> 应用
          </button>
          <p className="text-sm font-medium text-[var(--text)]">管理员控制台</p>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
