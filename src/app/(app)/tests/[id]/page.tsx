// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import { Plus } from "lucide-react";

type Category = "bodyweight" | "strength" | "cardio";
const CATEGORIES: Category[] = ["bodyweight", "strength", "cardio"];

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

type Metric = { key: string; label: string; sort: number; unit?: string };

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string;
    subtitle: string;
    unitLabel: string;
    metrics: Metric[];
  }
> = {
  bodyweight: {
    title: "Egenvekt",
    subtitle: "4 minutter per øvelse",
    unitLabel: "reps",
    metrics: [
      { key: "knebøy", label: "Knebøy", sort: 1, unit: "reps" },
      { key: "pushups", label: "Armhevinger", sort: 2, unit: "reps" },
      { key: "situps", label: "Situps", sort: 3, unit: "reps" },
      { key: "plank_time", label: "Planke – tid", sort: 4, unit: "sek" },
      { key: "plank_breaks", label: "Planke – pauser", sort: 5, unit: "antall" },
    ],
  },
  strength: {
    title: "Styrke",
    subtitle: "1RM progresjon i baseøvelser",
    unitLabel: "kg",
    metrics: [
      { key: "knebøy", label: "Knebøy", sort: 1, unit: "kg" },
      { key: "markløft", label: "Markløft", sort: 2, unit: "kg" },
      { key: "benkpress", label: "Benkpress", sort: 3, unit: "kg" },
    ],
  },
  cardio: {
    title: "Kondisjon",
    subtitle: "4-min testers total distanse",
    unitLabel: "m",
    metrics: [
      { key: "mølle", label: "Mølle", sort: 1, unit: "m" },
      { key: "roing", label: "Roing", sort: 2, unit: "m" },
      { key: "ski", label: "Ski", sort: 3, unit: "m" },
      { key: "sykkel", label: "Sykkel", sort: 4, unit: "m" },
    ],
  },
};

