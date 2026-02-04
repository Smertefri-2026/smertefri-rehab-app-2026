// src/app/api/ga/overview/route.ts
import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export const runtime = "nodejs";

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

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

function num(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function metricMapFromReport(report: any, metricNames: string[]): Record<string, number> {
  const mv = report?.rows?.[0]?.metricValues ?? [];
  const out: Record<string, number> = {};
  for (let i = 0; i < metricNames.length; i++) out[metricNames[i]] = num(mv?.[i]?.value ?? 0);
  return out;
}

function toGAMetrics(report: any): GAMetrics {
  // Må være i samme rekkefølge som i runReport-metrikklisten under
  const names = [
    "totalUsers",
    "activeUsers",
    "newUsers",
    "sessions",
    "screenPageViews",
    "eventCount",
    "engagementRate",
    "averageSessionDuration",
  ];
  const m = metricMapFromReport(report, names);

  return {
    totalUsers: m.totalUsers ?? 0,
    activeUsers: m.activeUsers ?? 0,
    newUsers: m.newUsers ?? 0,
    sessions: m.sessions ?? 0,
    views: m.screenPageViews ?? 0,
    events: m.eventCount ?? 0,
    engagementRate: m.engagementRate ?? 0,
    // averageSessionDuration er i sekunder
    avgEngagementTimeSec: m.averageSessionDuration ?? 0,
  };
}

export async function GET() {
  try {
    const propertyId = getEnv("GA4_PROPERTY_ID"); // numbers only
    const clientEmail = getEnv("GA_CLIENT_EMAIL");
    const privateKeyRaw = getEnv("GA_PRIVATE_KEY");

    // Private key trenger ofte newline-fix når lagret i env
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    const property = `properties/${propertyId}`;

    const commonMetrics = [
      { name: "totalUsers" },
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "eventCount" },
      { name: "engagementRate" },
      { name: "averageSessionDuration" },
    ];

    // 1) Today / 7d / 30d
    const [reportToday, report7d, report30d] = await Promise.all([
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: commonMetrics,
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: commonMetrics,
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: commonMetrics,
      }),
    ]);

    const today = toGAMetrics(reportToday);
    const d7 = toGAMetrics(report7d);
    const d30 = toGAMetrics(report30d);

    // 2) Realtime: aktive brukere siste 30 min
    let realtimeActiveUsers = 0;
    try {
      const [rt] = await analyticsDataClient.runRealtimeReport({
        property,
        metrics: [{ name: "activeUsers" }],
      });
      realtimeActiveUsers = num(rt?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    } catch {
      // Realtime kan feile uten at resten skal feile
      realtimeActiveUsers = 0;
    }

    // 3) Top pages (7d)
    const [topPagesReport] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    });

    const topPages7d =
      (topPagesReport?.rows ?? []).map((row: any) => ({
        path: String(row?.dimensionValues?.[0]?.value ?? "/"),
        views: num(row?.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    // 4) Top sources (7d) – source/medium
    const [sourcesReport] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    });

    const topSources7d =
      (sourcesReport?.rows ?? []).map((row: any) => ({
        source: String(row?.dimensionValues?.[0]?.value ?? "(direct)"),
        medium: String(row?.dimensionValues?.[1]?.value ?? "(none)"),
        sessions: num(row?.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    // ✅ Shape matcher frontend (Section8Analytics.tsx)
    return NextResponse.json({
      realtimeActiveUsers,
      today,
      d7,
      d30,
      topPages7d,
      topSources7d,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown GA error" },
      { status: 500 }
    );
  }
}