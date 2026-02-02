// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section2ClientAlerts.tsx
"use client";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { AlertTriangle, CheckCircle2, HeartPulse, Utensils, CalendarClock, BarChart } from "lucide-react";

type Props = {
  painMissingJournal: number;
  baselineMissing: number;

  // Nutrition (3 kort)
  nutritionMissingProfile: number;
  nutritionNoLogs7d: number;
  nutritionLoggedToday: number;

  trainingHoursMissing: number;

  painLoading: boolean;
  testsLoading: boolean;
  nutLoading: boolean; // gjelder både profile + logs
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

function variantForCount(count: number) {
  return count === 0 ? ("success" as const) : ("warning" as const);
}

function variantDangerForCount(count: number) {
  // For "ingen logging" er det ofte mer “kritisk”
  return count === 0 ? ("success" as const) : ("danger" as const);
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

  return (
    <section className="space-y-3 mt-4">
      <h2 className="text-sm font-semibold text-sf-muted">Varsler</h2>

      {/* Rad 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pain */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => painMissingJournal > 0 && onPainStale()}
          onKeyDown={(e) => e.key === "Enter" && painMissingJournal > 0 && onPainStale()}
          className={painMissingJournal > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Mangler smertejournal"
            status={statusLabel(painMissingJournal, painLoading)}
            icon={painMissingJournal === 0 ? <CheckCircle2 size={18} /> : <HeartPulse size={18} />}
            variant={variantForCount(painMissingJournal)}
          >
            <p className="text-sm">Ingen registrering siste 10 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {painMissingJournal > 0 ? "Trykk for å vise listen" : "✓ Alle har oppdatert"}
            </p>
          </DashboardCard>
        </div>

        {/* Tests */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => baselineMissing > 0 && onBaselineMissing()}
          onKeyDown={(e) => e.key === "Enter" && baselineMissing > 0 && onBaselineMissing()}
          className={baselineMissing > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Mangler baseline"
            status={statusLabel(baselineMissing, testsLoading)}
            icon={baselineMissing === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            variant={variantForCount(baselineMissing)}
          >
            <p className="text-sm">Mangler tester i én eller flere kategorier.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {baselineMissing > 0 ? "Trykk for å vise listen" : "✓ Alle har baseline"}
            </p>
          </DashboardCard>
        </div>

        {/* Hours */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => trainingHoursMissing > 0 && onHoursMissing()}
          onKeyDown={(e) => e.key === "Enter" && trainingHoursMissing > 0 && onHoursMissing()}
          className={trainingHoursMissing > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Mangler treningstimer"
            status={statusLabel(trainingHoursMissing, hoursLoading)}
            icon={trainingHoursMissing === 0 ? <CheckCircle2 size={18} /> : <CalendarClock size={18} />}
            variant={variantForCount(trainingHoursMissing)}
          >
            <p className="text-sm">Ingen kommende booking neste 30 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {trainingHoursMissing > 0 ? "Trykk for å vise listen" : "✓ Alle har kommende timer"}
            </p>
          </DashboardCard>
        </div>
      </div>

      {/* Rad 2: Kosthold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Missing profile */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => nutritionMissingProfile > 0 && onNutritionMissingProfile()}
          onKeyDown={(e) => e.key === "Enter" && nutritionMissingProfile > 0 && onNutritionMissingProfile()}
          className={nutritionMissingProfile > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Kosthold: mangler grunnprofil"
            status={statusLabel(nutritionMissingProfile, nutLoading)}
            icon={nutritionMissingProfile === 0 ? <CheckCircle2 size={18} /> : <Utensils size={18} />}
            variant={variantForCount(nutritionMissingProfile)}
          >
            <p className="text-sm">Ingen rad i nutrition_profiles.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionMissingProfile > 0 ? "Trykk for å vise listen" : "✓ Alle har profil"}
            </p>
          </DashboardCard>
        </div>

        {/* No logs 7d */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => nutritionNoLogs7d > 0 && onNutritionNoLogs7d()}
          onKeyDown={(e) => e.key === "Enter" && nutritionNoLogs7d > 0 && onNutritionNoLogs7d()}
          className={nutritionNoLogs7d > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Kosthold: ingen logging (7 dager)"
            status={statusLabel(nutritionNoLogs7d, nutLoading)}
            icon={nutritionNoLogs7d === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            variant={variantDangerForCount(nutritionNoLogs7d)}
          >
            <p className="text-sm">Ingen dager med macros registrert siste 7 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionNoLogs7d > 0 ? "Trykk for å vise listen" : "✓ Alle har logget siste 7 dager"}
            </p>
          </DashboardCard>
        </div>

        {/* Logged today */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => nutritionLoggedToday > 0 && onNutritionLoggedToday()}
          onKeyDown={(e) => e.key === "Enter" && nutritionLoggedToday > 0 && onNutritionLoggedToday()}
          className={nutritionLoggedToday > 0 ? "cursor-pointer" : "cursor-default"}
        >
          <DashboardCard
            title="Kosthold: logget i dag"
            status={statusLabel(nutritionLoggedToday, nutLoading)}
            icon={nutritionLoggedToday === 0 ? <BarChart size={18} /> : <BarChart size={18} />}
            variant="info"
          >
            <p className="text-sm">Antall klienter som har logget i dag.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionLoggedToday > 0 ? "Trykk for å vise listen" : "Ingen har logget i dag"}
            </p>
          </DashboardCard>
        </div>
      </div>

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