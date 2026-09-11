"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import { getActiveAssignment, getTodayCompletion, type ActiveAssignment } from "@/lib/program.api";

export default function SectionProgram() {
  const { role, userId } = useRole();
  const [assignment, setAssignment] = useState<ActiveAssignment | null | undefined>(undefined);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;
    (async () => {
      try {
        const [a, c] = await Promise.all([getActiveAssignment(userId), getTodayCompletion(userId)]);
        if (!alive) return;
        setAssignment(a);
        setDone(!!c);
      } catch {
        if (alive) setAssignment(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || assignment === undefined) return null;

  if (!assignment) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-alt p-5">
        <h2 className="text-sm font-semibold text-ink-soft">Dagens anbefaling</h2>
        <p className="mt-1 text-sm text-ink">
          Du har ikke fått et treningsprogram ennå — det setter rehabtreneren
          din opp basert på kartleggingen din.
        </p>
      </div>
    );
  }

  const day = assignment.program.days.find((d) => d.day_index === assignment.current_day_index);

  return (
    <Link
      href="/min-plan#program"
      className="block rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Dette anbefaler vi i dag</h2>
        {done ? (
          <span className="rounded-full bg-success-subtle px-2.5 py-1 text-xs font-semibold text-success-ink">
            Logget
          </span>
        ) : (
          <span className="text-xs text-ink-faint">{assignment.program.name}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink">
        {day?.title ?? `Dag ${assignment.current_day_index}`}
        <span className="text-ink-faint"> · {day?.exercises.length ?? 0} øvelser</span>
      </p>
    </Link>
  );
}
