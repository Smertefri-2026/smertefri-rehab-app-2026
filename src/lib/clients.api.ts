import { supabase } from "@/lib/supabaseClient";
import { Client } from "@/types/client";

/**
 * 👤 Hent kunder for innlogget trener
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
      avatar_url,
      phone,
      birth_date,
      address,
      postal_code,
      city,
      trainer_id
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
      avatar_url,
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

/**
 * 🔐 Admin – hent ALLE trenere (for bytte trener)
 */
export async function fetchAllTrainers(): Promise<
  { id: string; first_name: string; last_name: string }[]
> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name
    `)
    .eq("role", "trainer")
    .order("first_name", { ascending: true });

  if (error) throw error;

  return data ?? [];
}