// src/app/(public)/trenere/Seksjon/Seksjon3StatusV1.tsx
import Image from "next/image";

export default function Seksjon3StatusV1() {
  return (
    <section id="status" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Status i dag – dette er klart i versjon 1.0
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              SmerteFri Rehab v1.0 er lansert og i bruk. Målet nå er å{" "}
              <span className="font-semibold">stabilisere</span> og samle erfaringer – uten å gjøre
              store endringer som kan påvirke aktive brukere.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Kalender (dag/uke/måned) – responsiv",
                "Kundeliste sortert etter neste time",
                "Meldinger trener ↔ kunde",
                "Smerteregistrering (kunde kan logge underveis)",
                "Tester (egenvekt, styrke, kondisjon)",
                "Profiler for trener og kunde",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-black/5 bg-white p-4 text-sm text-slate-700 shadow-sm"
                >
                  {t}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Viktig</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                For å unngå at dagens løsning “knekker” for de som bruker den nå,
                skjer større utvikling i en ny løsning:{" "}
                <span className="font-semibold">SmerteFri V2</span>.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Nå:</span> v1.0 betatesting & stabilisering
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Neste:</span> videobibliotek + filmproduksjon
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">V2:</span> ny arkitektur + mer fagstruktur
                </div>
              </div>
            </div>
          </div>

          {/* HØYRE – MOBILBILDE (samme mønster som kundesiden) */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex justify-center">
              <div className="h-[440px] w-[340px] rounded-full bg-slate-900/10 blur-[85px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Image
                src="/PTStauts.png"
                alt="SmerteFri – status v1.0"
                width={200}
                height={410}
                className="relative z-10"
              />
              <div className="mt-3 text-center text-sm text-slate-600">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}