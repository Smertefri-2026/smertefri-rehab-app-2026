// A trainer as shown to admin (any trainer), a trainer viewing their own
// profile, or a client viewing their assigned trainer — RLS decides which
// of those three a given caller is allowed to fetch. There is no more
// "public/searchable" concept: trainers are assigned, not browsed.
export type Trainer = {
  id: string;

  first_name: string;
  last_name: string;

  email?: string | null;

  /* 📞 PROFILFELTER (profiles) */
  phone?: string | null;
  birth_date?: string | null;

  address?: string | null;
  postal_code?: string | null;
  city?: string | null;

  avatar_url?: string | null;

  /* 🧠 FAGLIG (trainer_profiles) */
  bio?: string | null;
  specialties?: string[] | null;
  certifications?: string | null;

  /* 🔐 Admin-styrt (trainer_profiles.status, satt via set_trainer_status RPC) */
  status?: "active" | "inactive" | null;
};
