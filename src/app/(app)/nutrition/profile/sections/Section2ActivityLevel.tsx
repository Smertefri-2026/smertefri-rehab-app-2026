"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

export default function Section2ActivityLevel({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Aktivitetsnivå</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-sf-muted">Aktivitet i jobb</label>
          <select
            className="w-full rounded-md border p-2"
            value={profile.job_activity ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, job_activity: (e.target.value || null) as any } : p
              )
            }
          >
            <option value="">Velg…</option>
            <option value="low">Lite aktiv</option>
            <option value="medium">Moderat</option>
            <option value="high">Fysisk krevende</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-sf-muted">Treningsnivå</label>
          <select
            className="w-full rounded-md border p-2"
            value={profile.training_activity ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, training_activity: (e.target.value || null) as any } : p
              )
            }
          >
            <option value="">Velg…</option>
            <option value="none">0 økter / uke</option>
            <option value="light">1–2 økter / uke</option>
            <option value="moderate">3–5 økter / uke</option>
            <option value="high">6+ økter / uke</option>
          </select>
        </div>
      </div>
    </section>
  );
}