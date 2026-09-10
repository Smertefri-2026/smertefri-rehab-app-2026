// «Hvem trenger meg i dag» — ren prioriteringslogikk for trenerens
// oppfølgingsflate. Signaler inn, prioritert liste ut. Svarer på:
//   hvem · hvorfor · hvor alvorlig · hva treneren bør gjøre videre.
// Ingen detaljer om Sonen/Trappen/program her — det bor på kundesiden.

import type { Zone } from "@/lib/zone/types";

export type FollowupPriority = "høy" | "middels" | "lav";

/** Rå signaler for én kunde, hentet i followup.api.ts. */
export type ClientSignalInput = {
  clientId: string;
  name: string;

  latestZone: Zone | null;
  /** Har treneren sett/overstyrt dagens sone, eller er den mer enn ~1 dag gammel? */
  latestZoneAcknowledged: boolean;
  /** Regelnavn som slo til i dagens innsjekk (fra zone_history.inputs_snapshot). */
  firedRulesToday: string[];
  checkedInToday: boolean;
  daysSinceCheckin: number | null;
  yellowCountLast7: number;

  painHigh: boolean;
  painRising: boolean;

  missingBaseline: boolean;
  hasUpcomingBooking: boolean;

  calibratorKind: "expand" | "retreat" | "hold" | null;
};

export type FollowupItem = {
  clientId: string;
  name: string;
  priority: FollowupPriority;
  score: number;
  /** Kort «hvorfor», viktigst først. */
  reasons: string[];
  /** Ett konkret neste steg for treneren. */
  action: string;
};

type Signal = {
  weight: number;
  reason: string;
  action: string;
};

const PRIORITY_FLOOR: Record<FollowupPriority, number> = { høy: 100, middels: 40, lav: 10 };

function priorityFromScore(score: number): FollowupPriority {
  if (score >= PRIORITY_FLOOR.høy) return "høy";
  if (score >= PRIORITY_FLOOR.middels) return "middels";
  return "lav";
}

function signalsFor(c: ClientSignalInput): Signal[] {
  const out: Signal[] = [];

  const newSymptom = c.firedRulesToday.includes("new_symptom");
  const fear = c.firedRulesToday.includes("fear_of_training");

  if (newSymptom) {
    out.push({
      weight: 130,
      reason: "Nytt eller uventet symptom rapportert i dag",
      action: "Ta kontakt før neste økt og avklar symptomet før progresjon.",
    });
  }
  if (fear) {
    out.push({
      weight: 115,
      reason: "Kunden kjenner frykt for å trene i dag",
      action: "Send en kort, trygg melding og juster dagens økt ned.",
    });
  }
  if (c.latestZone === "red" && !c.latestZoneAcknowledged) {
    out.push({
      weight: 110,
      reason: "Rød Sone i dag – ikke vurdert av deg ennå",
      action: "Åpne kunden, se på innsjekken og bekreft eller overstyr Sonen.",
    });
  }
  if (c.latestZone === "red" && c.latestZoneAcknowledged) {
    out.push({
      weight: 55,
      reason: "Rød Sone (sett)",
      action: "Følg opp at belastningen faktisk er tatt ned.",
    });
  }
  if (c.calibratorKind === "retreat") {
    out.push({
      weight: 50,
      reason: "Kalibratoren foreslår å trappe ned belastningen",
      action: "Åpne kunden og ta stilling til Kalibrator-forslaget.",
    });
  }
  if (c.yellowCountLast7 >= 3) {
    out.push({
      weight: 48,
      reason: `Gul Sone ${c.yellowCountLast7} dager siste uke`,
      action: "Sjekk Kalibratoren – trolig hold nivået til det stabiliserer seg.",
    });
  } else if (c.yellowCountLast7 === 2) {
    out.push({
      weight: 42,
      reason: "Gul Sone 2 dager siste uke",
      action: "Følg med – vurder å holde nivået denne uka.",
    });
  }
  if (c.painHigh) {
    out.push({
      weight: 46,
      reason: "Høy smerte siste uke",
      action: "Gå gjennom smertehistorikken på kundesiden.",
    });
  } else if (c.painRising) {
    out.push({
      weight: 41,
      reason: "Økende smerte siste uke",
      action: "Gå gjennom smertehistorikken på kundesiden.",
    });
  }
  if (c.daysSinceCheckin != null && c.daysSinceCheckin >= 4) {
    out.push({
      weight: 40,
      reason: `Ingen innsjekk på ${c.daysSinceCheckin} dager`,
      action: "Send en påminnelse om den daglige innsjekken.",
    });
  }
  if (c.calibratorKind === "expand") {
    out.push({
      weight: 22,
      reason: "Kalibratoren foreslår å øke belastningen",
      action: "Åpne kunden og godkjenn eller avvis forslaget.",
    });
  }
  if (c.missingBaseline) {
    out.push({
      weight: 16,
      reason: "Mangler baseline-tester",
      action: "Be kunden ta baseline-testene ved neste anledning.",
    });
  }
  if (!c.hasUpcomingBooking) {
    out.push({
      weight: 14,
      reason: "Ingen kommende time booket",
      action: "Book neste oppfølging.",
    });
  }

  return out.sort((a, b) => b.weight - a.weight);
}

/** Bygg den prioriterte lista. Kunder uten signaler faller ut. */
export function prioritizeFollowup(clients: ClientSignalInput[]): FollowupItem[] {
  return clients
    .map((c) => {
      const sigs = signalsFor(c);
      if (sigs.length === 0) return null;

      // Score: tyngste signal + en avtagende bonus for de neste.
      const score = sigs.reduce((acc, s, i) => acc + (i === 0 ? s.weight : s.weight * 0.25), 0);

      return {
        clientId: c.clientId,
        name: c.name,
        priority: priorityFromScore(sigs[0].weight),
        score,
        reasons: sigs.slice(0, 3).map((s) => s.reason),
        action: sigs[0].action,
      } satisfies FollowupItem;
    })
    .filter((x): x is FollowupItem => x !== null)
    .sort((a, b) => b.score - a.score);
}

/** Antall per prioritet — til toppsammendraget. */
export function countByPriority(items: FollowupItem[]): Record<FollowupPriority, number> {
  return items.reduce(
    (acc, it) => {
      acc[it.priority]++;
      return acc;
    },
    { høy: 0, middels: 0, lav: 0 } as Record<FollowupPriority, number>
  );
}
