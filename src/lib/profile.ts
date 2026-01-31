import { supabase } from "@/lib/supabaseClient";

/* ================================
   TYPER
================================ */

export type TrainerMini = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  trainer_specialties: string[] | null;
};

export type MyProfile = {
  id: string;

  // 👤 person
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;

  // 🏠 adresse
  address: string | null;
  postal_code: string | null;
  city: string | null;

  // 🔐 system
  email?: string | null;
  role?: string | null;

  // 🔗 kobling (resolved)
  trainer_id?: string | null;

  // 🧠 trenerfelter
  trainer_bio?: string | null;
  trainer_specialties?: string[] | null;
  trainer_public?: boolean | null;

  // 👥 trener-relasjon
  trainer?: TrainerMini | null;
};

/* ================================
   INTERNAL HELPERS
================================ */

async function requireUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Ikke innlogget");
  return user;
}

/**
 * ✅ "Sannhet": trainer_client_links
 * Returnerer trener_id for innlogget kunde hvis finnes.
 * - Hvis flere rader finnes (burde ikke), tar vi den nyeste.
 * - Hvis RLS / tabell ikke gir data, returnerer null og vi faller tilbake.
 */
async function getTrainerIdFromLinks(clientId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("trainer_client_links")
    .select("trainer_id, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Ikke kast her – vi vil heller falle tilbake til legacy trainer_id i profiles
    console.warn("getTrainerIdFromLinks warning:", error.message);
    return null;
  }

  return data?.trainer_id ?? null;
}

async function getTrainerMini(trainerId: string): Promise<TrainerMini | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, city, trainer_specialties")
    .eq("id", trainerId)
    .maybeSingle<TrainerMini>();

  if (error) {
    console.warn("getTrainerMini warning:", error.message);
    return null;
  }

  return data ?? null;
}

/* ================================
   HENT MIN PROFIL
================================ */
export async function getMyProfile(): Promise<MyProfile> {
  const user = await requireUser();

  // 1) Hent min profil (grunn-data)
  const { data: me, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<MyProfile>();

  if (error || !me) {
    throw new Error("Kunne ikke hente profil");
  }

  // 2) ✅ RESOLV trainer_id:
  //    - først fra trainer_client_links (sannhet)
  //    - fallback til profiles.trainer_id (legacy)
  const linkedTrainerId = await getTrainerIdFromLinks(user.id);
  const resolvedTrainerId = linkedTrainerId ?? me.trainer_id ?? null;

  // 3) Hent trener-mini hvis koblet
  const trainer = resolvedTrainerId ? await getTrainerMini(resolvedTrainerId) : null;

  // 4) Returner profilen – men med resolved trainer_id
  return {
    ...me,
    trainer_id: resolvedTrainerId,
    trainer,
  };
}

/* ================================
   OPPDATER MIN PROFIL
================================ */
export async function updateMyProfile(updates: Partial<MyProfile>) {
  const user = await requireUser();

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) throw error;
}

/* ================================
   KUNDE → VELG TRENER
   (legacy API, men gjør riktig nå)
================================ */
export async function selectTrainer(trainerId: string) {
  if (!trainerId) throw new Error("Mangler trainerId");
  await requireUser();

  // ✅ Bruk RPC som skriver til trainer_client_links
  const { error } = await supabase.rpc("set_my_trainer", { p_trainer_id: trainerId });
  if (error) throw error;

  return await getMyProfile();
}

/* ================================
   BATCH: HENT NAVN (kalender, labels)
================================ */

export type ProfileNameRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
};

export async function getProfilesByIds(ids: string[]): Promise<ProfileNameRow[]> {
  const clean = Array.from(new Set(ids)).filter(Boolean);
  if (clean.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", clean);

  if (error) throw error;
  return (data ?? []) as ProfileNameRow[];
}