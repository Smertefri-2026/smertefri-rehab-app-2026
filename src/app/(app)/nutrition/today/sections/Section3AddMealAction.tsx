"use client";

export default function Section3AddMealAction({ onAddMeal }: { onAddMeal: () => void }) {
  return (
    <button
      onClick={onAddMeal}
      className="w-full rounded-2xl border border-dashed border-sf-border bg-white px-6 py-4 text-sm font-medium text-sf-text hover:bg-sf-soft"
    >
      + Legg til måltid
    </button>
  );
}