// Øvelsesbibliotekets vokabular — bevegelsesmønster og kapasitetsnivå.
// Samme rolle som trapp/stages.ts har for Trappen: faste, kodede lister
// UI-et bygger på, ikke databasehåndhevede enum-verdier utover selve
// kolonnetypen. Kapasitetsnivå er bevisst UAVHENGIG av Trapp-stadium (se
// migrasjon 20260913000030) — en godt trent klient kan stå i "ro" etter en
// oppblussing, en utrent klient kan stå i "styrke".

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "press"
  | "pull"
  | "carry"
  | "gait"
  | "balance"
  | "rotation"
  | "conditioning";

export const MOVEMENT_PATTERN_ORDER: MovementPattern[] = [
  "squat",
  "hinge",
  "lunge",
  "press",
  "pull",
  "carry",
  "gait",
  "balance",
  "rotation",
  "conditioning",
];

export const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, string> = {
  squat: "Knebøy",
  hinge: "Hoftehinge",
  lunge: "Utfall / splittstående",
  press: "Press",
  pull: "Trekk",
  carry: "Bæring",
  gait: "Gange / løp",
  balance: "Balanse",
  rotation: "Rotasjon / anti-rotasjon",
  conditioning: "Kondisjon",
};

export type CapacityLevel = "svaert_lav" | "nybegynner" | "moderat" | "godt_trent" | "idrettsaktiv";

export const CAPACITY_LEVEL_ORDER: CapacityLevel[] = [
  "svaert_lav",
  "nybegynner",
  "moderat",
  "godt_trent",
  "idrettsaktiv",
];

export const CAPACITY_LEVEL_LABELS: Record<CapacityLevel, string> = {
  svaert_lav: "Svært lav / eldre / inaktiv",
  nybegynner: "Nybegynner",
  moderat: "Moderat / vanlig mosjonist",
  godt_trent: "Godt trent",
  idrettsaktiv: "Svært godt trent / idrettsaktiv",
};

export function capacityIndex(level: CapacityLevel): number {
  return CAPACITY_LEVEL_ORDER.indexOf(level);
}

/**
 * Grov, konservativ avledning av kapasitetsnivå fra kartleggingens
 * aktivitetsspørsmål (onboarding_assessments.activity_level) — ingen ny
 * kundevendt kolonne/UI, bare gjenbruk av et svar som allerede finnes.
 * Bevisst forsiktig i toppen: "svært aktiv" gir "godt_trent", ikke
 * "idrettsaktiv" — automatiske forslag skal heller undervurdere enn
 * overvurdere hva som er trygt å foreslå uten trener til stede.
 */
export function activityLevelToCapacity(activityLevel: string | null | undefined): CapacityLevel {
  switch (activityLevel) {
    case "stillesittende":
      return "svaert_lav";
    case "lett":
      return "nybegynner";
    case "aktiv":
      return "moderat";
    case "svært_aktiv":
      return "godt_trent";
    default:
      return "nybegynner";
  }
}

/** Formål/type — utvider den eksisterende `purposes`-listen med "balanse". */
export const PURPOSE_OPTIONS = [
  "styrke",
  "kontroll",
  "kondisjon",
  "balanse",
  "mobilitet",
  "avspenning",
  "robusthet",
] as const;

export const BODY_AREA_OPTIONS = ["generell", "rygg", "nakke", "skulder", "hofte", "kne"] as const;

export const EQUIPMENT_OPTIONS = [
  "ingen",
  "matte",
  "stol",
  "strikk",
  "kettlebell",
  "manualer",
  "vektstang",
  "stav",
  "boks/steg",
  "balansepute",
  "medisinball",
] as const;
