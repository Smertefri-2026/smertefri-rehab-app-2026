"use client";

export default function Section5ClientHistory() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">

          {/* HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sf-text">
              Tidligere timer
            </h3>

            <span className="text-xs text-sf-muted">
              Historikk
            </span>
          </div>

          {/* LIST */}
          <div className="space-y-3">

            {/* ITEM – fullført */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sf-text">
                  Mandag 5. februar
                </span>
                <span className="text-xs text-sf-muted">
                  10:00 – 10:50 • Personlig trening
                </span>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                Fullført
              </span>
            </div>

            {/* ITEM – kort time */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sf-text">
                  Torsdag 1. februar
                </span>
                <span className="text-xs text-sf-muted">
                  14:00 – 14:25 • Oppfølging
                </span>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                Fullført
              </span>
            </div>

            {/* ITEM – avlyst */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border px-4 py-3 opacity-70">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sf-text">
                  Mandag 29. januar
                </span>
                <span className="text-xs text-sf-muted">
                  09:00 – 09:50 • Personlig trening
                </span>
              </div>

              <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                Avlyst
              </span>
            </div>

            {/* TOM TILSTAND */}
            <div className="rounded-xl border border-dashed border-sf-border px-4 py-6 text-center">
              <p className="text-sm text-sf-muted">
                Eldre timer vil fortløpende vises her
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}