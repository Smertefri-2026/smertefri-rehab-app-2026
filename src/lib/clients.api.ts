import { supabase } from "@/lib/supabaseClient";
import { Client } from "@/types/client";

/**
 * Hent kunder for innlogget trener
 */
export async function fetchMyClients(): Promise<Client[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      phone,
      birth_date,
      address,
      postal_code,
      city
    `)
    .eq("trainer_id", user.id)
    .eq("role", "client");

  if (error) throw error;

  return data ?? [];
}

/**
 * 🔐 Admin – hent ALLE kunder
 */
export async function fetchAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      phone,
      birth_date,
      address,
      postal_code,
      city,
      trainer_id
    `)
    .eq("role", "client");

  if (error) throw error;

  return data ?? [];
}