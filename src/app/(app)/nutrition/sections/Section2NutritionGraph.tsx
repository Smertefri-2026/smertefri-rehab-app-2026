"use client";

export default function Section2NutritionGraph() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-5">

          {/* 🔹 Header + tabs */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-sf-text">
              Oversikt
            </h2>

            {/* Tabs (kun visning) */}
            <div className="flex gap-2">
              <button
                disabled
                className="rounded-full bg-sf-soft px-4 py-1.5 text-sm font-medium text-sf-text shadow-sm"
              >
                Uke
              </button>
              <button
                disabled
                className="rounded-full px-4 py-1.5 text-sm text-sf-muted hover:bg-sf-soft"
              >
                Måned
              </button>
              <button
                disabled
                className="rounded-full px-4 py-1.5 text-sm text-sf-muted hover:bg-sf-soft"
              >
                År
              </button>
            </div>
          </div>

          {/* 🔹 Innhold – uke (dummy) */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-sf-border pb-2">
              <span>ma. 15. des.</span>
              <span className="font-medium">1577 kcal</span>
            </div>

            <div className="flex justify-between border-b border-sf-border pb-2">
              <span>on. 10. des.</span>
              <span className="font-medium">2606 kcal</span>
            </div>

            <div className="flex justify-between pt-2">
              <span className="text-sf-muted">
                Snitt (7 dager)
              </span>
              <span className="font-semibold text-[#D97706]">
                2092 kcal ↓
              </span>
            </div>
          </div>

        

        </div>
      </div>
    </section>
  );
}