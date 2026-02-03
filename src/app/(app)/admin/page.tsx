// src/app/(app)/admin/page.tsx
"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Users, Calendar, Activity, BarChart3 } from "lucide-react";
import { useRole } from "@/providers/RoleProvider";

export default function AdminHomePage() {
  const { role, loading } = useRole();
  if (loading) return null;
  if (role !== "admin") return null;

  return (
    <AppPage>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Admin</h1>
          <p className="text-sm text-sf-muted">Hurtiglenker til administrasjon og innsikt.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block">
          <DashboardCard title="Brukere" icon={<Users size={18} />}>
            <p className="text-sm text-sf-muted">Søk og filter på rolle, se trainer_id m.m.</p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/users →</p>
          </DashboardCard>
        </Link>

        <Link href="/admin/calendar" className="block">
          <DashboardCard title="Kalender" icon={<Calendar size={18} />} variant="info">
            <p className="text-sm text-sf-muted">Kommende bookinger (30 dager) + “mangler relasjon”.</p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/calendar →</p>
          </DashboardCard>
        </Link>

        <Link href="/admin/activity" className="block">
          <DashboardCard title="Aktivitet" icon={<Activity size={18} />}>
            <p className="text-sm text-sf-muted">Headcounts siste 7 dager (tester/smerte/kosthold/bookinger).</p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/activity →</p>
          </DashboardCard>
        </Link>

        {/* Dette kan vi lage senere, men lenken kan stå nå */}
        <Link href="/dashboard#analytics" className="block">
          <DashboardCard title="Analyse" icon={<BarChart3 size={18} />} variant="info">
            <p className="text-sm text-sf-muted">Intern app-analytics (Supabase) på dashboard.</p>
            <p className="mt-2 text-xs text-sf-muted">Åpne analyse →</p>
          </DashboardCard>
        </Link>
      </div>
    </AppPage>
  );
}