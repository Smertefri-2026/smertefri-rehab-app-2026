import { RoleProvider } from "@/providers/RoleProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-sf-bg">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </RoleProvider>
  );
}