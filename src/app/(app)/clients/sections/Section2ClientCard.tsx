"use client";

import { User, Calendar, HeartPulse, Activity, Utensils } from "lucide-react";

export default function Section2ClientCard() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🧍 Topp – Kundeinfo */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sf-soft">
            <User className="text-[#007C80]" />
          </div>

          <div>
            <p className="text-base font-semibold text-sf-text">
              Ola Nordmann
            </p>
            <p className="text-sm text-sf-muted">
              42 år • Drammen
            </p>
          </div>
        </div>

        {/* 📊 Status-rader */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
            <Calendar size={18} className="text-[#007C80]" />
            <span className="text-sm">
              Neste time: <strong>I morgen kl. 14:00</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
            <HeartPulse size={18} className="text-[#007C80]" />
            <span className="text-sm">
              Smertenivå: <strong>Moderat</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
            <Activity size={18} className="text-[#007C80]" />
            <span className="text-sm">
              Tester: <strong>Stabil fremgang</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
            <Utensils size={18} className="text-[#007C80]" />
            <span className="text-sm">
              Kosthold: <strong>Logget i dag</strong>
            </span>
          </div>
        </div>

        {/* 🧠 Notat / status */}
        <div className="rounded-xl border border-sf-border bg-white p-3">
          <p className="text-sm text-sf-muted">
            Kommentar:
          </p>
          <p className="text-sm">
            Fokus på rygg og hofte. God fremgang siste 4 uker.
          </p>
        </div>

      </div>
    </section>
  );
}