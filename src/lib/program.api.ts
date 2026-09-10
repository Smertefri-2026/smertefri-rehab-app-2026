// src/lib/program.api.ts
//
// Program-/øvelsesmotor. V1: treneren tildeler en SmerteFri-standardmal.
// Ved tildeling klones malen til et personlig program kunden kan følge, og
// som treneren kan finjustere (bytte en øvelse mot regresjon/progresjon)
// uten å røre malen.
import { supabase } from "@/lib/supabaseClient";
import type { TrappStage } from "@/lib/trapp/stages";

export type Exercise = {
  id: string;
  name: string;
  instruction: string | null;
  media_url: string | null;
  default_sets: number | null;
  default_reps: number | null;
  default_duration_sec: number | null;
  body_areas: string[];
  purposes: string[];
  relevant_stages: TrappStage[];
  regression_of: string | null;
  progression_of: string | null;
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
  exercise: Pick<Exercise, "id" | "name" | "instruction" | "regression_of" | "progression_of">;
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
      exercise:exercises ( id, name, instruction, regression_of, progression_of )
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
