"use client";

import Link from "next/link";
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useTestMetricsForClients } from "@/lib/metrics/useTestMetricsForClients";

type Props = { clientId: string };

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

export default function Section5ClientTestsSummary({ clientId }: Props) {
  const { loading, error, byClientId, stats } = useTestMetricsForClients({
    clientIds: [clientId],
    inactiveDays: 30,
  });

  const t = byClientId[clientId];
  const missingBaseline =
    stats.missingBaseline ?? ((t?.missingCategories?.length ?? 0) > 0 || !t ? 1 : 0);

  const pct = Number(t?.avgPct ?? 0); // ✅ null-safe
  const daysSinceLast = t?.daysSinceLastTest;

  const variant =
    !loading && missingBaseline === 0 ? ("success" as const) : ("warning" as const);

  const icon =
    !loading && missingBaseline === 0 ? (
      <CheckCircle2 size={18} />
    ) : pct > 0 ? (
      <TrendingUp size={18} />
    ) : pct < 0 ? (
      <TrendingDown size={18} />
    ) : (
      <AlertTriangle size={18} />
    );

  const headline =
    missingBaseline > 0
      ? "Mangler baseline"
      : pct > 0
      ? `Positiv progresjon (+${Math.round(pct)}%)`
      : pct < 0
      ? `Negativ progresjon (${Math.round(pct)}%)`
      : "OK";

  return (
    <Link href={`/tests/${clientId}`} className="block">
      <DashboardCard
        title="Tester & fremgang"
        status={statusLabel(missingBaseline, loading)}
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
            <p className="mt-2 text-xs text-sf-muted">
              {loading
                ? "—"
                : daysSinceLast == null
                ? "Ingen tester registrert enda"
                : `Sist test: ${daysSinceLast} dager siden`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Trykk for å åpne tester</p>
          </>
        )}
      </DashboardCard>
    </Link>
  );
}