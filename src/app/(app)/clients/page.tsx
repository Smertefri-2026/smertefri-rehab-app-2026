"use client";

import Section1ClientSearch from "./sections/Section1ClientSearch";
import Section2ClientCard from "./sections/Section2ClientCard";
import Section3ClientActions from "./sections/Section3ClientActions";
import Section4ClientOverview from "./sections/Section4ClientOverview";

export default function ClientsPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 🔍 Seksjon 1 – Søk */}
        <Section1ClientSearch />

        {/* 👤 Seksjon 2 – Klientkort */}
        <Section2ClientCard />

        {/* ⚡ Seksjon 3 – Handlinger */}
        <Section3ClientActions />

        {/* 📊 Seksjon 4 – Oversikt */}
        <Section4ClientOverview />

      </div>
    </main>
  );
}