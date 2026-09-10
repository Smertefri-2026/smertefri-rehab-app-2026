"use client";

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useChatUnread } from "@/stores/chatUnread.store";

/**
 * Holder «uleste meldinger»-telleren oppdatert. Kjører kun for kunde og
 * rehabtrener — admin er ikke deltaker i noen samtale (RLS gir admin ingen
 * tilgang til chat-tabellene), så en global realtime-subscription der ville
 * bare gi 403-støy uten nytte.
 */
export default function ChatUnreadManager() {
  const { userId, role, loading } = useRole();
  const setUnreadCount = useChatUnread((s) => s.setUnreadCount);

  const refreshingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);
  const hasThreadsRef = useRef(false);

  const participatesInChat = role === "client" || role === "trainer";

  const refresh = useCallback(async () => {
    if (!userId) return;
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    try {
      const { data: rows, error } = await supabase
        .from("chat_members")
        .select(`thread:chat_threads ( id, last_message_at )`)
        .eq("user_id", userId);

      if (error) return;

      const threads = (rows ?? [])
        .map((r) => r.thread as { id: string; last_message_at: string | null } | null)
        .filter(Boolean) as { id: string; last_message_at: string | null }[];

      hasThreadsRef.current = threads.length > 0;

      const ids = threads.map((t) => t.id);
      if (ids.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { data: reads, error: rErr } = await supabase
        .from("chat_thread_reads")
        .select("thread_id,last_read_at")
        .eq("user_id", userId)
        .in("thread_id", ids);

      if (rErr) return;

      const readMap = new Map<string, string | null>();
      for (const r of reads ?? []) readMap.set(r.thread_id, r.last_read_at ?? null);

      let n = 0;
      for (const t of threads) {
        const lm = t.last_message_at ? new Date(t.last_message_at).getTime() : 0;
        const lrIso = readMap.get(t.id) ?? null;
        const lr = lrIso ? new Date(lrIso).getTime() : 0;
        if (lm > lr) n++;
      }

      setUnreadCount(n);
    } finally {
      refreshingRef.current = false;
    }
  }, [userId, setUnreadCount]);

  const refreshDebounced = useCallback(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => refresh(), 250);
  }, [refresh]);

  useEffect(() => {
    if (loading || !userId || !participatesInChat) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      await refresh();
      // Åpne realtime-kanalen kun hvis brukeren faktisk har en samtale.
      if (cancelled || !hasThreadsRef.current) return;

      channel = supabase
        .channel("unread-manager")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () =>
          refreshDebounced()
        )
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_thread_reads" }, () =>
          refreshDebounced()
        )
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_thread_reads" }, () =>
          refreshDebounced()
        )
        .subscribe();
    })();

    const onFocus = () => refreshDebounced();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const onUnreadChanged = () => refreshDebounced();
    window.addEventListener("chat-unread-changed", onUnreadChanged);

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("chat-unread-changed", onUnreadChanged);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [loading, userId, participatesInChat, refresh, refreshDebounced, setUnreadCount]);

  return null;
}
