// src/lib/progress.api.ts
//
// Aggregerer fremgangsdata for kunde og trener. Ingen KI, ingen skjulte
// scores — bare sammenstilling av det som allerede er logget.
import { supabase } from "@/lib/supabaseClient";
import type { Zone } from "@/lib/zone";

export type PainPoint = { date: string; intensity: number };
export type ZoneCounts = { green: number; yellow: number; red: number; total: number };
export type Adherence = { logged: number; completed: number; windowDays: number };
export type TestProgressRow = {
  metric_key: string;
  category: string;
  baseline: number | null;
  latest: number | null;
  changePct: number | null;
};

function daysAgoISO(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

/** Daglig smerte (høyeste måling per dag) siste N dager, eldst først. */
export async function getPainTrend(clientId: string, days = 30): Promise<PainPoint[]> {
  const since = daysAgoISO(days);
  const [pain, checkins] = await Promise.all([
    supabase
      .from("pain_entries")
      .select("entry_date, intensity")
      .eq("client_id", clientId)
      .gte("entry_date", since),
    supabase
      .from("daily_checkins")
      .select("checkin_date, pain_now")
      .eq("client_id", clientId)
      .gte("checkin_date", since),
  ]);
  if (pain.error) throw pain.error;
  if (checkins.error) throw checkins.error;

  const byDate = new Map<string, number>();
  for (const r of pain.data ?? []) {
    if (r.intensity == null) continue;
    const prev = byDate.get(r.entry_date);
    if (prev == null || r.intensity > prev) byDate.set(r.entry_date, r.intensity);
  }
  for (const r of checkins.data ?? []) {
    if (r.pain_now == null) continue;
    byDate.set(r.checkin_date, r.pain_now);
  }

  return Array.from(byDate.entries())
    .map(([date, intensity]) => ({ date, intensity }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function getZoneCounts(clientId: string, days = 30): Promise<ZoneCounts> {
  const { data, error } = await supabase
    .from("zone_history")
    .select("zone")
    .eq("client_id", clientId)
    .gte("zone_date", daysAgoISO(days));
  if (error) throw error;

  const counts: ZoneCounts = { green: 0, yellow: 0, red: 0, total: 0 };
  for (const r of data ?? []) {
    counts[r.zone as Zone] += 1;
    counts.total += 1;
  }
  return counts;
}

export async function getAdherence(clientId: string, days = 14): Promise<Adherence> {
  const { data, error } = await supabase
    .from("workout_completions")
    .select("status")
    .eq("client_id", clientId)
    .gte("completion_date", daysAgoISO(days));
  if (error) throw error;

  const rows = data ?? [];
  return {
    logged: rows.length,
    completed: rows.filter((r) => r.status === "ja").length,
    windowDays: days,
  };
}

/**
 * Baseline (første) vs siste måling per test-metrikk. «Bedre» avhenger av
 * metrikken; her rapporterer vi bare prosentendringen.
 */
export async function getTestProgress(clientId: string): Promise<TestProgressRow[]> {
  const { data: sessions, error: sErr } = await supabase
    .from("test_sessions")
    .select("id, category, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (sErr) throw sErr;
  if (!sessions || sessions.length === 0) return [];

  const ids = sessions.map((s) => s.id);
  const catById = new Map(sessions.map((s) => [s.id, s.category as string]));

  const { data: entries, error: eErr } = await supabase
    .from("test_entries")
    .select("session_id, metric_key, value")
    .in("session_id", ids);
  if (eErr) throw eErr;

  // per metric: first and last value by session order
  const sessionOrder = new Map(sessions.map((s, i) => [s.id, i]));
  const byMetric = new Map<string, { category: string; first?: { i: number; v: number }; last?: { i: number; v: number } }>();

  for (const e of entries ?? []) {
    if (e.value == null) continue;
    const i = sessionOrder.get(e.session_id) ?? 0;
    const cat = catById.get(e.session_id) ?? "";
    const m = byMetric.get(e.metric_key) ?? { category: cat };
    if (!m.first || i < m.first.i) m.first = { i, v: e.value };
    if (!m.last || i > m.last.i) m.last = { i, v: e.value };
    byMetric.set(e.metric_key, m);
  }

  return Array.from(byMetric.entries()).map(([metric_key, m]) => {
    const baseline = m.first?.v ?? null;
    const latest = m.last?.v ?? null;
    const changePct =
      baseline != null && latest != null && baseline !== 0
        ? Math.round(((latest - baseline) / baseline) * 100)
        : null;
    return { metric_key, category: m.category, baseline, latest, changePct };
  });
}
