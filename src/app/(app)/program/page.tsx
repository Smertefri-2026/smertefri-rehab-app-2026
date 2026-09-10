"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { cn } from "@/ui/cn";
import DayExerciseList from "@/components/program/DayExerciseList";
import LogWorkoutForm from "@/components/program/LogWorkoutForm";
import {
  getActiveAssignment,
  getTodayCompletion,
  type ActiveAssignment,
  type WorkoutCompletionRow,
} from "@/lib/program.api";

const STATUS_LABEL: Record<WorkoutCompletionRow["status"], string> = {
  ja: "Gjennomført",
  delvis: "Delvis",
  nei: "Ikke gjennomført",
};

export default function ProgramPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [assignment, setAssignment] = useState<ActiveAssignment | null | undefined>(undefined);
  const [todayDone, setTodayDone] = useState<WorkoutCompletionRow | null>(null);
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [a, c] = await Promise.all([getActiveAssignment(userId), getTodayCompletion(userId)]);
    setAssignment(a);
    setTodayDone(c);
    setLogging(false);
  }, [userId]);

  useEffect(() => {
    if (roleLoading) return;
    if (role && role !== "client") {
      router.replace("/dashboard");
      return;
    }
    load();
  }, [roleLoading, role, load, router]);

  if (roleLoading || role !== "client" || assignment === undefined) {
    return (
      <AppPage title="Program">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  if (!assignment) {
    return (
      <AppPage title="Program">
        <p className="text-sm text-ink-soft">
          Du har ikke fått tildelt et program ennå. Rehabtreneren din legger opp
          dette ut fra hvor du er i Trappen.
        </p>
      </AppPage>
    );
  }

  const days = assignment.program.days;
  const todayDay = days.find((d) => d.day_index === assignment.current_day_index) ?? days[0];

  return (
    <AppPage title="Program" subtitle={assignment.program.name}>
      <div className="space-y-6">
        {/* Dagens økt */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">
              I dag: {todayDay?.title ?? `Dag ${assignment.current_day_index}`}
            </h2>
            {todayDone && (
              <span className="rounded-full bg-success-subtle px-3 py-1 text-xs font-semibold text-success-ink">
                {STATUS_LABEL[todayDone.status]}
              </span>
            )}
          </div>
          {todayDay && <DayExerciseList exercises={todayDay.exercises} />}
        </div>

        {logging ? (
          <LogWorkoutForm assignment={assignment} onLogged={load} />
        ) : todayDone ? (
          <button
            type="button"
            onClick={() => setLogging(true)}
            className="text-sm font-medium text-primary-ink hover:underline"
          >
            Rediger dagens logg
          </button>
        ) : (
          <LogWorkoutForm assignment={assignment} onLogged={load} />
        )}

        {/* Hele programmet */}
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-soft">Hele programmet</h2>
          {assignment.program.description && (
            <p className="mt-1 text-sm text-ink-soft">{assignment.program.description}</p>
          )}
          <div className="mt-4 space-y-5">
            {days.map((d) => (
              <div key={d.id}>
                <p
                  className={cn(
                    "text-[13px] font-semibold uppercase tracking-wide",
                    d.day_index === assignment.current_day_index ? "text-primary-ink" : "text-ink-faint"
                  )}
                >
                  {d.title ?? `Dag ${d.day_index}`}
                </p>
                <div className="mt-1">
                  <DayExerciseList exercises={d.exercises} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppPage>
  );
}
