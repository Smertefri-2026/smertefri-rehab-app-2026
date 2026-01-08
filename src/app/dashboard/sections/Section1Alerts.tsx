// src/app/dashboard/sections/Section1Alerts.tsx
import React from "react";

export default function Section1Alerts() {
  return (
    <section className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-sf-text">
          Hei, Øistein Solheim! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-sf-muted">
          SmerteFri-medlemskap
        </p>
      </div>

      {/* NESTE TRENINGSTIME */}
      <div className="w-full max-w-3xl rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
        <p className="text-sm text-sf-muted">
          Neste treningstime
        </p>

        <div className="mt-2 text-lg font-semibold text-sf-text">
          onsdag 31.12 · 09:00
        </div>

        <p className="mt-1 text-sm text-sf-muted">
          Trener: Øistein
        </p>
      </div>

    </section>
  );
}