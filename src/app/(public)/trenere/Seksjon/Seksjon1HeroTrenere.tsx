// /Users/oystein/smertefri-rehab-app-2026/src/app/(public)/trenere/Seksjon/Seksjon1HeroTrenere.tsx
"use client";

import Image from "next/image";

export default function Seksjon1HeroTrenere() {
  const goToLogin = () => {
    window.location.href = "https://app.smertefri.no/login";
  };

  const goToRegisterTrainer = () => {
    window.location.href = "https://app.smertefri.no/register/trainer";
  };

  const goToFilms = () => {
    const el = document.getElementById("filmer");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = "#filmer";
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#E6F3F6] via-[#F4FBFA] to-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 items-center">
          {/* LEFT */}
          <div>
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm border border-sf-border mb-6">
              <span className="h-2 w-2 rounded-full bg-[#007C80]" />
              For rehab-trenere · smerte · progresjon · oppfølging
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900">
              Plattformen for{" "}
              <span className="text-[#007C80]">rehab-trenere</span>
              <br />
              som vil jobbe tryggere med smerte
            </h1>

            {/* Ingress */}
            <p className="mt-6 max-w-xl text-lg text-slate-700">
              SmerteFri er utviklet <span className="font-semibold">for rehab</span> – ikke som et generelt PT-system.
              Du får et strukturert oppfølgingsverktøy for smerte, tester, progresjon og kommunikasjon,
              slik at kundene føler trygghet og du får kontroll.
            </p>

            {/* CTA (mer lik kundesiden) */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={goToLogin}
                className="rounded-full bg-[#007C80] px-8 py-4 text-white font-medium hover:opacity-90 transition"
              >
                Logg inn
              </button>

              <button
                onClick={goToRegisterTrainer}
                className="rounded-full border border-sf-border bg-white px-8 py-4 font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                Registrer deg som trener
              </button>

              <button
                onClick={goToFilms}
                className="rounded-full border border-sf-border bg-white px-8 py-4 font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                Jeg vil bidra med filmer
              </button>
            </div>

            {/* Subline */}
            <p className="mt-6 text-sm text-slate-600">
              Vi søker trenere med minimum PT-utdanning og Rehab Trainer-kurs (fullført eller pågående).
            </p>

            {/* Cards (beholdt – samme som før, men i SmerteFri-look) */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">CRM for rehab</div>
                <div className="mt-1 text-sm text-slate-700">
                  Smerte, tester, progresjon og kommunikasjon – samlet.
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Trygg struktur</div>
                <div className="mt-1 text-sm text-slate-700">
                  Kundene får oversikt, du får kontroll.
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Filmer & royalty</div>
                <div className="mt-1 text-sm text-slate-700">
                  Passiv inntekt via videobibliotek (fase 2).
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT – MOBILBILDE (viktig: bilde på høyre side) */}
          <div className="relative flex justify-center">
            {/* Glow / bakgrunn */}
            <div className="absolute inset-0 flex justify-center">
              <div className="h-[440px] w-[340px] rounded-full bg-[#007C80]/15 blur-[85px]" />
            </div>

            <Image
              src="/PTdashbord2.png"
              alt="SmerteFri – trenerdashboard"
              width={220}
              height={460}
              className="relative z-10"
              priority
            />
          </div>
        </div>
      </div>

      {/* Scroll hint (valgfritt) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-600">
        Bla ned ↓
      </div>
    </section>
  );
}