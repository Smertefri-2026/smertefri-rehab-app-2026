"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppPage from "@/components/layout/AppPage";

import Section1DailyStatus from "./sections/Section1DailyStatus";
import Section2MealsList from "./sections/Section2MealsList";
import Section3AddMealAction from "./sections/Section3AddMealAction";

import type { Meal, NutritionDay } from "@/modules/nutrition/types";
import { loadDay, saveDay, sumMeals, makeEmptyMeal, yyyyMmDd } from "@/modules/nutrition/storage";
import { useRole } from "@/providers/RoleProvider";

import { getNutritionDay, upsertNutritionDay } from "@/lib/nutritionLog.api";
import { listMealsByDay, upsertMeal, deleteMeal } from "@/lib/nutritionMeals.api";

export default function NutritionTodayPage() {
  const date = yyyyMmDd();
  const { userId, role } = useRole();

  const [day, setDay] = useState<NutritionDay | null>(null);
  const [loading, setLoading] = useState(true);

  const saveTimer = useRef<number | null>(null);
  const lastMealIdsRef = useRef<Set<string>>(new Set());

  // Hindrer overlappende sync (hvis React re-renderer / flere endringer kommer tett)
  const syncingRef = useRef(false);

  // ---------- LOAD: Supabase først, local fallback ----------
  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      try {
        // 1) prøv Supabase day (hvis finnes)
        const row = await getNutritionDay(userId, date);
        if (row?.id) {
          const meals = await listMealsByDay(row.id);

          // map meals -> app Meal
          const mappedMeals: Meal[] = (meals ?? []).map((m: any) => ({
            id: m.id, // uuid
            type: "Måltid",
            protein_g: Number(m.protein_g || 0),
            fat_g: Number(m.fat_g || 0),
            carbs_g: Number(m.carbs_g || 0),
            calories_kcal: Number(m.calories_kcal || 0),
            note: m.raw_text ?? "",
            title: m.assumption ?? "",
            source: m.source ?? "manual",
            confidence: m.confidence ?? null,
            meal_time: m.meal_time ?? null,
          })) as any;

          const local = loadDay(date) as any;

          const d: NutritionDay = {
            date,
            meals: mappedMeals,
            // targets ligger fortsatt lokalt/profil – behold som før:
            ...(local ?? {}),
          };

          setDay(d);
          lastMealIdsRef.current = new Set(mappedMeals.map((x) => x.id));
          return;
        }

        // 2) fallback local
        const local = loadDay(date);
        setDay(local);
        lastMealIdsRef.current = new Set((local.meals || []).map((x: any) => x.id));
      } catch (e) {
        console.error("Load nutrition day failed", e);

        // fallback local uansett
        const local = loadDay(date);
        setDay(local);
        lastMealIdsRef.current = new Set((local.meals || []).map((x: any) => x.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, date]);

  // ---------- LOCAL CACHE ----------
  useEffect(() => {
    if (day) saveDay(day);
  }, [day]);

  // ---------- SUPABASE SYNC (debounced) ----------
  useEffect(() => {
    // ⚠️ Viktig: Bare klient skal synce "I dag"
    // (Trener/Admin har egne views på /nutrition/[id])
    if (!day || !userId) return;
    if (role && role !== "client") return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;

      try {
        const totals = sumMeals(day.meals);

        const hasAnything =
          (day.meals?.length ?? 0) > 0 ||
          (totals.calories_kcal || 0) > 0 ||
          (totals.protein_g || 0) > 0 ||
          (totals.fat_g || 0) > 0 ||
          (totals.carbs_g || 0) > 0;

        // Hvis dagen er tom: ikke spam DB (men behold local cache)
        if (!hasAnything) return;

        // 1) Upsert DAY (aggregat)
        const savedDay = await upsertNutritionDay({
          user_id: userId,
          day_date: date,
          calories_kcal: Math.round(totals.calories_kcal || 0),
          protein_g: Math.round(totals.protein_g || 0),
          fat_g: Math.round(totals.fat_g || 0),
          carbs_g: Math.round(totals.carbs_g || 0),
        });

        const dayId = savedDay.id;
        if (!dayId) return;

        // 2) Slett måltider som er fjernet lokalt
        const prevIds = lastMealIdsRef.current;
        const nowIds = new Set((day.meals || []).map((m: any) => m.id));

        for (const oldId of prevIds) {
          if (!nowIds.has(oldId)) {
            await deleteMeal(oldId);
          }
        }

        // 3) Upsert meals (kun hvis vi har meals)
        for (const m of day.meals as any[]) {
          await upsertMeal({
            id: m.id,
            day_id: dayId,
            user_id: userId,
            meal_time: m.meal_time ?? new Date().toISOString(),
            source: m.source ?? "manual",
            raw_text: (m.note ?? "").trim() || null,
            calories_kcal: Number(m.calories_kcal || 0),
            protein_g: Number(m.protein_g || 0),
            fat_g: Number(m.fat_g || 0),
            carbs_g: Number(m.carbs_g || 0),
            confidence: m.confidence ?? null,
            assumption: (m.title ?? "").trim() || null,
          });
        }

        lastMealIdsRef.current = nowIds;
      } catch (e) {
        console.error("Supabase nutrition sync failed", e);
      } finally {
        syncingRef.current = false;
      }
    }, 900);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [day, userId, role, date]);

  const consumed = useMemo(() => (day ? sumMeals(day.meals) : sumMeals([])), [day]);

  const updateMeal = (id: string, patch: Partial<Meal>) => {
    setDay((prev) => {
      if (!prev) return prev;
      return { ...prev, meals: prev.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) };
    });
  };

  const deleteMealLocal = (id: string) => {
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

  if (loading || !day) {
    return (
      <div className="bg-[#F4FBFA]">
        <AppPage>
          <div className="text-sm text-sf-muted">Laster kosthold…</div>
        </AppPage>
      </div>
    );
  }

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
            onDeleteMeal={deleteMealLocal}
          />

          <Section3AddMealAction onAddMeal={addMeal} />
        </div>
      </AppPage>
    </div>
  );
}