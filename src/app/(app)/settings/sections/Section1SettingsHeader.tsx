"use client";

import { Settings } from "lucide-react";

export default function Section1SettingsHeader() {
  return (
    <section className="flex items-center justify-between gap-4">
      {/* ⚙️ Tittel */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F3F6] text-[#007C80]">
          <Settings size={20} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-sf-text">
            Innstillinger
          </h1>
          <p className="text-sm text-sf-muted">
            Administrer system, brukere og tilganger
          </p>
        </div>
      </div>

      {/* 📎 Placeholder for fremtidige actions */}
      {/* f.eks. Lagre-knapp, Eksporter, Hjelp */}
    </section>
  );
}