// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section2ClientAlerts.tsx
"use client";

import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Utensils,
  CalendarClock,
  BarChart,
} from "lucide-react";

type Props = {
  painMissingJournal: number;
  baselineMissing: number;

  nutritionMissingProfile: number;
  nutritionNoLogs7d: number;
  nutritionLoggedToday: number;

  trainingHoursMissing: number;

  painLoading: boolean;
  testsLoading: boolean;
  nutLoading: boolean;
  hoursLoading: boolean;

  testsError?: string | null;
  painError?: string | null;
  nutError?: string | null;
  hoursError?: string | null;

  onPainStale: () => void;
  onBaselineMissing: () => void;

  onNutritionMissingProfile: () => void;
  onNutritionNoLogs7d: () => void;
  onNutritionLoggedToday: () => void;

  onHoursMissing: () => void;
};

function statusLabel(count: number, loading: boolean) {
  if (loading) return "…";
  return count === 0 ? "✓" : String(count);
}

function statusTone(count: number) {
  // Litt enkel: ✓ = grønn, >0 = gul, men noen kan være "rød"
  return count === 0 ? "ok" : "warn";
}

function QuickTile(props: {
  title: string;
  icon: React.ReactNode;
  status: string;
  tone?: "ok" | "warn" | "danger" | "info";
  enabled: boolean;
  onClick: () => void;
}) {
  const { title, icon, status, tone = "warn", enabled, onClick } = props;

  const toneClasses =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "danger"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "info"
      ? "border-sky-200 bg-sky-50 text-sky-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  const statusClasses =
    tone === "ok"
      ? "bg-emerald-600"
      : tone === "danger"
      ? "bg-red-600"
      : tone === "info"
      ? "bg-sky-600"
      : "bg-amber-600";

  return (
    <button
      type="button"
      onClick={() => enabled && onClick()}
      disabled={!enabled}
      className={[
        "min-w-[220px] sm:min-w-0",
        "w-full",
        "rounded-2xl border px-3 py-2",
        "flex items-center gap-3",
        "text-left",
        toneClasses,
        enabled ? "hover:brightness-[0.98] active:brightness-[0.96]" : "opacity-60 cursor-default",
        "transition",
      ].join(" ")}
      title={enabled ? "Åpne liste" : "Ingen funn"}
    >
      <div className="shrink-0">{icon}</div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{title}</div>
      </div>

      <div
        className={[
          "shrink-0",
          "h-7 min-w-[2.25rem] px-2",
          "rounded-full",
          "flex items-center justify-center",
          "text-xs font-semibold text-white",
          statusClasses,
        ].join(" ")}
      >
        {status}
      </div>
    </button>
  );
}

export default function Section2ClientAlerts(props: Props) {
  const {
    painMissingJournal,
    baselineMissing,
    nutritionMissingProfile,
    nutritionNoLogs7d,
    nutritionLoggedToday,
    trainingHoursMissing,
    painLoading,
    testsLoading,
    nutLoading,
    hoursLoading,
    testsError,
    painError,
    nutError,
    hoursError,
    onPainStale,
    onBaselineMissing,
    onNutritionMissingProfile,
    onNutritionNoLogs7d,
    onNutritionLoggedToday,
    onHoursMissing,
  } = props;

  // “enabled” = har avvik (og dermed skal vises)
  const enabledPain = painMissingJournal > 0;
  const enabledBaseline = baselineMissing > 0;
  const enabledNutProfile = nutritionMissingProfile > 0;
  const enabledHours = trainingHoursMissing > 0;
  const enabledNutNoLogs = nutritionNoLogs7d > 0;
  const enabledNutToday = nutritionLoggedToday > 0;

  const anyVisible =
    enabledPain ||
    enabledBaseline ||
    enabledNutProfile ||
    enabledHours ||
    enabledNutNoLogs ||
    enabledNutToday;

  // Hvis ingenting å vise: skjul hele seksjonen (men behold errors hvis du vil)
  if (!anyVisible && !(testsError || painError || nutError || hoursError)) {
    return null;
  }

  return (
    <section className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sf-muted">Varsler</h2>
      </div>

      {/* Hurtigmeny: horisontal på mobil, grid på større skjermer */}
      {anyVisible ? (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
          {enabledPain ? (
            <QuickTile
              title="Mangler smertejournal"
              icon={<HeartPulse size={18} />}
              status={statusLabel(painMissingJournal, painLoading)}
              tone={statusTone(painMissingJournal) === "ok" ? "ok" : "warn"}
              enabled={enabledPain}
              onClick={onPainStale}
            />
          ) : null}

          {enabledBaseline ? (
            <QuickTile
              title="Mangler baseline"
              icon={<AlertTriangle size={18} />}
              status={statusLabel(baselineMissing, testsLoading)}
              tone={statusTone(baselineMissing) === "ok" ? "ok" : "warn"}
              enabled={enabledBaseline}
              onClick={onBaselineMissing}
            />
          ) : null}

          {enabledNutProfile ? (
            <QuickTile
              title="Kosthold: mangler profil"
              icon={<Utensils size={18} />}
              status={statusLabel(nutritionMissingProfile, nutLoading)}
              tone={statusTone(nutritionMissingProfile) === "ok" ? "ok" : "warn"}
              enabled={enabledNutProfile}
              onClick={onNutritionMissingProfile}
            />
          ) : null}

          {enabledHours ? (
            <QuickTile
              title="Mangler treningstimer"
              icon={<CalendarClock size={18} />}
              status={statusLabel(trainingHoursMissing, hoursLoading)}
              tone={statusTone(trainingHoursMissing) === "ok" ? "ok" : "warn"}
              enabled={enabledHours}
              onClick={onHoursMissing}
            />
          ) : null}

          {enabledNutNoLogs ? (
            <QuickTile
              title="Kosthold: ingen logging 7d"
              icon={<AlertTriangle size={18} />}
              status={statusLabel(nutritionNoLogs7d, nutLoading)}
              tone="danger"
              enabled={enabledNutNoLogs}
              onClick={onNutritionNoLogs7d}
            />
          ) : null}

          {enabledNutToday ? (
            <QuickTile
              title="Kosthold: logget i dag"
              icon={<BarChart size={18} />}
              status={statusLabel(nutritionLoggedToday, nutLoading)}
              tone="info"
              enabled={enabledNutToday}
              onClick={onNutritionLoggedToday}
            />
          ) : null}
        </div>
      ) : null}

      {(testsError || painError || nutError || hoursError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-1">
          {testsError ? <div>Test-metrics: {testsError}</div> : null}
          {painError ? <div>Pain-metrics: {painError}</div> : null}
          {nutError ? <div>Nutrition-metrics: {nutError}</div> : null}
          {hoursError ? <div>Hours-metrics: {hoursError}</div> : null}
        </div>
      )}
    </section>
  );
}