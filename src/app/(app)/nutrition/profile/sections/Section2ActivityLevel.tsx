
"use client";

export default function Section2ActivityLevel() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Aktivitetsnivå</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-sf-muted">Aktivitet i jobb</label>
          <select disabled className="w-full rounded-md border p-2">
            <option>Fysisk krevende</option>
            <option>Lett aktiv</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-sf-muted">Treningsnivå</label>
          <select disabled className="w-full rounded-md border p-2">
            <option>3–5 økter / uke</option>
            <option>1–2 økter / uke</option>
          </select>
        </div>
      </div>
    </section>
  );
}