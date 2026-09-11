import { supabase } from "@/lib/supabaseClient";
import { Client } from "@/types/client";
import { getActiveClientIdsForTrainer, getActiveTrainerIdMapForClients } from "@/lib/assignments.api";

const PROFILE_FIELDS = `
  id,
  first_name,
  last_name,
  avatar_url,
  phone,
  birth_date,
  address,
  postal_code,
  city,
  role
`;

/**
 * 👤 Hent kunder for innlogget trener
 * ✅ Sannhet: client_trainer_assignments (status = 'active')
 */
export async function fetchMyClients(): Promise<Client[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Ikke innlogget");

  const clientIds = await getActiveClientIdsForTrainer(user.id);
  if (clientIds.length === 0) return [];

  const { data: profs, error: profErr } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", clientIds)
    .eq("role", "client");

  if (profErr) throw profErr;

  const ordered = (profs ?? []).map((c) => ({ ...c, trainer_id: user.id } as Client));

  ordered.sort((a, b) => {
    const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim().toLowerCase();
    const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim().toLowerCase();
    return an.localeCompare(bn, "nb");
  });

  return ordered;
}

/**
 * 🔐 Admin – hent ALLE kunder, med aktivt tildelt trener (om noen) påført.
 */
export async function fetchAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("role", "client");

  if (error) throw error;

  const clients = data ?? [];
  const trainerByClientId = await getActiveTrainerIdMapForClients(clients.map((c) => c.id));

  return clients.map((c) => ({ ...c, trainer_id: trainerByClientId[c.id] ?? null } as Client));
}

/**
 * 🔐 Admin – hent ALLE trenere (for tildeling)
 */
export async function fetchAllTrainers(): Promise<
  { id: string; first_name: string | null; last_name: string | null; email: string | null }[]
> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email
    `
    )
    .eq("role", "trainer")
    .order("first_name", { ascending: true });

  if (error) throw error;

  return data ?? [];
}
