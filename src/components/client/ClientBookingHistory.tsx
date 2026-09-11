"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchBookingsForClient } from "@/lib/bookings.api";
import type { Booking } from "@/types/booking";

const STATUS_LABEL: Record<Booking["status"], string> = {
  planned: "Planlagt",
  confirmed: "Bekreftet",
  completed: "Gjennomført",
  cancelled: "Avlyst",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Rehabtrener/admin: kundens neste og tidligere timer, samlet på kundekortet. */
export default function ClientBookingHistory({ clientId }: { clientId: string }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [showAllPast, setShowAllPast] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchBookingsForClient(clientId)
      .then((b) => alive && setBookings(b))
      .catch(() => alive && setBookings([]));
    return () => {
      alive = false;
    };
  }, [clientId]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const list = bookings ?? [];
    return {
      upcoming: list
        .filter((b) => b.status !== "cancelled" && new Date(b.start_time).getTime() >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
      past: list
        .filter((b) => new Date(b.start_time).getTime() < now || b.status === "cancelled")
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    };
  }, [bookings]);

  if (bookings === null) return null;

  const visiblePast = showAllPast ? past : past.slice(0, 3);

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-ink-soft">Timer</h2>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Kommende</p>
        {upcoming.length === 0 ? (
          <p className="mt-1 text-sm text-ink-faint">Ingen kommende timer booket.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{formatDateTime(b.start_time)} · {b.duration} min</span>
                <span className="text-xs text-ink-faint">{STATUS_LABEL[b.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Tidligere</p>
        {past.length === 0 ? (
          <p className="mt-1 text-sm text-ink-faint">Ingen tidligere timer enda.</p>
        ) : (
          <>
            <ul className="mt-1 space-y-1">
              {visiblePast.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{formatDateTime(b.start_time)} · {b.duration} min</span>
                  <span className="text-xs text-ink-faint">{STATUS_LABEL[b.status]}</span>
                </li>
              ))}
            </ul>
            {past.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllPast((v) => !v)}
                className="mt-2 text-xs font-medium text-primary-ink hover:underline"
              >
                {showAllPast ? "Vis mindre" : `Vis alle (${past.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
