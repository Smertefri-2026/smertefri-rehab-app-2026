// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section6Nutrition.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import {
  Utensils,
  AlertTriangle,
  BarChart,
  Users,
  CheckCircle2,
  LineChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

import { yyyyMmDd } from "@/modules/nutrition/storage";
import { listNutritionDays, type NutritionDayRow } from "@/lib/nutritionLog.api";

/* ---------------- types ---------------- */

type WeekTotals = {
  avgKcal: number;
  avgP: number;
  avgF: number;
  avgK: number;
  trendKcal: number;
  daysLogged: number;
};

type TeamStats = {
  totalClients: number;
  missingProfiles: number;
  noLogs7: number;
  loggedToday: number;
};

type TrendRow = {
  id: string;
  name: string;
  delta: number; // avgLast7 - avgPrev7
};

/* ---------------- helpers ---------------- */

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function makeLast7Days() {
  const out: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(yyyyMmDd(d));
  }
  return out;
}

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

function hasAnyMacros(row: any) {
  const kcal = Number(row?.calories_kcal ?? 0);
  const p = Number(row?.protein_g ?? 0);
  const f = Number(row?.fat_g ?? 0);
  const k = Number(row?.carbs_g ?? 0);
  return kcal > 0 || p > 0 || f > 0 || k > 0;
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
  if (!enabled) return <div className="cursor-default">{children}</div>;
  return (
    <Link href={href} className="block">
      {children}
    </Link>
  );
}

/* ---------------- component ---------------- */

