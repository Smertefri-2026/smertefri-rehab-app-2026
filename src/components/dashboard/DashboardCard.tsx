"use client";

import Link from "next/link";
import { ReactNode } from "react";

type DashboardVariant = "default" | "warning" | "danger" | "info" | "success";

type DashboardCardProps = {
  title?: string;
  icon?: ReactNode;
  status?: string;
  children?: ReactNode;
  variant?: DashboardVariant;
  mode?: "card" | "button";

  // ✅ gjør hele kortet klikkbart
  href?: string;
};

const variants: Record<DashboardVariant, string> = {
  default: "border-sf-border bg-white",
  warning: "border-yellow-300 bg-yellow-50",
  danger: "border-red-300 bg-red-50",
  info: "border-[#BEE6F0] bg-[#E6F3F6]",
  success: "border-emerald-300 bg-emerald-50", // ✅ NY
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

  // ✅ ekstra safe: om noe rart kommer inn, fall tilbake til default
  const variantClass = variants[variant] ?? variants.default;

  const cardClassName = `
    rounded-2xl border shadow-sm transition
    ${variantClass}
    ${
      isButton
        ? "p-6 flex flex-col items-center justify-center gap-3 min-h-[110px]"
        : "p-5"
    }
    ${
      href
        ? "cursor-pointer hover:shadow-md hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#007C80]/20"
        : ""
    }
    ${
      isButton && href
        ? "hover:bg-[#DFF0F6]"
        : isButton
        ? "hover:bg-[#DFF0F6] cursor-pointer"
        : ""
    }
  `;

  const content = (
    <div className={cardClassName}>
      {(title || icon) && (
        <div
          className={`flex ${
            isButton
              ? "flex-col items-center text-center gap-2"
              : "items-start justify-between gap-4 mb-3"
          }`}
        >
          <div
            className={`flex ${
              isButton ? "flex-col items-center gap-2" : "items-center gap-2"
            }`}
          >
            {icon && (
              <span className={`${isButton ? "text-[#007C80]" : "text-sf-muted"}`}>
                {icon}
              </span>
            )}

            {title && <h3 className="text-sm font-semibold text-sf-text">{title}</h3>}
          </div>

          {!isButton && status && <span className="text-xs text-sf-muted">{status}</span>}
        </div>
      )}

      {!isButton && children && <div className="text-sm text-sf-muted space-y-2">{children}</div>}
    </div>
  );

  // ✅ Hvis href finnes: gjør kortet til en link
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}