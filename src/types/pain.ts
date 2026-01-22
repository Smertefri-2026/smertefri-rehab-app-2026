// src/types/pain.ts

export type PainQuality =
  | "murrende"
  | "stikkende"
  | "brennende"
  | "strålende"
  | "verkende"
  | "strammende";

export type PainPattern =
  | "konstant"
  | "episodisk"
  | "ved_belastning"
  | "morgenverst"
  | "etter_trening";

export type PainEntry = {
  id: string;

  client_id: string;

  area_key: string;
  area_label: string;

  intensity: number; // 0–10

  note: string | null;
  is_active: boolean;

  // ny v1+ (valgfritt nå, men støttes av SQL-en vi la inn)
  entry_date: string | null; // "YYYY-MM-DD"

  quality: PainQuality[] | null;
  pattern: PainPattern[] | null;

  provokes: string[] | null; // "verre ved"
  relieves: string[] | null; // "lindrer"

  function_note: string | null; // funksjon / hva klarer du ikke

  created_at: string;
  created_by: string | null;
};