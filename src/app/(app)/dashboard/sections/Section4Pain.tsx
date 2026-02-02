// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section4Pain.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { usePain } from "@/stores/pain.store";

import {
  HeartPulse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

import { usePainMetricsForClients } from "@/lib/metrics/usePainMetricsForClients";

/* ---------------- helpers ---------------- */

function isoFromEntry(e: any) {
  const raw = (e?.entry_date ?? e?.created_at ?? "") as string;
  return raw ? raw.slice(0, 10) : "";
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function avg(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

/* ---------------- component ---------------- */

export default function Section4Pain() {
  const { role, userId } = useRole();

  // CLIENT: bruker pain-store
  const { entries, loading: painLoading, fetchForClient } = usePain();

  useEffect(() => {
    if (role !== "client") return;
    if (!userId) return;
    fetchForClient(userId);
  }, [role, userId, fetchForClient]);

  const activeLatest = useMemo(() => {
    const map = new Map<string, any>();
    for (const e of entries) {
      if (!e?.is_active) continue;

      const prev = map.get(e.area_key);
      if (!prev) {
        map.set(e.area_key, e);
        continue;
      }

      const a = (e.entry_date ?? e.created_at) as string;
      const b = (prev.entry_date ?? prev.created_at) as string;
      if (a > b) map.set(e.area_key, e);
    }
    return Array.from(map.values());
  }, [entries]);

  const avg14 = useMemo(() => {
    const fromISO = daysAgoISO(13);
    const relevant = entries
      .filter((e) => e?.is_active)
      .filter((e) => isoFromEntry(e) >= fromISO)
      .map((e) => Number(e.intensity))
      .filter((v) => Number.isFinite(v));

    const a = avg(relevant);
    return a == null ? null : a;
  }, [entries]);

  const activeLabels = useMemo(() => {
    return activeLatest
      .map((e) => e.area_label)
      .filter(Boolean)
      .slice(0, 2);
  }, [activeLatest]);

  // TRAINER/ADMIN: finn klient-ids
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsError, setIdsError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!role) return;
      if (!userId) return;

      if (role !== "trainer" && role !== "admin") return;

      setIdsLoading(true);
      setIdsError(null);

      try {
        let q = supabase
          .from("profiles")
          .select("id")
          .eq("role", "client");

        if (role === "trainer") q = q.eq("trainer_id", userId);

        const { data, error } = await q;
        if (error) throw error;

        const ids = (data ?? []).map((r: any) => r.id).filter(Boolean);
        setClientIds(ids);
      } catch (e: any) {
        setIdsError(e?.message ?? "Ukjent feil");
        setClientIds([]);
      } finally {
        setIdsLoading(false);
      }
    };

    run();
  }, [role, userId]);

  // Metrics hook (samme som clients page)
  const {
    loading: metricsLoading,
    error: metricsError,
    stats,
  } = usePainMetricsForClients({
    clientIds,
    highThreshold: 7,
    staleDays: 10,
  });

  const highCount = (stats as any)?.high ?? 0;
  const upCount = (stats as any)?.up ?? 0;
  const staleCount = (stats as any)?.stale ?? 0;

  if (!role) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Smerte & helselogg</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ======================= CLIENT ======================= */}
        {role === "client" && (
          <>
            <Link href="/pain" className="block">
              <DashboardCard title="Aktive smerteområder" icon={<HeartPulse size={18} />}>
                <p className="text-lg font-semibold">
                  {painLoading
                    ? "Laster…"
                    : `${activeLatest.length} ${activeLatest.length === 1 ? "område" : "områder"}`}
                </p>
                <p className="text-xs text-sf-muted">
                  {activeLabels.length
                    ? activeLabels.join(" og ") + (activeLatest.length > 2 ? " …" : "")
                    : "Trykk for å åpne smertejournal"}
                </p>
              </DashboardCard>
            </Link>

            <Link href="/pain" className="block">
              <DashboardCard title="Snitt smerteintensitet" icon={<TrendingDown size={18} />} variant="info">
                <p className="text-lg font-semibold">
                  {painLoading ? "Laster…" : avg14 == null ? "—" : `${avg14.toFixed(1)} / 10`}
                </p>
                <p className="text-xs text-sf-muted">
                  {avg14 == null ? "Ingen data siste 14 dager" : "Basert på aktive registreringer siste 14 dager"}
                </p>
              </DashboardCard>
            </Link>

            <Link href="/pain" className="block">
              <DashboardCard title="Oppdater smerte" icon={<HeartPulse size={18} />}>
                <p className="text-sm text-sf-muted">
                  Registrer dagens smerte (og se utvikling over tid).
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne smertejournal
                </p>
              </DashboardCard>
            </Link>
          </>
        )}

        {/* ======================= TRAINER + ADMIN ======================= */}
        {(role === "trainer" || role === "admin") && (
          <>
            <Link href="/clients?pain=high" className="block">
              <DashboardCard
                title="Høy smerte"
                icon={<AlertTriangle size={18} />}
                variant="danger"
                status={statusLabel(highCount, idsLoading || metricsLoading)}
              >
                <p className="text-xs text-sf-muted">Klienter med høy smerte (≥ 7).</p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients?pain=up" className="block">
              <DashboardCard
                title="Økende smerte"
                icon={<TrendingUp size={18} />}
                variant="warning"
                status={statusLabel(upCount, idsLoading || metricsLoading)}
              >
                <p className="text-xs text-sf-muted">Klienter med økende trend.</p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients?pain=stale" className="block">
              <DashboardCard
                title="Mangler smertejournal"
                icon={<Users size={18} />}
                status={statusLabel(staleCount, idsLoading || metricsLoading)}
              >
                <p className="text-xs text-sf-muted">Ingen oppdatering siste 10 dager.</p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            {(idsError || metricsError) ? (
              <p className="text-xs text-red-600 lg:col-span-3">
                Pain-feil: {idsError ?? metricsError}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}