// src/app/(public)/layout.tsx

import HeaderFrontpage from "./frontpage/Seksjon/HeaderFrontpage";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Toppmeny / logo / CTA */}
      <HeaderFrontpage />

      {/* Innhold */}
      <main>{children}</main>
    </>
  );
}