// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/nutrition/sections/Section2NutritionGraph.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { yyyyMmDd, loadDay } from "@/modules/nutrition/storage";
import { useRole } from "@/providers/RoleProvider";
import { listNutritionDays, type NutritionDayRow } from "@/lib/nutritionLog.api";

type RangeKey = "week" | "month" | "year";
type MetricKey = "calories_kcal" | "protein_g" | "fat_g" | "carbs_g";

type DayTotals = {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

type Targets = Partial<Record<MetricKey, number>>;

function makeDateList(range: RangeKey) {
  const days = range === "week" ? 7 : range === "month" ? 30 : 365;
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(yyyyMmDd(d));
  }
  return out;
}

function formatLabel(iso: string, range: RangeKey) {
  const d = new Date(iso);
  if (range === "year") return new Intl.DateTimeFormat("nb-NO", { month: "short" }).format(d);
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function metricLabel(m: MetricKey) {
  if (m === "calories_kcal") return "kcal";
  if (m === "protein_g") return "Protein (g)";
  if (m === "fat_g") return "Fett (g)";
  return "Karbo (g)";
}

function metricShort(m: MetricKey) {
  if (m === "calories_kcal") return "kcal";
  if (m === "protein_g") return "P";
  if (m === "fat_g") return "F";
  return "K";
}

function normalizeTargets(raw: any): Targets {
  if (!raw || typeof raw !== "object") return {};
  const kcal = raw.calories_kcal ?? raw.kcal ?? raw.calories ?? raw.energy_kcal ?? raw.energy ?? null;
  const protein = raw.protein_g ?? raw.protein ?? raw.p ?? null;
  const fat = raw.fat_g ?? raw.fat ?? raw.f ?? null;
  const carbs = raw.carbs_g ?? raw.carbs ?? raw.karbo_g ?? raw.k ?? null;

  const out: Targets = {};
  if (kcal != null) out.calories_kcal = Number(kcal) || 0;
  if (protein != null) out.protein_g = Number(protein) || 0;
  if (fat != null) out.fat_g = Number(fat) || 0;
  if (carbs != null) out.carbs_g = Number(carbs) || 0;
  return out;
}

function Sparkline({ values, target }: { values: number[]; target?: number }) {
  const w = 420;
  const h = 120;
  const pad = 10;

  const safeTarget = typeof target === "number" && target > 0 ? target : 0;
  const max = Math.max(...values, safeTarget, 1);
  const min = 0;

  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
    const y = h - pad - ((v - min) * (h - pad * 2)) / (max - min || 1);
    return { x, y };
  });

  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const last = pts[pts.length - 1];

  const yTarget =
    safeTarget > 0 ? h - pad - ((safeTarget - min) * (h - pad * 2)) / (max - min || 1) : null;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(0,0,0,0.08)" />

      {yTarget != null ? (
        <line
          x1={pad}
          y1={yTarget}
          x2={w - pad}
          y2={yTarget}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      ) : null}

      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
        className="text-sf-primary"
      />
      {last ? <circle cx={last.x} cy={last.y} r="4.5" className="fill-sf-primary" /> : null}
    </svg>
  );
}

