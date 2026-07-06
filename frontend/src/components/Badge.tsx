import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "brand" | "accent" | "muted";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
    accent: "bg-accent-500/10 text-accent-600",
    muted: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
