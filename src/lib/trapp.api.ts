// src/lib/trapp.api.ts
import { supabase } from "@/lib/supabaseClient";
import type { TrappStage } from "@/lib/trapp/stages";

export type TrappStateRow = {
  client_id: string;
  current_stage: TrappStage;
  is_maintenance_mode: boolean;
  entered_stage_at: string;
  updated_at: string;
};

export type TrappHistoryRow = {
  id: string;
  client_id: string;
  from_stage: TrappStage | null;
  to_stage: TrappStage;
  reason: string;
  triggered_by: string | null;
  created_at: string;
};

export async function getTrappState(clientId: string): Promise<TrappStateRow | null> {
  const { data, error } = await supabase
    .from("trapp_state")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return (data as TrappStateRow) ?? null;
}

export async function getTrappHistory(clientId: string): Promise<TrappHistoryRow[]> {
  const { data, error } = await supabase
    .from("trapp_stage_history")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TrappHistoryRow[]) ?? [];
}

/** Kunden setter startpunktet sitt (Ro) — kalles ved fullført kartlegging. */
export async function initTrappForSelf(clientId: string): Promise<void> {
  const existing = await getTrappState(clientId);
  if (existing) return;
  const { error } = await supabase.rpc("transition_trapp_stage", {
    p_client_id: clientId,
    p_to_stage: "ro",
    p_reason: "Startet reisen etter kartlegging",
  });
  if (error) throw error;
}

/** Rehabtrener/admin flytter en kunde til et nytt trinn. */
export async function transitionStage(
  clientId: string,
  toStage: TrappStage,
  reason: string,
  maintenanceMode = false
): Promise<void> {
  const { error } = await supabase.rpc("transition_trapp_stage", {
    p_client_id: clientId,
    p_to_stage: toStage,
    p_reason: reason,
    p_maintenance_mode: maintenanceMode,
  });
  if (error) throw error;
}
