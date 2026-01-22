// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/sections/Section1PainSelector.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useMemo } from "react";

type Area = { key: string; label: string };

type Props = {
  areas: Area[];
  selectedKey: string | null;
  onSelect: (area: Area | null) => void;
};

export default function Section1PainSelector({
  areas,
  selectedKey,
  onSelect,
}: Props) {
  const selected = useMemo(
    () => areas.find((a) => a.key === selectedKey) ?? null,
    [areas, selectedKey]
  );

  // ✅ Tving state-update selv om samme område velges igjen
  const pick = (area: Area) => {
    onSelect({ ...area }); // ny referanse hver gang
  };

  // ✅ Mobil: hvis de allerede har valgt området, kan de trykke “Registrer i dag”
  // Dette håndterer at <select> ikke trigger onChange når du velger samme verdi igjen
  const forceReopenSelected = () => {
    if (!selected) return;
    onSelect(null);
    requestAnimationFrame(() => pick(selected));
  };

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Hvor har du vondt?</h2>
            <p className="text-sm text-sf-muted">
              Velg et område for å registrere smerte og oppfølging.
            </p>
          </div>

          {selected ? (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-sm text-sf-muted hover:text-sf-text"
            >
              Nullstill
            </button>
          ) : null}
        </div>

        {/* 📱 Mobil: dropdown */}
        <div className="md:hidden space-y-3">
          <div className="relative">
            <select
              value={selectedKey ?? ""}
              onChange={(e) => {
                const key = e.target.value;
                const a = areas.find((x) => x.key === key) ?? null;
                onSelect(a ? { ...a } : null);
              }}
              className="w-full appearance-none rounded-xl border border-sf-border bg-white px-4 py-3 text-sm"
            >
              <option value="">Velg område…</option>
              {areas.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              size={18}
            />
          </div>

          {selected ? (
            <button
              type="button"
              onClick={forceReopenSelected}
              className="w-full rounded-xl bg-sf-primary px-4 py-3 text-sm font-medium text-white"
            >
              Registrer i dag for {selected.label}
            </button>
          ) : null}
        </div>

        {/* 🖥️ Desktop: knapper */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
          {areas.map((area) => {
            const active = area.key === selectedKey;
            return (
              <button
                key={area.key}
                type="button"
                onClick={() => pick(area)}
                className={[
                  "flex items-center justify-between rounded-full border px-5 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[#007C80] text-white border-transparent"
                    : "border-sf-border hover:bg-sf-soft",
                ].join(" ")}
              >
                <span>{area.label}</span>
                <span className={active ? "opacity-90" : "text-sf-muted"}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}