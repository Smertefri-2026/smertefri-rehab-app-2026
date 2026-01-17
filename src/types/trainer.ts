export type Trainer = {
  id: string;

  first_name: string;
  last_name: string;

  email?: string | null;

  /* 📞 PROFILFELTER */
  phone?: string | null;
  birth_date?: string | null;

  address?: string | null;
  postal_code?: string | null;
  city?: string | null;

  avatar_url?: string | null;

  /* 🧠 FAGLIG */
  trainer_bio?: string | null;
  trainer_specialties?: string[] | null;

  /* 👁 Synlighet */
  trainer_public?: boolean;
};