// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/chat/sections/Section2ThreadList.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

type ProfileMini = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type MemberRow = {
  user_id: string;
  profile: ProfileMini | ProfileMini[] | null;
};

type ThreadRow = {
  id: string;
  title: string | null;
  last_message_at: string | null;
  members: MemberRow[];
};

function pickProfile(p: MemberRow["profile"]): ProfileMini | null {
  if (!p) return null;
  return Array.isArray(p) ? (p[0] ?? null) : p;
}

function fullName(p: ProfileMini | null) {
  if (!p) return "Ukjent";
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || "Ukjent";
}

function initials(p: ProfileMini | null) {
  const n = fullName(p);
  const parts = n.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "•";
}

function formatShort(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Section2ThreadList() {
  const { userId, loading } = useRole();

  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [readMap, setReadMap] = useState<Record<string, string | null>>({});
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;

    setErr(null);

    // 1) Hent tråder via chat_members for innlogget bruker
    const { data: rows, error } = await supabase
      .from("chat_members")
      .select(
        `
        thread:chat_threads(
          id,
          title,
          last_message_at,
          members:chat_members(
            user_id,
            profile:profiles(id, first_name, last_name, avatar_url, role)
          )
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      setErr(error.message);
      setThreads([]);
      setReadMap({});
      return;
    }

    const list = (rows ?? [])
      .map((r: any) => r.thread)
      .filter(Boolean) as ThreadRow[];

    // Sorter nyeste først
    list.sort((a, b) => {
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return tb - ta;
    });

    setThreads(list);

    // 2) Hent read-status for disse trådene
    const ids = list.map((t) => t.id);
    if (ids.length === 0) {
      setReadMap({});
      return;
    }

    const { data: reads, error: rErr } = await supabase
      .from("chat_thread_reads")
      .select("thread_id,last_read_at")
      .eq("user_id", userId)
      .in("thread_id", ids);

    if (rErr) {
      // Hvis RLS blokkerer reads, ser du det her
      console.error("chat_thread_reads select error:", rErr);
      setReadMap({});
      return;
    }

    const map: Record<string, string | null> = {};
    for (const r of reads ?? []) {
      map[r.thread_id] = r.last_read_at ?? null;
    }
    setReadMap(map);
  }, [userId]);

  useEffect(() => {
    if (loading || !userId) return;
    load();
  }, [loading, userId, load]);

  // Realtime: ny melding => reload
  useEffect(() => {
    if (loading || !userId) return;

    const ch = supabase
      .channel("threadlist-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [loading, userId, load]);

  // Når markRead trigges i andre views (ChatThreadPage) => reload
  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("chat-unread-changed", onChanged);
    return () => window.removeEventListener("chat-unread-changed", onChanged);
  }, [load]);

  const ui = useMemo(() => {
    return threads.map((t) => {
      const other =
        t.members
          ?.map((m) => ({ user_id: m.user_id, profile: pickProfile(m.profile) }))
          .find((m) => m.user_id !== userId)?.profile ?? null;

      const title = t.title?.trim() || fullName(other);

      const lr = readMap[t.id]; // last_read_at
      const lrMs = lr ? new Date(lr).getTime() : 0;
      const lmMs = t.last_message_at ? new Date(t.last_message_at).getTime() : 0;

      const unread = lmMs > lrMs; // DB-sannheten

      return { t, other, title, unread };
    });
  }, [threads, userId, readMap]);

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-sf-text mb-3">Samtaler</h2>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-3">
          {err}
        </div>
      )}

      {ui.length === 0 ? (
        <div className="text-sm text-sf-muted">Ingen samtaler enda.</div>
      ) : (
        <div className="divide-y divide-sf-border">
          {ui.map(({ t, other, title, unread }) => (
            <Link
              key={t.id}
              href={`/chat/${t.id}`}
              onClick={() => {
                // Optimistisk: fjern prikk med en gang (UI)
                setReadMap((prev) => ({ ...prev, [t.id]: new Date().toISOString() }));
                window.dispatchEvent(new Event("chat-unread-changed"));
              }}
              className="flex items-center gap-3 py-3 hover:bg-sf-soft rounded-xl px-2 transition"
            >
              <div className="relative h-10 w-10 rounded-full bg-[#E6F3F6] flex items-center justify-center text-[#007C80] font-semibold overflow-hidden">
                {other?.avatar_url ? (
                  <img src={other.avatar_url} alt={title} className="h-full w-full object-cover" />
                ) : (
                  initials(other)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`truncate ${unread ? "font-semibold text-sf-text" : "text-sf-text"}`}>
                      {title}
                    </div>

                    {unread && (
                      <span
                        className="h-2 w-2 rounded-full bg-[#D45151] shrink-0"
                        title="Ulest"
                      />
                    )}
                  </div>

                  <div className="text-xs text-sf-muted whitespace-nowrap">
                    {formatShort(t.last_message_at)}
                  </div>
                </div>

                {/* Vi fjerner "Ny melding" tekstlinjen helt */}
                <div className="text-xs text-sf-muted">&nbsp;</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}