import { supabase } from "@/lib/supabaseClient";

/**
 * 🔍 Hent alle synlige trenere (brukes i /trainers)
 */
export async function getPublicTrainers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      avatar_url,
      city,
      trainer_bio,
      trainer_specialties
    `)
    .eq("trainer_public", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 👤 Hent én trener (brukes i /trainers/[id])
 */
export async function getTrainerById(trainerId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      avatar_url,
      city,
      trainer_bio,
      trainer_specialties,
      trainer_public
    `)
    .eq("id", trainerId)
    .eq("trainer_public", true)
    .single();

  if (error) throw error;
  return data;
}