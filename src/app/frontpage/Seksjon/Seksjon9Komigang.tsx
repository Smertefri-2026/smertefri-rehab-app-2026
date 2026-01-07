// src/app/frontpage/Seksjon/Seksjon9Komigang.tsx

import Link from "next/link";

export default function Seksjon9Komigang() {
  return (
    <section
      id="kom-i-gang"
      className="relative bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 text-center">

        {/* Overtekst */}
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Kom i gang
        </p>

        {/* Tittel */}
        <h2 className="mx-auto max-w-3xl text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          En portal for rehabilitering{" "}
          <span className="text-[#007C80]">– bygget rundt mennesker</span>
        </h2>

        {/* Intro */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          SmerteFri samler mennesker med smerter og rehab-trenere i ett felles
          system – med struktur, kontinuitet og faglig forankring.
          <br />
          <strong className="text-slate-800">
            Uansett hvor du starter, starter vi der du er.
          </strong>
        </p>

        {/* Steg */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 text-left">

          {/* Steg 1 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-[#007C80]">
              STEG 1
            </p>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Opprett bruker
            </h3>
            <p className="text-slate-600">
              Registrer deg som kunde eller trener og bli en del av
              SmerteFri-plattformen.
            </p>
          </div>

          {/* Steg 2 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-[#007C80]">
              STEG 2
            </p>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Bygg oversikt og forståelse
            </h3>
            <p className="text-slate-600">
              Kartlegg smerte, kapasitet og hverdag – eller følg kunder
              gjennom et strukturert rehabiliteringsløp.
            </p>
          </div>

          {/* Steg 3 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-[#007C80]">
              STEG 3
            </p>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Skap trygg progresjon
            </h3>
            <p className="text-slate-600">
              Følg utviklingen over tid – alene eller sammen med en
              rehab-trener i fagmiljøet.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

          <Link
            href="/login"
            className="rounded-full bg-[#007C80] px-10 py-4 text-white font-medium hover:opacity-90 transition"
          >
            Logg inn i appen
          </Link>

          <Link
            href="/register/client"
            className="rounded-full border border-sf-border bg-white px-10 py-4 font-medium text-slate-800 hover:bg-slate-50 transition"
          >
            Bli kunde
          </Link>

          <Link
            href="/register/trainer"
            className="rounded-full border border-[#007C80] px-10 py-4 font-medium text-[#007C80] hover:bg-[#E6F3F6] transition"
          >
            Bli rehab-trener
          </Link>

        </div>

        {/* Footer-note */}
        <p className="mt-10 text-sm text-slate-500 italic">
          SmerteFri er et fagmiljø i vekst.
          <br />
          Ikke et treningssenter på nett – men et system bygget for rehabilitering.
        </p>

      </div>
    </section>
  );
}