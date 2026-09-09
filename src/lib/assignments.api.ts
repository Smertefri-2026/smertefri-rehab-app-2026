// src/lib/assignments.api.ts
//
// Shared reads against client_trainer_assignments — the single source of
// truth for who is assigned to whom (replaces the old trainer_client_links /
// profiles.trainer_id column). Writes always go through the assign_trainer()
// / end_assignment() SECURITY DEFINER RPCs (see supabase/migrations
// 20260907000003_trainer_pipeline.sql) — never a direct insert/update here.
import { supabase } from "@/lib/supabaseClient";

/**
 * The client's currently assigned trainer, or null if none.
 */
export async function getActiveTrainerIdForClient(clientId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("client_trainer_assignments")
    .select("trainer_id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data?.trainer_id ?? null;
}

/**
 * All clients currently assigned to a trainer.
 */
export async function getActiveClientIdsForTrainer(trainerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("client_trainer_assignments")
    .select("client_id")
    .eq("trainer_id", trainerId)
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []).map((r) => r.client_id);
}

/**
 * Bulk client_id -> trainer_id map for a set of clients (admin views that
 * list many clients at once and need each one's trainer without N+1 queries).
 */
export async function getActiveTrainerIdMapForClients(
  clientIds: string[]
): Promise<Record<string, string>> {
  const clean = Array.from(new Set(clientIds)).filter(Boolean);
  if (clean.length === 0) return {};

  const { data, error } = await supabase
    .from("client_trainer_assignments")
    .select("client_id, trainer_id")
    .eq("status", "active")
    .in("client_id", clean);

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.client_id] = row.trainer_id;
  return map;
}

/**
 * All clients that currently have an active assignment to any trainer
 * (admin views that want "active"/assigned clients only, across everyone).
 */
export async function getAllAssignedClientIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("client_trainer_assignments")
    .select("client_id")
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []).map((r) => r.client_id);
}

/**
 * Count of clients that currently have an active assignment. Combined with a
 * total client count this gives "clients without a trainer" without needing
 * a NOT EXISTS query (client_trainer_assignments enforces at most one active
 * row per client, so this count equals the number of distinct assigned
 * clients).
 */
export async function countActiveAssignments(): Promise<number> {
  const { count, error } = await supabase
    .from("client_trainer_assignments")
    .select("client_id", { count: "exact", head: true })
    .eq("status", "active");

  if (error) throw error;
  return count ?? 0;
}
