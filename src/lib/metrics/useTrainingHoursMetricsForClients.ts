"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BookingRow = {
  client_id: string;
  start_time: string;
  status: string | null;
};

export type TrainingHoursMetricsResult = {
  loading: boolean;
  error: string | null;
  hasUpcomingByClientId: Record<string, boolean>;
  missingUpcomingCount: number;
};

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function useTrainingHoursMetricsForClients(args: {
  clientIds: string[];
  daysAhead?: number; // default 30
}) : TrainingHoursMetricsResult {
  const { clientIds, daysAhead = 30 } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BookingRow[]>([]);

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

        const nowISO = new Date().toISOString();
        const toISO = addDaysISO(daysAhead);

        // Antatt tabell: bookings (id, client_id, trainer_id, start_time, status)
        const { data, error: qErr } = await supabase
          .from("bookings")
          .select("client_id, start_time, status")
          .in("client_id", clientIds)
          .gte("start_time", nowISO)
          .lte("start_time", toISO)
          .neq("status", "cancelled");

        if (qErr) throw qErr;

        if (!alive) return;
        setRows((data ?? []) as any[]);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Ukjent feil (bookings)");
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clientIds.join("|"), daysAhead]);

  const { hasUpcomingByClientId, missingUpcomingCount } = useMemo(() => {
    const has: Record<string, boolean> = {};
    for (const id of clientIds) has[id] = false;

    for (const r of rows) {
      if (!r.client_id) continue;
      has[r.client_id] = true;
    }

    let missing = 0;
    for (const id of clientIds) {
      if (!has[id]) missing++;
    }

    return { hasUpcomingByClientId: has, missingUpcomingCount: missing };
  }, [rows, clientIds.join("|")]);

  return { loading, error, hasUpcomingByClientId, missingUpcomingCount };
}