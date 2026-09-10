"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import { ZoneBadge } from "@/ui/components/ZoneBadge";
import { getTodayCheckin, getTodayZone, type ZoneHistoryRow } from "@/lib/zone.api";

/** Sonen-status øverst på kundens «Min SmerteFri». */
export default function SectionZoneToday() {
  const { role, userId } = useRole();
  const [zone, setZone] = useState<ZoneHistoryRow | null>(null);
  const [hasCheckin, setHasCheckin] = useState<boolean | null>(null);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;
    (async () => {
      try {
        const [z, c] = await Promise.all([getTodayZone(userId), getTodayCheckin(userId)]);
        if (!alive) return;
        setZone(z);
        setHasCheckin(!!c);
      } catch {
        if (alive) setHasCheckin(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || hasCheckin === null) return null;

  return (
    <section>
      {zone ? (
        <Link
          href="/sonen"
          className="block rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink-soft">Sonen din i dag</h2>
            <ZoneBadge zone={zone.zone} />
          </div>
          <p className="mt-2 text-sm text-ink-soft">{zone.computed_reason}</p>
        </Link>
      ) : (
        <Link
          href="/sonen"
          className="block rounded-lg border border-transparent bg-primary-subtle p-5 shadow-card transition hover:shadow-pop"
        >
          <h2 className="text-sm font-semibold text-primary-ink">Gjør dagens innsjekk</h2>
          <p className="mt-1 text-sm text-ink-soft">
            30 sekunder — så vet du (og rehabtreneren din) hvordan du bør trene i dag.
          </p>
        </Link>
      )}
    </section>
  );
}
