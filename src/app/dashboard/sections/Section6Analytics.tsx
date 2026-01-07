"use client";

export default function Section6Analytics() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Innsikt & utvikling
        </h2>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          I SmerteFri brukes data for å forstå sammenhenger og støtte riktige valg
          over tid – ikke for å rangere eller presse.
        </p>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Left */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-5">
          <h3 className="mb-2 font-medium text-slate-900">
            Hva brukes innsikt til?
          </h3>

          <ul className="space-y-3 text-sm text-slate-700">
            <li>✓ Se trender i smerte, kapasitet og belastning</li>
            <li>✓ Forstå hva som fungerer – og hva som ikke gjør det</li>
            <li>✓ Justere trening, tester og oppfølging i tide</li>
            <li>✓ Støtte dialog mellom kunde og rehab-trener</li>
          </ul>
        </div>

        {/* Right */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-5">
          <h3 className="mb-2 font-medium text-slate-900">
            Hva brukes det ikke til?
          </h3>

          <ul className="space-y-3 text-sm text-slate-700">
            <li>– Sammenligne deg med andre</li>
            <li>– Måle verdi eller prestasjon</li>
            <li>– Presse deg raskere enn kroppen tåler</li>
            <li>– Skape stress rundt helse</li>
          </ul>
        </div>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs italic text-slate-500">
        Innsikt gir først verdi når den brukes med forståelse og kontekst.
      </p>
    </section>
  );
}