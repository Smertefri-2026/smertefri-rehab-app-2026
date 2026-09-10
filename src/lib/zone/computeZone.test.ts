import { describe, it, expect } from "vitest";
import { computeZone } from "./computeZone";
import { rollingBaseline } from "./baseline";
import type { DailyCheckinInput, ZoneContext } from "./types";

const TODAY = "2026-09-15";

const okInput: DailyCheckinInput = {
  painNow: 3,
  sleep: "ok",
  energy: "ok",
  newSymptom: false,
  completedPlannedActivity: "ja",
  afraidToTrain: false,
};

const baselineCtx: ZoneContext = {
  baselinePain: 3,
  recentPain: [
    { date: "2026-09-14", intensity: 3 },
    { date: "2026-09-13", intensity: 3 },
    { date: "2026-09-12", intensity: 2 },
  ],
  today: TODAY,
};

describe("computeZone – grønn", () => {
  it("stabil smerte, god restitusjon, gjennomført ⇒ grønn", () => {
    const r = computeZone(okInput, baselineCtx);
    expect(r.zone).toBe("green");
    expect(r.firedRules).toEqual([]);
    expect(r.reason).toBeTruthy();
  });
});

describe("computeZone – rød", () => {
  it("nytt symptom ⇒ rød", () => {
    const r = computeZone({ ...okInput, newSymptom: true }, baselineCtx);
    expect(r.zone).toBe("red");
    expect(r.firedRules).toContain("new_symptom");
  });

  it("frykt for å trene ⇒ rød", () => {
    const r = computeZone({ ...okInput, afraidToTrain: true }, baselineCtx);
    expect(r.zone).toBe("red");
    expect(r.firedRules).toContain("fear_of_training");
  });

  it("høy absolutt smerte uten baseline ⇒ rød", () => {
    const r = computeZone(
      { ...okInput, painNow: 8 },
      { baselinePain: null, recentPain: [], today: TODAY }
    );
    expect(r.zone).toBe("red");
    expect(r.firedRules).toContain("high_absolute_pain");
  });

  it("lav gjennomføring + stigende smerte ⇒ rød", () => {
    const r = computeZone(
      { ...okInput, painNow: 5, completedPlannedActivity: "nei" },
      baselineCtx
    );
    expect(r.zone).toBe("red");
    expect(r.firedRules).toContain("low_completion_with_rising_pain");
  });

  it("vedvarende smerteøkning over flere dager ⇒ rød", () => {
    const r = computeZone(
      { ...okInput, painNow: 5 },
      {
        baselinePain: 3,
        recentPain: [
          { date: "2026-09-14", intensity: 5 },
          { date: "2026-09-13", intensity: 5 },
          { date: "2026-09-12", intensity: 3 },
        ],
        today: TODAY,
      }
    );
    expect(r.zone).toBe("red");
    expect(r.firedRules).toContain("sustained_pain_rise");
  });
});

describe("computeZone – gul", () => {
  it("moderat smerteøkning fra normalnivå ⇒ gul", () => {
    const r = computeZone({ ...okInput, painNow: 5 }, baselineCtx);
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("moderate_pain_rise");
  });

  it("dårlig søvn ⇒ gul", () => {
    const r = computeZone({ ...okInput, sleep: "dårlig" }, baselineCtx);
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("poor_recovery");
  });

  it("lavt overskudd ⇒ gul", () => {
    const r = computeZone({ ...okInput, energy: "lavt" }, baselineCtx);
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("poor_recovery");
  });

  it("oppblussing siste døgn ⇒ gul", () => {
    const r = computeZone(okInput, {
      baselinePain: 3,
      recentPain: [{ date: "2026-09-14", intensity: 7 }],
      today: TODAY,
    });
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("recent_flare");
  });

  it("lav gjennomføring uten smerteøkning ⇒ gul (usikkerhet, ikke fare)", () => {
    const r = computeZone(
      { ...okInput, completedPlannedActivity: "nei" },
      baselineCtx
    );
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("low_completion");
    expect(r.firedRules).not.toContain("low_completion_with_rising_pain");
  });

  it("delvis gjennomføring med litt økt smerte ⇒ gul", () => {
    const r = computeZone(
      { ...okInput, painNow: 4, completedPlannedActivity: "delvis" },
      baselineCtx
    );
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("partial_completion_with_rise");
  });
});

describe("computeZone – båndprioritet og robusthet", () => {
  it("rød slår gul når begge trigges", () => {
    const r = computeZone(
      { ...okInput, painNow: 5, sleep: "dårlig", newSymptom: true },
      baselineCtx
    );
    expect(r.zone).toBe("red");
  });

  it("uten baseline trigges ikke smerte-vs-baseline-reglene, men andre gjør", () => {
    const r = computeZone(
      { ...okInput, painNow: 6, sleep: "dårlig" },
      { baselinePain: null, recentPain: [], today: TODAY }
    );
    expect(r.zone).toBe("yellow");
    expect(r.firedRules).toContain("poor_recovery");
    expect(r.firedRules).not.toContain("moderate_pain_rise");
  });

  it("reason er alltid ikke-tom", () => {
    for (const z of ["green", "yellow", "red"] as const) {
      const input =
        z === "red"
          ? { ...okInput, newSymptom: true }
          : z === "yellow"
          ? { ...okInput, sleep: "dårlig" as const }
          : okInput;
      expect(computeZone(input, baselineCtx).reason.length).toBeGreaterThan(0);
    }
  });
});

describe("rollingBaseline", () => {
  it("null når for få målinger", () => {
    expect(
      rollingBaseline([{ date: "2026-09-14", intensity: 4 }], { today: TODAY })
    ).toBeNull();
  });

  it("snitt av målinger innenfor vinduet", () => {
    const b = rollingBaseline(
      [
        { date: "2026-09-14", intensity: 4 },
        { date: "2026-09-10", intensity: 2 },
        { date: "2026-09-06", intensity: 3 },
      ],
      { today: TODAY }
    );
    expect(b).toBe(3);
  });

  it("ignorerer målinger utenfor 14-dagersvinduet", () => {
    const b = rollingBaseline(
      [
        { date: "2026-09-14", intensity: 4 },
        { date: "2026-09-13", intensity: 4 },
        { date: "2026-09-12", intensity: 4 },
        { date: "2026-08-01", intensity: 10 },
      ],
      { today: TODAY }
    );
    expect(b).toBe(4);
  });
});
