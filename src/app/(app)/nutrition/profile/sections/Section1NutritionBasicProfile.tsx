"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

export default function Section1NutritionBasicProfile({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  const missing = [
    !profile.sex ? "kjønn" : null,
    !profile.age_years ? "alder" : null,
    !profile.height_cm ? "høyde" : null,
    !profile.weight_kg ? "vekt" : null,
  ].filter(Boolean) as string[];

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Grunnprofil</h2>
          <div className="text-xs text-sf-muted">
            Brukes i beregning av <span className="font-medium text-sf-text">BMR</span> og{" "}
            <span className="font-medium text-sf-text">dagsbehov</span>.
          </div>
        </div>

        <span className="text-[11px] rounded-full border border-sf-border px-2 py-0.5 text-sf-muted">
          Kilde: Profil
        </span>
      </div>

      {missing.length ? (
        <div className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4 text-xs text-sf-muted">
          <span className="font-semibold text-sf-text">Tips:</span> Fyll inn{" "}
          <span className="font-medium text-sf-text">{missing.join(", ")}</span> for å få full beregning.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kjønn */}
        <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4 space-y-2">
          <label className="text-xs text-sf-muted">Kjønn</label>
          <select
            className="w-full rounded-xl border border-sf-border bg-white p-3 text-sm"
            value={profile.sex ?? ""}
            onChange={(e) =>
              setProfile((p) => (p ? { ...p, sex: (e.target.value || null) as any } : p))
            }
          >
            <option value="">Velg…</option>
            <option value="male">Mann</option>
            <option value="female">Kvinne</option>
          </select>
          <div className="text-[11px] text-sf-muted">Brukes i Mifflin–St Jeor-formelen.</div>
        </div>

        {/* Alder */}
        <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4 space-y-2">
          <label className="text-xs text-sf-muted">Alder (år)</label>
          <input
            inputMode="numeric"
            type="number"
            min={1}
            className="w-full rounded-xl border border-sf-border bg-white p-3 text-sm"
            value={profile.age_years ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, age_years: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 32"
          />
          <div className="text-[11px] text-sf-muted">Påvirker BMR direkte.</div>
        </div>

        {/* Høyde */}
        <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4 space-y-2">
          <label className="text-xs text-sf-muted">Høyde (cm)</label>
          <input
            inputMode="numeric"
            type="number"
            min={50}
            className="w-full rounded-xl border border-sf-border bg-white p-3 text-sm"
            value={profile.height_cm ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, height_cm: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 188"
          />
          <div className="text-[11px] text-sf-muted">Høyere høyde → litt høyere BMR.</div>
        </div>

        {/* Vekt */}
        <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4 space-y-2">
          <label className="text-xs text-sf-muted">Vekt (kg)</label>
          <input
            inputMode="decimal"
            type="number"
            min={1}
            step="0.1"
            className="w-full rounded-xl border border-sf-border bg-white p-3 text-sm"
            value={profile.weight_kg ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, weight_kg: e.target.value ? Number(e.target.value) : null } : p
              )
            }
            placeholder="f.eks. 105"
          />
          <div className="text-[11px] text-sf-muted">
            Brukes også til makroer (g/kg) i dagsbehov.
          </div>
        </div>
      </div>
    </section>
  );
}