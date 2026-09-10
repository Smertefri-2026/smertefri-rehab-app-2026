"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";
import { useChatUnread } from "@/stores/chatUnread.store";

import { usePainMetricsForClients } from "@/lib/metrics/usePainMetricsForClients";
import { useTestMetricsForClients } from "@/lib/metrics/useTestMetricsForClients";
import { useTrainingHoursMetricsForClients } from "@/lib/metrics/useTrainingHoursMetricsForClients";
import { useFollowupSignals } from "@/lib/followup.api";
import {
  prioritizeFollowup,
  countByPriority,
  type ClientSignalInput,
  type FollowupPriority,
} from "@/lib/followup/prioritize";

const PRIORITY_STYLE: Record<FollowupPriority, string> = {
  høy: "bg-danger-subtle text-danger-ink",
  middels: "bg-warning-subtle text-warning-ink",
  lav: "bg-primary-subtle text-primary-ink",
};

function clientName(c: { first_name?: string | null; last_name?: string | null }) {
  return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Uten navn";
}

export default function OppfolgingPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();
  const { clients, loading: clientsLoading } = useClients();
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
  const signals = useFollowupSignals(clientIds);

  const items = useMemo(() => {
    const input: ClientSignalInput[] = visibleClients.map((c) => {
      const s = signals.byClientId[c.id];
      const p = pain.byClientId[c.id];
      const t = tests.byClientId[c.id];
      return {
        clientId: c.id,
        name: clientName(c),
        latestZone: s?.latestZone ?? null,
        latestZoneAcknowledged: s?.latestZoneAcknowledged ?? true,
        firedRulesToday: s?.firedRulesToday ?? [],
        checkedInToday: s?.checkedInToday ?? false,
        daysSinceCheckin: s?.daysSinceCheckin ?? null,
        yellowCountLast7: s?.yellowCountLast7 ?? 0,
        painHigh: !!p?.isHigh,
        painRising: !!p?.isUp,
        missingBaseline: !t || (t.missingCategories?.length ?? 0) > 0,
        hasUpcomingBooking: hours.hasUpcomingByClientId[c.id] !== false,
        calibratorKind: s?.calibratorKind ?? null,
      };
    });
    return prioritizeFollowup(input);
  }, [visibleClients, signals.byClientId, pain.byClientId, tests.byClientId, hours.hasUpcomingByClientId]);

  const counts = useMemo(() => countByPriority(items), [items]);
  const loading = clientsLoading || signals.loading || pain.loading || tests.loading;

  if (roleLoading || (role !== "trainer" && role !== "admin")) {
    return (
      <AppPage title="Oppfølging">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Oppfølging"
      subtitle="Hvem trenger oppmerksomhet nå, hvorfor, og hva du bør gjøre videre."
    >
      <div className="space-y-6">
        <section className="grid grid-cols-3 gap-3">
          {(["høy", "middels", "lav"] as FollowupPriority[]).map((p) => (
            <div
              key={p}
              className={`rounded-lg border border-transparent p-4 text-center ${PRIORITY_STYLE[p]}`}
            >
              <p className="text-2xl font-semibold">{loading ? "–" : counts[p]}</p>
              <p className="mt-0.5 text-xs font-medium capitalize">{p} prioritet</p>
            </div>
          ))}
        </section>

        {unreadCount > 0 && (
          <Link
            href="/chat"
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent bg-primary-subtle p-4 shadow-card transition hover:shadow-pop"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-primary-ink">
              <MessageCircle size={18} />
              {unreadCount === 1 ? "1 ulest melding" : `${unreadCount} uleste meldinger`}
            </span>
            <span className="text-lg font-semibold text-primary-ink">{unreadCount}</span>
          </Link>
        )}

        <section className="space-y-2">
          {loading ? (
            <p className="text-sm text-ink-soft">Vurderer kundene …</p>
          ) : signals.error ? (
            <p className="text-sm text-danger-ink">{signals.error}</p>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-soft shadow-card">
              Ingenting krever oppmerksomhet akkurat nå. Alle kundene dine er i rute.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.clientId}>
                  <Link
                    href={`/clients/${it.clientId}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition hover:shadow-pop"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${PRIORITY_STYLE[it.priority]}`}
                        >
                          {it.priority}
                        </span>
                        <p className="truncate text-sm font-semibold text-ink">{it.name}</p>
                      </div>

                      <ul className="mt-1.5 space-y-0.5 text-xs text-ink-soft">
                        {it.reasons.map((r) => (
                          <li key={r}>· {r}</li>
                        ))}
                      </ul>

                      <p className="mt-2 text-[13px] font-medium text-ink">
                        <span className="text-ink-faint">Neste steg: </span>
                        {it.action}
                      </p>
                    </div>
                    <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-faint" />
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
