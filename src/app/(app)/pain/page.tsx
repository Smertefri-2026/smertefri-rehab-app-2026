"use client";

import Section1PainSelector from "./sections/Section1PainSelector";
import Section2PainActive from "./sections/Section2PainActive";

export default function PainPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* 🟢 Seksjon 1 – Hvor har du vondt? */}
        <Section1PainSelector />

        {/* 🔵 Seksjon 2 – Du jobber med nå */}
        <Section2PainActive />
      </div>
    </main>
  );
}