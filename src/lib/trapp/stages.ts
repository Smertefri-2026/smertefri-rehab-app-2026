// Trappen — kundens fem-trinns reise. Rekkefølge og innhold er
// produktmodellen (Master Build Plan pkt. 6). Trinnbytte styres av
// rehabtrener; kunden ser hvor de er og hva som skal til for neste steg.

export type TrappStage = "ro" | "kontroll" | "styrke" | "robusthet" | "frihet";

export const TRAPP_ORDER: TrappStage[] = ["ro", "kontroll", "styrke", "robusthet", "frihet"];

export type TrappStageInfo = {
  key: TrappStage;
  index: number;
  label: string;
  /** Kort mål, vist til kunden. */
  goal: string;
  /** Hva kunden gjør på dette trinnet. */
  clientFocus: string;
  /** Hva som vanligvis må til for å gå videre. */
  advanceCriteria: string;
};

export const TRAPP_STAGES: Record<TrappStage, TrappStageInfo> = {
  ro: {
    key: "ro",
    index: 0,
    label: "Ro",
    goal: "Roe ned smerten og bli trygg på å bevege deg igjen.",
    clientFocus: "Rolige, lav-terskel øvelser og smerteforståelse. Ingen tunge løft.",
    advanceCriteria: "Flere rolige dager på rad i grønn sone, uten oppblussing.",
  },
  kontroll: {
    key: "kontroll",
    index: 1,
    label: "Kontroll",
    goal: "Gjenopprette gode bevegelsesmønstre og koordinasjon.",
    clientFocus: "Mer variasjon og kroppsvektsøvelser. Vi bygger kvalitet før belastning.",
    advanceCriteria: "Bestått bevegelseskvalitetstest og stabil sone.",
  },
  styrke: {
    key: "styrke",
    index: 2,
    label: "Styrke",
    goal: "Bygge reell belastningstoleranse.",
    clientFocus: "Progressiv styrketrening i baseøvelser, tilpasset kalibreringsprofilen din.",
    advanceCriteria: "Målbar styrkefremgang og stabil sone over tid.",
  },
  robusthet: {
    key: "robusthet",
    index: 3,
    label: "Robusthet",
    goal: "Kapasitet som tåler mer enn hverdagen krever.",
    clientFocus: "Mer krevende og variert trening, tidlig kondisjon og eksplosivitet.",
    advanceCriteria: "Nådd definerte funksjonsmål.",
  },
  frihet: {
    key: "frihet",
    index: 4,
    label: "Frihet",
    goal: "Tilbake til det du vil gjøre — selvstendig.",
    clientFocus: "Målrettet trening mot din egen aktivitet. Periodisk oppfølging.",
    advanceCriteria: "Målet ditt er nådd. Herfra kan opplegget settes i vedlikeholdsmodus.",
  },
};

export function stageInfo(stage: TrappStage): TrappStageInfo {
  return TRAPP_STAGES[stage];
}

export function nextStage(stage: TrappStage): TrappStage | null {
  const i = TRAPP_ORDER.indexOf(stage);
  return i >= 0 && i < TRAPP_ORDER.length - 1 ? TRAPP_ORDER[i + 1] : null;
}

export function prevStage(stage: TrappStage): TrappStage | null {
  const i = TRAPP_ORDER.indexOf(stage);
  return i > 0 ? TRAPP_ORDER[i - 1] : null;
}
