// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section5ClientHistory.tsx
"use client";

import { useMemo, useState } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useBookings } from "@/stores/bookings.store";
import type { Booking } from "@/types/booking";
import { DatePicker } from "@/components/ui/DatePicker";

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

export default function Section5ClientHistory() {
  const { userId } = useRole();
  const { bookings } = useBookings();

  const [visibleCount, setVisibleCount] = useState(5);
  const [fromDate, setFromDate] = useState<string>(""); // ✅ DatePicker-stil filter

  const history = useMemo(() => {
    const now = Date.now();
    const list = (bookings ?? [])
      .filter((b) => b.client_id === userId)
      .filter((b) => new Date(b.start_time).getTime() < now)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()); // nyeste først

    const filtered = fromDate
      ? list.filter((b) => ymdLocal(new Date(b.start_time)) >= fromDate)
      : list;

    return filtered as Booking[];
  }, [bookings, userId, fromDate]);

  const visible = history.slice(0, visibleCount);
  const hasMore = history.length > visibleCount;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
          {/* HEADER */}
          <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-sf-text">Tidligere timer</h3>
              <div className="text-xs text-sf-muted mt-1">
                {history.length ? `${history.length} i historikk` : "Ingen historikk"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="min-w-[210px]">
                <DatePicker
                  value={fromDate}
                  onChange={(v) => {
                    setFromDate(v);
                    setVisibleCount(5);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
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

              const isCancelled = b.status === "cancelled";
              const badgeClass = isCancelled
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700";
              const badgeText = isCancelled ? "Avlyst" : "Fullført";

              return (
                <div
                  key={b.id}
                  className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-sf-border px-4 py-3 ${
                    isCancelled ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sf-text">{dateLabel}</span>
                    <span className="text-xs text-sf-muted">
                      {timeLabel} • {b.duration} min
                    </span>
                  </div>

                  <span className={`min-w-[110px] text-center rounded-full px-3 py-1 text-xs ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}

            {!history.length ? (
              <div className="rounded-xl border border-dashed border-sf-border px-4 py-6 text-center">
                <p className="text-sm text-sf-muted">Eldre timer vil vises her fortløpende.</p>
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