// src/app/(app)/calendar/hooks/useClientTrainerId.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Henter trainer_id for innlogget client (fra profiles.trainer_id)
 * Returnerer null hvis ikke client / mangler userId / ingen trainer koblet.
 */
export function useClientTrainerId(role: string | null, userId: string | null | undefined) {
  const [clientTrainerId, setClientTrainerId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (role !== "client" || !userId) {
          if (alive) setClientTrainerId(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("trainer_id")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (alive) setClientTrainerId((data?.trainer_id as string) ?? null);
      } catch (e: any) {
        console.warn("useClientTrainerId: kunne ikke hente trainer_id:", e?.message);
        if (alive) setClientTrainerId(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  return clientTrainerId;
}