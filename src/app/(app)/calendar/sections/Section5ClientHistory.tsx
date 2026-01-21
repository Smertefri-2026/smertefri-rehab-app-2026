// src/app/(app)/calendar/sections/Section5ClientHistory.tsx
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
  const tf = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${tf.format(start)} – ${tf.format(end)}`;
}

function getEndTime(b: any) {
  const start = new Date(b.start_time);
  if (b.end_time) return new Date(b.end_time);
  const mins = Number(b.duration ?? 50);
  return new Date(start.getTime() + mins * 60_000);
}

export default function Section5ClientHistory({ onEditBooking }: Props) {
  const { userId } = useRole();
  const { bookings } = useBookings();
  const [visibleCount, setVisibleCount] = useState(5);

  const history = useMemo(() => {
    const now = Date.now();
    return (bookings ?? [])
      .filter((b) => b.client_id === userId)
      .filter((b) => new Date(b.start_time).getTime() < now)
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      ) as Booking[];
  }, [bookings, userId]);

  const visible = history.slice(0, visibleCount);
  const hasMore = history.length > visibleCount;

  return (
    <section className="w-full">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-sf-text">Tidligere timer</h3>
            <span className="text-xs text-sf-muted whitespace-nowrap">
              {history.length ? `${history.length} totalt` : "Ingen historikk"}
            </span>
          </div>

          <div className="space-y-3">
            {visible.map((b) => {
              const start = new Date(b.start_time);
              const end = getEndTime(b);
              const dateLabel = formatDateLabel(start);
              const timeLabel = formatTimeRange(start, end);

              const isCancelled = b.status === "cancelled";

              return (
                <div
                  key={b.id}
                  className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-sf-border px-4 py-3 ${
                    isCancelled ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sf-text">
                      {dateLabel}
                    </span>
                    <span className="text-xs text-sf-muted">
                      {timeLabel} • {b.duration} min
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span
                      className={`min-w-[110px] text-center rounded-full px-3 py-1 text-xs ${
                        isCancelled
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isCancelled ? "Avlyst" : "Fullført"}
                    </span>

                    {/* Valgfritt: åpne samme dialog, men historikk er mest “visning” */}
                    {onEditBooking ? (
                      <button
                        type="button"
                        onClick={() => onEditBooking(b.id)}
                        className="rounded-lg border border-sf-border px-3 py-2 text-xs hover:bg-sf-soft"
                      >
                        Se
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {!history.length ? (
              <div className="rounded-xl border border-dashed border-sf-border px-4 py-6 text-center">
                <p className="text-sm text-sf-muted">Ingen tidligere timer enda.</p>
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
    </section>
  );
}