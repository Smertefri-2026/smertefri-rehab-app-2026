// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/sections/Section3PainHistory.tsx
"use client";

import { useMemo, useState } from "react";
import { usePain } from "@/stores/pain.store";

type Props = {
  clientId: string;
  areaKey?: string | null; // ✅ optional (fikser Vercel-build hvis areaKey mangler)
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

export default function Section3PainHistory({ clientId, areaKey }: Props) {
  const { entries } = usePain();
  const [range, setRange] = useState<RangeKey>("30");

  const activeAreaKey = useMemo(() => {
    if (areaKey) return areaKey;
    const firstActive = entries.find((e) => e.is_active);
    return firstActive?.area_key ?? null;
  }, [areaKey, entries]);

  const points = useMemo(() => {
    if (!activeAreaKey) return [];

    const from = daysAgo(Number(range) - 1);
    const fromISO = toISODate(from);

    const relevant = entries
      .filter((e) => e.client_id === clientId && e.area_key === activeAreaKey)
      .filter((e) => (e.entry_date ?? "").slice(0, 10) >= fromISO);

    // én verdi per dag: ta siste som finnes den dagen
    const byDay = new Map<string, number>();
    for (const e of relevant) {
      const d = (e.entry_date ?? e.created_at).slice(0, 10);
      byDay.set(d, e.intensity);
    }

    // serie med alle dager i range
    const out: { date: string; value: number | null }[] = [];
    for (let i = Number(range) - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const iso = toISODate(d);
      out.push({ date: iso, value: byDay.get(iso) ?? null });
    }
    return out;
  }, [entries, clientId, activeAreaKey, range]);

  const label = useMemo(() => {
    if (!activeAreaKey) return "Utvikling";
    const e = entries.find((x) => x.area_key === activeAreaKey);
    return e?.area_label ?? "Utvikling";
  }, [entries, activeAreaKey]);

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Utvikling over tid</h3>
            <p className="text-sm text-sf-muted">
              {activeAreaKey
                ? `Område: ${label}`
                : "Velg et område for å se historikk."}
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
                  range === k
                    ? "bg-[#007C80] text-white border-transparent"
                    : "border-sf-border hover:bg-sf-soft",
                ].join(" ")}
              >
                {k} d
              </button>
            ))}
          </div>
        </div>

        {!activeAreaKey ? (
          <p className="text-sm text-sf-muted">Ingen data enda.</p>
        ) : points.every((p) => p.value == null) ? (
          <p className="text-sm text-sf-muted">
            Ingen registreringer i valgt periode.
          </p>
        ) : (
          <MiniLineChart points={points} />
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

  const xs = points.map(
    (_, i) => pad + (i * usableW) / Math.max(1, points.length - 1)
  );

  const ys = points.map((p) => {
    if (p.value == null) return null;
    const v = Math.min(10, Math.max(0, p.value));
    return pad + (1 - v / 10) * usableH;
  });

  // ✅ Bygg path som alltid starter med "M" på første gyldige punkt
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

        {/* points */}
        {xs.map((x, i) => {
          const y = ys[i];
          if (y == null) return null;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#ffffff"
              stroke="#007C80"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}