function formatShort(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function pct(baseline: number | null, v: number | null) {
  if (baseline == null || v == null) return null;
  if (baseline === 0) return null;
  return ((v - baseline) / baseline) * 100;
}

function MiniLineChart({
  labels,
  series,
  focusKey,
  onFocus,
}: {
  labels: string[];
  series: { key: string; label: string; values: number[] }[];
  focusKey: string | null;
  onFocus: (k: string | null) => void;
}) {
  const W = 820;
  const H = 260;
  const PAD = 28;

  const visible = focusKey ? series.filter((s) => s.key === focusKey) : series;
  const all = visible.flatMap((s) => s.values);
  const maxY = Math.max(1, ...all);
  const minY = Math.min(0, ...all);

  const xCount = Math.max(2, labels.length);
  const xStep = (W - PAD * 2) / (xCount - 1);

  const yScale = (y: number) => {
    const span = maxY - minY || 1;
    const t = (y - minY) / span;
    return H - PAD - t * (H - PAD * 2);
  };

  const xScale = (i: number) => PAD + i * xStep;

  return (
    <div className="rounded-2xl border border-sf-border bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-sf-text">Progresjon (%)</div>
        <div className="text-xs text-sf-muted">Trykk på en øvelse for å fokusere.</div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-center gap-4">
        {series.map((s) => {
          const active = focusKey ? focusKey === s.key : true;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onFocus(focusKey === s.key ? null : s.key)}
              className={`flex items-center gap-2 text-sm ${
                active ? "text-sf-text" : "text-sf-muted"
              }`}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-sf-muted" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto sm:overflow-x-visible">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px] sm:min-w-0">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#94a3b8" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#94a3b8" />

          {labels.map((lab, i) => (
            <text
              key={lab + i}
              x={xScale(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {lab}
            </text>
          ))}

          {visible.map((s) => {
            const pts = s.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
            return (
              <g key={s.key}>
                <polyline fill="none" stroke="#64748b" strokeWidth="3" points={pts} />
                {s.values.map((v, i) => (
                  <circle
                    key={s.key + i}
                    cx={xScale(i)}
                    cy={yScale(v)}
                    r="5"
                    fill="white"
                    stroke="#64748b"
                    strokeWidth="2.5"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function TestsIdPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { userId, role, loading } = useRole();
  const { getClientById, loading: clientsLoading } = useClients();

  const isCategory = CATEGORIES.includes(id as Category);

  const category = (isCategory ? (id as Category) : null) as Category | null;
  const cfg = category ? CATEGORY_CONFIG[category] : null;

  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});
  const [err, setErr] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  // ✅ Kunde: trenerkobling for å styre "Registrer ny test"
  const [myTrainerId, setMyTrainerId] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (role !== "client") return;
      if (!userId) return;

      setAccessLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("trainer_id")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setMyTrainerId((data as any)?.trainer_id ?? null);
      } catch {
        setMyTrainerId(null);
      } finally {
        setAccessLoading(false);
      }
    };
    run();
  }, [role, userId]);

  useEffect(() => {
    if (!isCategory) return;
    if (loading || !userId) return;
    if (!cfg || !category) return;

    // Denne "category-modusen" er for kundevisning (egen historikk)
    if (role && role !== "client") return;

    let alive = true;

    (async () => {
      setErr(null);
      setSessions([]);
      setEntriesBySession({});

      const { data: s, error: sErr } = await supabase
        .from("test_sessions")
        .select("id, client_id, category, created_at")
        .eq("client_id", userId)
        .eq("category", category)
        .order("created_at", { ascending: true });

      if (!alive) return;
      if (sErr) return setErr(sErr.message);

      const list = (s ?? []) as TestSession[];
      setSessions(list);

      if (list.length === 0) return;

      const ids = list.map((x) => x.id);

      const { data: e, error: eErr } = await supabase
        .from("test_entries")
        .select("id, session_id, metric_key, value, unit, sort")
        .in("session_id", ids)
        .order("sort", { ascending: true });

      if (!alive) return;
      if (eErr) return setErr(eErr.message);

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
  }, [isCategory, loading, userId, role, category, cfg]);

  const ui = useMemo(() => {
    if (!cfg) return { labels: [], series: [], history: [] as any[] };

    const ordered = [...sessions];
    const labels = ordered.map((s) => formatShort(s.created_at));

    const baselineSession = ordered[0];
    const baselineEntries = baselineSession ? entriesBySession[baselineSession.id] ?? [] : [];

    const baselineMap: Record<string, number | null> = {};
    for (const m of cfg.metrics) {
      const e = baselineEntries.find((x) => x.metric_key === m.key);
      baselineMap[m.key] = e ? Number(e.value) : null;
    }

    const series = cfg.metrics.map((m) => {
      const values = ordered.map((sess) => {
        const ents = entriesBySession[sess.id] ?? [];
        const e = ents.find((x) => x.metric_key === m.key);
        const v = e ? Number(e.value) : null;
        const p = pct(baselineMap[m.key] ?? null, v);
        return Number.isFinite(p ?? NaN) ? Number(p) : 0;
      });
      return { key: m.key, label: m.label, values };
    });

    const history = [...ordered].reverse().map((sess, idx) => {
      const ents = entriesBySession[sess.id] ?? [];
      const rows = cfg.metrics.map((m) => {
        const e = ents.find((x) => x.metric_key === m.key);
        const v = e ? Number(e.value) : null;
        const base = baselineMap[m.key] ?? null;
        const p = pct(base, v);
        const delta = base != null && v != null ? v - base : null;
        return { ...m, value: v, pct: p, delta, unit: (e?.unit ?? m.unit ?? cfg.unitLabel) as string };
      });

      return {
        id: sess.id,
        at: sess.created_at,
        isBaseline: idx === ordered.length - 1,
        rows,
      };
    });

    return { labels, series, history };
  }, [sessions, entriesBySession, cfg]);

  const clientId = !isCategory ? id : null;
  const client = clientId ? getClientById(clientId) : null;
  const clientName = client
    ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim()
    : "Klient";

  if (loading || clientsLoading || (role === "client" && accessLoading)) return null;

  // ✅ KUNDE-MODUS (id = category)
  if (isCategory) {
    if (!cfg || !category) {
      return (
        <main className="bg-[#F4FBFA]">
          <AppPage>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Ugyldig kategori.
            </div>
          </AppPage>
        </main>
      );
    }

    if (role && role !== "client") {
      return (
        <main className="bg-[#F4FBFA]">
          <AppPage>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Trenere/admin: bruk klient-URL <span className="font-mono">/tests/&lt;clientId&gt;</span>.
            </div>
          </AppPage>
        </main>
      );
    }

    const canRegister = Boolean(userId) && !myTrainerId;

    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <div className="mx-auto w-full max-w-5xl space-y-5">
            {/* Header + actions */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/tests"
                  className="inline-flex items-center justify-center rounded-full border border-sf-border bg-white px-3 py-2 text-sm hover:bg-sf-soft"
                  title="Tilbake"
                >
                  ←
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-sf-text">{cfg.title}</h1>
                  <p className="text-sm text-sf-muted">{cfg.subtitle}</p>

                  {!canRegister ? (
                    <p className="mt-1 text-xs text-sf-muted">
                      Testregistrering gjøres av treneren din.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* ✅ Kun kunde uten trener */}
              {canRegister ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/tests/${encodeURIComponent(userId!)}/${category}/new`)
                  }
                  className="
                    inline-flex w-full md:w-auto
                    items-center justify-center gap-2
                    rounded-xl bg-[#007C80] px-4 py-2
                    text-sm font-medium text-white hover:opacity-95
                  "
                >
                  <Plus size={16} />
                  Registrer ny test
                </button>
              ) : null}
            </div>

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {err}
              </div>
            )}

            <MiniLineChart
              labels={ui.labels}
              series={ui.series}
              focusKey={focusKey}
              onFocus={setFocusKey}
            />

            <div className="rounded-2xl border border-sf-border bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-4 text-sm font-semibold text-sf-text">Historikk</div>

              {ui.history.length === 0 ? (
                <div className="text-sm text-sf-muted">Ingen tester registrert enda.</div>
              ) : (
                <div className="space-y-3">
                  {ui.history.map((h: any) => (
                    <div key={h.id} className="rounded-2xl border border-sf-border bg-white p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="text-sm font-semibold">{formatShort(h.at)}</div>
                        {h.isBaseline && (
                          <span className="rounded-full bg-sf-soft px-3 py-1 text-xs text-sf-muted">
                            Baseline
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        {h.rows.map((r: any) => {
                          const unit = r.unit ?? cfg.unitLabel;

                          return (
                            <div key={r.key} className="flex items-center justify-between gap-4">
                              <div className="text-sf-text">
                                <span className="font-medium">{r.label}:</span> {r.value ?? "—"} {unit}
                              </div>

                              <div className="text-right text-sf-muted">
                                {r.delta != null && r.pct != null ? (
                                  <span className="text-[#2F6B4F]">
                                    ({r.delta >= 0 ? "+" : ""}
                                    {Math.round(r.delta)} {unit} ·{" "}
                                    {r.pct >= 0 ? "+" : ""}
                                    {Math.round(r.pct)}%)
                                  </span>
                                ) : (
                                  <span />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AppPage>
      </main>
    );
  }

  // ✅ TRENER/ADMIN-MODUS (id = clientId)
  if (role && role !== "trainer" && role !== "admin") {
    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Ingen tilgang.
          </div>
        </AppPage>
      </main>
    );
  }

  if (!clientId) {
    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Mangler klient-id i URL.
          </div>
        </AppPage>
      </main>
    );
  }

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="mx-auto w-full max-w-4xl space-y-5">
          <div className="flex items-center gap-3">
            <Link
              href="/tests"
              className="inline-flex items-center justify-center rounded-full border border-sf-border bg-white px-3 py-2 text-sm hover:bg-sf-soft"
              title="Tilbake"
            >
              ←
            </Link>

            <div>
              <h1 className="text-2xl font-semibold text-sf-text">Tester — {clientName}</h1>
              <p className="text-sm text-sf-muted">Velg kategori for å se historikk.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push(`/tests/${encodeURIComponent(clientId)}/bodyweight`)}
              className="rounded-2xl border border-sf-border bg-white p-5 text-left shadow-sm hover:bg-sf-soft"
            >
              <div className="text-sm font-semibold text-sf-text">Egenvekt</div>
              <div className="text-xs text-sf-muted">4 minutter per øvelse</div>
            </button>

            <button
              type="button"
              onClick={() => router.push(`/tests/${encodeURIComponent(clientId)}/strength`)}
              className="rounded-2xl border border-sf-border bg-white p-5 text-left shadow-sm hover:bg-sf-soft"
            >
              <div className="text-sm font-semibold text-sf-text">Styrke</div>
              <div className="text-xs text-sf-muted">1RM progresjon i baseøvelser</div>
            </button>

            <button
              type="button"
              onClick={() => router.push(`/tests/${encodeURIComponent(clientId)}/cardio`)}
              className="rounded-2xl border border-sf-border bg-white p-5 text-left shadow-sm hover:bg-sf-soft"
            >
              <div className="text-sm font-semibold text-sf-text">Kondis</div>
              <div className="text-xs text-sf-muted">4-min distanse</div>
            </button>
          </div>
        </div>
      </AppPage>
    </main>
  );
}