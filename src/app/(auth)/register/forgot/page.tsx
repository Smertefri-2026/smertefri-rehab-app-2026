"use client";

import { useState } from "react";
import Link from "next/link";
import Turnstile from "react-turnstile";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;

    if (siteKey && !captchaToken) {
      setState("error");
      setError("Bekreft at du er et menneske.");
      return;
    }

    setState("sending");
    setError(null);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/register/reset`,
      captchaToken: captchaToken ?? undefined,
    });

    if (err) {
      setState("error");
      setCaptchaToken(null);
      setError(
        err.message.toLowerCase().includes("rate")
          ? "Vent litt før du prøver igjen."
          : err.message
      );
      return;
    }
    setState("sent");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
      {state === "sent" ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-3xl">
            ✉️
          </div>
          <h1 className="mt-6 text-xl font-semibold text-ink">Sjekk e-posten din</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Hvis <span className="font-medium text-ink">{email.trim()}</span> har en konto hos
            oss, har vi sendt en lenke for å sette nytt passord. Sjekk også søppelpost.
          </p>
          <p className="mt-6 text-sm">
            <Link href="/login" className="font-medium text-primary-ink hover:underline">
              Tilbake til innlogging
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-3xl">
            🔐
          </div>
          <h1 className="mt-6 text-xl font-semibold text-ink">Glemt passord</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Skriv inn e-postadressen din, så sender vi deg en lenke for å lage nytt passord.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-post"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-page px-4 py-3 text-base text-ink outline-none focus:border-primary"
            />

            {siteKey && (
              <Turnstile
                sitekey={siteKey}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />
            )}

            {error && <p className="text-sm text-danger-ink">{error}</p>}

            <button
              type="submit"
              disabled={state === "sending" || (!!siteKey && !captchaToken)}
              className="w-full rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {state === "sending" ? "Sender …" : "Send lenke"}
            </button>
          </form>

          <p className="mt-6 text-sm">
            <Link href="/login" className="font-medium text-primary-ink hover:underline">
              Tilbake til innlogging
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
