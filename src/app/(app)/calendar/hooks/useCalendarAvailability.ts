// src/app/(app)/calendar/hooks/useCalendarAvailability.ts
"use client";

import { useEffect, useState } from "react";
import type { WeeklyAvailability } from "../sections/Section6TrainerAvailability";
import { loadAvailability } from "@/lib/availability";

export function useCalendarAvailability(trainerId: string | null) {
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setAvailabilityError(null);

        if (!trainerId) {
          setAvailability(null);
          return;
        }

        const loaded = await loadAvailability(trainerId);
        if (!cancelled) setAvailability(loaded);
      } catch (e: any) {
        if (!cancelled) {
          setAvailability(null);
          setAvailabilityError(e?.message ?? "Kunne ikke hente tilgjengelighet");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  return { availability, setAvailability, availabilityError };
}