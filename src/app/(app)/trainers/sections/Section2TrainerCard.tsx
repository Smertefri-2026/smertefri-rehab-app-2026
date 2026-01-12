"use client";

export default function Section2TrainerCard() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">

        {/* 🧍 Profil */}
        <div className="flex items-center gap-4">
          {/* Profilbilde */}
          <div className="h-16 w-16 rounded-full bg-sf-soft flex items-center justify-center text-sf-muted">
            {/* Placeholder avatar */}
            <span className="text-lg font-semibold">TR</span>
          </div>

          {/* Navn + rolle */}
          <div className="flex-1">
            <p className="text-base font-semibold text-sf-text">
              Thomas Rehabson
            </p>
            <p className="text-sm text-sf-muted">
              Rehab-trener · Styrke & bevegelighet
            </p>
          </div>

          {/* Status */}
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Profil komplett
            </span>
          </div>
        </div>

        {/* 📝 Kort bio */}
        <div className="text-sm text-sf-text leading-relaxed">
          Erfaren rehab-trener med fokus på smertereduksjon, funksjonell styrke
          og trygg progresjon. Jobber evidensbasert og tett med kundene.
        </div>

        {/* 📊 Mini-oppsummering */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-sf-soft p-3">
            <p className="text-sm font-semibold text-sf-text">42</p>
            <p className="text-xs text-sf-muted">Kunder</p>
          </div>

          <div className="rounded-xl bg-sf-soft p-3">
            <p className="text-sm font-semibold text-sf-text">8 år</p>
            <p className="text-xs text-sf-muted">Erfaring</p>
          </div>

          <div className="rounded-xl bg-sf-soft p-3">
            <p className="text-sm font-semibold text-sf-text">Rehab</p>
            <p className="text-xs text-sf-muted">Spesialitet</p>
          </div>
        </div>

      </div>
    </section>
  );
}