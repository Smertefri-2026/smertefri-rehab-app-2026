// src/app/frontpage/Seksjon/Seksjon7Kalender.tsx

import Image from "next/image";

export default function Seksjon7Kalender() {
  return (
    <section
      id="kalender"
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#E6F3F6] via-[#F4FBFA] to-[#F8FAFC]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* BILDE – alltid øverst på mobil */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative">
              {/* grønn glød */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#007C80]/20 blur-3xl scale-110" />

              <Image
                src="/kalender3.png"
                alt="SmerteFri – kalender for rehab og oppfølging"
                width={200}
                height={410}
                className="relative z-10"
                priority
              />
            </div>
          </div>

          {/* TEKST */}
          <div className="order-2 lg:order-1">
            <p className="mb-4 text-sm uppercase tracking-widest text-slate-500">
              Kalender & oppfølging
            </p>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Struktur{" "}
              <span className="text-[#007C80]">– som faktisk holder</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-700">
              I SmerteFri samles hele rehabiliteringsløpet i én felles kalender.
              Timer, tester og planlagt progresjon gir både deg og treneren
              oversikt, forutsigbarhet og kontinuitet.
            </p>

            <ul className="mt-8 space-y-3 text-slate-700">
              <li>✓ Se neste økt og oppfølging med ett blikk</li>
              <li>✓ Uke-, dags- og månedsvisning – tilpasset rehab</li>
              <li>✓ Synkronisering med Google- og Apple-kalender</li>
              <li>✓ Mindre koordinering – mer fokus på fremgang</li>
            </ul>

            <p className="mt-6 text-sm italic text-slate-600">
              Struktur skaper trygghet – trygghet skaper fremgang.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}