// src/components/client/ClientActions.tsx
"use client";

import Link from "next/link";
import { MessageSquare, Calendar } from "lucide-react";

type Props = {
  clientId: string;
};

export default function ClientActions({ clientId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 💬 Meldinger */}
        <Link
          href={`/chat?client=${clientId}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-sf-primary px-4 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          <MessageSquare size={18} />
          Send melding
        </Link>

        {/* 📆 Kalender (admin/trener: åpne med valgt kunde) */}
        <Link
          href={`/calendar?client=${clientId}`}
          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm hover:bg-sf-soft"
        >
          <Calendar size={18} />
          Åpne kalender
        </Link>
      </div>
    </section>
  );
}