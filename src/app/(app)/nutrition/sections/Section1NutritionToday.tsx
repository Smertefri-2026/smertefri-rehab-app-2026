"use client";

import Link from "next/link";
import { loadDay, yyyyMmDd, sumMeals } from "@/modules/nutrition/storage";

export default function Section1NutritionToday() {
  const date = yyyyMmDd();
  let hasData = false;
  let calories = 0;

  if (typeof window !== "undefined") {
    const day = loadDay(date);
    const consumed = sumMeals(day.meals);
    calories = consumed.calories_kcal;
    hasData = calories > 0;
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-sf-text">I dag</h2>

      <div className="text-sm text-sf-muted">
        {hasData ? (
          <>Registrert i dag: <span className="font-semibold text-sf-text">{calories} kcal</span></>
        ) : (
          <>Ingen registrering for i dag.</>
        )}
      </div>

      <Link
        href="/nutrition/today"
        className="flex items-center justify-center gap-2 rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        🍽 Logg dagens matinntak
      </Link>
    </section>
  );
}