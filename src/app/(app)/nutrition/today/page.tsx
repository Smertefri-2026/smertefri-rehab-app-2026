// src/app/(app)/nutrition/today/page.tsx
"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";

import Section1DailyStatus from "./sections/Section1DailyStatus";
import Section2MealsList from "./sections/Section2MealsList";
import Section3AddMealAction from "./sections/Section3AddMealAction";

export default function NutritionTodayPage() {
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

          <Section1DailyStatus />
          <Section2MealsList />
          <Section3AddMealAction />
        </div>
      </AppPage>
    </div>
  );
}