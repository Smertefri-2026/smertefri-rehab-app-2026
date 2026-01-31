import { supabase } from "@/lib/supabaseClient";

export type NutritionMealRow = {
  id?: string;          // uuid (kan sendes inn, ellers autogen)
  day_id: string;       // FK -> nutrition_days.id
  user_id: string;      // auth.users.id
  meal_time?: string;   // timestamptz
  source?: string;      // 'manual' | 'ai'
  raw_text?: string | null;
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  confidence?: number | null;
  assumption?: string | null;
  created_at?: string;
};

export async function listMealsByDay(dayId: string) {
  const { data, error } = await supabase
    .from("nutrition_meals")
    .select("*")
    .eq("day_id", dayId)
    .order("meal_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as NutritionMealRow[];
}

export async function upsertMeal(row: Partial<NutritionMealRow>) {
  const { data, error } = await supabase
    .from("nutrition_meals")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as NutritionMealRow;
}

export async function deleteMeal(id: string) {
  const { error } = await supabase.from("nutrition_meals").delete().eq("id", id);
  if (error) throw error;
}