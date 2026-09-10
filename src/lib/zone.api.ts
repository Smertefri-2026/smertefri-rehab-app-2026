// src/lib/zone.api.ts
//
// Datatilgang for Sonen. Selve vurderingen gjøres av den rene regelmotoren
// (src/lib/zone/computeZone.ts) — denne filen henter historikk, kaller
// motoren, og lagrer resultatet i daily_checkins + zone_history.
import { supabase } from "@/lib/supabaseClient";
import { computeZone, rollingBaseline } from "@/lib/zone";
import type { DailyCheckinInput, Zone, ZoneResult } from "@/lib/zone";

export type DailyCheckinRow = {
  id: string;
  client_id: string;
  checkin_date: string;
  pain_now: number | null;
  sleep: string | null;
  energy: string | null;
  new_symptom: boolean;
  new_symptom_note: string | null;
  completed_planned_activity: string | null;
  afraid_to_train: boolean;
  created_at: string;
};

export type ZoneHistoryRow = {
  id: string;
  client_id: string;
  zone_date: string;
  zone: Zone;
  computed_reason: string;
  inputs_snapshot: Record<string, unknown>;
  trainer_overridden: boolean;
  trainer_override_note: string | null;
  created_at: string;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayCheckin(clientId: string): Promise<DailyCheckinRow | null> {
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .eq("checkin_date", todayISO())
    .maybeSingle();
  if (error) throw error;
  return (data as DailyCheckinRow) ?? null;
}

export async function getTodayZone(clientId: string): Promise<ZoneHistoryRow | null> {
  const { data, error } = await supabase
    .from("zone_history")
    .select("*")
    .eq("client_id", clientId)
    .eq("zone_date", todayISO())
    .maybeSingle();
  if (error) throw error;
  return (data as ZoneHistoryRow) ?? null;
}

export async function getRecentZones(clientId: string, days = 14): Promise<ZoneHistoryRow[]> {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("zone_history")
    .select("*")
    .eq("client_id", clientId)
    .gte("zone_date", from)
    .order("zone_date", { ascending: false });
  if (error) throw error;
  return (data as ZoneHistoryRow[]) ?? [];
}

/** Daglig smerte-signal fra check-ins + pain_entries, nyeste først. */
async function loadPainHistory(clientId: string): Promise<{ date: string; intensity: number }[]> {
  const since = new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10);

  const [checkins, pain] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("checkin_date, pain_now")
      .eq("client_id", clientId)
      .gte("checkin_date", since)
      .order("checkin_date", { ascending: false }),
    supabase
      .from("pain_entries")
      .select("entry_date, intensity")
      .eq("client_id", clientId)
      .gte("entry_date", since)
      .order("entry_date", { ascending: false }),
  ]);

  if (checkins.error) throw checkins.error;
  if (pain.error) throw pain.error;

  const byDate = new Map<string, number>();

  // pain_entries: flere per dag (per område) → ta den høyeste for dagen
  for (const r of pain.data ?? []) {
    if (r.intensity == null) continue;
    const prev = byDate.get(r.entry_date);
    if (prev == null || r.intensity > prev) byDate.set(r.entry_date, r.intensity);
  }
  // daily_checkins: den daglige egenrapporten vinner hvis den finnes
  for (const r of checkins.data ?? []) {
    if (r.pain_now == null) continue;
    byDate.set(r.checkin_date, r.pain_now);
  }

  return Array.from(byDate.entries())
    .map(([date, intensity]) => ({ date, intensity }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export type SubmitCheckinInput = DailyCheckinInput & { newSymptomNote?: string };

/**
 * Lagrer dagens innsjekk, beregner Sonen og lagrer den. Kan kalles flere
 * ganger samme dag (kunden retter et svar) — Sonen re-beregnes så lenge en
 * trener ikke allerede har overstyrt den.
 */
export async function submitDailyCheckin(
  clientId: string,
  input: SubmitCheckinInput
): Promise<{ zone: ZoneResult; overridden: boolean }> {
  const today = todayISO();

  const history = await loadPainHistory(clientId);
  const baseline = rollingBaseline(history, { today });
  const recentPain = history.filter((p) => {
    const d = (new Date(`${today}T00:00:00Z`).getTime() - new Date(`${p.date}T00:00:00Z`).getTime()) / 86_400_000;
    return d >= 0 && d <= 7;
  });

  const result = computeZone(input, { baselinePain: baseline, recentPain, today });

  // 1) daily_checkins (upsert på (client_id, checkin_date))
  const { error: checkinErr } = await supabase.from("daily_checkins").upsert(
    {
      client_id: clientId,
      checkin_date: today,
      pain_now: input.painNow,
      sleep: input.sleep,
      energy: input.energy,
      new_symptom: input.newSymptom,
      new_symptom_note: input.newSymptom ? input.newSymptomNote ?? null : null,
      completed_planned_activity: input.completedPlannedActivity,
      afraid_to_train: input.afraidToTrain,
    } as never,
    { onConflict: "client_id,checkin_date" }
  );
  if (checkinErr) throw checkinErr;

  // 2) zone_history — insert hvis ny dag, ellers oppdater (respekterer
  //    trener-overstyring: da lar vi den stå og returnerer den).
  const existing = await getTodayZone(clientId);

  const snapshot = {
    input,
    baseline,
    recentPain,
    firedRules: result.firedRules,
    computedAt: new Date().toISOString(),
  };

  if (!existing) {
    const { error } = await supabase.from("zone_history").insert({
      client_id: clientId,
      zone_date: today,
      zone: result.zone,
      computed_reason: result.reason,
      inputs_snapshot: snapshot as never,
    } as never);
    if (error) throw error;
    return { zone: result, overridden: false };
  }

  if (existing.trainer_overridden) {
    return {
      zone: { zone: existing.zone, reason: existing.computed_reason, firedRules: [] },
      overridden: true,
    };
  }

  const { error } = await supabase
    .from("zone_history")
    .update({
      zone: result.zone,
      computed_reason: result.reason,
      inputs_snapshot: snapshot as never,
    } as never)
    .eq("id", existing.id);
  if (error) throw error;

  return { zone: result, overridden: false };
}
