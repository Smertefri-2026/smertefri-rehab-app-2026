import { Wordmark } from "@/ui/brand/Wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6">
          <a href="https://smertefri.no/" aria-label="SmerteFri – forsiden">
            <Wordmark className="text-xl" />
          </a>
          <a
            href="https://smertefri.no/"
            className="text-[13.5px] font-medium text-ink-soft hover:text-ink"
          >
            Til smertefri.no
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
