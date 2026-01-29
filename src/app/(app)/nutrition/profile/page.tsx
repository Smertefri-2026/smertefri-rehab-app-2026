"use client";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getNutritionProfile,
  upsertNutritionProfile,
  type NutritionProfile,
} from "@/lib/nutritionProfile.api";

import Section1NutritionBasicProfile from "./sections/Section1NutritionBasicProfile";
import Section2ActivityLevel from "./sections/Section2ActivityLevel";
import Section3NutritionGoal from "./sections/Section3NutritionGoal";
import Section4DailyNeedsSummary from "./sections/Section4DailyNeedsSummary";

export default function NutritionProfilePage() {
  const router = useRouter();
  const { userId } = useRole();

  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      try {
        const existing = await getNutritionProfile(userId);
        setProfile(
          existing ?? {
            user_id: userId,
            sex: null,
            age_years: null,
            height_cm: null,
            weight_kg: null,
            job_activity: null,
            training_activity: null,
            goal: null,
          }
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const canSave = !!profile && !saving;

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const saved = await upsertNutritionProfile(profile);
      setProfile(saved);
      alert("Lagret ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppPage
      title="Kosthold – Profil"
      subtitle="Oppdater grunninfo, aktivitetsnivå og mål. Dette brukes til å beregne dagsbehov."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/nutrition")}
            className="rounded-full border border-sf-border bg-white px-4 py-2 text-sm font-medium text-sf-text hover:bg-sf-soft"
          >
            ← Tilbake
          </button>

          <button
            type="button"
            onClick={() => router.push("/nutrition/history")}
            className="rounded-full border border-sf-border bg-white px-4 py-2 text-sm font-medium text-sf-text hover:bg-sf-soft"
            title="Se historikk"
          >
            Historikk
          </button>
        </div>
      }
    >
      {!userId || loading || !profile ? (
        <div className="text-sm text-sf-muted">Laster…</div>
      ) : (
        <div className="space-y-6">
          <Section1NutritionBasicProfile profile={profile} setProfile={setProfile} />
          <Section2ActivityLevel profile={profile} setProfile={setProfile} />
          <Section3NutritionGoal profile={profile} setProfile={setProfile} />
          <Section4DailyNeedsSummary profile={profile} />

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Lagrer…" : "Lagre profil"}
          </button>
        </div>
      )}
    </AppPage>
  );
}