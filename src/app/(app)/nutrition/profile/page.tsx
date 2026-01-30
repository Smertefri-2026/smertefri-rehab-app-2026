"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useEffect, useState } from "react";

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
  const { userId } = useRole();

  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

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
    setSavedTick(false);

    try {
      const saved = await upsertNutritionProfile(profile);
      setProfile(saved);
      setSavedTick(true);
      window.setTimeout(() => setSavedTick(false), 1800);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          {/* Topp-navigasjon (samme stil/posisjon som history) */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/nutrition"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
            >
              ← Tilbake
            </Link>

            <Link
              href="/nutrition/history"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
              title="Se historikk"
            >
              Historikk
            </Link>
          </div>

          {/* Header-boks */}
          <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-2">
            <h1 className="text-base font-semibold text-sf-text">Kosthold – Profil</h1>
            <p className="text-sm text-sf-muted">
              Oppdater grunninfo, aktivitetsnivå og mål. Dette brukes til å beregne dagsbehov (BMR × PAL).
            </p>
          </section>

          {!userId || loading || !profile ? (
            <div className="text-sm text-sf-muted">Laster…</div>
          ) : (
            <div className="space-y-6">
              <Section1NutritionBasicProfile profile={profile} setProfile={setProfile} />
              <Section2ActivityLevel profile={profile} setProfile={setProfile} />

              {/* ✅ Ingen tdeeKcal-prop – Section3 bruker calcTdee(profile) selv */}
              <Section3NutritionGoal profile={profile} setProfile={setProfile} />

              {/* ✅ Samme calcTdee-util brukes her også */}
              <Section4DailyNeedsSummary profile={profile} />

              <button
                onClick={handleSave}
                disabled={!canSave}
                className="w-full rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Lagrer…" : savedTick ? "Lagret ✅" : "Lagre profil"}
              </button>
            </div>
          )}
        </div>
      </AppPage>
    </div>
  );
}