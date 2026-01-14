"use client";

import { useState } from "react";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TimeRange = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

export type WeeklyAvailability = Record<DayKey, TimeRange[]>;

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
];

const emptyAvailability: WeeklyAvailability = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

function isHHmm(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function overlaps(a: TimeRange, b: TimeRange) {
  return a.start < b.end && a.end > b.start;
}

function validateWeekly(
  availability: WeeklyAvailability
): { ok: true; normalized: WeeklyAvailability } | { ok: false; message: string } {
  const normalized: WeeklyAvailability = { ...emptyAvailability };

  for (const day of Object.keys(emptyAvailability) as DayKey[]) {
    const rows = (availability[day] ?? []).filter(
      (r) => isHHmm(r.start) && isHHmm(r.end)
    );

    for (const r of rows) {
      if (r.start >= r.end) {
        return { ok: false, message: "Starttid må være før sluttid." };
      }
    }

    const sorted = [...rows].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (overlaps(sorted[i], sorted[i + 1])) {
        return { ok: false, message: "Nytt tidsrom overlapper med eksisterende." };
      }
    }

    normalized[day] = sorted;
  }

  return { ok: true, normalized };
}

export default function Section6TrainerAvailability({
  initialAvailability,
  onSave = async () => {
    // 🔒 Permanent, trygg default
    console.warn("onSave ikke koblet – lagring ignorert");
  },
  title = "Ukentlig tilgjengelighet",
}: {
  initialAvailability?: WeeklyAvailability;
  onSave?: (availability: WeeklyAvailability) => Promise<void> | void;
  title?: string;
}) {
  const [availability, setAvailability] = useState<WeeklyAvailability>({
    ...emptyAvailability,
    ...(initialAvailability ?? {}),
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function addSlot(day: DayKey) {
    setError(null);
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "", end: "" }],
    }));
  }

  function updateSlot(
    day: DayKey,
    index: number,
    field: "start" | "end",
    value: string
  ) {
    setAvailability((prev) => {
      const updated = [...prev[day]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [day]: updated };
    });
  }

  function removeSlot(day: DayKey, index: number) {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSavedMsg(null);

    const result = validateWeekly(availability);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave(result.normalized); // ← ALLTID trygt nå
      setSavedMsg("Lagret ✅");
    } catch (e: any) {
      setError(e?.message || "Kunne ikke lagre. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-center">{title}</h3>

          <div className="space-y-2">
            {DAYS.map((day) => {
              const slots = availability[day.key];

              return (
                <div
                  key={day.key}
                  className="rounded-lg border border-sf-border px-3 py-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.label}</span>
                    {slots.length === 0 && (
                      <span className="text-xs text-sf-muted">
                        Ikke tilgjengelig
                      </span>
                    )}
                  </div>

                  {slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateSlot(day.key, i, "start", e.target.value)
                        }
                        className="rounded-md bg-sf-soft px-2 py-1"
                      />
                      <span>–</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateSlot(day.key, i, "end", e.target.value)
                        }
                        className="rounded-md bg-sf-soft px-2 py-1"
                      />
                      <button
                        onClick={() => removeSlot(day.key, i)}
                        className="text-xs text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSlot(day.key)}
                    className="text-xs text-sf-muted"
                  >
                    + Legg til tidsrom
                  </button>
                </div>
              );
            })}
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {savedMsg && <p className="text-xs text-green-600 text-center">{savedMsg}</p>}

          <div className="text-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer..." : "Lagre tilgjengelighet"}
            </button>
          </div>

          <p className="text-xs text-sf-muted text-center">
            Kun dager med tider er bookbare. Endringer gjelder kun fremtidige bookinger.
          </p>
        </div>
      </div>
    </section>
  );
}