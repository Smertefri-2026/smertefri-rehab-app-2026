"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import AuthGuard from "@/components/auth/AuthGuard";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

import { RoleProvider } from "@/providers/RoleProvider";
import { ClientsProvider } from "@/stores/clients.store";
import { BookingsProvider } from "@/stores/bookings.store";
import ChatUnreadManager from "@/components/chat/ChatUnreadManager";

function MaybeBookingsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsBookings =
    pathname.startsWith("/calendar") || pathname.startsWith("/dashboard");
  if (!needsBookings) return <>{children}</>;
  return <BookingsProvider>{children}</BookingsProvider>;
}

/** Kartleggingen kjører som en egen fokusert flate, uten sidebar/tabbar. */
function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/onboarding")) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen bg-page">
      <Sidebar />
      <div className="relative flex-1 overflow-hidden pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0">
        {children}
      </div>
      <TabBar />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AuthGuard>
        <OnboardingGate />
        <ChatUnreadManager />
        <ClientsProvider>
          <MaybeBookingsProvider>
            <AppChrome>{children}</AppChrome>
          </MaybeBookingsProvider>
        </ClientsProvider>
      </AuthGuard>
    </RoleProvider>
  );
}
