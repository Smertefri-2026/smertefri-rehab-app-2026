"use client";

export default function Section1NutritionBasicProfile() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Grunnprofil</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-sf-muted">Kjønn</label>
          <select disabled className="w-full rounded-md border p-2">
            <option>Mann</option>
            <option>Kvinne</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-sf-muted">Alder</label>
          <input disabled className="w-full rounded-md border p-2" value="19" />
        </div>

        <div>
          <label className="text-xs text-sf-muted">Høyde (cm)</label>
          <input disabled className="w-full rounded-md border p-2" value="188" />
        </div>

        <div>
          <label className="text-xs text-sf-muted">Vekt (kg)</label>
          <input disabled className="w-full rounded-md border p-2" value="105" />
        </div>
      </div>
    </section>
  );
}