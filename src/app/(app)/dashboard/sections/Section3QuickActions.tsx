"use client";

import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";

import {
  Gauge,
  Footprints,
  Dumbbell,
  TrendingUp,
  Calendar,
  HeartPulse,
  Activity,
  Utensils,
  MessageCircle,
  User,
  Users,
  Settings,
  UserCog,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

type QuickActionItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* Speiler sidebar-/tabbar-navigasjonen per rolle. */

const clientActions: QuickActionItem[] = [
  { label: "Sonen", href: "/sonen", icon: Gauge },
  { label: "Trappen", href: "/trappen", icon: Footprints },
  { label: "Program", href: "/program", icon: Dumbbell },
  { label: "Fremgang", href: "/fremgang", icon: TrendingUp },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerter", href: "/pain", icon: HeartPulse },
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Min rehabtrener", href: "/trainer", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
];

const trainerActions: QuickActionItem[] = [
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminActions: QuickActionItem[] = [
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Rehabtrenere", href: "/trainers", icon: UserCog },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Innstillinger", href: "/settings", icon: Settings },
];

export default function Section3QuickActions() {
  const { role } = useRole();

  const items =
    role === "client" ? clientActions : role === "trainer" ? trainerActions : adminActions;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-ink-soft">Hurtignavigasjon</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block">
              <DashboardCard title={item.label} icon={<Icon size={20} />} mode="button" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
