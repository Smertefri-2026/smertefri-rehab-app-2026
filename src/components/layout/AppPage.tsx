// src/components/layout/AppPage.tsx
import React from "react";

type AppPageProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Standard spacing mellom seksjoner */
  spacing?: "tight" | "normal" | "roomy";
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
}: AppPageProps) {
  return (
    <main className={`min-h-screen bg-[#F4FBFA] ${className}`}>
      <div
        className={`
          mx-auto max-w-7xl
          px-4 sm:px-6
          py-6 sm:py-10
          ${spacingMap[spacing]}
          ${containerClassName}
        `}
      >
        {children}
      </div>
    </main>
  );
}