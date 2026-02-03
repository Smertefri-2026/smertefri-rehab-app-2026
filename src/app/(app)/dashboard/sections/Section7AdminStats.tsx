"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Calendar, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

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

const CACHE_KEY = "sf_admin_stats_v2";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

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
    // ignore
  }
}

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

function MaybeLink({
  enabled,
  href,
  children,
}: {
  enabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (!enabled) return <div className="cursor-default">{children}</div>;
  return (
    <Link href={href} className="block">
      {children}
    </Link>
  );
}

export default function Section7AdminStats() {
  const { role } = useRole();
  if (role !== "admin") return null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  const fetchStats = async (force = false) => {
    setErr(null);

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

  const activityTotal = useMemo(() => {
    if (!counts) return 0;
    return (
      (counts.activity7Tests ?? 0) +
      (counts.activity7Pain ?? 0) +
      (counts.activity7Nutrition ?? 0) +
      (counts.activity7Bookings ?? 0)
    );
  }, [counts]);

  const ready = !loading && !!counts && !err;

  const systemVariant =
    alertCount === 0 ? ("success" as const) : alertCount >= 5 ? ("danger" as const) : ("warning" as const);

  // “vis kun hvis noe å følge opp” – men behold mens vi laster
  const showSystemCard = !ready || alertCount > 0;
  const allOk = ready && alertCount === 0;

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
          <DashboardCard
            title="Brukere"
            icon={<Users size={18} />}
            status={!counts ? "—" : statusLabel(counts.usersTotal, loading)}
          >
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster fordeling…"
                : `Klienter: ${counts.clients} • Trenere: ${counts.trainers} • Admin: ${counts.admins}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/users →</p>
          </DashboardCard>
        </Link>

        {/* TRAINERS */}
        <Link href="/trainers" className="block">
          <DashboardCard
            title="Rehab-trenere"
            icon={<UserCheck size={18} />}
            status={!counts ? "—" : statusLabel(counts.trainers, loading)}
          >
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
            status={!counts ? "—" : statusLabel(counts.bookingsNext30, loading)}
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
          <DashboardCard
            title="Aktivitet siste 7 dager"
            icon={<Activity size={18} />}
            status={!counts ? "—" : statusLabel(activityTotal, loading)}
          >
            <p className="text-sm text-sf-muted">
              {loading || !counts
                ? "Laster…"
                : `Tester: ${counts.activity7Tests} • Smerte: ${counts.activity7Pain} • Kosthold: ${counts.activity7Nutrition} • Bookinger: ${counts.activity7Bookings}`}
            </p>
            <p className="mt-2 text-xs text-sf-muted">Åpne /admin/activity →</p>
          </DashboardCard>
        </Link>

        {/* SYSTEMSTATUS: enten Varsler-kort eller Alt OK-kort (samme plass i grid) */}
        {showSystemCard ? (
          <MaybeLink enabled={ready && alertCount > 0} href="/clients?unassigned=1">
            <DashboardCard
              title="Systemvarsler"
              icon={<AlertCircle size={18} />}
              variant={systemVariant}
              status={!counts ? "—" : statusLabel(alertCount, loading)}
            >
              <p className="text-sm text-sf-muted">
                {loading || !counts
                  ? "Sjekker system…"
                  : `Uten trener: ${counts.alertsClientsNoTrainer} • Bookinger m/ manglende relasjon: ${counts.alertsBookingsMissingLinks}`}
              </p>
              <p className="mt-2 text-xs text-sf-muted">
                {ready && alertCount > 0 ? "Åpne liste →" : "Ingen å vise"}
              </p>
            </DashboardCard>
          </MaybeLink>
        ) : null}

        {allOk ? (
          <DashboardCard title="Systemstatus" icon={<CheckCircle2 size={18} />} variant="success" status="✓">
            <p className="text-sm">Ingen systemvarsler – alt ser bra ut.</p>
            <p className="mt-2 text-xs text-sf-muted">Tips: bruk “Oppdater” for å tvinge ny henting.</p>
          </DashboardCard>
        ) : null}
      </div>

      <p className="text-xs text-sf-muted">
        Cache: {Math.round(CACHE_TTL_MS / 1000)} sek (localStorage). “Oppdater” tvinger ny henting.
      </p>
    </section>
  );
}