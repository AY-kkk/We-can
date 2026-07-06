import { Menu, Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { mode, toggle } = useThemeStore();
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
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          我
        </div>
      </div>
    </header>
  );
}
