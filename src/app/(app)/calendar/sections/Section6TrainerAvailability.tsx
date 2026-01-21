// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/calendar/sections/Section6TrainerAvailability.tsx
"use client";

import { useEffect, useRef, useState } from "react";

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
  end: string; // "HH:mm"
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

export const emptyAvailability: WeeklyAvailability = {
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
    const rows = (availability[day] ?? []).filter((r) => isHHmm(r.start) && isHHmm(r.end));

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

function mergeWeek(w?: WeeklyAvailability): WeeklyAvailability {
  return { ...emptyAvailability, ...(w ?? {}) };
}

export default function Section6TrainerAvailability({
  initialAvailability,
  onSave = async () => {
    console.warn("onSave ikke koblet – lagring ignorert");
  },
  title = "Ukentlig tilgjengelighet",
  subtitle = "Sett tider du er tilgjengelig for booking. Kun fremtidige bookinger påvirkes.",
}: {
  initialAvailability?: WeeklyAvailability;
  onSave?: (availability: WeeklyAvailability) => Promise<void> | void;
  title?: string;
  subtitle?: string;
}) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(mergeWeek(initialAvailability));
  const [savedSnapshot, setSavedSnapshot] = useState<WeeklyAvailability>(mergeWeek(initialAvailability));

  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // hold ref i sync (så vi kan bruke den i effects uten å trigge reruns)
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // ✅ Sync props → state kun når initialAvailability faktisk endrer seg.
  //    Ikke overskriv hvis bruker redigerer (dirty).
  useEffect(() => {
    if (!initialAvailability) return;

    const merged = mergeWeek(initialAvailability);

    // Hvis bruker redigerer, ikke overskriv det de gjør.
    if (dirtyRef.current) return;

    setAvailability(merged);
    setSavedSnapshot(merged);
    setError(null);
    setSavedMsg(null);
  }, [initialAvailability]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  function addSlot(day: DayKey) {
    setError(null);
    markDirty();
    setAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), { start: "", end: "" }],
    }));
  }

  function updateSlot(day: DayKey, index: number, field: "start" | "end", value: string) {
    markDirty();
    setAvailability((prev) => {
      const updated = [...(prev[day] ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [day]: updated };
    });
  }

  function removeSlot(day: DayKey, index: number) {
    markDirty();
    setAvailability((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((_, i) => i !== index),
    }));
  }

  function resetToSaved() {
    setAvailability(savedSnapshot);
    setDirty(false);
    setError(null);
    setSavedMsg(null);
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
      // ✅ Dette er det vi faktisk vil lagre
      const normalized = mergeWeek(result.normalized);

      // 1) skriv til DB (via parent sin onSave)
      await onSave(normalized);

      // 2) oppdater UI lokalt til “siste lagret”
      setAvailability(normalized);
      setSavedSnapshot(normalized);

      setSavedMsg("Lagret ✅");
      setDirty(false);
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-sf-text">{title}</h3>
              {subtitle ? <p className="text-xs text-sf-muted mt-1">{subtitle}</p> : null}
              {dirty ? <p className="text-[11px] text-amber-700 mt-1">Ulagrede endringer</p> : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetToSaved}
                disabled={!dirty}
                className="rounded-full border border-sf-border px-3 py-2 text-xs disabled:opacity-50"
              >
                Tilbakestill
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Lagrer..." : "Lagre"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {DAYS.map((day) => {
              const slots = availability[day.key] ?? [];

              return (
                <div
                  key={day.key}
                  className="rounded-xl border border-sf-border bg-white px-3 py-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-sf-text">{day.label}</span>
                    {slots.length === 0 ? (
                      <span className="text-xs text-sf-muted whitespace-nowrap">Ikke tilgjengelig</span>
                    ) : (
                      <span className="text-xs text-sf-muted whitespace-nowrap">{slots.length} tidsrom</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {slots.map((slot, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateSlot(day.key, i, "start", e.target.value)}
                            className="rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
                          />
                          <span className="text-sf-muted">–</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateSlot(day.key, i, "end", e.target.value)}
                            className="rounded-lg border border-sf-border bg-sf-soft px-3 py-2 text-sm"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSlot(day.key, i)}
                          className="self-start sm:self-auto rounded-full border border-sf-border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Fjern
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addSlot(day.key)}
                    className="text-xs font-medium text-sf-muted hover:text-sf-text"
                  >
                    + Legg til tidsrom
                  </button>
                </div>
              );
            })}
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {savedMsg && <p className="text-xs text-green-600 text-center">{savedMsg}</p>}

          <p className="text-xs text-sf-muted text-center">
            Kun dager med tider er bookbare. Endringer gjelder kun fremtidige bookinger.
          </p>
        </div>
      </div>
    </section>
  );
}