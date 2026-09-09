import { supabase } from "@/lib/supabaseClient";
import { getActiveTrainerIdForClient } from "@/lib/assignments.api";
import { getTrainerById } from "@/lib/trainers";
import type { Trainer } from "@/types/trainer";

/* ================================
   TYPER
================================ */

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

  // 🔗 kobling (resolved via client_trainer_assignments, ikke en kolonne)
  trainer_id?: string | null;

  // 👥 trener-relasjon — kun fylt for role='client' med aktiv tildeling
  trainer?: Trainer | null;
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

/* ================================
   HENT MIN PROFIL
================================ */
export async function getMyProfile(): Promise<MyProfile> {
  const user = await requireUser();

  const { data: me, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !me) {
    throw new Error("Kunne ikke hente profil");
  }

  let trainerId: string | null = null;
  let trainer: Trainer | null = null;

  if (me.role === "client") {
    // "trainer" = kundens tildelte rehabtrener
    trainerId = await getActiveTrainerIdForClient(user.id);
    trainer = trainerId ? await getTrainerById(trainerId) : null;
  } else if (me.role === "trainer") {
    // "trainer" = treneren selv sin egen kompetanseprofil (bio/spesialiteter)
    trainerId = user.id;
    trainer = await getTrainerById(user.id);
  }

  return {
    ...me,
    trainer_id: trainerId,
    trainer,
  };
}

/* ================================
   OPPDATER MIN PROFIL (person-/kontaktfelter)
================================ */
export async function updateMyProfile(updates: Partial<MyProfile>) {
  const user = await requireUser();

  // Kun person-/kontaktfelter lever på profiles nå — trener-kompetansefelter
  // (bio/spesialiteter) går via updateMyTrainerProfile mot trainer_profiles.
  const {
    first_name,
    last_name,
    phone,
    birth_date,
    avatar_url,
    address,
    postal_code,
    city,
  } = updates;

  const patch = {
    ...(first_name !== undefined && { first_name }),
    ...(last_name !== undefined && { last_name }),
    ...(phone !== undefined && { phone }),
    ...(birth_date !== undefined && { birth_date }),
    ...(avatar_url !== undefined && { avatar_url }),
    ...(address !== undefined && { address }),
    ...(postal_code !== undefined && { postal_code }),
    ...(city !== undefined && { city }),
  };

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
}

/* ================================
   TRENER: OPPDATER EGEN KOMPETANSEPROFIL
   (trainer_profiles — RLS: trainer_profiles_update_own)
================================ */
export async function updateMyTrainerProfile(updates: {
  bio?: string | null;
  specialties?: string[];
  certifications?: string | null;
}) {
  const user = await requireUser();

  const { error } = await supabase
    .from("trainer_profiles")
    .update(updates)
    .eq("trainer_id", user.id);

  if (error) throw error;
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
