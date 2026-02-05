// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section6ClientNutritionSummary.tsx
"use client";

import Link from "next/link";
import { Utensils } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useNutritionMetricsForClients } from "@/lib/metrics/useNutritionMetricsForClients";

type Props = { clientId: string };

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

export default function Section6ClientNutritionSummary({ clientId }: Props) {
  const { loading, error, hasProfileByClientId, missingCount } =
    useNutritionMetricsForClients({ clientIds: [clientId] });

  const hasProfile = Boolean(hasProfileByClientId[clientId]);
  const missing = missingCount ?? (hasProfile ? 0 : 1);

  // ✅ SKJUL når OK (har profil) og ikke loading/error
  if (!loading && !error && hasProfile) {
    return null;
  }

  return (
    <Link href={`/nutrition/${clientId}`} className="block">
      <DashboardCard
        title="Kosthold"
        status={statusLabel(missing, loading)}
        icon={<Utensils size={18} />}
        variant="warning"
      >
        {error ? (
          <p className="text-sm text-red-600">Feil: {error}</p>
        ) : (
          <>
            <p className="text-sm">
              Status: <strong>{loading ? "Laster…" : hasProfile ? "OK" : "Mangler profil"}</strong>
            </p>
            <p className="mt-2 text-xs text-sf-muted">Trykk for å åpne kosthold</p>
          </>
        )}
      </DashboardCard>
    </Link>
  );
}