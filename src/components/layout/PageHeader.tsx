type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && (
        <p className="text-sm text-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}