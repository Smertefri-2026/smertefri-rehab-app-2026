// /Users/oystein/smertefri-rehab-app-2026/src/app/(public)/trenere/Seksjon/Seksjon7CTA.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Wants = "beta" | "filmer" | "begge";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: "light" | "dark";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function Seksjon7CTA() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [tsToken, setTsToken] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const widgetElRef = useRef<HTMLDivElement | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  // ✅ Cal.com booking link
  const bookingUrl = useMemo(() => "https://cal.com/smertefri/15min", []);

  // Load Turnstile script + render widget
  useEffect(() => {
    if (!siteKey) return;

    const src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    const existing = document.querySelector(`script[src="${src}"]`);

    if (!existing) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }

    const interval = window.setInterval(() => {
      if (window.turnstile && widgetElRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(widgetElRef.current, {
          sitekey: siteKey,
          callback: (token) => setTsToken(token),
          theme: "light",
        });
        window.clearInterval(interval);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [siteKey]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(false);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // honeypot
    const honey = String(fd.get("company") ?? "");
    if (honey.trim().length > 0) return;

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const wants = String(fd.get("wants") ?? "beta") as Wants;

    if (!name || !email) {
      setError("Fyll inn navn og e-post.");
      return;
    }
    if (!email.includes("@")) {
      setError("Skriv inn en gyldig e-post.");
      return;
    }
    if (!siteKey) {
      setError("Mangler Turnstile site key (NEXT_PUBLIC_TURNSTILE_SITE_KEY).");
      return;
    }
    if (!tsToken) {
      setError("Bekreft at du ikke er en robot (Turnstile).");
      return;
    }

    setSending(true);
    try {
      const payload = {
        name,
        email,
        wants,
        phone: String(fd.get("phone") ?? ""),
        city: String(fd.get("city") ?? ""),
        edu: String(fd.get("edu") ?? ""),
        msg: String(fd.get("msg") ?? ""),
        turnstileToken: tsToken,
      };

      const res = await fetch("/api/trainer-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Kunne ikke sende. Prøv igjen.");
      }

      setSent(true);

      // reset token + widget
      setTsToken(null);
      if (window.turnstile && widgetIdRef.current && typeof window.turnstile.reset === "function") {
        window.turnstile.reset(widgetIdRef.current);
      }

      formEl.reset();
    } catch (err: any) {
      setError(err?.message || "Noe gikk galt.");

      setTsToken(null);
      if (window.turnstile && widgetIdRef.current && typeof window.turnstile.reset === "function") {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="bli-med" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          {/* VENSTRE */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Vil du bli med fra start?
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Hvis du har PT-utdanning og Rehab Trainer-kurs (fullført eller pågående),
              inviterer vi deg til å bli med i miljøet som bygger SmerteFri videre.
            </p>

            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Velg hva du ønsker</div>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>✅ Bli betatrener og teste plattformen</li>
                <li>🎬 Bidra med filmproduksjon (royalty-modell)</li>
                <li>🤝 Begge deler</li>
              </ul>

              {/* Mobil: åpne i ny fane */}
              <div className="mt-5 md:hidden">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Book 15 min møte
                </a>
                <p className="mt-3 text-xs text-slate-500">
                  På mobil åpner vi booking i ny fane (best opplevelse).
                </p>
              </div>
            </div>

            {/* Desktop: innebygd booking alltid */}
            <div className="mt-6 hidden overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm md:block">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="text-sm font-semibold text-slate-900">Book 15 min (innebygd)</div>
                <div className="mt-1 text-xs text-slate-600">
                  Velg tidspunkt som passer – møtet kan være video.
                </div>
              </div>
              <iframe
                src={bookingUrl}
                className="h-[780px] w-full"
                allow="camera; microphone; fullscreen; payment"
                loading="lazy"
                title="Cal.com booking"
              />
            </div>
          </div>

          {/* HØYRE – SKJEMA */}
          <div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900" id="skjema">
                    Send inn interesse
                  </div>
                  <div className="mt-1 text-sm text-slate-600">Vi svarer fortløpende. Ingen spam.</div>
                </div>
                {sent && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Sendt ✅
                  </span>
                )}
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                {/* Honeypot */}
                <div className="hidden">
                  <label>
                    Company
                    <input name="company" type="text" autoComplete="off" />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Navn *</label>
                    <input
                      name="name"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      placeholder="Fornavn Etternavn"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">E-post *</label>
                    <input
                      name="email"
                      type="email"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      placeholder="navn@epost.no"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Telefon (valgfritt)</label>
                    <input
                      name="phone"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      placeholder="99 99 99 99"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">By / arbeidssted</label>
                    <input
                      name="city"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      placeholder="Drammen / SATS / klinikk"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Utdanning</label>
                    <select
                      name="edu"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      defaultValue="PT + Rehab Trainer"
                    >
                      <option>PT</option>
                      <option>PT + Rehab Trainer</option>
                      <option>PT + Rehab Trainer (pågående)</option>
                      <option>PT + Rehab Trainer + Kosthold</option>
                      <option>Student (med PT + rehab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Hva ønsker du?</label>
                    <select
                      name="wants"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                      defaultValue="beta"
                    >
                      <option value="beta">Betatester</option>
                      <option value="filmer">Bidra med filmer</option>
                      <option value="begge">Begge deler</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Kort melding</label>
                  <textarea
                    name="msg"
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                    placeholder="Fortell kort hva du jobber med og hva du ønsker å bidra med."
                  />
                </div>

                {/* Turnstile widget */}
                <div className="pt-2">
                  <div ref={widgetElRef} />
                  <p className="mt-2 text-xs text-slate-500">Turnstile brukes kun for å stoppe spam.</p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {sending ? "Sender..." : "Send inn"}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Ved innsending godtar du at vi kan kontakte deg om betatesting og/eller filmproduksjon.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}