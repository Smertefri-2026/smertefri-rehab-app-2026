// /Users/oystein/smertefri-rehab-app-2026/src/app/(public)/frontpage/Seksjon/Seksjon3Smerte.tsx

import Image from "next/image";

export default function Seksjon3Smerte() {
  return (
    <section
      id="smerter"
      className="relative w-full overflow-hidden bg-[#F4FBFA]"
    >
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* VENSTRE – TEKST */}
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#007C80]">
              Smerter
            </p>

            <h2 className="text-4xl font-semibold leading-tight text-slate-900">
              Logg smerte smart <br />
              <span className="text-[#007C80]">– og se utviklingen over tid</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-700">
              I SmerteFri handler smerte ikke bare om “hvor det gjør vondt”.
              Du registrerer område, intensitet (0–10) og mønster – slik at du og
              rehab-treneren kan finne sammenhenger, bygge trygg progresjon og
              dokumentere endring.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sf-border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Enkelt å registrere</div>
                <p className="mt-2 text-sm text-slate-700">
                  Velg område og intensitet – og følg opp med type/mønster når du vil.
                </p>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Aktive smerteområder</div>
                <p className="mt-2 text-sm text-slate-700">
                  Se hva du jobber med nå, og hold fokus uten å miste oversikten.
                </p>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Trender 7/30/90 dager</div>
                <p className="mt-2 text-sm text-slate-700">
                  Oppdag utvikling tidlig – og juster trening før det blir en kneik.
                </p>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Bedre dialog</div>
                <p className="mt-2 text-sm text-slate-700">
                  Tall og historikk gjør oppfølgingen mer presis, rolig og trygg.
                </p>
              </div>
            </div>
          </div>

          {/* HØYRE – MOBILBILDE */}
          <div className="relative flex justify-center">
            {/* Glow / bakgrunn */}
            <div className="absolute inset-0 flex justify-center">
              <div className="h-[440px] w-[340px] rounded-full bg-[#007C80]/15 blur-[85px]" />
            </div>

            <Image
              src="/smerte3.png"
              alt="SmerteFri – smerter og oppfølging i appen"
              width={200}
              height={410}
              className="relative z-10"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}