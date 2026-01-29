// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

import Section1TestsTabs from "./sections/Section1TestsTabs";
import Section2BodyweightSummary from "./sections/Section2BodyweightSummary";
import Section3StrengthSummary from "./sections/Section3StrengthSummary";
import Section4CardioSummary from "./sections/Section4CardioSummary";

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

type Summary = {
  category: Category;
  baselineValue: number | null;
  latestValue: number | null;
  baselineAt: string | null;
  latestAt: string | null;
  deltaPct: number | null;
  unitLabel: string;
};

function fmtDateRange(a: string | null, b: string | null) {
  if (!a && !b) return "Ingen tester enda";

  const da = a ? new Date(a) : null;
  const db = b ? new Date(b) : null;

  const fmt = (d: Date) =>
    d.toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (da && db) return `${fmt(da)} – ${fmt(db)}`;
  if (db) return `Siste: ${fmt(db)}`;
  if (da) return `Første: ${fmt(da)}`;
  return "Ingen tester enda";
}

function safePct(baseline: number | null, latest: number | null) {
  if (baseline == null || latest == null) return null;
  if (baseline === 0) return null;
  return ((latest - baseline) / baseline) * 100;
}

/**
 * “Safe” totalsum per kategori (for oversiktskort).
 * NB: Bodyweight ekskluderer planke for å unngå at en pause-teller / tid-logikk ødelegger totalsummen.
 */
const TOTAL_KEYS: Record<Category, string[]> = {
  bodyweight: ["knebøy", "pushups", "situps"],
  strength: ["knebøy", "markløft", "benkpress"],
  cardio: ["mølle", "sykkel", "roing", "ski"],
};

function sessionTotal(category: Category, entries: TestEntry[]): number {
  const allowed = new Set(TOTAL_KEYS[category] ?? []);
  const sum = entries
    .filter((e) => allowed.has(e.metric_key))
    .reduce((acc, e) => acc + Number(e.value ?? 0), 0);

  return Number.isFinite(sum) ? sum : 0;
}

export default function TestsPage() {
  const router = useRouter();
  const { userId, role, loading } = useRole();

  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !userId) return;

    let alive = true;

    (async () => {
      setErr(null);

      const clientId = userId;

      const { data: s, error: sErr } = await supabase
        .from("test_sessions")
        .select("id, client_id, category, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (!alive) return;

      if (sErr) {
        setErr(sErr.message);
        setSessions([]);
        setEntriesBySession({});
        return;
      }

      const list = (s ?? []) as TestSession[];
      setSessions(list);

      if (list.length === 0) {
        setEntriesBySession({});
        return;
      }

      const ids = list.map((x) => x.id);

      const { data: e, error: eErr } = await supabase
        .from("test_entries")
        .select("id, session_id, metric_key, value, unit, sort")
        .in("session_id", ids)
        .order("sort", { ascending: true });

      if (!alive) return;

      if (eErr) {
        setErr(eErr.message);
        setEntriesBySession({});
        return;
      }

      const map: Record<string, TestEntry[]> = {};
      for (const row of (e ?? []) as any[]) {
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
    })();

    return () => {
      alive = false;
    };
  }, [loading, userId]);

  const summaries = useMemo(() => {
    const build = (category: Category, unitLabel: string): Summary => {
      const catSessions = sessions.filter((x) => x.category === category);
      if (catSessions.length === 0) {
        return {
          category,
          baselineValue: null,
          latestValue: null,
          baselineAt: null,
          latestAt: null,
          deltaPct: null,
          unitLabel,
        };
      }

      const first = catSessions[0];
      const last = catSessions[catSessions.length - 1];

      const firstEntries = entriesBySession[first.id] ?? [];
      const lastEntries = entriesBySession[last.id] ?? [];

      const baselineValue = sessionTotal(category, firstEntries);
      const latestValue = sessionTotal(category, lastEntries);

      return {
        category,
        baselineValue,
        latestValue,
        baselineAt: first.created_at,
        latestAt: last.created_at,
        deltaPct: safePct(baselineValue, latestValue),
        unitLabel,
      };
    };

    return {
      bodyweight: build("bodyweight", "reps"),
      strength: build("strength", "kg"),
      cardio: build("cardio", "m"),
    };
  }, [sessions, entriesBySession]);

  const canSee = role === "client" || role === "trainer" || role === "admin";
  if (loading) return null;
  if (!canSee) return null;

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          {/* ✅ Info-seksjon (collapsible) */}
          <Section1TestsTabs />

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <Section2BodyweightSummary
            periodLabel={fmtDateRange(
              summaries.bodyweight.baselineAt,
              summaries.bodyweight.latestAt
            )}
            baseline={summaries.bodyweight.baselineValue}
            latest={summaries.bodyweight.latestValue}
            deltaPct={summaries.bodyweight.deltaPct}
            unitLabel={summaries.bodyweight.unitLabel}
            onOpen={() => router.push("/tests/bodyweight")}
          />

          <Section3StrengthSummary
            periodLabel={fmtDateRange(
              summaries.strength.baselineAt,
              summaries.strength.latestAt
            )}
            baseline={summaries.strength.baselineValue}
            latest={summaries.strength.latestValue}
            deltaPct={summaries.strength.deltaPct}
            unitLabel={summaries.strength.unitLabel}
            onOpen={() => router.push("/tests/strength")}
          />

          <Section4CardioSummary
            periodLabel={fmtDateRange(summaries.cardio.baselineAt, summaries.cardio.latestAt)}
            baseline={summaries.cardio.baselineValue}
            latest={summaries.cardio.latestValue}
            deltaPct={summaries.cardio.deltaPct}
            unitLabel={summaries.cardio.unitLabel}
            onOpen={() => router.push("/tests/cardio")}
          />
        </div>
      </AppPage>
    </main>
  );
}