"use client";

import type { NutritionTargets } from "@/modules/nutrition/types";

export default function Section1DailyStatus({
  date,
  targets,
  consumed,
}: {
  date: string;
  targets: NutritionTargets;
  consumed: NutritionTargets;
}) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-sf-text">Dagens matinntak</h2>
        <div className="text-xs text-sf-muted">{date}</div>
      </div>

      <div className="text-sm space-y-1">
        <div>
          Protein:{" "}
          <span className="font-semibold text-red-600">
            {consumed.protein_g} / {targets.protein_g} g
          </span>
        </div>
        <div>
          Fett:{" "}
          <span className="font-medium">
            {consumed.fat_g} / {targets.fat_g} g
          </span>
        </div>
        <div>
          Karbohydrat:{" "}
          <span className="font-medium">
            {consumed.carbs_g} / {targets.carbs_g} g
          </span>
        </div>
        <div className="pt-2">
          Kalorier:{" "}
          <span className="font-semibold">
            {consumed.calories_kcal} / {targets.calories_kcal} kcal
          </span>
        </div>
      </div>
    </section>
  );
}