"use client";

import type { NutritionProfile } from "@/lib/nutritionProfile.api";

function jobAddon(job: NutritionProfile["job_activity"]) {
  if (job === "medium") return 0.1;
  if (job === "high") return 0.2;
  return 0;
}

function trainingAddon(tr: NutritionProfile["training_activity"]) {
  if (tr === "light") return 0.1;
  if (tr === "moderate") return 0.2;
  if (tr === "high") return 0.3;
  return 0;
}

function niceJob(job: NutritionProfile["job_activity"]) {
  if (job === "high") return "Fysisk krevende";
  if (job === "medium") return "Moderat";
  return "Lite aktiv";
}

function niceTraining(tr: NutritionProfile["training_activity"]) {
  if (tr === "high") return "6+ økter/uke";
  if (tr === "moderate") return "3–5 økter/uke";
  if (tr === "light") return "1–2 økter/uke";
  return "0 økter/uke";
}

function jobHint(job: NutritionProfile["job_activity"]) {
  if (job === "high")
    return "Mye gåing/løft, fysisk arbeid store deler av dagen.";
  if (job === "medium")
    return "En del gåing/aktivitet i løpet av dagen, men ikke tungt fysisk.";
  return "Mest stillesittende, lite daglig bevegelse i jobben.";
}

function trainingHint(tr: NutritionProfile["training_activity"]) {
  if (tr === "high")
    return "Hyppig trening, ofte kombinasjon av styrke/kondisjon.";
  if (tr === "moderate")
    return "Regelmessig trening flere ganger i uken.";
  if (tr === "light")
    return "Lett/periodisk trening, 1–2 økter i uken.";
  return "Ingen planlagt trening (hverdagsaktivitet teller fortsatt).";
}

function palFromProfile(p: NutritionProfile) {
  const base = 1.2;
  const job = p.job_activity ?? "low";
  const tr = p.training_activity ?? "none";
  return Math.min(1.9, base + jobAddon(job) + trainingAddon(tr));
}

export default function Section2ActivityLevel({
  profile,
  setProfile,
}: {
  profile: NutritionProfile;
  setProfile: React.Dispatch<React.SetStateAction<NutritionProfile | null>>;
}) {
  const job = (profile.job_activity ?? "low") as NutritionProfile["job_activity"];
  const tr = (profile.training_activity ?? "none") as NutritionProfile["training_activity"];

  const basePal = 1.2;
  const jAdd = jobAddon(job);
  const tAdd = trainingAddon(tr);
  const pal = palFromProfile(profile);

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Aktivitetsnivå</h2>
        <span className="text-[11px] text-sf-muted">Påvirker PAL og dagsbehov</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jobb */}
        <div className="space-y-2">
          <label className="text-xs text-sf-muted">Aktivitet i jobb</label>
          <select
            className="w-full rounded-md border border-sf-border bg-white p-2 text-sm"
            value={profile.job_activity ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, job_activity: (e.target.value || null) as any } : p
              )
            }
          >
            <option value="">Velg…</option>
            <option value="low">Lite aktiv (stillesittende)</option>
            <option value="medium">Moderat (en del gåing)</option>
            <option value="high">Fysisk krevende (mye aktivt arbeid)</option>
          </select>

          <div className="rounded-xl border border-sf-border bg-[#F7FBFB] p-3 text-xs space-y-1">
            <div className="font-semibold text-sf-text">{niceJob(job)}</div>
            <div className="text-sf-muted">{jobHint(job)}</div>
            <div className="text-[11px] text-sf-muted">
              Bidrag til PAL: <span className="font-semibold text-sf-text">+{jAdd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trening */}
        <div className="space-y-2">
          <label className="text-xs text-sf-muted">Treningsnivå</label>
          <select
            className="w-full rounded-md border border-sf-border bg-white p-2 text-sm"
            value={profile.training_activity ?? ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, training_activity: (e.target.value || null) as any } : p
              )
            }
          >
            <option value="">Velg…</option>
            <option value="none">0 økter/uke</option>
            <option value="light">1–2 økter/uke</option>
            <option value="moderate">3–5 økter/uke</option>
            <option value="high">6+ økter/uke</option>
          </select>

          <div className="rounded-xl border border-sf-border bg-[#F7FBFB] p-3 text-xs space-y-1">
            <div className="font-semibold text-sf-text">{niceTraining(tr)}</div>
            <div className="text-sf-muted">{trainingHint(tr)}</div>
            <div className="text-[11px] text-sf-muted">
              Bidrag til PAL: <span className="font-semibold text-sf-text">+{tAdd.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live PAL preview */}
      <div className="rounded-xl border border-sf-border bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-sf-text">Aktivitetsfaktor (PAL)</div>
          <div className="text-sm font-semibold text-sf-primary">{pal.toFixed(2)}</div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-sf-border bg-[#FBFEFE] p-2">
            <div className="text-[11px] text-sf-muted">Base</div>
            <div className="text-sm font-semibold text-sf-text">{basePal.toFixed(2)}</div>
          </div>

          <div className="rounded-lg border border-sf-border bg-[#FBFEFE] p-2">
            <div className="text-[11px] text-sf-muted">Jobb</div>
            <div className="text-sm font-semibold text-sf-text">+{jAdd.toFixed(2)}</div>
          </div>

          <div className="rounded-lg border border-sf-border bg-[#FBFEFE] p-2">
            <div className="text-[11px] text-sf-muted">Trening</div>
            <div className="text-sm font-semibold text-sf-text">+{tAdd.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-sf-muted">
          PAL brukes i beregningen: <span className="font-medium text-sf-text">TDEE = RMR × PAL</span>.
          (PAL her er en enkel, stabil modell – lett å forstå og funker bra i app.)
        </div>
      </div>
    </section>
  );
}