export default function Section2NutritionGraph({ userId }: { userId?: string }) {
  const { role, userId: me } = useRole();
  const targetUserId = userId ?? me;

  const [range, setRange] = useState<RangeKey>("week");
  const [metric, setMetric] = useState<MetricKey>("calories_kcal");

  const [rows, setRows] = useState<NutritionDayRow[]>([]);
  const [loading, setLoading] = useState(false);

  const dates = useMemo(() => makeDateList(range), [range]);
  const from = dates[0];
  const to = dates[dates.length - 1];
  const today = yyyyMmDd();

  // ✅ LES FRA SUPABASE
  useEffect(() => {
    if (!targetUserId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await listNutritionDays(targetUserId, from, to);
        setRows(data);
      } catch (e) {
        console.error("listNutritionDays failed", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [targetUserId, from, to]);

  // Targets (dagsbehov): prøv først fra Supabase-row (hvis du har column),
  // ellers fallback til lokal day.targets (kun for linja)
  const targets = useMemo((): Targets => {
    // 1) prøv fra dagens row i DB (hvis den finnes og har targets)
    const rowToday: any = rows.find((r) => r.day_date === today);
    const fromDb = normalizeTargets(rowToday?.targets);
    if (Object.keys(fromDb).length) return fromDb;

    // 2) fallback: lokal targets (kun for dashed line)
    if (typeof window === "undefined") return {};
    try {
      const d: any = loadDay(today);
      return normalizeTargets(d?.targets);
    } catch {
      return {};
    }
  }, [rows, today]);

  const targetForMetric = useMemo(() => {
    const t = targets?.[metric];
    return typeof t === "number" && t > 0 ? t : undefined;
  }, [targets, metric]);

  // map date -> totals
  const byDate = useMemo(() => {
    const map = new Map<string, DayTotals>();
    for (const r of rows as any[]) {
      map.set(r.day_date, {
        calories_kcal: Number(r.calories_kcal || 0),
        protein_g: Number(r.protein_g || 0),
        fat_g: Number(r.fat_g || 0),
        carbs_g: Number(r.carbs_g || 0),
      });
    }
    return map;
  }, [rows]);

  const series = useMemo(() => {
    const totalsByDay = dates.map(
      (date) => byDate.get(date) ?? { calories_kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
    );

    const values = totalsByDay.map((t) => Number(t[metric] || 0));
    const labels = dates.map((date) => formatLabel(date, range));

    return { dates, labels, totalsByDay, values };
  }, [dates, byDate, metric, range]);

  const avgAll = useMemo(() => {
    const kcal = Math.round(mean(series.totalsByDay.map((t) => t.calories_kcal)));
    const p = Math.round(mean(series.totalsByDay.map((t) => t.protein_g)));
    const f = Math.round(mean(series.totalsByDay.map((t) => t.fat_g)));
    const k = Math.round(mean(series.totalsByDay.map((t) => t.carbs_g)));
    return { kcal, p, f, k };
  }, [series.totalsByDay]);

  const trend = useMemo(() => {
    const v = series.values;
    if (v.length < 4) return 0;
    const mid = Math.floor(v.length / 2);
    const first = mean(v.slice(0, mid));
    const last = mean(v.slice(mid));
    return last - first;
  }, [series.values]);

  const unit = metric === "calories_kcal" ? "kcal" : "g";
  const trendText =
    trend === 0
      ? "≈ stabilt"
      : trend > 0
      ? `↑ ${Math.round(trend)} ${unit}`
      : `↓ ${Math.round(Math.abs(trend))} ${unit}`;

  const lastNonZero = useMemo(() => {
    const pairs = series.dates
      .map((date, idx) => ({ date, t: series.totalsByDay[idx] }))
      .filter(
        (x) =>
          (x.t.calories_kcal || 0) > 0 ||
          (x.t.protein_g || 0) > 0 ||
          (x.t.fat_g || 0) > 0 ||
          (x.t.carbs_g || 0) > 0
      )
      .slice(-4)
      .reverse();
    return pairs;
  }, [series.dates, series.totalsByDay]);

  const historyHref = userId
    ? `/nutrition/${encodeURIComponent(targetUserId ?? "")}/history`
    : "/nutrition/history";

  const showHistoryButton = role === "client";

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-sf-text">Oversikt</h2>
              {loading ? (
                <span className="text-[11px] rounded-full border border-sf-border px-2 py-0.5 text-sf-muted">
                  Laster…
                </span>
              ) : null}
            </div>

            <div className="mt-1 text-xs text-sf-muted space-y-1">
              <div>
                Snitt:{" "}
                <span className="font-semibold text-sf-text">
                  {avgAll.kcal} kcal • P {avgAll.p}g • F {avgAll.f}g • K {avgAll.k}g
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <div>
                  Trend ({metricShort(metric)}):{" "}
                  <span className="font-semibold text-sf-text">{trendText}</span>
                </div>

                {targetForMetric ? (
                  <div>
                    Dagsbehov ({metricShort(metric)}):{" "}
                    <span className="font-semibold text-sf-text">
                      {Math.round(targetForMetric)} {unit}
                    </span>
                  </div>
                ) : (
                  <div className="text-sf-muted">(Dagsbehov mangler – settes via profil/targets)</div>
                )}
              </div>
            </div>
          </div>

          {showHistoryButton ? (
            <Link
              href={historyHref}
              className="rounded-full border border-sf-border px-4 py-1.5 text-sm text-sf-text hover:bg-sf-soft"
            >
              Historikk
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["week", "month", "year"] as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                range === r
                  ? "bg-sf-soft font-medium text-sf-text shadow-sm"
                  : "text-sf-muted hover:bg-sf-soft"
              }`}
            >
              {r === "week" ? "Uke" : r === "month" ? "Måned" : "År"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["calories_kcal", "protein_g", "fat_g", "carbs_g"] as MetricKey[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                metric === m
                  ? "bg-sf-soft font-medium text-sf-text shadow-sm"
                  : "text-sf-muted hover:bg-sf-soft"
              }`}
              title={`Vis graf for ${metricLabel(m)}`}
            >
              {m === "calories_kcal" ? "kcal" : m === "protein_g" ? "P" : m === "fat_g" ? "F" : "K"}
            </button>
          ))}
          <div className="text-xs text-sf-muted self-center ml-1">
            Viser: <span className="font-medium text-sf-text">{metricLabel(metric)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sf-border bg-[#F7FBFB] p-4">
        <Sparkline values={series.values.map((v) => Math.round(v))} target={targetForMetric} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-sf-muted">
          <span>{series.labels[0]}</span>
          <span>{series.labels[series.labels.length - 1]}</span>
        </div>
        {targetForMetric ? (
          <div className="mt-1 text-[11px] text-sf-muted">
            Stiplet linje = beregnet dagsbehov ({metricShort(metric)})
          </div>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        {lastNonZero.length === 0 ? (
          <div className="text-sf-muted">Ingen logg enda – legg inn et måltid i “I dag” for å se graf.</div>
        ) : (
          lastNonZero.map((x) => (
            <div
              key={x.date}
              className="flex items-center justify-between border-b border-sf-border pb-2 gap-4"
            >
              <span className="shrink-0">{formatLabel(x.date, "week")}</span>
              <div className="text-right">
                <div className="font-medium">{Math.round(x.t.calories_kcal)} kcal</div>
                <div className="text-[11px] text-sf-muted">
                  P {Math.round(x.t.protein_g)}g • F {Math.round(x.t.fat_g)}g • K{" "}
                  {Math.round(x.t.carbs_g)}g
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}