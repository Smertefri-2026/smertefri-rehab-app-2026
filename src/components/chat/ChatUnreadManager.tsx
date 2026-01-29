"use client";

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useChatUnread } from "@/stores/chatUnread.store";

export default function ChatUnreadManager() {
  const { userId, loading } = useRole();
  const setUnreadCount = useChatUnread((s) => s.setUnreadCount);

  const refreshingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    try {
      // 1) threads for user
      const { data: rows, error } = await supabase
        .from("chat_members")
        .select(
          `
          thread:chat_threads(
            id,
            last_message_at
          )
        `
        )
        .eq("user_id", userId);

      if (error) return;

      const threads = (rows ?? []).map((r: any) => r.thread).filter(Boolean) as {
        id: string;
        last_message_at: string | null;
      }[];

      const ids = threads.map((t) => t.id);
      if (ids.length === 0) {
        setUnreadCount(0);
        return;
      }

      // 2) reads for those threads
      const { data: reads, error: rErr } = await supabase
        .from("chat_thread_reads")
        .select("thread_id,last_read_at")
        .eq("user_id", userId)
        .in("thread_id", ids);

      if (rErr) return;

      const readMap = new Map<string, string | null>();
      for (const r of reads ?? []) readMap.set(r.thread_id, r.last_read_at ?? null);

      // 3) compute unread count
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
    if (loading || !userId) return;

    refresh();

    // Realtime: IKKE subscribe på hele chat_messages globalt hvis du kan unngå.
    // Her gjør vi en “snill” løsning: trigge refresh når chat_messages / reads endres,
    // men du bør på sikt filtrere (se 3B).
    const ch = supabase
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

    // Ingen polling. Kun focus/visibility.
    const onFocus = () => refreshDebounced();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    // Manuell signal fra UI
    const onUnreadChanged = () => refreshDebounced();
    window.addEventListener("chat-unread-changed", onUnreadChanged);

    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("chat-unread-changed", onUnreadChanged);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [loading, userId, refresh, refreshDebounced]);

  return null;
}