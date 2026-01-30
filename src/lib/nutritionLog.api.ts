import { supabase } from "@/lib/supabaseClient";

export type NutritionDayRow = {
  id?: string;
  user_id: string;
  day_date: string; // YYYY-MM-DD

  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;

  created_at?: string;
  updated_at?: string;
};

export async function getNutritionDay(userId: string, dayDate: string) {
  const { data, error } = await supabase
    .from("nutrition_days")
    .select("*")
    .eq("user_id", userId)
    .eq("day_date", dayDate)
    .maybeSingle();

  if (error) throw error;
  return data as NutritionDayRow | null;
}

export async function upsertNutritionDay(row: NutritionDayRow) {
  const payload = {
    ...row,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("nutrition_days")
    .upsert(payload, { onConflict: "user_id,day_date" })
    .select("*")
    .single();

  if (error) throw error;
  return data as NutritionDayRow;
}

export async function listNutritionDays(userId: string, from: string, to: string) {
  const { data, error } = await supabase
    .from("nutrition_days")
    .select("*")
    .eq("user_id", userId)
    .gte("day_date", from)
    .lte("day_date", to)
    .order("day_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as NutritionDayRow[];
}