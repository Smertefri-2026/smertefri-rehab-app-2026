type PageLayoutProps = {
  children: React.ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 space-y-8">
      {children}
    </main>
  );
}