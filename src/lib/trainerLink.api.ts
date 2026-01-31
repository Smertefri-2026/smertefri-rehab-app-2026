// src/lib/trainerLink.api.ts
import { supabase } from "@/lib/supabaseClient";

/**
 * Knytter innlogget kunde til en trener i trainer_client_links (via RPC).
 * Forventet SQL-funksjon:
 *   public.set_my_trainer(p_trainer_id uuid)
 */
export async function setMyTrainer(trainerId: string) {
  if (!trainerId) throw new Error("Mangler trainerId");

  const { data, error } = await supabase.rpc("set_my_trainer", {
    p_trainer_id: trainerId,
  });

  if (error) throw error;
  return data;
}

/**
 * Fjerner kundens trener-link i trainer_client_links (via RPC).
 * Forventet SQL-funksjon:
 *   public.remove_my_trainer()
 */
export async function removeMyTrainer() {
  const { data, error } = await supabase.rpc("remove_my_trainer");

  if (error) throw error;
  return data;
}