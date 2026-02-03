// src/lib/chatDirect.api.ts
import { supabase } from "@/lib/supabaseClient";

/**
 * ✅ Hos dere: clientId/trainerId = profiles.id = auth.users.id (uuid)
 * Denne filen bruker RPC for å unngå RLS-problemer ved INSERT på chat_threads.
 *
 * RPC: public.chat_ensure_direct_thread(p_other uuid) -> uuid (thread_id)
 */

async function ensureDirectThreadByOtherUserId(otherUserId: string) {
  // Ekstra sikkerhet: sjekk at vi faktisk har session (valgfritt, men nyttig)
  const { data: s, error: sErr } = await supabase.auth.getSession();
  if (sErr) throw sErr;
  if (!s.session?.user?.id) throw new Error("Ikke innlogget");

  if (!otherUserId) throw new Error("Mangler mottaker");
  if (s.session.user.id === otherUserId) throw new Error("Kan ikke starte chat med deg selv");

  const { data, error } = await supabase.rpc("chat_ensure_direct_thread", {
    p_other: otherUserId,
  });

  if (error) throw error;
  if (!data) throw new Error("Kunne ikke åpne eller opprette chat-tråd");

  return data as string; // thread_id (uuid)
}

export async function ensureDirectThreadByClientId(clientId: string) {
  return ensureDirectThreadByOtherUserId(clientId);
}

export async function ensureDirectThreadByTrainerId(trainerId: string) {
  return ensureDirectThreadByOtherUserId(trainerId);
}