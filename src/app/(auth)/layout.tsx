import HeaderFrontpage from "@/app/(public)/frontpage/Seksjon/HeaderFrontpage";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header på TOPP */}
      <HeaderFrontpage variant="auth" />

      {/* Kun innhold sentrert */}
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-sf-soft to-white px-4">
        {children}
      </main>
    </>
  );
}