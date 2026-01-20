// src/app/(app)/trainers/sections/Section3TrainerActions.tsx
"use client";

import Link from "next/link";
import { MessageCircle, Calendar } from "lucide-react";

type Props = {
  trainerId: string;
};

export default function Section3TrainerActions({ trainerId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 💬 Send melding */}
        <Link
          href={`/chat?trainer=${trainerId}`}
          className="
            flex items-center justify-center gap-2
            rounded-full bg-[#007C80]
            px-6 py-3
            text-sm font-medium text-white
            hover:opacity-90
          "
        >
          <MessageCircle size={18} />
          Send melding
        </Link>

        {/* 📆 Se tilgjengelighet */}
        <Link
          href={`/calendar?trainer=${trainerId}`}
          className="
            flex items-center justify-center gap-2
            rounded-full border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          <Calendar size={18} />
          Se tilgjengelighet
        </Link>
      </div>
    </section>
  );
}