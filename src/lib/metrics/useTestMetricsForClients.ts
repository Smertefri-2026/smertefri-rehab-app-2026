"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Category = "bodyweight" | "strength" | "cardio";

type TestSession = {
  id: string;
  client_id: string;
  category: Category;
  created_at: string;
};

type TestEntry = {
  id: string;
  session_id: string;
  metric_key: string;
  value: number;
  unit: string | null;
  sort: number;
};

export type ClientTestMetrics = {
  clientId: string;
  lastTestAt: string | null;
  daysSinceLastTest: number | null;

  missingCategories: Category[];
  avgPct: number | null;

  anyNegative: boolean;
  anyPositive: boolean;
};

export type TestMetricsResult = {
  loading: boolean;
  error: string | null;

  byClientId: Record<string, ClientTestMetrics>;

  stats: {
    missingBaseline: number;
    inactive30: number;
    negative: number;
    positive: number;
    totalClients: number;
  };
};

const CATEGORIES: Category[] = ["bodyweight", "strength", "cardio"];

const TOTAL_KEYS: Record<Category, string[]> = {
  bodyweight: ["knebøy", "pushups", "situps"], // ekskluder planke fra sum
  strength: ["knebøy", "markløft", "benkpress"],
  cardio: ["mølle", "sykkel", "roing", "ski"],
};

function safePct(baseline: number | null, latest: number | null) {
  if (baseline == null || latest == null) return null;
  if (baseline === 0) return null;
  return ((latest - baseline) / baseline) * 100;
}

function sessionTotal(category: Category, entries: TestEntry[]): number {
  const allowed = new Set(TOTAL_KEYS[category] ?? []);
  const sum = entries
    .filter((e) => allowed.has(e.metric_key))
    .reduce((acc, e) => acc + Number(e.value ?? 0), 0);
  return Number.isFinite(sum) ? sum : 0;
}

function daysAgo(ts: string | null) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Gjenbrukbar hook for test-metrics på klientliste.
 * - Henter test_sessions + test_entries for clientIds
 * - Beregner per-klient baseline-missing / inactive / avgPct / etc.
 */
export function useTestMetricsForClients(args: {
  clientIds: string[];
  inactiveDays?: number; // default 30
  // role/userId brukes ikke her per nå (vi regner med clientIds allerede er filtrert for trener)
  // men vi beholder signaturen om du vil utvide senere.
  role?: string;
  userId?: string | null;
}): TestMetricsResult {
  const { clientIds, inactiveDays = 30 } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError(null);

        if (!clientIds?.length) {
          setSessions([]);
          setEntriesBySession({});
          return;
        }

        setLoading(true);

        // 1) sessions for clientIds
        const { data: sData, error: sErr } = await supabase
          .from("test_sessions")
          .select("id, client_id, category, created_at")
          .in("client_id", clientIds)
          .order("created_at", { ascending: true });

        if (sErr) throw sErr;

        if (!alive) return;
        const sList = (sData ?? []) as TestSession[];
        setSessions(sList);

        if (!sList.length) {
          setEntriesBySession({});
          return;
        }

        // 2) entries for these sessions
        const sessionIds = sList.map((s) => s.id);

        const { data: eData, error: eErr } = await supabase
          .from("test_entries")
          .select("id, session_id, metric_key, value, unit, sort")
          .in("session_id", sessionIds)
          .order("sort", { ascending: true });

        if (eErr) throw eErr;

        if (!alive) return;

        const map: Record<string, TestEntry[]> = {};
        for (const row of (eData ?? []) as any[]) {
          const sid = row.session_id as string;
          if (!map[sid]) map[sid] = [];
          map[sid].push({
            id: row.id,
            session_id: row.session_id,
            metric_key: row.metric_key,
            value: Number(row.value),
            unit: row.unit ?? null,
            sort: Number(row.sort ?? 0),
          });
        }
        setEntriesBySession(map);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Ukjent feil");
        setSessions([]);
        setEntriesBySession({});
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clientIds.join("|"), inactiveDays]);

  const byClientId = useMemo(() => {
    const out: Record<string, ClientTestMetrics> = {};

    // group sessions per client + category
    const byClientCat: Record<string, Record<Category, TestSession[]>> = {};
    for (const s of sessions) {
      if (!byClientCat[s.client_id]) {
        byClientCat[s.client_id] = { bodyweight: [], strength: [], cardio: [] };
      }
      byClientCat[s.client_id][s.category].push(s);
    }

    for (const cid of clientIds) {
      const perCat = byClientCat[cid] ?? { bodyweight: [], strength: [], cardio: [] };

      const allSess = [...perCat.bodyweight, ...perCat.strength, ...perCat.cardio];
      const lastTestAt = allSess.length ? allSess[allSess.length - 1].created_at : null;

      const missingCategories = CATEGORIES.filter((cat) => (perCat[cat]?.length ?? 0) === 0);

      const pcts: number[] = [];
      let anyNegative = false;
      let anyPositive = false;

      for (const cat of CATEGORIES) {
        const list = perCat[cat] ?? [];
        if (list.length < 2) continue;

        const first = list[0];
        const last = list[list.length - 1];

        const firstEntries = entriesBySession[first.id] ?? [];
        const lastEntries = entriesBySession[last.id] ?? [];

        const baseline = sessionTotal(cat, firstEntries);
        const latest = sessionTotal(cat, lastEntries);
        const pct = safePct(baseline, latest);

        if (pct == null) continue;
        pcts.push(pct);

        if (pct < 0) anyNegative = true;
        if (pct > 0) anyPositive = true;
      }

      const avgPct = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;

      out[cid] = {
        clientId: cid,
        lastTestAt,
        daysSinceLastTest: daysAgo(lastTestAt),
        missingCategories,
        avgPct,
        anyNegative,
        anyPositive,
      };
    }

    return out;
  }, [sessions, entriesBySession, clientIds.join("|")]);

  const stats = useMemo(() => {
    const totalClients = clientIds.length;

    let missingBaseline = 0;
    let inactive30 = 0;
    let negative = 0;
    let positive = 0;

    for (const cid of clientIds) {
      const m = byClientId[cid];

      // Missing baseline: mangler minst én kategori eller ingen data
      if (!m || (m.missingCategories?.length ?? 0) > 0) missingBaseline++;

      // Inactive: ingen test eller eldre enn inactiveDays
      const d = m?.daysSinceLastTest;
      if (d == null || d > inactiveDays) inactive30++;

      if ((m?.avgPct ?? 0) < 0) negative++;
      if ((m?.avgPct ?? 0) > 0) positive++;
    }

    return { missingBaseline, inactive30, negative, positive, totalClients };
  }, [byClientId, clientIds.join("|"), inactiveDays]);

  return { loading, error, byClientId, stats };
}