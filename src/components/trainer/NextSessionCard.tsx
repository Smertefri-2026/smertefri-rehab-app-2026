"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { fetchBookingsForClient } from "@/lib/bookings.api";
import type { Booking } from "@/types/booking";

function formatDateNo(d: Date) {
  const weekday = d.toLocaleDateString("no-NO", { weekday: "long" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dd}.${mm}`;
}

function formatTimeHHMM(d: Date) {
  return d.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

/** Kundens neste booking med den tildelte treneren. */
export default function NextSessionCard({
  clientId,
  trainerId,
}: {
  clientId: string;
  trainerId: string;
}) {
  const [next, setNext] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchBookingsForClient(clientId)
      .then((rows) => {
        if (!alive) return;
        const now = Date.now();
        const upcoming = rows
          .filter(
            (b) =>
              b.trainer_id === trainerId &&
              b.status !== "cancelled" &&
              b.status !== "completed" &&
              new Date(b.start_time).getTime() > now
          )
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        setNext(upcoming[0] ?? null);
      })
      .catch(() => setNext(null));
    return () => {
      alive = false;
    };
  }, [clientId, trainerId]);

  if (next === undefined) return null;

  const start = next ? new Date(next.start_time) : null;

  return (
    <Link
      href="/calendar"
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-ink">
          <CalendarClock size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-soft">Neste oppfølging</p>
          {start ? (
            <p className="text-sm text-ink">
              {formatDateNo(start)} · {formatTimeHHMM(start)}
            </p>
          ) : (
            <p className="text-sm text-ink-soft">Ingen kommende time booket</p>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs font-medium text-primary-ink">
        {start ? "Se i kalenderen →" : "Book time →"}
      </span>
    </Link>
  );
}
