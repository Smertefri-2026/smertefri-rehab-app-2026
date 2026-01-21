"use client";

import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";

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
  BarChart,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

/* --------------------------------
   NAV-ITEM TYPE
-------------------------------- */

type QuickActionItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  variant?: "default" | "info";
};

/* --------------------------------
   SAMME STRUKTUR SOM SIDEBAR
-------------------------------- */

const clientActions: QuickActionItem[] = [
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerte", href: "/pain", icon: HeartPulse }, // samme stil som de andre
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const trainerActions: QuickActionItem[] = [
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminActions: QuickActionItem[] = [
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innstillinger", href: "/settings", icon: Settings },
];

/* --------------------------------
   KOMPONENT
-------------------------------- */

export default function Section3QuickActions() {
  const { role } = useRole();

  const items =
    role === "client"
      ? clientActions
      : role === "trainer"
      ? trainerActions
      : adminActions;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Hurtignavigasjon
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
            >
              <DashboardCard
                title={item.label}
                icon={<Icon size={22} />}
                mode="button"
                variant={item.variant ?? "default"}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}