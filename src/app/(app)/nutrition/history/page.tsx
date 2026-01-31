"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppPage from "@/components/layout/AppPage";
import { listDays, sumMeals } from "@/modules/nutrition/storage";

function round(n: any) {
  const x = Number(n ?? 0);
  return Math.round(x);
}

function pct(consumed: number, target: number) {
  if (!target || target <= 0) return null;
  return Math.round((consumed / target) * 100);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function truncate(s: string, max = 140) {
  const str = String(s ?? "").trim();
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

/**
 * Prøver å finne "det som ble skrevet inn" / en god label per måltid.
 * Tilpass gjerne feltlisten hvis dine måltider bruker andre navn.
 */
function mealLabel(meal: any) {
  if (!meal || typeof meal !== "object") return "";

  // Vanlige feltnavn (AI-input / brukerinput / navn)
  const candidates = [
    meal.ai_text,
    meal.user_text,
    meal.input,
    meal.prompt,
    meal.text,
    meal.description,
    meal.note,
    meal.name,
    meal.title,
    meal.label,
    meal.summary,
    meal.raw,
    meal.original,
  ];

  const found = candidates.find((x) => typeof x === "string" && x.trim().length > 0);
  if (found) return truncate(found, 160);

  // Noen lagrer items: [{name, grams}, ...]
  if (Array.isArray(meal.items) && meal.items.length) {
    const names = meal.items
      .map((it: any) => it?.name || it?.title || it?.label)
      .filter(Boolean)
      .slice(0, 6)
      .join(", ");
    if (names) return truncate(names, 160);
  }

  // Siste fallback
  try {
    return truncate(JSON.stringify(meal), 160);
  } catch {
    return "";
  }
}

function MetricBox({
  label,
  consumed,
  target,
  unit,
}: {
  label: string;
  consumed: number;
  target?: number;
  unit: string;
}) {
  const p = target ? pct(consumed, target) : null;

  return (
    <div className="rounded-xl border border-sf-border bg-white px-4 py-3">
      <div className="text-[11px] text-sf-muted">{label}</div>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <div className="tabular-nums text-lg font-semibold text-sf-text">
          {round(consumed)}
          <span className="text-xs font-medium text-sf-muted ml-1">{unit}</span>
        </div>

        {p != null ? (
          <span className="tabular-nums rounded-full border border-sf-border px-2 py-0.5 text-[11px] text-sf-muted">
            {p}%
          </span>
        ) : (
          <span className="text-[11px] text-sf-muted">—</span>
        )}
      </div>

      <div className="mt-1 text-[11px] text-sf-muted tabular-nums">
        {target && target > 0 ? (
          <>
            Mål: <span className="font-medium text-sf-text">{round(target)}</span> {unit}
          </>
        ) : (
          "Mål: ikke satt"
        )}
      </div>
    </div>
  );
}

export default function NutritionHistoryPage() {
  const PAGE_SIZE = 5;
  const MEALS_PREVIEW = 3;

  const days = useMemo(() => {
    return typeof window !== "undefined" ? listDays(90) : [];
  }, []);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // per-dag toggle for “vis alle måltider”
  const [expandedMealsByDay, setExpandedMealsByDay] = useState<Record<string, boolean>>({});

  const visibleDays = useMemo(() => {
    return days.slice(0, Math.min(visibleCount, days.length));
  }, [days, visibleCount]);

  const canLoadMore = visibleCount < days.length;

  function toggleMeals(date: string) {
    setExpandedMealsByDay((prev) => ({ ...prev, [date]: !prev[date] }));
  }

  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <div>
            <Link
              href="/nutrition"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
            >
              ← Tilbake
            </Link>
          </div>

          <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-base font-semibold text-sf-text">Historikk</h1>

              {days.length > 0 ? (
                <div className="text-xs text-sf-muted tabular-nums">
                  Viser{" "}
                  <span className="font-medium text-sf-text">
                    {Math.min(visibleCount, days.length)}
                  </span>{" "}
                  av <span className="font-medium text-sf-text">{days.length}</span>
                </div>
              ) : null}
            </div>

            {days.length === 0 ? (
              <p className="text-sm text-sf-muted">Ingen dager logget enda.</p>
            ) : (
              <div className="space-y-4">
                {visibleDays.map((d: any) => {
                  const meals = Array.isArray(d.meals) ? d.meals : [];
                  const s = sumMeals(meals);
                  const targets = d.targets || null;

                  const kcalP = targets?.calories_kcal
                    ? pct(s.calories_kcal, targets.calories_kcal)
                    : null;

                  const expanded = !!expandedMealsByDay[d.date];
                  const mealPreview = expanded ? meals : meals.slice(0, MEALS_PREVIEW);
                  const canExpandMeals = meals.length > MEALS_PREVIEW;

                  return (
                    <div
                      key={d.date}
                      className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-sf-text">{fmtDate(d.date)}</div>
                          <div className="mt-1 text-[12px] text-sf-muted tabular-nums">
                            Dagens total:{" "}
                            <span className="font-semibold text-sf-text">
                              {round(s.calories_kcal)} kcal
                            </span>
                            {kcalP != null ? (
                              <span className="ml-2 rounded-full border border-sf-border px-2 py-0.5 text-[11px] text-sf-muted">
                                {kcalP}% av behov
                              </span>
                            ) : (
                              <span className="ml-2 text-[11px] text-sf-muted">(behov ikke satt)</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right tabular-nums">
                          {targets?.calories_kcal ? (
                            <div className="text-[11px] text-sf-muted">
                              Behov:{" "}
                              <span className="font-medium text-sf-text">
                                {round(targets.calories_kcal)}
                              </span>{" "}
                              kcal
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricBox
                          label="Kalorier"
                          consumed={s.calories_kcal}
                          target={targets?.calories_kcal}
                          unit="kcal"
                        />
                        <MetricBox
                          label="Protein"
                          consumed={s.protein_g}
                          target={targets?.protein_g}
                          unit="g"
                        />
                        <MetricBox
                          label="Fett"
                          consumed={s.fat_g}
                          target={targets?.fat_g}
                          unit="g"
                        />
                        <MetricBox
                          label="Karbo"
                          consumed={s.carbs_g}
                          target={targets?.carbs_g}
                          unit="g"
                        />
                      </div>

                      {/* ✅ Måltid-oppsummering */}
                      {meals.length > 0 ? (
                        <div className="mt-4 rounded-xl border border-sf-border bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-sf-text">Måltider</div>
                            <div className="text-[11px] text-sf-muted tabular-nums">
                              {meals.length} registrert
                            </div>
                          </div>

                          <ul className="mt-2 space-y-1 text-sm">
                            {mealPreview.map((m: any, idx: number) => (
                              <li key={m?.id ?? `${d.date}-${idx}`} className="flex gap-2">
                                <span className="text-sf-muted tabular-nums">{idx + 1}.</span>
                                <span className="text-sf-text">{mealLabel(m) || "—"}</span>
                              </li>
                            ))}
                          </ul>

                          {canExpandMeals ? (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => toggleMeals(d.date)}
                                className="w-full rounded-full border border-sf-border bg-white px-4 py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft"
                              >
                                {expanded ? "Skjul" : `Vis alle (${meals.length})`}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {canLoadMore ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => Math.min(n + PAGE_SIZE, days.length))}
                      className="w-full rounded-full border border-sf-border bg-white px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
                    >
                      Last inn flere
                    </button>
                    <div className="mt-2 text-center text-[11px] text-sf-muted">
                      Laster {PAGE_SIZE} og {PAGE_SIZE} for å holde siden rask.
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-center text-[11px] text-sf-muted">
                    Du har sett hele historikken.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </AppPage>
    </div>
  );
}