"use client";

import {
  CreditCard,
  Receipt,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function Section6BillingAndPlans() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 💳 Tittel */}
        <div>
          <h2 className="text-sm font-semibold text-sf-text">
            Betaling & abonnement
          </h2>
          <p className="text-xs text-sf-muted">
            Planer, betalinger og fakturahistorikk
          </p>
        </div>

        {/* 📦 Planoversikt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Aktiv plan */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">
                Aktiv plan
              </span>
            </div>
            <p className="text-sm">
              Profesjonell
            </p>
            <p className="text-xs text-sf-muted">
              Full tilgang til rehab-app og oppfølging
            </p>
            <span className="inline-block text-xs text-emerald-600 font-medium">
              ● Aktiv
            </span>
          </div>

          {/* Betalingsstatus */}
          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <CreditCard size={16} />
              <span className="text-sm font-medium">
                Betalingsstatus
              </span>
            </div>
            <p className="text-sm">
              Kort registrert
            </p>
            <p className="text-xs text-sf-muted">
              Neste belastning: 01.02.2026
            </p>
            <span className="inline-block text-xs text-emerald-600 font-medium">
              ● OK
            </span>
          </div>

        </div>

        {/* 📄 Faktura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <Receipt size={16} />
              <span className="text-sm font-medium">
                Fakturahistorikk
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Last ned tidligere fakturaer
            </p>
          </div>

          <div className="rounded-xl border border-sf-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sf-text">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                Betalingsproblemer
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Ingen aktive varsler
            </p>
          </div>

        </div>

        {/* 🔘 Handlinger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

          <button
            className="
              flex items-center justify-center gap-2
              rounded-full border border-sf-border
              px-6 py-3
              text-sm font-medium text-sf-text
              hover:bg-sf-soft
            "
          >
            Endre abonnement
          </button>

          <button
            className="
              flex items-center justify-center gap-2
              rounded-full border border-sf-border
              px-6 py-3
              text-sm font-medium text-sf-text
              hover:bg-sf-soft
            "
          >
            Oppdater betalingsmetode
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
            Se fakturaer
          </button>

        </div>

      </div>
    </section>
  );
}