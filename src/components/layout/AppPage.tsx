// src/components/layout/AppPage.tsx
import React from "react";

type AppPageProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Standard spacing mellom seksjoner */
  spacing?: "tight" | "normal" | "roomy";

  /**
   * Bruk når en side skal fylle forelderhøyden (typisk inne i (app)-layout),
   * og du vil unngå at AppPage tvinger min-h-screen (som ofte skaper page-scroll).
   */
  fullHeight?: boolean;

  /**
   * Default true (bakoverkompatibel): AppPage legger inn pb for TabBar.
   * Sett false på sider der (app)/layout allerede har TabBar-padding.
   */
  withTabBarPadding?: boolean;
};

const spacingMap = {
  tight: "space-y-6",
  normal: "space-y-8",
  roomy: "space-y-10",
};

export default function AppPage({
  children,
  className = "",
  containerClassName = "",
  spacing = "roomy",
  fullHeight = false,
  withTabBarPadding = true,
}: AppPageProps) {
  const mainBase = fullHeight ? "h-full min-h-0" : "min-h-screen";

  const bottomPad = withTabBarPadding
    ? "pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-10"
    : "pb-0 md:pb-0";

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
        {children}
      </div>
    </main>
  );
}