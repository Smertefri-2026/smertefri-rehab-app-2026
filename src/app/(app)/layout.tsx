"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import AuthGuard from "@/components/auth/AuthGuard";

import { RoleProvider } from "@/providers/RoleProvider";
import { ClientsProvider } from "@/stores/clients.store";
import { TrainersProvider } from "@/stores/trainers.store";
import { BookingsProvider } from "@/stores/bookings.store";
import ChatUnreadManager from "@/components/chat/ChatUnreadManager";


function MaybeBookingsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const needsBookings =
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/dashboard");

  if (!needsBookings) return <>{children}</>;
  return <BookingsProvider>{children}</BookingsProvider>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AuthGuard>
          <ChatUnreadManager />
        <ClientsProvider>
          <TrainersProvider>
            <MaybeBookingsProvider>
              <div className="relative flex min-h-screen bg-sf-bg">
                <Sidebar />
                <div
                  className="
                    flex-1 relative overflow-hidden
                    pb-[calc(env(safe-area-inset-bottom)+72px)]
                    md:pb-0
                  "
                >
                  {children}
                </div>
                <TabBar />
              </div>
            </MaybeBookingsProvider>
          </TrainersProvider>
        </ClientsProvider>
      </AuthGuard>
    </RoleProvider>
  );
}