"use client";

import Link from "next/link";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { AlertTriangle, CheckCircle2, HeartPulse, Utensils, CalendarClock } from "lucide-react";

type Item = {
  key: string;
  title: string;
  description: string;
  count: number;
  loading: boolean;
  href: string; // lenke til /clients med filter
  icon: React.ReactNode;
  variant?: "warning" | "danger" | "info" | "success";
};

export default function ActionableAlertsGrid({
  title = "Varsler",
  items,
}: {
  title?: string;
  items: Item[];
}) {
  const actionable = items.filter((x) => !x.loading && x.count > 0);
  const anyLoading = items.some((x) => x.loading);

  return (
    <section className="space-y-3 mt-4">
      <h2 className="text-sm font-semibold text-sf-muted">{title}</h2>

      {anyLoading ? (
        <div className="text-sm text-sf-muted">Laster varsler…</div>
      ) : actionable.length === 0 ? (
        <DashboardCard
          title="Alt ser bra ut"
          status="✓"
          icon={<CheckCircle2 size={18} />}
          variant="success"
        >
          <p className="text-sm">Alle kunder er oppdatert akkurat nå.</p>
          <p className="mt-2 text-xs text-sf-muted">Ingen oppfølging nødvendig.</p>
        </DashboardCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionable.map((x) => (
            <Link key={x.key} href={x.href} className="block">
              <DashboardCard
                title={x.title}
                status={String(x.count)}
                icon={x.icon}
                variant={x.variant ?? "warning"}
              >
                <p className="text-sm">{x.description}</p>
                <p className="mt-2 text-xs text-sf-muted">Trykk for å se liste →</p>
              </DashboardCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Ikon-forslag hvis du vil bruke de samme som på /clients */
export const alertIcons = {
  pain: <HeartPulse size={18} />,
  tests: <AlertTriangle size={18} />,
  nutrition: <Utensils size={18} />,
  hours: <CalendarClock size={18} />,
};