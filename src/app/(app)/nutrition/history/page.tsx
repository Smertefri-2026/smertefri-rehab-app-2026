"use client";

import Link from "next/link";
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
  // iso "YYYY-MM-DD" funker i moderne nettlesere, men noen ganger tolkes som UTC.
  // Vi holder det enkelt her; om du vil 100% stabilt kan vi lage en parser senere.
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
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
  const days = typeof window !== "undefined" ? listDays(90) : [];

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
            <h1 className="text-base font-semibold text-sf-text">Historikk</h1>

            {days.length === 0 ? (
              <p className="text-sm text-sf-muted">Ingen dager logget enda.</p>
            ) : (
              <div className="space-y-4">
                {days.map((d: any) => {
                  const s = sumMeals(d.meals || []);
                  const targets = d.targets || null;

                  const kcalP = targets?.calories_kcal ? pct(s.calories_kcal, targets.calories_kcal) : null;

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
                              Behov: <span className="font-medium text-sf-text">{round(targets.calories_kcal)}</span> kcal
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
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </AppPage>
    </div>
  );
}