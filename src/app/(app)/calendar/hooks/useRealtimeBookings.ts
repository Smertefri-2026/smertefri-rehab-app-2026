// src/app/(app)/calendar/hooks/useRealtimeBookings.ts
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Role = "client" | "trainer" | "admin" | null;

type Args = {
  role: Role;
  userId: string | null | undefined;

  // admin kontekst
  adminHasSelection: boolean;
  adminTrainerId?: string | null;
  adminClientId?: string | null;

  // fra bookings store
  refreshBookings: () => Promise<void> | void;
};

/**
 * Realtime for bookings:
 * - client: lytter på bookings der client_id = userId
 * - trainer: lytter på bookings der trainer_id = userId
 * - admin: lytter på valgt trainer_id (hvis valgt)
 *
 * Når noe skjer (insert/update/delete): refreshBookings()
 */
export function useRealtimeBookings({
  role,
  userId,
  adminHasSelection,
  adminTrainerId,
  adminClientId,
  refreshBookings,
}: Args) {
  useEffect(() => {
    // Ingen rolle / ingen id = ingen realtime
    if (!role) return;

    // Bestem "scope" vi skal lytte på
    let filter: string | null = null;

    if (role === "client") {
      if (!userId) return;
      filter = `client_id=eq.${userId}`;
    }

    if (role === "trainer") {
      if (!userId) return;
      filter = `trainer_id=eq.${userId}`;
    }

    if (role === "admin") {
      if (!adminHasSelection) return;

      // Primært: valgt trener (kalenderen vises uansett)
      if (adminTrainerId) filter = `trainer_id=eq.${adminTrainerId}`;
      // Hvis admin bare valgte kunde og ikke trener, kan du evt lytte på client_id:
      else if (adminClientId) filter = `client_id=eq.${adminClientId}`;
      else return;
    }

    if (!filter) return;

    let alive = true;
    let raf: number | null = null;

    // Litt debounce så vi ikke spammer refresh ved flere events
    const safeRefresh = () => {
      if (!alive) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        refreshBookings?.();
      });
    };

    const channel = supabase
      .channel(`rt-bookings-${role}-${filter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter,
        },
        () => {
          safeRefresh();
        }
      )
      .subscribe();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      supabase.removeChannel(channel);
    };
  }, [role, userId, adminHasSelection, adminTrainerId, adminClientId, refreshBookings]);
}