"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/ui/cn";

type DashboardVariant = "default" | "warning" | "danger" | "info" | "success";

type DashboardCardProps = {
  title?: string;
  icon?: ReactNode;
  status?: string;
  children?: ReactNode;
  variant?: DashboardVariant;
  mode?: "card" | "button";
  href?: string;
};

const variants: Record<DashboardVariant, string> = {
  default: "border-border bg-surface",
  warning: "border-transparent bg-warning-subtle",
  danger: "border-transparent bg-danger-subtle",
  info: "border-transparent bg-primary-subtle",
  success: "border-transparent bg-success-subtle",
};

export default function DashboardCard({
  title,
  icon,
  status,
  children,
  variant = "default",
  mode = "card",
  href,
}: DashboardCardProps) {
  const isButton = mode === "button";
  const variantClass = variants[variant] ?? variants.default;

  const cardClassName = cn(
    "rounded-lg border shadow-card transition",
    variantClass,
    isButton ? "flex min-h-[110px] flex-col items-center justify-center gap-3 p-5" : "p-5",
    href &&
      "cursor-pointer hover:shadow-pop hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-page"
  );

  const content = (
    <div className={cardClassName}>
      {(title || icon) && (
        <div
          className={cn(
            "flex",
            isButton
              ? "flex-col items-center gap-2 text-center"
              : "mb-3 items-start justify-between gap-4"
          )}
        >
          <div className={cn("flex", isButton ? "flex-col items-center gap-2" : "items-center gap-2")}>
            {icon && <span className={isButton ? "text-primary" : "text-ink-faint"}>{icon}</span>}
            {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          </div>

          {!isButton && status && <span className="text-xs text-ink-soft">{status}</span>}
        </div>
      )}

      {!isButton && children && <div className="space-y-2 text-sm text-ink-soft">{children}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
