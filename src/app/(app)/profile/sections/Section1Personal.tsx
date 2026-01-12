"use client";

export default function Section1Personal() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-6">

        {/* 🧍 Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#007C80] text-2xl font-semibold text-white">
              ØS
            </div>

            {/* Endre bilde (dummy) */}
            <button
              type="button"
              className="mt-2 text-xs text-[#007C80] hover:underline"
            >
              Endre bilde
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sf-text">
              Øystein Solheim
            </h2>
            <p className="text-sm text-sf-muted">
              Født: 26.05.1973 (52 år)
            </p>
          </div>
        </div>

        {/* 🧾 Personopplysninger */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sf-text">
            Personopplysninger
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fornavn */}
            <div>
              <label className="text-xs text-sf-muted">
                Fornavn
              </label>
              <input
                type="text"
                value="Øystein"
                disabled
                className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
              />
            </div>

            {/* Etternavn */}
            <div>
              <label className="text-xs text-sf-muted">
                Etternavn
              </label>
              <input
                type="text"
                value="Solheim"
                disabled
                className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="text-xs text-sf-muted">
                Telefon
              </label>
              <input
                type="text"
                value="40070320"
                disabled
                className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
              />
            </div>

            {/* Fødselsdato */}
            <div>
              <label className="text-xs text-sf-muted">
                Fødselsdato
              </label>
              <input
                type="text"
                value="26.05.1973"
                disabled
                className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}