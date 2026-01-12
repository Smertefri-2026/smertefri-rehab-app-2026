"use client";

import Section1NutritionToday from "./sections/Section1NutritionToday";
import Section2NutritionGraph from "./sections/Section2NutritionGraph";
import Section3NutritionActions from "./sections/Section3NutritionActions";

export default function NutritionPage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 🍽 Seksjon 1 – I dag */}
        <Section1NutritionToday />

        {/* 📊 Seksjon 2 – Historikk (uke / måned / år) */}
        <Section2NutritionGraph />

        {/* ⚙️ Seksjon 3 – Handlinger */}
        <Section3NutritionActions />

      </div>
    </main>
  );
}