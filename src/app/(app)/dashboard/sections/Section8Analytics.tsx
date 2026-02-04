// src/app/(app)/dashboard/sections/Section8Analytics.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  TrendingUp,
  BarChart3,
  Globe,
  MousePointerClick,
  Activity,
  AlertTriangle,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { useRole } from "@/providers/RoleProvider";

type GAMetrics = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  views: number;
  events: number;
  engagementRate: number; // 0..1
  avgEngagementTimeSec: number;
};

type GAOverview = {
  realtimeActiveUsers: number;
  today: GAMetrics;
  d7: GAMetrics;
  d30: GAMetrics;
  topPages7d: Array<{ path: string; views: number }>;
  topSources7d: Array<{ source: string; medium: string; sessions: number }>;
};

const EMPTY_METRICS: GAMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  views: 0,
  events: 0,
  engagementRate: 0,
  avgEngagementTimeSec: 0,
};

const EMPTY_GA: GAOverview = {
  realtimeActiveUsers: 0,
  today: { ...EMPTY_METRICS },
  d7: { ...EMPTY_METRICS },
  d30: { ...EMPTY_METRICS },
  topPages7d: [],
  topSources7d: [],
};

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function fmtPct01(x: number) {
  if (!Number.isFinite(x)) return "—";
  return `${Math.round(x * 100)}%`;
}

function fmtSecToMin(sec: number) {
  if (!Number.isFinite(sec)) return "—";
  const m = Math.round(sec / 60);
  return `${m} min`;
}

function normalizeMetrics(maybe: any): GAMetrics {
  const m = maybe ?? {};
  return {
    totalUsers: safeNum(m.totalUsers),
    activeUsers: safeNum(m.activeUsers),
    newUsers: safeNum(m.newUsers),
    sessions: safeNum(m.sessions),
    views: safeNum(m.views),
    events: safeNum(m.events),
    engagementRate: Number.isFinite(Number(m.engagementRate)) ? Number(m.engagementRate) : 0,
    avgEngagementTimeSec: safeNum(m.avgEngagementTimeSec),
  };
}

function normalizeGA(maybe: any): GAOverview {
  const x = maybe ?? {};
  return {
    realtimeActiveUsers: safeNum(x.realtimeActiveUsers),
    today: normalizeMetrics(x.today),
    d7: normalizeMetrics(x.d7),
    d30: normalizeMetrics(x.d30),
    topPages7d: Array.isArray(x.topPages7d)
      ? x.topPages7d
          .map((p: any) => ({ path: String(p?.path ?? ""), views: safeNum(p?.views) }))
          .filter((p: any) => p.path)
      : [],
    topSources7d: Array.isArray(x.topSources7d)
      ? x.topSources7d
          .map((s: any) => ({
            source: String(s?.source ?? ""),
            medium: String(s?.medium ?? ""),
            sessions: safeNum(s?.sessions),
          }))
          .filter((s: any) => s.source || s.medium)
      : [],
  };
}

