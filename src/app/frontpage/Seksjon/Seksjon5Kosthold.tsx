// src/app/frontpage/Seksjon/Seksjon5Kosthold.tsx

import Image from "next/image";

export default function Seksjon5Kosthold() {
  return (
    <section
      id="kosthold"
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#F4FBFA] via-[#F0FAF6] to-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-24">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* BILDE – alltid øverst på mobil */}
          <div className="relative order-1 md:order-2 flex justify-center">
            {/* Myk grønn glød bak */}
            <div className="absolute -inset-16 rounded-full bg-[#007C80]/10 blur-3xl" />

            {/* Selve bildet */}
            <Image
              src="/dashbord.png"
              alt="SmerteFri – kosthold som støtte for rehab og trening"
              width={200}
              height={410}
              className="relative z-10"
              priority
            />
          </div>

          {/* TEKST */}
          <div className="order-2 md:order-1">
            <p className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
              Kosthold
            </p>

            <h2 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
              Frihet <span className="text-[#007C80]">– ikke forbud</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-700">
              Kosthold i SmerteFri er ikke et regime – det er et støtteverktøy.
              Målet er å gi kroppen forutsetninger for mindre smerte,
              bedre restitusjon og trygg progresjon videre i trening.
            </p>

            <ul className="mt-8 space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="text-[#007C80]">✓</span>
                Enkelt og udramatisk kostholdslogg
              </li>
              <li className="flex gap-3">
                <span className="text-[#007C80]">✓</span>
                Synlige mønstre over tid – ikke dag-til-dag-press
              </li>
              <li className="flex gap-3">
                <span className="text-[#007C80]">✓</span>
                Fokus på energi, restitusjon og funksjon
              </li>
              <li className="flex gap-3">
                <span className="text-[#007C80]">✓</span>
                Gir rehab-treneren bedre grunnlag for helhetlig oppfølging
              </li>
            </ul>

            <p className="mt-6 text-sm text-slate-500 italic">
              Ikke perfekt. Bare litt bedre – over tid.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}