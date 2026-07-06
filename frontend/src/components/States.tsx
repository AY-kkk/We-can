import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import * as React from "react";

export function Spinner({ label = "加载中" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[var(--text-muted)]">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-ink-100 dark:bg-ink-800 ${className}`}
    />
  );
}

export function EmptyState({
  title = "暂无内容",
  desc,
  icon,
  action,
}: {
  title?: string;
  desc?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-500 dark:bg-ink-800">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <div>
        <p className="font-medium text-[var(--text)]">{title}</p>
        {desc && <p className="mt-1 text-sm text-[var(--text-muted)]">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-btn border border-[var(--border)] px-4 py-1.5 text-sm hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          重试
        </button>
      )}
    </div>
  );
}
