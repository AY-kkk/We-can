import { LogOut, Menu, Moon, Settings, Shield, Sun } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { AccountSettings } from "@/components/AccountSettings";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { mode, toggle } = useThemeStore();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const doLogout = async () => {
    await logout();
    nav("/auth/login", { replace: true });
  };

  const initial = user?.username?.[0]?.toUpperCase() || "我";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-btn p-2 text-[var(--text-muted)] hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-[var(--text-muted)] sm:block">
          从简历到 offer，一站式陪跑
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-btn p-2 text-[var(--text-muted)] hover:bg-ink-100 dark:hover:bg-ink-800"
          aria-label="切换主题"
        >
          {mode === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initial}
            </span>
            <span className="hidden text-sm text-[var(--text)] sm:block">
              {user?.username}
            </span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-float">
              <div className="border-b border-[var(--border)] px-4 py-3">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {user?.username}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {user?.email}
                </p>
              </div>
              <button
                onMouseDown={() => setSettingsOpen(true)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <Settings className="h-4 w-4" /> 账号设置
              </button>
              {user?.role === "admin" && (
                <button
                  onMouseDown={() => nav("/admin")}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-ink-50 dark:hover:bg-ink-800"
                >
                  <Shield className="h-4 w-4" /> 管理员后台
                </button>
              )}
              <button
                onMouseDown={doLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
      {settingsOpen && <AccountSettings onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
