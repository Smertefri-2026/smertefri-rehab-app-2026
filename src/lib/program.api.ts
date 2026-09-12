// src/lib/program.api.ts
//
// Program-/øvelsesmotor. V1: treneren tildeler en SmerteFri-standardmal.
// Ved tildeling klones malen til et personlig program kunden kan følge, og
// som treneren kan finjustere (bytte en øvelse mot regresjon/progresjon)
// uten å røre malen.
import { supabase } from "@/lib/supabaseClient";
import type { TrappStage } from "@/lib/trapp/stages";
import type { CapacityLevel, MovementPattern } from "@/lib/exercise/taxonomy";

export type Exercise = {
  id: string;
  name: string;
  instruction: string | null;
  video_url: string | null;
  default_sets: number | null;
  default_reps: number | null;
  default_duration_sec: number | null;
  body_areas: string[];
  purposes: string[];
  relevant_stages: TrappStage[];
  movement_pattern: MovementPattern | null;
  capacity_level: CapacityLevel | null;
  equipment: string[];
  regression_of: string | null;
  progression_of: string | null;
  is_active: boolean;
};

export type ExerciseInput = {
  name: string;
  instruction?: string | null;
  video_url?: string | null;
  default_sets?: number | null;
  default_reps?: number | null;
  default_duration_sec?: number | null;
  body_areas?: string[];
  purposes?: string[];
  relevant_stages?: TrappStage[];
  movement_pattern?: MovementPattern | null;
  capacity_level?: CapacityLevel | null;
  equipment?: string[];
  regression_of?: string | null;
  progression_of?: string | null;
};

export type ProgramTemplate = {
  id: string;
  name: string;
  description: string | null;
  relevant_stage: TrappStage | null;
  body_area: string | null;
};

export type ProgramDayExercise = {
  id: string;
  exercise_id: string;
  sort_order: number;
  sets: number | null;
  reps: number | null;
  duration_sec: number | null;
  load_note: string | null;
  exercise: Pick<Exercise, "id" | "name" | "instruction" | "video_url" | "regression_of" | "progression_of">;
};

export type ProgramDay = {
  id: string;
  day_index: number;
  title: string | null;
  exercises: ProgramDayExercise[];
};

export type ProgramDetail = {
  id: string;
  name: string;
  description: string | null;
  relevant_stage: TrappStage | null;
  days: ProgramDay[];
};

export type ActiveAssignment = {
  id: string;
  client_id: string;
  program_id: string;
  current_day_index: number;
  status: string;
  program: ProgramDetail;
};

export type WorkoutCompletionRow = {
  id: string;
  assignment_id: string;
  client_id: string;
  completion_date: string;
  day_index: number;
  status: "ja" | "delvis" | "nei";
  rpe: number | null;
  pain_during: number | null;
  notes: string | null;
  created_at: string;
};

const DAY_SELECT = `
  id, name, description, relevant_stage,
  program_days (
    id, day_index, title,
    program_day_exercises (
      id, exercise_id, sort_order, sets, reps, duration_sec, load_note,
      exercise:exercises ( id, name, instruction, video_url, regression_of, progression_of )
    )
  )
`;

function shapeProgram(row: any): ProgramDetail {
  const days: ProgramDay[] = (row.program_days ?? [])
    .map((d: any) => ({
      id: d.id,
      day_index: d.day_index,
      title: d.title,
      exercises: (d.program_day_exercises ?? [])
        .map((e: any) => ({ ...e, exercise: e.exercise }))
        .sort((a: ProgramDayExercise, b: ProgramDayExercise) => a.sort_order - b.sort_order),
    }))
    .sort((a: ProgramDay, b: ProgramDay) => a.day_index - b.day_index);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    relevant_stage: row.relevant_stage,
    days,
  };
}

export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase.from("exercises").select("*").order("name");
  if (error) throw error;
  return (data as Exercise[]) ?? [];
}

/** Admin → Innhold: oppretter en ny øvelse i biblioteket. */
export async function createExercise(input: ExerciseInput): Promise<{ id: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const { data, error } = await supabase
    .from("exercises")
    .insert({ ...input, created_by: user.id } as never)
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

/** Admin → Innhold: redigerer metadata på en eksisterende øvelse. */
export async function updateExercise(id: string, patch: Partial<ExerciseInput>): Promise<void> {
  const { error } = await supabase.from("exercises").update(patch as never).eq("id", id);
  if (error) throw error;
}

/** Arkiverer/gjenåpner en øvelse. Arkivering sletter ingenting — historiske
 *  program_day_exercises fortsetter å referere raden og vises uendret. */
export async function setExerciseActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("exercises").update({ is_active: isActive } as never).eq("id", id);
  if (error) throw error;
}

