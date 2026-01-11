import Sidebar from "@/components/navigation/Sidebar";
import TabBar from "@/components/navigation/TabBar";
import { RoleProvider } from "@/providers/RoleProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-sf-bg">
        <Sidebar />

        <div className="flex-1 pb-16 lg:pb-0">
          {children}
        </div>

        <TabBar />
      </div>
    </RoleProvider>
  );
}