export default function Section8Analytics() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  if (!isAdmin) return null;

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const [gaLoading, setGaLoading] = useState(false);
  const [gaErr, setGaErr] = useState<string | null>(null);
  const [ga, setGa] = useState<GAOverview>(EMPTY_GA);

  const fetchGA = async () => {
    setGaLoading(true);
    setGaErr(null);

    try {
      const res = await fetch("/api/ga/overview", { method: "GET" });

      // Hvis backend feiler og sender HTML/tekst, gi pen feilmelding
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`GA-feil: Ugyldig respons (ikke JSON). Starter med: ${text.slice(0, 60)}`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "GA-feil");

      setGa(normalizeGA(json));
    } catch (e: any) {
      setGaErr(e?.message ?? "Ukjent GA-feil");
      setGa(EMPTY_GA);
    } finally {
      setGaLoading(false);
    }
  };

  useEffect(() => {
    fetchGA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gaToday = ga?.today ?? EMPTY_METRICS;
  const ga7 = ga?.d7 ?? EMPTY_METRICS;
  const ga30 = ga?.d30 ?? EMPTY_METRICS;

  return (
    <section id="ga-analytics" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sf-muted">Google Analytics</h2>

        <button
          onClick={() => fetchGA()}
          className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          title="Tving oppdatering"
        >
          Oppdater
        </button>
      </div>

      {gaErr ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle size={18} className="mt-0.5" />
          <div>{gaErr}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GA4 “sjekk” */}
        <DashboardCard
          title="Google Analytics (GA4)"
          icon={<LineChart size={18} />}
          variant={GA_ID ? "success" : "warning"}
          status={GA_ID ? "✓" : "!"}>
          <p className="text-sm">
            {GA_ID ? (
              <>
                Måling aktiv: <span className="font-medium">{GA_ID}</span>
              </>
            ) : (
              "Mangler NEXT_PUBLIC_GA_ID"
            )}
          </p>
          <p className="mt-2 text-xs text-sf-muted">Rapporter hentes via /api/ga/overview.</p>
        </DashboardCard>

        {/* Realtime */}
        <DashboardCard
          title="Besøk nå"
          icon={<Globe size={18} />}
          variant="info"
          status={gaLoading ? "…" : String(ga.realtimeActiveUsers)}
        >
          <p className="text-sm text-sf-muted">{gaLoading ? "Laster…" : "Aktive brukere siste 30 min"}</p>
        </DashboardCard>

        {/* I dag */}
        <DashboardCard
          title="Trafikk i dag"
          icon={<MousePointerClick size={18} />}
          status={gaLoading ? "…" : String(gaToday.sessions)}
        >
          {gaLoading ? (
            <p className="text-sm text-sf-muted">Laster…</p>
          ) : (
            <>
              <p className="text-sm">
                Brukere: <span className="font-medium">{gaToday.totalUsers}</span> • Nye:{" "}
                <span className="font-medium">{gaToday.newUsers}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Sesjoner: {gaToday.sessions} • Visninger: {gaToday.views}
              </p>
            </>
          )}
        </DashboardCard>

        {/* 7d */}
        <DashboardCard title="GA siste 7 dager" icon={<TrendingUp size={18} />} variant="success">
          {gaLoading ? (
            <p className="text-sm text-sf-muted">Laster…</p>
          ) : (
            <>
              <p className="text-sm">
                Brukere: <span className="font-medium">{ga7.totalUsers}</span> • Aktive:{" "}
                <span className="font-medium">{ga7.activeUsers}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Sesjoner: {ga7.sessions} • Visninger: {ga7.views} • Events: {ga7.events}
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Engasjement: {fmtPct01(ga7.engagementRate)} • Snitt tid: {fmtSecToMin(ga7.avgEngagementTimeSec)}
              </p>
            </>
          )}
        </DashboardCard>

        {/* 30d */}
        <DashboardCard title="GA siste 30 dager" icon={<LineChart size={18} />}>
          {gaLoading ? (
            <p className="text-sm text-sf-muted">Laster…</p>
          ) : (
            <>
              <p className="text-sm">
                Brukere: <span className="font-medium">{ga30.totalUsers}</span> • Nye:{" "}
                <span className="font-medium">{ga30.newUsers}</span>
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                Sesjoner: {ga30.sessions} • Visninger: {ga30.views}
              </p>
            </>
          )}
        </DashboardCard>

        {/* Toppsider */}
        <DashboardCard title="Toppsider (7d)" icon={<BarChart3 size={18} />} variant="info">
          {gaLoading ? (
            <p className="text-sm text-sf-muted">Laster…</p>
          ) : ga.topPages7d.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen data.</p>
          ) : (
            <ul className="text-xs text-sf-muted space-y-1">
              {ga.topPages7d.map((p) => (
                <li key={p.path} className="flex justify-between gap-2">
                  <span className="truncate">{p.path}</span>
                  <span className="font-medium text-sf-text">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        {/* Trafikkilder */}
        <DashboardCard title="Trafikkilder (7d)" icon={<Activity size={18} />} variant="info">
          {gaLoading ? (
            <p className="text-sm text-sf-muted">Laster…</p>
          ) : ga.topSources7d.length === 0 ? (
            <p className="text-sm text-sf-muted">Ingen data.</p>
          ) : (
            <ul className="text-xs text-sf-muted space-y-1">
              {ga.topSources7d.map((s) => (
                <li key={`${s.source}/${s.medium}`} className="flex justify-between gap-2">
                  <span className="truncate">
                    {s.source} / {s.medium}
                  </span>
                  <span className="font-medium text-sf-text">{s.sessions}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      <p className="text-xs text-sf-muted">
        Dette er ekte trafikkdata fra GA4 Data API. For full dybde: åpne GA-konsollen (Realtime, Geo, Funnels, etc.).
      </p>
    </section>
  );
}