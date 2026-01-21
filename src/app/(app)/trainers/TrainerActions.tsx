"use client";

import Link from "next/link";
import { MessageCircle, Calendar } from "lucide-react";

type Props = {
  trainerId: string;
};

export default function TrainerActions({ trainerId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/chat?trainer=${trainerId}`}
          className="flex items-center justify-center gap-2 rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          <MessageCircle size={18} />
          Send melding
        </Link>

        <Link
          href={`/calendar?trainer=${trainerId}`}
          className="flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
        >
          <Calendar size={18} />
          Se tilgjengelighet
        </Link>
      </div>
    </section>
  );
}