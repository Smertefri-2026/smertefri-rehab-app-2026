// src/app/(app)/chat/page.tsx
"use client";

import AppPage from "@/components/layout/AppPage";

import Section1ChatHeader from "./sections/Section1ChatHeader";
import Section2ThreadList from "./sections/Section2ThreadList";

export default function ChatPage() {
  return (
    <div className="bg-[#F4FBFA] min-h-screen">
      <AppPage>
        <div className="space-y-6">
          {/* 💬 Header + primær handling */}
          <Section1ChatHeader />

          {/* 📄 Samtaleliste */}
          <Section2ThreadList />
        </div>
      </AppPage>
    </div>
  );
}