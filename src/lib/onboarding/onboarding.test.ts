import { describe, it, expect } from "vitest";
import { suggestCalibrationProfile } from "./calibration";
import { isRedFlagCleared, RED_FLAG_QUESTIONS } from "./redFlags";

describe("suggestCalibrationProfile", () => {
  it("høy frykt + langvarig + stillesittende ⇒ forsiktig", () => {
    const r = suggestCalibrationProfile({
      fearOfMovementScore: 8,
      activityLevel: "stillesittende",
      problemDuration: "over_1_ar",
      painIntensityNow: 4,
      stressLevel: "moderat",
    });
    expect(r.profile).toBe("forsiktig");
    expect(r.factors.length).toBeGreaterThan(0);
  });

  it("lav frykt + svært aktiv + ferske plager ⇒ aktiv", () => {
    const r = suggestCalibrationProfile({
      fearOfMovementScore: 1,
      activityLevel: "svært_aktiv",
      problemDuration: "under_6_uker",
      painIntensityNow: 2,
      stressLevel: "lavt",
    });
    expect(r.profile).toBe("aktiv");
  });

  it("blandede svar ⇒ standard", () => {
    const r = suggestCalibrationProfile({
      fearOfMovementScore: 4,
      activityLevel: "lett",
      problemDuration: "6_uker_3_mnd",
      painIntensityNow: 4,
      stressLevel: "moderat",
    });
    expect(r.profile).toBe("standard");
  });

  it("tåler manglende svar", () => {
    const r = suggestCalibrationProfile({
      fearOfMovementScore: null,
      activityLevel: null,
      problemDuration: null,
      painIntensityNow: null,
      stressLevel: null,
    });
    expect(["forsiktig", "standard", "aktiv"]).toContain(r.profile);
  });
});

describe("isRedFlagCleared", () => {
  it("alle nei ⇒ klarert", () => {
    const answers = Object.fromEntries(RED_FLAG_QUESTIONS.map((q) => [q.key, false]));
    expect(isRedFlagCleared(answers)).toBe(true);
  });

  it("ett ja ⇒ ikke klarert", () => {
    const answers = Object.fromEntries(RED_FLAG_QUESTIONS.map((q) => [q.key, false]));
    answers[RED_FLAG_QUESTIONS[0].key] = true;
    expect(isRedFlagCleared(answers)).toBe(false);
  });

  it("tomt svarsett ⇒ klarert (ingen ja)", () => {
    expect(isRedFlagCleared({})).toBe(true);
  });
});
