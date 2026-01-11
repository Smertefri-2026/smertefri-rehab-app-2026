"use client";

export default function Section3CalendarDialogHost() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">

          {/* HEADER */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sf-text">
              Handlinger
            </h3>

            <span className="text-xs text-sf-muted">
              (kommer snart)
            </span>
          </div>

          {/* PLACEHOLDER CONTENT */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled
              className="rounded-full border border-sf-border bg-sf-soft px-4 py-2 text-sm text-sf-muted"
            >
              + Opprett ny time
            </button>

            <button
              disabled
              className="rounded-full border border-sf-border bg-sf-soft px-4 py-2 text-sm text-sf-muted"
            >
              Rediger valgt time
            </button>

            <button
              disabled
              className="rounded-full border border-sf-border bg-sf-soft px-4 py-2 text-sm text-sf-muted"
            >
              Avbryt time
            </button>
          </div>

          {/* INFO */}
          <p className="mt-4 text-xs text-sf-muted">
            Denne seksjonen aktiveres når booking-dialog og kalender-state
            kobles på igjen.
          </p>

        </div>
      </div>
    </section>
  );
}