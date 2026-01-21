// src/app/(app)/chat/new/page.tsx
"use client";

import AppPage from "@/components/layout/AppPage";

import Section1InviteHeader from "./sections/Section1InviteHeader";
import Section2InviteForm from "./sections/Section2InviteForm";
import Section3InviteInfo from "./sections/Section3InviteInfo";

export default function NewChatPage() {
  return (
    <div className="bg-[#F4FBFA] min-h-screen">
      <AppPage>
        <div className="space-y-6">
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
      </AppPage>
    </div>
  );
}