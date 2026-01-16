export type ClientStatus = {
  nextSession?: string | null;
  painLevel?: "Lav" | "Moderat" | "Høy" | null;
  testStatus?: string | null;
  nutritionStatus?: string | null;
};

export type ClientNote = {
  text: string;
  updatedAt?: string;
};

export type Client = {
  id: string;

  first_name: string;
  last_name: string;

  // 🧍 Grunninfo (kan komme fra joins / views senere)
  age?: number;

  // 📞 Profilfelter (profiles-tabellen)
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;

  // 📊 Status / notater
  status?: ClientStatus;
  note?: ClientNote;
};