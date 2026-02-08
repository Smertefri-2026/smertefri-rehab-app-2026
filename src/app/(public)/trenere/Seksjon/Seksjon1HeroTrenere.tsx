// src/app/(public)/trenere/Seksjon/Seksjon1HeroTrenere.tsx
import Image from "next/image";

export default function Seksjon1HeroTrenere() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            SmerteFri Rehab – plattformen for rehab-trenere og smertebehandling
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
            SmerteFri er utviklet{" "}
            <span className="font-semibold">kun for rehab-trenere</span>{" "}
            for å gjøre oppfølging av kunder med smerte og rehabiliteringsbehov
            enklere, mer strukturert og mer profesjonell.
            <br />
            <span className="font-semibold">Dette er ikke et generelt PT-system.</span>{" "}
            Dette er rehab.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#bli-med"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Bli med som rehab-trener
            </a>
            <a
              href="#filmer"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Jeg vil bidra med filmer
            </a>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Vi søker trenere med minimum PT-utdanning og Rehab Trainer-kurs (fullført eller pågående).
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">CRM for rehab</div>
              <div className="mt-1 text-sm text-slate-600">
                Smerte, tester, progresjon og kommunikasjon – samlet.
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Trygg struktur</div>
              <div className="mt-1 text-sm text-slate-600">
                Kundene får oversikt, du får kontroll.
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Filmer & royalty</div>
              <div className="mt-1 text-sm text-slate-600">
                Passiv inntekt via videobibliotek (fase 2).
              </div>
            </div>
          </div>
        </div>

        {/* HØYRE – MOBILBILDE (samme mønster som kundesiden) */}
        <div className="relative flex justify-center">
          {/* Glow / bakgrunn */}
          <div className="absolute inset-0 flex justify-center">
            <div className="h-[440px] w-[340px] rounded-full bg-emerald-600/15 blur-[85px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <Image
              src="/PTdashbord2.png"
              alt="SmerteFri – eksempelvisning"
              width={200}
              height={410}
              className="relative z-10"
              priority
            />
            <div className="mt-3 text-center text-sm text-slate-600">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}