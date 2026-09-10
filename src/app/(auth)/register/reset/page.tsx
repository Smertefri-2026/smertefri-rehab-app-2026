"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type View = "checking" | "ready" | "invalid" | "done";

/**
 * Landingssiden for «sett nytt passord»-lenken fra e-post. Supabase sender
 * brukeren hit med en recovery-sesjon i URL-hashen (detectSessionInUrl
 * bytter den til en sesjon). Da kan vi kalle updateUser({ password }).
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "checking";
    return window.location.hash.includes("error") ? "invalid" : "checking";
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash.includes("error")) return;
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setView(data.session ? "ready" : "checking");
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setView("ready");
      }
    });

    // Ingen sesjon dukket opp innen rimelig tid ⇒ ugyldig/utløpt lenke.
    const t = setTimeout(() => {
      if (alive) setView((v) => (v === "checking" ? "invalid" : v));
    }, 4000);

    return () => {
      alive = false;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (busy) return;
      if (password.length < 8) {
        setError("Passordet må være minst 8 tegn.");
        return;
      }
      if (password !== confirm) {
        setError("Passordene er ikke like.");
        return;
      }
      setBusy(true);
      setError(null);
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setBusy(false);
        setError(err.message);
        return;
      }
      setView("done");
    },
    [busy, password, confirm]
  );

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
      {view === "checking" && <p className="text-sm text-ink-soft">Et øyeblikk …</p>}

      {view === "invalid" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-subtle text-3xl">
            ⏳
          </div>
          <h1 className="mt-6 text-xl font-semibold text-ink">Lenken virker ikke</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Lenken for å sette nytt passord er brukt opp eller har gått ut. Be om en ny.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/register/forgot"
              className="rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90"
            >
              Be om ny lenke
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-border py-3 text-base font-medium text-ink-soft transition hover:bg-page"
            >
              Til innlogging
            </Link>
          </div>
        </>
      )}

      {view === "ready" && (
        <>
          <h1 className="text-xl font-semibold text-ink">Sett nytt passord</h1>
          <p className="mt-2 text-sm text-ink-soft">Velg et passord på minst 8 tegn.</p>

          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nytt passord"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-border bg-page px-4 py-3 pr-16 text-base text-ink outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-primary-ink"
              >
                {show ? "Skjul" : "Vis"}
              </button>
            </div>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Bekreft nytt passord"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-border bg-page px-4 py-3 text-base text-ink outline-none focus:border-primary"
            />

            {error && <p className="text-sm text-danger-ink">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Lagrer …" : "Lagre nytt passord"}
            </button>
          </form>
        </>
      )}

      {view === "done" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-3xl">
            ✅
          </div>
          <h1 className="mt-6 text-xl font-semibold text-ink">Passordet er oppdatert</h1>
          <p className="mt-3 text-sm text-ink-soft">Du er logget inn med det nye passordet.</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="mt-6 w-full rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90"
          >
            Til appen
          </button>
        </>
      )}
    </div>
  );
}
