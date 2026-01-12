"use client";

const meals = ["Frokost", "Lunsj", "Middag"];

export default function Section2MealsList() {
  return (
    <section className="space-y-4">
      {meals.map((meal) => (
        <div
          key={meal}
          className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{meal}</h3>
            <button className="text-xs text-red-500">Slett</button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <label className="block text-sf-muted">Protein (g)</label>
              <input className="w-full rounded-md border p-1" disabled />
            </div>
            <div>
              <label className="block text-sf-muted">Fett (g)</label>
              <input className="w-full rounded-md border p-1" disabled />
            </div>
            <div>
              <label className="block text-sf-muted">Karbo (g)</label>
              <input className="w-full rounded-md border p-1" disabled />
            </div>
          </div>

          <div className="mt-3">
            <textarea
              disabled
              className="w-full rounded-md border p-2 text-sm"
              placeholder="F.eks. 2 grove brødskiver med ost og skinke"
            />
          </div>

          <button
            disabled
            className="mt-3 w-full rounded-full bg-sf-soft py-2 text-sm text-sf-muted"
          >
            Beregn og lagre
          </button>
        </div>
      ))}
    </section>
  );
}