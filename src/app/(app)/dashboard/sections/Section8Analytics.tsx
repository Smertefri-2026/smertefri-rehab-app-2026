"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, LineChart, BarChart3, Timer, Activity, CheckCircle2, AlertTriangle } from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { supabase } from "@/lib/supabaseClient";
import { yyyyMmDd } from "@/modules/nutrition/storage";
import { useRole } from "@/providers/RoleProvider";

type AnalyticsStats = {
  totalClients: number;

  activeClients7d: number;
  events7d: number;

  testSessions7d: number;
  painEntries7d: number;
  nutritionLogs7d: number;
  bookings7d: number;

  avgDaysSinceClientCreated: number;

  topPainAreas7d: Array<{ label: string; count: number }>;
};

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min
let _cache: { ts: number; data: AnalyticsStats } | null = null;

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

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function Section8Analytics() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  if (!isAdmin) return null;

  // GA4 env (vises kun som “satt/ikke satt”)
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  const fetchStats = async (force = false) => {
    if (!isAdmin) return;

    if (!force && _cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
      setStats(_cache.data);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      // 1) finn alle klienter
      const { data: clients, error: cErr } = await supabase
        .from("profiles")
        .select("id, created_at")
        .eq("role", "client");

      if (cErr) throw cErr;

      const clientIds = (clients ?? []).map((c: any) => c.id).filter(Boolean);
      const totalClients = clientIds.length;

      if (!totalClients) {
        const empty: AnalyticsStats = {
          totalClients: 0,
          activeClients7d: 0,
          events7d: 0,
          testSessions7d: 0,
          painEntries7d: 0,
          nutritionLogs7d: 0,
          bookings7d: 0,
          avgDaysSinceClientCreated: 0,
          topPainAreas7d: [],
        };
        setStats(empty);
        _cache = { ts: Date.now(), data: empty };
        return;
      }

      // 2) tidsvinduer
      const fromTS = daysAgoISO(6);
      const fromDay = dayISO(6);
      const todayDay = yyyyMmDd(new Date());

      // 3) hente “events”
      const [testsRes, painRes, nutRes, bookRes] = await Promise.all([
        supabase
          .from("test_sessions")
          .select("id, client_id, created_at")
          .in("client_id", clientIds)
          .gte("created_at", fromTS),

        supabase
          .from("pain_entries")
          .select("id, client_id, created_at, area_label, area_key")
          .in("client_id", clientIds)
          .gte("created_at", fromTS),

        supabase
          .from("nutrition_days")
          .select("id, user_id, day_date, calories_kcal, protein_g, fat_g, carbs_g")
          .in("user_id", clientIds)
          .gte("day_date", fromDay)
          .lte("day_date", todayDay),

        supabase
          .from("bookings")
          .select("id, client_id, created_at, start_time")
          .in("client_id", clientIds)
          .gte("created_at", fromTS),
      ]);

      if (testsRes.error) throw testsRes.error;
      if (painRes.error) throw painRes.error;
      if (nutRes.error) throw nutRes.error;
      if (bookRes.error) throw bookRes.error;

      const testRows = (testsRes.data ?? []) as any[];
      const painRows = (painRes.data ?? []) as any[];
      const nutRows = (nutRes.data ?? []) as any[];
      const bookRows = (bookRes.data ?? []) as any[];

      // nutritionLogs7d: tell kun rader med noe data (makroer/kcal)
      const nutritionLogs7d = nutRows.filter((r) => {
        const kcal = safeNum(r.calories_kcal);
        const p = safeNum(r.protein_g);
        const f = safeNum(r.fat_g);
        const k = safeNum(r.carbs_g);
        return kcal > 0 || p > 0 || f > 0 || k > 0;
      });

      // aktive klienter (7d) = har minst ett event
      const activeSet = new Set<string>();
      for (const r of testRows) if (r.client_id) activeSet.add(String(r.client_id));
      for (const r of painRows) if (r.client_id) activeSet.add(String(r.client_id));
      for (const r of nutritionLogs7d) if (r.user_id) activeSet.add(String(r.user_id));
      for (const r of bookRows) if (r.client_id) activeSet.add(String(r.client_id));

      const activeClients7d = activeSet.size;

      const testSessions7d = testRows.length;
      const painEntries7d = painRows.length;
      const bookings7d = bookRows.length;
      const nutritionLogs7dCount = nutritionLogs7d.length;

      const events7d = testSessions7d + painEntries7d + bookings7d + nutritionLogs7dCount;

      // snitt dager siden klient ble opprettet
      const now = Date.now();
      const days = (clients ?? []).map((c: any) => {
        const t = new Date(c.created_at ?? 0).getTime();
        if (!t || Number.isNaN(t)) return 0;
        return Math.max(0, Math.round((now - t) / (1000 * 60 * 60 * 24)));
      });

      const avgDaysSinceClientCreated =
        days.length ? Math.round(days.reduce((a: number, b: number) => a + b, 0) / days.length) : 0;

      // topp smerteområder (7d)
      const areaCount = new Map<string, number>();
      for (const r of painRows) {
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

      const out: AnalyticsStats = {
        totalClients,
        activeClients7d,
        events7d,
        testSessions7d,
        painEntries7d,
        nutritionLogs7d: nutritionLogs7dCount,
        bookings7d,
        avgDaysSinceClientCreated,
        topPainAreas7d,
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
    fetchStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const engagementText = useMemo(() => {
    if (!stats) return "—";
    return `${stats.events7d} registreringer siste 7 dager`;
  }, [stats]);

  const allOk = !loading && !!stats && !err;

  return (
    <section id="analytics" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sf-muted">Analyse & innsikt</h2>

        <button
          onClick={() => fetchStats(true)}
          className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          title="Tving oppdatering"
        >
          Oppdater
        </button>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Analytics-feil: {err}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Systemstatus (liten, ryddig “OK”) */}
        {allOk ? (
          <DashboardCard title="Status" icon={<CheckCircle2 size={18} />} variant="success" status="✓">
            <p className="text-sm">Innsikt er oppdatert.</p>
            <p className="mt-2 text-xs text-sf-muted">Cache ~{Math.round(CACHE_TTL_MS / 1000)}s.</p>
          </DashboardCard>
        ) : (
          <DashboardCard title="Status" icon={<AlertTriangle size={18} />} variant="warning" status={loading ? "…" : "—"}>
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "Ingen data ennå"}</p>
            <p className="mt-2 text-xs text-sf-muted">Trykk “Oppdater” ved behov.</p>
          </DashboardCard>
        )}

        <DashboardCard title="Aktivitet (7 dager)" icon={<TrendingUp size={18} />} status={loading || !stats ? "—" : String(stats.events7d)}>
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">
                Tester: <span className="font-medium">{stats.testSessions7d}</span> • Smerte:{" "}
                <span className="font-medium">{stats.painEntries7d}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Kosthold: {stats.nutritionLogs7d} • Bookinger: {stats.bookings7d}
              </p>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Engasjement" icon={<Activity size={18} />} status={loading || !stats ? "—" : `${stats.activeClients7d}/${stats.totalClients}`}>
          {loading || !stats ? (
            <p className="text-sm text-sf-muted">{loading ? "Laster…" : "—"}</p>
          ) : (
            <>
              <p className="text-sm">
                Aktive klienter: <span className="font-medium">{stats.activeClients7d}</span> / {stats.totalClients}
              </p>
              <p className="mt-2 text-xs text-sf-muted">{engagementText}</p>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Tid i rehabilitering" icon={<Timer size={18} />} status={loading || !stats ? "—" : `${stats.avgDaysSinceClientCreated}d`}>
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

        {/* GA4 “sjekk” (viser bare om du har satt env) */}
        <DashboardCard title="Google Analytics (GA4)" icon={<LineChart size={18} />} variant={GA_ID ? "success" : "warning"} status={GA_ID ? "✓" : "!"}>
          <p className="text-sm">
            {GA_ID ? (
              <>
                Måling aktiv: <span className="font-medium">{GA_ID}</span>
              </>
            ) : (
              "Mangler NEXT_PUBLIC_GA_ID"
            )}
          </p>
          <p className="mt-2 text-xs text-sf-muted">
            Sett env-var + legg inn tag i app/layout.tsx (se oppskriften under).
          </p>
        </DashboardCard>

        <DashboardCard title="Rapporter" icon={<LineChart size={18} />}>
          <p className="text-sm">PDF / CSV</p>
          <p className="mt-2 text-xs text-sf-muted">Kommer etter at test/journal er helt stabil</p>
        </DashboardCard>
      </div>

      <p className="text-xs text-sf-muted">
        Tallene her er “headcounts” (raske). Cache: ~{Math.round(CACHE_TTL_MS / 1000)}s. “Oppdater” tvinger ny henting.
      </p>
    </section>
  );
}