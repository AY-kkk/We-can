import { Loader2 } from "lucide-react";
import * as React from "react";
import { assets } from "@/assets";

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
  action,
}: {
  title?: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <img src={assets.empty} alt="" className="h-28 w-28 rounded-card object-contain" />
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
      <img src={assets.error} alt="" className="h-28 w-28 rounded-card object-contain" />
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
