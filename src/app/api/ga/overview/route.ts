// src/app/api/ga/overview/route.ts
import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export const runtime = "nodejs";

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET() {
  try {
    const propertyId = getEnv("GA4_PROPERTY_ID"); // numbers only
    const clientEmail = getEnv("GA_CLIENT_EMAIL");
    const privateKeyRaw = getEnv("GA_PRIVATE_KEY");

    // Private key often needs newline fix when stored in env
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    const property = `properties/${propertyId}`;

    // Basic overview: users, sessions, pageviews last 7d + last 30d
    const [report7d, report30d, reportToday] = await Promise.all([
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }),
    ]);

    const toNums = (r: any) => {
      const mv = r?.rows?.[0]?.metricValues ?? [];
      return {
        activeUsers: Number(mv?.[0]?.value ?? 0),
        sessions: Number(mv?.[1]?.value ?? 0),
        pageViews: Number(mv?.[2]?.value ?? 0),
      };
    };

    // Top pages (7d)
    const [topPages7d] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    });

    const pages =
      (topPages7d.rows ?? []).map((row: any) => ({
        path: row.dimensionValues?.[0]?.value ?? "/",
        views: Number(row.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    return NextResponse.json({
      ok: true,
      today: toNums(reportToday),
      last7d: toNums(report7d),
      last30d: toNums(report30d),
      topPages7d: pages,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown GA error" },
      { status: 500 }
    );
  }
}