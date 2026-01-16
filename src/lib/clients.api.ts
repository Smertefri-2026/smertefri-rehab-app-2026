import { supabase } from "@/lib/supabaseClient";
import { Client } from "@/types/client";

/**
 * Hent alle kunder knyttet til innlogget trener
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
      city,
      trainer_id
    `)
    .eq("trainer_id", user.id)
    .eq("role", "client");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,

    phone: row.phone,
    birth_date: row.birth_date,
    address: row.address,
    postal_code: row.postal_code,
    city: row.city,
  }));
}