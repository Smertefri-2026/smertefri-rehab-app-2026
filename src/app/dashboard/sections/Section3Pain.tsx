"use client";

export default function Section3Pain() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Smerte & belastning
        </h2>

        <span className="text-xs text-slate-500">
          Status: ikke registrert
        </span>
      </div>

      {/* Intro */}
      <p className="mb-6 max-w-xl text-sm text-slate-600">
        I SmerteFri brukes smerteregistrering for å forstå sammenhenger –
        ikke for å bekrefte at noe er “galt”. Smerte er informasjon, og gir
        et viktig beslutningsgrunnlag for videre progresjon.
      </p>

      {/* Pain cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Card 1 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Hvor kjenner du smerte?
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Rygg, nakke, skulder, hofte, kne eller annet område
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke registrert
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Smertenivå
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Hvordan oppleves smerten akkurat nå?
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ingen vurdering lagt inn
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Belastning siste økt
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Lett · moderat · krevende
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke angitt
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Endring over tid
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Opp eller ned siden forrige økt
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Mangler historikk
          </p>
        </div>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs italic text-slate-500">
        Smerte følges for å skape trygghet – ikke begrensninger.
      </p>
    </section>
  );
}