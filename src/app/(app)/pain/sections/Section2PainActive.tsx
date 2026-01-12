"use client";

import { Trash2 } from "lucide-react";

export default function Section2PainActive() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Du jobber med nå
          </h2>

          <div className="space-y-3">
            {/* Kort 1 */}
            <div className="flex items-center justify-between rounded-2xl border border-sf-border px-5 py-4">
              <div>
                <p className="font-medium">Håndledd</p>
                <p className="text-sm text-sf-muted">
                  Intensitet: 6/10
                </p>
              </div>

              <button
                className="text-red-500 hover:opacity-80 transition"
                aria-label="Fjern smerte"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Kort 2 */}
            <div className="flex items-center justify-between rounded-2xl border border-sf-border px-5 py-4">
              <div>
                <p className="font-medium">Nakke</p>
                <p className="text-sm text-sf-muted">
                  Intensitet: 5/10
                </p>
              </div>

              <button
                className="text-red-500 hover:opacity-80 transition"
                aria-label="Fjern smerte"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}