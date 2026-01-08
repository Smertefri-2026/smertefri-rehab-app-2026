// src/app/dashboard/layout.tsx
import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import { RoleProvider } from "@/providers/RoleProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-sf-bg">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 px-4 py-6 lg:px-8">
            {children}
          </main>
        </div>

        {/* Mobile tabbar */}
        <TabBar />
      </div>
    </RoleProvider>
  );
}