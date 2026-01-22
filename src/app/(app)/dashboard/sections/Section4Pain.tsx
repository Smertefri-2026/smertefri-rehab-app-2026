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

/* ---------------- component ---------------- */

export default function Section4Pain() {
  const { role, userId } = useRole();
  const { entries, loading: painLoading, fetchForClient } = usePain();

  // -------- Kunde: hent egne smerter (så dashboard får ekte tall) --------
  useEffect(() => {
    if (role !== "client") return;
    if (!userId) return;
    fetchForClient(userId);
  }, [role, userId, fetchForClient]);

  const activeLatest = useMemo(() => {
    // siste entry per område der is_active=true
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
    const fromISO = daysAgoISO(13); // inkl i dag = 14 dager
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

  // -------- Trener: ekte statistikk på mange klienter --------
  const [trainerStatsLoading, setTrainerStatsLoading] = useState(false);
  const [trainerStatsError, setTrainerStatsError] = useState<string | null>(null);
  const [trainerStats, setTrainerStats] = useState<{
    highPainClients: number;
    increasingPainClients: number;
    staleClients: number;
  } | null>(null);

  useEffect(() => {
    const run = async () => {
      if (role !== "trainer") return;
      if (!userId) return;

      setTrainerStatsLoading(true);
      setTrainerStatsError(null);

      try {
        // 1) hent klienter for trener (profiles.trainer_id)
        const { data: clients, error: cErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "client")
          .eq("trainer_id", userId);

        if (cErr) throw cErr;

        const clientIds = (clients ?? []).map((c: any) => c.id).filter(Boolean);
        if (!clientIds.length) {
          setTrainerStats({ highPainClients: 0, increasingPainClients: 0, staleClients: 0 });
          return;
        }

        // 2) hent smerte-entries for disse klientene (vi tar litt historikk for trend)
        const from14 = daysAgoISO(13);
        const from10 = daysAgoISO(9);
        const from7 = daysAgoISO(6);

        const { data: rows, error: pErr } = await supabase
          .from("pain_entries")
          .select("client_id, intensity, entry_date, created_at, is_active")
          .in("client_id", clientIds)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (pErr) throw pErr;

        const all = (rows ?? []).map((r: any) => ({
          ...r,
          iso: isoFromEntry(r),
          intensity: Number(r.intensity),
        }));

        // grupper per klient
        const byClient = new Map<string, typeof all>();
        for (const r of all) {
          if (!r.client_id) continue;
          const arr = byClient.get(r.client_id) ?? [];
          arr.push(r);
          byClient.set(r.client_id, arr);
        }

        let highPain = 0;
        let increasing = 0;
        let stale = 0;

        for (const cid of clientIds) {
          const list = byClient.get(cid) ?? [];

          // stale: ingen entry siste 10 dager
          const has10 = list.some((x) => x.iso && x.iso >= from10);
          if (!has10) stale++;

          // high pain: siste entry siste 7 dager >= 7
          const latest7 = list.find((x) => x.iso && x.iso >= from7);
          if (latest7 && Number.isFinite(latest7.intensity) && latest7.intensity >= 7) {
            highPain++;
          }

          // increasing: snitt siste 7 dager > snitt forrige 7 (dag 8–14)
          const last7 = list
            .filter((x) => x.iso && x.iso >= from7)
            .filter((x) => Number.isFinite(x.intensity))
            .map((x) => x.intensity);

          const prev7 = list
            .filter((x) => x.iso && x.iso >= from14 && x.iso < from7)
            .filter((x) => Number.isFinite(x.intensity))
            .map((x) => x.intensity);

          const a1 = avg(last7);
          const a2 = avg(prev7);

          if (a1 != null && a2 != null && a1 > a2) increasing++;
        }

        setTrainerStats({
          highPainClients: highPain,
          increasingPainClients: increasing,
          staleClients: stale,
        });
      } catch (e: any) {
        setTrainerStatsError(e?.message ?? "Ukjent feil");
        setTrainerStats(null);
      } finally {
        setTrainerStatsLoading(false);
      }
    };

    run();
  }, [role, userId]);

  if (!role) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Smerte & helselogg</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ======================= KUNDE ======================= */}
        {role === "client" && (
          <>
            <Link href="/pain" className="block">
              <DashboardCard title="Aktive smerteområder" icon={<HeartPulse size={18} />}>
                <p className="text-lg font-semibold">
                  {painLoading ? "Laster…" : `${activeLatest.length} ${activeLatest.length === 1 ? "område" : "områder"}`}
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

        {/* ======================= TRENER ======================= */}
        {role === "trainer" && (
          <>
            <Link href="/clients?pain=high" className="block">
              <DashboardCard title="Høy smerte" icon={<AlertTriangle size={18} />} variant="danger">
                <p className="text-lg font-semibold">
                  {trainerStatsLoading ? "Laster…" : (trainerStats?.highPainClients ?? 0)}
                </p>
                <p className="text-xs text-sf-muted">
                  Klienter med siste 7 dager ≥ 7
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients?pain=up" className="block">
              <DashboardCard title="Økende smerte" icon={<TrendingUp size={18} />} variant="warning">
                <p className="text-lg font-semibold">
                  {trainerStatsLoading ? "Laster…" : (trainerStats?.increasingPainClients ?? 0)}
                </p>
                <p className="text-xs text-sf-muted">
                  Snitt siste 7d &gt; forrige 7d
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients?pain=stale" className="block">
              <DashboardCard title="Ingen oppdatering" icon={<Users size={18} />}>
                <p className="text-lg font-semibold">
                  {trainerStatsLoading ? "Laster…" : (trainerStats?.staleClients ?? 0)}
                </p>
                <p className="text-xs text-sf-muted">
                  Ingen registrering siste 10 dager
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            {trainerStatsError ? (
              <p className="text-xs text-red-600 lg:col-span-3">
                Pain dashboard-feil: {trainerStatsError}
              </p>
            ) : null}
          </>
        )}

        {/* ======================= ADMIN ======================= */}
        {role === "admin" && (
          <>
            <Link href="/clients" className="block">
              <DashboardCard title="Gjennomsnittlig smerte" icon={<HeartPulse size={18} />}>
                <p className="text-sm text-sf-muted">
                  Kommer snart (best via RPC/server-side for ytelse).
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients" className="block">
              <DashboardCard title="Høy smerte (system)" icon={<AlertTriangle size={18} />} variant="warning">
                <p className="text-sm text-sf-muted">
                  Kommer snart.
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>

            <Link href="/clients" className="block">
              <DashboardCard title="Manglende rapportering" icon={<Users size={18} />} variant="danger">
                <p className="text-sm text-sf-muted">
                  Kommer snart.
                </p>
                <p className="mt-3 inline-flex items-center rounded-xl bg-sf-primary px-4 py-2 text-sm font-medium text-white">
                  Åpne kunder
                </p>
              </DashboardCard>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}