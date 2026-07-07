import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastKind } from "@/store/toast";

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE: Record<ToastKind, string> = {
  success:
    "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-600/40 dark:bg-brand-900/30 dark:text-brand-100",
  error:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200",
  info: "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-card border px-4 py-3 shadow-float animate-fade-in ${TONE[t.kind]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="关闭"
              className="shrink-0 opacity-60 transition hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
