// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section6Nutrition.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import { Utensils, AlertTriangle, BarChart, Users, CheckCircle2 } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

import { yyyyMmDd } from "@/modules/nutrition/storage";
import { listNutritionDays, type NutritionDayRow } from "@/lib/nutritionLog.api";

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

function hasAnyMacros(row: any) {
  const kcal = Number(row?.calories_kcal ?? 0);
  const p = Number(row?.protein_g ?? 0);
  const f = Number(row?.fat_g ?? 0);
  const k = Number(row?.carbs_g ?? 0);
  return kcal > 0 || p > 0 || f > 0 || k > 0;
}

export default function Section6Nutrition() {
  const { role, userId } = useRole();

  // ---------------------------
  // CLIENT: grunnprofil finnes?
  // nutrition_profiles har user_id (ikke client_id)
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
  // TRAINER/ADMIN: ekte tall
  // ---------------------------
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamErr, setTeamErr] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      if (role !== "trainer" && role !== "admin") return;

      setTeamLoading(true);
      setTeamErr(null);

      try {
        // 1) scope: klienter
        let q = supabase
          .from("profiles")
          .select("id, trainer_id, role")
          .eq("role", "client");

        if (role === "trainer") {
          q = q.eq("trainer_id", userId);
        } else {
          // admin: "aktive" klienter = har trainer_id
          q = q.not("trainer_id", "is", null);
        }

        const { data: cData, error: cErr } = await q;
        if (cErr) throw cErr;

        const clientIds = (cData ?? []).map((c: any) => c.id).filter(Boolean);
        const totalClients = clientIds.length;

        if (!totalClients) {
          setTeamStats({ totalClients: 0, missingProfiles: 0, noLogs7: 0, loggedToday: 0 });
          return;
        }

        // 2) nutrition_profiles: hvem har profil
        const { data: pData, error: pErr } = await supabase
          .from("nutrition_profiles")
          .select("user_id")
          .in("user_id", clientIds);

        if (pErr) throw pErr;

        const haveProfile = new Set((pData ?? []).map((r: any) => r.user_id).filter(Boolean));
        const missingProfiles = clientIds.filter((id) => !haveProfile.has(id)).length;

        // 3) nutrition_days: logging siste 7 dager + i dag
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
  }, [role, userId]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Kosthold</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ======================= KUNDE ======================= */}
        {role === "client" && (
          <>
            {/* 1) Grunnprofil */}
            <Link href="/profile" className="block">
              <DashboardCard
                title="Grunnprofil"
                icon={profileLoading ? <Users size={18} /> : hasProfile ? <CheckCircle2 size={18} /> : <Users size={18} />}
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

        {/* ======================= TRENER ======================= */}
        {role === "trainer" && (
          <>
            <Link href="/clients?nutrition=missing-profile" className="block">
              <DashboardCard
                title="Manglende grunnprofil"
                icon={<Users size={18} />}
                variant="warning"
                status={teamLoading ? "…" : String(teamStats?.missingProfiles ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  Av {teamLoading ? "…" : teamStats?.totalClients ?? 0} klienter mangler{" "}
                  {teamLoading ? "…" : teamStats?.missingProfiles ?? 0} kostholdsprofil.
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?nutrition=no-logs-7d" className="block">
              <DashboardCard
                title="Ingen logging (7 dager)"
                icon={<AlertTriangle size={18} />}
                variant="danger"
                status={teamLoading ? "…" : String(teamStats?.noLogs7 ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  Klienter uten kostholdslogging siste 7 dager:{" "}
                  <span className="font-medium text-sf-text">{teamLoading ? "…" : teamStats?.noLogs7 ?? 0}</span>
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?nutrition=logged-today" className="block">
              <DashboardCard
                title="Logget i dag"
                icon={<BarChart size={18} />}
                variant="info"
                status={teamLoading ? "…" : String(teamStats?.loggedToday ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  Klienter som har logget i dag:{" "}
                  <span className="font-medium text-sf-text">{teamLoading ? "…" : teamStats?.loggedToday ?? 0}</span>
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            {teamErr ? <p className="text-xs text-red-600 lg:col-span-3">Nutrition dashboard-feil: {teamErr}</p> : null}
          </>
        )}

        {/* ======================= ADMIN ======================= */}
        {role === "admin" && (
          <>
            <Link href="/clients?nutrition=missing-profile" className="block">
              <DashboardCard
                title="Manglende grunnprofil"
                icon={<Users size={18} />}
                variant="warning"
                status={teamLoading ? "…" : String(teamStats?.missingProfiles ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  (Aktive klienter) Mangler profil:{" "}
                  <span className="font-medium text-sf-text">{teamLoading ? "…" : teamStats?.missingProfiles ?? 0}</span>
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?nutrition=no-logs-7d" className="block">
              <DashboardCard
                title="Ingen logging (7 dager)"
                icon={<AlertTriangle size={18} />}
                variant="danger"
                status={teamLoading ? "…" : String(teamStats?.noLogs7 ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  (Aktive klienter) Uten logging siste 7 dager:{" "}
                  <span className="font-medium text-sf-text">{teamLoading ? "…" : teamStats?.noLogs7 ?? 0}</span>
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?nutrition=logged-today" className="block">
              <DashboardCard
                title="Logget i dag"
                icon={<BarChart size={18} />}
                variant="info"
                status={teamLoading ? "…" : String(teamStats?.loggedToday ?? 0)}
              >
                <p className="text-sm text-sf-muted">
                  (Aktive klienter) Har logget i dag:{" "}
                  <span className="font-medium text-sf-text">{teamLoading ? "…" : teamStats?.loggedToday ?? 0}</span>
                </p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se klienter →</p>
              </DashboardCard>
            </Link>

            {teamErr ? <p className="text-xs text-red-600 lg:col-span-3">Nutrition dashboard-feil: {teamErr}</p> : null}
          </>
        )}
      </div>
    </section>
  );
}