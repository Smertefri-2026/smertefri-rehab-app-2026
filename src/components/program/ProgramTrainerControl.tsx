"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/ui/components/Button";
import { Select } from "@/ui/components/Field";
import { cn } from "@/ui/cn";
import { getTrappState } from "@/lib/trapp.api";
import { TRAPP_STAGES, type TrappStage } from "@/lib/trapp/stages";
import {
  assignProgramFromTemplate,
  endAssignment,
  getActiveAssignment,
  getExercises,
  getTemplates,
  swapExercise,
  type ActiveAssignment,
  type Exercise,
  type ProgramTemplate,
} from "@/lib/program.api";

/** Rehabtrener/admin: tildel og finjuster kundens program. */
export default function ProgramTrainerControl({ clientId }: { clientId: string }) {
  const [stage, setStage] = useState<TrappStage | null>(null);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [assignment, setAssignment] = useState<ActiveAssignment | null | undefined>(undefined);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [ts, a, ex] = await Promise.all([
      getTrappState(clientId),
      getActiveAssignment(clientId),
      getExercises(),
    ]);
    const s = ts?.current_stage ?? null;
    setStage(s);
    setAssignment(a);
    setExercises(ex);
    setTemplates(await getTemplates());
    setPick("");
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (assignment === undefined) return null;

  const suggested = stage ? templates.filter((t) => t.relevant_stage === stage) : templates;
  const exById = new Map(exercises.map((e) => [e.id, e]));

  async function handleAssign() {
    if (!pick || busy) return;
    setBusy(true);
    setError(null);
    try {
      await assignProgramFromTemplate(clientId, pick);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke tildele program");
    } finally {
      setBusy(false);
    }
  }

  async function handleSwap(dayExerciseId: string, newExerciseId: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await swapExercise(dayExerciseId, newExerciseId);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke bytte øvelse");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnd() {
    if (busy || !confirm("Avslutt det aktive programmet?")) return;
    setBusy(true);
    try {
      await endAssignment(clientId);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Program</h2>
        <Link href={`/clients/${clientId}/program`} className="text-xs font-medium text-primary-ink hover:underline">
          Åpne programbygger →
        </Link>
      </div>

      {assignment ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink">
              <span className="font-medium">{assignment.program.name}</span>
              <span className="text-ink-faint"> · dag {assignment.current_day_index} av {assignment.program.days.length}</span>
            </p>
            <button type="button" onClick={handleEnd} className="text-xs text-danger-ink hover:underline">
              Avslutt
            </button>
          </div>

          {assignment.program.days.map((d) => (
            <div key={d.id} className="rounded-md border border-border p-3">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
                {d.title ?? `Dag ${d.day_index}`}
              </p>
              <ul className="mt-2 space-y-2">
                {d.exercises.map((e) => {
                  const alt = e.exercise.regression_of || e.exercise.progression_of;
                  const altEx = alt ? exById.get(alt) : null;
                  return (
                    <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink">{e.exercise.name}</span>
                      {altEx && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSwap(e.id, altEx.id)}
                          className={cn(
                            "shrink-0 rounded border border-border px-2 py-1 text-xs text-ink-soft hover:bg-surface-alt",
                            busy && "opacity-50"
                          )}
                        >
                          Bytt til «{altEx.name}»
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </>
      ) : (
        <p className="text-sm text-ink-soft">Ingen aktivt program.</p>
      )}

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-[13px] font-medium text-ink-soft">
          {assignment ? "Bytt til nytt program" : "Tildel program"}
          {stage && (
            <span className="text-ink-faint"> — forslag for trinn {TRAPP_STAGES[stage].label}</span>
          )}
        </p>
        <Select value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Velg mal …</option>
          {suggested.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
          {suggested.length < templates.length && (
            <optgroup label="Andre maler">
              {templates
                .filter((t) => !suggested.includes(t))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </optgroup>
          )}
        </Select>
        {error && <p className="text-sm text-danger-ink">{error}</p>}
        <Button onClick={handleAssign} disabled={!pick || busy}>
          {busy ? "Lagrer…" : "Tildel"}
        </Button>
      </div>
    </section>
  );
}
