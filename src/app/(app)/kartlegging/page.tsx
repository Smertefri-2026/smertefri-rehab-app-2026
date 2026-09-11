"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ShieldAlert, ShieldCheck } from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { Button } from "@/ui/components/Button";
import { Field, Input, Textarea } from "@/ui/components/Field";
import { ChoiceGroup } from "@/ui/components/ChoiceGroup";
import { RED_FLAG_QUESTIONS } from "@/lib/onboarding/redFlags";
import { CALIBRATION_LABEL, CALIBRATION_DESCRIPTION } from "@/lib/onboarding/calibration";
import {
  getMyOnboarding,
  getOnboardingHistory,
  updateOnboardingSection,
  updateRedFlags,
  type OnboardingRow,
  type OnboardingHistoryRow,
} from "@/lib/onboarding.api";

const AREA_LABEL: Record<string, string> = {
  rygg: "Rygg / korsrygg",
  nakke: "Nakke",
  skulder: "Skulder",
  hofte: "Hofte",
  kne: "Kne",
  annet: "Annet",
};
const DURATION_OPTIONS = [
  { value: "under_6_uker", label: "Under 6 uker" },
  { value: "6_uker_3_mnd", label: "6 uker – 3 måneder" },
  { value: "3_12_mnd", label: "3 – 12 måneder" },
  { value: "over_1_ar", label: "Over 1 år" },
];
const FIELD_LABEL: Record<string, string> = {
  goal: "Mål",
  problemArea: "Hovedplage",
  problemDuration: "Varighet",
  painIntensityNow: "Smerte nå",
  aggravatingFactors: "Gjør det verre",
  relievingFactors: "Gjør det bedre",
  limitingFactors: "Hindrer deg i",
  activityLevel: "Aktivitetsnivå",
  fearOfMovementScore: "Frykt for bevegelse",
  sleepQuality: "Søvn",
  stressLevel: "Stress",
  previousInjuries: "Tidligere skader",
  previousTreatment: "Tidligere behandling",
  redFlags: "Trygghetssjekk",
};

type FormState = {
  goal: string;
  problemArea: string;
  problemDuration: string;
  painIntensityNow: number;
  aggravatingFactors: string;
  relievingFactors: string;
  limitingFactors: string;
  activityLevel: string;
  fearOfMovementScore: number;
  sleepQuality: string;
  stressLevel: string;
  previousInjuries: string;
  previousTreatment: string;
};

function toForm(row: OnboardingRow): FormState {
  return {
    goal: row.goal ?? "",
    problemArea: row.problem_area ?? "",
    problemDuration: row.problem_duration ?? "",
    painIntensityNow: row.pain_intensity_now ?? 0,
    aggravatingFactors: row.aggravating_factors ?? "",
    relievingFactors: row.relieving_factors ?? "",
    limitingFactors: row.limiting_factors ?? "",
    activityLevel: row.activity_level ?? "",
    fearOfMovementScore: row.fear_of_movement_score ?? 0,
    sleepQuality: row.sleep_quality ?? "",
    stressLevel: row.stress_level ?? "",
    previousInjuries: row.previous_injuries ?? "",
    previousTreatment: row.previous_treatment ?? "",
  };
}

