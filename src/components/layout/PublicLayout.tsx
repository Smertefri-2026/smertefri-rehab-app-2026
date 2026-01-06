type PublicLayoutProps = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">SmerteFri</h1>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-xl px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-sm text-text-muted">
        © {new Date().getFullYear()} SmerteFri
      </footer>
    </div>
  );
}