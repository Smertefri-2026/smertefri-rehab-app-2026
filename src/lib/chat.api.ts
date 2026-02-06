// src/lib/chat.api.ts
import { supabase } from "@/lib/supabaseClient";

export type ChatUserMini = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

export async function findChatUserByEmail(email: string) {
  const clean = email.trim().toLowerCase();
  const { data, error } = await supabase.rpc("chat_find_user_by_email", {
    p_email: clean,
  });
  if (error) throw error;
  return (data?.[0] ?? null) as ChatUserMini | null;
}

/**
 * Oppretter tråd + medlemmer.
 * created_by MUST settes, ellers stopper RLS INSERT på chat_threads.
 */
export async function createThreadWithMembers(memberIds: string[], title?: string | null) {
  const { data: authData, error: aErr } = await supabase.auth.getUser();
  if (aErr) throw aErr;

  const me = authData.user?.id;
  if (!me) throw new Error("Ikke innlogget.");

  // uniq, men RPC tar seg av å legge til "me" uansett
  const unique = Array.from(new Set(memberIds)).filter(Boolean);

  const { data, error } = await supabase.rpc("chat_create_thread", {
    p_member_ids: unique,
    p_title: title ?? null,
  });

  if (error) throw error;
  if (!data) throw new Error("Kunne ikke opprette chat-tråd.");

  return data as string; // thread_id
}

export type ChatUserSearchResult = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

export async function searchChatUsersByName(query: string) {
  const q = query.trim();
  if (q.length < 2) return [] as ChatUserSearchResult[];

  const { data, error } = await supabase.rpc("chat_search_users", {
    p_query: q,
  });
  if (error) throw error;

  return (data ?? []) as ChatUserSearchResult[];
}

/**
 * ✅ Direkte 1–1 chat: gjenbruk eksisterende tråd hvis den finnes,
 * ellers opprett ny. Bruker RPC for å unngå RLS-problemer.
 *
 * RPC: public.chat_ensure_direct_thread(p_other uuid) -> uuid (thread_id)
 */
export async function ensureDirectThread(otherUserId: string) {
  // (Valgfritt) sanity-check på session
  const { data: s, error: sErr } = await supabase.auth.getSession();
  if (sErr) throw sErr;
  const me = s.session?.user?.id;
  if (!me) throw new Error("Ikke innlogget");

  if (!otherUserId) throw new Error("Mangler mottaker");
  if (me === otherUserId) throw new Error("Kan ikke starte chat med deg selv");

  const { data, error } = await supabase.rpc("chat_ensure_direct_thread", {
    p_other: otherUserId,
  });

  if (error) throw error;
  if (!data) throw new Error("Kunne ikke åpne eller opprette chat-tråd");

  return data as string; // thread_id (uuid)
}