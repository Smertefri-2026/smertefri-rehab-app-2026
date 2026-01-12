"use client";

import {
  Database,
  Mail,
  CreditCard,
  Webhook,
  PlugZap,
} from "lucide-react";

export default function Section5Integrations() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🔌 Tittel */}
        <div>
          <h2 className="text-sm font-semibold text-sf-text">
            Integrasjoner
          </h2>
          <p className="text-xs text-sf-muted">
            Tjenester koblet til SmerteFri-plattformen
          </p>
        </div>

        {/* 📦 Integrasjonskort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Supabase */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <Database size={16} />
              <span className="text-sm font-medium">
                Supabase
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Autentisering, database og realtime
            </p>
            <span className="inline-block text-xs text-emerald-600 font-medium">
              ● Tilkoblet
            </span>
          </div>

          {/* E-post */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <Mail size={16} />
              <span className="text-sm font-medium">
                E-post
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Invitasjoner, varsler og systemmeldinger
            </p>
            <span className="inline-block text-xs text-amber-600 font-medium">
              ● Delvis konfigurert
            </span>
          </div>

          {/* Betaling */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <CreditCard size={16} />
              <span className="text-sm font-medium">
                Betaling
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Abonnement og betalinger
            </p>
            <span className="inline-block text-xs text-sf-muted font-medium">
              ● Ikke aktivert
            </span>
          </div>

          {/* Webhooks */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <Webhook size={16} />
              <span className="text-sm font-medium">
                Webhooks
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Hendelser mellom systemer
            </p>
            <span className="inline-block text-xs text-sf-muted font-medium">
              ● Planlagt
            </span>
          </div>

          {/* Fremtidige */}
          <div className="rounded-xl border border-dashed border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <PlugZap size={16} />
              <span className="text-sm font-medium">
                Flere integrasjoner
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              EHR, sensorer, tredjepart
            </p>
            <span className="inline-block text-xs text-sf-muted font-medium">
              ● Kommer
            </span>
          </div>

        </div>

        {/* 🔘 Handlinger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

          <button
            className="
              flex items-center justify-center gap-2
              rounded-full border border-sf-border
              px-6 py-3
              text-sm font-medium text-sf-text
              hover:bg-sf-soft
            "
          >
            Administrer integrasjoner
          </button>

          <button
            className="
              flex items-center justify-center gap-2
              rounded-full bg-[#007C80]
              px-6 py-3
              text-sm font-medium text-white
              hover:opacity-90
            "
          >
            Legg til integrasjon
          </button>

        </div>

      </div>
    </section>
  );
}