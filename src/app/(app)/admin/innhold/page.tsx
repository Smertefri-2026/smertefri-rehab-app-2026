"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { Field, Input, Textarea, Select } from "@/ui/components/Field";
import { Button } from "@/ui/components/Button";
import { cn } from "@/ui/cn";
import { TRAPP_STAGES, TRAPP_ORDER } from "@/lib/trapp/stages";
import {
  getExercises,
  getTemplates,
  createExercise,
  updateExercise,
  setExerciseActive,
  getExerciseUsage,
  type Exercise,
  type ExerciseInput,
  type ExerciseUsage,
  type ProgramTemplate,
} from "@/lib/program.api";
import {
  MOVEMENT_PATTERN_ORDER,
  MOVEMENT_PATTERN_LABELS,
  CAPACITY_LEVEL_ORDER,
  CAPACITY_LEVEL_LABELS,
  PURPOSE_OPTIONS,
  BODY_AREA_OPTIONS,
  EQUIPMENT_OPTIONS,
  type MovementPattern,
  type CapacityLevel,
} from "@/lib/exercise/taxonomy";

function stageLabel(stage: string | null) {
  if (!stage) return "Alle trinn";
  return TRAPP_STAGES[stage as keyof typeof TRAPP_STAGES]?.label ?? stage;
}

