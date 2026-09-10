"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** Sikkerhet & innlogging — reelle handlinger mot Supabase Auth. */
export default function Section5Security() {
  const [email, setEmail] = useState<string | null>(null);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setEmail(data.user?.email ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function handlePasswordReset() {
    if (!email || resetState === "sending") return;
    setResetState("sending");
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/register/reset`,
    });
    if (error) {
      setResetState("error");
      setMsg(error.message);
      return;
    }
    setResetState("sent");
  }

  async function handleSignOutEverywhere() {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/login";
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-ink">Sikkerhet &amp; innlogging</h3>

        <div className="flex items-center justify-between gap-3 rounded-md border border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">E-post</p>
            <p className="truncate text-sm text-ink-soft">{email ?? "…"}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-success-ink">Bekreftet</span>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Passord</p>
            <p className="text-sm text-ink-soft">
              Vi sender en lenke til e-posten din for å sette nytt passord.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={!email || resetState === "sending" || resetState === "sent"}
            className="shrink-0 rounded-md border border-border px-4 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-alt disabled:opacity-50"
          >
            {resetState === "sending"
              ? "Sender …"
              : resetState === "sent"
              ? "Lenke sendt ✓"
              : "Endre passord"}
          </button>
        </div>

        {msg && <p className="text-sm text-danger-ink">{msg}</p>}

        <div className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Aktive innlogginger</p>
            <p className="text-sm text-ink-soft">Logg ut av alle enheter du er innlogget på.</p>
          </div>
          <button
            type="button"
            onClick={handleSignOutEverywhere}
            disabled={signingOut}
            className="shrink-0 rounded-md border border-transparent bg-danger-subtle px-4 py-2 text-[13px] font-medium text-danger-ink transition hover:opacity-90 disabled:opacity-50"
          >
            {signingOut ? "Logger ut …" : "Logg ut overalt"}
          </button>
        </div>
      </div>
    </section>
  );
}
