import { supabase } from "@/lib/supabaseClient";
import { Trainer } from "@/types/trainer";

const SELECT = `
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
  trainer_profiles ( bio, specialties, certifications, status )
`;

function flatten(row: any): Trainer {
  const tp = Array.isArray(row.trainer_profiles) ? row.trainer_profiles[0] : row.trainer_profiles;
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    birth_date: row.birth_date ?? null,
    address: row.address ?? null,
    postal_code: row.postal_code ?? null,
    city: row.city ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: tp?.bio ?? null,
    specialties: tp?.specialties ?? null,
    certifications: tp?.certifications ?? null,
    status: tp?.status ?? null,
  };
}

/**
 * 🔐 Admin – alle trenere (for administrasjon/tildeling), med
 * kompetanseprofil (trainer_profiles) joinet inn.
 */
export async function getAllTrainersForAdmin(): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .eq("role", "trainer")
    .order("first_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(flatten);
}

/**
 * Én trener, med kompetanseprofil. RLS avgjør hvem som faktisk kan lese
 * raden: admin (alle), treneren selv (egen rad), eller en kunde som er
 * aktivt tildelt nettopp denne treneren.
 */
export async function getTrainerById(trainerId: string): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .eq("id", trainerId)
    .eq("role", "trainer")
    .maybeSingle();

  if (error) throw error;
  return data ? flatten(data) : null;
}
