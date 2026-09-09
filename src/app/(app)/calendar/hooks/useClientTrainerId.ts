// src/app/(app)/calendar/hooks/useClientTrainerId.ts
"use client";

import { useEffect, useState } from "react";
import { getActiveTrainerIdForClient } from "@/lib/assignments.api";

/**
 * Henter innlogget kundes aktivt tildelte trener-id (client_trainer_assignments).
 * Returnerer null hvis ikke client / mangler userId / ingen aktiv tildeling.
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

        const trainerId = await getActiveTrainerIdForClient(userId);
        if (alive) setClientTrainerId(trainerId);
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
