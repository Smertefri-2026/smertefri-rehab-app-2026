"use client";

import { Search, Filter } from "lucide-react";

export default function Section1ClientSearch() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🔍 Søk */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sf-muted"
            />
            <input
              type="text"
              disabled
              placeholder="Søk etter kunde (navn, e-post, sted)"
              className="
                w-full
                rounded-full
                border border-sf-border
                bg-sf-soft
                py-2.5 pl-10 pr-4
                text-sm
                text-sf-muted
                outline-none
              "
            />
          </div>

          <button
            disabled
            className="
              flex items-center gap-2
              rounded-full
              border border-sf-border
              px-4 py-2.5
              text-sm
              text-sf-muted
              hover:bg-sf-soft
            "
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* 👥 Kunde-liste (dummy, klikkbar) */}
        <div className="divide-y divide-sf-border">

          <a
            href="/clients"
            className="block py-3 transition hover:bg-sf-soft rounded-lg px-2"
          >
            <p className="text-sm font-medium">Ola Nordmann</p>
            <p className="text-xs text-sf-muted">42 år • Aktiv klient</p>
          </a>

          <a
            href="/clients"
            className="block py-3 transition hover:bg-sf-soft rounded-lg px-2"
          >
            <p className="text-sm font-medium">Kari Hansen</p>
            <p className="text-xs text-sf-muted">36 år • Sist time: i går</p>
          </a>

          <a
            href="/clients"
            className="block py-3 transition hover:bg-sf-soft rounded-lg px-2"
          >
            <p className="text-sm font-medium">Per Johansen</p>
            <p className="text-xs text-sf-muted">51 år • Inaktiv</p>
          </a>

        </div>

      </div>
    </section>
  );
}