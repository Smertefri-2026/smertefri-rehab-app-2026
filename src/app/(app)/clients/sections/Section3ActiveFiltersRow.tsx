// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section3ActiveFiltersRow.tsx
"use client";

import { X } from "lucide-react";
import type { PainFilterKey } from "@/lib/metrics/usePainMetricsForClients";

type FilterKey =
  | "all"
  | "baseline-missing"
  | "inactive-tests"
  | "negative-progress"
  | "positive-progress";

type NutritionFilterKey = "none" | "missing-profile" | "no-logs-7d" | "logged-today";
type HoursFilterKey = "none" | "missing";

type Props = {
  activeFilter: FilterKey;
  activePain: PainFilterKey;
  activeNutrition: NutritionFilterKey;
  activeHours: HoursFilterKey;

  onClearTest: () => void;
  onClearPain: () => void;
  onClearNutrition: () => void;
  onClearHours: () => void;
  onResetAll: () => void;
};

function labelForTestFilter(key: FilterKey) {
  if (key === "baseline-missing") return "Mangler baseline";
  if (key === "inactive-tests") return "Inaktiv 30+ dager";
  if (key === "negative-progress") return "Negativ progresjon";
  if (key === "positive-progress") return "Positiv progresjon";
  return "Alle";
}

function labelForPain(key: PainFilterKey) {
  if (key === "high") return "Høy smerte";
  if (key === "up") return "Økende smerte";
  if (key === "stale") return "Mangler smertejournal";
  return "Smerte";
}

function labelForNutrition(key: NutritionFilterKey) {
  if (key === "missing-profile") return "Kosthold: mangler grunnprofil";
  if (key === "no-logs-7d") return "Kosthold: ingen logging 7 dager";
  if (key === "logged-today") return "Kosthold: logget i dag";
  return "Kosthold";
}

export default function Section3ActiveFiltersRow(props: Props) {
  const {
    activeFilter,
    activePain,
    activeNutrition,
    activeHours,
    onClearTest,
    onClearPain,
    onClearNutrition,
    onClearHours,
    onResetAll,
  } = props;

  const anyActive =
    activeFilter !== "all" ||
    activePain !== "none" ||
    activeNutrition !== "none" ||
    activeHours !== "none";

  if (!anyActive) return null;

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-sf-muted mr-1">Aktive filtre:</span>

        {activeFilter !== "all" && (
          <button
            onClick={onClearTest}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium border-[#007C80] bg-[#E6F3F6] text-[#007C80]"
            title="Fjern testfilter"
          >
            {labelForTestFilter(activeFilter)}
            <X size={14} />
          </button>
        )}

        {activePain !== "none" && (
          <button
            onClick={onClearPain}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium border-[#007C80] bg-[#E6F3F6] text-[#007C80]"
            title="Fjern smertefilter"
          >
            {labelForPain(activePain)}
            <X size={14} />
          </button>
        )}

        {activeNutrition !== "none" && (
          <button
            onClick={onClearNutrition}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium border-[#007C80] bg-[#E6F3F6] text-[#007C80]"
            title="Fjern kostholdfilter"
          >
            {labelForNutrition(activeNutrition)}
            <X size={14} />
          </button>
        )}

        {activeHours !== "none" && (
          <button
            onClick={onClearHours}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium border-[#007C80] bg-[#E6F3F6] text-[#007C80]"
            title="Fjern timefilter"
          >
            Timer: mangler kommende
            <X size={14} />
          </button>
        )}

        <button
          onClick={onResetAll}
          className="ml-auto rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          title="Nullstill alle filtre"
        >
          Nullstill
        </button>
      </div>
    </section>
  );
}