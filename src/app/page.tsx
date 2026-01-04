// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sf-bg flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-sf-surface rounded-sf border border-sf-border shadow-sm space-y-4">
        <h1 className="text-xl font-semibold text-sf-text">
          SmerteFri 2026
        </h1>

        <p className="text-sf-muted">
          Design tokens er aktivert og fungerer korrekt.
        </p>

        <div className="p-4 bg-sf-soft rounded-sf text-sf-ink">
          🎨 Tailwind + CSS-variabler OK
        </div>
      </div>
    </main>
  );
}