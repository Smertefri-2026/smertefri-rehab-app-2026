"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type View = "checking" | "pending" | "confirmed" | "expired";

/**
 * Denne siden har to liv:
 *  1. Rett etter registrering — brukeren har IKKE bekreftet e-posten enda.
 *     Da er `emailRedirectTo` på signup satt hit, så bekreftelseslenken i
 *     e-posten fører også tilbake til denne ruten.
 *  2. Etter at brukeren har klikket bekreftelseslenken — da ligger det en
 *     sesjon (eller tokens i URL-hashen), og kontoen er aktivert.
 *
 * Vi må derfor vise riktig budskap ut fra faktisk tilstand, ikke bare anta
 * at e-posten er bekreftet.
 */
export default function EmailSentPage() {
  // SSR + første klient-render viser «checking»; effekten (post-hydrering)
  // avgjør riktig tilstand fra hash + sessionStorage + sesjon.
  const [view, setView] = useState<View>("checking");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<"client" | "trainer">("client");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    // Startvisning må være lik på server og klient (unngå hydreringsfeil);
    // hash-/sessionStorage-avhengig tilstand settes her, etter hydrering.
    /* eslint-disable react-hooks/set-state-in-effect */
    let pendingEmail = "";
    try {
      pendingEmail = sessionStorage.getItem("sf_pending_email") ?? "";
    } catch {
      /* utilgjengelig */
    }
    setEmail(pendingEmail);

    const hash = window.location.hash;
    const hashError =
      hash.includes("error") &&
      !!(() => {
        const p = new URLSearchParams(hash.replace(/^#/, ""));
        return p.get("error_code") ?? p.get("error");
      })();
    const fromEmailLink =
      hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=recovery");

    if (hashError) {
      setView("expired");
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    async function markConfirmed(userId: string) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("signup_intent")
          .eq("id", userId)
          .single();
        if (alive) setIntent(profile?.signup_intent === "trainer" ? "trainer" : "client");
      } catch {
        /* behold default "client"-tekst hvis oppslaget feiler */
      }
      if (alive) setView("confirmed");
    }

    (async () => {
      if (fromEmailLink) await new Promise((r) => setTimeout(r, 1500));
      if (!alive) return;
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      // En eksisterende sesjon betyr «konto klar» KUN hvis vi ikke nettopp
      // registrerte oss (da er den bare en gammel/annen innlogging).
      if (data.session && !(pendingEmail && !fromEmailLink)) {
        await markConfirmed(data.session.user.id);
      } else if (fromEmailLink) {
        setView("expired");
      } else {
        setView("pending");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (alive && event === "SIGNED_IN" && session) {
        markConfirmed(session.user.id);
        try {
          sessionStorage.removeItem("sf_pending_email");
        } catch {
          /* noop */
        }
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleResend = useCallback(async () => {
    if (!email) {
      setResendState("error");
      setResendError("Vi mangler e-postadressen din. Gå tilbake og registrer deg på nytt.");
      return;
    }
    setResendState("sending");
    setResendError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setResendState("error");
      setResendError(
        error.message.toLowerCase().includes("rate")
          ? "Vent litt før du prøver igjen — vi har nettopp sendt en e-post."
          : error.message
      );
      return;
    }
    setResendState("sent");
  }, [email]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
      {view === "checking" && <p className="text-sm text-ink-soft">Et øyeblikk …</p>}

      {view === "pending" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-3xl">
            ✉️
          </div>

          <h1 className="mt-6 text-xl font-semibold text-ink">Bekreft e-posten din</h1>

          <p className="mt-3 text-sm text-ink-soft">
            Vi har sendt en bekreftelseslenke til{" "}
            {email ? (
              <span className="font-medium text-ink">{email}</span>
            ) : (
              "e-postadressen du registrerte deg med"
            )}
            . Åpne e-posten og klikk på lenken for å aktivere kontoen.
          </p>

          <p className="mt-2 text-sm text-ink-soft">
            Kontoen er ikke aktiv før lenken er bekreftet. Du kan lukke dette vinduet
            — lenken åpner appen for deg.
          </p>

          <div className="mt-6 rounded-xl bg-page p-4 text-left text-sm text-ink-soft">
            <p className="font-medium text-ink">Fant du ikke e-posten?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Sjekk søppelpost / spam.</li>
              <li>Det kan ta et par minutter før den kommer frem.</li>
              <li>Kontroller at e-postadressen over er riktig.</li>
            </ul>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending" || resendState === "sent"}
              className="mt-3 font-medium text-primary-ink hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resendState === "sending"
                ? "Sender …"
                : resendState === "sent"
                ? "Ny e-post sendt ✓"
                : "Send bekreftelseslenken på nytt"}
            </button>

            {resendState === "error" && resendError && (
              <p className="mt-2 text-danger-ink">{resendError}</p>
            )}
          </div>

          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/login" className="font-medium text-primary-ink hover:underline">
              Tilbake til innlogging
            </Link>
          </p>
        </>
      )}

      {view === "confirmed" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-3xl">
            ✅
          </div>

          <h1 className="mt-6 text-xl font-semibold text-ink">E-posten er bekreftet</h1>

          <p className="mt-3 text-sm text-ink-soft">
            {intent === "trainer" ? (
              <>Kontoen din er aktivert. Neste steg er å sende søknaden din som rehabtrener.</>
            ) : (
              <>
                Kontoen din er aktivert. Neste steg er å fullføre kartleggingen, så
                kobler vi deg med en rehabtrener og setter opp planen din.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={intent === "trainer" ? "/trainer-application" : "/dashboard"}
              className="rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90"
            >
              {intent === "trainer" ? "Send søknad" : "Kom i gang"}
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

      {view === "expired" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-subtle text-3xl">
            ⏳
          </div>

          <h1 className="mt-6 text-xl font-semibold text-ink">Lenken har gått ut</h1>

          <p className="mt-3 text-sm text-ink-soft">
            Bekreftelseslenker er gyldige en begrenset tid. Be om en ny, så sender
            vi den til{" "}
            {email ? <span className="font-medium text-ink">{email}</span> : "e-posten din"}.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending" || resendState === "sent"}
              className="rounded-full bg-primary py-3 text-base font-medium text-primary-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {resendState === "sending"
                ? "Sender …"
                : resendState === "sent"
                ? "Ny e-post sendt ✓"
                : "Send ny bekreftelseslenke"}
            </button>
            <Link
              href="/login"
              className="rounded-full border border-border py-3 text-base font-medium text-ink-soft transition hover:bg-page"
            >
              Tilbake til innlogging
            </Link>
          </div>

          {resendState === "error" && resendError && (
            <p className="mt-3 text-sm text-danger-ink">{resendError}</p>
          )}
        </>
      )}
    </div>
  );
}
