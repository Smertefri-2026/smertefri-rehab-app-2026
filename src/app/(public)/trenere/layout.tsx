// src/app/(public)/trenere/layout.tsx
import HeaderTrenere from "./Seksjon/HeaderTrenere";

export default function TrenereLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderTrenere />
      {children}
    </>
  );
}