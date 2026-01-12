"use client";

export default function Section3AddMealAction() {
  return (
    <section>
      <button
        disabled
        className="
          w-full rounded-2xl border border-dashed border-sf-border
          bg-white py-3 text-sm font-medium text-sf-muted
        "
      >
        ➕ Legg til måltid
      </button>
    </section>
  );
}