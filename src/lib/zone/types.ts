// Sonen — kundens daglige status (grønn / gul / rød).
//
// Alt her er rene typer. Selve regelmotoren (computeZone) er en ren
// funksjon: input inn, forklarbart resultat ut. Den kaller aldri KI, DB
// eller noe med sidevirkninger.

export type Zone = "green" | "yellow" | "red";

export type Sleep = "dårlig" | "ok" | "bra";
export type Energy = "lavt" | "ok" | "høyt";
export type Completion = "ja" | "delvis" | "nei";

/** Det kunden legger inn i den daglige innsjekken (~30 sekunder). */
export type DailyCheckinInput = {
  /** Smerte nå, 0–10 (samme skala som pain_entries). */
  painNow: number;
  sleep: Sleep;
  energy: Energy;
  /** Nytt eller uventet symptom siden sist? */
  newSymptom: boolean;
  /** Gjennomførte du planlagt aktivitet i går/i dag? */
  completedPlannedActivity: Completion;
  /** Kjenner du frykt for å trene i dag? */
  afraidToTrain: boolean;
};

/** Historikk motoren trenger for å vurdere trend, ikke bare dagen i dag. */
export type ZoneContext = {
  /** 14-dagers rullerende snitt av smerte (pain_entries). null = for lite historikk. */
  baselinePain: number | null;
  /** Smertemålinger siste ~7 dager, nyeste først. Dato som "YYYY-MM-DD". */
  recentPain: { date: string; intensity: number }[];
  /** Dagens dato "YYYY-MM-DD". Injiseres for testbarhet; default = i dag. */
  today?: string;
};

export type ZoneResult = {
  zone: Zone;
  /** Norsk klartekst — hvorfor akkurat denne sonen. Alltid forklarbar. */
  reason: string;
  /** Maskinlesbare regelnavn som slo til (for logging, analyse og Kalibratoren). */
  firedRules: string[];
};
