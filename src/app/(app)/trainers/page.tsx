"use client";

import Section1TrainerSearch from "./sections/Section1TrainerSearch";
import Section2TrainerCard from "./sections/Section2TrainerCard";
import Section3TrainerActions from "./sections/Section3TrainerActions";

export default function TrainersPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 🔍 Seksjon 1 – Søk / filter trenere */}
        <Section1TrainerSearch />

        {/* 👤 Seksjon 2 – Trenerkort (preview / valgt trener) */}
        <Section2TrainerCard />

        {/* ⚡ Seksjon 3 – Handlinger */}
        <Section3TrainerActions />

      </div>
    </main>
  );
}