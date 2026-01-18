// src/lib/availability.ts
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

/**
 * Hent ukentlig availability for trener
 * Returnerer alltid komplett uke (tom hvis ingen finnes)
 */
export async function loadAvailability(trainerId: string): Promise<WeeklyAvailability> {
  const { data, error } = await supabase
    .from("trainer_weekly_availability")
    .select("availability")
    .eq("trainer_id", trainerId)
    .single();

  if (error) {
    // Ingen rad finnes ennå → helt ok
    if (error.code === "PGRST116") {
      return { ...emptyWeek };
    }

    console.error("❌ loadAvailability failed", {
      trainerId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: (error as any).hint,
    });

    throw new Error(error.message || "Kunne ikke hente tilgjengelighet");
  }

  return {
    ...emptyWeek,
    ...(data?.availability ?? {}),
  };
}

/**
 * Lagre ukentlig availability (erstatter alt for trener)
 */
export async function saveAvailability(trainerId: string, availability: WeeklyAvailability) {
  const { error } = await supabase
    .from("trainer_weekly_availability")
    .upsert(
      { trainer_id: trainerId, availability },
      { onConflict: "trainer_id" }
    );

  if (error) {
    console.error("❌ saveAvailability failed", {
      trainerId,
      message: error.message,
      details: error.details,
      hint: (error as any).hint,
    });
    throw new Error(error.message || "Kunne ikke lagre tilgjengelighet");
  }
}

// ================================
// HELPERS – BOOKING CHECK
// ================================

function timeToMinutes(t: string) {
  // støtter "HH:mm" og "HH:mm:ss"
  const parts = t.split(":").map(Number);
  const hh = parts[0] ?? 0;
  const mm = parts[1] ?? 0;
  return hh * 60 + mm;
}

function dateToMinutes(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function jsDayToKey(jsDay: number): keyof WeeklyAvailability {
  // JS: 0=Sunday ... 6=Saturday
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

/**
 * Sjekker om start + varighet ligger inne i en av dagens availability-slots.
 */
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