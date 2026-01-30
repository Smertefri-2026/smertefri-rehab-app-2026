"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";
import { calcTdee, goalMeta, applyGoalToCalories, calcMacrosFromCalories } from "@/modules/nutrition/calc";

export default function Section4DailyNeedsSummary({ profile }: { profile: NutritionProfile }) {
  const { bmr, pal, tdee } = calcTdee(profile);

  const calories = applyGoalToCalories(tdee, profile.goal);
  const macros = calcMacrosFromCalories(profile, calories);
  const meta = goalMeta(profile.goal);

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Beregnet dagsbehov</h2>
          <div className="text-xs text-sf-muted">
            Estimat basert på <span className="font-medium text-sf-text">BMR (Mifflin–St Jeor)</span> og{" "}
            <span className="font-medium text-sf-text">PAL</span>.
          </div>
        </div>
        <span className="text-[11px] rounded-full border border-sf-border px-2 py-0.5 text-sf-muted">
          Kilde: Profil
        </span>
      </div>

      {!bmr ? (
        <div className="text-sm text-sf-muted">
          Fyll inn kjønn, alder, høyde og vekt for å få beregning.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
              <div className="text-xs text-sf-muted">Kalorimål</div>
              <div className="mt-1 text-lg font-semibold text-sf-text">{calories} kcal</div>
              <div className="mt-1 text-[11px] text-sf-muted">
                BMR {bmr} × PAL {pal?.toFixed(2)} • Mål {meta.tweakLabel}
              </div>
            </div>

            <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
              <div className="text-xs text-sf-muted">Protein</div>
              <div className="mt-1 text-lg font-semibold text-sf-text">{macros.protein ?? "—"} g</div>
              <div className="mt-1 text-[11px] text-sf-muted">Ca. 1.8–2.0 g/kg</div>
            </div>

            <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
              <div className="text-xs text-sf-muted">Fett</div>
              <div className="mt-1 text-lg font-semibold text-sf-text">{macros.fat ?? "—"} g</div>
              <div className="mt-1 text-[11px] text-sf-muted">Ca. 0.9 g/kg</div>
            </div>

            <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
              <div className="text-xs text-sf-muted">Karbohydrat</div>
              <div className="mt-1 text-lg font-semibold text-sf-text">{macros.carbs ?? "—"} g</div>
              <div className="mt-1 text-[11px] text-sf-muted">Restkcal etter P/F</div>
            </div>
          </div>

          <div className="rounded-2xl border border-sf-border bg-white p-4 text-sm space-y-1">
            <div>
              <span className="font-semibold">BMR:</span> {bmr} kcal (basalmetabolisme / hvilemetabolisme)
            </div>
            <div>
              <span className="font-semibold">PAL:</span> {pal?.toFixed(2)} (physical activity level)
            </div>
            <div>
              <span className="font-semibold">Totalt energibehov:</span> {tdee} kcal (BMR × PAL)
            </div>
            <div>
              <span className="font-semibold">Mål:</span> {meta.label}{" "}
              <span className="text-sf-muted">({meta.tweakLabel})</span>
            </div>
          </div>

          <div className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4 text-xs text-sf-muted">
            <span className="font-semibold text-sf-text">Merk:</span> Energiforbruk påvirkes også av{" "}
            <span className="font-medium text-sf-text">TEF</span> (matens termogene effekt) og{" "}
            <span className="font-medium text-sf-text">NEAT</span> (hverdagsbevegelser), som kan variere mye
            fra dag til dag. Derfor er dette et <span className="font-medium text-sf-text">estimat</span>.
          </div>
        </>
      )}
    </section>
  );
}