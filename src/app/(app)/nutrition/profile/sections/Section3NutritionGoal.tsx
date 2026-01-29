"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

export default function Section3NutritionGoal({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Målsetting</h2>

      <div>
        <label className="text-xs text-sf-muted">Hva er målet ditt?</label>
        <select
          className="w-full rounded-md border p-2"
          value={profile.goal ?? ""}
          onChange={(e) =>
            setProfile((p) =>
              p ? { ...p, goal: (e.target.value || null) as any } : p
            )
          }
        >
          <option value="">Velg…</option>
          <option value="lose_fat">Redusere fett</option>
          <option value="maintain">Vedlikeholde</option>
          <option value="gain_muscle">Øke muskelmasse</option>
        </select>
      </div>
    </section>
  );
}