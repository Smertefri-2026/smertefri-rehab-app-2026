"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import {
  ensureDirectThread,
  findChatUserByEmail,
  searchChatUsersByName,
  type ChatUserSearchResult,
} from "@/lib/chat.api";
import { supabase } from "@/lib/supabaseClient";

function roleLabel(role: string | null) {
  if (role === "trainer") return "Trener";
  if (role === "admin") return "Admin";
  if (role === "client") return "Kunde";
  return "Bruker";
}

function fullName(u: { first_name: string | null; last_name: string | null }) {
  return `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Ukjent";
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "•";
}

export default function Section2InviteForm() {
  const router = useRouter();
  const { loading } = useRole();

  const [q, setQ] = useState("");
  const [results, setResults] = useState<ChatUserSearchResult[]>([]);
  const [selected, setSelected] = useState<ChatUserSearchResult | null>(null);

  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");

  // Debounce søk
  useEffect(() => {
    let alive = true;
    setErr(null);

    const run = async () => {
      const term = q.trim();
      if (term.length < 2) {
        setResults([]);
        setSelected(null);
        return;
      }

      try {
        const res = await searchChatUsersByName(term);
        if (!alive) return;
        setResults(res);
        setSelected((prev) => (prev && res.some((r) => r.id === prev.id) ? prev : null));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Kunne ikke søke.");
        setResults([]);
      }
    };

    const t = setTimeout(run, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const hasNoHits = useMemo(() => q.trim().length >= 2 && results.length === 0, [q, results]);

  async function getMeId() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const me = data.user?.id;
    if (!me) throw new Error("Ikke innlogget (Supabase session mangler).");
    return me;
  }

  const startThread = async () => {
    setErr(null);
    if (loading) return;

    if (!selected?.id) {
      setErr("Velg en person fra listen.");
      return;
    }

    setBusy(true);
    try {
      const me = await getMeId();

      if (selected.id === me) {
        throw new Error("Du kan ikke starte en samtale med deg selv 🙂");
      }

      // ✅ Viktig: gjenbruk eksisterende 1–1 tråd hvis den finnes
      const threadId = await ensureDirectThread(selected.id);

      // Send valgfri første melding
      const first = note.trim();
      if (first) {
        const { error: mErr } = await supabase.from("chat_messages").insert({
          thread_id: threadId,
          sender_id: me,
          body: first,
        });
        if (mErr) throw mErr;
      }

      router.push(`/chat/${threadId}`);
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke opprette samtale.");
    } finally {
      setBusy(false);
    }
  };

  const inviteByEmail = async () => {
    setErr(null);
    if (loading) return;

    const e = inviteEmail.trim().toLowerCase();
    if (!e) {
      setErr("Skriv inn e-postadressen du vil invitere.");
      return;
    }

    setBusy(true);
    try {
      const me = await getMeId();

      // 1) Hvis brukeren allerede finnes, start/gjenbruk chat direkte
      const existing = await findChatUserByEmail(e);
      if (existing?.id) {
        if (existing.id === me) throw new Error("Du kan ikke invitere deg selv 🙂");

        // ✅ Viktig: gjenbruk eksisterende 1–1 tråd hvis den finnes
        const threadId = await ensureDirectThread(existing.id);

        const first = note.trim();
        if (first) {
          const { error: mErr } = await supabase.from("chat_messages").insert({
            thread_id: threadId,
            sender_id: me,
            body: first,
          });
          if (mErr) throw mErr;
        }

        router.push(`/chat/${threadId}`);
        return;
      }

      // 2) Hvis ikke finnes: Edge Function (senere)
      throw new Error(
        "E-postinvitasjon er ikke aktivert ennå. (Vi kan slå den på med en Edge Function.)"
      );
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke invitere.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Søk */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-sf-text">Søk på navn</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Skriv minst 2 bokstaver…"
          className="w-full rounded-xl border border-sf-border px-4 py-2 text-sm bg-white"
          disabled={busy}
        />
        <p className="text-xs text-sf-muted">Tips: Søk på fornavn, etternavn eller begge.</p>
      </div>

      {/* Treffliste */}
      {results.length > 0 && (
        <div className="rounded-xl border border-sf-border overflow-hidden">
          {results.map((u) => {
            const name = fullName(u);
            const active = selected?.id === u.id;
            return (
              <button
                type="button"
                key={u.id}
                onClick={() => setSelected(u)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-sf-soft transition ${
                  active ? "bg-sf-soft" : "bg-white"
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-[#E6F3F6] flex items-center justify-center text-[#007C80] font-semibold overflow-hidden">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    initials(name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-xs text-sf-muted">{roleLabel(u.role)}</div>
                </div>
                <div className="text-xs text-sf-muted">{active ? "Valgt" : ""}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Valgfri melding */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-sf-text">Valgfri melding</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Skrives som første melding i samtalen (valgfritt)…"
          className="w-full rounded-xl border border-sf-border px-4 py-2 text-sm bg-white"
          disabled={busy}
        />
      </div>

      {/* Start chat */}
      <button
        onClick={startThread}
        disabled={busy || !selected?.id}
        className={`w-full rounded-full px-6 py-3 text-sm font-medium text-white transition ${
          busy || !selected?.id ? "bg-sf-muted/40" : "bg-[#007C80] hover:opacity-90"
        }`}
      >
        {busy ? "Jobber..." : "Start samtale"}
      </button>

      {/* Ingen treff → invite */}
      {hasNoHits && (
        <div className="rounded-xl border border-sf-border bg-white p-4 space-y-3">
          <div className="text-sm font-medium text-sf-text">Ingen treff</div>
          <p className="text-sm text-sf-muted">
            Hvis personen ikke finnes i systemet ennå, kan du invitere via e-post.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="epost@domene.no"
              className="w-full rounded-xl border border-sf-border px-4 py-2 text-sm bg-white"
              disabled={busy}
            />
            <button
              onClick={inviteByEmail}
              disabled={busy || !inviteEmail.trim()}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                busy || !inviteEmail.trim() ? "bg-sf-muted/40" : "bg-[#007C80] hover:opacity-90"
              }`}
            >
              Inviter
            </button>
          </div>

          <p className="text-xs text-sf-muted">
            (E-postinvitasjon krever en liten Edge Function – vi kan legge den til etter at UI er ferdig.)
          </p>
        </div>
      )}
    </section>
  );
}