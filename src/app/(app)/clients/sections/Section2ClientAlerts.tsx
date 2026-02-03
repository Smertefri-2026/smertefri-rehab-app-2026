// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/clients/sections/Section2ClientAlerts.tsx
"use client";

import DashboardCard from "@/components/dashboard/DashboardCard";
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

function cardVariant(count: number) {
  return count === 0 ? ("success" as const) : ("warning" as const);
}

function ClickCard(props: {
  enabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { enabled, onClick, children } = props;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => enabled && onClick()}
      onKeyDown={(e) => e.key === "Enter" && enabled && onClick()}
      className={enabled ? "cursor-pointer" : "cursor-default"}
    >
      {children}
    </div>
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

  return (
    <section className="space-y-3 mt-4">
      <h2 className="text-sm font-semibold text-sf-muted">Varsler</h2>

      {/* ÉN samlet grid = lik spacing overalt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1) Pain stale */}
        <ClickCard enabled={painMissingJournal > 0} onClick={onPainStale}>
          <DashboardCard
            title="Mangler smertejournal"
            status={statusLabel(painMissingJournal, painLoading)}
            icon={
              painMissingJournal === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <HeartPulse size={18} />
              )
            }
            variant={cardVariant(painMissingJournal)}
          >
            <p className="text-sm">Ingen registrering siste 10 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {painMissingJournal > 0 ? "Trykk for å vise listen" : "✓ Alle har oppdatert"}
            </p>
          </DashboardCard>
        </ClickCard>

        {/* 2) Baseline missing */}
        <ClickCard enabled={baselineMissing > 0} onClick={onBaselineMissing}>
          <DashboardCard
            title="Mangler baseline"
            status={statusLabel(baselineMissing, testsLoading)}
            icon={
              baselineMissing === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertTriangle size={18} />
              )
            }
            variant={cardVariant(baselineMissing)}
          >
            <p className="text-sm">Mangler tester i én eller flere kategorier.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {baselineMissing > 0 ? "Trykk for å vise listen" : "✓ Alle har baseline"}
            </p>
          </DashboardCard>
        </ClickCard>

        {/* 3) Nutrition: missing profile */}
        <ClickCard enabled={nutritionMissingProfile > 0} onClick={onNutritionMissingProfile}>
          <DashboardCard
            title="Kosthold: mangler profil"
            status={statusLabel(nutritionMissingProfile, nutLoading)}
            icon={
              nutritionMissingProfile === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <Utensils size={18} />
              )
            }
            variant={cardVariant(nutritionMissingProfile)}
          >
            <p className="text-sm">Ingen rad i nutrition_profiles.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionMissingProfile > 0 ? "Trykk for å vise listen" : "✓ Alle har profil"}
            </p>
          </DashboardCard>
        </ClickCard>

        {/* 4) Hours missing */}
        <ClickCard enabled={trainingHoursMissing > 0} onClick={onHoursMissing}>
          <DashboardCard
            title="Mangler treningstimer"
            status={statusLabel(trainingHoursMissing, hoursLoading)}
            icon={
              trainingHoursMissing === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <CalendarClock size={18} />
              )
            }
            variant={cardVariant(trainingHoursMissing)}
          >
            <p className="text-sm">Ingen kommende booking neste 30 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {trainingHoursMissing > 0 ? "Trykk for å vise listen" : "✓ Alle har kommende timer"}
            </p>
          </DashboardCard>
        </ClickCard>

        {/* 5) Nutrition: no logs 7d */}
        <ClickCard enabled={nutritionNoLogs7d > 0} onClick={onNutritionNoLogs7d}>
          <DashboardCard
            title="Kosthold: ingen logging 7d"
            status={statusLabel(nutritionNoLogs7d, nutLoading)}
            icon={
              nutritionNoLogs7d === 0 ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertTriangle size={18} />
              )
            }
            variant={nutritionNoLogs7d === 0 ? "success" : "danger"}
          >
            <p className="text-sm">Ingen dager med makroer siste 7 dager.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionNoLogs7d > 0 ? "Trykk for å vise listen" : "✓ Alle har logget"}
            </p>
          </DashboardCard>
        </ClickCard>

        {/* 6) Nutrition: logged today */}
        <ClickCard enabled={nutritionLoggedToday > 0} onClick={onNutritionLoggedToday}>
          <DashboardCard
            title="Kosthold: logget i dag"
            status={statusLabel(nutritionLoggedToday, nutLoading)}
            icon={<BarChart size={18} />}
            variant="info"
          >
            <p className="text-sm">Klienter med registrering i dag.</p>
            <p className="mt-2 text-xs text-sf-muted">
              {nutritionLoggedToday > 0 ? "Trykk for å filtrere →" : "✓ Ingen har logget i dag"}
            </p>
          </DashboardCard>
        </ClickCard>
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