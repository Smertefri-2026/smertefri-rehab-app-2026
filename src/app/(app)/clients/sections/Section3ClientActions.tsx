"use client";

import { MessageCircle, CalendarPlus, Calendar, User } from "lucide-react";

export default function Section3ClientActions() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* 💬 Send melding */}
        <a
          href="/chat"
          className="
            flex items-center justify-center gap-2
            rounded-full
            bg-[#007C80]
            px-6 py-3
            text-sm font-medium text-white
            hover:opacity-90
          "
        >
          <MessageCircle size={18} />
          Send melding
        </a>

        {/* 📅 Book / endre time */}
        <a
          href="/calendar"
          className="
            flex items-center justify-center gap-2
            rounded-full
            border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          <CalendarPlus size={18} />
          Book / endre time
        </a>

        {/* 🗓 Åpne kalender */}
        <a
          href="/calendar"
          className="
            flex items-center justify-center gap-2
            rounded-full
            border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          <Calendar size={18} />
          Åpne kalender
        </a>

        {/* 👤 Se full kundedetalj */}
        <a
          href="/clients"
          className="
            flex items-center justify-center gap-2
            rounded-full
            border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          <User size={18} />
          Kundedetaljer
        </a>

      </div>
    </section>
  );
}