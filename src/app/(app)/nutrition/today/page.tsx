"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";

import Section1DailyStatus from "./sections/Section1DailyStatus";
import Section2MealsList from "./sections/Section2MealsList";
import Section3AddMealAction from "./sections/Section3AddMealAction";

import type { Meal, NutritionDay } from "@/modules/nutrition/types";
import { loadDay, saveDay, sumMeals, makeEmptyMeal, yyyyMmDd } from "@/modules/nutrition/storage";
import { useEffect, useState } from "react";

export default function NutritionTodayPage() {
  const date = yyyyMmDd();

  const [day, setDay] = useState<NutritionDay | null>(null);

  useEffect(() => {
    const d = loadDay(date);
    setDay(d);
  }, [date]);

  useEffect(() => {
    if (day) saveDay(day);
  }, [day]);

  if (!day) return null;

  const consumed = sumMeals(day.meals);

  const updateMeal = (id: string, patch: Partial<Meal>) => {
    setDay((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meals: prev.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
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

          <Section2MealsList
            meals={day.meals}
            onUpdateMeal={updateMeal}
            onDeleteMeal={deleteMeal}
          />

          <Section3AddMealAction onAddMeal={addMeal} />
        </div>
      </AppPage>
    </div>
  );
}