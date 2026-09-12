"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  BookmarkPlus,
  ChevronDown,
} from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";
import { Button } from "@/ui/components/Button";
import { Field, Input, Textarea, Select } from "@/ui/components/Field";
import { TRAPP_STAGES, TRAPP_ORDER, type TrappStage } from "@/lib/trapp/stages";
import { getCalibratorView } from "@/lib/calibrator.api";
import {
  getActiveAssignment,
  getExercises,
  getTemplates,
  assignProgramFromTemplate,
  createBlankProgram,
  updateProgramMeta,
  addProgramDay,
  removeProgramDay,
  updateProgramDayTitle,
  addExerciseToDay,
  removeExerciseFromDay,
  updateDayExercise,
  moveExerciseInDay,
  saveProgramAsTemplate,
  endAssignment,
  getAssignmentHistory,
  type ActiveAssignment,
  type Exercise,
  type ProgramTemplate,
  type ProgramDayExercise,
  type AssignmentHistoryRow,
} from "@/lib/program.api";

type PageProps = { params: Promise<{ id: string }> };

export default function ProgramBuilderPage({ params }: PageProps) {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const { getClientById } = useClients();
  const { id: clientId } = use(params);

  const [assignment, setAssignment] = useState<ActiveAssignment | null | undefined>(undefined);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [calibratorNote, setCalibratorNote] = useState<string | null>(null);
  const [history, setHistory] = useState<AssignmentHistoryRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const client = getClientById(clientId);

  const load = useCallback(async () => {
    const [a, ex, tpl] = await Promise.all([getActiveAssignment(clientId), getExercises(), getTemplates()]);
    setAssignment(a);
    setExercises(ex);
    setTemplates(tpl);
    setHistory(await getAssignmentHistory(clientId));
    try {
      const cal = await getCalibratorView(clientId);
      if (cal && cal.suggestion.kind !== "hold" && !cal.lastEvent?.decided_at) {
        setCalibratorNote(cal.suggestion.headline);
      } else {
        setCalibratorNote(null);
      }
    } catch {
      setCalibratorNote(null);
    }
  }, [clientId]);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "trainer" && role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    load().catch((e) => setError(e instanceof Error ? e.message : "Kunne ikke laste programmet"));
  }, [roleLoading, role, router, load]);

  async function withBusy(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt");
    } finally {
      setBusy(false);
    }
  }

  if (roleLoading || (role !== "trainer" && role !== "admin") || assignment === undefined) {
    return (
      <AppPage title="Programbygger">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Programbygger"
      subtitle={client ? `${client.first_name} ${client.last_name}` : undefined}
      actions={
        <Link
          href={`/clients/${clientId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} /> Tilbake til kunden
        </Link>
      }
      actionsAlign="left"
    >
      <div className="space-y-6">
        {calibratorNote && (
          <div className="rounded-lg border border-transparent bg-warning-subtle p-4 text-sm text-warning-ink">
            Kalibratoren har et forslag som ikke er tatt stilling til: «{calibratorNote}». Se
            Kalibrator-kortet på kundesiden — endringer her skjer ikke automatisk.
          </div>
        )}
        {error && <p className="text-sm text-danger-ink">{error}</p>}
        {notice && <p className="text-sm text-success-ink">{notice}</p>}

        {!assignment ? (
          <NoProgramView
            templates={templates}
            busy={busy}
            onAssignTemplate={(templateId) =>
              withBusy(async () => {
                await assignProgramFromTemplate(clientId, templateId);
                await load();
              })
            }
            onCreateBlank={(input) =>
              withBusy(async () => {
                await createBlankProgram({ clientId, ...input });
                await load();
              })
            }
          />
        ) : (
          <ProgramEditor
            key={assignment.program.id}
            assignment={assignment}
            exercises={exercises}
            busy={busy}
            onSaveMeta={(patch) =>
              withBusy(async () => {
                await updateProgramMeta(assignment.program_id, patch);
                await load();
              })
            }
            onAddDay={() =>
              withBusy(async () => {
                await addProgramDay(assignment.program_id);
                await load();
              })
            }
            onRemoveDay={(dayId) =>
              withBusy(async () => {
                if (!confirm("Fjerne denne dagen og alle øvelsene i den?")) return;
                await removeProgramDay(dayId);
                await load();
              })
            }
            onRenameDay={(dayId, title) =>
              withBusy(async () => {
                await updateProgramDayTitle(dayId, title);
                await load();
              })
            }
            onAddExercise={(dayId, exerciseId) =>
              withBusy(async () => {
                await addExerciseToDay(dayId, exerciseId);
                await load();
              })
            }
            onRemoveExercise={(dayExerciseId) =>
              withBusy(async () => {
                await removeExerciseFromDay(dayExerciseId);
                await load();
              })
            }
            onUpdateExercise={(dayExerciseId, patch) =>
              withBusy(async () => {
                await updateDayExercise(dayExerciseId, patch);
                await load();
              })
            }
            onMoveExercise={(dayExercises, dayExerciseId, dir) =>
              withBusy(async () => {
                await moveExerciseInDay(dayExercises, dayExerciseId, dir);
                await load();
              })
            }
            onSaveAsTemplate={() =>
              withBusy(async () => {
                await saveProgramAsTemplate(assignment.program_id);
                setNotice("Lagret som mal — tilgjengelig ved neste tildeling.");
              })
            }
            onEndProgram={() =>
              withBusy(async () => {
                if (!confirm("Avslutt det aktive programmet?")) return;
                await endAssignment(clientId);
                await load();
              })
            }
          />
        )}

        <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-sm font-semibold text-ink">
              Programhistorikk {history.length > 0 && `(${history.length})`}
            </h2>
            <ChevronDown size={16} className={`text-ink-faint transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (
            <ul className="mt-4 space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-ink-soft">Ingen tidligere programmer.</p>
              ) : (
                history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{h.program_name}</p>
                      <p className="text-xs text-ink-faint">
                        {new Date(h.assigned_at).toLocaleDateString("no-NO")} –{" "}
                        {h.status === "active" ? "nå" : new Date(h.updated_at).toLocaleDateString("no-NO")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        h.status === "active" ? "bg-success-subtle text-success-ink" : "bg-surface-alt text-ink-soft"
                      }`}
                    >
                      {h.status === "active" ? "Aktivt" : "Avsluttet"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </div>
    </AppPage>
  );
}

function NoProgramView({
  templates,
  busy,
  onAssignTemplate,
  onCreateBlank,
}: {
  templates: ProgramTemplate[];
  busy: boolean;
  onAssignTemplate: (templateId: string) => void;
  onCreateBlank: (input: { name: string; description?: string; relevantStage?: TrappStage | null; bodyArea?: string }) => void;
}) {
  const [mode, setMode] = useState<"template" | "blank">("template");
  const [pick, setPick] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<TrappStage | "">("");
  const [bodyArea, setBodyArea] = useState("");

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-ink">Ingen aktivt program</h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("template")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${mode === "template" ? "bg-primary text-primary-ink" : "bg-surface-alt text-ink-soft"}`}
        >
          Fra mal
        </button>
        <button
          type="button"
          onClick={() => setMode("blank")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${mode === "blank" ? "bg-primary text-primary-ink" : "bg-surface-alt text-ink-soft"}`}
        >
          Fra blankt
        </button>
      </div>

      {mode === "template" ? (
        <div className="space-y-3">
          <Select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Velg mal …</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.relevant_stage ? `— ${TRAPP_STAGES[t.relevant_stage].label}` : ""}
              </option>
            ))}
          </Select>
          <Button onClick={() => onAssignTemplate(pick)} disabled={!pick || busy}>
            Tildel mal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Programnavn">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. «Styrke – individuelt tilpasset»" />
          </Field>
          <Field label="Relevant Trapp-trinn (valgfritt)">
            <Select value={stage} onChange={(e) => setStage(e.target.value as TrappStage | "")}>
              <option value="">Ingen spesifikk</option>
              {TRAPP_ORDER.map((s) => (
                <option key={s} value={s}>
                  {TRAPP_STAGES[s].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kroppsområde (valgfritt)">
            <Input value={bodyArea} onChange={(e) => setBodyArea(e.target.value)} placeholder="F.eks. rygg, skulder" />
          </Field>
          <Button
            onClick={() => onCreateBlank({ name, relevantStage: stage || null, bodyArea: bodyArea || undefined })}
            disabled={!name.trim() || busy}
          >
            Opprett program
          </Button>
        </div>
      )}
    </section>
  );
}

function ProgramEditor({
  assignment,
  exercises,
  busy,
  onSaveMeta,
  onAddDay,
  onRemoveDay,
  onRenameDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onMoveExercise,
  onSaveAsTemplate,
  onEndProgram,
}: {
  assignment: ActiveAssignment;
  exercises: Exercise[];
  busy: boolean;
  onSaveMeta: (patch: { name?: string; description?: string | null }) => void;
  onAddDay: () => void;
  onRemoveDay: (dayId: string) => void;
  onRenameDay: (dayId: string, title: string) => void;
  onAddExercise: (dayId: string, exerciseId: string) => void;
  onRemoveExercise: (dayExerciseId: string) => void;
  onUpdateExercise: (
    dayExerciseId: string,
    patch: { exercise_id?: string; sets?: number | null; reps?: number | null; duration_sec?: number | null; load_note?: string | null }
  ) => void;
  onMoveExercise: (dayExercises: ProgramDayExercise[], dayExerciseId: string, dir: "up" | "down") => void;
  onSaveAsTemplate: () => void;
  onEndProgram: () => void;
}) {
  // Komponenten er key'et på assignment.program.id av kallestedet, så et nytt
  // program (eller ny data etter lagring) gir en fersk mount her — ingen
  // synk-effekt nødvendig.
  const [name, setName] = useState(assignment.program.name);
  const [description, setDescription] = useState(assignment.program.description ?? "");

  const exById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Programmet</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveAsTemplate}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-alt disabled:opacity-50"
            >
              <BookmarkPlus size={14} /> Lagre som mal
            </button>
            <button
              type="button"
              onClick={onEndProgram}
              disabled={busy}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-danger-ink hover:bg-danger-subtle disabled:opacity-50"
            >
              Avslutt program
            </button>
          </div>
        </div>

        <Field label="Navn">
          <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name !== assignment.program.name && onSaveMeta({ name })} />
        </Field>
        <Field label="Beskrivelse">
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (assignment.program.description ?? "") && onSaveMeta({ description: description || null })}
          />
        </Field>
        <p className="text-xs text-ink-faint">Dag {assignment.current_day_index} av {assignment.program.days.length} er dagens økt for kunden.</p>
      </section>

      {assignment.program.days.map((day) => (
        <DayEditor
          key={day.id}
          day={day}
          exercises={exercises}
          exById={exById}
          busy={busy}
          isCurrent={day.day_index === assignment.current_day_index}
          onRemoveDay={() => onRemoveDay(day.id)}
          onRenameDay={(title) => onRenameDay(day.id, title)}
          onAddExercise={(exerciseId) => onAddExercise(day.id, exerciseId)}
          onRemoveExercise={onRemoveExercise}
          onUpdateExercise={onUpdateExercise}
          onMoveExercise={(dayExerciseId, dir) => onMoveExercise(day.exercises, dayExerciseId, dir)}
        />
      ))}

      <button
        type="button"
        onClick={onAddDay}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm font-medium text-ink-soft hover:bg-surface-alt disabled:opacity-50"
      >
        <Plus size={16} /> Legg til dag
      </button>
    </div>
  );
}

function DayEditor({
  day,
  exercises,
  exById,
  busy,
  isCurrent,
  onRemoveDay,
  onRenameDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onMoveExercise,
}: {
  day: ActiveAssignment["program"]["days"][number];
  exercises: Exercise[];
  exById: Map<string, Exercise>;
  busy: boolean;
  isCurrent: boolean;
  onRemoveDay: () => void;
  onRenameDay: (title: string) => void;
  onAddExercise: (exerciseId: string) => void;
  onRemoveExercise: (dayExerciseId: string) => void;
  onUpdateExercise: (
    dayExerciseId: string,
    patch: { exercise_id?: string; sets?: number | null; reps?: number | null; duration_sec?: number | null; load_note?: string | null }
  ) => void;
  onMoveExercise: (dayExerciseId: string, dir: "up" | "down") => void;
}) {
  const [title, setTitle] = useState(day.title ?? "");
  const [pick, setPick] = useState("");

  return (
    <section className={`space-y-3 rounded-lg border p-5 shadow-card ${isCurrent ? "border-primary bg-primary-subtle/30" : "border-border bg-surface"}`}>
      <div className="flex items-center justify-between gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== (day.title ?? "") && onRenameDay(title)}
          className="w-full max-w-xs rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold text-ink hover:border-border focus:border-primary focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {isCurrent && <span className="text-[11px] font-medium text-primary-ink">Dagens økt</span>}
          <button type="button" onClick={onRemoveDay} disabled={busy} className="text-ink-faint hover:text-danger-ink disabled:opacity-50">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {day.exercises.map((e, i) => (
          <li key={e.id} className="rounded-md border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{e.exercise.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <NumberField key={`${e.id}-sets-${e.sets}`} label="Sett" value={e.sets} onSave={(v) => onUpdateExercise(e.id, { sets: v })} />
                  <NumberField key={`${e.id}-reps-${e.reps}`} label="Reps" value={e.reps} onSave={(v) => onUpdateExercise(e.id, { reps: v })} />
                  <NumberField key={`${e.id}-dur-${e.duration_sec}`} label="Sek" value={e.duration_sec} onSave={(v) => onUpdateExercise(e.id, { duration_sec: v })} />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => onMoveExercise(e.id, "up")} disabled={busy || i === 0} className="text-ink-faint hover:text-ink disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveExercise(e.id, "down")}
                  disabled={busy || i === day.exercises.length - 1}
                  className="text-ink-faint hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => onRemoveExercise(e.id)} disabled={busy} className="text-ink-faint hover:text-danger-ink disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <ExerciseSwap current={e} exById={exById} busy={busy} onUpdateExercise={onUpdateExercise} />

            <LoadNoteField key={`${e.id}-note-${e.load_note}`} value={e.load_note} onSave={(v) => onUpdateExercise(e.id, { load_note: v })} />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Select value={pick} onChange={(e) => setPick(e.target.value)} className="max-w-xs">
          <option value="">Legg til øvelse …</option>
          {exercises
            .filter((ex) => ex.is_active)
            .map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
        </Select>
        <button
          type="button"
          onClick={() => {
            if (!pick) return;
            onAddExercise(pick);
            setPick("");
          }}
          disabled={!pick || busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-ink-soft hover:bg-surface-alt disabled:opacity-50"
        >
          <Plus size={14} /> Legg til
        </button>
      </div>
    </section>
  );
}

// NB: rendres med key={`${id}-${felt}-${value}`} av kallestedet, så en
// fersk mount her (og dermed korrekt startverdi) skjer nettopp når den
// lagrede verdien faktisk endres — ingen synk-effekt nødvendig.
function NumberField({ label, value, onSave }: { label: string; value: number | null; onSave: (v: number | null) => void }) {
  const [v, setV] = useState(value?.toString() ?? "");
  return (
    <label className="flex items-center gap-1 text-xs text-ink-soft">
      {label}
      <input
        type="number"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = v === "" ? null : Number(v);
          if (n !== value) onSave(n);
        }}
        className="w-14 rounded border border-border bg-page px-1.5 py-0.5 text-xs text-ink"
      />
    </label>
  );
}

// Samme mønster som NumberField — key'et på verdien av kallestedet.
function LoadNoteField({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [v, setV] = useState(value ?? "");
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== (value ?? "") && onSave(v || null)}
      placeholder="Kundespesifikk kommentar (f.eks. «10 kg, øk til 12 kg neste uke»)"
      className="mt-2 w-full rounded-md border border-border bg-page px-2 py-1.5 text-xs text-ink placeholder:text-ink-faint"
    />
  );
}

function ExerciseSwap({
  current,
  exById,
  busy,
  onUpdateExercise,
}: {
  current: ProgramDayExercise;
  exById: Map<string, Exercise>;
  busy: boolean;
  onUpdateExercise: (
    dayExerciseId: string,
    patch: { exercise_id?: string; sets?: number | null; reps?: number | null; duration_sec?: number | null }
  ) => void;
}) {
  const regression = current.exercise.regression_of ? exById.get(current.exercise.regression_of) : null;
  const progression = current.exercise.progression_of ? exById.get(current.exercise.progression_of) : null;

  function swapTo(target: Exercise) {
    onUpdateExercise(current.id, {
      exercise_id: target.id,
      sets: target.default_sets,
      reps: target.default_reps,
      duration_sec: target.default_duration_sec,
    });
  }

  if (!regression && !progression) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {regression && (
        <button
          type="button"
          disabled={busy}
          onClick={() => swapTo(regression)}
          className="rounded border border-border px-2 py-1 text-[11px] text-ink-soft hover:bg-surface-alt disabled:opacity-50"
        >
          ← Regresjon: {regression.name}
        </button>
      )}
      {progression && (
        <button
          type="button"
          disabled={busy}
          onClick={() => swapTo(progression)}
          className="rounded border border-border px-2 py-1 text-[11px] text-ink-soft hover:bg-surface-alt disabled:opacity-50"
        >
          Progresjon: {progression.name} →
        </button>
      )}
    </div>
  );
}
