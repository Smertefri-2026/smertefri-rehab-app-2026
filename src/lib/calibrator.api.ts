// Datatilgang for Kalibratoren. Henter sammen datagrunnlaget, kaller den
// rene regelmotoren (src/lib/calibrator/), og lagrer trenerens avgjørelse.
// Regelmotoren selv rører aldri DB.
import { supabase } from "@/lib/supabaseClient";
import { calibrate } from "@/lib/calibrator";
import type {
  CalibratorInput,
  CalibratorSuggestion,
} from "@/lib/calibrator";
import type { CalibrationProfile } from "@/lib/onboarding/calibration";
import type { TrappStage } from "@/lib/trapp/stages";
import type { Zone } from "@/lib/zone/types";

const WINDOW_DAYS = 21;

export type CalibratorEventRow = {
  id: string;
  client_id: string;
  suggestion_kind: "expand" | "retreat" | "hold";
  suggestion_rule: string;
  headline: string;
  reasoning: string;
  fired_signals: string[];
  trainer_decision: "followed" | "dismissed" | null;
  trainer_note: string | null;
  decided_at: string | null;
  created_at: string;
};

export type CalibratorView = {
  suggestion: CalibratorSuggestion;
  input: CalibratorInput;
  /** Siste loggførte hendelse for kunden, hvis noen. */
  lastEvent: CalibratorEventRow | null;
  /** Har vi nok data til at forslaget er meningsfullt? */
  hasEnoughData: boolean;
};

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000
  );
}

/**
 * Bygger CalibratorInput for én kunde og returnerer forslaget +
 * datagrunnlaget + siste avgjørelse.
 */
export async function getCalibratorView(clientId: string): Promise<CalibratorView | null> {
  const since = isoDaysAgo(WINDOW_DAYS);
  const today = new Date().toISOString().slice(0, 10);

  const [zoneRes, compRes, trappRes, obRes, eventRes] = await Promise.all([
    supabase
      .from("zone_history")
      .select("zone_date, zone, trainer_overridden")
      .eq("client_id", clientId)
      .gte("zone_date", since)
      .order("zone_date", { ascending: false }),
    supabase
      .from("workout_completions")
      .select("completion_date, status")
      .eq("client_id", clientId)
      .gte("completion_date", since)
      .order("completion_date", { ascending: false }),
    supabase
      .from("trapp_state")
      .select("current_stage")
      .eq("client_id", clientId)
      .maybeSingle(),
    supabase
      .from("onboarding_assessments")
      .select("calibration_profile")
      .eq("client_id", clientId)
      .not("completed_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("calibrator_events")
      .select(
        "id, client_id, suggestion_kind, suggestion_rule, headline, reasoning, fired_signals, trainer_decision, trainer_note, decided_at, created_at"
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (zoneRes.error) throw zoneRes.error;
  if (compRes.error) throw compRes.error;

  const stage = (trappRes.data?.current_stage as TrappStage | undefined) ?? null;
  if (!stage) return null; // Ingen Trapp ⇒ kartlegging ikke fullført ⇒ ingen Kalibrator ennå

  const profile =
    (obRes.data?.calibration_profile as CalibrationProfile | undefined) ?? "standard";

  const zones = (zoneRes.data ?? []).map((r) => ({
    date: r.zone_date as string,
    zone: r.zone as Zone,
    trainerOverridden: !!r.trainer_overridden,
  }));

  const completions = (compRes.data ?? []).map((r) => ({
    date: r.completion_date as string,
    status: r.status as "ja" | "delvis" | "nei",
  }));

  const lastRed = zones.find((z) => z.zone === "red");
  const daysSinceFlare = lastRed ? Math.max(0, daysBetween(lastRed.date, today)) : null;

  const input: CalibratorInput = { profile, stage, zones, completions, daysSinceFlare };
  const suggestion = calibrate(input);

  return {
    suggestion,
    input,
    lastEvent: (eventRes.data as CalibratorEventRow | null) ?? null,
    hasEnoughData: zones.length >= 2,
  };
}

/** Trener justerer kundens kalibreringsprofil (går gjennom SECURITY DEFINER-RPC). */
export async function setCalibrationProfile(
  clientId: string,
  profile: CalibrationProfile
): Promise<void> {
  const { error } = await supabase.rpc("set_calibration_profile", {
    p_client_id: clientId,
    p_profile: profile,
  });
  if (error) throw error;
}

/** Trener tar stilling til et forslag. Logges i calibrator_events. */
export async function logCalibratorDecision(
  clientId: string,
  suggestion: CalibratorSuggestion,
  input: CalibratorInput,
  decision: "followed" | "dismissed",
  note?: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("calibrator_events").insert({
    client_id: clientId,
    suggestion_kind: suggestion.kind,
    suggestion_rule: suggestion.rule,
    headline: suggestion.headline,
    reasoning: suggestion.reasoning,
    input_snapshot: input as never,
    fired_signals: suggestion.firedSignals,
    trainer_decision: decision,
    trainer_id: user?.id ?? null,
    trainer_note: note?.trim() || null,
    decided_at: new Date().toISOString(),
  } as never);
  if (error) throw error;
}

/**
 * Har treneren allerede tatt stilling til et forslag av samme type i dag?
 * Brukes for å ikke mase om det samme.
 */
export function decisionIsFresh(event: CalibratorEventRow | null, kind: string): boolean {
  if (!event || !event.decided_at) return false;
  if (event.suggestion_kind !== kind) return false;
  return daysBetween(event.decided_at.slice(0, 10), new Date().toISOString().slice(0, 10)) < 3;
}