export type ExerciseUsage = {
  totalUses: number;
  programs: { id: string; name: string; isTemplate: boolean }[];
};

/** Admin → Innhold: hvor brukes denne øvelsen — i hvilke programmer/maler. */
export async function getExerciseUsage(exerciseId: string): Promise<ExerciseUsage> {
  const { data, error } = await supabase
    .from("program_day_exercises")
    .select("id, program_day:program_days(program:programs(id, name, is_template))")
    .eq("exercise_id", exerciseId);
  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    program_day: { program: { id: string; name: string; is_template: boolean } | null } | null;
  }>;

  const seen = new Map<string, { id: string; name: string; isTemplate: boolean }>();
  for (const r of rows) {
    const p = r.program_day?.program;
    if (p && !seen.has(p.id)) seen.set(p.id, { id: p.id, name: p.name, isTemplate: p.is_template });
  }
  return { totalUses: rows.length, programs: Array.from(seen.values()) };
}

export async function getTemplates(stage?: TrappStage): Promise<ProgramTemplate[]> {
  let q = supabase
    .from("programs")
    .select("id, name, description, relevant_stage, body_area")
    .eq("is_template", true)
    .order("name");
  if (stage) q = q.eq("relevant_stage", stage);
  const { data, error } = await q;
  if (error) throw error;
  return (data as ProgramTemplate[]) ?? [];
}

export async function getTemplateDetail(templateId: string): Promise<ProgramDetail | null> {
  const { data, error } = await supabase.from("programs").select(DAY_SELECT).eq("id", templateId).maybeSingle();
  if (error) throw error;
  return data ? shapeProgram(data) : null;
}

export async function getActiveAssignment(clientId: string): Promise<ActiveAssignment | null> {
  const { data, error } = await supabase
    .from("program_assignments")
    .select(`id, client_id, program_id, current_day_index, status, program:programs ( ${DAY_SELECT} )`)
    .eq("client_id", clientId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    client_id: data.client_id,
    program_id: data.program_id,
    current_day_index: data.current_day_index,
    status: data.status,
    program: shapeProgram(data.program),
  };
}

