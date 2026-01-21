"use client";

export default function Section1PainSelector() {
  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Hvor har du vondt?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Nakke",
            "Skuldre",
            "Albue",
            "Håndledd",
            "Øvre rygg",
            "Rygg",
            "Nedre rygg",
            "Hofter",
            "Kne",
            "Ankel / Fot",
          ].map((area) => (
            <button
              key={area}
              className="
                flex items-center justify-between
                rounded-full border border-sf-border
                px-5 py-3
                text-sm font-medium
                hover:bg-sf-soft transition
              "
            >
              <span>{area}</span>
              <span className="text-sf-muted">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}