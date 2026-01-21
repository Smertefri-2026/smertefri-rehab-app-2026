// src/app/(app)/calendar/hooks/useCalendarAvailability.ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { WeeklyAvailability } from "../sections/Section6TrainerAvailability";
import { loadAvailability } from "@/lib/availability";
import { supabase } from "@/lib/supabaseClient";

export function useCalendarAvailability(trainerId: string | null) {
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Hindrer at vi refresher altfor ofte ved flere realtime events
  const refreshTimer = useRef<number | null>(null);

  async function refresh() {
    try {
      setAvailabilityError(null);

      if (!trainerId) {
        setAvailability(null);
        return;
      }

      const loaded = await loadAvailability(trainerId);
      setAvailability(loaded);
    } catch (e: any) {
      setAvailability(null);
      setAvailabilityError(e?.message ?? "Kunne ikke hente tilgjengelighet");
    }
  }

  // initial load når trainerId endrer seg
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await refresh();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId]);

  // ✅ realtime subscription (availability)
  useEffect(() => {
    if (!trainerId) return;

    const filter = `trainer_id=eq.${trainerId}`;

    const scheduleRefresh = () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => {
        refresh();
      }, 150);
    };

    const channel = supabase
      .channel(`rt-availability-${trainerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trainer_weekly_availability",
          filter,
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId]);

  return { availability, setAvailability, availabilityError };
}