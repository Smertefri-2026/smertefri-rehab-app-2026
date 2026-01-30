// /src/modules/nutrition/calc.ts
import type { NutritionProfile } from "@/lib/nutritionProfile.api";

export type GoalKey = NutritionProfile["goal"];

export function calcBmr(profile: NutritionProfile): number | null {
  const w = profile.weight_kg ?? 0;
  const h = profile.height_cm ?? 0;
  const a = profile.age_years ?? 0;
  const sex = profile.sex;

  if (!w || !h || !a || !sex) return null;

  // Mifflin–St Jeor (BMR)
  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/**
 * PAL (Physical Activity Level)
 * Stabil mapping inspirert av typiske PAL-intervaller:
 * - low: 1.35
 * - medium: 1.55
 * - high: 1.75
 * + trening: +0.10 / +0.20 / +0.30
 */
export function calcPal(profile: NutritionProfile): number {
  const job = profile.job_activity ?? "low";
  const tr = profile.training_activity ?? "none";

  let pal = job === "low" ? 1.35 : job === "medium" ? 1.55 : 1.75;

  if (tr === "light") pal += 0.10;
  if (tr === "moderate") pal += 0.20;
  if (tr === "high") pal += 0.30;

  pal = Math.min(2.05, Math.max(1.20, pal));
  return Math.round(pal * 100) / 100;
}

export function calcTdee(profile: NutritionProfile): {
  bmr: number | null;
  pal: number | null;
  tdee: number | null;
} {
  const bmr = calcBmr(profile);
  if (!bmr) return { bmr: null, pal: null, tdee: null };

  const pal = calcPal(profile);
  const tdee = Math.round(bmr * pal);

  return { bmr, pal, tdee };
}

export function goalMeta(goal: GoalKey) {
  if (goal === "lose_fat") {
    return { label: "Redusere fett", tweakLabel: "−15%", factor: 0.85 };
  }
  if (goal === "gain_muscle") {
    return { label: "Øke muskelmasse", tweakLabel: "+10%", factor: 1.1 };
  }
  if (goal === "maintain") {
    return { label: "Vedlikeholde", tweakLabel: "0%", factor: 1.0 };
  }
  return { label: "Ikke valgt", tweakLabel: "—", factor: 1.0 };
}

export function applyGoalToCalories(tdee: number | null, goal: GoalKey): number | null {
  if (tdee == null) return null;
  const meta = goalMeta(goal);
  return Math.round(tdee * meta.factor);
}

export function calcMacrosFromCalories(profile: NutritionProfile, calories: number | null) {
  const w = profile.weight_kg ?? 0;

  const protein = w ? Math.round(w * (profile.goal === "gain_muscle" ? 2.0 : 1.8)) : null;
  const fat = w ? Math.round(w * 0.9) : null;

  const carbs =
    calories != null && protein != null && fat != null
      ? Math.max(0, Math.round((calories - (protein * 4 + fat * 9)) / 4))
      : null;

  return { protein, fat, carbs };
}