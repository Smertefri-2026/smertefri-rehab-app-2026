/* ---------------- STATUS ---------------- */

export type ClientStatus = {
  nextSession?: string | null;
  painLevel?: "Lav" | "Moderat" | "Høy" | null;
  testStatus?: string | null;
  nutritionStatus?: string | null;
};

/* ---------------- NOTATER ---------------- */

export type ClientNote = {
  text: string;
  updatedAt?: string;
};

/* ---------------- CLIENT ---------------- */

export type Client = {
  id: string;

  first_name: string;
  last_name: string;

  /* 🔗 RELASJON */
  trainer_id?: string | null;

  /* 🖼 PROFILBILDE */
  avatar_url?: string | null;

  /* 🧍 Avledet (beregnes i UI, lagres ikke i DB) */
  age?: number;

  /* 📞 PROFILFELTER (profiles-tabellen) */
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;

  /* 📊 UI / STATUS */
  status?: ClientStatus;
  note?: ClientNote;
};