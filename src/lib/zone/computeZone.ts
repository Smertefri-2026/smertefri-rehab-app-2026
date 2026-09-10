import type { DailyCheckinInput, Zone, ZoneContext, ZoneResult } from "./types";

/**
 * Terskler — samlet ett sted, navngitt, slik at de kan justeres uten å
 * lete gjennom logikken. Verdiene er konservative V1-anslag (safety-first:
 * er vi i tvil, eskalerer vi).
 */
export const ZONE_THRESHOLDS = {
  /** painNow − baseline ≥ dette ⇒ minst moderat økning (gul). */
  moderatePainRise: 1.5,
  /** painNow − baseline ≥ dette ⇒ betydelig økning. */
  significantPainRise: 3,
  /** En enkeltmåling ≥ baseline + dette siste 48t ⇒ «flare». */
  flareSpike: 3,
  /** Antall dager (inkl. i dag) smerten må ha ligget over normalnivå for «vedvarende». */
  sustainedDays: 3,
  /** Absolutt smerte ≥ dette regnes som høyt uansett baseline. */
  highAbsolutePain: 7,
} as const;

type Rule = {
  name: string;
  band: Zone;
  message: string;
  when: (input: DailyCheckinInput, ctx: NormalizedContext) => boolean;
};

type NormalizedContext = {
  baselinePain: number | null;
  recentPain: { date: string; intensity: number }[];
  today: string;
  /** Effektiv baseline å måle økning mot — baseline hvis kjent, ellers dagens smerte. */
  effectiveBaseline: number;
  painRise: number; // painNow − effectiveBaseline
};

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}

/**
 * Regelsettet, i den rekkefølgen begrunnelsen bør leses. Røde regler
 * først, deretter gule. Grønn er «ingen av disse».
 */
export function zoneRules(): Rule[] {
  const T = ZONE_THRESHOLDS;

  return [
    // ── RØDT ─────────────────────────────────────────────────────────────
    {
      name: "new_symptom",
      band: "red",
      message: "Du har rapportert et nytt eller uventet symptom.",
      when: (i) => i.newSymptom,
    },
    {
      name: "fear_of_training",
      band: "red",
      message: "Du kjenner frykt for å trene i dag.",
      when: (i) => i.afraidToTrain,
    },
    {
      name: "sustained_pain_rise",
      band: "red",
      message: "Smerten har ligget over normalnivået ditt i flere dager på rad.",
      when: (i, c) => {
        if (c.baselinePain == null) return false;
        if (i.painNow < c.baselinePain + T.moderatePainRise) return false;
        const recentElevated = c.recentPain.filter(
          (p) =>
            daysBetween(p.date, c.today) >= 1 &&
            daysBetween(p.date, c.today) <= T.sustainedDays &&
            p.intensity >= (c.baselinePain as number) + T.moderatePainRise
        );
        return recentElevated.length >= T.sustainedDays - 1;
      },
    },
    {
      name: "low_completion_with_rising_pain",
      band: "red",
      message: "Du fikk ikke gjennomført planlagt aktivitet, samtidig som smerten øker.",
      when: (i, c) =>
        i.completedPlannedActivity === "nei" && c.painRise >= T.moderatePainRise,
    },
    {
      name: "high_absolute_pain",
      band: "red",
      message: "Smertenivået er høyt i dag.",
      when: (i, c) =>
        i.painNow >= T.highAbsolutePain &&
        (c.baselinePain == null || c.painRise >= T.significantPainRise),
    },

    // ── GULT ─────────────────────────────────────────────────────────────
    {
      name: "moderate_pain_rise",
      band: "yellow",
      message: "Smerten er noe over normalnivået ditt.",
      when: (i, c) =>
        c.baselinePain != null && c.painRise >= T.moderatePainRise,
    },
    {
      name: "poor_recovery",
      band: "yellow",
      message: "Dårlig søvn eller lavt overskudd i dag.",
      when: (i) => i.sleep === "dårlig" || i.energy === "lavt",
    },
    {
      name: "recent_flare",
      band: "yellow",
      message: "Du hadde en oppblussing i smerte det siste døgnet.",
      when: (i, c) =>
        c.recentPain.some(
          (p) =>
            daysBetween(p.date, c.today) >= 0 &&
            daysBetween(p.date, c.today) <= 2 &&
            p.intensity >= c.effectiveBaseline + T.flareSpike
        ),
    },
    {
      name: "low_completion",
      band: "yellow",
      message: "Du fikk ikke gjennomført planlagt aktivitet.",
      when: (i) => i.completedPlannedActivity === "nei",
    },
    {
      name: "partial_completion_with_rise",
      band: "yellow",
      message: "Du gjennomførte delvis, med litt økt smerte.",
      when: (i, c) =>
        i.completedPlannedActivity === "delvis" &&
        c.baselinePain != null &&
        c.painRise > 0,
    },
  ];
}

const BAND_RANK: Record<Zone, number> = { green: 0, yellow: 1, red: 2 };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Beregner Sonen for én dag. Ren funksjon — samme input gir alltid samme
 * resultat, og resultatet forklarer alltid seg selv.
 */
export function computeZone(input: DailyCheckinInput, ctx: ZoneContext): ZoneResult {
  const today = ctx.today ?? todayISO();
  const effectiveBaseline = ctx.baselinePain ?? input.painNow;

  const c: NormalizedContext = {
    baselinePain: ctx.baselinePain,
    recentPain: [...ctx.recentPain].sort((a, b) => (a.date < b.date ? 1 : -1)),
    today,
    effectiveBaseline,
    painRise: input.painNow - effectiveBaseline,
  };

  const fired = zoneRules().filter((r) => r.when(input, c));

  if (fired.length === 0) {
    return {
      zone: "green",
      reason: "Stabil smerte, og du er i rute.",
      firedRules: [],
    };
  }

  const topBand = fired.reduce<Zone>(
    (acc, r) => (BAND_RANK[r.band] > BAND_RANK[acc] ? r.band : acc),
    "green"
  );

  const inTopBand = fired.filter((r) => r.band === topBand);
  const primary = inTopBand[0];

  let reason = primary.message;
  if (inTopBand.length === 2) {
    reason = `${primary.message} ${lowerFirst(inTopBand[1].message)}`;
  } else if (inTopBand.length > 2) {
    reason = `${primary.message} (+ ${inTopBand.length - 1} andre signaler)`;
  }

  return {
    zone: topBand,
    reason,
    firedRules: fired.map((r) => r.name),
  };
}

function lowerFirst(s: string): string {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}
