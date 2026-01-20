"use client";

import Link from "next/link";
import { MessageCircle, CalendarPlus, Calendar, User } from "lucide-react";

type Props = {
  clientId: string;
};

export default function Section2ClientActions({ clientId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 💬 Send melding */}
        <Link
          href={`/chat?client=${clientId}`}
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
        </Link>

        {/* 📅 Book / endre time */}
        <Link
          href={`/calendar?client=${clientId}`}
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
        </Link>

        {/* 🗓 Åpne kalender */}
        <Link
          href={`/calendar?client=${clientId}`}
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
        </Link>

        {/* 👤 Se full kundedetalj */}
        <Link
          href={`/clients/${clientId}`}
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
        </Link>
      </div>
    </section>
  );
}