"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useRole } from "@/providers/RoleProvider";
import { Wordmark } from "@/ui/brand/Wordmark";
import { Button } from "@/ui/components/Button";
import { Field, Input, Textarea } from "@/ui/components/Field";
import { ChoiceGroup } from "@/ui/components/ChoiceGroup";
import { cn } from "@/ui/cn";
import { RED_FLAG_QUESTIONS } from "@/lib/onboarding/redFlags";
import { suggestCalibrationProfile, CALIBRATION_LABEL, CALIBRATION_DESCRIPTION } from "@/lib/onboarding/calibration";
import { getMyOnboarding, submitOnboarding, type OnboardingAnswers } from "@/lib/onboarding.api";

const STEPS = ["Mål", "Trygghet", "Plagene", "Hverdagen", "Historikk", "Oppsummering"] as const;

const AREA_LABEL: Record<string, string> = {
  rygg: "Rygg / korsrygg",
  nakke: "Nakke",
  skulder: "Skulder",
  hofte: "Hofte",
  kne: "Kne",
  annet: "Annet",
};
const DURATION_LABEL: Record<string, string> = {
  under_6_uker: "Under 6 uker",
  "6_uker_3_mnd": "6 uker – 3 måneder",
  "3_12_mnd": "3 – 12 måneder",
  over_1_ar: "Over 1 år",
};

