"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Calendar, Activity, AlertCircle } from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

type Counts = {
  usersTotal: number;
  clients: number;
  trainers: number;
  admins: number;

  bookingsTotal: number;
  bookingsNext30: number;

  activity7Tests: number;
  activity7Pain: number;
  activity7Nutrition: number;
  activity7Bookings: number;

  alertsClientsNoTrainer: number;
  alertsBookingsMissingLinks: number;
};

const CACHE_KEY = "sf_admin_stats_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min (endre til 60_000 for 1 min)

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function isoDaysAhead(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

async function countRows(table: string, apply?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

function readCache(): { ts: number; data: Counts } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: Counts) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore (private mode, etc.)
  }
}

export default function Section7AdminStats() {
  const { role } = useRole();
  if (role !== "admin") return null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  const fetchStats = async (force = false) => {
    setErr(null);

    // 1) cache først
    if (!force) {
      const cached = readCache();
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        setCounts(cached.data);
        return;
      }
    }

    setLoading(true);

    try {
      const nowISO = new Date().toISOString();
      const from7 = isoDaysAgo(7);
      const to30 = isoDaysAhead(30);

      const [
        usersTotal,
        clients,
        trainers,
        admins,

        bookingsTotal,
        bookingsNext30,

        activity7Tests,
        activity7Pain,
        activity7Nutrition,
        activity7Bookings,

        alertsClientsNoTrainer,
        alertsBookingsMissingLinks,
      ] = await Promise.all([
        // users
        countRows("profiles", (q) => q.in("role", ["client", "trainer", "admin"])),
        countRows("profiles", (q) => q.eq("role", "client")),
        countRows("profiles", (q) => q.eq("role", "trainer")),
        countRows("profiles", (q) => q.eq("role", "admin")),

        // bookings
        countRows("bookings"),
        countRows("bookings", (q) =>
          q.neq("status", "cancelled").gte("start_time", nowISO).lte("start_time", to30)
        ),

        // activity last 7
        countRows("test_sessions", (q) => q.gte("created_at", from7)),
        // ⚠️ hvis tabellen din heter noe annet enn pain_entries: bytt tabellnavn her
        countRows("pain_entries", (q) => q.gte("created_at", from7)),
        countRows("nutrition_days", (q) => q.gte("updated_at", from7)),
        countRows("bookings", (q) => q.gte("created_at", from7)),

        // alerts
        countRows("profiles", (q) => q.eq("role", "client").is("trainer_id", null)),
        countRows("bookings", (q) => q.or("client_id.is.null,trainer_id.is.null")),
      ]);

      const data: Counts = {
        usersTotal,
        clients,
        trainers,
        admins,
        bookingsTotal,
        bookingsNext30,
        activity7Tests,
        activity7Pain,
        activity7Nutrition,
        activity7Bookings,
        alertsClientsNoTrainer,
        alertsBookingsMissingLinks,
      };

      setCounts(data);
      writeCache(data);
    } catch (e: any) {
      setErr(e?.message ?? "Ukjent feil");
      setCounts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alertCount = useMemo(() => {
    if (!counts) return 0;
    return (counts.alertsClientsNoTrainer ?? 0) + (counts.alertsBookingsMissingLinks ?? 0);
  }, [counts]);

  const systemVariant =
    alertCount === 0 ? ("success" as const) : alertCount >= 5 ? ("danger" as const) : ("warning" as const);

  const status = (n: number) => (loading ? "…" : String(n));

  const activityTotal = counts
    ? (counts.activity7Tests ?? 0) +
      (counts.activity7Pain ?? 0) +
      (counts.activity7Nutrition ?? 0) +
      (counts.activity7Bookings ?? 0)
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sf-muted">Administrasjon – oversikt</h2>

        <button
          onClick={() => fetchStats(true)}
          className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          title="Tving oppdatering"
        >
          Oppdater
        </button>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Admin stats-feil: {err}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USERS */}
        <Link href="/admin/users" className="block">
          <DashboardCard title="Brukere" icon={<Users size={18} />} status={counts ? status(counts.usersTotal) : "—"}>
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster fordeling…"
                : `Klienter: ${counts.clients} • Trenere: ${counts.trainers} • Admin: ${counts.admins}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/users →</p>
          </DashboardCard>
        </Link>

        {/* TRAINERS (du sa denne virker) */}
        <Link href="/trainers" className="block">
          <DashboardCard title="Rehab-trenere" icon={<UserCheck size={18} />} status={counts ? status(counts.trainers) : "—"}>
            <p className="text-sm text-sf-muted">
              {loading || !counts ? "Laster…" : `Totalt trenere på plattformen: ${counts.trainers}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /trainers →</p>
          </DashboardCard>
        </Link>

        {/* CALENDAR */}
        <Link href="/admin/calendar" className="block">
          <DashboardCard
            title="Bookinger (30 dager)"
            icon={<Calendar size={18} />}
            status={counts ? status(counts.bookingsNext30) : "—"}
            variant="info"
          >
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster…"
                : `Kommende 30 dager: ${counts.bookingsNext30} • Totalt: ${counts.bookingsTotal}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/calendar →</p>
          </DashboardCard>
        </Link>

        {/* ACTIVITY */}
        <Link href="/admin/activity" className="block">
          <DashboardCard title="Aktivitet siste 7 dager" icon={<Activity size={18} />} status={counts ? status(activityTotal) : "—"}>
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster…"
                : `Tester: ${counts.activity7Tests} • Smerte: ${counts.activity7Pain} • Kosthold: ${counts.activity7Nutrition} • Bookinger: ${counts.activity7Bookings}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/activity →</p>
          </DashboardCard>
        </Link>

        {/* SYSTEM ALERTS */}
        <Link href="/clients?unassigned=1" className="block">
          <DashboardCard
            title="Systemvarsler"
            icon={<AlertCircle size={18} />}
            variant={systemVariant}
            status={counts ? status(alertCount) : "—"}
          >
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster…"
                : alertCount === 0
                  ? "Ingen varsler akkurat nå."
                  : `Uten trener: ${counts.alertsClientsNoTrainer} • Bookinger m/ manglende relasjon: ${counts.alertsBookingsMissingLinks}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">
              {alertCount === 0 ? "✓ Systemet ser bra ut" : "Trykk for å se klienter uten trener →"}
            </p>
          </DashboardCard>
        </Link>
      </div>

      <p className="text-xs text-sf-muted">
        Cache: {Math.round(CACHE_TTL_MS / 1000)} sek (localStorage). “Oppdater” tvinger ny henting.
      </p>
    </section>
  );
}