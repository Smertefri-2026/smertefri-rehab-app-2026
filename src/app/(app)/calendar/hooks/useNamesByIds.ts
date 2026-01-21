// src/app/(app)/calendar/hooks/useNamesByIds.ts
"use client";

import { useEffect, useState } from "react";
import { getProfilesByIds } from "@/lib/profile";
import type { Booking } from "@/types/booking";

type Args = {
  bookings: Booking[];
  extraIds?: Array<string | null | undefined>;
};

/**
 * Lager en cache: { [id]: "Fornavn Etternavn" }
 * Basert på bookings + evt ekstra ID-er (admin valgt kunde/trener etc).
 */
export function useNamesByIds({ bookings, extraIds = [] }: Args) {
  const [namesById, setNamesById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = Array.from(
          new Set(
            [
              ...(bookings ?? []).flatMap((b) => [b.client_id, b.trainer_id]),
              ...extraIds,
            ].filter(Boolean)
          )
        ) as string[];

        if (!ids.length) return;

        const rows = await getProfilesByIds(ids);

        const map: Record<string, string> = {};
        for (const r of rows) {
          const n = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
          map[r.id] = n || r.id;
        }

        if (!cancelled) {
          setNamesById((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.warn("useNamesByIds: getProfilesByIds failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookings, ...extraIds]);

  return namesById;
}