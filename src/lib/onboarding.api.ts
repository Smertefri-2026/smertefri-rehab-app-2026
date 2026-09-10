// src/lib/onboarding.api.ts
import { supabase } from "@/lib/supabaseClient";
import { isRedFlagCleared } from "@/lib/onboarding/redFlags";
import { suggestCalibrationProfile, type CalibrationProfile } from "@/lib/onboarding/calibration";

export type OnboardingRow = {
  id: string;
  client_id: string;
  red_flags: Record<string, boolean>;
  red_flag_cleared: boolean;
  goal: string | null;
  problem_area: string | null;
  problem_duration: string | null;
  limiting_factors: string | null;
  pain_intensity_now: number | null;
  aggravating_factors: string | null;
  relieving_factors: string | null;
  activity_level: string | null;
  fear_of_movement_score: number | null;
  sleep_quality: string | null;
  stress_level: string | null;
  previous_injuries: string | null;
  previous_treatment: string | null;
  calibration_profile: CalibrationProfile;
  completed_at: string | null;
  created_at: string;
};

export type OnboardingAnswers = {
  goal: string;
  redFlags: Record<string, boolean>;
  problemArea: string;
  problemDuration: string;
  painIntensityNow: number;
  aggravatingFactors: string;
  relievingFactors: string;
  limitingFactors: string;
  activityLevel: string;
  fearOfMovementScore: number;
  sleepQuality: string;
  stressLevel: string;
  previousInjuries: string;
  previousTreatment: string;
};

/** Nyeste kartlegging for innlogget kunde (fullført eller ikke). */
export async function getMyOnboarding(): Promise<OnboardingRow | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("onboarding_assessments")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as OnboardingRow) ?? null;
}

/** Har kunden en fullført kartlegging? Lett spørring for onboarding-gaten. */
export async function hasCompletedOnboarding(clientId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("onboarding_assessments")
    .select("id")
    .eq("client_id", clientId)
    .not("completed_at", "is", null)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/**
 * Lagrer kartleggingen. Setter completed_at kun hvis rødt lys er klarert —
 * ellers lagres svarene, men kunden sendes til «kontakt lege»-skjermen og
 * kartleggingen regnes ikke som fullført.
 */
export async function submitOnboarding(
  answers: OnboardingAnswers
): Promise<{ cleared: boolean; profile: CalibrationProfile }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const cleared = isRedFlagCleared(answers.redFlags);
  const { profile } = suggestCalibrationProfile({
    fearOfMovementScore: answers.fearOfMovementScore,
    activityLevel: answers.activityLevel,
    problemDuration: answers.problemDuration,
    painIntensityNow: answers.painIntensityNow,
    stressLevel: answers.stressLevel,
  });

  const row = {
    client_id: user.id,
    red_flags: answers.redFlags,
    red_flag_cleared: cleared,
    goal: answers.goal || null,
    problem_area: answers.problemArea || null,
    problem_duration: answers.problemDuration || null,
    limiting_factors: answers.limitingFactors || null,
    pain_intensity_now: answers.painIntensityNow,
    aggravating_factors: answers.aggravatingFactors || null,
    relieving_factors: answers.relievingFactors || null,
    activity_level: answers.activityLevel || null,
    fear_of_movement_score: answers.fearOfMovementScore,
    sleep_quality: answers.sleepQuality || null,
    stress_level: answers.stressLevel || null,
    previous_injuries: answers.previousInjuries || null,
    previous_treatment: answers.previousTreatment || null,
    calibration_profile: profile,
    completed_at: cleared ? new Date().toISOString() : null,
  };

  const existing = await getMyOnboarding();

  if (existing && existing.completed_at == null) {
    const { error } = await supabase
      .from("onboarding_assessments")
      .update(row as never)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("onboarding_assessments").insert(row as never);
    if (error) throw error;
  }

  return { cleared, profile };
}
