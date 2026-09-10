// Kalibratorens regelmotor. Ren funksjon: CalibratorInput inn, ett
// forklart forslag ut. Rekkefølgen er bevisst — sikkerhet før framdrift:
//   1. Retrettregel  (rødt / gjentatt gult)  → hold eller reduser
//   2. Utvidelsesregel (N rene grønne på rad) → øk nøyaktig én variabel
//   3. Hold           (alt annet)             → fortsett som nå, følg med
//
// «Ren grønn dag» = zone === "green" og ikke trener-overstyrt.

import { CALIBRATION_LABEL } from "@/lib/onboarding/calibration";
import { TRAPP_STAGES } from "@/lib/trapp/stages";
import {
  PROFILE_TUNING,
  type CalibratorInput,
  type CalibratorSuggestion,
} from "./types";

/** Hvor mange dager sone-/øktvinduet ser bakover. */
const WINDOW_DAYS = 10;

function countLeadingCleanGreen(zones: CalibratorInput["zones"]): number {
  let n = 0;
  for (const z of zones) {
    if (z.zone === "green" && !z.trainerOverridden) n++;
    else break;
  }
  return n;
}

function recentZones(zones: CalibratorInput["zones"]) {
  return zones.slice(0, WINDOW_DAYS);
}

function recentCompletions(completions: CalibratorInput["completions"]) {
  return completions.slice(0, WINDOW_DAYS);
}

export function calibrate(input: CalibratorInput): CalibratorSuggestion {
  const tuning = PROFILE_TUNING[input.profile];
  const profileLabel = CALIBRATION_LABEL[input.profile].toLowerCase();
  const stageLabel = TRAPP_STAGES[input.stage].label;

  const window = recentZones(input.zones);
  const latest = input.zones[0] ?? null;

  const yellowCount = window.filter((z) => z.zone === "yellow").length;
  const redCount = window.filter((z) => z.zone === "red").length;
  const cleanGreenStreak = countLeadingCleanGreen(input.zones);

  const comps = recentCompletions(input.completions);
  const missedRecently = comps.filter((c) => c.status === "nei").length;
  const partialRecently = comps.filter((c) => c.status === "delvis").length;

  // ── 1. RETRETTREGEL ──────────────────────────────────────────────────────
  if (latest && latest.zone === "red") {
    return {
      kind: "retreat",
      rule: "retrettregel",
      headline: "Hold igjen — dagens Sone er rød",
      reasoning:
        "Sonen er rød i dag. Vi legger progresjon på vent og holder eller " +
        "letter på belastningen til bildet har roet seg og Sonen er stabil igjen.",
      action: {
        kind: "reduce_load",
        detail:
          "Behold dagens program, men ta ned belastning/volum et hakk, eller " +
          "bytt de tyngste øvelsene til regresjonsvarianten. Ikke øk noe.",
      },
      firedSignals: ["latest_zone_red"],
    };
  }

  if (yellowCount >= tuning.yellowHoldThreshold) {
    return {
      kind: "retreat",
      rule: "retrettregel",
      headline: `Gjentatt gult (${yellowCount} dager) — hold nivået`,
      reasoning:
        `Sonen har vært gul ${yellowCount} av de siste ${window.length} dagene. ` +
        "Det er ikke fare, men et tegn på usikkerhet. Vi holder nivået til det " +
        "stabiliserer seg i grønt før vi vurderer å øke igjen.",
      action: {
        kind: "hold",
        detail:
          "Behold nåværende program og belastning. Vurder å redusere volum litt " +
          "hvis det gule holder seg neste uke.",
      },
      firedSignals: ["repeated_yellow"],
    };
  }

  if (redCount >= 1 || missedRecently >= 2) {
    return {
      kind: "retreat",
      rule: "retrettregel",
      headline: "Ustabil periode — konsolider før du øker",
      reasoning:
        (redCount >= 1
          ? `Det har vært ${redCount} rød dag i vinduet. `
          : `${missedRecently} økter er ikke gjennomført i det siste. `) +
        "Vi bruker tiden på å konsolidere nåværende nivå framfor å legge på mer.",
      action: {
        kind: "hold",
        detail:
          "Behold programmet som det er. Følg med på om gjennomføring og Sone " +
          "tar seg opp igjen kommende uke.",
      },
      firedSignals: redCount >= 1 ? ["red_in_window"] : ["low_completion"],
    };
  }

  // ── 2. UTVIDELSESREGEL ───────────────────────────────────────────────────
  const flareOk =
    input.daysSinceFlare == null || input.daysSinceFlare >= tuning.flareCooldownDays;
  const completionOk = comps.length >= 2 && missedRecently === 0 && partialRecently <= 1;

  if (cleanGreenStreak >= tuning.greenStreakToExpand && flareOk && completionOk) {
    return {
      kind: "expand",
      rule: "utvidelsesregel",
      headline: `Klar for å øke — ${cleanGreenStreak} rene grønne dager på rad`,
      reasoning:
        `Sonen har vært ren grønn ${cleanGreenStreak} dager på rad, øktene er ` +
        `gjennomført, og det er ${
          input.daysSinceFlare == null ? "ingen registrert oppblussing" : `${input.daysSinceFlare} dager siden siste oppblussing`
        }. Med ${profileLabel} kalibreringsprofil er terskelen ${tuning.greenStreakToExpand} dager — den er nådd. ` +
        "Vi foreslår å øke nøyaktig én variabel.",
      action: {
        kind: "increase_one_variable",
        detail:
          `Øk ${tuning.stepDescription}: enten last, volum (sett/reps) eller ` +
          `kompleksitet på én øvelse i «${stageLabel}»-programmet — ikke flere ` +
          "samtidig. Neste vurdering etter et par økter på nytt nivå.",
      },
      firedSignals: ["clean_green_streak", "completion_ok", "flare_cooldown_ok"],
    };
  }

  // ── 3. HOLD ──────────────────────────────────────────────────────────────
  const reasons: string[] = [];
  if (cleanGreenStreak < tuning.greenStreakToExpand) {
    reasons.push(
      `bare ${cleanGreenStreak} rene grønne dager på rad (trenger ${tuning.greenStreakToExpand})`
    );
  }
  if (!flareOk) {
    reasons.push(
      `bare ${input.daysSinceFlare} dager siden siste oppblussing (trenger ${tuning.flareCooldownDays})`
    );
  }
  if (!completionOk) {
    reasons.push("øktloggen er ikke ren nok ennå");
  }

  return {
    kind: "hold",
    rule: "hold",
    headline: "Fortsett som nå",
    reasoning:
      "Ingen grunn til å endre belastningen: " +
      (reasons.length ? reasons.join("; ") : "signalene er blandede") +
      `. Med ${profileLabel} profil venter vi til bildet er tydeligere grønt.`,
    action: {
      kind: "hold",
      detail:
        "Behold nåværende program og belastning. Kalibratoren melder fra når " +
        "kriteriene for å øke er oppfylt.",
    },
    firedSignals: ["hold_default"],
  };
}
