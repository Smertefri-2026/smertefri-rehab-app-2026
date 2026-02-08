// src/app/(public)/trenere/page.tsx
import SeksjonFooter from "@/app/(public)/frontpage/Seksjon/SeksjonFooter";

import HeaderTrenere from "@/app/(public)/trenere/Seksjon/HeaderTrenere";
import Seksjon1HeroTrenere from "@/app/(public)/trenere/Seksjon/Seksjon1HeroTrenere";
import Seksjon2HvaEr from "@/app/(public)/trenere/Seksjon/Seksjon2HvaEr";
import Seksjon3StatusV1 from "@/app/(public)/trenere/Seksjon/Seksjon3StatusV1";
import Seksjon4HvemKanBliMed from "@/app/(public)/trenere/Seksjon/Seksjon4HvemKanBliMed";
import Seksjon5Filmer from "@/app/(public)/trenere/Seksjon/Seksjon5Filmer";
import Seksjon6FAQ from "@/app/(public)/trenere/Seksjon/Seksjon6FAQ";
import Seksjon7CTA from "@/app/(public)/trenere/Seksjon/Seksjon7CTA";

export default function TrenerePage() {
  return (
    <>
      <main id="top" className="w-full">
        <Seksjon1HeroTrenere />
        <Seksjon2HvaEr />
        <Seksjon3StatusV1 />
        <Seksjon4HvemKanBliMed />
        <Seksjon5Filmer />
        <Seksjon6FAQ />
        <Seksjon7CTA />
      </main>
      <SeksjonFooter />
    </>
  );
}