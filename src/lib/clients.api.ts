import { supabase } from "@/lib/supabaseClient";
import { Client } from "@/types/client";

/**
 * 👤 Hent kunder for innlogget trener
 * ✅ Sannhet: trainer_client_links
 *
 * Returnerer kundens profile-rad for alle kunder som er linket til treneren.
 */
export async function fetchMyClients(): Promise<Client[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Ikke innlogget");

  // ---------- A) Først: prøv "sannhet" = trainer_client_links (uten embed) ----------
  try {
    const { data: links, error: linkErr } = await supabase
      .from("trainer_client_links")
      .select("client_id, created_at")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false });

    if (linkErr) throw linkErr;

    const clientIds = (links ?? []).map((l: any) => l.client_id).filter(Boolean);

    // Hvis vi har linker: hent klient-profiler via IN()
    if (clientIds.length > 0) {
      const { data: profs, error: profErr } = await supabase
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
          role
        `)
        .in("id", clientIds)
        .eq("role", "client");

      if (profErr) throw profErr;

      // Behold rekkefølge fra links
      const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const ordered = clientIds
        .map((id: string) => byId.get(id))
        .filter(Boolean)
        .map((c: any) => ({ ...c, trainer_id: user.id } as Client));

      // Stabil alfabetisk sort (valgfritt)
      ordered.sort((a, b) => {
        const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim().toLowerCase();
        const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim().toLowerCase();
        return an.localeCompare(bn, "nb");
      });

      return ordered;
    }
  } catch (e) {
    // Ikke stopp – fall tilbake til legacy
    console.warn("fetchMyClients: link-path feilet, fallback til legacy:", e);
  }

  // ---------- B) Fallback: legacy = profiles.trainer_id ----------
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

  return (data ?? []) as Client[];
}
/**
 * 🔐 Admin – hent ALLE kunder
 */
export async function fetchAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
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
    `
    )
    .eq("role", "client");

  if (error) throw error;

  return (data ?? []) as Client[];
}

/**
 * 🔐 Admin – hent ALLE trenere (for bytte trener)
 */
export async function fetchAllTrainers(): Promise<
  { id: string; first_name: string; last_name: string }[]
> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name
    `
    )
    .eq("role", "trainer")
    .order("first_name", { ascending: true });

  if (error) throw error;

  return data ?? [];
}