"use client";

export default function Section1TrainerSearch() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🔍 Søkefelt */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-sf-text">
            Søk etter trener
          </label>
          <input
            type="text"
            placeholder="Navn, spesialitet eller sted"
            className="
              w-full rounded-xl border border-sf-border
              px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#007C80]
            "
          />
        </div>

        {/* 🧩 Filtre (dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <button className="rounded-full border border-sf-border px-4 py-2 text-sm text-sf-text hover:bg-sf-soft">
            Rehab
          </button>

          <button className="rounded-full border border-sf-border px-4 py-2 text-sm text-sf-text hover:bg-sf-soft">
            Styrke
          </button>

          <button className="rounded-full border border-sf-border px-4 py-2 text-sm text-sf-text hover:bg-sf-soft">
            Kondisjon
          </button>

          <button className="rounded-full border border-sf-border px-4 py-2 text-sm text-sf-text hover:bg-sf-soft">
            Online
          </button>

        </div>

        {/* 📌 Info-tekst */}
        <p className="text-xs text-sf-muted">
          Velg en trener for å se profil, kompetanse og tilgjengelighet.
        </p>

      </div>
    </section>
  );
}