"use client";

import { useEffect, useState } from "react";
import { getClientOnboarding } from "@/lib/onboarding.api";
import type { OnboardingRow } from "@/lib/onboarding.api";

const ROW_LABEL: Record<string, string> = {
  problem_area: "Hovedplage",
  problem_duration: "Varighet",
  pain_intensity_now: "Smerte nå",
  aggravating_factors: "Gjør det verre",
  relieving_factors: "Gjør det bedre",
  limiting_factors: "Hindrer deg i",
  activity_level: "Aktivitetsnivå",
  fear_of_movement_score: "Frykt for bevegelse",
  sleep_quality: "Søvn",
  stress_level: "Stress",
  previous_injuries: "Tidligere skader",
  previous_treatment: "Tidligere behandling",
};

/** Rehabtrener/admin: kundens kartleggingssvar, kort og lesbart på kundekortet. */
export default function ClientOnboardingSummary({ clientId }: { clientId: string }) {
  const [row, setRow] = useState<OnboardingRow | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    getClientOnboarding(clientId)
      .then((r) => alive && setRow(r))
      .catch(() => alive && setRow(null));
    return () => {
      alive = false;
    };
  }, [clientId]);

  if (row === undefined) return null;

  if (!row) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-soft">Kartlegging</h2>
        <p className="mt-2 text-sm text-ink-faint">Kunden har ikke fullført kartleggingen ennå.</p>
      </section>
    );
  }

  const rows: Array<[string, string | number | null]> = [
    ["problem_area", row.problem_area],
    ["problem_duration", row.problem_duration],
    ["pain_intensity_now", row.pain_intensity_now != null ? `${row.pain_intensity_now}/10` : null],
    ["activity_level", row.activity_level],
    ["fear_of_movement_score", row.fear_of_movement_score != null ? `${row.fear_of_movement_score}/10` : null],
    ["sleep_quality", row.sleep_quality],
    ["stress_level", row.stress_level],
  ];
  const expandedRows: Array<[string, string | number | null]> = [
    ["aggravating_factors", row.aggravating_factors],
    ["relieving_factors", row.relieving_factors],
    ["limiting_factors", row.limiting_factors],
    ["previous_injuries", row.previous_injuries],
    ["previous_treatment", row.previous_treatment],
  ];

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Kartlegging</h2>
        {!row.red_flag_cleared && (
          <span className="rounded-full bg-danger-subtle px-2.5 py-0.5 text-xs font-medium text-danger-ink">
            Uavklart trygghetssjekk
          </span>
        )}
      </div>

      {row.goal && (
        <p className="text-sm text-ink">
          <span className="text-ink-faint">Mål: </span>
          {row.goal}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {rows.map(([key, value]) =>
          value ? (
            <div key={key}>
              <dt className="text-xs text-ink-faint">{ROW_LABEL[key]}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ) : null
        )}
      </dl>

      {expanded && (
        <dl className="grid grid-cols-1 gap-y-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
          {expandedRows.map(([key, value]) =>
            value ? (
              <div key={key}>
                <dt className="text-xs text-ink-faint">{ROW_LABEL[key]}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ) : null
          )}
        </dl>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-xs font-medium text-primary-ink hover:underline"
      >
        {expanded ? "Vis mindre" : "Vis mer"}
      </button>
    </section>
  );
}
