"use client";

import { useMemo, useState } from "react";
import Turnstile from "react-turnstile";

type Wants = "info" | "demo" | "begge";

export default function Seksjon11Kontakt() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bookingUrl = useMemo(() => {
    return "https://cal.com/smertefri/15min";
  }, []);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(false);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    const honey = String(fd.get("company") ?? "");
    if (honey.trim().length > 0) return;

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const wants = String(fd.get("wants") ?? "info") as Wants;
    const msg = String(fd.get("msg") ?? "").trim();

    if (!name || !email) {
      setError("Fyll inn navn og e-post.");
      return;
    }
    if (!email.includes("@")) {
      setError("Skriv inn en gyldig e-post.");
      return;
    }
    if (!token) {
      setError("Bekreft at du ikke er en robot (Turnstile).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          wants,
          msg,
          turnstileToken: token,
          source: "frontpage",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Kunne ikke sende. Prøv igjen.");
        return;
      }

      setSent(true);
      setToken(null);
      form.reset();
    } catch (err: any) {
      setError(err?.message || "Ukjent feil. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="kontakt" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* VENSTRE */}
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#007C80]">
              Kontakt
            </p>

            <h2 className="text-4xl font-semibold leading-tight text-slate-900">
              Vil du vite mer om{" "}
              <span className="text-[#007C80]">SmerteFri</span>?
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-700">
              Book et <span className="font-semibold">15 minutters møte</span> direkte her,
              eller send en kort henvendelse i skjemaet.
            </p>

            {/* ✅ Desktop: alltid innebygd booking */}
            <div className="mt-8 hidden overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm md:block">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="text-sm font-semibold text-slate-900">Book 15 min (innebygd)</div>
                <div className="mt-1 text-xs text-slate-600">
                  Hvis du heller vil åpne i ny fane, kan du bruke knappen på mobil.
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

            {/* ✅ Mobil: egen knapp (best UX på mobil) */}
            <div className="mt-8 md:hidden">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#007C80] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Book 15 min møte
              </a>
              <p className="mt-3 text-center text-xs text-slate-500">
                På mobil åpner booking i ny fane (raskere og mer stabilt).
              </p>
            </div>
          </div>

          {/* HØYRE – SKJEMA */}
          <div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Send en melding</div>
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

                <div>
                  <label className="text-sm font-semibold text-slate-700">Hva ønsker du?</label>
                  <select
                    name="wants"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                    defaultValue="info"
                  >
                    <option value="info">Info om SmerteFri</option>
                    <option value="demo">Demo / gjennomgang</option>
                    <option value="begge">Begge deler</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Kort melding</label>
                  <textarea
                    name="msg"
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
                    placeholder="Hva ønsker du å vite mer om?"
                  />
                </div>

                {/* Turnstile */}
                {siteKey ? (
                  <div className="flex justify-center">
                    <Turnstile
                      sitekey={siteKey}
                      onVerify={(t) => setToken(t)}
                      onExpire={() => setToken(null)}
                      onError={() => setToken(null)}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Mangler <span className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</span> i env.
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#007C80] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Sender..." : "Send inn"}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Ved innsending godtar du at vi kan kontakte deg om SmerteFri.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}