/** Kloner en mal til et personlig program og tildeler det til kunden. */
export async function assignProgramFromTemplate(
  clientId: string,
  templateId: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const template = await getTemplateDetail(templateId);
  if (!template) throw new Error("Fant ikke malen");

  const { data: prog, error: progErr } = await supabase
    .from("programs")
    .insert({
      name: template.name,
      description: template.description,
      is_template: false,
      relevant_stage: template.relevant_stage,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (progErr) throw progErr;
  const cloneId = (prog as { id: string }).id;

  for (const day of template.days) {
    const { data: d, error: dErr } = await supabase
      .from("program_days")
      .insert({ program_id: cloneId, day_index: day.day_index, title: day.title } as never)
      .select("id")
      .single();
    if (dErr) throw dErr;
    const dayId = (d as { id: string }).id;

    if (day.exercises.length) {
      const rows = day.exercises.map((e) => ({
        program_day_id: dayId,
        exercise_id: e.exercise_id,
        sort_order: e.sort_order,
        sets: e.sets,
        reps: e.reps,
        duration_sec: e.duration_sec,
        load_note: e.load_note,
      }));
      const { error: eErr } = await supabase.from("program_day_exercises").insert(rows as never);
      if (eErr) throw eErr;
    }
  }

  await supabase
    .from("program_assignments")
    .update({ status: "completed" } as never)
    .eq("client_id", clientId)
    .eq("status", "active");

  const { error: aErr } = await supabase.from("program_assignments").insert({
    client_id: clientId,
    program_id: cloneId,
    assigned_by: user.id,
    current_day_index: 1,
    status: "active",
  } as never);
  if (aErr) throw aErr;
}

/** Trener bytter én øvelse i det tildelte programmet (til regresjon/progresjon). */
export async function swapExercise(dayExerciseId: string, newExerciseId: string): Promise<void> {
  const { data: ex, error: exErr } = await supabase
    .from("exercises")
    .select("default_sets, default_reps, default_duration_sec")
    .eq("id", newExerciseId)
    .single();
  if (exErr) throw exErr;

  const { error } = await supabase
    .from("program_day_exercises")
    .update({
      exercise_id: newExerciseId,
      sets: (ex as any).default_sets,
      reps: (ex as any).default_reps,
      duration_sec: (ex as any).default_duration_sec,
    } as never)
    .eq("id", dayExerciseId);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Programbygger — trener redigerer et tildelt (ikke-mal) program direkte.
// Alt her skriver til programs/program_days/program_day_exercises, som
// enhver trener/admin allerede har full skrivetilgang til (RLS, 0005).
// ----------------------------------------------------------------------------

async function endActiveAssignment(clientId: string) {
  const { error } = await supabase
    .from("program_assignments")
    .update({ status: "completed" } as never)
    .eq("client_id", clientId)
    .eq("status", "active");
  if (error) throw error;
}

/** Trener lager et helt nytt, tomt program (ikke fra mal) og tildeler det. */
export async function createBlankProgram(input: {
  clientId: string;
  name: string;
  description?: string | null;
  relevantStage?: TrappStage | null;
  bodyArea?: string | null;
}): Promise<{ programId: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const { data: prog, error: progErr } = await supabase
    .from("programs")
    .insert({
      name: input.name,
      description: input.description ?? null,
      is_template: false,
      relevant_stage: input.relevantStage ?? null,
      body_area: input.bodyArea ?? null,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (progErr) throw progErr;
  const programId = (prog as { id: string }).id;

  const { error: dayErr } = await supabase
    .from("program_days")
    .insert({ program_id: programId, day_index: 1, title: "Dag 1" } as never);
  if (dayErr) throw dayErr;

  await endActiveAssignment(input.clientId);

  const { error: aErr } = await supabase.from("program_assignments").insert({
    client_id: input.clientId,
    program_id: programId,
    assigned_by: user.id,
    current_day_index: 1,
    status: "active",
  } as never);
  if (aErr) throw aErr;

  return { programId };
}

export async function updateProgramMeta(
  programId: string,
  patch: { name?: string; description?: string | null }
): Promise<void> {
  const { error } = await supabase.from("programs").update(patch as never).eq("id", programId);
  if (error) throw error;
}

export async function addProgramDay(programId: string, title?: string): Promise<ProgramDay> {
  const { data: days, error: daysErr } = await supabase
    .from("program_days")
    .select("day_index")
    .eq("program_id", programId)
    .order("day_index", { ascending: false })
    .limit(1);
  if (daysErr) throw daysErr;
  const nextIndex = ((days?.[0] as { day_index: number } | undefined)?.day_index ?? 0) + 1;

  const { data, error } = await supabase
    .from("program_days")
    .insert({ program_id: programId, day_index: nextIndex, title: title ?? `Dag ${nextIndex}` } as never)
    .select("id, day_index, title")
    .single();
  if (error) throw error;
  return { ...(data as { id: string; day_index: number; title: string | null }), exercises: [] };
}

export async function removeProgramDay(dayId: string): Promise<void> {
  const { error } = await supabase.from("program_days").delete().eq("id", dayId);
  if (error) throw error;
}

export async function updateProgramDayTitle(dayId: string, title: string): Promise<void> {
  const { error } = await supabase.from("program_days").update({ title } as never).eq("id", dayId);
  if (error) throw error;
}

/** Legger til en øvelse i en dag med øvelsens standardverdier. */
export async function addExerciseToDay(dayId: string, exerciseId: string): Promise<void> {
  const [{ data: ex, error: exErr }, { data: rows, error: rowsErr }] = await Promise.all([
    supabase
      .from("exercises")
      .select("default_sets, default_reps, default_duration_sec")
      .eq("id", exerciseId)
      .single(),
    supabase
      .from("program_day_exercises")
      .select("sort_order")
      .eq("program_day_id", dayId)
      .order("sort_order", { ascending: false })
      .limit(1),
  ]);
  if (exErr) throw exErr;
  if (rowsErr) throw rowsErr;

  const nextSort = ((rows?.[0] as { sort_order: number } | undefined)?.sort_order ?? 0) + 1;
  const e = ex as { default_sets: number | null; default_reps: number | null; default_duration_sec: number | null };

  const { error } = await supabase.from("program_day_exercises").insert({
    program_day_id: dayId,
    exercise_id: exerciseId,
    sort_order: nextSort,
    sets: e.default_sets,
    reps: e.default_reps,
    duration_sec: e.default_duration_sec,
  } as never);
  if (error) throw error;
}

export async function removeExerciseFromDay(dayExerciseId: string): Promise<void> {
  const { error } = await supabase.from("program_day_exercises").delete().eq("id", dayExerciseId);
  if (error) throw error;
}

/** Endre sett/reps/tid/belastningsnotat — evt. bytt selve øvelsen (regresjon/progresjon eller helt annen). */
export async function updateDayExercise(
  dayExerciseId: string,
  patch: {
    exercise_id?: string;
    sets?: number | null;
    reps?: number | null;
    duration_sec?: number | null;
    load_note?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("program_day_exercises").update(patch as never).eq("id", dayExerciseId);
  if (error) throw error;
}

/** Flytt øvelsen ett hakk opp/ned i dagens rekkefølge (bytter sort_order med naboen). */
export async function moveExerciseInDay(
  dayExercises: ProgramDayExercise[],
  dayExerciseId: string,
  direction: "up" | "down"
): Promise<void> {
  const ordered = [...dayExercises].sort((a, b) => a.sort_order - b.sort_order);
  const i = ordered.findIndex((e) => e.id === dayExerciseId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ordered.length) return;

  const a = ordered[i];
  const b = ordered[j];
  const [aErr, bErr] = await Promise.all([
    supabase.from("program_day_exercises").update({ sort_order: b.sort_order } as never).eq("id", a.id),
    supabase.from("program_day_exercises").update({ sort_order: a.sort_order } as never).eq("id", b.id),
  ]).then((rs) => rs.map((r) => r.error));
  if (aErr) throw aErr;
  if (bErr) throw bErr;
}

/** Lagrer det aktive (ikke-mal) programmet som en gjenbrukbar SmerteFri-mal. */
export async function saveProgramAsTemplate(programId: string): Promise<{ templateId: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const source = await getTemplateDetail(programId);
  if (!source) throw new Error("Fant ikke programmet");

  const { data: prog, error: progErr } = await supabase
    .from("programs")
    .insert({
      name: source.name,
      description: source.description,
      is_template: true,
      relevant_stage: source.relevant_stage,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (progErr) throw progErr;
  const templateId = (prog as { id: string }).id;

  for (const day of source.days) {
    const { data: d, error: dErr } = await supabase
      .from("program_days")
      .insert({ program_id: templateId, day_index: day.day_index, title: day.title } as never)
      .select("id")
      .single();
    if (dErr) throw dErr;
    const dayId = (d as { id: string }).id;

    if (day.exercises.length) {
      const rows = day.exercises.map((e) => ({
        program_day_id: dayId,
        exercise_id: e.exercise_id,
        sort_order: e.sort_order,
        sets: e.sets,
        reps: e.reps,
        duration_sec: e.duration_sec,
        load_note: e.load_note,
      }));
      const { error: eErr } = await supabase.from("program_day_exercises").insert(rows as never);
      if (eErr) throw eErr;
    }
  }

  return { templateId };
}

export type AssignmentHistoryRow = {
  id: string;
  program_id: string;
  program_name: string;
  status: string;
  assigned_at: string;
  updated_at: string;
};

/** Tidligere (og nåværende) programtildelinger for en kunde, nyeste først. */
export async function getAssignmentHistory(clientId: string): Promise<AssignmentHistoryRow[]> {
  const { data, error } = await supabase
    .from("program_assignments")
    .select("id, program_id, status, assigned_at, updated_at, program:programs(name)")
    .eq("client_id", clientId)
    .order("assigned_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Array<{
    id: string;
    program_id: string;
    status: string;
    assigned_at: string;
    updated_at: string;
    program: { name: string } | null;
  }>).map((r) => ({
    id: r.id,
    program_id: r.program_id,
    program_name: r.program?.name ?? "—",
    status: r.status,
    assigned_at: r.assigned_at,
    updated_at: r.updated_at,
  }));
}

export async function endAssignment(clientId: string): Promise<void> {
  const { error } = await supabase
    .from("program_assignments")
    .update({ status: "completed" } as never)
    .eq("client_id", clientId)
    .eq("status", "active");
  if (error) throw error;
}

export type LogCompletionInput = {
  status: "ja" | "delvis" | "nei";
  rpe?: number;
  painDuring?: number;
  notes?: string;
};

/** Kunden logger dagens økt. Går videre til neste dag i programmet. */
export async function logWorkoutCompletion(
  assignment: ActiveAssignment,
  input: LogCompletionInput
): Promise<void> {
  const { error } = await supabase.from("workout_completions").insert({
    assignment_id: assignment.id,
    client_id: assignment.client_id,
    day_index: assignment.current_day_index,
    status: input.status,
    rpe: input.rpe ?? null,
    pain_during: input.painDuring ?? null,
    notes: input.notes ?? null,
  } as never);
  if (error) throw error;

  // current_day_index ligger bak assignments_write_assigned_trainer, så
  // kunden flytter dagen framover via en SECURITY DEFINER-RPC.
  const { error: advErr } = await supabase.rpc("advance_program_day", {
    p_assignment_id: assignment.id,
  });
  if (advErr) throw advErr;
}

export async function getCompletions(clientId: string, limit = 30): Promise<WorkoutCompletionRow[]> {
  const { data, error } = await supabase
    .from("workout_completions")
    .select("*")
    .eq("client_id", clientId)
    .order("completion_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as WorkoutCompletionRow[]) ?? [];
}

export async function getTodayCompletion(clientId: string): Promise<WorkoutCompletionRow | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("workout_completions")
    .select("*")
    .eq("client_id", clientId)
    .eq("completion_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as WorkoutCompletionRow) ?? null;
}
