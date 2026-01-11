"use client";

import { useState } from "react";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
];

export default function Section6TrainerAvailability() {
  const [activeDays, setActiveDays] = useState<DayKey[]>([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">

          {/* 🔹 Tittel */}
          <h3 className="text-sm font-semibold text-center">
            Ukentlig tilgjengelighet
          </h3>

          {/* 🔹 Dagliste */}
          <div className="space-y-2">
            {DAYS.map((day) => {
              const enabled = activeDays.includes(day.key);

              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between rounded-lg border border-sf-border px-3 py-2"
                >
                  {/* Dag */}
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => {
                        setActiveDays((prev) =>
                          enabled
                            ? prev.filter((d) => d !== day.key)
                            : [...prev, day.key]
                        );
                      }}
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>

                  {/* Tidsrom (dummy) */}
                  {enabled ? (
                    <div className="flex items-center gap-2 text-sm text-sf-muted">
                      <span className="rounded-md bg-sf-soft px-2 py-1">
                        07:00
                      </span>
                      <span>–</span>
                      <span className="rounded-md bg-sf-soft px-2 py-1">
                        20:00
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-sf-muted">
                      Ikke tilgjengelig
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 🔹 Infotekst */}
          <p className="text-xs text-sf-muted text-center">
            Dette er en visuell forhåndsvisning. Faktisk lagring og
            bookingregler kobles på senere.
          </p>

        </div>
      </div>
    </section>
  );
}