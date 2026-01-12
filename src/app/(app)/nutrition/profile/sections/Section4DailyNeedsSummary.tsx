"use client";

export default function Section4DailyNeedsSummary() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold">Beregnet dagsbehov</h2>

      <div className="text-sm space-y-1">
        <div>RMR: <strong>2135 kcal</strong></div>
        <div>
          Kalorimål: <strong className="text-sf-primary">3069 kcal</strong>
        </div>
        <div className="pt-2">Protein: 192 g</div>
        <div>Fett: 92 g</div>
        <div>Karbohydrat: 368 g</div>
      </div>
    </section>
  );
}