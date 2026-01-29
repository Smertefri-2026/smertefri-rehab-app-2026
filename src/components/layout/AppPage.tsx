// src/components/layout/AppPage.tsx
import React from "react";

type AppPageProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;

  /** Valgfri tittel øverst på siden */
  title?: string;

  /** Valgfri undertittel under tittelen */
  subtitle?: string;

  /** Valgfrie actions til høyre for tittelen (knapper/links) */
  actions?: React.ReactNode;

  /** Standard spacing mellom seksjoner */
  spacing?: "tight" | "normal" | "roomy";

  fullHeight?: boolean;
  withTabBarPadding?: boolean;
};

const spacingMap = {
  tight: "space-y-6",
  normal: "space-y-8",
  roomy: "space-y-10",
} as const;

export default function AppPage({
  children,
  className = "",
  containerClassName = "",
  title,
  subtitle,
  actions,
  spacing = "roomy",
  fullHeight = false,
  withTabBarPadding = true,
}: AppPageProps) {
  const mainBase = fullHeight ? "h-full min-h-0" : "min-h-screen";

  const bottomPad = withTabBarPadding
    ? "pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-10"
    : "pb-0 md:pb-0";

  const hasHeader = !!title || !!subtitle || !!actions;

  return (
    <main className={`${mainBase} bg-[#F4FBFA] ${className}`}>
      <div
        className={`
          mx-auto max-w-7xl
          px-4 sm:px-6
          py-6 sm:py-10
          ${bottomPad}
          ${spacingMap[spacing]}
          ${containerClassName}
        `}
      >
        {hasHeader && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? (
                <h1 className="text-base sm:text-lg font-semibold text-sf-text">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-sf-muted">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        )}

        {children}
      </div>
    </main>
  );
}