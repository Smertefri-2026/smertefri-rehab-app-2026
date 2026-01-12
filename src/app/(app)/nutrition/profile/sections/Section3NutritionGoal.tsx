"use client";

export default function Section3NutritionGoal() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Målsetting</h2>

      <div>
        <label className="text-xs text-sf-muted">Hva er målet ditt?</label>
        <select disabled className="w-full rounded-md border p-2">
          <option>Redusere fett</option>
          <option>Øke muskelmasse</option>
          <option>Vedlikeholde</option>
        </select>
      </div>
    </section>
  );
}