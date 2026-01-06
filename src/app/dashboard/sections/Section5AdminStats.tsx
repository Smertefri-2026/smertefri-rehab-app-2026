"use client";

export default function Section5AdminStats() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Administrativ oversikt
        </h2>

        <span className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          Kun admin
        </span>
      </div>

      {/* Intro */}
      <p className="mb-6 max-w-xl text-sm text-slate-600">
        Denne seksjonen gir administrator oversikt over bruk, aktivitet
        og struktur i SmerteFri. Tallene brukes for innsikt og forbedring
        – ikke kontroll.
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Stat 1 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Aktive brukere
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            —
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ikke lastet data
          </p>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rehab-trenere
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            —
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Totalt registrerte
          </p>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tester registrert
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            —
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Siste 30 dager
          </p>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Oppfølginger
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            —
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Timer / bookinger
          </p>
        </div>

      </div>

      {/* Divider */}
      <div className="my-8 h-px w-full bg-slate-200" />

      {/* Bottom note */}
      <p className="text-xs italic text-slate-500">
        Mer detaljer og filtre legges til etter hvert som funksjonalitet aktiveres.
      </p>
    </section>
  );
}