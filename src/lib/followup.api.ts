"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { calibrate, type CalibratorKind } from "@/lib/calibrator";
import type { CalibrationProfile } from "@/lib/onboarding/calibration";
import type { TrappStage } from "@/lib/trapp/stages";
import type { Zone } from "@/lib/zone/types";

const WINDOW_DAYS = 21;

export type ClientZoneSignals = {
  latestZone: Zone | null;
  latestZoneAcknowledged: boolean;
  firedRulesToday: string[];
  checkedInToday: boolean;
  daysSinceCheckin: number | null;
  yellowCountLast7: number;
  calibratorKind: CalibratorKind | null;
};

export type FollowupSignalsResult = {
  loading: boolean;
  error: string | null;
  byClientId: Record<string, ClientZoneSignals>;
};

const EMPTY: ClientZoneSignals = {
  latestZone: null,
  latestZoneAcknowledged: true,
  firedRulesToday: [],
  checkedInToday: false,
  daysSinceCheckin: null,
  yellowCountLast7: 0,
  calibratorKind: null,
};

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000
  );
}

/**
 * Samler Sonen-/Kalibrator-signaler for en gruppe kunder i noen få batch-
 * spørringer. Kombineres med smerte-/test-/booking-metrikkene i selve
 * oppfølgingsflaten og prioriteres av den rene funksjonen i followup/prioritize.
 */
export function useFollowupSignals(clientIds: string[]): FollowupSignalsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [byClientId, setByClientId] = useState<Record<string, ClientZoneSignals>>({});

  const key = useMemo(() => [...clientIds].sort().join(","), [clientIds]);

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (ids.length === 0) {
      setByClientId({});
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const since = isoDaysAgo(WINDOW_DAYS);
        const today = new Date().toISOString().slice(0, 10);

        const [zoneRes, checkinRes, compRes, trappRes, obRes, calEventRes] = await Promise.all([
          supabase
            .from("zone_history")
            .select("client_id, zone_date, zone, trainer_overridden, inputs_snapshot")
            .in("client_id", ids)
            .gte("zone_date", since)
            .order("zone_date", { ascending: false }),
          supabase
            .from("daily_checkins")
            .select("client_id, checkin_date")
            .in("client_id", ids)
            .gte("checkin_date", since)
            .order("checkin_date", { ascending: false }),
          supabase
            .from("workout_completions")
            .select("client_id, completion_date, status")
            .in("client_id", ids)
            .gte("completion_date", since)
            .order("completion_date", { ascending: false }),
          supabase.from("trapp_state").select("client_id, current_stage").in("client_id", ids),
          supabase
            .from("onboarding_assessments")
            .select("client_id, calibration_profile, created_at")
            .in("client_id", ids)
            .not("completed_at", "is", null)
            .order("created_at", { ascending: false }),
          supabase
            .from("calibrator_events")
            .select("client_id, suggestion_kind, trainer_decision, decided_at")
            .in("client_id", ids)
            .not("decided_at", "is", null)
            .order("decided_at", { ascending: false }),
        ]);

        if (zoneRes.error) throw zoneRes.error;
        if (checkinRes.error) throw checkinRes.error;

        const zonesByClient = new Map<string, typeof zoneRes.data>();
        for (const r of zoneRes.data ?? []) {
          const list = zonesByClient.get(r.client_id) ?? [];
          list.push(r);
          zonesByClient.set(r.client_id, list);
        }

        const checkinByClient = new Map<string, string>(); // client_id -> latest checkin_date
        for (const r of checkinRes.data ?? []) {
          if (!checkinByClient.has(r.client_id)) checkinByClient.set(r.client_id, r.checkin_date);
        }

        const compByClient = new Map<string, { date: string; status: "ja" | "delvis" | "nei" }[]>();
        for (const r of compRes.data ?? []) {
          const list = compByClient.get(r.client_id) ?? [];
          list.push({ date: r.completion_date, status: r.status as "ja" | "delvis" | "nei" });
          compByClient.set(r.client_id, list);
        }

        const stageByClient = new Map<string, TrappStage>();
        for (const r of trappRes.data ?? []) {
          stageByClient.set(r.client_id, r.current_stage as TrappStage);
        }

        const profileByClient = new Map<string, CalibrationProfile>();
        for (const r of obRes.data ?? []) {
          if (!profileByClient.has(r.client_id)) {
            profileByClient.set(r.client_id, r.calibration_profile as CalibrationProfile);
          }
        }

        // Ferske Kalibrator-avgjørelser (< 3 dager): ikke mas om samme forslag igjen.
        const handledKindByClient = new Map<string, string>();
        for (const r of calEventRes.data ?? []) {
          if (handledKindByClient.has(r.client_id) || !r.decided_at) continue;
          if (daysBetween(String(r.decided_at).slice(0, 10), today) < 3) {
            handledKindByClient.set(r.client_id, r.suggestion_kind as string);
          }
        }

        const out: Record<string, ClientZoneSignals> = {};

        for (const id of ids) {
          const zoneRows = zonesByClient.get(id) ?? [];
          const latest = zoneRows[0] ?? null;

          const last7 = zoneRows.filter((z) => daysBetween(z.zone_date, today) <= 7);
          const yellowCountLast7 = last7.filter((z) => z.zone === "yellow").length;

          const latestIsToday = latest ? daysBetween(latest.zone_date, today) === 0 : false;
          const snapshot = (latest?.inputs_snapshot ?? {}) as { firedRules?: unknown };
          const firedRulesToday =
            latestIsToday && Array.isArray(snapshot.firedRules)
              ? (snapshot.firedRules as string[])
              : [];

          const lastCheckin = checkinByClient.get(id) ?? null;
          const daysSinceCheckin = lastCheckin ? daysBetween(lastCheckin, today) : null;

          const stage = stageByClient.get(id) ?? null;
          let calibratorKind: CalibratorKind | null = null;
          if (stage && zoneRows.length >= 2) {
            const lastRed = zoneRows.find((z) => z.zone === "red");
            const kind = calibrate({
              profile: profileByClient.get(id) ?? "standard",
              stage,
              zones: zoneRows.map((z) => ({
                date: z.zone_date,
                zone: z.zone as Zone,
                trainerOverridden: !!z.trainer_overridden,
              })),
              completions: compByClient.get(id) ?? [],
              daysSinceFlare: lastRed
                ? Math.max(0, daysBetween(lastRed.zone_date, today))
                : null,
            }).kind;
            // Ikke mas hvis treneren nettopp tok stilling til akkurat dette forslaget.
            calibratorKind = handledKindByClient.get(id) === kind ? null : kind;
          }

          out[id] = {
            latestZone: (latest?.zone as Zone | undefined) ?? null,
            latestZoneAcknowledged: latest
              ? !!latest.trainer_overridden || daysBetween(latest.zone_date, today) >= 1
              : true,
            firedRulesToday,
            checkedInToday: !!lastCheckin && daysBetween(lastCheckin, today) === 0,
            daysSinceCheckin,
            yellowCountLast7,
            calibratorKind,
          };
        }

        if (alive) setByClientId(out);
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : "Kunne ikke hente oppfølgingssignaler");
          setByClientId({});
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [key]);

  return { loading, error, byClientId };
}

export { EMPTY as EMPTY_ZONE_SIGNALS };
