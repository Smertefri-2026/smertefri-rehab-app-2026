import { supabase } from "@/lib/supabaseClient";
import type {
  WeeklyAvailability,
} from "@/app/(app)/calendar/sections/Section6TrainerAvailability";

/**
 * Hent ukentlig availability for trener
 * Returnerer alltid komplett uke (tom hvis ingen finnes)
 */
export async function loadAvailability(
  trainerId: string
): Promise<WeeklyAvailability> {
  const { data, error } = await supabase
    .from("trainer_weekly_availability")
    .select("availability")
    .eq("trainer_id", trainerId)
    .single();

  if (error) {
    // Ingen rad finnes ennå → helt ok
    if (error.code === "PGRST116") {
      return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
    }
    throw error;
  }

  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
    ...(data?.availability ?? {}),
  };
}

/**
 * Lagre ukentlig availability (erstatter alt for trener)
 */
export async function saveAvailability(
  trainerId: string,
  availability: WeeklyAvailability
) {
  const { error } = await supabase
    .from("trainer_weekly_availability")
    .upsert(
      {
        trainer_id: trainerId,
        availability,
      },
      {
        onConflict: "trainer_id",
      }
    );

  if (error) {
    throw error;
  }
}