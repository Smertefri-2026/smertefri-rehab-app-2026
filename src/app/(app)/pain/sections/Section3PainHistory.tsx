// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/sections/Section3PainHistory.tsx
"use client";

import { useMemo, useState } from "react";
import { usePain } from "@/stores/pain.store";

type Props = {
  clientId: string;
  areaKey?: string | null; // ✅ optional
};

type RangeKey = "7" | "30" | "90";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateISOFromEntry(e: any) {
  const raw = (e?.entry_date ?? e?.created_at ?? "") as string;
  return raw ? raw.slice(0, 10) : "";
}

function daysBetweenISO(aISO: string, bISO: string) {
  const a = new Date(`${aISO}T00:00:00`);
  const b = new Date(`${bISO}T00:00:00`);
  const diff = a.getTime() - b.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function relativeDayLabel(entryISO: string, todayISOValue: string) {
  if (!entryISO) return "ukjent";
  const diff = daysBetweenISO(todayISOValue, entryISO);
  if (diff === 0) return "i dag";
  if (diff === 1) return "i går";
  if (diff > 1) return `${diff} dager siden`;
  if (diff === -1) return "i morgen";
  return `${Math.abs(diff)} dager frem`;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sf-border bg-sf-soft/30 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-sf-muted">{label}</div>
      <div className="text-sm font-semibold text-sf-text">{value}</div>
    </div>
  );
}

export default function Section3PainHistory({ clientId, areaKey }: Props) {
  const { entries } = usePain();
  const [range, setRange] = useState<RangeKey>("30");
  const todayISOValue = useMemo(() => toISODate(new Date()), []);

  const activeAreaKey = useMemo(() => {
    if (areaKey) return areaKey;
    const firstActive = entries.find((e) => e.is_active);
    return firstActive?.area_key ?? null;
  }, [areaKey, entries]);

  const label = useMemo(() => {
    if (!activeAreaKey) return "Utvikling";
    const e = entries.find((x) => x.area_key === activeAreaKey);
    return e?.area_label ?? "Utvikling";
  }, [entries, activeAreaKey]);

  const { points, lastEntryISO, stats } = useMemo(() => {
    if (!activeAreaKey) {
      return {
        points: [] as { date: string; value: number | null }[],
        lastEntryISO: "" as string,
        stats: {
          count: 0,
          avg: null as number | null,
          min: null as number | null,
          max: null as number | null,
        },
      };
    }

    const from = daysAgo(Number(range) - 1);
    const fromISO = toISODate(from);

    const relevant = entries
      .filter((e) => e.client_id === clientId && e.area_key === activeAreaKey)
      // ✅ bruk entry_date eller created_at for filtrering
      .filter((e) => dateISOFromEntry(e) >= fromISO);

    // én verdi per dag: ta siste som finnes den dagen
    const byDay = new Map<string, number>();
    for (const e of relevant) {
      const d = dateISOFromEntry(e);
      if (!d) continue;
      byDay.set(d, e.intensity);
    }

    // serie med alle dager i range
    const out: { date: string; value: number | null }[] = [];
    for (let i = Number(range) - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const iso = toISODate(d);
      out.push({ date: iso, value: byDay.get(iso) ?? null });
    }

    // stats kun på registrerte dager
    const values = out.map((p) => p.value).filter((v): v is number => typeof v === "number");
    const count = values.length;

    const min = count ? Math.min(...values) : null;
    const max = count ? Math.max(...values) : null;
    const avg = count ? values.reduce((a, b) => a + b, 0) / count : null;

    // sist registrert (seneste dato med verdi)
    const last = [...byDay.keys()].sort().at(-1) ?? "";

    return {
      points: out,
      lastEntryISO: last,
      stats: { count, avg, min, max },
    };
  }, [entries, clientId, activeAreaKey, range]);

  const hasAnyPoints = points.some((p) => p.value != null);

  const lastLabel = useMemo(() => {
    if (!lastEntryISO) return "—";
    return `${relativeDayLabel(lastEntryISO, todayISOValue)} (${lastEntryISO})`;
  }, [lastEntryISO, todayISOValue]);

  const avgText = stats.avg == null ? "—" : `${stats.avg.toFixed(1)}/10`;
  const minText = stats.min == null ? "—" : `${stats.min}/10`;
  const maxText = stats.max == null ? "—" : `${stats.max}/10`;
  const countText = `${stats.count}/${range}`;

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Utvikling over tid</h3>
            <p className="text-sm text-sf-muted">
              {activeAreaKey ? `Område: ${label}` : "Velg et område for å se historikk."}
            </p>
          </div>

          <div className="flex gap-2">
            {(["7", "30", "90"] as RangeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setRange(k)}
                className={[
                  "rounded-full px-4 py-2 text-sm border transition",
                  range === k ? "bg-[#007C80] text-white border-transparent" : "border-sf-border hover:bg-sf-soft",
                ].join(" ")}
              >
                {k} d
              </button>
            ))}
          </div>
        </div>

        {!activeAreaKey ? (
          <p className="text-sm text-sf-muted">Ingen data enda.</p>
        ) : !hasAnyPoints ? (
          <p className="text-sm text-sf-muted">Ingen registreringer i valgt periode.</p>
        ) : (
          <>
            {/* ✅ mini-stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatPill label="Sist registrert" value={lastLabel} />
              <StatPill label="Snitt" value={avgText} />
              <StatPill label="Min / Maks" value={`${minText} • ${maxText}`} />
              <StatPill label="Dager registrert" value={countText} />
            </div>

            <MiniLineChart points={points} />
          </>
        )}
      </div>
    </section>
  );
}

function MiniLineChart({
  points,
}: {
  points: { date: string; value: number | null }[];
}) {
  // enkel SVG chart: 0–10
  const w = 900;
  const h = 220;
  const pad = 28;

  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  const xs = points.map((_, i) => pad + (i * usableW) / Math.max(1, points.length - 1));

  const ys = points.map((p) => {
    if (p.value == null) return null;
    const v = Math.min(10, Math.max(0, p.value));
    return pad + (1 - v / 10) * usableH;
  });

  // ✅ Path starter med "M" på første gyldige punkt
  let started = false;
  const d = xs
    .map((x, i) => {
      const y = ys[i];
      if (y == null) return null;
      const cmd = started ? "L" : "M";
      started = true;
      return `${cmd} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[700px]">
        {/* grid */}
        {[0, 2, 4, 6, 8, 10].map((v) => {
          const y = pad + (1 - v / 10) * usableH;
          return (
            <g key={v}>
              <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="#E5E7EB" />
              <text x={6} y={y + 4} fontSize="12" fill="#6B7280">
                {v}
              </text>
            </g>
          );
        })}

        {/* line */}
        {d ? <path d={d} fill="none" stroke="#007C80" strokeWidth="3" /> : null}

        {/* points (med tooltip) */}
        {xs.map((x, i) => {
          const y = ys[i];
          const p = points[i];
          if (y == null) return null;

          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4.5" fill="#ffffff" stroke="#007C80" strokeWidth="2" />
              {/* ✅ Native tooltip */}
              <title>
                {p.date} – {p.value}/10
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}