"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

function calcRmr(profile: NutritionProfile) {
  const w = profile.weight_kg ?? 0;
  const h = profile.height_cm ?? 0;
  const a = profile.age_years ?? 0;
  const sex = profile.sex;

  if (!w || !h || !a || !sex) return null;

  // Mifflin-St Jeor
  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

function activityFactor(p: NutritionProfile) {
  // enkel, stabil mapping
  const job = p.job_activity ?? "low";
  const tr = p.training_activity ?? "none";

  let factor = 1.2;
  if (job === "medium") factor += 0.1;
  if (job === "high") factor += 0.2;

  if (tr === "light") factor += 0.1;
  if (tr === "moderate") factor += 0.2;
  if (tr === "high") factor += 0.3;

  return Math.min(1.9, factor);
}

export default function Section4DailyNeedsSummary({
  profile,
}: {
  profile: NutritionProfile;
}) {
  const rmr = calcRmr(profile);

  const tdee = rmr ? Math.round(rmr * activityFactor(profile)) : null;

  let calories = tdee;
  if (calories && profile.goal === "lose_fat") calories = Math.round(calories * 0.85);
  if (calories && profile.goal === "gain_muscle") calories = Math.round(calories * 1.1);

  const w = profile.weight_kg ?? 0;

  // Enkle macro-regler (kan tunes senere)
  const protein = w ? Math.round(w * (profile.goal === "gain_muscle" ? 2.0 : 1.8)) : null;
  const fat = w ? Math.round(w * 0.9) : null;

  const carbs =
    calories && protein != null && fat != null
      ? Math.max(0, Math.round((calories - (protein * 4 + fat * 9)) / 4))
      : null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold">Beregnet dagsbehov</h2>

      {!rmr ? (
        <div className="text-sm text-sf-muted">
          Fyll inn kjønn, alder, høyde og vekt for å få beregning.
        </div>
      ) : (
        <div className="text-sm space-y-1">
          <div>
            RMR: <strong>{rmr} kcal</strong>
          </div>
          <div>
            Kalorimål:{" "}
            <strong className="text-sf-primary">{calories} kcal</strong>
          </div>
          <div className="pt-2">Protein: {protein} g</div>
          <div>Fett: {fat} g</div>
          <div>Karbohydrat: {carbs} g</div>
        </div>
      )}
    </section>
  );
}