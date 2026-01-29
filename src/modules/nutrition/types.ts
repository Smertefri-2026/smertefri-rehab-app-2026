export type MealType = "Frokost" | "Lunsj" | "Middag" | "Mellommåltid";

export type Meal = {
  id: string;
  type: MealType;
  title?: string;
  note?: string;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  calories_kcal: number;
  created_at: string; // ISO
};

export type NutritionTargets = {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

export type NutritionDay = {
  date: string; // YYYY-MM-DD
  targets: NutritionTargets;
  meals: Meal[];
};