import { supabase } from "@/lib/supabaseClient";

type TrainerMini = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  trainer_specialties: string[] | null;
};

type MyProfileRow = {
  id: string;
  email?: string | null;
  role?: string | null;

  // kobling
  trainer_id?: string | null;

  // trenerfelter
  trainer_bio?: string | null;
  trainer_specialties?: string[] | null;
  trainer_public?: boolean | null;

  // andre felter dere har
  [key: string]: any;
};

function normalizeErrorMessage(err: any) {
  if (!err) return "Ukjent feil";
  if (typeof err === "string") return err;
  if (typeof err?.message === "string") return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/* ================================
   HENT INNLOGGET BRUKERS PROFIL
   (UTEN nested join pga PGRST200)
================================ */
export async function getMyProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  // 1) Hent min profil
  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<MyProfileRow>();

  if (meErr) {
    throw new Error(normalizeErrorMessage(meErr));
  }
  if (!me) {
    throw new Error("Fant ikke profil");
  }

  // 2) Hvis jeg har trainer_id → hent trenerprofil separat
  let trainer: TrainerMini | null = null;

  if (me.trainer_id) {
    const { data: t, error: tErr } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, avatar_url, city, trainer_specialties"
      )
      .eq("id", me.trainer_id)
      .single<TrainerMini>();

    if (!tErr) trainer = t ?? null;
    // Hvis trener ikke finnes / cache-issue → vi lar trainer være null, men me.trainer_id er fortsatt satt.
  }

  // Returner samme shape som før, inkludert trainer-objekt
  return { ...me, trainer };
}

/* ================================
   OPPDATER MIN PROFIL
================================ */
export async function updateMyProfile(updates: Record<string, any>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) throw new Error(normalizeErrorMessage(error));
}

/* ================================
   KUNDE → VELG TRENER
   (returnerer også oppdatert profil)
================================ */
export async function selectTrainer(trainerId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Ikke innlogget");
  }

  // Oppdater trainer_id
  const { error } = await supabase
    .from("profiles")
    .update({ trainer_id: trainerId })
    .eq("id", user.id);

  if (error) throw new Error(normalizeErrorMessage(error));

  // Returner ny profil (med trener-objekt)
  return await getMyProfile();
}