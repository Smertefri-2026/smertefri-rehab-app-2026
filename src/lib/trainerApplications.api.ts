// src/lib/trainerApplications.api.ts
//
// The trainer onboarding pipeline: søker -> admin vurderer -> godkjent.
// See supabase/migrations/20260907000003_trainer_pipeline.sql.
import { supabase } from "@/lib/supabaseClient";

export type TrainerApplicationStatus = "pending" | "approved" | "rejected";

export type TrainerApplication = {
  id: string;
  applicant_id: string;
  education: string | null;
  certifications: string | null;
  bio: string | null;
  years_experience: number | null;
  submitted_at: string;
  status: TrainerApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  applicant?: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

/**
 * 🔐 Admin – alle ventende søknader, med søkerens navn/e-post påført.
 */
export async function fetchPendingTrainerApplications(): Promise<TrainerApplication[]> {
  const { data, error } = await supabase
    .from("trainer_applications")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if (error) throw error;

  const apps = data ?? [];
  if (apps.length === 0) return apps;

  const ids = Array.from(new Set(apps.map((a) => a.applicant_id)));
  const { data: profs, error: profErr } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", ids);

  if (profErr) throw profErr;

  const byId = new Map((profs ?? []).map((p) => [p.id, p]));
  return apps.map((a) => ({ ...a, applicant: byId.get(a.applicant_id) ?? null }));
}

/**
 * 🔐 Admin – godkjenn eller avslå en ventende søknad.
 */
export async function reviewTrainerApplication(
  applicationId: string,
  approve: boolean,
  notes?: string
) {
  const { error } = await supabase.rpc("review_trainer_application", {
    p_application_id: applicationId,
    p_approve: approve,
    p_notes: notes,
  });
  if (error) throw error;
}

/**
 * Innlogget brukers egen(e) søknad(er) — nyeste først. RLS
 * (trainer_applications_select_own) begrenser dette til egne rader.
 */
export async function getMyTrainerApplication(): Promise<TrainerApplication | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("trainer_applications")
    .select("*")
    .eq("applicant_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/**
 * Søk om å bli rehabtrener. Krever innlogget bruker
 * (trainer_applications_insert_own).
 */
export async function submitTrainerApplication(input: {
  education?: string;
  certifications?: string;
  bio?: string;
  years_experience?: number;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Ikke innlogget");

  const { error } = await supabase.from("trainer_applications").insert({
    applicant_id: user.id,
    education: input.education ?? null,
    certifications: input.certifications ?? null,
    bio: input.bio ?? null,
    years_experience: input.years_experience ?? null,
  });

  if (error) throw error;
}