const emptyAnswers: OnboardingAnswers = {
  goal: "",
  redFlags: {},
  problemArea: "",
  problemDuration: "",
  painIntensityNow: 3,
  aggravatingFactors: "",
  relievingFactors: "",
  limitingFactors: "",
  activityLevel: "",
  fearOfMovementScore: 3,
  sleepQuality: "",
  stressLevel: "",
  previousInjuries: "",
  previousTreatment: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  const [step, setStep] = useState(0);
  const [a, setA] = useState<OnboardingAnswers>(emptyAnswers);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const set = <K extends keyof OnboardingAnswers>(k: K, v: OnboardingAnswers[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));
  const setRedFlag = (key: string, val: boolean) =>
    setA((prev) => ({ ...prev, redFlags: { ...prev.redFlags, [key]: val } }));

  useEffect(() => {
    if (roleLoading) return;
    if (role && role !== "client") {
      router.replace("/dashboard");
      return;
    }
    (async () => {
      try {
        const existing = await getMyOnboarding();
        if (existing?.completed_at) {
          router.replace("/dashboard");
          return;
        }
        if (existing) {
          // gjenopprett halvferdig kartlegging
          setA({
            goal: existing.goal ?? "",
            redFlags: existing.red_flags ?? {},
            problemArea: existing.problem_area ?? "",
            problemDuration: existing.problem_duration ?? "",
            painIntensityNow: existing.pain_intensity_now ?? 3,
            aggravatingFactors: existing.aggravating_factors ?? "",
            relievingFactors: existing.relieving_factors ?? "",
            limitingFactors: existing.limiting_factors ?? "",
            activityLevel: existing.activity_level ?? "",
            fearOfMovementScore: existing.fear_of_movement_score ?? 3,
            sleepQuality: existing.sleep_quality ?? "",
            stressLevel: existing.stress_level ?? "",
            previousInjuries: existing.previous_injuries ?? "",
            previousTreatment: existing.previous_treatment ?? "",
          });
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [roleLoading, role, router]);

  const suggested = useMemo(
    () =>
      suggestCalibrationProfile({
        fearOfMovementScore: a.fearOfMovementScore,
        activityLevel: a.activityLevel,
        problemDuration: a.problemDuration,
        painIntensityNow: a.painIntensityNow,
        stressLevel: a.stressLevel,
      }),
    [a]
  );

  const anyRedFlag = RED_FLAG_QUESTIONS.some((q) => a.redFlags[q.key] === true);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return a.goal.trim().length > 2;
      case 1:
        return RED_FLAG_QUESTIONS.every((q) => typeof a.redFlags[q.key] === "boolean");
      case 2:
        return !!a.problemArea && !!a.problemDuration;
      case 3:
        return !!a.activityLevel && !!a.sleepQuality && !!a.stressLevel;
      case 4:
        return true;
      default:
        return true;
    }
  };

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { cleared } = await submitOnboarding(a);
      if (!cleared) {
        setBlocked(true);
        return;
      }
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke lagre kartleggingen");
    } finally {
      setSubmitting(false);
    }
  }

  if (roleLoading || role !== "client" || checking) {
    return <div className="p-10 text-sm text-ink-soft">Laster …</div>;
  }

  if (blocked) {
    return (
      <Shell step={step}>
        <div className="space-y-4 rounded-lg border border-transparent bg-danger-subtle p-6">
          <h2 className="text-lg font-semibold text-danger-ink">Ta kontakt med lege først</h2>
          <p className="text-sm text-ink">
            Ut fra svarene dine bør plagene vurderes av lege før du starter et
            treningsopplegg. Kontakt fastlegen din, eller legevakt ved akutte
            symptomer.
          </p>
          <p className="text-sm text-ink-soft">
            Vi har lagret svarene dine. Når du har vært til vurdering, kan du
            fortsette kartleggingen.
          </p>
          <Button variant="secondary" onClick={() => setBlocked(false)}>
            Gå tilbake til svarene
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell step={step}>
      <div className="space-y-8">
        {step === 0 && (
          <StepBlock title="Hva ønsker du hjelp med?" intro="Skriv med dine egne ord. Dette blir utgangspunktet for opplegget ditt.">
            <Field label="Målet ditt">
              <Textarea
                rows={4}
                value={a.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="F.eks. «bli kvitt ryggsmertene så jeg kan løfte ungene og gå på tur uten å være redd»"
              />
            </Field>
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock
            title="Kort trygghetssjekk"
            intro="Noen få ja/nei-spørsmål. Er noe av dette aktuelt, ber vi deg ta kontakt med lege før vi går videre."
          >
            <div className="space-y-4">
              {RED_FLAG_QUESTIONS.map((q) => (
                <div key={q.key} className="rounded-md border border-border bg-surface p-4">
                  <p className="text-sm text-ink">{q.question}</p>
                  {q.hint && <p className="mt-1 text-xs text-ink-faint">{q.hint}</p>}
                  <div className="mt-3">
                    <ChoiceGroup
                      value={
                        typeof a.redFlags[q.key] === "boolean"
                          ? a.redFlags[q.key]
                            ? "ja"
                            : "nei"
                          : null
                      }
                      onChange={(v) => setRedFlag(q.key, v === "ja")}
                      options={[
                        { value: "nei", label: "Nei" },
                        { value: "ja", label: "Ja" },
                      ]}
                    />
                  </div>
                </div>
              ))}
              {anyRedFlag && (
                <p className="rounded-md bg-warning-subtle px-4 py-3 text-sm text-warning-ink">
                  Du har krysset av på minst ett punkt. Når du fullfører, sender vi
                  deg til informasjon om videre oppfølging.
                </p>
              )}
            </div>
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="Om plagene" intro="">
            <div className="space-y-6">
              <ChoiceGroup
                label="Hvor sitter hovedplagen?"
                value={a.problemArea}
                onChange={(v) => set("problemArea", v)}
                layout="stack"
                options={[
                  { value: "rygg", label: "Rygg / korsrygg" },
                  { value: "nakke", label: "Nakke" },
                  { value: "skulder", label: "Skulder" },
                  { value: "hofte", label: "Hofte" },
                  { value: "kne", label: "Kne" },
                  { value: "annet", label: "Annet" },
                ]}
              />
              <ChoiceGroup
                label="Hvor lenge har du hatt plagene?"
                value={a.problemDuration}
                onChange={(v) => set("problemDuration", v)}
                layout="stack"
                options={[
                  { value: "under_6_uker", label: "Under 6 uker" },
                  { value: "6_uker_3_mnd", label: "6 uker – 3 måneder" },
                  { value: "3_12_mnd", label: "3 – 12 måneder" },
                  { value: "over_1_ar", label: "Over 1 år" },
                ]}
              />
              <PainSlider value={a.painIntensityNow} onChange={(v) => set("painIntensityNow", v)} />
              <Field label="Hva gjør det verre?">
                <Input value={a.aggravatingFactors} onChange={(e) => set("aggravatingFactors", e.target.value)} placeholder="F.eks. langvarig sitting, løfting" />
              </Field>
              <Field label="Hva gjør det bedre?">
                <Input value={a.relievingFactors} onChange={(e) => set("relievingFactors", e.target.value)} placeholder="F.eks. bevegelse, varme, hvile" />
              </Field>
              <Field label="Hva hindrer plagene deg i å gjøre?">
                <Input value={a.limitingFactors} onChange={(e) => set("limitingFactors", e.target.value)} placeholder="F.eks. jobb, trening, søvn" />
              </Field>
            </div>
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock title="Deg og hverdagen" intro="">
            <div className="space-y-6">
              <ChoiceGroup
                label="Hvor fysisk aktiv er du i hverdagen?"
                value={a.activityLevel}
                onChange={(v) => set("activityLevel", v)}
                layout="stack"
                options={[
                  { value: "stillesittende", label: "Mest stillesittende" },
                  { value: "lett", label: "Litt aktiv (turer, lett trening)" },
                  { value: "aktiv", label: "Aktiv (trener regelmessig)" },
                  { value: "svært_aktiv", label: "Svært aktiv (hard trening / idrett)" },
                ]}
              />
              <FearSlider value={a.fearOfMovementScore} onChange={(v) => set("fearOfMovementScore", v)} />
              <ChoiceGroup
                label="Hvordan sover du for tiden?"
                value={a.sleepQuality}
                onChange={(v) => set("sleepQuality", v)}
                options={[
                  { value: "dårlig", label: "Dårlig" },
                  { value: "ok", label: "OK" },
                  { value: "bra", label: "Bra" },
                ]}
              />
              <ChoiceGroup
                label="Stressnivået ditt om dagen?"
                value={a.stressLevel}
                onChange={(v) => set("stressLevel", v)}
                options={[
                  { value: "lavt", label: "Lavt" },
                  { value: "moderat", label: "Moderat" },
                  { value: "høyt", label: "Høyt" },
                ]}
              />
            </div>
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock title="Historikk" intro="Valgfritt, men hjelper rehabtreneren din.">
            <div className="space-y-6">
              <Field label="Tidligere skader eller operasjoner">
                <Textarea rows={3} value={a.previousInjuries} onChange={(e) => set("previousInjuries", e.target.value)} />
              </Field>
              <Field label="Har du prøvd behandling for dette før? Hva?">
                <Textarea rows={3} value={a.previousTreatment} onChange={(e) => set("previousTreatment", e.target.value)} />
              </Field>
            </div>
          </StepBlock>
        )}

        {step === 5 && (
          <StepBlock title="Oppsummering" intro="Rehabtreneren din bruker dette til å legge opp starten.">
            <div className="space-y-4">
              <SummaryRow label="Mål" value={a.goal} />
              <SummaryRow label="Hovedplage" value={AREA_LABEL[a.problemArea] ?? a.problemArea} />
              <SummaryRow label="Varighet" value={DURATION_LABEL[a.problemDuration] ?? a.problemDuration} />
              <SummaryRow label="Smerte nå" value={`${a.painIntensityNow} / 10`} />
              <div className="rounded-lg border border-border bg-primary-subtle p-5">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-primary-ink">
                  Foreslått tempo
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {CALIBRATION_LABEL[suggested.profile]}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {CALIBRATION_DESCRIPTION[suggested.profile]}
                </p>
                {suggested.factors.length > 0 && (
                  <p className="mt-2 text-xs text-ink-faint">
                    Basert på: {suggested.factors.join(", ")}. Rehabtreneren din kan
                    justere dette.
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-danger-ink">{error}</p>}
            </div>
          </StepBlock>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            Tilbake
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              Neste
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Lagrer…" : "Fullfør kartlegging"}
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-prose items-center justify-between px-4 py-4">
          <Wordmark className="text-lg" />
          <span className="text-[13px] text-ink-faint">Kartlegging</span>
        </div>
      </header>

      <div className="mx-auto max-w-prose px-4 py-8">
        <ol className="mb-8 flex gap-1.5">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-primary" : "bg-border"
              )}
              aria-label={label}
            />
          ))}
        </ol>
        {children}
      </div>
    </div>
  );
}

function StepBlock({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {intro && <p className="mt-1 text-sm text-ink-soft">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-28 shrink-0 text-ink-faint">{label}</span>
      <span className="text-ink">{value || "—"}</span>
    </div>
  );
}

function PainSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-ink-soft">Smerte akkurat nå</p>
        <span className="text-sm font-semibold text-ink">{value} / 10</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function FearSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-ink-soft">
        Hvor redd er du for at bevegelse eller trening skal skade deg?
      </p>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-ink-faint">
        <span>Ikke redd</span>
        <span>Svært redd ({value}/10)</span>
      </div>
    </div>
  );
}
