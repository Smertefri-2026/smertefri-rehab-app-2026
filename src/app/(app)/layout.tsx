// src/app/(app)/layout.tsx
"use client";

import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import AuthGuard from "@/components/auth/AuthGuard";

import { RoleProvider } from "@/providers/RoleProvider";
import { ClientsProvider } from "@/stores/clients.store";
import { TrainersProvider } from "@/stores/trainers.store";
import { BookingsProvider } from "@/stores/bookings.store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AuthGuard>
        <ClientsProvider>
          <TrainersProvider>
            <BookingsProvider>
              <div className="relative flex min-h-screen bg-sf-bg">
                {/* 🖥 Desktop sidebar */}
                <Sidebar />

                {/* 📱 App-innhold */}
                <div
                  className="
                    flex-1 relative overflow-hidden
                    pb-[calc(env(safe-area-inset-bottom)+72px)]
                    md:pb-0
                  "
                >
                  {children}
                </div>

                {/* 📱 Mobil TabBar */}
                <TabBar />
              </div>
            </BookingsProvider>
          </TrainersProvider>
        </ClientsProvider>
      </AuthGuard>
    </RoleProvider>
  );
}