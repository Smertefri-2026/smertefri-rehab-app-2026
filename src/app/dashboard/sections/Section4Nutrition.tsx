"use client";

export default function Section4Nutrition() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Kosthold & energi
        </h2>

        <span className="text-xs text-slate-500">
          Status: ikke loggført
        </span>
      </div>

      {/* Intro */}
      <p className="mb-6 max-w-xl text-sm text-slate-600">
        I SmerteFri brukes kosthold som støtte for trening, restitusjon
        og hverdagsenergi – ikke som et kontrollverktøy. Målet er oversikt
        og bevissthet, ikke perfekte tall.
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Card 1 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Energinivå i hverdagen
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Hvordan oppleves overskudd og energi i dag?
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke registrert
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Matrytme
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Regelmessige måltider gjennom dagen
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ingen data tilgjengelig
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Restitusjon etter trening
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Opplever du tilstrekkelig restitusjon?
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke vurdert
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Sammenheng med smerte & trening
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Kosthold sett i sammenheng med belastning
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Mangler historikk
          </p>
        </div>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs italic text-slate-500">
        Små justeringer over tid gir størst effekt.
      </p>
    </section>
  );
}