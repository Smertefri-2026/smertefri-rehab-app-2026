// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/dashboard/sections/Section5Tests.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import { Activity, AlertTriangle, TrendingDown, Users } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

type Category = "bodyweight" | "strength" | "cardio";

type TestSession = {
  id: string;
  client_id: string;
  category: Category;
  created_at: string;
};

type TestEntry = {
  id: string;
  session_id: string;
  metric_key: string;
  value: number;
  unit: string | null;
  sort: number;
};

const TOTAL_KEYS: Record<Category, string[]> = {
  bodyweight: ["knebøy", "pushups", "situps"], // ekskluder planke fra “sum”
  strength: ["knebøy", "markløft", "benkpress"],
  cardio: ["mølle", "sykkel", "roing", "ski"],
};

function safePct(baseline: number | null, latest: number | null) {
  if (baseline == null || latest == null) return null;
  if (baseline === 0) return null;
  return ((latest - baseline) / baseline) * 100;
}

function formatShort(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function sessionTotal(category: Category, entries: TestEntry[]): number {
  const allowed = new Set(TOTAL_KEYS[category] ?? []);
  const sum = entries
    .filter((e) => allowed.has(e.metric_key))
    .reduce((acc, e) => acc + Number(e.value ?? 0), 0);
  return Number.isFinite(sum) ? sum : 0;
}

export default function Section5Tests() {
  const { role, userId } = useRole();

  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "client" || !userId) return;

    let alive = true;

    (async () => {
      setErr(null);

      const { data: s, error: sErr } = await supabase
        .from("test_sessions")
        .select("id, client_id, category, created_at")
        .eq("client_id", userId)
        .order("created_at", { ascending: true });

      if (!alive) return;

      if (sErr) {
        setErr(sErr.message);
        setSessions([]);
        setEntriesBySession({});
        return;
      }

      const list = (s ?? []) as TestSession[];
      setSessions(list);

      if (list.length === 0) {
        setEntriesBySession({});
        return;
      }

      const ids = list.map((x) => x.id);

      const { data: e, error: eErr } = await supabase
        .from("test_entries")
        .select("id, session_id, metric_key, value, unit, sort")
        .in("session_id", ids)
        .order("sort", { ascending: true });

      if (!alive) return;

      if (eErr) {
        setErr(eErr.message);
        setEntriesBySession({});
        return;
      }

      const map: Record<string, TestEntry[]> = {};
      for (const row of (e ?? []) as any[]) {
        const sid = row.session_id as string;
        if (!map[sid]) map[sid] = [];
        map[sid].push({
          id: row.id,
          session_id: row.session_id,
          metric_key: row.metric_key,
          value: Number(row.value),
          unit: row.unit ?? null,
          sort: Number(row.sort ?? 0),
        });
      }
      setEntriesBySession(map);
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  const cards = useMemo(() => {
    const build = (category: Category, href: string, title: string, subtitle: string) => {
      const catSessions = sessions.filter((x) => x.category === category);
      if (catSessions.length === 0) {
        return {
          href,
          title,
          subtitle,
          status: "—",
          lastAt: null as string | null,
          baseline: null as number | null,
          latest: null as number | null,
          pct: null as number | null,
        };
      }

      const first = catSessions[0];
      const last = catSessions[catSessions.length - 1];

      const firstEntries = entriesBySession[first.id] ?? [];
      const lastEntries = entriesBySession[last.id] ?? [];

      const baseline = sessionTotal(category, firstEntries);
      const latest = sessionTotal(category, lastEntries);
      const pct = safePct(baseline, latest);

      const status =
        pct == null ? "—" : `${pct >= 0 ? "+" : ""}${Math.round(pct)}%`;

      return {
        href,
        title,
        subtitle,
        status,
        lastAt: last.created_at,
        baseline,
        latest,
        pct,
      };
    };

    return [
      build("bodyweight", "/tests/bodyweight", "Egenvekt", "4 min (knebøy + armhevinger + situps)"),
      build("strength", "/tests/strength", "Styrke", "1RM progresjon i baseøvelser"),
      build("cardio", "/tests/cardio", "Kondisjon", "4 min (distanse på apparat)"),
    ];
  }, [sessions, entriesBySession]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">Tester & fremgang</h2>

      {/* KUNDE – EGEN FREMGANG */}
      {role === "client" && (
        <>
          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <Link key={c.title} href={c.href} className="block">
                <DashboardCard title={c.title} icon={<Activity size={18} />} status={c.status}>
                  <p className="text-sm text-sf-muted">{c.subtitle}</p>
                  <p className="text-xs text-sf-muted">Sist testet: {formatShort(c.lastAt)}</p>

                  <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E6F3F6] px-4 py-2 text-sm font-medium text-[#007C80] hover:opacity-90 transition">
                    Åpne {c.title.toLowerCase()}
                  </div>
                </DashboardCard>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* TRENER – KLIENTSTATUS (som før) */}
      {role === "trainer" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/trainer/clients?filter=baseline">
            <DashboardCard
              title="Mangler baseline"
              status="3"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p className="text-sm">Klienter uten første test.</p>
              <p className="text-xs text-sf-muted mt-2">Se klienter →</p>
            </DashboardCard>
          </Link>

          <Link href="/trainer/clients?filter=inactive-tests">
            <DashboardCard title="Ikke testet siste 30 dager" status="5" icon={<Users size={18} />} variant="info">
              <p className="text-sm">Kan trenge ny vurdering.</p>
              <p className="text-xs text-sf-muted mt-2">Se klienter →</p>
            </DashboardCard>
          </Link>

          <Link href="/trainer/clients?filter=negative-progress">
            <DashboardCard
              title="Negativ progresjon"
              status="1"
              icon={<TrendingDown size={18} />}
              variant="danger"
            >
              <p className="text-sm">Krever ekstra oppfølging.</p>
              <p className="text-xs text-sf-muted mt-2">Se klient →</p>
            </DashboardCard>
          </Link>
        </div>
      )}

      {/* ADMIN – SYSTEMOVERSIKT (som før) */}
      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/clients?filter=has-tests">
            <DashboardCard title="Klienter med tester" status="42">
              <p className="text-sm">Har minst én registrert test.</p>
            </DashboardCard>
          </Link>

          <Link href="/admin/clients?filter=no-tests">
            <DashboardCard title="Uten tester" status="11" variant="warning">
              <p className="text-sm">Lav verdiopplevelse.</p>
              <p className="text-xs text-sf-muted mt-2">Se liste →</p>
            </DashboardCard>
          </Link>

          <Link href="/admin/clients?filter=no-trainer-no-tests">
            <DashboardCard title="Uten trener & tester" status="4" variant="danger">
              <p className="text-sm">Kritisk risiko.</p>
              <p className="text-xs text-sf-muted mt-2">Se detaljer →</p>
            </DashboardCard>
          </Link>

          <DashboardCard title="Tester siste 30 dager" status="128">
            <p className="text-sm">Total aktivitet.</p>
          </DashboardCard>
        </div>
      )}
    </section>
  );
}