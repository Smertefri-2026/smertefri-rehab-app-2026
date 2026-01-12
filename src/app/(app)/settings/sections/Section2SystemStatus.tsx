"use client";

import {
  CheckCircle,
  AlertTriangle,
  Database,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function Section2SystemStatus() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 📌 Tittel */}
        <div>
          <h2 className="text-sm font-semibold text-sf-text">
            Systemstatus
          </h2>
          <p className="text-xs text-sf-muted">
            Oversikt over integrasjoner og kjernesystemer
          </p>
        </div>

        {/* 🔧 Statuskort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 🗄 Database */}
          <div className="flex items-start gap-3 rounded-xl border border-sf-border p-3">
            <Database className="text-[#007C80]" size={18} />
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-sf-muted">
                Tilkoblet og operativ
              </p>
            </div>
            <CheckCircle
              size={16}
              className="ml-auto text-emerald-500"
            />
          </div>

          {/* ✉️ E-post / Invitasjoner */}
          <div className="flex items-start gap-3 rounded-xl border border-sf-border p-3">
            <Mail className="text-[#007C80]" size={18} />
            <div>
              <p className="text-sm font-medium">
                E-post & invitasjoner
              </p>
              <p className="text-xs text-sf-muted">
                Supabase Mail aktiv
              </p>
            </div>
            <CheckCircle
              size={16}
              className="ml-auto text-emerald-500"
            />
          </div>

          {/* 🔐 Autentisering */}
          <div className="flex items-start gap-3 rounded-xl border border-sf-border p-3">
            <ShieldCheck className="text-[#007C80]" size={18} />
            <div>
              <p className="text-sm font-medium">
                Autentisering
              </p>
              <p className="text-xs text-sf-muted">
                Roller og tilgang OK
              </p>
            </div>
            <CheckCircle
              size={16}
              className="ml-auto text-emerald-500"
            />
          </div>

          {/* ⚠️ Placeholder: Feil */}
          <div className="flex items-start gap-3 rounded-xl border border-sf-border p-3">
            <AlertTriangle className="text-yellow-500" size={18} />
            <div>
              <p className="text-sm font-medium">
                Overvåkning
              </p>
              <p className="text-xs text-sf-muted">
                Ingen aktive varsler
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}