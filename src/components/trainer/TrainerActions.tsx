// src/components/trainer/TrainerActions.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, MessageCircle } from "lucide-react";

import { ensureDirectThreadByTrainerId } from "@/lib/chatDirect.api";

type Props = {
  trainerId: string;
};

export default function TrainerActions({ trainerId }: Props) {
  const router = useRouter();
  const [openingChat, setOpeningChat] = useState(false);

  async function handleOpenChat() {
    if (openingChat) return;
    setOpeningChat(true);

    try {
      const threadId = await ensureDirectThreadByTrainerId(trainerId);
      router.push(`/chat/${threadId}`);
    } catch (e: any) {
      console.error("Åpne chat feilet:", e);
      alert(e?.message ?? "Kunne ikke åpne chat");
    } finally {
      setOpeningChat(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleOpenChat}
          disabled={openingChat}
          className="
            flex items-center justify-center gap-2
            rounded-full bg-[#007C80]
            px-6 py-3
            text-sm font-medium text-white
            hover:opacity-90
            disabled:opacity-50
          "
        >
          <MessageCircle size={18} />
          {openingChat ? "Åpner…" : "Send melding"}
        </button>

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
          Åpne kalender
        </Link>
      </div>
    </section>
  );
}
