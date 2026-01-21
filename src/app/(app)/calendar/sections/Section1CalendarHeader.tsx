// /src/app/(app)/calendar/sections/Section1CalendarHeader.tsx
"use client";

import { CalendarView } from "@/types/calendar";

type Props = {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Section1CalendarHeader({
  view,
  onViewChange,
  onPrev,
  onNext,
}: Props) {
  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sf-border hover:bg-sf-soft"
            aria-label="Forrige"
          >
            ←
          </button>

          <div className="flex items-center rounded-full bg-sf-soft p-1">
            {[
              { key: "day", label: "Dag" },
              { key: "week", label: "Uke" },
              { key: "month", label: "Måned" },
              { key: "year", label: "År" },
            ].map(({ key, label }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  onClick={() => onViewChange(key as CalendarView)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white text-sf-text shadow"
                      : "text-sf-muted hover:text-sf-text"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={onNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sf-border hover:bg-sf-soft"
            aria-label="Neste"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}