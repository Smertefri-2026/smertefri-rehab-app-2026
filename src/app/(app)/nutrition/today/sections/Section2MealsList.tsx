"use client";

import type { Meal } from "@/modules/nutrition/types";
import { calcCalories } from "@/modules/nutrition/storage";
import { useState, useMemo, useEffect } from "react";

async function aiEstimate(text: string) {
  const res = await fetch("/api/nutrition/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Kunne ikke beregne makroer");
  return res.json() as Promise<{
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    calories_kcal: number;
    confidence: number;
    assumption: string;
  }>;
}

export default function Section2MealsList({
  meals,
  onUpdateMeal,
  onDeleteMeal,
}: {
  meals: Meal[];
  onUpdateMeal: (id: string, patch: Partial<Meal>) => void;
  onDeleteMeal: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onUpdate={onUpdateMeal}
          onDelete={onDeleteMeal}
        />
      ))}
    </div>
  );
}

function MealCard({
  meal,
  onUpdate,
  onDelete,
}: {
  meal: Meal;
  onUpdate: (id: string, patch: Partial<Meal>) => void;
  onDelete: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAuto =
    (meal.note || "").trim().length >= 3 &&
    meal.protein_g === 0 &&
    meal.fat_g === 0 &&
    meal.carbs_g === 0;

  const handleSave = async () => {
    setError(null);

    try {
      setLoading(true);

      if (canAuto) {
        const est = await aiEstimate(meal.note || "");
        onUpdate(meal.id, {
          protein_g: Math.round(est.protein_g),
          fat_g: Math.round(est.fat_g),
          carbs_g: Math.round(est.carbs_g),
          calories_kcal: Math.round(est.calories_kcal),
          title: est.assumption?.slice(0, 80),
        });
      } else {
        onUpdate(meal.id, {
          calories_kcal: calcCalories(meal.protein_g, meal.fat_g, meal.carbs_g),
        });
      }
    } catch (e: any) {
      setError(e?.message || "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{meal.type}</h3>

        <button
          onClick={() => onDelete(meal.id)}
          className="text-xs text-red-600 hover:underline"
          title="Slett"
        >
          🗑 Slett
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-sf-muted">Protein (g)</label>
          <input
            type="number"
            value={meal.protein_g}
            onChange={(e) => onUpdate(meal.id, { protein_g: Number(e.target.value) })}
            className="w-full rounded-md border border-sf-border p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-sf-muted">Fett (g)</label>
          <input
            type="number"
            value={meal.fat_g}
            onChange={(e) => onUpdate(meal.id, { fat_g: Number(e.target.value) })}
            className="w-full rounded-md border border-sf-border p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-sf-muted">Karbohydrat (g)</label>
          <input
            type="number"
            value={meal.carbs_g}
            onChange={(e) => onUpdate(meal.id, { carbs_g: Number(e.target.value) })}
            className="w-full rounded-md border border-sf-border p-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-sf-border bg-[#F7FBFB] p-4 space-y-2">
        <div className="text-xs text-sf-muted">
          🍽 Usikker på mengdene? Skriv hva du spiste (AI estimerer makroer):
        </div>
        <textarea
          value={meal.note || ""}
          onChange={(e) => onUpdate(meal.id, { note: e.target.value })}
          placeholder="F.eks. 2 grove brødskiver med ost og skinke"
          className="w-full min-h-[70px] rounded-md border border-sf-border p-2 text-sm"
        />
        <div className="text-[11px] text-sf-muted">
          Tips: La makrofeltene stå på 0 → da bruker den AI når du trykker “Beregn og lagre”.
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Beregner …" : "Beregn og lagre"}
      </button>

      <div className="text-xs text-sf-muted flex items-center justify-between">
        <span>Kalorier: <strong>{meal.calories_kcal}</strong> kcal</span>
        {meal.title ? <span className="italic">{meal.title}</span> : null}
      </div>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </section>
  );
}