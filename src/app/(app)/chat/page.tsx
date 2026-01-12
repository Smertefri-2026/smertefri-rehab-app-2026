"use client";

import Section1ChatHeader from "./sections/Section1ChatHeader";
import Section2ThreadList from "./sections/Section2ThreadList";

export default function ChatPage() {
  return (
    <main className="bg-[#F4FBFA] min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">

        {/* 💬 Header + primær handling */}
        <Section1ChatHeader />

        {/* 📄 Samtaleliste */}
        <Section2ThreadList />

      </div>
    </main>
  );
}