// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section2ClientActions.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import { ensureDirectThreadByClientId } from "@/lib/chatDirect.api";

type Props = { clientId: string };

export default function Section2ClientActions({ clientId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChat() {
    if (loading) return;
    setLoading(true);
    try {
      const threadId = await ensureDirectThreadByClientId(clientId);
      router.push(`/chat/${threadId}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Kunne ikke åpne chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleChat}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-sf-primary px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <MessageSquare size={18} />
          {loading ? "Åpner…" : "Send melding"}
        </button>

        <Link
          href={`/calendar?client=${clientId}`}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-sf-border px-4 py-3 text-sm hover:bg-sf-soft"
        >
          <Calendar size={18} />
          Åpne kalender
        </Link>
      </div>
    </section>
  );
}