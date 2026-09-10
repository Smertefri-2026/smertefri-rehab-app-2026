"use client";

import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";

import {
  Gauge,
  HeartPulse,
  Activity,
  Utensils,
  CalendarDays,
  MessageCircle,
  Users,
  ListChecks,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

type QuickActionItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/*
 * Snarveier til det som IKKE ligger i hovedmenyen — de daglige småoppgavene
 * som bor inne i «Min plan», «Oppfølging» osv. Speiler ikke sidebaren.
 */

const clientActions: QuickActionItem[] = [
  { label: "Dagens innsjekk", href: "/sonen", icon: Gauge },
  { label: "Smerteregistrering", href: "/pain", icon: HeartPulse },
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
];

const trainerActions: QuickActionItem[] = [
  { label: "Oppfølging", href: "/oppfolging", icon: ListChecks },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
];

const adminActions: QuickActionItem[] = [
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Rehabtrenere", href: "/trainers", icon: Users },
  { label: "Innhold", href: "/admin/innhold", icon: BookOpen },
  { label: "System", href: "/admin", icon: SlidersHorizontal },
];

export default function Section3QuickActions() {
  const { role } = useRole();

  const items =
    role === "client" ? clientActions : role === "trainer" ? trainerActions : adminActions;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-ink-soft">Snarveier</h2>

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