/** Samme visuelle idé som ChoiceGroup (piller), men for flervalg mot et array-felt. */
function MultiPills({
  label,
  values,
  options,
  labels,
  onToggle,
}: {
  label: string;
  values: string[];
  options: readonly string[];
  labels?: Record<string, string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              values.includes(o)
                ? "border-primary bg-primary-subtle text-primary-ink"
                : "border-border bg-surface text-ink-soft hover:bg-surface-alt"
            )}
          >
            {labels?.[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}

function emptyInput(): ExerciseInput {
  return {
    name: "",
    instruction: "",
    video_url: "",
    default_sets: null,
    default_reps: null,
    default_duration_sec: null,
    body_areas: [],
    purposes: [],
    relevant_stages: [],
    movement_pattern: null,
    capacity_level: null,
    equipment: [],
    regression_of: null,
    progression_of: null,
  };
}

function toInput(e: Exercise): ExerciseInput {
  return {
    name: e.name,
    instruction: e.instruction ?? "",
    video_url: e.video_url ?? "",
    default_sets: e.default_sets,
    default_reps: e.default_reps,
    default_duration_sec: e.default_duration_sec,
    body_areas: e.body_areas,
    purposes: e.purposes,
    relevant_stages: e.relevant_stages,
    movement_pattern: e.movement_pattern,
    capacity_level: e.capacity_level,
    equipment: e.equipment,
    regression_of: e.regression_of,
    progression_of: e.progression_of,
  };
}

function ExerciseForm({
  title,
  initial,
  allExercises,
  excludeId,
  usage,
  busy,
  onSave,
  onCancel,
}: {
  title: string;
  initial: ExerciseInput;
  allExercises: Exercise[];
  excludeId?: string;
  usage?: ExerciseUsage | null;
  busy: boolean;
  onSave: (input: ExerciseInput) => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState<ExerciseInput>(initial);

  function patch<K extends keyof ExerciseInput>(key: K, value: ExerciseInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayField(key: "body_areas" | "purposes" | "relevant_stages" | "equipment", v: string) {
    setInput((prev) => {
      const arr = (prev[key] as string[] | undefined) ?? [];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...prev, [key]: next };
    });
  }

  const pickable = allExercises.filter((e) => e.id !== excludeId);

  return (
    <section className="space-y-4 rounded-lg border border-primary bg-primary-subtle/20 p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>

      <Field label="Navn">
        <Input value={input.name} onChange={(e) => patch("name", e.target.value)} placeholder="F.eks. «Goblet squat»" />
      </Field>

      <Field label="Instruksjon">
        <Textarea
          rows={3}
          value={input.instruction ?? ""}
          onChange={(e) => patch("instruction", e.target.value)}
          placeholder="Kort, konkret steg-for-steg-beskrivelse."
        />
      </Field>

      <Field label="Video/embed-URL (valgfritt)" hint="Lenke til en ekte video (f.eks. YouTube/Vimeo) eller animasjon. Vises til kunden i programmet hvis satt.">
        <Input
          value={input.video_url ?? ""}
          onChange={(e) => patch("video_url", e.target.value)}
          placeholder="https://…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Standard sett">
          <Input
            type="number"
            value={input.default_sets ?? ""}
            onChange={(e) => patch("default_sets", e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
        <Field label="Standard reps">
          <Input
            type="number"
            value={input.default_reps ?? ""}
            onChange={(e) => patch("default_reps", e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
        <Field label="Standard varighet (sek)">
          <Input
            type="number"
            value={input.default_duration_sec ?? ""}
            onChange={(e) => patch("default_duration_sec", e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bevegelsesmønster">
          <Select
            value={input.movement_pattern ?? ""}
            onChange={(e) => patch("movement_pattern", (e.target.value || null) as MovementPattern | null)}
          >
            <option value="">— ingen —</option>
            {MOVEMENT_PATTERN_ORDER.map((p) => (
              <option key={p} value={p}>
                {MOVEMENT_PATTERN_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Kapasitetsnivå"
          hint="Uavhengig av Trapp-trinn — hvor fysisk krevende øvelsen er, ikke hvor i rehab-reisen den passer."
        >
          <Select
            value={input.capacity_level ?? ""}
            onChange={(e) => patch("capacity_level", (e.target.value || null) as CapacityLevel | null)}
          >
            <option value="">— ingen —</option>
            {CAPACITY_LEVEL_ORDER.map((c) => (
              <option key={c} value={c}>
                {CAPACITY_LEVEL_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <MultiPills
        label="Kroppsregion"
        values={input.body_areas ?? []}
        options={BODY_AREA_OPTIONS}
        onToggle={(v) => toggleArrayField("body_areas", v)}
      />
      <MultiPills
        label="Type (formål)"
        values={input.purposes ?? []}
        options={PURPOSE_OPTIONS}
        onToggle={(v) => toggleArrayField("purposes", v)}
      />
      <MultiPills
        label="Egnet Trapp-nivå"
        values={input.relevant_stages ?? []}
        options={TRAPP_ORDER}
        labels={Object.fromEntries(TRAPP_ORDER.map((s) => [s, TRAPP_STAGES[s].label]))}
        onToggle={(v) => toggleArrayField("relevant_stages", v)}
      />
      <MultiPills
        label="Utstyr"
        values={input.equipment ?? []}
        options={EQUIPMENT_OPTIONS}
        onToggle={(v) => toggleArrayField("equipment", v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Regresjon (lettere variant)">
          <Select
            value={input.regression_of ?? ""}
            onChange={(e) => patch("regression_of", e.target.value || null)}
          >
            <option value="">— ingen —</option>
            {pickable.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Progresjon (tyngre variant)">
          <Select
            value={input.progression_of ?? ""}
            onChange={(e) => patch("progression_of", e.target.value || null)}
          >
            <option value="">— ingen —</option>
            {pickable.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {usage && (
        <div className="rounded-md border border-border bg-surface p-3 text-xs text-ink-soft">
          <p className="font-medium text-ink">Brukes i dag</p>
          {usage.totalUses === 0 ? (
            <p className="mt-1">Ikke brukt i noe program ennå.</p>
          ) : (
            <>
              <p className="mt-1">
                {usage.totalUses} plassering{usage.totalUses === 1 ? "" : "er"} i {usage.programs.length} program
                {usage.programs.length === 1 ? "" : "mer"}.
              </p>
              <ul className="mt-1 list-inside list-disc">
                {usage.programs.map((p) => (
                  <li key={p.id}>
                    {p.name} {p.isTemplate ? "(mal)" : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onSave(input)} disabled={!input.name.trim() || busy}>
          Lagre
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Avbryt
        </Button>
      </div>
    </section>
  );
}

export default function AdminInnholdPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [usage, setUsage] = useState<ExerciseUsage | null>(null);

  async function load() {
    const [ex, tpl] = await Promise.all([getExercises(), getTemplates()]);
    setExercises(ex);
    setTemplates(tpl);
  }

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    let alive = true;
    setLoading(true);
    load()
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Kunne ikke hente innhold"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [role, roleLoading, router]);

  const visibleExercises = useMemo(
    () => exercises.filter((e) => showArchived || e.is_active),
    [exercises, showArchived]
  );

  async function startEdit(id: string) {
    setEditing(id);
    setUsage(null);
    try {
      setUsage(await getExerciseUsage(id));
    } catch {
      setUsage(null);
    }
  }

  async function handleSave(input: ExerciseInput) {
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        await createExercise(input);
      } else if (editing) {
        await updateExercise(editing, input);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke lagre øvelsen");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(ex: Exercise) {
    setBusy(true);
    setError(null);
    try {
      await setExerciseActive(ex.id, !ex.is_active);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke endre status");
    } finally {
      setBusy(false);
    }
  }

  if (roleLoading || role !== "admin") {
    return (
      <AppPage title="Innhold">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  const editingExercise = editing && editing !== "new" ? exercises.find((e) => e.id === editing) ?? null : null;

  return (
    <AppPage
      title="Innhold"
      subtitle="Øvelsesbiblioteket og standardprogrammene rehabtrenerne tildeler fra."
    >
      {error && <p className="text-sm text-danger-ink">{error}</p>}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">Standardprogrammer</h2>
          <span className="text-xs text-ink-faint">{templates.length}</span>
        </div>

        {loading ? (
          <p className="text-sm text-ink-soft">Laster …</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-ink-soft">Ingen maler registrert.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <li key={t.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-ink">
                    {stageLabel(t.relevant_stage)}
                  </span>
                </div>
                {t.description && <p className="mt-1 text-sm text-ink-soft">{t.description}</p>}
                {t.body_area && <p className="mt-1 text-xs text-ink-faint">Område: {t.body_area}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-ink-soft">Øvelser</h2>
            <span className="text-xs text-ink-faint">{visibleExercises.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-border"
              />
              Vis arkiverte
            </label>
            {editing === null && (
              <Button
                size="sm"
                onClick={() => {
                  setEditing("new");
                  setUsage(null);
                }}
              >
                Ny øvelse
              </Button>
            )}
          </div>
        </div>

        {editing === "new" && (
          <ExerciseForm
            title="Ny øvelse"
            initial={emptyInput()}
            allExercises={exercises}
            busy={busy}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}

        {editingExercise && (
          <ExerciseForm
            title={`Rediger: ${editingExercise.name}`}
            initial={toInput(editingExercise)}
            allExercises={exercises}
            excludeId={editingExercise.id}
            usage={usage}
            busy={busy}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Laster …</p>
        ) : visibleExercises.length === 0 ? (
          <p className="text-sm text-ink-soft">Ingen øvelser registrert.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border shadow-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-alt text-xs font-semibold text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5">Navn</th>
                  <th className="px-4 py-2.5">Mønster</th>
                  <th className="px-4 py-2.5">Kapasitet</th>
                  <th className="px-4 py-2.5">Trinn</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleExercises.map((e) => (
                  <tr key={e.id} className={cn("bg-surface", !e.is_active && "opacity-60")}>
                    <td className="px-4 py-2.5 font-medium text-ink">{e.name}</td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {e.movement_pattern ? MOVEMENT_PATTERN_LABELS[e.movement_pattern] : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {e.capacity_level ? CAPACITY_LEVEL_LABELS[e.capacity_level] : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {(e.relevant_stages ?? []).map((s) => stageLabel(s)).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          e.is_active ? "bg-success-subtle text-success-ink" : "bg-surface-alt text-ink-faint"
                        )}
                      >
                        {e.is_active ? "Aktiv" : "Arkivert"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEdit(e.id)}
                          className="text-xs font-medium text-primary-ink hover:underline"
                        >
                          Rediger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(e)}
                          disabled={busy}
                          className="text-xs font-medium text-ink-soft hover:underline disabled:opacity-50"
                        >
                          {e.is_active ? "Arkiver" : "Aktiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppPage>
  );
}
