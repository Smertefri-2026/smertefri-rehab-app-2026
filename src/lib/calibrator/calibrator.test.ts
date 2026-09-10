import { describe, it, expect } from "vitest";
import { calibrate } from "./rules";
import { PROFILE_TUNING, type CalibratorInput, type CalibratorZone } from "./types";
import type { Zone } from "@/lib/zone/types";

/** Bygg N dager med sone, nyeste først, fra og med "2026-09-10". */
function zones(list: (Zone | [Zone, boolean])[]): CalibratorZone[] {
  return list.map((entry, i) => {
    const [zone, overridden] = Array.isArray(entry) ? entry : [entry, false];
    const d = new Date("2026-09-10T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    return { date: d.toISOString().slice(0, 10), zone, trainerOverridden: overridden };
  });
}

function completions(statuses: ("ja" | "delvis" | "nei")[]) {
  return statuses.map((status, i) => {
    const d = new Date("2026-09-10T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    return { date: d.toISOString().slice(0, 10), status };
  });
}

const base: CalibratorInput = {
  profile: "standard",
  stage: "styrke",
  zones: zones(["green", "green", "green", "green"]),
  completions: completions(["ja", "ja", "ja"]),
  daysSinceFlare: 30,
};

describe("calibrate — retrettregel", () => {
  it("rød sone i dag ⇒ retreat/reduce_load", () => {
    const r = calibrate({ ...base, zones: zones(["red", "green", "green"]) });
    expect(r.kind).toBe("retreat");
    expect(r.rule).toBe("retrettregel");
    expect(r.action.kind).toBe("reduce_load");
    expect(r.reasoning.length).toBeGreaterThan(0);
  });

  it("to gule dager (standard-terskel) ⇒ retreat/hold", () => {
    const r = calibrate({ ...base, zones: zones(["yellow", "green", "yellow", "green"]) });
    expect(r.kind).toBe("retreat");
    expect(r.firedSignals).toContain("repeated_yellow");
  });

  it("aktiv profil tåler to gule før retrett (terskel 3)", () => {
    const r = calibrate({
      ...base,
      profile: "aktiv",
      zones: zones(["yellow", "green", "yellow", "green", "green"]),
      completions: completions(["ja", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).not.toBe("retreat");
  });

  it("én rød dag i vinduet (ikke i dag) ⇒ konsolider", () => {
    const r = calibrate({
      ...base,
      zones: zones(["green", "green", "red", "green", "green"]),
    });
    expect(r.kind).toBe("retreat");
    expect(r.firedSignals).toContain("red_in_window");
  });

  it("to uteblitte økter ⇒ konsolider", () => {
    const r = calibrate({
      ...base,
      zones: zones(["green", "green", "green"]),
      completions: completions(["nei", "ja", "nei"]),
    });
    expect(r.kind).toBe("retreat");
    expect(r.firedSignals).toContain("low_completion");
  });
});

describe("calibrate — utvidelsesregel", () => {
  it("standard: 3 rene grønne + ren øktlogg + flare-cooldown ⇒ expand", () => {
    const r = calibrate({
      profile: "standard",
      stage: "styrke",
      zones: zones(["green", "green", "green"]),
      completions: completions(["ja", "ja", "ja"]),
      daysSinceFlare: 14,
    });
    expect(r.kind).toBe("expand");
    expect(r.rule).toBe("utvidelsesregel");
    expect(r.action.kind).toBe("increase_one_variable");
    expect(r.action.detail).toMatch(/én/i);
  });

  it("forsiktig: 3 grønne er ikke nok (trenger 5) ⇒ hold", () => {
    const r = calibrate({
      profile: "forsiktig",
      stage: "styrke",
      zones: zones(["green", "green", "green"]),
      completions: completions(["ja", "ja", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).toBe("hold");
    expect(r.reasoning).toMatch(/trenger 5/);
  });

  it("forsiktig: 5 rene grønne ⇒ expand", () => {
    const r = calibrate({
      profile: "forsiktig",
      stage: "styrke",
      zones: zones(["green", "green", "green", "green", "green"]),
      completions: completions(["ja", "ja", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).toBe("expand");
  });

  it("aktiv: 2 rene grønne er nok ⇒ expand", () => {
    const r = calibrate({
      profile: "aktiv",
      stage: "styrke",
      zones: zones(["green", "green"]),
      completions: completions(["ja", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).toBe("expand");
  });

  it("trener-overstyrt grønn dag brytes ikke som «ren» ⇒ hold", () => {
    const r = calibrate({
      profile: "standard",
      stage: "styrke",
      zones: zones(["green", ["green", true], "green", "green"]),
      completions: completions(["ja", "ja", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).toBe("hold");
  });

  it("fersk oppblussing blokkerer expand selv med nok grønne dager", () => {
    const r = calibrate({
      profile: "standard",
      stage: "styrke",
      zones: zones(["green", "green", "green", "green"]),
      completions: completions(["ja", "ja", "ja"]),
      daysSinceFlare: 3,
    });
    expect(r.kind).toBe("hold");
    expect(r.reasoning).toMatch(/oppblussing/);
  });

  it("delvis gjennomføring x2 blokkerer expand", () => {
    const r = calibrate({
      profile: "standard",
      stage: "styrke",
      zones: zones(["green", "green", "green"]),
      completions: completions(["delvis", "delvis", "ja"]),
      daysSinceFlare: 30,
    });
    expect(r.kind).toBe("hold");
  });

  it("ukjent flare-historikk (null) blokkerer ikke expand", () => {
    const r = calibrate({
      profile: "standard",
      stage: "styrke",
      zones: zones(["green", "green", "green"]),
      completions: completions(["ja", "ja"]),
      daysSinceFlare: null,
    });
    expect(r.kind).toBe("expand");
    expect(r.reasoning).toMatch(/ingen registrert oppblussing/);
  });
});

describe("calibrate — hold", () => {
  it("for få grønne dager ⇒ hold, alltid med begrunnelse", () => {
    const r = calibrate({
      ...base,
      zones: zones(["green", "green"]),
    });
    expect(r.kind).toBe("hold");
    expect(r.action.kind).toBe("hold");
    expect(r.reasoning.length).toBeGreaterThan(10);
  });

  it("tomt datagrunnlag ⇒ hold uten å kaste", () => {
    const r = calibrate({
      profile: "standard",
      stage: "ro",
      zones: [],
      completions: [],
      daysSinceFlare: null,
    });
    expect(r.kind).toBe("hold");
  });
});

describe("calibrate — invarianter", () => {
  const profiles = ["forsiktig", "standard", "aktiv"] as const;
  const stages = ["ro", "kontroll", "styrke", "robusthet", "frihet"] as const;

  it("gir alltid et forslag med ikke-tom begrunnelse og handling", () => {
    for (const profile of profiles) {
      for (const stage of stages) {
        for (const z of [["green"], ["yellow"], ["red"], ["green", "green", "green", "green", "green", "green"]] as Zone[][]) {
          const r = calibrate({
            profile,
            stage,
            zones: zones(z),
            completions: completions(["ja", "ja", "ja"]),
            daysSinceFlare: 30,
          });
          expect(["expand", "retreat", "hold"]).toContain(r.kind);
          expect(r.reasoning.trim().length).toBeGreaterThan(0);
          expect(r.action.detail.trim().length).toBeGreaterThan(0);
          expect(r.firedSignals.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("expand-terskelen følger profilen (forsiktig > standard > aktiv)", () => {
    expect(PROFILE_TUNING.forsiktig.greenStreakToExpand).toBeGreaterThan(
      PROFILE_TUNING.standard.greenStreakToExpand
    );
    expect(PROFILE_TUNING.standard.greenStreakToExpand).toBeGreaterThan(
      PROFILE_TUNING.aktiv.greenStreakToExpand
    );
  });
});