export default function KartleggingPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [row, setRow] = useState<OnboardingRow | null | undefined>(undefined);
  const [form, setForm] = useState<FormState | null>(null);
  const [history, setHistory] = useState<OnboardingHistoryRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingRedFlags, setEditingRedFlags] = useState(false);
  const [redFlags, setRedFlags] = useState<Record<string, boolean>>({});
  const [redFlagBlocked, setRedFlagBlocked] = useState(false);
  const [savingRedFlags, setSavingRedFlags] = useState(false);

  const load = useCallback(async () => {
    const existing = await getMyOnboarding();
    setRow(existing);
    if (existing) {
      setForm(toForm(existing));
      setRedFlags(existing.red_flags ?? {});
    }
    if (userId) setHistory(await getOnboardingHistory(userId));
  }, [userId]);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "client") {
      router.replace("/dashboard");
      return;
    }
    load().catch((e) => setError(e instanceof Error ? e.message : "Kunne ikke hente kartleggingen"));
  }, [roleLoading, role, router, load]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));

  async function handleSave() {
    if (!form || saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateOnboardingSection(form);
      setSaved(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke lagre endringene");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRedFlags() {
    if (savingRedFlags) return;
    setSavingRedFlags(true);
    setError(null);
    try {
      const { cleared } = await updateRedFlags(redFlags);
      await load();
      if (!cleared) {
        setRedFlagBlocked(true);
      } else {
        setEditingRedFlags(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke lagre trygghetssjekken");
    } finally {
      setSavingRedFlags(false);
    }
  }

  const summary = useMemo(() => {
    if (!row) return null;
    return CALIBRATION_LABEL[row.calibration_profile];
  }, [row]);

  if (roleLoading || role !== "client" || row === undefined) {
    return (
      <AppPage title="Min kartlegging">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  if (!row || !row.completed_at || !form) {
    return (
      <AppPage title="Min kartlegging">
        <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-soft shadow-card">
          <p>Du har ikke fullført kartleggingen ennå.</p>
          <Link href="/onboarding" className="mt-3 inline-block font-medium text-primary-ink hover:underline">
            Gå til kartleggingen →
          </Link>
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Min kartlegging"
      subtitle="Svarene dine styrer opplegget ditt. Oppdater det som har endret seg — du trenger ikke fylle ut alt på nytt."
    >
      <div className="space-y-6">
        {/* Trygghetssjekk — alltid egen, tydelig håndtert seksjon */}
        <section
          className={`space-y-4 rounded-lg border p-6 shadow-card ${
            row.red_flag_cleared
              ? "border-border bg-surface"
              : "border-transparent bg-danger-subtle"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              {row.red_flag_cleared ? (
                <ShieldCheck size={16} className="text-success-ink" />
              ) : (
                <ShieldAlert size={16} className="text-danger-ink" />
              )}
              Trygghetssjekk
            </h2>
            {!editingRedFlags && (
              <button
                type="button"
                onClick={() => {
                  setEditingRedFlags(true);
                  setRedFlagBlocked(false);
                }}
                className="text-xs font-medium text-primary-ink hover:underline"
              >
                Oppdater
              </button>
            )}
          </div>

          {redFlagBlocked ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-danger-ink">Ta kontakt med lege først</p>
              <p className="text-sm text-ink">
                Ut fra svaret ditt bør dette vurderes av lege før du fortsetter
                treningsopplegget. Kontakt fastlegen din, eller legevakt ved akutte
                symptomer. Rehabtreneren din ser også at dette er meldt inn.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setRedFlagBlocked(false)}>
                Lukk
              </Button>
            </div>
          ) : editingRedFlags ? (
            <div className="space-y-3">
              {RED_FLAG_QUESTIONS.map((q) => (
                <div key={q.key} className="rounded-md border border-border bg-surface p-3">
                  <p className="text-sm text-ink">{q.question}</p>
                  {q.hint && <p className="mt-1 text-xs text-ink-faint">{q.hint}</p>}
                  <div className="mt-2">
                    <ChoiceGroup
                      value={
                        typeof redFlags[q.key] === "boolean" ? (redFlags[q.key] ? "ja" : "nei") : null
                      }
                      onChange={(v) => setRedFlags((prev) => ({ ...prev, [q.key]: v === "ja" }))}
                      options={[
                        { value: "nei", label: "Nei" },
                        { value: "ja", label: "Ja" },
                      ]}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveRedFlags}
                  disabled={
                    savingRedFlags || !RED_FLAG_QUESTIONS.every((q) => typeof redFlags[q.key] === "boolean")
                  }
                >
                  {savingRedFlags ? "Lagrer …" : "Lagre trygghetssjekk"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRedFlags(false);
                    setRedFlags(row.red_flags ?? {});
                  }}
                  className="text-xs text-ink-soft hover:underline"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              {row.red_flag_cleared
                ? "Ingen kjente risikofaktorer meldt inn."
                : "Et forhold er meldt inn som bør vurderes av lege. Rehabtreneren din er informert."}
            </p>
          )}
        </section>

        {/* Mål */}
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink">Mål</h2>
          <Field label="Hva ønsker du hjelp med?">
            <Textarea rows={3} value={form.goal} onChange={(e) => set("goal", e.target.value)} />
          </Field>
        </section>

        {/* Om plagene */}
        <section className="space-y-5 rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink">Om plagene</h2>
          <ChoiceGroup
            label="Hvor sitter hovedplagen?"
            value={form.problemArea}
            onChange={(v) => set("problemArea", v)}
            options={Object.entries(AREA_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <ChoiceGroup
            label="Hvor lenge har du hatt plagene?"
            value={form.problemDuration}
            onChange={(v) => set("problemDuration", v)}
            options={DURATION_OPTIONS}
          />
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-ink-soft">Smerte akkurat nå</p>
              <span className="text-sm font-semibold text-ink">{form.painIntensityNow} / 10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={form.painIntensityNow}
              onChange={(e) => set("painIntensityNow", Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <Field label="Hva gjør det verre?">
            <Input value={form.aggravatingFactors} onChange={(e) => set("aggravatingFactors", e.target.value)} />
          </Field>
          <Field label="Hva gjør det bedre?">
            <Input value={form.relievingFactors} onChange={(e) => set("relievingFactors", e.target.value)} />
          </Field>
          <Field label="Hva hindrer plagene deg i å gjøre?">
            <Input value={form.limitingFactors} onChange={(e) => set("limitingFactors", e.target.value)} />
          </Field>
        </section>

        {/* Hverdagen */}
        <section className="space-y-5 rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink">Deg og hverdagen</h2>
          <ChoiceGroup
            label="Hvor fysisk aktiv er du i hverdagen?"
            value={form.activityLevel}
            onChange={(v) => set("activityLevel", v)}
            options={[
              { value: "stillesittende", label: "Mest stillesittende" },
              { value: "lett", label: "Litt aktiv" },
              { value: "aktiv", label: "Aktiv" },
              { value: "svært_aktiv", label: "Svært aktiv" },
            ]}
          />
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-ink-soft">
              Hvor redd er du for at bevegelse skal skade deg?
            </p>
            <input
              type="range"
              min={0}
              max={10}
              value={form.fearOfMovementScore}
              onChange={(e) => set("fearOfMovementScore", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-ink-faint">
              <span>Ikke redd</span>
              <span>Svært redd ({form.fearOfMovementScore}/10)</span>
            </div>
          </div>
          <ChoiceGroup
            label="Hvordan sover du for tiden?"
            value={form.sleepQuality}
            onChange={(v) => set("sleepQuality", v)}
            options={[
              { value: "dårlig", label: "Dårlig" },
              { value: "ok", label: "OK" },
              { value: "bra", label: "Bra" },
            ]}
          />
          <ChoiceGroup
            label="Stressnivået ditt om dagen?"
            value={form.stressLevel}
            onChange={(v) => set("stressLevel", v)}
            options={[
              { value: "lavt", label: "Lavt" },
              { value: "moderat", label: "Moderat" },
              { value: "høyt", label: "Høyt" },
            ]}
          />
        </section>

        {/* Historikk (fritekst) */}
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink">Historikk</h2>
          <Field label="Tidligere skader eller operasjoner">
            <Textarea rows={2} value={form.previousInjuries} onChange={(e) => set("previousInjuries", e.target.value)} />
          </Field>
          <Field label="Tidligere behandling">
            <Textarea rows={2} value={form.previousTreatment} onChange={(e) => set("previousTreatment", e.target.value)} />
          </Field>
        </section>

        {/* Kalibreringsprofil (avledet, read-only her — trener kan justere på kundesiden) */}
        {summary && (
          <section className="rounded-lg border border-border bg-primary-subtle p-5">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-primary-ink">
              Kalibreringsprofil
            </p>
            <p className="mt-1 text-base font-semibold text-ink">{summary}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {CALIBRATION_DESCRIPTION[row.calibration_profile]}
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              Oppdateres automatisk når du endrer svarene over. Rehabtreneren din kan justere den manuelt.
            </p>
          </section>
        )}

        {error && <p className="text-sm text-danger-ink">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Lagrer …" : "Lagre endringer"}
          </Button>
          {saved && <span className="text-sm text-success-ink">Lagret ✓</span>}
        </div>

        {/* Endringshistorikk */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-sm font-semibold text-ink">
              Endringshistorikk {history.length > 0 && `(${history.length})`}
            </h2>
            <ChevronDown
              size={16}
              className={`text-ink-faint transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-ink-soft">Ingen endringer registrert ennå.</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="rounded-md border border-border p-3 text-sm">
                    <p className="text-ink-faint">
                      {new Date(h.changed_at).toLocaleDateString("no-NO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-ink">
                      Endret: {h.changed_fields.map((f) => FIELD_LABEL[f] ?? f).join(", ") || "—"}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </AppPage>
  );
}
