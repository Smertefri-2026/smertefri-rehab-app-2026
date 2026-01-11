"use client";

import { Dispatch, SetStateAction } from "react";
import { CalendarView } from "@/types/calendar";

type Props = {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void; // ← VIKTIG ENDRING
  onPrev: () => void;
  onNext: () => void;
  role?: "client" | "trainer" | "admin" | null;
};

export default function Section1CalendarHeader({
  view,
  onViewChange,
  onPrev,
  onNext,
  role,
}: Props) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">

          {/* RAD 1 – navigasjon / view */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sf-border hover:bg-sf-soft"
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
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition
                      ${
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
            >
              →
            </button>
          </div>

          {/* RAD 2 – handlinger (dummy / rollebasert) */}
          {(role === "client" || role === "admin") && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">

              {/* Kunde – legg til time */}
              {role === "client" && (
                <button
                  className="rounded-full bg-[#007C80] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  + Legg til time
                </button>
              )}

{/* Admin – søk (dummy) */}
{role === "admin" && (
  <input
    type="text"
    disabled
    placeholder="Søk etter kunder eller trenere"
    className="w-full max-w-xs rounded-full border border-sf-border bg-sf-soft px-4 py-2 text-sm text-sf-muted outline-none"
  />
)}            
            </div>
          )}
        </div>
      </div>
    </section>
  );
}