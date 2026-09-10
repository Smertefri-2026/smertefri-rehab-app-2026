"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/** Enkel utlogging — tilgjengelig også på mobil, der sidebaren er skjult. */
export default function Section7SignOut() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Logg ut</h3>
          <p className="text-sm text-ink-soft">Logg ut av denne enheten.</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-alt disabled:opacity-50"
        >
          <LogOut size={15} />
          {busy ? "Logger ut …" : "Logg ut"}
        </button>
      </div>
    </section>
  );
}
