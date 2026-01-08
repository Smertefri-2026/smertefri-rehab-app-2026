// src/app/frontpage/Seksjon/Seksjon1Hero.tsx
"use client";

export default function Seksjon1Hero() {
  const goToLogin = () => {
    window.location.href = "https://app.smertefri.no/login";
  };

  const goToRegister = () => {
    window.location.href = "https://app.smertefri.no/register/client";
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#E6F3F6] via-[#F4FBFA] to-[#F8FAFC]">
      {/* INNHOLD */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 items-center">

          {/* LEFT */}
          <div>
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm border border-sf-border mb-6">
              <span className="h-2 w-2 rounded-full bg-[#007C80]" />
              Helhetlig rehab · smerte · kosthold · funksjon
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900">
              Bli smertefri <span className="text-[#007C80]">– og</span>
              <br />
              <span className="text-[#007C80]">
                lær kroppen å fungere igjen
              </span>
            </h1>

            {/* Ingress */}
            <p className="mt-6 max-w-xl text-lg text-slate-700">
              SmerteFri er en nasjonal plattform der mennesker og rehab-trenere
              møtes i et fagmiljø bygget for å ta deg trygt ut av smerte – og
              videre til et sterkere, mer funksjonelt liv.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={goToLogin}
                className="rounded-full bg-[#007C80] px-8 py-4 text-white font-medium hover:opacity-90 transition"
              >
                Logg inn
              </button>

              <button
                onClick={goToRegister}
                className="rounded-full border border-sf-border bg-white px-8 py-4 font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                Bli kunde
              </button>
            </div>

            {/* Subline */}
            <p className="mt-6 text-sm text-slate-600">
              Bygget sammen med rehab-trenere · strukturert progresjon ·
              full oversikt uten stress
            </p>
          </div>

          {/* RIGHT – CARD */}
          <div className="relative">
            <div className="rounded-2xl bg-white shadow-xl border border-sf-border p-8">
              <h3 className="text-lg font-semibold mb-6">
                SmerteFri – oversikt
              </h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-sf-border px-4 py-3 text-sm">
                  Neste økt: <strong>torsdag 11:00</strong>
                </div>

                <div className="rounded-xl border border-sf-border px-4 py-3 text-sm">
                  Smerte:{" "}
                  <strong className="text-[#007C80]">på vei ned</strong>
                </div>

                <div className="rounded-xl border border-sf-border px-4 py-3 text-sm">
                  Tester, kosthold og kalender samlet ett sted
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-600">
        Bla ned ↓
      </div>
    </section>
  );
}