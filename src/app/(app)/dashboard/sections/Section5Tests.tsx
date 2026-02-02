// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section5Tests.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import {
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { useTestMetricsForClients } from "@/lib/metrics/useTestMetricsForClients";

type Role = "client" | "trainer" | "admin" | string;
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

const TOTAL_KEYS: Record<Category, string[]> = {
  bodyweight: ["knebøy", "pushups", "situps"],
  strength: ["knebøy", "markløft", "benkpress"],
  cardio: ["mølle", "sykkel", "roing", "ski"],
};

function safePct(baseline: number | null, latest: number | null) {
  if (baseline == null || latest == null) return null;
  if (baseline === 0) return null;
  return ((latest - baseline) / baseline) * 100;
}

function formatShort(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function sessionTotal(category: Category, entries: TestEntry[]): number {
  const allowed = new Set(TOTAL_KEYS[category] ?? []);
  const sum = entries
    .filter((e) => allowed.has(e.metric_key))
    .reduce((acc, e) => acc + Number(e.value ?? 0), 0);
  return Number.isFinite(sum) ? sum : 0;
}

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

export default function Section5Tests() {
  const { role, userId } = useRole() as { role: Role; userId: string | null };

  /* =========================
   * CLIENT: behold din logikk (ekte data)
   * ========================= */
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "client" || !userId) return;

    let alive = true;

    (async () => {
      setErr(null);

      const { data: s, error: sErr } = await supabase
        .from("test_sessions")
        .select("id, client_id, category, created_at")
        .eq("client_id", userId)
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
  }, [role, userId]);

  const clientCards = useMemo(() => {
    const build = (category: Category, href: string, title: string, subtitle: string) => {
      const catSessions = sessions.filter((x) => x.category === category);

      if (catSessions.length === 0) {
        return { href, title, subtitle, status: "—", lastAt: null as string | null };
      }

      const first = catSessions[0];
      const last = catSessions[catSessions.length - 1];

      const firstEntries = entriesBySession[first.id] ?? [];
      const lastEntries = entriesBySession[last.id] ?? [];

      const baseline = sessionTotal(category, firstEntries);
      const latest = sessionTotal(category, lastEntries);
      const pct = safePct(baseline, latest);

      const status = pct == null ? "—" : `${pct >= 0 ? "+" : ""}${Math.round(pct)}%`;

      return { href, title, subtitle, status, lastAt: last.created_at };
    };

    return [
      build("bodyweight", "/tests/bodyweight", "Egenvekt", "4 min (knebøy + armhevinger + situps + planke)"),
      build("strength", "/tests/strength", "Styrke", "1RM progresjon i baseøvelser"),
      build("cardio", "/tests/cardio", "Kondisjon", "4 min (distanse på apparat)"),
    ];
  }, [sessions, entriesBySession]);

  /* =========================
   * TRAINER/ADMIN: ekte counts via metrics-hook
   * ========================= */
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsError, setIdsError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      if (role !== "trainer" && role !== "admin") return;

      setIdsLoading(true);
      setIdsError(null);

      try {
        let q = supabase.from("profiles").select("id").eq("role", "client");
        if (role === "trainer") q = q.eq("trainer_id", userId);

        const { data, error } = await q;
        if (error) throw error;

        setClientIds((data ?? []).map((r: any) => r.id).filter(Boolean));
      } catch (e: any) {
        setIdsError(e?.message ?? "Ukjent feil");
        setClientIds([]);
      } finally {
        setIdsLoading(false);
      }
    };

    run();
  }, [role, userId]);

  const {
    loading: testsLoading,
    error: testsError,
    byClientId,
  } = useTestMetricsForClients({
    clientIds,
    inactiveDays: 30,
  });

  const trainerAdminStats = useMemo(() => {
    if (role !== "trainer" && role !== "admin") {
      return { missingBaseline: 0, inactive30: 0, negative: 0, positive: 0 };
    }

    let missingBaseline = 0;
    let inactive30 = 0;
    let negative = 0;
    let positive = 0;

    for (const cid of clientIds) {
      const m: any = byClientId?.[cid];

      // baseline missing
      const missingCats = (m?.missingCategories?.length ?? 0) > 0;
      if (!m || missingCats) missingBaseline++;

      // inactive
      if ((m?.daysSinceLastTest ?? 9999) > 30) inactive30++;

      // progress
      const pct = Number(m?.avgPct ?? 0);
      if (pct < 0) negative++;
      if (pct > 0) positive++;
    }

    return { missingBaseline, inactive30, negative, positive };
  }, [role, clientIds, byClientId]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Tester & fremgang</h2>

      {/* CLIENT */}
      {role === "client" && (
        <>
          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientCards.map((c) => (
              <Link key={c.title} href={c.href} className="block">
                <DashboardCard title={c.title} icon={<Activity size={18} />} status={c.status}>
                  <p className="text-sm text-sf-muted">{c.subtitle}</p>
                  <p className="text-xs text-sf-muted">Sist testet: {formatShort(c.lastAt)}</p>

                  <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80] hover:opacity-90 transition">
                    Åpne {c.title.toLowerCase()}
                  </div>
                </DashboardCard>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* TRAINER + ADMIN */}
      {(role === "trainer" || role === "admin") && (
        <>
          {(idsError || testsError) ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Test-feil: {idsError ?? testsError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/clients?filter=baseline-missing">
              <DashboardCard
                title="Mangler baseline"
                status={statusLabel(trainerAdminStats.missingBaseline, idsLoading || testsLoading)}
                icon={<AlertTriangle size={18} />}
                variant="warning"
              >
                <p className="text-sm">Klienter som mangler tester i én eller flere kategorier.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=inactive-tests">
              <DashboardCard
                title="Ikke testet siste 30 dager"
                status={statusLabel(trainerAdminStats.inactive30, idsLoading || testsLoading)}
                icon={<Users size={18} />}
                variant="info"
              >
                <p className="text-sm">Kan trenge ny vurdering og motivasjon.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=negative-progress">
              <DashboardCard
                title="Negativ progresjon"
                status={statusLabel(trainerAdminStats.negative, idsLoading || testsLoading)}
                icon={<TrendingDown size={18} />}
                variant="danger"
              >
                <p className="text-sm">Sjekk søvn, smerte, stress og totalbelastning.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=positive-progress">
              <DashboardCard
                title="Positiv progresjon"
                status={statusLabel(trainerAdminStats.positive, idsLoading || testsLoading)}
                icon={<TrendingUp size={18} />}
                variant="success"
              >
                <p className="text-sm">Bra signal: kontinuitet + metodikk fungerer.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}