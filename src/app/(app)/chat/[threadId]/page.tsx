// src/app/(app)/chat/[threadId]/page.tsx
"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";

export default function ChatThreadPage() {
  return (
    <div className="bg-[#F4FBFA] min-h-screen">
      <AppPage className="h-[calc(100vh-0px)]">
        <div className="flex flex-col h-full space-y-4">
          {/* 🔙 Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="
                inline-flex items-center justify-center
                rounded-full border border-sf-border
                px-4 py-2
                text-sm font-medium text-sf-text
                hover:bg-sf-soft
              "
            >
              ←
            </Link>

            <h1 className="text-lg font-semibold text-sf-text">PT Øystein</h1>
          </div>

          {/* 💬 Meldingsområde */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-sf-border bg-white p-4 space-y-4">
            {/* Innkommende melding */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center text-white text-sm font-semibold">
                PØ
              </div>
              <div className="max-w-[70%] rounded-2xl bg-sf-soft px-4 py-2">
                <p className="text-sm text-sf-text">
                  Hei! Hvordan føles kroppen etter forrige økt?
                </p>
                <span className="block mt-1 text-xs text-sf-muted">
                  torsdag 11.12 – 18:36
                </span>
              </div>
            </div>

            {/* Utgående melding */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[70%] rounded-2xl bg-[#007C80] px-4 py-2 text-white">
                <p className="text-sm">Litt stiv, men bedre enn sist 👍</p>
                <span className="block mt-1 text-xs opacity-80">18:40</span>
              </div>
            </div>

            {/* Flere dummy-meldinger */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center text-white text-sm font-semibold">
                PØ
              </div>
              <div className="max-w-[70%] rounded-2xl bg-sf-soft px-4 py-2">
                <p className="text-sm text-sf-text">
                  Supert! Da justerer vi progresjonen litt neste gang.
                </p>
                <span className="block mt-1 text-xs text-sf-muted">
                  fredag 12.12 – 11:45
                </span>
              </div>
            </div>
          </div>

          {/* ✍️ Input-felt */}
          <div className="flex items-center gap-3 border border-sf-border rounded-full bg-white px-4 py-3">
            <input
              type="text"
              placeholder="Skriv en melding..."
              className="flex-1 text-sm outline-none"
              disabled
            />
            <button
              disabled
              className="
                rounded-full bg-sf-muted/20
                px-4 py-2
                text-sm font-medium text-white
              "
            >
              Send
            </button>
          </div>
        </div>
      </AppPage>
    </div>
  );
}