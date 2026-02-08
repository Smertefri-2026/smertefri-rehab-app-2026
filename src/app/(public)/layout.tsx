// src/app/(public)/layout.tsx
import HeaderFrontpage from "./frontpage/Seksjon/HeaderFrontpage";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderFrontpage />
      {children}
    </>
  );
}