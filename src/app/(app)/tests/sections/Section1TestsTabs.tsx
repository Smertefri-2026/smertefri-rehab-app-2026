"use client";

export default function Section1TestsTabs() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* EGENVEKT */}
            <div className="min-w-[120px] rounded-full bg-[#EAF5EF] px-6 py-2 text-center text-sm font-medium text-[#2F6B4F]">
              Egenvekt
            </div>

            {/* STYRKE */}
            <div className="min-w-[120px] rounded-full border border-sf-border bg-white px-6 py-2 text-center text-sm font-medium text-sf-muted">
              Styrke
            </div>

            {/* KONDIS */}
            <div className="min-w-[120px] rounded-full border border-sf-border bg-white px-6 py-2 text-center text-sm font-medium text-sf-muted">
              Kondis
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}