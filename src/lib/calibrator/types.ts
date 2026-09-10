// Kalibratoren — beslutningsstøtte for rehabtreneren, ikke en autonom motor.
//
// Alt her er rene typer + rene funksjoner (rules.ts). Input inn, forklart
// forslag ut. Kalibratoren kaller aldri KI, DB eller noe med sidevirkninger,
// og den *anvender* aldri et forslag selv — treneren bestemmer.
// (Master Build Plan pkt. 5.)

import type { CalibrationProfile } from "@/lib/onboarding/calibration";
import type { TrappStage } from "@/lib/trapp/stages";
import type { Zone } from "@/lib/zone/types";

export type CompletionStatus = "ja" | "delvis" | "nei";

/** Én dags Sone slik Kalibratoren trenger den. Nyeste først i lista. */
export type CalibratorZone = {
  date: string; // "YYYY-MM-DD"
  zone: Zone;
  /** Har en trener overstyrt sonen denne dagen? Da teller den ikke som «ren». */
  trainerOverridden: boolean;
};

/** Én loggført økt. Nyeste først i lista. */
export type CalibratorCompletion = {
  date: string;
  status: CompletionStatus;
};

export type CalibratorInput = {
  profile: CalibrationProfile;
  stage: TrappStage;
  /** Sone-historikk, nyeste først. Bør dekke minst de siste ~10 dagene. */
  zones: CalibratorZone[];
  /** Øktlogg, nyeste først. */
  completions: CalibratorCompletion[];
  /** Dager siden siste registrerte oppblussing (rød sone / flare). null = ukjent / ingen. */
  daysSinceFlare: number | null;
};

export type CalibratorKind = "expand" | "retreat" | "hold";

export type CalibratorActionKind =
  | "increase_one_variable"
  | "hold"
  | "reduce_load"
  | "step_back_stage";

export type CalibratorSuggestion = {
  kind: CalibratorKind;
  /** Navngitt regel — «utvidelsesregel», «retrettregel», «hold». */
  rule: string;
  /** Kort overskrift treneren ser først. */
  headline: string;
  /** Full begrunnelse i klartekst — alltid «fordi …», aldri en naken score. */
  reasoning: string;
  action: {
    kind: CalibratorActionKind;
    /** Konkret hva treneren bør gjøre. */
    detail: string;
  };
  /**
   * Signaler som lå til grunn (maskinlesbart, for logging/analyse).
   * Ikke vist direkte til treneren.
   */
  firedSignals: string[];
};

/** Hvor mange rene grønne dager som kreves, og hvor stort steget er. */
export type ProfileTuning = {
  /** Sammenhengende rene grønne dager før «utvidelsesregel» slår til. */
  greenStreakToExpand: number;
  /** Antall gule dager i vinduet som utløser «hold». */
  yellowHoldThreshold: number;
  /** Dager uten oppblussing før vi vurderer å øke. */
  flareCooldownDays: number;
  /** Kort beskrivelse av steget, brukt i teksten. */
  stepDescription: string;
};

export const PROFILE_TUNING: Record<CalibrationProfile, ProfileTuning> = {
  forsiktig: {
    greenStreakToExpand: 5,
    yellowHoldThreshold: 2,
    flareCooldownDays: 10,
    stepDescription: "ett lite hakk på én variabel",
  },
  standard: {
    greenStreakToExpand: 3,
    yellowHoldThreshold: 2,
    flareCooldownDays: 7,
    stepDescription: "ett hakk på én variabel",
  },
  aktiv: {
    greenStreakToExpand: 2,
    yellowHoldThreshold: 3,
    flareCooldownDays: 4,
    stepDescription: "ett tydelig hakk på én variabel",
  },
};
