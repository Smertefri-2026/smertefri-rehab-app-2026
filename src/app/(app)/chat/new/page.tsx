"use client";

import Section1InviteHeader from "./sections/Section1InviteHeader";
import Section2InviteForm from "./sections/Section2InviteForm";
import Section3InviteInfo from "./sections/Section3InviteInfo";

export default function NewChatPage() {
  return (
    <main className="bg-[#F4FBFA] min-h-screen">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-6">

        {/* 🔙 Tilbake */}
        <div>
          <a
            href="/chat"
            className="
              inline-flex items-center gap-2
              rounded-full border border-sf-border
              px-6 py-3 text-sm font-medium
              text-sf-text hover:bg-sf-soft
            "
          >
            ← Tilbake til meldinger
          </a>
        </div>

        {/* 📌 Header */}
        <Section1InviteHeader />

        {/* ✉️ Invitasjon */}
        <Section2InviteForm />

        {/* ℹ️ Info */}
        <Section3InviteInfo />

      </div>
    </main>
  );
}