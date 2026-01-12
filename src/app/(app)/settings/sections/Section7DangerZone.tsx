"use client";

import {
  AlertTriangle,
  UserX,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export default function Section7DangerZone() {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="space-y-4">

        {/* ⚠️ Tittel */}
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={18} />
          <h2 className="text-sm font-semibold">
            Danger zone
          </h2>
        </div>

        <p className="text-xs text-red-700">
          Handlinger her er irreversible og kan føre til tap av data eller tilgang.
        </p>

        {/* 🔐 Tiltak */}
        <div className="space-y-3">

          {/* Deaktiver konto */}
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <UserX className="text-red-600 mt-1" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Deaktiver konto
                </p>
                <p className="text-xs text-sf-muted">
                  Brukeren mister tilgang, men data beholdes.
                </p>
              </div>
              <button
                className="
                  rounded-full border border-red-300
                  px-4 py-2
                  text-xs font-medium text-red-700
                  hover:bg-red-100
                "
              >
                Deaktiver
              </button>
            </div>
          </div>

          {/* Tilbakestill tilgang */}
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-red-600 mt-1" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Tilbakestill tilgang & roller
                </p>
                <p className="text-xs text-sf-muted">
                  Logger ut bruker og nullstiller roller.
                </p>
              </div>
              <button
                className="
                  rounded-full border border-red-300
                  px-4 py-2
                  text-xs font-medium text-red-700
                  hover:bg-red-100
                "
              >
                Tilbakestill
              </button>
            </div>
          </div>

          {/* Slett konto */}
          <div className="rounded-xl border border-red-300 bg-white p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="text-red-600 mt-1" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Slett konto permanent
                </p>
                <p className="text-xs text-sf-muted">
                  All data slettes. Kan ikke angres.
                </p>
              </div>
              <button
                className="
                  rounded-full bg-red-600
                  px-4 py-2
                  text-xs font-medium text-white
                  hover:bg-red-700
                "
              >
                Slett
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}