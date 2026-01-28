// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/chat/[threadId]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  members: MemberRow[];
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function pickProfile(p: MemberRow["profile"]): ProfileMini | null {
  if (!p) return null;
  return Array.isArray(p) ? (p[0] ?? null) : p;
}

function fullName(p: ProfileMini | null) {
  if (!p) return "Ukjent";
  const first = p.first_name ?? "";
  const last = p.last_name ?? "";
  const name = `${first} ${last}`.trim();
  return name || "Ukjent";
}

function initialsFromProfile(p: ProfileMini | null) {
  const n = fullName(p);
  const parts = n.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "•";
}

function formatStamp(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("no-NO", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;

  const { userId, loading } = useRole();

  const [thread, setThread] = useState<ThreadRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔒 Lås body-scroll mens vi er inne i en tråd (hindrer "page scroll")
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  const markRead = async (): Promise<boolean> => {
    if (!userId || !threadId) return false;

    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return false;

    const { error } = await supabase.from("chat_thread_reads").upsert(
      {
        thread_id: threadId,
        user_id: userId,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "thread_id,user_id" }
    );

    if (error) {
      console.error("markRead failed:", error);
      return false;
    }

    window.dispatchEvent(new Event("chat-unread-changed"));
    return true;
  };

  useEffect(() => {
    if (loading || !userId || !threadId) return;

    const onFocus = () => markRead();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [loading, userId, threadId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (loading || !userId || !threadId) return;

      setErr(null);

      const { data: t, error: tErr } = await supabase
        .from("chat_threads")
        .select(
          `
            id,
            title,
            members:chat_members(
              user_id,
              profile:profiles(id, first_name, last_name, avatar_url, role)
            )
          `
        )
        .eq("id", threadId)
        .single();

      if (!alive) return;

      if (tErr) {
        setErr(tErr.message);
        setThread(null);
        return;
      }

      setThread(t as ThreadRow);

      const { data: m, error: mErr } = await supabase
        .from("chat_messages")
        .select("id, thread_id, sender_id, body, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (!alive) return;

      if (mErr) {
        setErr(mErr.message);
        setMessages([]);
        return;
      }

      setMessages((m ?? []) as MessageRow[]);
      await markRead();
    })();

    return () => {
      alive = false;
    };
  }, [loading, userId, threadId]);

  useEffect(() => {
    if (loading || !userId || !threadId) return;

    const channel = supabase.channel(`chat-thread-${threadId}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload: any) => {
          const row = payload?.new as MessageRow | undefined;
          if (!row?.id) return;

          setMessages((prev) => {
            if (prev.some((x) => x.id === row.id)) return prev;
            return [...prev, row];
          });

          if (row.sender_id !== userId) {
            await markRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading, userId, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages.length]);

  const otherProfile = useMemo(() => {
    if (!thread?.members || !userId) return null;
    const other = thread.members
      .map((m) => ({ user_id: m.user_id, profile: pickProfile(m.profile) }))
      .find((m) => m.user_id !== userId)?.profile;
    return other ?? null;
  }, [thread, userId]);

  const headerTitle = useMemo(() => {
    const t = thread?.title?.trim();
    return t || fullName(otherProfile) || "Samtale";
  }, [thread, otherProfile]);

  const send = async () => {
    const body = text.trim();
    if (!body || !userId || !threadId) return;

    setSending(true);
    setErr(null);

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: userId,
        body,
      })
      .select("id, thread_id, sender_id, body, created_at")
      .single();

    if (error) {
      setErr(error.message);
      setSending(false);
      return;
    }

    setMessages((prev) => [...prev, data as MessageRow]);
    setText("");
    setSending(false);

    await markRead();
  };

  if (loading) return null;

  return (
    /**
     * ✅ Nøkkelen:
     * - På mobil trekker vi fra TabBar (72px) + safe-area, så input/header ikke "dyttes"
     * - Vi nøytraliserer (app)-layout sin pb ved å bruke negativ mb med samme verdi
     * - Kun midt-panelet får overflow-y-auto
     */
    <div
      className="
        bg-[#F4FBFA]
        overflow-hidden
        px-4 sm:px-6
        pt-4 sm:pt-6
        md:px-6 md:pt-6
        h-[calc(100dvh-(env(safe-area-inset-bottom)+72px))]
        md:h-[calc(100dvh-0px)]
        mb-[calc(-1*(env(safe-area-inset-bottom)+72px))]
        md:mb-0
      "
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Header (låst) */}
        <div className="shrink-0 pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="
                inline-flex items-center justify-center
                rounded-full border border-sf-border
                px-4 py-2
                text-sm font-medium text-sf-text
                hover:bg-sf-soft
              "
            >
              ←
            </Link>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-sf-text truncate">
                {headerTitle}
              </h1>
              {otherProfile?.role && (
                <p className="text-xs text-sf-muted">
                  {otherProfile.role === "trainer"
                    ? "Trener"
                    : otherProfile.role === "admin"
                    ? "Admin"
                    : "Kunde"}
                </p>
              )}
            </div>
          </div>

          {err && (
            <div className="mt-3 rounded-2xl border border-sf-border bg-white p-4 text-sm text-red-600">
              {err}
            </div>
          )}
        </div>

        {/* Meldinger (ENESTE scrollområde) */}
        <div
          className="
            flex-1 min-h-0
            overflow-y-auto overscroll-contain
            rounded-2xl border border-sf-border bg-white
            p-4 space-y-4
          "
        >
          {messages.length === 0 && (
            <div className="text-sm text-sf-muted">
              Ingen meldinger enda. Skriv første melding under 👇
            </div>
          )}

          {messages.map((m) => {
            const outgoing = m.sender_id === userId;

            if (outgoing) {
              return (
                <div key={m.id} className="flex items-start gap-3 justify-end">
                  <div className="max-w-[70%] rounded-2xl bg-[#007C80] px-4 py-2 text-white">
                    <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                    <span className="block mt-1 text-xs opacity-80">
                      {formatStamp(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[#E6F3F6] flex items-center justify-center text-[#007C80] text-sm font-semibold overflow-hidden shrink-0">
                  {otherProfile?.avatar_url ? (
                    <img
                      src={otherProfile.avatar_url}
                      alt={headerTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initialsFromProfile(otherProfile)
                  )}
                </div>

                <div className="max-w-[70%] rounded-2xl bg-sf-soft px-4 py-2">
                  <p className="text-sm text-sf-text whitespace-pre-wrap">
                    {m.body}
                  </p>
                  <span className="block mt-1 text-xs text-sf-muted">
                    {formatStamp(m.created_at)}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input (låst) */}
        <div className="shrink-0 pt-3">
          <div className="flex items-center gap-3 border border-sf-border rounded-full bg-white px-4 py-3">
            <input
              type="text"
              placeholder="Skriv en melding..."
              className="flex-1 text-sm outline-none bg-transparent"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className={`
                rounded-full px-4 py-2 text-sm font-medium text-white transition
                ${
                  sending || !text.trim()
                    ? "bg-sf-muted/40"
                    : "bg-[#007C80] hover:opacity-90"
                }
              `}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}