// src/app/(app)/calendar/sections/Section4ClientUpcoming.tsx
"use client";

import { useMemo, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useBookings } from "@/stores/bookings.store";
import type { Booking } from "@/types/booking";

type Props = {
  onEditBooking?: (bookingId: string) => void;
};

function formatDateLabel(d: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

function formatTimeRange(start: Date, end: Date) {
  const tf = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${tf.format(start)} – ${tf.format(end)}`;
}

function getEndTime(b: any) {
  const start = new Date(b.start_time);
  if (b.end_time) return new Date(b.end_time);
  const mins = Number(b.duration ?? 50);
  return new Date(start.getTime() + mins * 60_000);
}

export default function Section4ClientUpcoming({ onEditBooking }: Props) {
  const { userId } = useRole();
  const { bookings } = useBookings();
  const [visibleCount, setVisibleCount] = useState(5);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (bookings ?? [])
      .filter((b) => b.client_id === userId)
      .filter((b) => b.status !== "cancelled")
      .filter((b) => new Date(b.start_time).getTime() >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) as Booking[];
  }, [bookings, userId]);

  const visible = upcoming.slice(0, visibleCount);
  const hasMore = upcoming.length > visibleCount;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-sf-text">Kommende timer</h3>
            <span className="text-xs text-sf-muted whitespace-nowrap">
              {upcoming.length ? `${upcoming.length} totalt` : "Ingen planlagte"}
            </span>
          </div>

          <div className="space-y-3">
            {visible.map((b) => {
              const start = new Date(b.start_time);
              const end = getEndTime(b);

              const dateLabel = formatDateLabel(start);
              const timeLabel = formatTimeRange(start, end);

              // 24t-regel for kunde (kan ikke endre/avlyse innen 24 timer)
              const canModify = start.getTime() - Date.now() >= 24 * 60 * 60 * 1000;

              const btnBase =
                "rounded-lg border px-3 py-2 text-xs";
              const btnEnabled = "border-sf-border hover:bg-sf-soft";
              const btnDisabled = "border-sf-border opacity-50 cursor-not-allowed bg-gray-50";

              const dangerEnabled = "border-red-200 text-red-700 hover:bg-red-50";
              const dangerDisabled = "border-red-200 text-red-300 bg-red-50/40 opacity-60 cursor-not-allowed";

              return (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-sf-border px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sf-text">{dateLabel}</span>
                    <span className="text-xs text-sf-muted">
                      {timeLabel} • {b.duration} min
                    </span>
                    {!canModify ? (
                      <span className="mt-1 text-[11px] text-sf-muted">
                        Kan ikke endres/avlyses mindre enn 24 timer før.
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={!canModify}
                      onClick={() => canModify && onEditBooking?.(b.id)}
                      className={`${btnBase} ${canModify ? btnEnabled : btnDisabled}`}
                    >
                      Endre
                    </button>

                    <button
                      type="button"
                      disabled={!canModify}
                      onClick={() => canModify && onEditBooking?.(b.id)}
                      className={`${btnBase} ${canModify ? dangerEnabled : dangerDisabled}`}
                    >
                      Avlys
                    </button>
                  </div>
                </div>
              );
            })}

            {!upcoming.length ? (
              <div className="rounded-xl border border-dashed border-sf-border px-4 py-6 text-center">
                <p className="text-sm text-sf-muted">Ingen kommende timer akkurat nå.</p>
              </div>
            ) : null}

            {hasMore ? (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className="rounded-full border border-sf-border px-4 py-2 text-sm hover:bg-sf-soft"
                >
                  Last inn flere
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}