export default function Section6Nutrition() {
  const { role, userId } = useRole();

  // ---------------------------
  // CLIENT: grunnprofil finnes?
  // ---------------------------
  const [profileLoading, setProfileLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (role !== "client") return;
    if (!userId) return;

    let alive = true;
    setProfileLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("nutrition_profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!alive) return;
        if (error) throw error;

        setHasProfile(!!data?.user_id);
      } catch {
        if (!alive) return;
        setHasProfile(null);
      } finally {
        if (!alive) return;
        setProfileLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  // ---------------------------
  // CLIENT: ukeoversikt (7 dager)
  // ---------------------------
  const [weekLoading, setWeekLoading] = useState(false);
  const [weekRows, setWeekRows] = useState<NutritionDayRow[]>([]);

  const weekDates = useMemo(() => makeLast7Days(), []);
  const weekFrom = weekDates[0];
  const weekTo = weekDates[weekDates.length - 1];

  useEffect(() => {
    if (role !== "client") return;
    if (!userId) return;

    let alive = true;
    setWeekLoading(true);

    (async () => {
      try {
        const data = await listNutritionDays(userId, weekFrom, weekTo);
        if (!alive) return;
        setWeekRows(data ?? []);
      } catch {
        if (!alive) return;
        setWeekRows([]);
      } finally {
        if (!alive) return;
        setWeekLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, userId, weekFrom, weekTo]);

  const week = useMemo<WeekTotals>(() => {
    const byDate = new Map<string, { kcal: number; p: number; f: number; k: number }>();

    for (const r of weekRows as any[]) {
      byDate.set((r as any).day_date, {
        kcal: Number((r as any).calories_kcal ?? 0),
        p: Number((r as any).protein_g ?? 0),
        f: Number((r as any).fat_g ?? 0),
        k: Number((r as any).carbs_g ?? 0),
      });
    }

    const totals = weekDates.map((d) => byDate.get(d) ?? { kcal: 0, p: 0, f: 0, k: 0 });

    const kcals = totals.map((t) => t.kcal);
    const ps = totals.map((t) => t.p);
    const fs = totals.map((t) => t.f);
    const ks = totals.map((t) => t.k);

    const avgKcal = Math.round(mean(kcals));
    const avgP = Math.round(mean(ps));
    const avgF = Math.round(mean(fs));
    const avgK = Math.round(mean(ks));

    const daysLogged = totals.filter((t) => (t.kcal || 0) > 0 || (t.p || 0) > 0 || (t.f || 0) > 0 || (t.k || 0) > 0).length;

    const mid = Math.floor(kcals.length / 2); // 7 -> 3
    const first = mean(kcals.slice(0, mid));
    const last = mean(kcals.slice(mid));
    const trendKcal = Math.round(last - first);

    return { avgKcal, avgP, avgF, avgK, trendKcal, daysLogged };
  }, [weekRows, weekDates]);

  const trendText =
    week.trendKcal === 0 ? "≈ stabilt" : week.trendKcal > 0 ? `↑ ${week.trendKcal} kcal` : `↓ ${Math.abs(week.trendKcal)} kcal`;

  // ---------------------------
  // TRAINER/ADMIN: scope klienter + tall
  // ---------------------------
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsError, setIdsError] = useState<string | null>(null);

  const [teamLoading, setTeamLoading] = useState(false);
  const [teamErr, setTeamErr] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      if (role !== "trainer" && role !== "admin") return;

      setIdsLoading(true);
      setIdsError(null);

      try {
        let q = supabase.from("profiles").select("id, trainer_id, role").eq("role", "client");

        if (role === "trainer") {
          q = q.eq("trainer_id", userId);
        } else {
          // admin: "aktive" klienter = har trainer_id
          q = q.not("trainer_id", "is", null);
        }

        const { data, error } = await q;
        if (error) throw error;

        setClientIds((data ?? []).map((c: any) => c.id).filter(Boolean));
      } catch (e: any) {
        setIdsError(e?.message ?? "Ukjent feil");
        setClientIds([]);
      } finally {
        setIdsLoading(false);
      }
    };

    run();
  }, [role, userId]);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      if (role !== "trainer" && role !== "admin") return;

      setTeamLoading(true);
      setTeamErr(null);

      try {
        const totalClients = clientIds.length;

        if (!totalClients) {
          setTeamStats({ totalClients: 0, missingProfiles: 0, noLogs7: 0, loggedToday: 0 });
          return;
        }

        // hvem har profil
        const { data: pData, error: pErr } = await supabase
          .from("nutrition_profiles")
          .select("user_id")
          .in("user_id", clientIds);

        if (pErr) throw pErr;

        const haveProfile = new Set((pData ?? []).map((r: any) => r.user_id).filter(Boolean));
        const missingProfiles = clientIds.filter((id) => !haveProfile.has(id)).length;

        // logging siste 7 dager + i dag
        const fromISO = isoDaysAgo(6);
        const today = yyyyMmDd(new Date());

        const { data: dData, error: dErr } = await supabase
          .from("nutrition_days")
          .select("user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g")
          .in("user_id", clientIds)
          .gte("day_date", fromISO)
          .lte("day_date", today);

        if (dErr) throw dErr;

        const byUser = new Map<string, { any7: boolean; today: boolean }>();
        for (const uid of clientIds) byUser.set(uid, { any7: false, today: false });

        for (const row of (dData ?? []) as any[]) {
          const uid = String(row.user_id ?? "");
          const day = String(row.day_date ?? "");
          if (!uid || !day) continue;
          if (!hasAnyMacros(row)) continue;

          const cur = byUser.get(uid) ?? { any7: false, today: false };
          cur.any7 = true;
          if (day === today) cur.today = true;
          byUser.set(uid, cur);
        }

        let loggedToday = 0;
        for (const uid of clientIds) {
          const s = byUser.get(uid);
          if (s?.today) loggedToday++;
        }

        const noLogs7 = clientIds.filter((uid) => !byUser.get(uid)?.any7).length;

        setTeamStats({ totalClients, missingProfiles, noLogs7, loggedToday });
      } catch (e: any) {
        setTeamErr(e?.message ?? "Ukjent feil");
        setTeamStats(null);
      } finally {
        setTeamLoading(false);
      }
    };

    run();
  }, [role, userId, clientIds]);

  const ready =
    role === "trainer" || role === "admin"
      ? !idsLoading && !teamLoading
      : true;

  // ✅ Skjul OK-kort for trainer/admin når ferdig lastet
  const missingProfiles = teamStats?.missingProfiles ?? 0;
  const noLogs7 = teamStats?.noLogs7 ?? 0;
  const loggedToday = teamStats?.loggedToday ?? 0;

  const showMissingProfiles = !ready || missingProfiles > 0;
  const showNoLogs7 = !ready || noLogs7 > 0;
  const showLoggedToday = !ready || loggedToday > 0;

  // “Logget i dag” er ikke et varsel – så vi lar OK-kortet være sant selv om noen har logget i dag.
  const allOkTrainerAdmin =
    (role === "trainer" || role === "admin") &&
    ready &&
    missingProfiles === 0 &&
    noLogs7 === 0 &&
    !idsError &&
    !teamErr;

  /* --------- Trend (14 dager) – samme design som Section5 --------- */
  const [rankLoading, setRankLoading] = useState(false);
  const [rankErr, setRankErr] = useState<string | null>(null);

  const [trendRecent14Count, setTrendRecent14Count] = useState(0);
  const [trendEligibleCount, setTrendEligibleCount] = useState(0);
  const [trendBetterCount, setTrendBetterCount] = useState(0); // delta < 0
  const [trendWorseCount, setTrendWorseCount] = useState(0);  // delta > 0
  const [trendAvgDelta, setTrendAvgDelta] = useState<number | null>(null);

  const [trendBest, setTrendBest] = useState<TrendRow[]>([]);
  const [trendWorst, setTrendWorst] = useState<TrendRow[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!(role === "trainer" || role === "admin")) return;

      // Vi lar kortet vise “Laster…” mens scope/teams lastes
      if (!ready) return;

      if (!clientIds.length) {
        setTrendRecent14Count(0);
        setTrendEligibleCount(0);
        setTrendBetterCount(0);
        setTrendWorseCount(0);
        setTrendAvgDelta(null);
        setTrendBest([]);
        setTrendWorst([]);
        return;
      }

      setRankLoading(true);
      setRankErr(null);

      try {
        const from14 = isoDaysAgo(13); // inkl
        const from7 = isoDaysAgo(6);   // siste 7 dager inkl
        const today = yyyyMmDd(new Date());

        // 1) navn
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", clientIds)
          .limit(2000);

        if (pErr) throw pErr;

        const nameMap = new Map<string, string>();
        for (const p of profs ?? []) {
          nameMap.set(String((p as any).id), nameOfProfile(p));
        }

        // 2) nutrition_days siste 14 dager
        const { data: rows, error: rErr } = await supabase
          .from("nutrition_days")
          .select("user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g")
          .in("user_id", clientIds)
          .gte("day_date", from14)
          .lte("day_date", today)
          .limit(20000);

        if (rErr) throw rErr;

        // group per client → last7 / prev7 avg kcal (kun dager med macros)
        const per = new Map<string, { last7: number[]; prev7: number[] }>();

        for (const r of rows ?? []) {
          const uid = String((r as any).user_id ?? "");
          const day = String((r as any).day_date ?? "");
          if (!uid || !day) continue;
          if (!hasAnyMacros(r)) continue;

          const kcal = Number((r as any).calories_kcal ?? 0);
          if (!Number.isFinite(kcal)) continue;

          if (!per.has(uid)) per.set(uid, { last7: [], prev7: [] });
          if (day >= from7) per.get(uid)!.last7.push(kcal);
          else per.get(uid)!.prev7.push(kcal);
        }

        const recent14Count = per.size;

        const withDelta: TrendRow[] = [];
        const deltas: number[] = [];

        for (const [id, g] of per.entries()) {
          const aLast = g.last7.length ? mean(g.last7) : null;
          const aPrev = g.prev7.length ? mean(g.prev7) : null;
          const delta = aLast != null && aPrev != null ? aLast - aPrev : null;
          if (delta == null) continue;

          const row: TrendRow = {
            id,
            name: nameMap.get(id) ?? id.slice(0, 8),
            delta,
          };
          withDelta.push(row);
          deltas.push(delta);
        }

        const eligibleCount = withDelta.length;

        const betterCount = withDelta.filter((x) => x.delta < 0).length;
        const worseCount = withDelta.filter((x) => x.delta > 0).length;

        const avgDelta =
          deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;

        // match Section5: top 3
        const best3 = [...withDelta].sort((a, b) => a.delta - b.delta).slice(0, 3);  // mest negativ
        const worst3 = [...withDelta].sort((a, b) => b.delta - a.delta).slice(0, 3); // mest positiv

        setTrendRecent14Count(recent14Count);
        setTrendEligibleCount(eligibleCount);
        setTrendBetterCount(betterCount);
        setTrendWorseCount(worseCount);
        setTrendAvgDelta(avgDelta);

        setTrendBest(best3);
        setTrendWorst(worst3);
      } catch (e: any) {
        setRankErr(e?.message ?? "Ukjent feil");
        setTrendRecent14Count(0);
        setTrendEligibleCount(0);
        setTrendBetterCount(0);
        setTrendWorseCount(0);
        setTrendAvgDelta(null);
        setTrendBest([]);
        setTrendWorst([]);
      } finally {
        setRankLoading(false);
      }
    };

    run();
  }, [role, ready, clientIds]);

  // grid: match Section5 (4 kolonner for trainer/admin)
  const gridClass =
    role === "trainer" || role === "admin"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Kosthold</h2>

      <div className={gridClass}>
        {/* ======================= CLIENT ======================= */}
        {role === "client" && (
          <>
            {/* 1) Grunnprofil */}
            <Link href="/profile" className="block">
              <DashboardCard
                title="Grunnprofil"
                icon={
                  profileLoading ? (
                    <Users size={18} />
                  ) : hasProfile ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Users size={18} />
                  )
                }
                variant={hasProfile ? "success" : "warning"}
                status={profileLoading ? "…" : hasProfile ? "✓" : "!"}
              >
                <p className="text-sm">
                  {profileLoading
                    ? "Sjekker profil…"
                    : hasProfile
                      ? "Profil er registrert. Du kan oppdatere mål og preferanser."
                      : "Mangler grunnprofil. Opprett for å få bedre anbefalinger."}
                </p>

                <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80] hover:opacity-90 transition">
                  {hasProfile ? "Se / oppdater profil" : "Opprett profil"}
                </div>
              </DashboardCard>
            </Link>

            {/* 2) Logg i dag */}
            <Link href="/nutrition/today" className="block">
              <DashboardCard title="I dag" icon={<Utensils size={18} />}>
                <p className="text-sm text-sf-muted">Logg dagens matinntak – så får du grafer og historikk.</p>

                <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80] hover:opacity-90 transition">
                  Logg dagens mat
                </div>
              </DashboardCard>
            </Link>

            {/* 3) Ukeoversikt */}
            <Link href="/nutrition/history" className="block">
              <DashboardCard title="Ukeoversikt (7 dager)" icon={<BarChart size={18} />}>
                {weekLoading ? (
                  <p className="text-sm text-sf-muted">Laster ukeoversikt…</p>
                ) : week.daysLogged === 0 ? (
                  <>
                    <p className="text-sm text-sf-muted">Ingen logg siste 7 dager.</p>
                    <p className="mt-2 text-xs text-sf-muted">Trykk for å se historikk (eller logg i dag).</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      Snitt: <span className="font-semibold">{week.avgKcal} kcal</span>{" "}
                      <span className="text-sf-muted">• P {week.avgP}g • F {week.avgF}g • K {week.avgK}g</span>
                    </p>

                    <p className="mt-2 text-xs text-sf-muted">
                      Trend: <span className="font-medium text-sf-text">{trendText}</span> • Dager logget:{" "}
                      <span className="font-medium text-sf-text">{week.daysLogged}/7</span>
                    </p>

                    <p className="mt-3 text-xs text-sf-muted">Trykk for å se mer →</p>
                  </>
                )}
              </DashboardCard>
            </Link>
          </>
        )}

        {/* ======================= TRAINER + ADMIN ======================= */}
        {(role === "trainer" || role === "admin") && (
          <>
            {/* ✅ Alt OK */}
            {allOkTrainerAdmin ? (
              <DashboardCard
                title="Alle kunder er oppdatert"
                icon={<CheckCircle2 size={18} />}
                variant="success"
                status="✓"
              >
                <p className="text-sm">Ingen kunder krever kostholds-oppfølging akkurat nå.</p>
                <p className="mt-2 text-xs text-sf-muted">Se best/dårligst i Trend-kortet.</p>
              </DashboardCard>
            ) : null}

            {/* Mangler grunnprofil */}
            {showMissingProfiles ? (
              <MaybeLink enabled={ready && missingProfiles > 0} href="/clients?nutrition=missing-profile">
                <DashboardCard
                  title="Manglende grunnprofil"
                  icon={<Users size={18} />}
                  variant="warning"
                  status={statusLabel(missingProfiles, idsLoading || teamLoading)}
                >
                  <p className="text-sm text-sf-muted">
                    Av {idsLoading || teamLoading ? "…" : teamStats?.totalClients ?? 0} klienter mangler{" "}
                    {idsLoading || teamLoading ? "…" : missingProfiles} kostholdsprofil.
                  </p>
                  <p className="mt-2 text-xs text-sf-muted">
                    {ready && missingProfiles > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* Ingen logging (7 dager) */}
            {showNoLogs7 ? (
              <MaybeLink enabled={ready && noLogs7 > 0} href="/clients?nutrition=no-logs-7d">
                <DashboardCard
                  title="Ingen logging (7 dager)"
                  icon={<AlertTriangle size={18} />}
                  variant="danger"
                  status={statusLabel(noLogs7, idsLoading || teamLoading)}
                >
                  <p className="text-sm text-sf-muted">
                    Klienter uten kostholdslogging siste 7 dager:{" "}
                    <span className="font-medium text-sf-text">{idsLoading || teamLoading ? "…" : noLogs7}</span>
                  </p>
                  <p className="mt-2 text-xs text-sf-muted">
                    {ready && noLogs7 > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* Logget i dag (info – skjules når 0, som i Section5) */}
            {showLoggedToday ? (
              <MaybeLink enabled={ready && loggedToday > 0} href="/clients?nutrition=logged-today">
                <DashboardCard
                  title="Logget i dag"
                  icon={<BarChart size={18} />}
                  variant="info"
                  status={statusLabel(loggedToday, idsLoading || teamLoading)}
                >
                  <p className="text-sm text-sf-muted">
                    Klienter som har logget i dag:{" "}
                    <span className="font-medium text-sf-text">{idsLoading || teamLoading ? "…" : loggedToday}</span>
                  </p>
                  <p className="mt-2 text-xs text-sf-muted">
                    {ready && loggedToday > 0 ? "Se liste →" : "Ingen å vise"}
                  </p>
                </DashboardCard>
              </MaybeLink>
            ) : null}

            {/* 📈 Trend (14 dager) – samme “kort-layout” som Section5 */}
            <DashboardCard title="Trend (14 dager)" icon={<LineChart size={18} />} variant="info">
              {!ready || rankLoading ? (
                <p className="text-sm text-sf-muted">{!ready ? "Laster…" : "Laster…"}</p>
              ) : rankErr ? (
                <p className="text-sm text-red-600">Trend-feil: {rankErr}</p>
              ) : trendRecent14Count === 0 ? (
                <p className="text-sm text-sf-muted">Ikke nok data til å sammenligne siste 7 vs forrige 7.</p>
              ) : trendEligibleCount === 0 ? (
                <p className="text-sm text-sf-muted">Ikke nok data til å rangere ennå.</p>
              ) : (
                <>
                  <p className="text-sm">
                    Oppdatert (14d):{" "}
                    <span className="font-medium">{trendRecent14Count}</span>
                    {trendAvgDelta == null ? null : (
                      <>
                        {" "}
                        • Snitt delta:{" "}
                        <span className="font-medium">
                          {trendAvgDelta >= 0 ? "+" : ""}
                          {trendAvgDelta.toFixed(0)} kcal
                        </span>
                      </>
                    )}
                  </p>

                  <p className="mt-2 text-xs text-sf-muted">
                    Bedre: {trendBetterCount} • Verre: {trendWorseCount}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <TrendingUp size={14} /> Best
                      </p>
                      <ul className="mt-1 space-y-1 text-sf-muted">
                        {trendBest.length === 0 ? (
                          <li>—</li>
                        ) : (
                          trendBest.map((x) => (
                            <li key={x.id} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta >= 0 ? "+" : ""}
                                {Math.round(x.delta)} kcal
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
                        {trendWorst.length === 0 ? (
                          <li>—</li>
                        ) : (
                          trendWorst.map((x) => (
                            <li key={x.id} className="flex justify-between gap-2">
                              <span className="truncate">{x.name}</span>
                              <span className="font-medium text-sf-text">
                                {x.delta >= 0 ? "+" : ""}
                                {Math.round(x.delta)} kcal
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-sf-muted">
                    Delta = snitt(siste 7 dager) − snitt(forrige 7). Negativ = lavere snitt siste uke.
                  </p>
                </>
              )}
            </DashboardCard>

            {(idsError || teamErr) ? (
              <p className="text-xs text-red-600 lg:col-span-4">
                Nutrition dashboard-feil: {idsError ?? teamErr}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}