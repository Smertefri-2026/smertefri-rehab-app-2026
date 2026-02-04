"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, BarChart3, Timer, Activity, CheckCircle2, AlertTriangle, Users } from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { supabase } from "@/lib/supabaseClient";
import { yyyyMmDd } from "@/modules/nutrition/storage";
import { useRole } from "@/providers/RoleProvider";

type TopRow = { id: string; label: string; count: number };

type AppAnalyticsStats = {
  totalClients: number;

  // Active clients (events-based)
  dau: number; // active today
  wau: number; // active last 7d
  mau: number; // active last 30d

  // Events totals
  eventsToday: number;
  events7d: number;
  events30d: number;

  testSessions7d: number;
  painEntries7d: number;
  nutritionLogs7d: number;
  bookings7d: number;

  avgDaysSinceClientCreated: number;

  topPainAreas7d: Array<{ label: string; count: number }>;

  // Retention: prev 7d -> current 7d overlap
  prevWeekActive: number;
  returningThisWeek: number; // overlap
  retentionPct: number; // 0..1

  // “Leaderboard”
  topClients7d: TopRow[];
  topTrainers30d: TopRow[];
};

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min
let _cache: { ts: number; data: AppAnalyticsStats } | null = null;

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dayISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return yyyyMmDd(d);
}

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pickProfileLabel(p: any) {
  return (
    String(p?.full_name ?? "").trim() ||
    String(p?.name ?? "").trim() ||
    String(p?.display_name ?? "").trim() ||
    String(p?.email ?? "").trim() ||
    String(p?.id ?? "").trim()
  );
}

function fmtPct01(x: number) {
  if (!Number.isFinite(x)) return "—";
  return `${Math.round(x * 100)}%`;
}

