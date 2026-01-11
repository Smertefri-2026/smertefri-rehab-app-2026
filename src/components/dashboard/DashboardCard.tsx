"use client";

import { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  icon?: ReactNode;
  status?: string;
  children?: ReactNode;
  variant?: "default" | "warning" | "danger" | "info";
  mode?: "card" | "button";
};

const variants = {
  default: "border-sf-border bg-white",
  warning: "border-yellow-300 bg-yellow-50",
  danger: "border-red-300 bg-red-50",
  info: "border-[#BEE6F0] bg-[#E6F3F6]",
};

export default function DashboardCard({
  title,
  icon,
  status,
  children,
  variant = "default",
  mode = "card",
}: DashboardCardProps) {
  const isButton = mode === "button";

  return (
    <div
      className={`
        rounded-2xl border shadow-sm transition
        ${variants[variant]}
        ${
          isButton
            ? "p-6 flex flex-col items-center justify-center gap-3 min-h-[110px] hover:bg-[#DFF0F6] cursor-pointer"
            : "p-5"
        }
      `}
    >
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
              isButton
                ? "flex-col items-center gap-2"
                : "items-center gap-2"
            }`}
          >
            {icon && (
              <span
                className={`${
                  isButton
                    ? "text-[#007C80]"
                    : "text-sf-muted"
                }`}
              >
                {icon}
              </span>
            )}

            {title && (
              <h3
                className={`text-sm font-semibold ${
                  isButton
                    ? "text-sf-text"
                    : "text-sf-text"
                }`}
              >
                {title}
              </h3>
            )}
          </div>

          {!isButton && status && (
            <span className="text-xs text-sf-muted">
              {status}
            </span>
          )}
        </div>
      )}

      {!isButton && children && (
        <div className="text-sm text-sf-muted space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}