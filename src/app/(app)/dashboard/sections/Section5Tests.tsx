"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRole } from "@/providers/RoleProvider";
import { supabase } from "@/lib/supabaseClient";

import {
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

type Role = "client" | "trainer" | "admin" | string;

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

type ClientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  trainer_id: string | null;
};

const CATEGORIES: Category[] = ["bodyweight", "strength", "cardio"];

const CATEGORY_LABEL: Record<Category, string> = {
  bodyweight: "Egenvekt",
  strength: "Styrke",
  cardio: "Kondis",
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

function daysAgo(ts: string | null) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function sessionTotal(category: Category, entries: TestEntry[]): number {
  const allowed = new Set(TOTAL_KEYS[category] ?? []);
  const sum = entries
    .filter((e) => allowed.has(e.metric_key))
    .reduce((acc, e) => acc + Number(e.value ?? 0), 0);
  return Number.isFinite(sum) ? sum : 0;
}

function fullName(c: ClientRow) {
  const n = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
  return n || "Klient";
}

type ClientComputed = {
  clientId: string;
  name: string;
  lastTestAt: string | null;
  missingCategories: Category[];
  avgPct: number | null; // gjennomsnitt av tilgjengelige kategori-% (baseline→latest)
  anyNegative: boolean;
  anyPositive: boolean;
};

export default function Section5Tests() {
  const { role, userId } = useRole() as { role: Role; userId: string | null };

  // CLIENT: som før
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<
    Record<string, TestEntry[]>
  >({});
  const [err, setErr] = useState<string | null>(null);

  // TRAINER/ADMIN: klient-oversikt
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [taErr, setTaErr] = useState<string | null>(null);
  const [taLoading, setTaLoading] = useState(false);

  /**
   * CLIENT – hent egne sessions/entries (uendret logikk)
   */
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

  const clientCards = useMemo(() => {
    const build = (
      category: Category,
      href: string,
      title: string,
      subtitle: string
    ) => {
      const catSessions = sessions.filter((x) => x.category === category);
      if (catSessions.length === 0) {
        return {
          href,
          title,
          subtitle,
          status: "—",
          lastAt: null as string | null,
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

      const status = pct == null ? "—" : `${pct >= 0 ? "+" : ""}${Math.round(pct)}%`;

      return {
        href,
        title,
        subtitle,
        status,
        lastAt: last.created_at,
        pct,
      };
    };

    return [
      build(
        "bodyweight",
        "/tests/bodyweight",
        "Egenvekt",
        "4 min (knebøy + armhevinger + situps + planke)"
      ),
      build("strength", "/tests/strength", "Styrke", "1RM progresjon i baseøvelser"),
      build("cardio", "/tests/cardio", "Kondisjon", "4 min (distanse på apparat)"),
    ];
  }, [sessions, entriesBySession]);

  /**
   * TRAINER/ADMIN – hent klienter + sessions + entries og beregn status
   */
  useEffect(() => {
    if (!userId) return;
    if (role !== "trainer" && role !== "admin") return;

    let alive = true;

    (async () => {
      setTaErr(null);
      setTaLoading(true);

      // 1) Hent klienter
      let q = supabase.from("profiles").select("id, first_name, last_name, trainer_id");

      if (role === "trainer") {
        q = q.eq("trainer_id", userId);
      }

      const { data: cData, error: cErr } = await q;

      if (!alive) return;

      if (cErr) {
        setTaErr(cErr.message);
        setClients([]);
        setTaLoading(false);
        return;
      }

      const cList = (cData ?? []) as ClientRow[];
      setClients(cList);

      if (cList.length === 0) {
        setTaLoading(false);
        return;
      }

      const clientIds = cList.map((c) => c.id);

      // 2) Hent sessions for disse klientene
      const { data: sData, error: sErr } = await supabase
        .from("test_sessions")
        .select("id, client_id, category, created_at")
        .in("client_id", clientIds)
        .order("created_at", { ascending: true });

      if (!alive) return;

      if (sErr) {
        setTaErr(sErr.message);
        setSessions([]);
        setEntriesBySession({});
        setTaLoading(false);
        return;
      }

      const sList = (sData ?? []) as TestSession[];
      setSessions(sList);

      if (sList.length === 0) {
        setEntriesBySession({});
        setTaLoading(false);
        return;
      }

      const sessionIds = sList.map((s) => s.id);

      // 3) Hent entries
      const { data: eData, error: eErr } = await supabase
        .from("test_entries")
        .select("id, session_id, metric_key, value, unit, sort")
        .in("session_id", sessionIds)
        .order("sort", { ascending: true });

      if (!alive) return;

      if (eErr) {
        setTaErr(eErr.message);
        setEntriesBySession({});
        setTaLoading(false);
        return;
      }

      const map: Record<string, TestEntry[]> = {};
      for (const row of (eData ?? []) as any[]) {
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

      setTaLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [role, userId]);

  const trainerAdminComputed = useMemo(() => {
    if (role !== "trainer" && role !== "admin") return [] as ClientComputed[];

    // grupper sessions per klient + kategori
    const byClientCat: Record<string, Record<Category, TestSession[]>> = {};
    for (const s of sessions) {
      if (!byClientCat[s.client_id]) {
        byClientCat[s.client_id] = { bodyweight: [], strength: [], cardio: [] };
      }
      byClientCat[s.client_id][s.category].push(s);
    }

    const res: ClientComputed[] = [];

    for (const c of clients) {
      const perCat = byClientCat[c.id] ?? { bodyweight: [], strength: [], cardio: [] };

      // siste testdato (på tvers av kategorier)
      const allSess = [...perCat.bodyweight, ...perCat.strength, ...perCat.cardio];
      const lastTestAt = allSess.length ? allSess[allSess.length - 1].created_at : null;

      // mangler baseline i hvilke kategorier?
      const missingCategories = CATEGORIES.filter((cat) => (perCat[cat]?.length ?? 0) === 0);

      // progresjon per kategori (baseline vs latest)
      const pcts: number[] = [];
      let anyNegative = false;
      let anyPositive = false;

      for (const cat of CATEGORIES) {
        const list = perCat[cat] ?? [];
        if (list.length < 2) continue;

        const first = list[0];
        const last = list[list.length - 1];

        const firstEntries = entriesBySession[first.id] ?? [];
        const lastEntries = entriesBySession[last.id] ?? [];

        const baseline = sessionTotal(cat, firstEntries);
        const latest = sessionTotal(cat, lastEntries);
        const pct = safePct(baseline, latest);

        if (pct == null) continue;

        pcts.push(pct);
        if (pct < 0) anyNegative = true;
        if (pct > 0) anyPositive = true;
      }

      const avgPct = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;

      res.push({
        clientId: c.id,
        name: fullName(c),
        lastTestAt,
        missingCategories,
        avgPct,
        anyNegative,
        anyPositive,
      });
    }

    return res;
  }, [role, clients, sessions, entriesBySession]);

  const trainerAdminStats = useMemo(() => {
    if (role !== "trainer" && role !== "admin") {
      return {
        missingBaseline: 0,
        inactive30: 0,
        negative: 0,
        positive: 0,
        totalClients: 0,
      };
    }

    const totalClients = trainerAdminComputed.length;

    const missingBaseline = trainerAdminComputed.filter(
      (c) => c.missingCategories.length > 0
    ).length;

    const inactive30 = trainerAdminComputed.filter((c) => {
      const d = daysAgo(c.lastTestAt);
      return d != null && d > 30;
    }).length;

    const negative = trainerAdminComputed.filter((c) => (c.avgPct ?? 0) < 0).length;
    const positive = trainerAdminComputed.filter((c) => (c.avgPct ?? 0) > 0).length;

    return { missingBaseline, inactive30, negative, positive, totalClients };
  }, [role, trainerAdminComputed]);

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
            {clientCards.map((c) => (
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

      {/* TRENER – KLIENTSTATUS (LIVE) */}
      {role === "trainer" && (
        <>
          {taErr && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {taErr}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/clients?filter=baseline-missing">
              <DashboardCard
                title="Mangler baseline"
                status={taLoading ? "…" : String(trainerAdminStats.missingBaseline)}
                icon={<AlertTriangle size={18} />}
                variant="warning"
              >
                <p className="text-sm">Klienter som mangler tester i én eller flere kategorier.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=inactive-tests">
              <DashboardCard
                title="Ikke testet siste 30 dager"
                status={taLoading ? "…" : String(trainerAdminStats.inactive30)}
                icon={<Users size={18} />}
                variant="info"
              >
                <p className="text-sm">Kan trenge ny vurdering og motivasjon.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=negative-progress">
              <DashboardCard
                title="Negativ progresjon"
                status={taLoading ? "…" : String(trainerAdminStats.negative)}
                icon={<TrendingDown size={18} />}
                variant="danger"
              >
                <p className="text-sm">Snakk med klienten: søvn, smerte, stress, volum.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=positive-progress">
              <DashboardCard
                title="Positiv progresjon"
                status={taLoading ? "…" : String(trainerAdminStats.positive)}
                icon={<TrendingUp size={18} />}
                variant="success"
              >
                <p className="text-sm">Gi cred – og bygg videre på det som funker.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>
          </div>
        </>
      )}

      {/* ADMIN – SYSTEMOVERSIKT (LIVE) */}
      {role === "admin" && (
        <>
          {taErr && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {taErr}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/clients?filter=baseline-missing">
              <DashboardCard
                title="Mangler baseline"
                status={taLoading ? "…" : String(trainerAdminStats.missingBaseline)}
                variant="warning"
              >
                <p className="text-sm">Klienter som mangler tester i én eller flere kategorier.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=inactive-tests">
              <DashboardCard
                title="Ikke testet siste 30 dager"
                status={taLoading ? "…" : String(trainerAdminStats.inactive30)}
                variant="info"
              >
                <p className="text-sm">Indikerer lav aktivitet/oppfølging.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=negative-progress">
              <DashboardCard
                title="Negativ progresjon"
                status={taLoading ? "…" : String(trainerAdminStats.negative)}
                variant="danger"
              >
                <p className="text-sm">Krever ekstra oppfølging/systemtiltak.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>

            <Link href="/clients?filter=positive-progress">
              <DashboardCard
                title="Positiv progresjon"
                status={taLoading ? "…" : String(trainerAdminStats.positive)}
                variant="success"
              >
                <p className="text-sm">Bra signal: metodikk + kontinuitet funker.</p>
                <p className="text-xs text-sf-muted mt-2">Se liste →</p>
              </DashboardCard>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}