// src/app/(app)/nutrition/profile/page.tsx
"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";

import Section1NutritionBasicProfile from "./sections/Section1NutritionBasicProfile";
import Section2ActivityLevel from "./sections/Section2ActivityLevel";
import Section3NutritionGoal from "./sections/Section3NutritionGoal";
import Section4DailyNeedsSummary from "./sections/Section4DailyNeedsSummary";

export default function NutritionProfilePage() {
  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          {/* 🔙 Tilbake til kosthold */}
          <div>
            <Link
              href="/nutrition"
              className="
                inline-flex items-center justify-center gap-2
                rounded-full border border-sf-border
                px-6 py-3
                text-sm font-medium text-sf-text
                hover:bg-sf-soft
              "
            >
              ← Tilbake til kosthold
            </Link>
          </div>

          <Section1NutritionBasicProfile />
          <Section2ActivityLevel />
          <Section3NutritionGoal />
          <Section4DailyNeedsSummary />
        </div>
      </AppPage>
    </div>
  );
}