"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  Activity,
  Utensils,
  MessageCircle,
  User,
  Users,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* -------------------------
   MENYER PER ROLLE
------------------------- */

const clientItems: SidebarItem[] = [
  { label: "Hjem", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerter", href: "/pain", icon: HeartPulse },
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const trainerItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Shield },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innstillinger", href: "/settings", icon: Settings },
];

/* -------------------------
   KOMPONENT
------------------------- */

export default function Sidebar() {
  const pathname = usePathname();
  const { role, loading } = useRole();

  const [collapsed, setCollapsed] = useState(false);

  if (loading || !role) return null;

  const items =
    role === "client"
      ? clientItems
      : role === "trainer"
      ? trainerItems
      : adminItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside
      className={`
        hidden lg:flex sticky top-0 h-screen flex-col border-r border-sf-border bg-white
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* TOPP */}
      <div className="h-20 px-4 flex items-center justify-between border-b border-sf-border shrink-0">
        {!collapsed && (
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-montserrat-alternates)" }}
          >
            <span className="text-[#007C80]">Smerte</span>
            <span className="text-[#29A9D6]">Fri</span>
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sf-soft text-slate-500"
          title={collapsed ? "Åpne meny" : "Lukk meny"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-3
                text-sm font-medium transition
                ${
                  isActive
                    ? "bg-[#E6F3F6] text-[#007C80]"
                    : "text-sf-muted hover:bg-sf-soft hover:text-[#007C80]"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* LOGG UT */}
      <div className="border-t border-sf-border p-2 shrink-0">
        <button
          onClick={handleLogout}
          title="Logg ut"
          className={`
            flex w-full items-center gap-3 rounded-xl px-3 py-3
            text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logg ut</span>}
        </button>
      </div>
    </aside>
  );
}