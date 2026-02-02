"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type NutritionClientMetricsResult = {
  loading: boolean;
  error: string | null;
  hasProfileByClientId: Record<string, boolean>;
  missingCount: number;
};

export function useNutritionMetricsForClients(args: { clientIds: string[] }) : NutritionClientMetricsResult {
  const { clientIds } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userIdsWithProfile, setUserIdsWithProfile] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError(null);

        if (!clientIds?.length) {
          setUserIdsWithProfile(new Set());
          return;
        }

        setLoading(true);

        const { data, error: qErr } = await supabase
          .from("nutrition_profiles")
          .select("user_id")
          .in("user_id", clientIds);

        if (qErr) throw qErr;

        const set = new Set<string>((data ?? []).map((r: any) => r.user_id).filter(Boolean));
        if (!alive) return;
        setUserIdsWithProfile(set);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Ukjent feil");
        setUserIdsWithProfile(new Set());
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clientIds.join("|")]);

  const { hasProfileByClientId, missingCount } = useMemo(() => {
    const map: Record<string, boolean> = {};
    let missing = 0;

    for (const id of clientIds) {
      const has = userIdsWithProfile.has(id);
      map[id] = has;
      if (!has) missing++;
    }

    return { hasProfileByClientId: map, missingCount: missing };
  }, [clientIds.join("|"), userIdsWithProfile]);

  return { loading, error, hasProfileByClientId, missingCount };
}