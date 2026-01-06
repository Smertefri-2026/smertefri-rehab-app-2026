"use client";

export default function Section2Tests() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Tester & fremgang
        </h2>

        <span className="text-xs text-slate-500">
          Sist oppdatert: ikke registrert
        </span>
      </div>

      {/* Intro */}
      <p className="mb-6 max-w-xl text-sm text-slate-600">
        Tester brukes som et referansepunkt for trygg progresjon.
        Ikke for å prestere, men for å forstå kroppen og justere riktig videre.
      </p>

      {/* Test-cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Card 1 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Egenvekt
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Knebøy, armhevninger og mage – 4 minutter
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ingen registrering ennå
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Styrke
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Basisøvelser og kontrollert belastning
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke gjennomført
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Kondisjon
          </p>
          <p className="mt-1 text-sm text-slate-600">
            4 minutters arbeidsperiode (sykkel, mølle, roing)
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ikke gjennomført
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-sf-border bg-sf-soft p-4">
          <p className="text-sm font-medium text-slate-900">
            Mobilitet & funksjon
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Bevegelse, kontroll og toleranse
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Valgfri – brukes ved behov
          </p>
        </div>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs italic text-slate-500">
        Fremgang vurderes over tid – ikke ut fra én test eller én dag.
      </p>
    </section>
  );
}