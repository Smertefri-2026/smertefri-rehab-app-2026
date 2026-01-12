"use client";

export default function Section1DailyStatus() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold mb-3">Status i dag</h2>

      <div className="space-y-1 text-sm">
        <div>Protein: <span className="font-medium text-red-500">0 / 192 g</span></div>
        <div>Fett: <span className="font-medium">0 / 92 g</span></div>
        <div>Karbohydrat: <span className="font-medium">0 / 368 g</span></div>
        <div className="pt-2 font-semibold">
          Kalorier: <span className="text-red-500">0 / 3069 kcal</span>
        </div>
      </div>
    </section>
  );
}