// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section4Pain.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { usePain } from "@/stores/pain.store";

import {
  HeartPulse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  LineChart,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { usePainMetricsForClients } from "@/lib/metrics/usePainMetricsForClients";

/* ---------------- helpers ---------------- */

function isoFromEntry(e: any) {
  const raw = (e?.entry_date ?? e?.created_at ?? "") as string;
  return raw ? raw.slice(0, 10) : "";
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function avg(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

function nameOfProfile(p: any) {
  const n = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
  return n || "—";
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

/* ---------------- types ---------------- */

type RankedRow = {
  id: string;
  name: string;
  avgLast7: number | null;
  avgPrev7: number | null;
  delta: number | null; // last7 - prev7 (negativ = bedre)
};

type TrendMeta = {
  eligibleCount: number; // de som har delta (altså både last7 og prev7)
  recent14Count: number; // de som har noe data i 14d
  betterCount: number; // delta < 0
  worseCount: number; // delta > 0
  avgDelta: number | null;
};

/* ---------------- component ---------------- */

export default function Section4Pain() {
  const { role, userId } = useRole();

  // CLIENT: bruker pain-store
  const { entries, loading: painLoading, fetchForClient } = usePain();

  useEffect(() => {
    if (role !== "client") return;
    if (!userId) return;
    fetchForClient(userId);
  }, [role, userId, fetchForClient]);

  const activeLatest = useMemo(() => {
    const map = new Map<string, any>();
    for (const e of entries) {
      if (!e?.is_active) continue;

      const prev = map.get(e.area_key);
      if (!prev) {
        map.set(e.area_key, e);
        continue;
      }

      const a = (e.entry_date ?? e.created_at) as string;
      const b = (prev.entry_date ?? prev.created_at) as string;
      if (a > b) map.set(e.area_key, e);
    }
    return Array.from(map.values());
  }, [entries]);

  const avg14 = useMemo(() => {
    const fromISO = daysAgoISO(13);
    const relevant = entries
      .filter((e) => e?.is_active)
      .filter((e) => isoFromEntry(e) >= fromISO)
      .map((e) => Number(e.intensity))
      .filter((v) => Number.isFinite(v));

    const a = avg(relevant);
    return a == null ? null : a;
  }, [entries]);

  const activeLabels = useMemo(() => {
    return activeLatest
      .map((e) => e.area_label)
      .filter(Boolean)
      .slice(0, 2);
  }, [activeLatest]);

  // TRAINER/ADMIN: finn klient-ids
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsError, setIdsError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!role) return;
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

  // Metrics hook (samme som clients page)
  const { loading: metricsLoading, error: metricsError, stats } = usePainMetricsForClients({
    clientIds,
    highThreshold: 7,
    staleDays: 10,
  });

  const highCount = (stats as any)?.high ?? 0;
  const upCount = (stats as any)?.up ?? 0;
  const staleCount = (stats as any)?.stale ?? 0;

  const ready = role === "trainer" || role === "admin" ? !idsLoading && !metricsLoading : true;

  // ✅ Skjul OK-kort for trainer/admin når ferdig lastet
  const showHigh = !ready || highCount > 0;
  const showUp = !ready || upCount > 0;
  const showStale = !ready || staleCount > 0;

  const allOkTrainerAdmin =
    (role === "trainer" || role === "admin") &&
    ready &&
    highCount === 0 &&
    upCount === 0 &&
    staleCount === 0 &&
    !idsError &&
    !metricsError;

  /* --------- Trend (14 dager): Best / Dårligst i samme design som Section5 --------- */
  const [rankLoading, setRankLoading] = useState(false);
  const [rankErr, setRankErr] = useState<string | null>(null);
  const [best, setBest] = useState<RankedRow[]>([]);
  const [worst, setWorst] = useState<RankedRow[]>([]);
  const [trendMeta, setTrendMeta] = useState<TrendMeta>({
    eligibleCount: 0,
    recent14Count: 0,
    betterCount: 0,
    worseCount: 0,
    avgDelta: null,
  });

  useEffect(() => {
    const run = async () => {
      if (!(role === "trainer" || role === "admin")) return;
      if (!ready) return;

      if (!clientIds.length) {
        setBest([]);
        setWorst([]);
        setTrendMeta({
          eligibleCount: 0,
          recent14Count: 0,
          betterCount: 0,
          worseCount: 0,
          avgDelta: null,
        });
        return;
      }

      setRankLoading(true);
      setRankErr(null);

      try {
        const from14 = daysAgoISO(13);
        const from7 = daysAgoISO(6);

        // 1) Hent navn
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", clientIds);

        if (pErr) throw pErr;

        const nameMap = new Map<string, string>();
        for (const p of profs ?? []) {
          nameMap.set(String((p as any).id), nameOfProfile(p));
        }

        // 2) Hent smerterader siste 14 dager
        // NB: vi filtrerer med created_at, men bruker isoFromEntry for å støtte entry_date også
        const { data: rows, error: rErr } = await supabase
          .from("pain_entries")
          .select("client_id, intensity, entry_date, created_at, is_active")
          .in("client_id", clientIds)
          .eq("is_active", true)
          .gte("created_at", `${from14}T00:00:00.000Z`)
          .limit(5000);

        if (rErr) throw rErr;

        // group per client → last7 / prev7 avg
        const per = new Map<string, { last7: number[]; prev7: number[] }>();
        for (const r of rows ?? []) {
          const cid = String((r as any).client_id ?? "");
          if (!cid) continue;

          const day = isoFromEntry(r);
          if (!day) continue;
          if (day < from14) continue;

          const v = Number((r as any).intensity);
          if (!Number.isFinite(v)) continue;

          if (!per.has(cid)) per.set(cid, { last7: [], prev7: [] });

          if (day >= from7) per.get(cid)!.last7.push(v);
          else per.get(cid)!.prev7.push(v);
        }

        const list: RankedRow[] = Array.from(per.entries()).map(([id, g]) => {
          const aLast = g.last7.length ? avg(g.last7) : null;
          const aPrev = g.prev7.length ? avg(g.prev7) : null;
          const delta = aLast != null && aPrev != null ? aLast - aPrev : null;

          return {
            id,
            name: nameMap.get(id) ?? "—",
            avgLast7: aLast,
            avgPrev7: aPrev,
            delta,
          };
        });

        const withDelta = list.filter((x) => x.delta != null) as RankedRow[];

        const betterCount = withDelta.filter((x) => (x.delta as number) < 0).length;
        const worseCount = withDelta.filter((x) => (x.delta as number) > 0).length;

        const avgDelta =
          withDelta.length > 0
            ? withDelta.reduce((acc, x) => acc + Number(x.delta ?? 0), 0) / withDelta.length
            : null;

        // Best = mest negativ delta (bedre), Worst = mest positiv delta (verre)
        const best3 = [...withDelta].sort((a, b) => Number(a.delta) - Number(b.delta)).slice(0, 3);
        const worst3 = [...withDelta].sort((a, b) => Number(b.delta) - Number(a.delta)).slice(0, 3);

        setBest(best3);
        setWorst(worst3);
        setTrendMeta({
          eligibleCount: withDelta.length,
          recent14Count: per.size,
          betterCount,
          worseCount,
          avgDelta: avgDelta == null ? null : Number(avgDelta),
        });
      } catch (e: any) {
        setRankErr(e?.message ?? "Ukjent feil");
        setBest([]);
        setWorst([]);
        setTrendMeta({
          eligibleCount: 0,
          recent14Count: 0,
          betterCount: 0,
          worseCount: 0,
          avgDelta: null,
        });
      } finally {
        setRankLoading(false);
      }
    };

    run();
  }, [role, ready, clientIds]);

  if (!role) return null;

  // ✅ FIX: Client får 3 kolonner på lg (samme som Section5/6)
  // Trainer/Admin beholder 4 kolonner (inkl Trend-kortet)
  const gridClass =
    role === "trainer" || role === "admin"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Smerte & helselogg</h2>

      <div className={gridClass}>
        {/* ======================= CLIENT ======================= */}
        {role === "client" && (
          <>
            <Link href="/pain" className="block">
              <DashboardCard title="Aktive smerteområder" icon={<HeartPulse size={18} />}>
                <p className="text-lg font-semibold">
                  {painLoading ? "Laster…" : `${activeLatest.length} ${activeLatest.length === 1 ? "område" : "områder"}`}
                </p>
                <p className="text-xs text-sf-muted">
                  {activeLabels.length
                    ? activeLabels.join(" og ") + (activeLatest.length > 2 ? " …" : "")
                    : "Trykk for å åpne smertejournal"}
                </p>
              </DashboardCard>
            </Link>

            <Link href="/pain" className="block">
              <DashboardCard title="Snitt smerteintensitet" icon={<TrendingDown size={18} />} variant="info">
                <p className="text-lg font-semibold">
                  {painLoading ? "Laster…" : avg14 == null ? "—" : `${avg14.toFixed(1)} / 10`}
                </p>
                <p className="text-xs text-sf-muted">
                  {avg14 == null ? "Ingen data siste 14 dager" : "Basert på aktive registreringer siste 14 dager"}
                </p>
              </DashboardCard>
            </Link>

            <Link href="/pain" className="block">
              <DashboardCard title="Oppdater smerte" icon={<HeartPulse size={18} />}>
                <p className="text-sm text-sf-muted">Registrer dagens smerte (og se utvikling over tid).</p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne smertejournal
                </p>
              </DashboardCard>
            </Link>
          </>
        )}

        {/* ======================= TRAINER + ADMIN ======================= */}
        {(role === "trainer" || role === "admin") && (
          <>
            {/* ✅ Hvis alt er OK: vis ett grønt kort */}
            {allOkTrainerAdmin ? (
              <DashboardCard
                title="Alle kunder er oppdatert"
                icon={<CheckCircle2 size={18} />}
                variant="success"
                status="✓"
              >
                <p className="text-sm">Ingen kunder krever smerte-oppfølging akkurat nå.</p>
                <p className="mt-2 text-xs text-sf-muted">Se trend / best / dårligst i Trend-kortet.</p>
              </DashboardCard>
            ) : null}

            {/* ✅ Vis bare kort som faktisk har noe å følge opp */}
            {showHigh ? (
              <MaybeLink enabled={!ready || highCount > 0} href="/clients?pain=high">
                <DashboardCard
                  title="Høy smerte"
                  icon={<AlertTriangle size={18} />}
                  variant="danger"
                  status={statusLabel(highCount, idsLoading || metricsLoading)}
                >
                  <p className="text-xs text-sf-muted">Klienter med høy smerte (≥ 7).</p>
                  <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                    {!ready || highCount > 0 ? "Åpne kunder" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {showUp ? (
              <MaybeLink enabled={!ready || upCount > 0} href="/clients?pain=up">
                <DashboardCard
                  title="Økende smerte"
                  icon={<TrendingUp size={18} />}
                  variant="warning"
                  status={statusLabel(upCount, idsLoading || metricsLoading)}
                >
                  <p className="text-xs text-sf-muted">Klienter med økende trend.</p>
                  <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                    {!ready || upCount > 0 ? "Åpne kunder" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {showStale ? (
              <MaybeLink enabled={!ready || staleCount > 0} href="/clients?pain=stale">
                <DashboardCard
                  title="Mangler smertejournal"
                  icon={<Users size={18} />}
                  status={statusLabel(staleCount, idsLoading || metricsLoading)}
                >
                  <p className="text-xs text-sf-muted">Ingen oppdatering siste 10 dager.</p>
                  <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                    {!ready || staleCount > 0 ? "Åpne kunder" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* 📈 Trend – samme “design” som Section5 */}
            <DashboardCard title="Trend (14 dager)" icon={<LineChart size={18} />} variant="info">
              {!ready || rankLoading ? (
                <p className="text-sm text-sf-muted">{!ready ? "Laster…" : "Laster trend…"}</p>
              ) : rankErr ? (
                <p className="text-sm text-red-600">Trend-feil: {rankErr}</p>
              ) : trendMeta.recent14Count === 0 ? (
                <p className="text-sm text-sf-muted">Ingen smerte-data siste 14 dager.</p>
              ) : trendMeta.eligibleCount === 0 ? (
                <p className="text-sm text-sf-muted">Ikke nok data til å sammenligne siste 7 vs forrige 7.</p>
              ) : (
                <>
                  <p className="text-sm">
                    Oppdatert (14d): <span className="font-medium">{trendMeta.recent14Count}</span>
                    {trendMeta.avgDelta == null ? null : (
                      <>
                        {" "}
                        • Snitt delta:{" "}
                        <span className="font-medium">
                          {trendMeta.avgDelta >= 0 ? "+" : ""}
                          {trendMeta.avgDelta.toFixed(1)}
                        </span>
                      </>
                    )}
                  </p>

                  <p className="mt-2 text-xs text-sf-muted">
                    Bedre: {trendMeta.betterCount} • Verre: {trendMeta.worseCount}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <TrendingUp size={14} /> Best
                      </p>
                      <ul className="mt-1 space-y-1 text-sf-muted">
                        {best.length === 0 ? (
                          <li>—</li>
                        ) : (
                          best.map((x) => (
                            <li key={x.id} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta == null ? "—" : `${x.delta >= 0 ? "+" : ""}${x.delta.toFixed(1)}`}
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
                        {worst.length === 0 ? (
                          <li>—</li>
                        ) : (
                          worst.map((x) => (
                            <li key={x.id} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta == null ? "—" : `${x.delta >= 0 ? "+" : ""}${x.delta.toFixed(1)}`}
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

            {(idsError || metricsError) ? (
              <p className="text-xs text-red-600 lg:col-span-4">
                Pain-feil: {idsError ?? metricsError}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}