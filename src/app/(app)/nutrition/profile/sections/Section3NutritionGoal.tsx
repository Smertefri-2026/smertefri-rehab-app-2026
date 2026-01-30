"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";
import { calcTdee } from "@/modules/nutrition/calc";

function metaForGoal(goal: NutritionProfile["goal"]) {
  if (goal === "lose_fat") {
    return {
      title: "Negativ energibalanse",
      tweakLabel: "−15%",
      tweakFactor: 0.85,
      note: "Moderat energiunderskudd over tid. Målet er fettreduksjon/vekttap.",
    };
  }
  if (goal === "gain_muscle") {
    return {
      title: "Positiv energibalanse",
      tweakLabel: "+10%",
      tweakFactor: 1.1,
      note: "Lite energioverskudd + styrketrening for å støtte muskelvekst.",
    };
  }
  if (goal === "maintain") {
    return {
      title: "Energibalanse",
      tweakLabel: "0%",
      tweakFactor: 1.0,
      note: "Du sikter mot vektstabilitet – energi inn ≈ energi ut.",
    };
  }
  return null;
}

export default function Section3NutritionGoal({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  const meta = metaForGoal(profile.goal);
  const { tdee } = calcTdee(profile);

  const adjusted = meta && tdee != null ? Math.round(tdee * meta.tweakFactor) : null;
  const delta = tdee != null && adjusted != null ? adjusted - tdee : null;

  const factorText = meta ? `×${meta.tweakFactor.toFixed(2)}` : "";

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Målsetting</h2>
          <div className="text-xs text-sf-muted">
            Dette styrer hvordan kalorimålet justeres fra beregnet energibehov (TDEE).
          </div>
        </div>

        <span className="text-[11px] rounded-full border border-sf-border px-2 py-0.5 text-sf-muted">
          Transparent logikk
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sf-muted">Hva er målet ditt?</label>
        <select
          className="w-full rounded-xl border border-sf-border bg-white p-3 text-sm"
          value={profile.goal ?? ""}
          onChange={(e) =>
            setProfile((p) => (p ? { ...p, goal: (e.target.value || null) as any } : p))
          }
        >
          <option value="">Velg…</option>
          <option value="lose_fat">Vektreduksjon (redusere fett)</option>
          <option value="maintain">Vektstabilitet / allment god helse</option>
          <option value="gain_muscle">Muskelvekst (ofte vektoppgang)</option>
        </select>

        {meta ? (
          <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-sf-text">{meta.title}</div>
              <span className="rounded-full border border-sf-border bg-white px-2 py-0.5 text-[11px] text-sf-muted">
                {meta.tweakLabel} ({factorText}) av TDEE
              </span>
            </div>

            <div className="text-xs text-sf-muted">{meta.note}</div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                <div className="text-[11px] text-sf-muted">TDEE</div>
                <div className="mt-1 text-sm font-semibold text-sf-text">{tdee ?? "—"} kcal</div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                <div className="text-[11px] text-sf-muted">Justering</div>
                <div className="mt-1 text-sm font-semibold text-sf-text">
                  {delta == null ? "—" : delta > 0 ? `+${delta}` : `${delta}`} kcal
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                <div className="text-[11px] text-sf-muted">Kalorimål</div>
                <div className="mt-1 text-sm font-semibold text-sf-primary">
                  {adjusted ?? "—"} kcal
                </div>
              </div>
            </div>

            {tdee == null ? (
              <div className="rounded-xl border border-sf-border bg-white p-3 text-[11px] text-sf-muted">
                Tips: Fyll inn grunnprofil + aktivitetsnivå for å få TDEE, så vises kalorimålet her.
              </div>
            ) : (
              <div className="text-[11px] text-sf-muted">
                Formelen er enkel:{" "}
                <span className="font-medium text-sf-text">
                  Kalorimål = TDEE × {meta.tweakFactor.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-sf-muted">
            Velg et mål for å se hvordan kalorimålet justeres (−15% / 0% / +10%).
          </div>
        )}
      </div>
    </section>
  );
}