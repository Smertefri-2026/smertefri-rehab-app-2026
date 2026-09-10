// src/app/(app)/nutrition/page.tsx
"use client";

import AppPage from "@/components/layout/AppPage";

import Section1NutritionToday from "./sections/Section1NutritionToday";
import Section2NutritionGraph from "./sections/Section2NutritionGraph";
import Section3NutritionActions from "./sections/Section3NutritionActions";

export default function NutritionPage() {
  return (
    <div className="bg-page">
      <AppPage>
        <div className="space-y-6">
          {/* 🍽 Seksjon 1 – Intro / forklaring */}
          <Section1NutritionToday />

          {/* 📊 Seksjon 2 – Oversikt */}
          <Section2NutritionGraph />

{/* ⚙️ Seksjon 3 – Handlinger */}
<Section3NutritionActions />
        </div>
      </AppPage>
    </div>
  );
}