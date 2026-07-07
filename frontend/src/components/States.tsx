import { Loader2 } from "lucide-react";
import * as React from "react";
import { assets } from "@/assets";

// 插画容器：亮/暗双主题下都保证插画与背景的柔和对比（纯白插画置于浅底卡片）。
function Illustration({ src, className = "" }: { src: string; className?: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-card bg-brand-50 p-2 shadow-card dark:bg-ink-800">
      <img src={src} alt="" aria-hidden className={`object-contain ${className}`} />
    </span>
  );
}

export function Spinner({ label = "加载中" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[var(--text-muted)]">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

// 带插画的加载态（用于首屏/大区块加载，比纯文字 Loading 更有陪伴感）。
export function LoadingState({ label = "正在加载" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Illustration src={assets.loading} className="h-24 w-24 animate-pulse" />
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{label}…</span>
      </div>
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
      <Illustration src={assets.empty} className="h-28 w-28" />
      <div>
        <p className="font-medium text-[var(--text)]">{title}</p>
        {desc && <p className="mt-1 text-sm text-[var(--text-muted)]">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

// 成功反馈态：用于提交成功 / 完成操作的正向反馈（吉祥物+成功插画）。
export function SuccessState({
  title = "操作成功",
  desc,
  action,
}: {
  title?: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Illustration src={assets.success} className="h-28 w-28" />
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
      <Illustration src={assets.error} className="h-28 w-28" />
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
