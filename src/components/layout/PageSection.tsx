type PageSectionProps = {
  children: React.ReactNode;
};

export function PageSection({ children }: PageSectionProps) {
  return (
    <section className="rounded-lg border bg-card p-4">
      {children}
    </section>
  );
}