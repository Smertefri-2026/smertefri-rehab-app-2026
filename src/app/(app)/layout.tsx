// src/app/(app)/layout.tsx
import React from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile tabbar */}
      <TabBar />
    </div>
  );
}