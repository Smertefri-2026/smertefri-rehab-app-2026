import { supabase } from "@/lib/supabaseClient";

export type ChatUserSearchResult = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

export async function searchChatUsersByName(term: string): Promise<ChatUserSearchResult[]> {
  const q = term.trim();
  if (q.length < 2) return [];

  // matcher: first_name, last_name, og "first last"
  const like = `%${q}%`;

  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id ?? null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, avatar_url")
    .or(
      [
        `first_name.ilike.${like}`,
        `last_name.ilike.${like}`,
        // "full name" match: vi simulerer med OR på begge deler (funker bra i praksis)
        // (Vil du ha 100% full-name-søk, kan vi lage RPC som concat'er i SQL.)
      ].join(",")
    )
    .order("first_name", { ascending: true })
    .order("last_name", { ascending: true })
    .limit(20);

  if (error) throw error;

  const rows = (data ?? []) as ChatUserSearchResult[];

  // valgfritt: fjern deg selv fra trefflisten
  return me ? rows.filter((r) => r.id !== me) : rows;
}

export async function findChatUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (!e) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, avatar_url, email")
    .eq("email", e)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function ensureDirectThread(otherId: string): Promise<string> {
  const { data, error } = await supabase.rpc("chat_ensure_direct_thread", {
    p_other: otherId,
  });

  if (error) throw error;
  return String(data);
}