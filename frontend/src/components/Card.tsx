import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  desc,
  action,
}: {
  title: React.ReactNode;
  desc?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
        {desc && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
