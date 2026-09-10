// Rødt lys-screening for muskel-/skjelettplager.
//
// ⚠️ ORDLYDEN HER MÅ GJENNOMGÅS AV FAGPERSON (fysioterapeut/lege) FØR
// LANSERING. Dette er en konservativ V1-struktur: hvis noe krysses av,
// stopper vi kartleggingen og ber kunden ta kontakt med lege før de
// fortsetter. Vi tar heller for mange henvisninger enn for få.

export type RedFlagQuestion = {
  key: string;
  question: string;
  /** Kort hjelpetekst under spørsmålet. */
  hint?: string;
};

export const RED_FLAG_QUESTIONS: RedFlagQuestion[] = [
  {
    key: "bladder_bowel",
    question:
      "Har du nylig fått problemer med å kontrollere vannlating eller avføring, eller nummenhet i skrittet/setet?",
    hint: "Dette må vurderes akutt av lege.",
  },
  {
    key: "progressive_weakness",
    question: "Opplever du økende kraftsvikt, nummenhet eller prikking i ett eller begge bein?",
  },
  {
    key: "recent_trauma",
    question: "Startet plagene rett etter et fall, en ulykke eller et kraftig støt?",
  },
  {
    key: "unexplained_weight_loss",
    question: "Har du gått ned mye i vekt uten grunn den siste tiden?",
  },
  {
    key: "cancer_history",
    question: "Har du, eller har du hatt, kreft?",
  },
  {
    key: "fever_illness",
    question: "Har du feber, frysninger eller føler deg alvorlig syk sammen med smertene?",
  },
  {
    key: "night_pain",
    question:
      "Er smerten konstant og verre om natten, uten at hvile eller stillingsendring hjelper?",
  },
];

/** Én eller flere ja ⇒ ikke klarert. */
export function isRedFlagCleared(answers: Record<string, boolean>): boolean {
  return !RED_FLAG_QUESTIONS.some((q) => answers[q.key] === true);
}
