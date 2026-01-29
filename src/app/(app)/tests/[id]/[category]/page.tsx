// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/[id]/[category]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import { Pencil, Plus, Trash2 } from "lucide-react";

type Category = "bodyweight" | "strength" | "cardio";

type Metric = { key: string; label: string; sort: number; unit?: string };

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

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string;
    subtitle: string;
    unitLabel: string; // default hvis entry ikke har unit
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

      // ✅ Planke som “final boss”
      { key: "plank_time", label: "Planke – tid", sort: 4, unit: "sek" },
      { key: "plank_breaks", label: "Planke – pauser", sort: 5, unit: "antall" },
    ],
  },
  strength: {
    title: "Styrke",
    subtitle: "1RM progresjon i baseøvelser",
    unitLabel: "kg",
    metrics: [
      // ✅ Riktig rekkefølge
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
         { key: "mølle", label: "Mølle", sort: 4, unit: "m" },
       { key: "roing", label: "Roing", sort: 2, unit: "m" },
      { key: "ski", label: "Ski", sort: 3, unit: "m" },
  { key: "sykkel", label: "Sykkel", sort: 1, unit: "m" },
    ],
  },
};

function formatShort(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
    <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
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

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]">
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

export default function TestCategoryClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string; category: string }>();
  const clientId = params?.id ?? "";
  const category = params?.category as Category;

  const { role, loading: roleLoading } = useRole();
  const { getClientById, loading: clientsLoading } = useClients();

  const cfg = CATEGORY_CONFIG[category];

  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [entriesBySession, setEntriesBySession] = useState<Record<string, TestEntry[]>>({});
  const [err, setErr] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  const client = clientId ? getClientById(clientId) : null;
  const clientName = client
    ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "Klient"
    : "Klient";

  const refresh = async () => {
    if (!clientId || !cfg) return;

    setErr(null);
    setSessions([]);
    setEntriesBySession({});

    const { data: s, error: sErr } = await supabase
      .from("test_sessions")
      .select("id, client_id, category, created_at")
      .eq("client_id", clientId)
      .eq("category", category)
      .order("created_at", { ascending: true });

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
  };

  useEffect(() => {
    if (roleLoading) return;
    if (!clientId) return;
    if (!cfg) return;

    let alive = true;
    (async () => {
      if (!alive) return;
      await refresh();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, clientId, category]);

  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const baselineSession = sessions.length > 0 ? sessions[0] : null;

  const ui = useMemo(() => {
    if (!cfg) return { labels: [], series: [], history: [] as any[] };

    const ordered = [...sessions];
    const labels = ordered.map((s) => formatShort(s.created_at));

    const baseline = ordered[0];
    const baselineEntries = baseline ? entriesBySession[baseline.id] ?? [] : [];

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

        const unit = (e?.unit ?? m.unit ?? cfg.unitLabel) as string;

        const base = baselineMap[m.key] ?? null;
        const p = pct(base, v);
        const delta = base != null && v != null ? v - base : null;

        return { ...m, value: v, pct: p, delta, unit };
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

  const handleDeleteLatest = async () => {
    if (!latestSession) return;
    if (latestSession.id === baselineSession?.id) return;

    const ok = window.confirm("Slette siste registrering? Dette kan ikke angres.");
    if (!ok) return;

    setBusyDelete(true);
    setErr(null);

    const { error: eErr } = await supabase
      .from("test_entries")
      .delete()
      .eq("session_id", latestSession.id);

    if (eErr) {
      setBusyDelete(false);
      setErr(eErr.message);
      return;
    }

    const { error: sErr } = await supabase
      .from("test_sessions")
      .delete()
      .eq("id", latestSession.id);

    if (sErr) {
      setBusyDelete(false);
      setErr(sErr.message);
      return;
    }

    await refresh();
    setBusyDelete(false);
  };

  if (roleLoading || clientsLoading) return null;

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

  if (!cfg) {
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

  const disableEditDelete = !latestSession || latestSession.id === baselineSession?.id;
  const canEditOrDelete = Boolean(latestSession) && latestSession?.id !== baselineSession?.id;

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="mx-auto w-full max-w-5xl space-y-5">
          {/* ✅ Topp: mobil = stack, desktop = side-by-side */}
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            {/* VENSTRE: tilbake + tittel */}
            <div className="flex items-start gap-3">
              <Link
                href={`/tests/${encodeURIComponent(clientId)}`}
                className="inline-flex items-center justify-center rounded-full border border-sf-border bg-white px-3 py-2 text-sm hover:bg-sf-soft"
                title="Tilbake"
              >
                ←
              </Link>

              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold text-sf-text truncate">
                  {cfg.title} — {clientName}
                </h1>
                <p className="text-sm text-sf-muted">{cfg.subtitle}</p>
              </div>
            </div>

            {/* HØYRE: actions (mobil: under header, full bredde) */}
            <div
              className="
                w-full md:w-auto
                grid grid-cols-1 gap-2
                sm:grid-cols-3
                md:flex md:items-center md:justify-end md:gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  router.push(`/tests/${encodeURIComponent(clientId)}/${category}/new`)
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

              <button
                type="button"
                disabled={disableEditDelete}
                onClick={() =>
                  router.push(
                    `/tests/${encodeURIComponent(clientId)}/${category}/new?sessionId=${encodeURIComponent(
                      latestSession!.id
                    )}`
                  )
                }
                className="
                  inline-flex w-full md:w-auto
                  items-center justify-center gap-2
                  rounded-xl border border-sf-border bg-white px-3 py-2
                  text-sm text-sf-text hover:bg-sf-soft disabled:opacity-40
                "
                title="Rediger siste"
              >
                <Pencil size={16} />
                Rediger siste
              </button>

              <button
                type="button"
                disabled={busyDelete || disableEditDelete}
                onClick={handleDeleteLatest}
                className="
                  inline-flex w-full md:w-auto
                  items-center justify-center gap-2
                  rounded-xl border border-sf-border bg-white px-3 py-2
                  text-sm text-red-600 hover:bg-red-50 disabled:opacity-40
                "
                title="Slett siste"
              >
                <Trash2 size={16} />
                Slett siste
              </button>
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <MiniLineChart labels={ui.labels} series={ui.series} focusKey={focusKey} onFocus={setFocusKey} />

          <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-sf-text">Historikk</div>

            {ui.history.length === 0 ? (
              <div className="text-sm text-sf-muted">Ingen tester registrert enda.</div>
            ) : (
              <div className="space-y-3">
                {ui.history.map((h: any) => {
                  const isLatest = latestSession?.id === h.id;
                  const showMiniActions = isLatest && !h.isBaseline && canEditOrDelete;

                  return (
                    <div key={h.id} className="rounded-2xl border border-sf-border bg-white p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold">{formatShort(h.at)}</div>
                          {h.isBaseline && (
                            <span className="rounded-full bg-sf-soft px-3 py-1 text-xs text-sf-muted">
                              Baseline
                            </span>
                          )}
                          {isLatest && !h.isBaseline && (
                            <span className="rounded-full bg-[#E6F3F6] px-3 py-1 text-xs text-[#007C80]">
                              Siste
                            </span>
                          )}
                        </div>

                        {showMiniActions && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/tests/${encodeURIComponent(clientId)}/${category}/new?sessionId=${encodeURIComponent(
                                    h.id
                                  )}`
                                )
                              }
                              className="rounded-lg border border-sf-border bg-white px-3 py-1.5 text-xs hover:bg-sf-soft"
                            >
                              Rediger
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteLatest}
                              className="rounded-lg border border-sf-border bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                              Slett
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        {h.rows.map((r: any) => (
                          <div key={r.key} className="flex items-center justify-between gap-4">
                            <div className="text-sf-text">
                              <span className="font-medium">{r.label}:</span> {r.value ?? "—"}{" "}
                              {r.unit ?? cfg.unitLabel}
                            </div>

                            <div className="text-right text-sf-muted">
                              {r.delta != null && r.pct != null ? (
                                <span className="text-[#2F6B4F]">
                                  (+{Math.round(r.delta)} {r.unit ?? cfg.unitLabel} · +{Math.round(r.pct)}%)
                                </span>
                              ) : (
                                <span />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppPage>
    </main>
  );
}