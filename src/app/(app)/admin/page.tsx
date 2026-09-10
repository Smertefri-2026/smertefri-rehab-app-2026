"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity, CalendarClock, Users } from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";

type Tool = {
  href: string;
  title: string;
  desc: string;
  icon: React.ElementType;
};

const TOOLS: Tool[] = [
  {
    href: "/admin/activity",
    title: "Aktivitet",
    desc: "Tester, smertelogg, kosthold og bookinger siste 7 dager.",
    icon: Activity,
  },
  {
    href: "/admin/calendar",
    title: "Kalender-helse",
    desc: "Kommende bookinger og økter som mangler kunde- eller trenerrelasjon.",
    icon: CalendarClock,
  },
  {
    href: "/admin/users",
    title: "Brukertabell",
    desc: "Alle brukere med rolle, by og trenerkobling – søk og filtrering.",
    icon: Users,
  },
];

export default function AdminSystemPage() {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (loading) return;
    if (role !== "admin") router.replace("/dashboard");
  }, [role, loading, router]);

  if (loading || role !== "admin") {
    return (
      <AppPage title="System">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage title="System" subtitle="Drifts- og administrasjonsverktøy.">
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex gap-4 rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-ink">
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{t.title}</span>
                <span className="mt-1 block text-sm text-ink-soft">{t.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </AppPage>
  );
}
