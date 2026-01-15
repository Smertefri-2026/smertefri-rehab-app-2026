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

  // 🔗 kobling
  trainer_id?: string | null;

  // 🧠 trenerfelter
  trainer_bio?: string | null;
  trainer_specialties?: string[] | null;
  trainer_public?: boolean | null;

  // 👥 trener-relasjon
  trainer?: TrainerMini | null;
};

/* ================================
   HENT MIN PROFIL
================================ */
export async function getMyProfile(): Promise<MyProfile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  const { data: me, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<MyProfile>();

  if (error || !me) {
    throw new Error("Kunne ikke hente profil");
  }

  // Hent trener hvis koblet
  let trainer: TrainerMini | null = null;

  if (me.trainer_id) {
    const { data: t } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, avatar_url, city, trainer_specialties"
      )
      .eq("id", me.trainer_id)
      .single<TrainerMini>();

    trainer = t ?? null;
  }

  return {
    ...me,
    trainer,
  };
}

/* ================================
   OPPDATER MIN PROFIL
================================ */
export async function updateMyProfile(
  updates: Partial<MyProfile>
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;
}

/* ================================
   KUNDE → VELG TRENER
================================ */
export async function selectTrainer(trainerId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ trainer_id: trainerId })
    .eq("id", user.id);

  if (error) throw error;

  return await getMyProfile();
}