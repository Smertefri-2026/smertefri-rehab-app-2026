import { supabase } from "@/lib/supabaseClient";

/**
 * 🔍 Hent trenere
 * Brukes av TrainersProvider og /trainers
 */
export async function getPublicTrainers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      address,
      postal_code,
      city,
      avatar_url,
      trainer_bio,
      trainer_specialties,
      trainer_public
    `)
    .eq("role", "trainer")
    .order("first_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 👤 Hent én trener (brukes i /trainers/[id])
 * NB: bruker samme felter som lista for konsistens
 */
export async function getTrainerById(trainerId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      address,
      postal_code,
      city,
      avatar_url,
      trainer_bio,
      trainer_specialties,
      trainer_public
    `)
    .eq("id", trainerId)
    .eq("role", "trainer")
    .single();

  if (error) throw error;
  return data;
}