"use client";

export default function Section2Address() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="space-y-4">

        {/* 🏠 Header */}
        <h3 className="text-sm font-semibold text-sf-text">
          Adresse
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Gateadresse */}
          <div className="sm:col-span-2">
            <label className="text-xs text-sf-muted">
              Gateadresse
            </label>
            <input
              type="text"
              value="Hotvetveien 122"
              disabled
              className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
            />
          </div>

          {/* Postnummer */}
          <div>
            <label className="text-xs text-sf-muted">
              Postnummer
            </label>
            <input
              type="text"
              value="3023"
              disabled
              className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
            />
          </div>

          {/* Sted */}
          <div>
            <label className="text-xs text-sf-muted">
              Sted
            </label>
            <input
              type="text"
              value="Drammen"
              disabled
              className="mt-1 w-full rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
            />
          </div>

        </div>

      </div>
    </section>
  );
}