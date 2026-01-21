"use client";

export default function Section4CardioSummary() {
  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Ikon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF5EF] text-[#2F6B4F]">
              ❤️
            </div>

            {/* Tittel + periode */}
            <div>
              <h3 className="text-base font-semibold text-sf-text">Kondis</h3>
              <p className="text-sm text-sf-muted">24.11.2025 – 09.12.2025</p>
            </div>
          </div>

          {/* Total endring */}
          <div className="text-right">
            <p className="text-xs text-sf-muted uppercase">Total endring</p>
            <p className="text-sm font-semibold text-[#C0392B]">−100%</p>
          </div>
        </div>

        {/* Resultater */}
        <div className="flex flex-col gap-1 text-sm">
          <p>
            <span className="font-medium">Baseline:</span> 600 m
          </p>
          <p>
            <span className="font-medium">Siste test:</span> 0 m
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full rounded-full bg-[#2F6B4F] py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Åpne Kondis-tester
        </button>
      </div>
    </section>
  );
}