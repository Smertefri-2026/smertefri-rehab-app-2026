// src/lib/onboarding.api.ts
import { supabase } from "@/lib/supabaseClient";
import { isRedFlagCleared } from "@/lib/onboarding/redFlags";
import { suggestCalibrationProfile, type CalibrationProfile } from "@/lib/onboarding/calibration";
import { initTrappForSelf } from "@/lib/trapp.api";

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

/**
 * Nyeste kartlegging for en gitt kunde — brukt av rehabtreneren/admin på
 * kundekortet. RLS (onboarding_select_assigned_trainer/_admin) håndhever
 * at bare tildelt trener eller admin faktisk får noe tilbake.
 */
export async function getClientOnboarding(clientId: string): Promise<OnboardingRow | null> {
  const { data, error } = await supabase
    .from("onboarding_assessments")
    .select("*")
    .eq("client_id", clientId)
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

  if (cleared) {
    // Sett startpunktet i Trappen (Ro). Ikke la en feil her blokkere flyten.
    try {
      await initTrappForSelf(user.id);
    } catch (e) {
      console.warn("Kunne ikke initialisere Trappen:", e);
    }
  }

  return { cleared, profile };
}

export type OnboardingHistoryRow = {
  id: string;
  assessment_id: string;
  snapshot: Record<string, unknown>;
  changed_fields: string[];
  changed_at: string;
};

/** Endringshistorikk for «Min kartlegging», nyeste først. */
export async function getOnboardingHistory(clientId: string): Promise<OnboardingHistoryRow[]> {
  const { data, error } = await supabase
    .from("onboarding_history")
    .select("id, assessment_id, snapshot, changed_fields, changed_at")
    .eq("client_id", clientId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return (data as OnboardingHistoryRow[]) ?? [];
}

async function snapshotCurrent(row: OnboardingRow, changedFields: string[]) {
  const { error } = await supabase.from("onboarding_history").insert({
    assessment_id: row.id,
    client_id: row.client_id,
    snapshot: row as unknown as Record<string, unknown>,
    changed_fields: changedFields,
  } as never);
  if (error) throw error;
}

/**
 * Oppdaterer ikke-kritiske deler av en allerede fullført kartlegging (mål,
 * plagene, hverdagen, historikk) — «Min kartlegging». Forrige tilstand
 * snapshottes til onboarding_history før raden oppdateres, så historikken
 * aldri går tapt. Feltene som ikke er med i `patch` beholdes uendret —
 * kunden trenger ikke fylle ut alt på nytt. Rører aldri red_flags/completed_at
 * (se updateRedFlags for det).
 */
export async function updateOnboardingSection(
  patch: Partial<
    Omit<OnboardingAnswers, "redFlags">
  >
): Promise<{ profile: CalibrationProfile }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const existing = await getMyOnboarding();
  if (!existing || !existing.completed_at) {
    throw new Error("Fullfør kartleggingen først på /onboarding");
  }

  const merged = {
    goal: patch.goal ?? existing.goal ?? "",
    problemArea: patch.problemArea ?? existing.problem_area ?? "",
    problemDuration: patch.problemDuration ?? existing.problem_duration ?? "",
    painIntensityNow: patch.painIntensityNow ?? existing.pain_intensity_now ?? 0,
    aggravatingFactors: patch.aggravatingFactors ?? existing.aggravating_factors ?? "",
    relievingFactors: patch.relievingFactors ?? existing.relieving_factors ?? "",
    limitingFactors: patch.limitingFactors ?? existing.limiting_factors ?? "",
    activityLevel: patch.activityLevel ?? existing.activity_level ?? "",
    fearOfMovementScore: patch.fearOfMovementScore ?? existing.fear_of_movement_score ?? 0,
    sleepQuality: patch.sleepQuality ?? existing.sleep_quality ?? "",
    stressLevel: patch.stressLevel ?? existing.stress_level ?? "",
    previousInjuries: patch.previousInjuries ?? existing.previous_injuries ?? "",
    previousTreatment: patch.previousTreatment ?? existing.previous_treatment ?? "",
  };

  const { profile } = suggestCalibrationProfile({
    fearOfMovementScore: merged.fearOfMovementScore,
    activityLevel: merged.activityLevel,
    problemDuration: merged.problemDuration,
    painIntensityNow: merged.painIntensityNow,
    stressLevel: merged.stressLevel,
  });

  await snapshotCurrent(existing, Object.keys(patch));

  const { error } = await supabase
    .from("onboarding_assessments")
    .update({
      goal: merged.goal || null,
      problem_area: merged.problemArea || null,
      problem_duration: merged.problemDuration || null,
      pain_intensity_now: merged.painIntensityNow,
      aggravating_factors: merged.aggravatingFactors || null,
      relieving_factors: merged.relievingFactors || null,
      limiting_factors: merged.limitingFactors || null,
      activity_level: merged.activityLevel || null,
      fear_of_movement_score: merged.fearOfMovementScore,
      sleep_quality: merged.sleepQuality || null,
      stress_level: merged.stressLevel || null,
      previous_injuries: merged.previousInjuries || null,
      previous_treatment: merged.previousTreatment || null,
      calibration_profile: profile,
    } as never)
    .eq("id", existing.id);
  if (error) throw error;

  return { profile };
}

/**
 * Oppdaterer trygghetssjekken (røde flagg) på en fullført kartlegging.
 * Skrives alltid — også når den IKKE er klarert, slik at det finnes et reelt
 * spor treneren kan se. Rører aldri completed_at: et nytt rødt flagg gir en
 * tydelig «ta kontakt med lege»-beskjed i appen, men låser ikke kunden ute av
 * appen på egen hånd — det er en menneskelig, ikke automatisk, avgjørelse.
 */
export async function updateRedFlags(
  redFlags: Record<string, boolean>
): Promise<{ cleared: boolean }> {
  const existing = await getMyOnboarding();
  if (!existing || !existing.completed_at) {
    throw new Error("Fullfør kartleggingen først på /onboarding");
  }

  const cleared = isRedFlagCleared(redFlags);

  await snapshotCurrent(existing, ["redFlags"]);

  const { error } = await supabase
    .from("onboarding_assessments")
    .update({ red_flags: redFlags, red_flag_cleared: cleared } as never)
    .eq("id", existing.id);
  if (error) throw error;

  return { cleared };
}
