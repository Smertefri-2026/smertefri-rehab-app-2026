// src/app/(app)/layout.tsx
"use client";

import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import AuthGuard from "@/components/auth/AuthGuard";

import { RoleProvider } from "@/providers/RoleProvider";
import { ClientsProvider } from "@/stores/clients.store";
import { TrainersProvider } from "@/stores/trainers.store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <AuthGuard>
        <ClientsProvider>
          <TrainersProvider>
            <div className="relative flex min-h-screen bg-sf-bg">

              {/* 🖥 Desktop sidebar */}
              <Sidebar />

              {/* 📱 App-innhold */}
              <div
                className="
                  flex-1
                  relative
                  pb-16        /* 👈 plass til TabBar på mobil */
                  md:pb-0     /* 👈 fjern padding på desktop */
                  overflow-hidden
                "
              >
                {children}
              </div>

              {/* 📱 Mobil TabBar */}
              <TabBar />
            </div>
          </TrainersProvider>
        </ClientsProvider>
      </AuthGuard>
    </RoleProvider>
  );
}