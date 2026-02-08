// src/app/frontpage/Seksjon/Seksjon4Dashbord.tsx

import Image from "next/image";

export default function Seksjon4Dashbord() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#E6F3F6] via-[#F4FBFA] to-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid grid-cols-1 items-center gap-20 md:grid-cols-2">

          {/* VENSTRE – MOBILBILDE */}
          <div className="relative flex justify-center">

            {/* Glow / bakgrunn */}
            <div className="absolute inset-0 flex justify-center">
              <div className="h-[420px] w-[320px] rounded-full bg-[#007C80]/15 blur-[80px]" />
            </div>

            {/* Selve bildet */}
            <Image
              src="/dashbord4.png"
              alt="SmerteFri dashboard – oversikt for bruker og rehab-trener"
              width={200}
              height={410}
              className="relative z-10"
              priority
            />
          </div>

          {/* HØYRE – TEKST */}
          <div>
            <p className="mb-3 text-sm uppercase tracking-widest text-slate-500">
              Dashboard
            </p>

            <h2 className="text-4xl font-semibold leading-tight text-slate-900">
              Full oversikt <br />
              <span className="text-[#007C80]">– uten stress</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-slate-700">
              SmerteFri gir både bruker og rehab-trener ett felles utgangspunkt.
              Dashboardet viser det viktigste her og nå – slik at oppfølging,
              progresjon og videre trening skjer strukturert og forståelig.
            </p>

            <ul className="mt-8 space-y-3 text-slate-700">
              <li>• Neste økt og avtaler – alltid oppdatert</li>
              <li>• Direkte tilgang til smerter, tester, kosthold og kalender</li>
              <li>• Ett system for oversikt, dialog og fremgang</li>
              <li>• Utviklet for hverdagsbruk </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}