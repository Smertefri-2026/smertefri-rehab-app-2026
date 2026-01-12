"use client";

import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  UserCog,
} from "lucide-react";

export default function Section4SecurityAndAccess() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🔐 Tittel */}
        <div>
          <h2 className="text-sm font-semibold text-sf-text">
            Sikkerhet & tilgang
          </h2>
          <p className="text-xs text-sf-muted">
            Innstillinger for tilgang, roller og kontosikkerhet
          </p>
        </div>

        {/* 🔎 Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 🔑 Autentisering */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <KeyRound size={16} />
              <span className="text-sm font-medium">
                Autentisering
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              E-post & passord (Supabase)
            </p>
          </div>

          {/* ✉️ E-post */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <Mail size={16} />
              <span className="text-sm font-medium">
                E-postverifisering
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Påkrevd for alle brukere
            </p>
          </div>

          {/* 🔒 2FA */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <Lock size={16} />
              <span className="text-sm font-medium">
                To-faktor (2FA)
              </span>
            </div>
            <p className="text-xs text-sf-muted">
              Valgfritt (planlagt)
            </p>
          </div>

        </div>

        {/* ⚙️ Roller & tilgang */}
        <div className="rounded-xl border border-sf-border p-4 space-y-3">

          <div className="flex items-center gap-2 text-sf-text">
            <UserCog size={16} />
            <span className="text-sm font-medium">
              Roller & tilganger
            </span>
          </div>

          <ul className="text-sm text-sf-muted space-y-1 pl-1">
            <li>• Kunde: tilgang til egne data</li>
            <li>• Trener: tilgang til egne klienter</li>
            <li>• Admin: full systemtilgang</li>
          </ul>

        </div>

        {/* 🔘 Handlinger (dummy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

          {/* 👤 Administrer roller */}
          <button
            className="
              flex items-center justify-center gap-2
              rounded-full border border-sf-border
              px-6 py-3
              text-sm font-medium text-sf-text
              hover:bg-sf-soft
            "
          >
            <ShieldCheck size={16} />
            Administrer roller
          </button>

          {/* 🔐 Sikkerhetsinnstillinger */}
          <button
            className="
              flex items-center justify-center gap-2
              rounded-full bg-[#007C80]
              px-6 py-3
              text-sm font-medium text-white
              hover:opacity-90
            "
          >
            <Lock size={16} />
            Sikkerhetsinnstillinger
          </button>

        </div>

      </div>
    </section>
  );
}