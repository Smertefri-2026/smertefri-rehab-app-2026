"use client";

import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
} from "lucide-react";

export default function Section3UserManagement() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 📌 Tittel */}
        <div>
          <h2 className="text-sm font-semibold text-sf-text">
            Brukeradministrasjon
          </h2>
          <p className="text-xs text-sf-muted">
            Oversikt og handlinger for kunder, trenere og admin
          </p>
        </div>

        {/* 📊 Oversikt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* 👤 Kunder */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <Users size={16} />
              <span className="text-sm font-medium">Kunder</span>
            </div>
            <p className="text-xs text-sf-muted">
              124 aktive brukere
            </p>
          </div>

          {/* 🏋️ Trenere */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <UserCheck size={16} />
              <span className="text-sm font-medium">Trenere</span>
            </div>
            <p className="text-xs text-sf-muted">
              12 godkjente trenere
            </p>
          </div>

          {/* 🛡 Admin */}
          <div className="rounded-xl border border-sf-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sf-text">
              <UserX size={16} />
              <span className="text-sm font-medium">Administratorer</span>
            </div>
            <p className="text-xs text-sf-muted">
              3 aktive admin-kontoer
            </p>
          </div>

        </div>

        {/* ⚙️ Handlinger (dummy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

          {/* ➕ Inviter bruker */}
          <button
            className="
              flex items-center justify-center gap-2
              rounded-full bg-[#007C80]
              px-6 py-3
              text-sm font-medium text-white
              hover:opacity-90
            "
          >
            <UserPlus size={16} />
            Inviter ny bruker
          </button>

          {/* 👥 Gå til brukerliste */}
          <button
            className="
              flex items-center justify-center gap-2
              rounded-full border border-sf-border
              px-6 py-3
              text-sm font-medium text-sf-text
              hover:bg-sf-soft
            "
          >
            <Users size={16} />
            Åpne brukeroversikt
          </button>

        </div>

      </div>
    </section>
  );
}