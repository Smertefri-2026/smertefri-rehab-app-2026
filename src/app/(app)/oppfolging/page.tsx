"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  AlertTriangle,
  CalendarClock,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";
import { useChatUnread } from "@/stores/chatUnread.store";

import { usePainMetricsForClients } from "@/lib/metrics/usePainMetricsForClients";
import { useTestMetricsForClients } from "@/lib/metrics/useTestMetricsForClients";
import { useTrainingHoursMetricsForClients } from "@/lib/metrics/useTrainingHoursMetricsForClients";

type Flag = { label: string; tone: "danger" | "warning" | "info" };

function clientName(c: { first_name?: string | null; last_name?: string | null }) {
  return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Uten navn";
}

function Tile({
  href,
  icon,
  label,
  count,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: "danger" | "warning" | "info";
}) {
  const bg =
    tone === "danger"
      ? "bg-danger-subtle text-danger-ink"
      : tone === "warning"
      ? "bg-warning-subtle text-warning-ink"
      : "bg-primary-subtle text-primary-ink";

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-transparent bg-surface p-4 shadow-card transition hover:shadow-pop"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}>{icon}</span>
        {label}
      </span>
      <span className="text-lg font-semibold text-ink">{count}</span>
    </Link>
  );
}

export default function OppfolgingPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();
  const { clients, loading } = useClients();
  const unreadCount = useChatUnread((s) => s.unreadCount);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "trainer" && role !== "admin") router.replace("/dashboard");
  }, [role, roleLoading, router]);

  const visibleClients = useMemo(() => {
    if (role === "admin") return clients;
    return clients.filter((c) => c.trainer_id === userId);
  }, [clients, role, userId]);

  const clientIds = useMemo(() => visibleClients.map((c) => c.id), [visibleClients]);

  const pain = usePainMetricsForClients({ clientIds, highThreshold: 7, staleDays: 10 });
  const tests = useTestMetricsForClients({ clientIds, inactiveDays: 30 });
  const hours = useTrainingHoursMetricsForClients({ clientIds, daysAhead: 30 });

  const rows = useMemo(() => {
    return visibleClients
      .map((c) => {
        const p = pain.byClientId[c.id];
        const t = tests.byClientId[c.id];
        const hasUpcoming = hours.hasUpcomingByClientId[c.id];

        const flags: Flag[] = [];
        if (p?.isHigh) flags.push({ label: "Høy smerte", tone: "danger" });
        if (p?.isUp) flags.push({ label: "Økende smerte", tone: "warning" });
        if (p?.isStale) flags.push({ label: "Ingen smertelogg", tone: "warning" });
        if (!t || (t.missingCategories?.length ?? 0) > 0)
          flags.push({ label: "Mangler baseline", tone: "info" });
        if (hasUpcoming === false) flags.push({ label: "Ingen time booket", tone: "info" });

        const severity = flags.reduce(
          (acc, f) => acc + (f.tone === "danger" ? 3 : f.tone === "warning" ? 2 : 1),
          0
        );

        return { client: c, flags, severity };
      })
      .filter((r) => r.flags.length > 0)
      .sort((a, b) => b.severity - a.severity);
  }, [visibleClients, pain.byClientId, tests.byClientId, hours.hasUpcomingByClientId]);

  if (roleLoading || (role !== "trainer" && role !== "admin")) {
    return (
      <AppPage title="Oppfølging">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  const painCount = pain.stats.high + pain.stats.up;
  const staleCount = pain.stats.stale;
  const baselineCount = tests.stats.missingBaseline;
  const noBookingCount = hours.missingUpcomingCount;

  return (
    <AppPage
      title="Oppfølging"
      subtitle="Kundene som trenger et blikk fra deg – prioritert etter hva som haster mest."
    >
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            href="/clients?pain=high"
            icon={<HeartPulse size={16} />}
            label="Smerte høy / økende"
            count={painCount}
            tone="danger"
          />
          <Tile
            href="/clients?pain=stale"
            icon={<HeartPulse size={16} />}
            label="Mangler smertelogg"
            count={staleCount}
            tone="warning"
          />
          <Tile
            href="/clients?filter=baseline-missing"
            icon={<AlertTriangle size={16} />}
            label="Mangler baseline"
            count={baselineCount}
            tone="info"
          />
          <Tile
            href="/clients?hours=missing"
            icon={<CalendarClock size={16} />}
            label="Uten kommende time"
            count={noBookingCount}
            tone="info"
          />
        </section>

        {unreadCount > 0 && (
          <Link
            href="/chat"
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent bg-primary-subtle p-4 shadow-card transition hover:shadow-pop"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-primary-ink">
              <MessageCircle size={18} />
              Du har uleste meldinger
            </span>
            <span className="text-lg font-semibold text-primary-ink">{unreadCount}</span>
          </Link>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-soft">Trenger oppfølging nå</h2>

          {loading ? (
            <p className="text-sm text-ink-soft">Laster kunder …</p>
          ) : rows.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-soft shadow-card">
              Ingen åpne flagg akkurat nå. Alle kundene dine er oppdatert.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map(({ client, flags }) => (
                <li key={client.id}>
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition hover:shadow-pop"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{clientName(client)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {flags.map((f) => (
                          <span
                            key={f.label}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              f.tone === "danger"
                                ? "bg-danger-subtle text-danger-ink"
                                : f.tone === "warning"
                                ? "bg-warning-subtle text-warning-ink"
                                : "bg-primary-subtle text-primary-ink"
                            }`}
                          >
                            {f.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppPage>
  );
}
