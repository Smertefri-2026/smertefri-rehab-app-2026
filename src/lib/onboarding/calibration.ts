// Kalibreringsprofil — hvor forsiktig progresjonen skal være for denne
// kunden. Ren funksjon: kartleggingssvar inn, forslag ut. Treneren kan
// alltid overstyre. (Master Build Plan pkt. 5: «ikke ett universelt tempo
// for alle».)

export type CalibrationProfile = "forsiktig" | "standard" | "aktiv";

export type CalibrationInputs = {
  /** 0–10: hvor redd for at bevegelse/trening skal skade. */
  fearOfMovementScore: number | null;
  /** stillesittende | lett | aktiv | svært_aktiv */
  activityLevel: string | null;
  /** under_6_uker | 6_uker_3_mnd | 3_12_mnd | over_1_ar */
  problemDuration: string | null;
  /** 0–10 nå. */
  painIntensityNow: number | null;
  stressLevel: string | null; // lavt | moderat | høyt
};

/**
 * Enkel, transparent poengsum. Høyere = mer forsiktig.
 * Returnerer også de vektede faktorene så forslaget kan forklares.
 */
export function suggestCalibrationProfile(input: CalibrationInputs): {
  profile: CalibrationProfile;
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  const fear = input.fearOfMovementScore ?? 0;
  if (fear >= 7) {
    score += 2;
    factors.push("høy frykt for bevegelse");
  } else if (fear >= 4) {
    score += 1;
    factors.push("noe frykt for bevegelse");
  }

  if (input.activityLevel === "stillesittende") {
    score += 2;
    factors.push("lite fysisk aktiv i hverdagen");
  } else if (input.activityLevel === "lett") {
    score += 1;
  } else if (input.activityLevel === "svært_aktiv") {
    score -= 1;
    factors.push("svært aktiv i hverdagen");
  }

  if (input.problemDuration === "over_1_ar") {
    score += 2;
    factors.push("langvarige plager");
  } else if (input.problemDuration === "3_12_mnd") {
    score += 1;
  } else if (input.problemDuration === "under_6_uker") {
    score -= 1;
    factors.push("ferske plager");
  }

  const pain = input.painIntensityNow ?? 0;
  if (pain >= 7) {
    score += 1;
    factors.push("høy smerte nå");
  }

  if (input.stressLevel === "høyt") {
    score += 1;
    factors.push("høyt stressnivå");
  }

  const profile: CalibrationProfile = score >= 4 ? "forsiktig" : score <= 0 ? "aktiv" : "standard";

  return { profile, score, factors };
}

export const CALIBRATION_LABEL: Record<CalibrationProfile, string> = {
  forsiktig: "Forsiktig",
  standard: "Standard",
  aktiv: "Aktiv",
};

export const CALIBRATION_DESCRIPTION: Record<CalibrationProfile, string> = {
  forsiktig:
    "Vi går rolig fram. Flere gode dager på rad før vi øker, og små steg av gangen.",
  standard: "Balansert tempo. Vi øker gradvis når kroppen tåler det.",
  aktiv:
    "Vi holder god framdrift. Du tåler mer belastning og progresjon skjer raskere.",
};
