import type { NutritionDay, NutritionTargets, Meal, MealType } from "./types";

const LS_PREFIX = "sf:nutrition:";

export function yyyyMmDd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function calcCalories(protein_g: number, fat_g: number, carbs_g: number) {
  return Math.round(protein_g * 4 + fat_g * 9 + carbs_g * 4);
}

export function defaultTargets(): NutritionTargets {
  // Default som i screenshot (kan senere komme fra profile / beregning)
  return { calories_kcal: 3069, protein_g: 192, fat_g: 92, carbs_g: 368 };
}

export function loadDay(date = yyyyMmDd()): NutritionDay {
  const key = `${LS_PREFIX}${date}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as NutritionDay;

  const day: NutritionDay = {
    date,
    targets: defaultTargets(),
    meals: [
      makeEmptyMeal("Frokost"),
      makeEmptyMeal("Lunsj"),
      makeEmptyMeal("Middag"),
    ],
  };

  return day;
}

export function saveDay(day: NutritionDay) {
  const key = `${LS_PREFIX}${day.date}`;
  localStorage.setItem(key, JSON.stringify(day));
}

export function listDays(limit = 60): NutritionDay[] {
  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith(LS_PREFIX))
    .sort()
    .reverse()
    .slice(0, limit);

  return keys.map((k) => JSON.parse(localStorage.getItem(k) || "{}") as NutritionDay);
}

export function sumMeals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => {
      acc.protein_g += m.protein_g || 0;
      acc.fat_g += m.fat_g || 0;
      acc.carbs_g += m.carbs_g || 0;
      acc.calories_kcal += m.calories_kcal || 0;
      return acc;
    },
    { protein_g: 0, fat_g: 0, carbs_g: 0, calories_kcal: 0 }
  );
}

export function makeEmptyMeal(type: MealType): Meal {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    calories_kcal: 0,
    created_at: now,
  };
}