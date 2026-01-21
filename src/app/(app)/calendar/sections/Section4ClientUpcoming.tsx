// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section4ClientUpcoming.tsx
"use client";

import { useMemo, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useBookings } from "@/stores/bookings.store";
import type { Booking } from "@/types/booking";
import { DatePicker } from "@/components/ui/DatePicker";

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

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function Section4ClientUpcoming({ onEditBooking }: Props) {
  const { userId } = useRole();
  const { bookings } = useBookings();

  const [visibleCount, setVisibleCount] = useState(5);
  const [filterDate, setFilterDate] = useState<string>(""); // ✅ DatePicker-stil filter

  const upcoming = useMemo(() => {
    const now = Date.now();
    const list = (bookings ?? [])
      .filter((b) => b.client_id === userId)
      .filter((b) => b.status !== "cancelled")
      .filter((b) => new Date(b.start_time).getTime() >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const filtered = filterDate
      ? list.filter((b) => ymdLocal(new Date(b.start_time)) === filterDate)
      : list;

    return filtered as Booking[];
  }, [bookings, userId, filterDate]);

  const visible = upcoming.slice(0, visibleCount);
  const hasMore = upcoming.length > visibleCount;

  const lockBefore = Date.now() + 24 * 60 * 60 * 1000;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
          {/* HEADER */}
          <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-sf-text">Kommende timer</h3>
              <div className="text-xs text-sf-muted mt-1">
                {upcoming.length ? `${upcoming.length} totalt` : "Ingen planlagte"}
              </div>
            </div>

            {/* ✅ Filter med samme DatePicker */}
            <div className="flex items-center gap-2">
              <div className="min-w-[210px]">
                <DatePicker
                  value={filterDate}
                  onChange={(v) => {
                    setFilterDate(v);
                    setVisibleCount(5);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterDate("");
                  setVisibleCount(5);
                }}
                className="rounded-lg border border-sf-border px-3 py-2 text-xs hover:bg-sf-soft"
              >
                Tøm
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {visible.map((b) => {
              const start = new Date(b.start_time);
              const end = getEndTime(b);
              const dateLabel = formatDateLabel(start);
              const timeLabel = formatTimeRange(start, end);

              const locked24h = start.getTime() < lockBefore;

              return (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-sf-border px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sf-text">{dateLabel}</span>
                    <span className="text-xs text-sf-muted">
                      {timeLabel} • {b.duration} min
                      {locked24h ? <span className="ml-2 text-red-600">• Låst &lt; 24t</span> : null}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={locked24h}
                      onClick={() => !locked24h && onEditBooking?.(b.id)}
                      className={`rounded-lg px-3 py-2 text-xs border ${
                        locked24h
                          ? "border-sf-border text-sf-muted opacity-50 cursor-not-allowed"
                          : "border-sf-border hover:bg-sf-soft"
                      }`}
                    >
                      Endre
                    </button>

                    <button
                      type="button"
                      disabled={locked24h}
                      onClick={() => !locked24h && onEditBooking?.(b.id)}
                      className={`rounded-lg px-3 py-2 text-xs border ${
                        locked24h
                          ? "border-red-200 text-red-400 opacity-50 cursor-not-allowed"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
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