"use client";

/**
 * TESTER – OVERSIKT (KUN VISNING)
 * --------------------------------
 * • Ingen backend
 * • Ingen state
 * • Ingen logikk
 * • Kun layout / struktur
 */

import Section1TestsTabs from "./sections/Section1TestsTabs";
import Section2BodyweightSummary from "./sections/Section2BodyweightSummary";
import Section3StrengthSummary from "./sections/Section3StrengthSummary";
import Section4CardioSummary from "./sections/Section4CardioSummary";

export default function TestsPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 📌 SECTION 1 – Tabs (Egenvekt / Styrke / Kondis) */}
        <Section1TestsTabs />

        {/* 🏋️ SECTION 2 – Egenvekt */}
        <Section2BodyweightSummary />

        {/* 💪 SECTION 3 – Styrke */}
        <Section3StrengthSummary />

        {/* ❤️ SECTION 4 – Kondis */}
        <Section4CardioSummary />

      </div>
    </main>
  );
}