export default function Section7AppAnalytics() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  if (!isAdmin) return null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState<AppAnalyticsStats | null>(null);

  const fetchAppStats = async (force = false) => {
    if (!isAdmin) return;

    if (!force && _cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
      setStats(_cache.data);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      // 1) Alle klienter
      const { data: clients, error: cErr } = await supabase
        .from("profiles")
        .select("id, created_at")
        .eq("role", "client");

      if (cErr) throw cErr;

      const clientIds = (clients ?? []).map((c: any) => c.id).filter(Boolean);
      const totalClients = clientIds.length;

      if (!totalClients) {
        const empty: AppAnalyticsStats = {
          totalClients: 0,

          dau: 0,
          wau: 0,
          mau: 0,

          eventsToday: 0,
          events7d: 0,
          events30d: 0,

          testSessions7d: 0,
          painEntries7d: 0,
          nutritionLogs7d: 0,
          bookings7d: 0,

          avgDaysSinceClientCreated: 0,
          topPainAreas7d: [],

          prevWeekActive: 0,
          returningThisWeek: 0,
          retentionPct: 0,

          topClients7d: [],
          topTrainers30d: [],
        };
        setStats(empty);
        _cache = { ts: Date.now(), data: empty };
        return;
      }

      // 2) Vinduer
      const todayStartTS = startOfTodayISO();
      const from7TS = daysAgoISO(6);
      const from30TS = daysAgoISO(29);
      const from14TS = daysAgoISO(13);

      const todayDay = yyyyMmDd(new Date());
      const from7Day = dayISO(6);
      const from30Day = dayISO(29);
      const from14Day = dayISO(13);

      // 3) Hent events
      const [
        // 30d
        tests30Res,
        pain30Res,
        nut30Res,
        book30Res,
        // 14d
        tests14Res,
        pain14Res,
        nut14Res,
        book14Res,
        // today
        testsTodayRes,
        painTodayRes,
        nutTodayRes,
        bookTodayRes,
      ] = await Promise.all([
        supabase.from("test_sessions").select("id, client_id, created_at").in("client_id", clientIds).gte("created_at", from30TS),
        supabase.from("pain_entries").select("id, client_id, created_at, area_label, area_key").in("client_id", clientIds).gte("created_at", from30TS),
        supabase.from("nutrition_days").select("id, user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g").in("user_id", clientIds).gte("day_date", from30Day).lte("day_date", todayDay),
        supabase.from("bookings").select("id, client_id, trainer_id, created_at, start_time").in("client_id", clientIds).gte("created_at", from30TS),

        supabase.from("test_sessions").select("id, client_id, created_at").in("client_id", clientIds).gte("created_at", from14TS),
        supabase.from("pain_entries").select("id, client_id, created_at, area_label, area_key").in("client_id", clientIds).gte("created_at", from14TS),
        supabase.from("nutrition_days").select("id, user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g").in("user_id", clientIds).gte("day_date", from14Day).lte("day_date", todayDay),
        supabase.from("bookings").select("id, client_id, trainer_id, created_at, start_time").in("client_id", clientIds).gte("created_at", from14TS),

        supabase.from("test_sessions").select("id, client_id, created_at").in("client_id", clientIds).gte("created_at", todayStartTS),
        supabase.from("pain_entries").select("id, client_id, created_at").in("client_id", clientIds).gte("created_at", todayStartTS),
        supabase.from("nutrition_days").select("id, user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g").in("user_id", clientIds).eq("day_date", todayDay),
        supabase.from("bookings").select("id, client_id, trainer_id, created_at, start_time").in("client_id", clientIds).gte("created_at", todayStartTS),
      ]);

      const all = [
        tests30Res, pain30Res, nut30Res, book30Res,
        tests14Res, pain14Res, nut14Res, book14Res,
        testsTodayRes, painTodayRes, nutTodayRes, bookTodayRes,
      ];
      for (const r of all) if ((r as any).error) throw (r as any).error;

      const tests30 = (tests30Res.data ?? []) as any[];
      const pain30 = (pain30Res.data ?? []) as any[];
      const nut30 = (nut30Res.data ?? []) as any[];
      const book30 = (book30Res.data ?? []) as any[];

      const tests14 = (tests14Res.data ?? []) as any[];
      const pain14 = (pain14Res.data ?? []) as any[];
      const nut14 = (nut14Res.data ?? []) as any[];
      const book14 = (book14Res.data ?? []) as any[];

      const testsToday = (testsTodayRes.data ?? []) as any[];
      const painToday = (painTodayRes.data ?? []) as any[];
      const nutToday = (nutTodayRes.data ?? []) as any[];
      const bookToday = (bookTodayRes.data ?? []) as any[];

      // Nutrition logs = rader med faktisk data
      const hasNutData = (r: any) => {
        const kcal = safeNum(r.calories_kcal);
        const p = safeNum(r.protein_g);
        const f = safeNum(r.fat_g);
        const k = safeNum(r.carbs_g);
        return kcal > 0 || p > 0 || f > 0 || k > 0;
      };

      const nutLogs30 = nut30.filter(hasNutData);
      const nutLogs14 = nut14.filter(hasNutData);
      const nutLogsToday = nutToday.filter(hasNutData);

      // -----------------------------
      // Active sets (DAU/WAU/MAU)
      // -----------------------------
      const mauSet = new Set<string>();
      for (const r of tests30) if (r.client_id) mauSet.add(String(r.client_id));
      for (const r of pain30) if (r.client_id) mauSet.add(String(r.client_id));
      for (const r of nutLogs30) if (r.user_id) mauSet.add(String(r.user_id));
      for (const r of book30) if (r.client_id) mauSet.add(String(r.client_id));
      const mau = mauSet.size;

      const wauSet = new Set<string>();
      const from7Time = new Date(from7TS).getTime();

      for (const r of tests14) if (r.client_id && new Date(r.created_at).getTime() >= from7Time) wauSet.add(String(r.client_id));
      for (const r of pain14) if (r.client_id && new Date(r.created_at).getTime() >= from7Time) wauSet.add(String(r.client_id));
      for (const r of nutLogs14) if (r.user_id && String(r.day_date) >= from7Day) wauSet.add(String(r.user_id));
      for (const r of book14) if (r.client_id && new Date(r.created_at).getTime() >= from7Time) wauSet.add(String(r.client_id));
      const wau = wauSet.size;

      const dauSet = new Set<string>();
      for (const r of testsToday) if (r.client_id) dauSet.add(String(r.client_id));
      for (const r of painToday) if (r.client_id) dauSet.add(String(r.client_id));
      for (const r of nutLogsToday) if (r.user_id) dauSet.add(String(r.user_id));
      for (const r of bookToday) if (r.client_id) dauSet.add(String(r.client_id));
      const dau = dauSet.size;

      // -----------------------------
      // Events totals
      // -----------------------------
      const nutritionLogs7d = nutLogs14.filter((r) => String(r.day_date) >= from7Day).length;
      const testSessions7d = tests14.filter((r) => new Date(r.created_at).getTime() >= from7Time).length;
      const painEntries7d = pain14.filter((r) => new Date(r.created_at).getTime() >= from7Time).length;
      const bookings7d = book14.filter((r) => new Date(r.created_at).getTime() >= from7Time).length;

      const events7d = testSessions7d + painEntries7d + bookings7d + nutritionLogs7d;
      const events30d = tests30.length + pain30.length + book30.length + nutLogs30.length;
      const eventsToday = testsToday.length + painToday.length + bookToday.length + nutLogsToday.length;

      // -----------------------------
      // Avg days since client created
      // -----------------------------
      const now = Date.now();
      const days = (clients ?? []).map((c: any) => {
        const t = new Date(c.created_at ?? 0).getTime();
        if (!t || Number.isNaN(t)) return 0;
        return Math.max(0, Math.round((now - t) / (1000 * 60 * 60 * 24)));
      });

      const avgDaysSinceClientCreated =
        days.length ? Math.round(days.reduce((a: number, b: number) => a + b, 0) / days.length) : 0;

      // -----------------------------
      // Top pain areas (7d)
      // -----------------------------
      const areaCount = new Map<string, number>();
      for (const r of pain14) {
        const is7 = new Date(r.created_at).getTime() >= from7Time;
        if (!is7) continue;

        const label =
          String(r.area_label ?? "").trim() ||
          String(r.area_key ?? "").trim() ||
          "Ukjent område";
        areaCount.set(label, (areaCount.get(label) ?? 0) + 1);
      }

      const topPainAreas7d = Array.from(areaCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, count]) => ({ label, count }));

      // -----------------------------
      // Retention (prev week -> current week)
      // -----------------------------
      const prevSet = new Set<string>();
      const currSet = new Set<string>();

      for (const r of tests14) {
        const t = new Date(r.created_at).getTime();
        if (!r.client_id) continue;
        if (t >= from7Time) currSet.add(String(r.client_id));
        else prevSet.add(String(r.client_id));
      }

      for (const r of pain14) {
        const t = new Date(r.created_at).getTime();
        if (!r.client_id) continue;
        if (t >= from7Time) currSet.add(String(r.client_id));
        else prevSet.add(String(r.client_id));
      }

      for (const r of book14) {
        const t = new Date(r.created_at).getTime();
        if (!r.client_id) continue;
        if (t >= from7Time) currSet.add(String(r.client_id));
        else prevSet.add(String(r.client_id));
      }

      for (const r of nutLogs14) {
        const d = String(r.day_date);
        if (!r.user_id) continue;
        if (d >= from7Day) currSet.add(String(r.user_id));
        else prevSet.add(String(r.user_id));
      }

      let returningThisWeek = 0;
      for (const id of prevSet) if (currSet.has(id)) returningThisWeek++;

      const prevWeekActive = prevSet.size;
      const retentionPct = prevWeekActive > 0 ? returningThisWeek / prevWeekActive : 0;

      // -----------------------------
      // Top clients (7d)
      // -----------------------------
      const clientEventCount = new Map<string, number>();
      const inc = (id: any) => {
        if (!id) return;
        const k = String(id);
        clientEventCount.set(k, (clientEventCount.get(k) ?? 0) + 1);
      };

      for (const r of tests14) if (new Date(r.created_at).getTime() >= from7Time) inc(r.client_id);
      for (const r of pain14) if (new Date(r.created_at).getTime() >= from7Time) inc(r.client_id);
      for (const r of book14) if (new Date(r.created_at).getTime() >= from7Time) inc(r.client_id);
      for (const r of nutLogs14) if (String(r.day_date) >= from7Day) inc(r.user_id);

      const topClientIds = Array.from(clientEventCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      let topClients7d: TopRow[] = [];
      if (topClientIds.length) {
        const { data: profs } = await supabase.from("profiles").select("*").in("id", topClientIds);
        const labelMap = new Map<string, string>();
        for (const p of profs ?? []) labelMap.set(String((p as any).id), pickProfileLabel(p));

        topClients7d = topClientIds.map((id) => ({
          id,
          label: labelMap.get(id) ?? id,
          count: clientEventCount.get(id) ?? 0,
        }));
      }

      // -----------------------------
      // Top trainers (30d) by bookings
      // -----------------------------
      const trainerCount = new Map<string, number>();
      for (const r of book30) {
        const tid = r.trainer_id;
        if (!tid) continue;
        const k = String(tid);
        trainerCount.set(k, (trainerCount.get(k) ?? 0) + 1);
      }

      const topTrainerIds = Array.from(trainerCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      let topTrainers30d: TopRow[] = [];
      if (topTrainerIds.length) {
        const { data: tProfs } = await supabase.from("profiles").select("*").in("id", topTrainerIds);
        const labelMap = new Map<string, string>();
        for (const p of tProfs ?? []) labelMap.set(String((p as any).id), pickProfileLabel(p));

        topTrainers30d = topTrainerIds.map((id) => ({
          id,
          label: labelMap.get(id) ?? id,
          count: trainerCount.get(id) ?? 0,
        }));
      }

      const out: AppAnalyticsStats = {
        totalClients,

        dau,
        wau,
        mau,

        eventsToday,
        events7d,
        events30d,

        testSessions7d,
        painEntries7d,
        nutritionLogs7d,
        bookings7d,

        avgDaysSinceClientCreated,
        topPainAreas7d,

        prevWeekActive,
        returningThisWeek,
        retentionPct,

        topClients7d,
        topTrainers30d,
      };

      setStats(out);
      _cache = { ts: Date.now(), data: out };
    } catch (e: any) {
      setErr(e?.message ?? "Ukjent feil");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = !loading && !!stats && !err;
  const status = ready ? "✓" : loading ? "…" : "—";

  const engagementText = useMemo(() => {
    if (!stats) return "—";
    return `${stats.eventsToday} i dag • ${stats.events7d} (7d) • ${stats.events30d} (30d)`;
  }, [stats]);

  return (
    <section id="app-analytics" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sf-muted">App-analyse (internt)</h2>

        <button
          onClick={() => fetchAppStats(true)}
          className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          title="Tving oppdatering"
        >
          Oppdater
        </button>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          App-analyse-feil: {err}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Status"
          icon={ready ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          variant={ready ? "success" : "warning"}
          status={status}
        >
          <p className="text-sm">{ready ? "Oppdatert." : loading ? "Laster…" : "Ingen data ennå."}</p>
          <p className="mt-2 text-xs text-sf-muted">Cache ~{Math.round(CACHE_TTL_MS / 1000)}s.</p>
        </DashboardCard>

        <DashboardCard
          title="Aktive brukere"
          icon={<Users size={18} />}
          status={loading || !stats ? "—" : String(stats.dau)}
          variant="info"
        >
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">
                DAU (i dag): <span className="font-medium">{stats.dau}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                WAU: <span className="font-medium text-sf-text">{stats.wau}</span> • MAU:{" "}
                <span className="font-medium text-sf-text">{stats.mau}</span>
              </p>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Aktivitet" icon={<TrendingUp size={18} />} status={loading || !stats ? "—" : String(stats.events7d)}>
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">{engagementText}</p>
              <p className="mt-2 text-xs text-sf-muted">
                Tester: {stats.testSessions7d} • Smerte: {stats.painEntries7d}
              </p>
              <p className="mt-1 text-xs text-sf-muted">
                Kosthold: {stats.nutritionLogs7d} • Bookinger: {stats.bookings7d}
              </p>
            </>
          )}
        </DashboardCard>

        <DashboardCard
          title="Retention (uke→uke)"
          icon={<Activity size={18} />}
          status={loading || !stats ? "—" : fmtPct01(stats.retentionPct)}
          variant={stats && stats.retentionPct >= 0.3 ? "success" : "warning"}
        >
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">
                Tilbake denne uken: <span className="font-medium">{stats.returningThisWeek}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Forrige uke aktive: <span className="font-medium text-sf-text">{stats.prevWeekActive}</span>
              </p>
            </>
          )}
        </DashboardCard>

        <DashboardCard
          title="Tid i rehabilitering"
          icon={<Timer size={18} />}
          status={loading || !stats ? "—" : `${stats.avgDaysSinceClientCreated}d`}
        >
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">
                Snitt: <span className="font-medium">{stats.avgDaysSinceClientCreated}</span> dager
              </p>
              <p className="mt-2 text-xs text-sf-muted">Basert på klientkonto-opprettelse</p>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Plattform-trender" icon={<BarChart3 size={18} />} variant="info">
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : stats.topPainAreas7d.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen smerteregistreringer siste 7 dager.</p>
          ) : (
            <>
              <p className="text-sm">Topp smerteområder (7d):</p>
              <ul className="mt-2 text-xs text-sf-muted space-y-1">
                {stats.topPainAreas7d.map((x) => (
                  <li key={x.label}>
                    • {x.label}: <span className="font-medium text-sf-text">{x.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Topp klienter (7d)" icon={<Activity size={18} />} variant="info">
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : stats.topClients7d.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen aktivitet.</p>
          ) : (
            <ul className="text-xs text-sf-muted space-y-1">
              {stats.topClients7d.map((x) => (
                <li key={x.id} className="flex justify-between gap-2">
                  <span className="truncate">{x.label}</span>
                  <span className="font-medium text-sf-text">{x.count}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Topp trenere (30d)" icon={<Users size={18} />} variant="info">
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : stats.topTrainers30d.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen booking-data.</p>
          ) : (
            <ul className="text-xs text-sf-muted space-y-1">
              {stats.topTrainers30d.map((x) => (
                <li key={x.id} className="flex justify-between gap-2">
                  <span className="truncate">{x.label}</span>
                  <span className="font-medium text-sf-text">{x.count}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      <p className="text-xs text-sf-muted">
        Internt = DB-events (ikke trafikk). DAU/WAU/MAU og retention er basert på at klienten har gjort minst én
        registrering/booking i perioden.
      </p>
    </section>
  );
}