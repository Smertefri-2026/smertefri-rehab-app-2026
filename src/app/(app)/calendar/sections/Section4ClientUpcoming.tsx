"use client";

export default function Section4ClientUpcoming() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">

          {/* HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sf-text">
              Kommende timer
            </h3>

            <span className="text-xs text-sf-muted">
              (kun visning)
            </span>
          </div>

          {/* LIST */}
          <div className="space-y-3">

            {/* ITEM */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sf-text">
                  Mandag 12. februar
                </span>
                <span className="text-xs text-sf-muted">
                  10:00 – 10:50 • Personlig trening
                </span>
              </div>

              <span className="rounded-full bg-sf-soft px-3 py-1 text-xs text-sf-muted">
                Bekreftet
              </span>
            </div>

            {/* ITEM */}
            <div className="flex items-center justify-between rounded-xl border border-sf-border px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sf-text">
                  Torsdag 15. februar
                </span>
                <span className="text-xs text-sf-muted">
                  14:00 – 14:25 • Oppfølging
                </span>
              </div>

              <span className="rounded-full bg-sf-soft px-3 py-1 text-xs text-sf-muted">
                Planlagt
              </span>
            </div>

            {/* TOM TILSTAND (placeholder) */}
            <div className="rounded-xl border border-dashed border-sf-border px-4 py-6 text-center">
              <p className="text-sm text-sf-muted">
                Flere kommende timer vil vises her
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}