"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PainRow = {
  client_id: string;
  intensity: number | string | null;
  entry_date: string | null;
  created_at: string | null;
  is_active: boolean | null;
};

export type PainFilterKey = "high" | "up" | "stale" | "none";

export type PainClientMetrics = {
  clientId: string;

  lastEntryAt: string | null;
  daysSinceLastEntry: number | null;

  // high pain: latest entry within last 7 days >= threshold
  latest7Intensity: number | null;

  // increasing: avg last 7 days > avg previous 7 days
  avgLast7: number | null;
  avgPrev7: number | null;

  isHigh: boolean;
  isUp: boolean;
  isStale: boolean;
};

export type PainClientMetricsResult = {
  loading: boolean;
  error: string | null;
  byClientId: Record<string, PainClientMetrics>;
  stats: {
    high: number;
    up: number;
    stale: number;
    totalClients: number;
  };
};

function isoFromRow(r: Pick<PainRow, "entry_date" | "created_at">) {
  const raw = (r.entry_date ?? r.created_at ?? "") as string;
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

function daysSinceISO(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function avg(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function usePainMetricsForClients(args: {
  clientIds: string[];
  highThreshold?: number; // default 7
  staleDays?: number; // default 10 (ingen registrering siste X dager)
}) : PainClientMetricsResult {
  const { clientIds, highThreshold = 7, staleDays = 10 } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PainRow[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError(null);

        if (!clientIds?.length) {
          setRows([]);
          return;
        }

        setLoading(true);

        // Vi trenger minst 14 dager for trend + staleDays for "mangler journal"
        // Fetch siste ~14 dager (active), sort desc så “find latest” blir enkelt.
        const from14 = daysAgoISO(13); // inkl i dag = 14 dager

        const { data, error: qErr } = await supabase
          .from("pain_entries")
          .select("client_id, intensity, entry_date, created_at, is_active")
          .in("client_id", clientIds)
          .eq("is_active", true)
          .gte("entry_date", from14)
          .order("created_at", { ascending: false });

        if (qErr) throw qErr;

        if (!alive) return;
        setRows((data ?? []) as any[]);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Ukjent feil");
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clientIds.join("|"), highThreshold, staleDays]);

  const { byClientId, stats } = useMemo(() => {
    const byClient: Record<string, PainRow[]> = {};
    for (const r of rows) {
      const cid = r.client_id;
      if (!cid) continue;
      if (!byClient[cid]) byClient[cid] = [];
      byClient[cid].push(r);
    }

    const from14 = daysAgoISO(13);
    const from7 = daysAgoISO(6);
    const from10 = daysAgoISO(staleDays - 1);

    const out: Record<string, PainClientMetrics> = {};

    let high = 0;
    let up = 0;
    let stale = 0;

    for (const cid of clientIds) {
      const list = (byClient[cid] ?? []).map((r) => ({
        ...r,
        iso: isoFromRow(r),
        intensityNum: Number(r.intensity),
      }));

      // last entry (innenfor de 14 dagene vi har hentet)
      const lastISO = list.length ? list[0].iso : null;
      const daysSince = daysSinceISO(lastISO);

      const isStale = !list.some((x) => x.iso && x.iso >= from10);

      const latest7 = list.find((x) => x.iso && x.iso >= from7);
      const latest7Intensity =
        latest7 && Number.isFinite(latest7.intensityNum) ? latest7.intensityNum : null;

      const isHigh = latest7Intensity != null && latest7Intensity >= highThreshold;

      const last7 = list
        .filter((x) => x.iso && x.iso >= from7)
        .filter((x) => Number.isFinite(x.intensityNum))
        .map((x) => x.intensityNum);

      const prev7 = list
        .filter((x) => x.iso && x.iso >= from14 && x.iso < from7)
        .filter((x) => Number.isFinite(x.intensityNum))
        .map((x) => x.intensityNum);

      const a1 = avg(last7);
      const a2 = avg(prev7);

      const isUp = a1 != null && a2 != null && a1 > a2;

      if (isHigh) high++;
      if (isUp) up++;
      if (isStale) stale++;

      out[cid] = {
        clientId: cid,
        lastEntryAt: lastISO,
        daysSinceLastEntry: daysSince,
        latest7Intensity,
        avgLast7: a1,
        avgPrev7: a2,
        isHigh,
        isUp,
        isStale,
      };
    }

    return {
      byClientId: out,
      stats: {
        high,
        up,
        stale,
        totalClients: clientIds.length,
      },
    };
  }, [rows, clientIds.join("|"), highThreshold, staleDays]);

  return { loading, error, byClientId, stats };
}