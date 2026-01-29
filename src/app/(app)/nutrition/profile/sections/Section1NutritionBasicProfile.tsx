"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

export default function Section1NutritionBasicProfile({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold">Grunnprofil</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-sf-muted">Kjønn</label>
          <select
            className="w-full rounded-md border p-2"
            value={profile.sex ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, sex: (e.target.value || null) as any } : p
              )
            }
          >
            <option value="">Velg…</option>
            <option value="male">Mann</option>
            <option value="female">Kvinne</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-sf-muted">Alder</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={profile.age_years ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, age_years: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 32"
          />
        </div>

        <div>
          <label className="text-xs text-sf-muted">Høyde (cm)</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={profile.height_cm ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, height_cm: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 188"
          />
        </div>

        <div>
          <label className="text-xs text-sf-muted">Vekt (kg)</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={profile.weight_kg ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, weight_kg: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 105"
          />
        </div>
      </div>
    </section>
  );
}