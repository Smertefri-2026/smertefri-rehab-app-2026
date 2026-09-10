import React from "react";
import { cn } from "@/ui/cn";

type AppPageProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;

  /** Valgfri tittel øverst på siden */
  title?: string;

  /** Valgfri undertittel under tittelen */
  subtitle?: string;

  /** Valgfrie actions (knapper/links) */
  actions?: React.ReactNode;

  /** Hvor actions skal ligge i header */
  actionsAlign?: "right" | "left";

  /** Standard spacing mellom seksjoner */
  spacing?: "tight" | "normal" | "roomy";

  fullHeight?: boolean;
  withTabBarPadding?: boolean;
};

const spacingMap = {
  tight: "space-y-5",
  normal: "space-y-7",
  roomy: "space-y-9",
} as const;

export default function AppPage({
  children,
  className = "",
  containerClassName = "",
  title,
  subtitle,
  actions,
  actionsAlign = "right",
  spacing = "roomy",
  fullHeight = false,
  withTabBarPadding = true,
}: AppPageProps) {
  const mainBase = fullHeight ? "h-full min-h-0" : "min-h-screen";

  const bottomPad = withTabBarPadding
    ? "pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-12"
    : "pb-0 md:pb-0";

  const hasHeader = !!title || !!subtitle || !!actions;

  const headerClass =
    actionsAlign === "right"
      ? "flex items-start justify-between gap-3"
      : "flex items-start justify-start gap-3";

  return (
    <main className={cn(mainBase, "bg-page text-ink overflow-x-clip", className)}>
      <div
        className={cn(
          "mx-auto max-w-content px-4 sm:px-6 py-6 sm:py-10",
          bottomPad,
          spacingMap[spacing],
          containerClassName
        )}
      >
        {hasHeader && (
          <div className={headerClass}>
            {actionsAlign === "left" && actions ? <div className="shrink-0">{actions}</div> : null}

            <div className="min-w-0">
              {title ? (
                <h1 className="text-lg font-semibold text-ink sm:text-xl">{title}</h1>
              ) : null}
              {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
            </div>

            {actionsAlign === "right" && actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        )}

        {children}
      </div>
    </main>
  );
}
