"use client";

export default function Section7AdminSearch() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        {/* Kort – lik stil som øvrige seksjoner */}
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">

          {/* Tittel */}
          <div>
            <h3 className="text-base font-semibold">Søk</h3>
            <p className="text-sm text-sf-muted">
              Admin kan søke etter kunde eller trener og åpne deres kalender.
            </p>
          </div>

          {/* Søkefelt (placeholder) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <input
                type="text"
                disabled
                placeholder="Søk på navn, e-post eller ID"
                className="
                  w-full
                  rounded-full
                  border
                  border-sf-border
                  bg-sf-soft
                  px-4
                  py-2
                  text-sm
                  text-sf-muted
                  outline-none
                "
              />
            </div>

            <button
              disabled
              className="
                rounded-full
                border
                border-sf-border
                px-5
                py-2
                text-sm
                text-sf-muted
                hover:bg-sf-soft
              "
            >
              Søk
            </button>
          </div>

          {/* Treffliste placeholder */}
          <div className="rounded-xl border border-dashed border-sf-border bg-sf-soft p-6 text-center text-sm text-sf-muted">
            Treffliste og valg av aktiv bruker kommer her.
          </div>

        </div>
      </div>
    </section>
  );
}