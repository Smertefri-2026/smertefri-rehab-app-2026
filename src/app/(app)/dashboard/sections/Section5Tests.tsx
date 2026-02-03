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
  CheckCircle2,
  LineChart,
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

function MaybeLink({
  enabled,
  href,
  children,
}: {
  enabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return <div className="cursor-default">{children}</div>;
  }
  return (
    <Link href={href} className="block">
      {children}
    </Link>
  );
}

function fullNameFromRow(r: any) {
  const n = `${r?.first_name ?? ""} ${r?.last_name ?? ""}`.trim();
  return n || "—";
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
   * TRAINER/ADMIN: metrics + navn
   * ========================= */
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsError, setIdsError] = useState<string | null>(null);

  const [nameById, setNameById] = useState<Record<string, string>>({});

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

        const ids = (data ?? []).map((r: any) => r.id).filter(Boolean);
        setClientIds(ids);
      } catch (e: any) {
        setIdsError(e?.message ?? "Ukjent feil");
        setClientIds([]);
      } finally {
        setIdsLoading(false);
      }
    };

    run();
  }, [role, userId]);

  // hent navn til innsikt-listene (ingen SQL, kun select)
  useEffect(() => {
    const run = async () => {
      if (role !== "trainer" && role !== "admin") return;
      if (clientIds.length === 0) {
        setNameById({});
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", clientIds)
          .limit(1000);

        if (error) throw error;

        const map: Record<string, string> = {};
        for (const r of (data ?? []) as any[]) {
          map[String(r.id)] = fullNameFromRow(r);
        }
        setNameById(map);
      } catch {
        setNameById({});
      }
    };

    run();
  }, [role, clientIds]);

  const { loading: testsLoading, error: testsError, byClientId } = useTestMetricsForClients({
    clientIds,
    inactiveDays: 30,
  });

  const trainerAdminStats = useMemo(() => {
    if (role !== "trainer" && role !== "admin") {
      return { missingBaseline: 0, inactive30: 0, negative: 0 };
    }

    let missingBaseline = 0;
    let inactive30 = 0;
    let negative = 0;

    for (const cid of clientIds) {
      const m: any = byClientId?.[cid];

      const missingCats = (m?.missingCategories?.length ?? 0) > 0;
      if (!m || missingCats) missingBaseline++;

      if ((m?.daysSinceLastTest ?? 9999) > 30) inactive30++;

      const pct = Number(m?.avgPct);
      if (Number.isFinite(pct) && pct < 0) negative++;
    }

    return { missingBaseline, inactive30, negative };
  }, [role, clientIds, byClientId]);

  /**
   * Trend-kort: gjør tekst/labels identisk med Section4Pain
   * Vi bruker eksisterende test-metrics:
   * - deltaProxy = pct (avgPct)  -> vises som “delta”
   * - Oppdatert (14d): daysSince <= 14
   * - Bedre: pct > 0
   * - Verre: pct < 0
   * - Best/Dårligst: sort på pct
   */
  const trend = useMemo(() => {
    if (role !== "trainer" && role !== "admin") return null;

    const items = clientIds
      .map((cid) => {
        const m: any = byClientId?.[cid];
        const pct = Number(m?.avgPct);
        const daysSince = Number(m?.daysSinceLastTest);
        const missingCats = (m?.missingCategories?.length ?? 0) > 0;

        // må ha baseline + meningsfull pct
        if (!m || !Number.isFinite(pct) || missingCats) return null;

        return {
          cid,
          name: nameById[cid] ?? cid.slice(0, 8),
          delta: pct, // proxy
          daysSince: Number.isFinite(daysSince) ? daysSince : null,
        };
      })
      .filter(Boolean) as Array<{
      cid: string;
      name: string;
      delta: number;
      daysSince: number | null;
    }>;

    const recent14 = items.filter((x) => x.daysSince != null && x.daysSince <= 14);

    const betterCount = recent14.filter((x) => x.delta > 0).length;
    const worseCount = recent14.filter((x) => x.delta < 0).length;

    const avgDelta =
      recent14.length > 0
        ? recent14.reduce((acc, x) => acc + x.delta, 0) / recent14.length
        : null;

    const best = [...items].sort((a, b) => b.delta - a.delta).slice(0, 3);
    const worst = [...items].sort((a, b) => a.delta - b.delta).slice(0, 3);

    return {
      recent14Count: recent14.length,
      eligibleCount: items.length,
      betterCount,
      worseCount,
      avgDelta,
      best,
      worst,
    };
  }, [role, clientIds, byClientId, nameById]);

  const ready = (role === "trainer" || role === "admin") ? !idsLoading && !testsLoading : true;

  const showBaseline = !ready || trainerAdminStats.missingBaseline > 0;
  const showInactive = !ready || trainerAdminStats.inactive30 > 0;
  const showNegative = !ready || trainerAdminStats.negative > 0;

  const allOkTrainerAdmin =
    (role === "trainer" || role === "admin") &&
    ready &&
    trainerAdminStats.missingBaseline === 0 &&
    trainerAdminStats.inactive30 === 0 &&
    trainerAdminStats.negative === 0 &&
    !idsError &&
    !testsError;

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
            {/* ✅ Alt OK-kort */}
            {allOkTrainerAdmin ? (
              <DashboardCard
                title="Alle kunder er oppdatert"
                icon={<CheckCircle2 size={18} />}
                variant="success"
                status="✓"
              >
                <p className="text-sm">Ingen test-varsler akkurat nå.</p>
                <p className="mt-2 text-xs text-sf-muted">Se trend / best / dårligst i Trend-kortet.</p>
              </DashboardCard>
            ) : null}

            {/* Mangler baseline */}
            {showBaseline ? (
              <MaybeLink enabled={ready && trainerAdminStats.missingBaseline > 0} href="/clients?filter=baseline-missing">
                <DashboardCard
                  title="Mangler baseline"
                  status={statusLabel(trainerAdminStats.missingBaseline, idsLoading || testsLoading)}
                  icon={<AlertTriangle size={18} />}
                  variant="warning"
                >
                  <p className="text-sm">Klienter som mangler tester i én eller flere kategorier.</p>
                  <p className="text-xs text-sf-muted mt-2">
                    {ready && trainerAdminStats.missingBaseline > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* Inaktiv 30d */}
            {showInactive ? (
              <MaybeLink enabled={ready && trainerAdminStats.inactive30 > 0} href="/clients?filter=inactive-tests">
                <DashboardCard
                  title="Ikke testet siste 30 dager"
                  status={statusLabel(trainerAdminStats.inactive30, idsLoading || testsLoading)}
                  icon={<Users size={18} />}
                  variant="info"
                >
                  <p className="text-sm">Kan trenge ny vurdering og motivasjon.</p>
                  <p className="text-xs text-sf-muted mt-2">
                    {ready && trainerAdminStats.inactive30 > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* Negativ progresjon */}
            {showNegative ? (
              <MaybeLink enabled={ready && trainerAdminStats.negative > 0} href="/clients?filter=negative-progress">
                <DashboardCard
                  title="Negativ progresjon"
                  status={statusLabel(trainerAdminStats.negative, idsLoading || testsLoading)}
                  icon={<TrendingDown size={18} />}
                  variant="danger"
                >
                  <p className="text-sm">Sjekk søvn, smerte, stress og totalbelastning.</p>
                  <p className="text-xs text-sf-muted mt-2">
                    {ready && trainerAdminStats.negative > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* 📈 Trend (14 dager) – tekst/labels identisk med Section4Pain */}
            <DashboardCard title="Trend (14 dager)" icon={<LineChart size={18} />} variant="info">
              {!ready ? (
                <p className="text-sm text-sf-muted">Laster…</p>
              ) : !trend ? (
                <p className="text-sm text-sf-muted">—</p>
              ) : trend.eligibleCount === 0 ? (
                <p className="text-sm text-sf-muted">Ingen testdata til å beregne trend ennå.</p>
              ) : trend.recent14Count === 0 ? (
                <p className="text-sm text-sf-muted">Ingen oppdaterte tester siste 14 dager.</p>
              ) : (
                <>
                  <p className="text-sm">
                    Oppdatert (14d): <span className="font-medium">{trend.recent14Count}</span>
                    {trend.avgDelta == null ? null : (
                      <>
                        {" "}
                        • Snitt delta:{" "}
                        <span className="font-medium">
                          {trend.avgDelta >= 0 ? "+" : ""}
                          {trend.avgDelta.toFixed(1)}
                        </span>
                      </>
                    )}
                  </p>

                  <p className="mt-2 text-xs text-sf-muted">
                    Bedre: {trend.betterCount} • Verre: {trend.worseCount}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <TrendingUp size={14} /> Best
                      </p>
                      <ul className="mt-1 space-y-1 text-sf-muted">
                        {trend.best.length === 0 ? (
                          <li>—</li>
                        ) : (
                          trend.best.map((x) => (
                            <li key={x.cid} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta >= 0 ? "+" : ""}
                                {x.delta.toFixed(1)}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <TrendingDown size={14} /> Dårligst
                      </p>
                      <ul className="mt-1 space-y-1 text-sf-muted">
                        {trend.worst.length === 0 ? (
                          <li>—</li>
                        ) : (
                          trend.worst.map((x) => (
                            <li key={x.cid} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta >= 0 ? "+" : ""}
                                {x.delta.toFixed(1)}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-sf-muted">
                    Delta = snitt(siste 7 dager) − snitt(forrige 7). Negativ = bedre.
                  </p>
                </>
              )}
            </DashboardCard>
          </div>
        </>
      )}
    </section>
  );
}