import { supabase } from "@/lib/supabaseClient";

export type NutritionProfile = {
  user_id: string;
  sex: string | null;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  job_activity: string | null;
  training_activity: string | null;
  goal: string | null;
  updated_at?: string;
};

export async function getNutritionProfile(userId: string) {
  const { data, error } = await supabase
    .from("nutrition_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as NutritionProfile | null;
}

export async function upsertNutritionProfile(patch: Partial<NutritionProfile> & { user_id: string }) {
  const { data, error } = await supabase
    .from("nutrition_profiles")
    .upsert({ ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as NutritionProfile;
}