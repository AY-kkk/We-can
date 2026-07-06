import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  persona,
  action,
}: {
  title: string;
  subtitle?: string;
  persona?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
        {persona && (
          <p className="mt-2 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-ink-800 dark:text-brand-200">
            智能体人格 · {persona}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
