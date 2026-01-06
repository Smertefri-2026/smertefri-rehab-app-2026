"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";

import {
  Home,
  Calendar,
  HeartPulse,
  Activity,
  Utensils,
  MessageCircle,
  User,
  Users,
  Settings,
  Shield,
} from "lucide-react";

type TabItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* ---------------------------------
   TABBAR – KOMPAKT (SOM FØR)
---------------------------------- */

const clientTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerte", href: "/pain", icon: HeartPulse },
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminTabs: TabItem[] = [
  { label: "Admin", href: "/dashboard", icon: Shield },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
    { label: "Meld.", href: "/chat", icon: MessageCircle },
      { label: "Profil", href: "/profile", icon: User },
  { label: "Innst.", href: "/settings", icon: Settings },
];

/* ---------------------------------
   KOMPONENT
---------------------------------- */

export default function TabBar() {
  const pathname = usePathname();
  const { role, loading } = useRole();

  if (loading || !role) return null;

  const items =
    role === "client"
      ? clientTabs
      : role === "trainer"
      ? trainerTabs
      : adminTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sf-border md:hidden">
      <ul className="flex items-center justify-between px-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition ${
                  isActive
                    ? "text-[#007C80]"
                    : "text-slate-500"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                <span className="text-[10px] leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}