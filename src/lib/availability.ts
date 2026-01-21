// /Users/oystein/smertefri-rehab-app-2026/src/lib/availability.ts
import { supabase } from "@/lib/supabaseClient";
import type { WeeklyAvailability } from "@/app/(app)/calendar/sections/Section6TrainerAvailability";

const emptyWeek: WeeklyAvailability = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

function mergeWeek(w?: WeeklyAvailability): WeeklyAvailability {
  return { ...emptyWeek, ...(w ?? {}) };
}

type RowWithUpdated = {
  availability?: WeeklyAvailability | null;
  updated_at?: string | null;
};

type RowBasic = {
  availability?: WeeklyAvailability | null;
};

/**
 * Hent ukentlig availability for trener
 * Robust mot:
 * - 0 rader
 * - flere rader (velger nyeste hvis updated_at finnes, ellers siste i lista)
 */
export async function loadAvailability(trainerId: string): Promise<WeeklyAvailability> {
  // 1) Forsøk med updated_at (hvis kolonnen finnes)
  const attempt1 = await supabase
    .from("trainer_weekly_availability")
    .select("availability, updated_at")
    .eq("trainer_id", trainerId);

  if (!attempt1.error) {
    const rows = (attempt1.data ?? []) as RowWithUpdated[];

    if (!rows.length) return { ...emptyWeek };

    // Velg nyeste via updated_at (fallback: siste i array)
    const picked =
      rows
        .filter((r) => !!r.updated_at)
        .sort((a, b) => (a.updated_at! < b.updated_at! ? 1 : -1))[0] ?? rows[rows.length - 1];

    return mergeWeek(picked?.availability ?? undefined);
  }

  // Hvis feilen er "kolonne finnes ikke", fallback til kun availability
  const msg = attempt1.error?.message ?? "";
  const code = attempt1.error?.code ?? "";

  const looksLikeMissingColumn =
    msg.toLowerCase().includes("does not exist") ||
    msg.toLowerCase().includes("column") ||
    code === "42703";

  if (!looksLikeMissingColumn) {
    console.error("❌ loadAvailability failed", {
      trainerId,
      code,
      message: msg,
      details: attempt1.error?.details,
      hint: (attempt1.error as any)?.hint,
    });
    throw new Error(msg || "Kunne ikke hente tilgjengelighet");
  }

  // 2) Fallback: kun availability (ingen sortering tilgjengelig)
  const { data, error } = await supabase
    .from("trainer_weekly_availability")
    .select("availability")
    .eq("trainer_id", trainerId);

  if (error) {
    console.error("❌ loadAvailability fallback failed", {
      trainerId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: (error as any)?.hint,
    });
    throw new Error(error.message || "Kunne ikke hente tilgjengelighet");
  }

  const rows = (data ?? []) as RowBasic[];
  if (!rows.length) return { ...emptyWeek };

  // Har vi flere rader og ingen updated_at, ta siste (best effort)
  const picked = rows[rows.length - 1];
  return mergeWeek(picked?.availability ?? undefined);
}

/**
 * Lagre ukentlig availability
 * NB: Hvis tabellen mangler UNIQUE(trainer_id), kan dette lage duplikater.
 * Derfor returnerer vi også lagret data, slik at UI/parent kan verifisere.
 */
export async function saveAvailability(trainerId: string, availability: WeeklyAvailability) {
  // Upsert + returner availability (så vi vet hva som faktisk ble lagret)
  const { data, error } = await supabase
    .from("trainer_weekly_availability")
    .upsert({ trainer_id: trainerId, availability }, { onConflict: "trainer_id" })
    .select("availability")
    .limit(1);

  if (error) {
    console.error("❌ saveAvailability failed", {
      trainerId,
      message: error.message,
      details: error.details,
      hint: (error as any)?.hint,
    });
    throw new Error(error.message || "Kunne ikke lagre tilgjengelighet");
  }

  // Returner det som DB sier er lagret
  const row = (data ?? [])[0] as RowBasic | undefined;
  return mergeWeek(row?.availability ?? availability);
}

// ================================
// HELPERS – BOOKING CHECK
// ================================

function timeToMinutes(t: string) {
  const parts = t.split(":").map(Number);
  const hh = parts[0] ?? 0;
  const mm = parts[1] ?? 0;
  return hh * 60 + mm;
}

function dateToMinutes(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function jsDayToKey(jsDay: number): keyof WeeklyAvailability {
  const map: Record<number, keyof WeeklyAvailability> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return map[jsDay];
}

export function isWithinWeeklyAvailability(
  availability: WeeklyAvailability,
  start: Date,
  durationMinutes: number
) {
  const dayKey = jsDayToKey(start.getDay());
  const slots = availability?.[dayKey] ?? [];

  const startMin = dateToMinutes(start);
  const endMin = startMin + durationMinutes;

  for (const s of slots) {
    if (!s.start || !s.end) continue;

    const slotStart = timeToMinutes(s.start);
    const slotEnd = timeToMinutes(s.end);

    if (startMin >= slotStart && endMin <= slotEnd) return true;
  }

  return false;
}