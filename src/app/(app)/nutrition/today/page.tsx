"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AppPage from "@/components/layout/AppPage";

import Section1DailyStatus from "./sections/Section1DailyStatus";
import Section2MealsList from "./sections/Section2MealsList";
import Section3AddMealAction from "./sections/Section3AddMealAction";

import type { Meal, NutritionDay } from "@/modules/nutrition/types";
import { loadDay, saveDay, sumMeals, makeEmptyMeal, yyyyMmDd } from "@/modules/nutrition/storage";
import { useRole } from "@/providers/RoleProvider";
import { upsertNutritionDay } from "@/lib/nutritionLog.api";

export default function NutritionTodayPage() {
  const date = yyyyMmDd();
  const { userId } = useRole();

  const [day, setDay] = useState<NutritionDay | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const d = loadDay(date);
    setDay(d);
  }, [date]);

  // ✅ Lokal cache (beholdes)
  useEffect(() => {
    if (day) saveDay(day);
  }, [day]);

  // ✅ Supabase sync (debounced) – MATCHER TABELLEN (day_date + macro-kolonner)
  useEffect(() => {
    if (!day || !userId) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      try {
        const totals = sumMeals(day.meals);

        // Valgfritt: dropp DB-write hvis absolutt alt er 0 og ingen måltider
        const hasAnything =
          (day.meals?.length ?? 0) > 0 ||
          (totals.calories_kcal || 0) > 0 ||
          (totals.protein_g || 0) > 0 ||
          (totals.fat_g || 0) > 0 ||
          (totals.carbs_g || 0) > 0;

        if (!hasAnything) return;

  // inne i setTimeout i today/page.tsx

await upsertNutritionDay({
  user_id: userId,
  day_date: date,
  calories_kcal: Math.round(totals.calories_kcal || 0),
  protein_g: Math.round(totals.protein_g || 0),
  fat_g: Math.round(totals.fat_g || 0),
  carbs_g: Math.round(totals.carbs_g || 0),
});

      } catch (e) {
        console.error("upsertNutritionDay failed", e);
      }
    }, 600);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [day, userId, date]);

  if (!day) return null;

  const consumed = sumMeals(day.meals);

  const updateMeal = (id: string, patch: Partial<Meal>) => {
    setDay((prev) => {
      if (!prev) return prev;
      return { ...prev, meals: prev.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) };
    });
  };

  const deleteMeal = (id: string) => {
    setDay((prev) => {
      if (!prev) return prev;
      return { ...prev, meals: prev.meals.filter((m) => m.id !== id) };
    });
  };

  const addMeal = () => {
    setDay((prev) => {
      if (!prev) return prev;
      return { ...prev, meals: [...prev.meals, makeEmptyMeal("Mellommåltid")] };
    });
  };

  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <div>
            <Link
              href="/nutrition"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
            >
              ← Tilbake til kosthold
            </Link>
          </div>

          <Section1DailyStatus date={date} targets={day.targets} consumed={consumed} />

          <Section2MealsList meals={day.meals} onUpdateMeal={updateMeal} onDeleteMeal={deleteMeal} />

          <Section3AddMealAction onAddMeal={addMeal} />
        </div>
      </AppPage>
    </div>
  );
}