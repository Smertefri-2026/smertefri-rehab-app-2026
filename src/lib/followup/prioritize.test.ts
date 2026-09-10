import { describe, it, expect } from "vitest";
import {
  prioritizeFollowup,
  countByPriority,
  type ClientSignalInput,
} from "./prioritize";

function client(over: Partial<ClientSignalInput> = {}): ClientSignalInput {
  return {
    clientId: over.clientId ?? "c1",
    name: over.name ?? "Test Kunde",
    latestZone: null,
    latestZoneAcknowledged: true,
    firedRulesToday: [],
    checkedInToday: true,
    daysSinceCheckin: 0,
    yellowCountLast7: 0,
    painHigh: false,
    painRising: false,
    missingBaseline: false,
    hasUpcomingBooking: true,
    calibratorKind: "hold",
    ...over,
  };
}

describe("prioritizeFollowup", () => {
  it("kunde uten signaler faller ut av lista", () => {
    const items = prioritizeFollowup([client()]);
    expect(items).toHaveLength(0);
  });

  it("nytt symptom ⇒ høy prioritet, med konkret handling", () => {
    const [it] = prioritizeFollowup([client({ firedRulesToday: ["new_symptom"] })]);
    expect(it.priority).toBe("høy");
    expect(it.reasons[0]).toMatch(/symptom/i);
    expect(it.action.length).toBeGreaterThan(0);
  });

  it("uraktualisert rød sone ⇒ høy; sett rød sone ⇒ middels", () => {
    const [unseen] = prioritizeFollowup([
      client({ latestZone: "red", latestZoneAcknowledged: false }),
    ]);
    const [seen] = prioritizeFollowup([
      client({ latestZone: "red", latestZoneAcknowledged: true }),
    ]);
    expect(unseen.priority).toBe("høy");
    expect(seen.priority).toBe("middels");
  });

  it("kun manglende baseline / ingen booking ⇒ lav prioritet", () => {
    const [it] = prioritizeFollowup([
      client({ missingBaseline: true, hasUpcomingBooking: false }),
    ]);
    expect(it.priority).toBe("lav");
    expect(it.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("sorterer mest alvorlige først", () => {
    const items = prioritizeFollowup([
      client({ clientId: "lav", name: "Lav", missingBaseline: true }),
      client({ clientId: "hoy", name: "Høy", firedRulesToday: ["fear_of_training"] }),
      client({ clientId: "mid", name: "Mid", painHigh: true }),
    ]);
    expect(items.map((i) => i.clientId)).toEqual(["hoy", "mid", "lav"]);
  });

  it("viser maks tre grunner", () => {
    const [it] = prioritizeFollowup([
      client({
        latestZone: "red",
        latestZoneAcknowledged: false,
        firedRulesToday: ["new_symptom", "fear_of_training"],
        painHigh: true,
        yellowCountLast7: 3,
        missingBaseline: true,
        hasUpcomingBooking: false,
      }),
    ]);
    expect(it.reasons).toHaveLength(3);
    expect(it.priority).toBe("høy");
  });

  it("Kalibrator-retrett teller som middels, expand som lav", () => {
    const [retreat] = prioritizeFollowup([client({ calibratorKind: "retreat" })]);
    const [expand] = prioritizeFollowup([client({ calibratorKind: "expand" })]);
    expect(retreat.priority).toBe("middels");
    expect(expand.priority).toBe("lav");
  });

  it("countByPriority summerer riktig", () => {
    const items = prioritizeFollowup([
      client({ clientId: "a", firedRulesToday: ["new_symptom"] }),
      client({ clientId: "b", painHigh: true }),
      client({ clientId: "c", missingBaseline: true }),
      client({ clientId: "d" }), // faller ut
    ]);
    const counts = countByPriority(items);
    expect(counts).toEqual({ høy: 1, middels: 1, lav: 1 });
  });

  it("ingen innsjekk på 5 dager ⇒ signal med dagantall i teksten", () => {
    const [it] = prioritizeFollowup([client({ daysSinceCheckin: 5, checkedInToday: false })]);
    expect(it.reasons[0]).toMatch(/5 dager/);
  });
});
