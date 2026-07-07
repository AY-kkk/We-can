import { GraduationCap, Shield, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { mascotPose } from "@/assets";
import { useAuthStore } from "@/store/auth";
import { NAV } from "./nav";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-btn bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-[var(--text)]">
                We-can
              </p>
              <p className="text-xs text-[var(--text-muted)]">秋招小助手</p>
            </div>
          </div>
          <button
            className="text-[var(--text-muted)] lg:hidden"
            onClick={onClose}
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-ink-800 dark:text-brand-200"
                    : "text-[var(--text-muted)] hover:bg-ink-50 hover:text-[var(--text)] dark:hover:bg-ink-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-brand-600" : ""}`}
                  />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <AdminEntry />

        <div className="mx-3 mb-4 flex items-center gap-3 rounded-card bg-brand-50 p-3 dark:bg-ink-800">
          <img src={mascotPose.cheer} alt="加油吉祥物" className="h-12 w-12 rounded-btn bg-white object-contain shadow-card" />
          <p className="text-xs text-[var(--text-muted)]">
            求职全链路陪跑，加油上岸！
          </p>
        </div>
      </aside>
    </>
  );
}

function AdminEntry() {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  if (!isAdmin) return null;
  return (
    <div className="px-3 pb-2">
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition ${
            isActive
              ? "bg-accent-500/10 text-accent-600"
              : "text-[var(--text-muted)] hover:bg-ink-50 dark:hover:bg-ink-800"
          }`
        }
      >
        <Shield className="h-5 w-5" />
        <div>
          <p className="font-medium">管理员后台</p>
          <p className="text-xs text-[var(--text-muted)]">用户 · 权限 · 看板</p>
        </div>
      </NavLink>
    </div>
  );
}
