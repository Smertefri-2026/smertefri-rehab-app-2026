// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section4ClientPainSummary.tsx
"use client";

import Link from "next/link";
import { HeartPulse, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { usePainMetricsForClients } from "@/lib/metrics/usePainMetricsForClients";

type Props = { clientId: string };

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

export default function Section4ClientPainSummary({ clientId }: Props) {
  const { loading, error, byClientId, stats } = usePainMetricsForClients({
    clientIds: [clientId],
    highThreshold: 7,
    staleDays: 10,
  });

  const p = byClientId[clientId];
  const isStale = Boolean(p?.isStale);
  const isHigh = Boolean(p?.isHigh);
  const isUp = Boolean(p?.isUp);

  const missingJournalCount = stats.stale ?? (isStale ? 1 : 0);

  // ✅ SKJUL når OK (ingen mangler) og ikke loading/error
  if (!loading && !error && missingJournalCount === 0 && !isHigh && !isUp && !isStale) {
    return null;
  }

  const variant = !loading && missingJournalCount === 0 ? ("success" as const) : ("warning" as const);

  const icon =
    !loading && missingJournalCount === 0 ? (
      <CheckCircle2 size={18} />
    ) : isHigh ? (
      <AlertTriangle size={18} />
    ) : isUp ? (
      <TrendingUp size={18} />
    ) : (
      <HeartPulse size={18} />
    );

  const headline = isStale ? "Ingen oppdatering (10d)" : isHigh ? "Høy smerte" : isUp ? "Økende smerte" : "OK";

  return (
    <Link href={`/pain/${clientId}`} className="block">
      <DashboardCard
        title="Smerte & helselogg"
        status={statusLabel(missingJournalCount, loading)}
        icon={icon}
        variant={variant}
      >
        {error ? (
          <p className="text-sm text-red-600">Feil: {error}</p>
        ) : (
          <>
            <p className="text-sm">
              Status: <strong>{loading ? "Laster…" : headline}</strong>
            </p>
            <p className="mt-2 text-xs text-sf-muted">Trykk for å åpne smertejournal</p>
          </>
        )}
      </DashboardCard>
    </Link>
  );
}