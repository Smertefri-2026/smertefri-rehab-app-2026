// /Users/oystein/smertefri-rehab-app-2026/src/components/layout/PublicLayout.tsx
import React from "react";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-lg font-semibold">SmerteFri</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-10 min-w-0">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6 sm:py-4 text-sm text-text-muted">
          © {new Date().getFullYear()} SmerteFri
        </div>
      </footer>
    </div>
  );
}