"use client";

import AppPage from "@/components/layout/AppPage";

import Section1PainSelector from "./sections/Section1PainSelector";
import Section2PainActive from "./sections/Section2PainActive";

export default function PainPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          {/* 🟢 Seksjon 1 – Hvor har du vondt? */}
          <Section1PainSelector />

          {/* 🔵 Seksjon 2 – Du jobber med nå */}
          <Section2PainActive />
        </div>
      </AppPage>
    </main>
  );
}