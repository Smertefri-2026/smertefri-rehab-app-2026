// src/components/trainer/TrainerActions.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, MessageCircle, CheckCircle2, UserPlus } from "lucide-react";

import { useRole } from "@/providers/RoleProvider";
import { setMyTrainer } from "@/lib/trainerLink.api";
import { ensureDirectThreadByTrainerId } from "@/lib/chatDirect.api";

type Props = {
  trainerId: string;
};

export default function TrainerActions({ trainerId }: Props) {
  const router = useRouter();
  const { role } = useRole();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  async function handleSelectTrainer() {
    if (saving) return;
    setSaving(true);
    setSaved(false);

    try {
      await setMyTrainer(trainerId);
      setSaved(true);

      // Ta kunden til profil, der de ser valgt trener med en gang
      router.push("/profile");
      router.refresh();
    } catch (e: any) {
      console.error("setMyTrainer feilet:", e);
      alert(e?.message ?? "Kunne ikke velge trener");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ✅ Åpner direkte tråd (oppretter hvis mangler) */}
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

      {/* ✅ KUNDE: velg trener */}
      {role === "client" && (
        <div className="pt-3">
          <button
            type="button"
            onClick={handleSelectTrainer}
            disabled={saving}
            className="
              w-full
              flex items-center justify-center gap-2
              rounded-full
              bg-sf-primary
              px-6 py-3
              text-sm font-medium text-white
              disabled:opacity-50
            "
          >
            {saved ? <CheckCircle2 size={18} /> : <UserPlus size={18} />}
            {saving ? "Velger…" : saved ? "Valgt ✅" : "Velg som min trener"}
          </button>

          <p className="mt-2 text-xs text-sf-muted text-center">
            Dette lagrer trener-koblingen i systemet (trainer_client_links).
          </p>
        </div>
      )}
    </section>
  );
}