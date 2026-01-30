// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/nutrition/sections/Section1NutritionToday.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { loadDay, yyyyMmDd, sumMeals } from "@/modules/nutrition/storage";
import { calcTdee } from "@/modules/nutrition/calc";

type Totals = {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

function goalMeta(goal: any) {
  if (goal === "lose_fat") return { label: "Vektreduksjon", pct: "−15%", factor: 0.85, why: "Moderat energiunderskudd over tid." };
  if (goal === "gain_muscle") return { label: "Muskelvekst", pct: "+10%", factor: 1.1, why: "Lite energioverskudd + styrketrening." };
  if (goal === "maintain") return { label: "Vedlikeholde", pct: "0%", factor: 1.0, why: "Energi inn ≈ energi ut." };
  return null;
}

export default function Section1NutritionToday() {
  const date = yyyyMmDd();

  const [open, setOpen] = useState(false);
  const [totals, setTotals] = useState<Totals>({
    calories_kcal: 0,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
  });

  // (valgfritt) kan gi enda mer “live” forklaring hvis du ønsker å hente profil her senere.
  // Per nå forklarer vi fagbegrepene og logikken uansett, uten å kreve profil i denne seksjonen.
  const dummyProfileForExplainer: any = null;

  useEffect(() => {
    const day = loadDay(date);
    const consumed = sumMeals(day.meals);

    setTotals({
      calories_kcal: Math.round(consumed.calories_kcal || 0),
      protein_g: Math.round(consumed.protein_g || 0),
      fat_g: Math.round(consumed.fat_g || 0),
      carbs_g: Math.round(consumed.carbs_g || 0),
    });
  }, [date]);

  // “nice-to-have”: hvis du senere sender inn profil hit, kan du vise ekte BMR/PAL/TDEE i denne teksten også.
  const tdeePack = dummyProfileForExplainer ? calcTdee(dummyProfileForExplainer) : { bmr: null, pal: null, tdee: null };

  return (
    <section className="w-full">
      <details
        id="sf-nutrition-today"
        open={false}
        className="group rounded-2xl border border-sf-border bg-white shadow-sm"
        onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        {/* HEADER */}
        <summary className="list-none cursor-pointer p-6 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="text-base font-semibold text-sf-text truncate">
              Makronæringsstoffer + dagsbehov
            </div>
            <div className="text-xs text-sf-muted truncate">
              Energi (kcal) + makroer (protein/karbo/fett) → forståelig, faglig og praktisk.
            </div>
          </div>

          <span className="shrink-0 rounded-xl border border-sf-border bg-white px-3 py-2 text-xs text-sf-muted flex items-center gap-2">
            <span className="hidden sm:inline">{open ? "Lukk" : "Åpne"}</span>
            <ChevronDown
              size={16}
              className="transition-transform duration-200 group-open:rotate-180"
            />
          </span>
        </summary>

        {/* INNHOLD */}
        <div className="px-6 pb-6 space-y-4">
          {/* 0) Quick: hva betyr tallene i praksis */}
          <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
            <div className="text-sm font-semibold text-sf-text">Hva følger vi – og hvorfor?</div>

            <div className="mt-2 space-y-2 text-sm text-sf-muted">
              <p>
                Her skiller vi mellom <span className="font-medium text-sf-text">energi (kcal)</span> og{" "}
                <span className="font-medium text-sf-text">makronæringsstoffer</span>.
                Kalorier sier noe om <span className="font-medium text-sf-text">mengde energi</span>, mens makroer sier noe om{" "}
                <span className="font-medium text-sf-text">hva kroppen får for å prestere, restituere og fungere</span>.
              </p>

              <p className="text-xs text-sf-muted">
                “Makro” = energigivende næringsstoffer: <span className="font-medium text-sf-text">protein</span>,{" "}
                <span className="font-medium text-sf-text">karbohydrater (CHO)</span> og{" "}
                <span className="font-medium text-sf-text">fett (lipider)</span>. “Mikro” = vitaminer/mineraler (uten energi, men helt avgjørende).
              </p>
            </div>
          </div>

          {/* 1) Makroer forklart (kundespråk + fagspråk) */}
          <div className="rounded-2xl border border-sf-border bg-white p-4">
            <div className="text-sm font-semibold text-sf-text">Makronæringsstoffer (makroer)</div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-sf-border bg-white p-4">
                <div className="text-xs text-sf-muted">Protein</div>
                <div className="mt-1 text-sm font-semibold text-sf-text">Bygg, reparer, metthet</div>
                <div className="mt-1 text-xs text-sf-muted">
                  Viktig for muskulatur, bindevev, enzymer, hormoner og immunforsvar. Protein gir ofte{" "}
                  <span className="font-medium text-sf-text">god metthet</span>.
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-4">
                <div className="text-xs text-sf-muted">Karbohydrater (CHO)</div>
                <div className="mt-1 text-sm font-semibold text-sf-text">Rask energi, glykogen</div>
                <div className="mt-1 text-xs text-sf-muted">
                  Kroppens “høyoktan” ved aktivitet. Ved høy intensitet blir{" "}
                  <span className="font-medium text-sf-text">muskelglykogen</span> ofte primær energikilde.
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-4">
                <div className="text-xs text-sf-muted">Fett (lipider)</div>
                <div className="mt-1 text-sm font-semibold text-sf-text">Hormoner, opptak, reserve</div>
                <div className="mt-1 text-xs text-sf-muted">
                  Energireserve, beskyttelse, temperaturregulering og transport av{" "}
                  <span className="font-medium text-sf-text">fettløselige vitaminer</span>.
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-sf-border bg-[#F9FEFD] p-4 text-xs text-sf-muted">
              <span className="font-semibold text-sf-text">Husk:</span> Målet er ikke “perfekt hver dag”, men{" "}
              <span className="font-medium text-sf-text">jevnhet og trend</span> – spesielt hvis du trener og vil ha progresjon uten stress.
            </div>
          </div>

          {/* 2) Energiutgifter forklart (BMR/PAL/TDEE + TEF/NEAT) */}
          <div className="rounded-2xl border border-sf-border bg-white p-4">
            <div className="text-sm font-semibold text-sf-text">Dagsbehov (energibehov) – fagbegrepene</div>

            <div className="mt-2 space-y-2 text-sm text-sf-muted">
              <p>
                <span className="font-medium text-sf-text">Energibalanse</span> er forholdet mellom{" "}
                <span className="font-medium text-sf-text">energi inn</span> (mat/drikke) og{" "}
                <span className="font-medium text-sf-text">energi ut</span> (metabolisme + aktivitet).
                Når dette er balansert er man ofte <span className="font-medium text-sf-text">vektstabil</span>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">BMR / hvilemetabolisme</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">Basalmetabolisme</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Kroppens energibruk i hvile for å holde livsviktige funksjoner i gang.
                    (I profilen bruker vi <span className="font-medium text-sf-text">Mifflin–St Jeor</span>.)
                  </div>
                </div>

                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">PAL</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">Physical Activity Level</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Aktivitetsnivå som “skalerer opp” BMR basert på jobb, hverdagsaktivitet og trening.
                  </div>
                </div>

                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">TDEE</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">Total Daily Energy Expenditure</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Totalt energibehov per dag. I appen:{" "}
                    <span className="font-medium text-sf-text">TDEE = BMR × PAL</span>.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4 text-sm text-sf-muted space-y-1">
                <div>
                  <span className="font-semibold text-sf-text">TEF</span> (matens termogene effekt):
                  Energi brukt på fordøyelse/absorpsjon. Protein gir ofte høyest TEF.
                </div>
                <div>
                  <span className="font-semibold text-sf-text">NEAT</span> (non-exercise activity thermogenesis):
                  “Hverdagsbevegelse” (stå, gå, småting) som kan variere mye fra dag til dag.
                </div>
                <div className="text-xs">
                  Derfor er dagsbehov alltid et <span className="font-medium text-sf-text">estimat</span> – trend over tid er mer relevant enn én dag.
                </div>
              </div>
            </div>
          </div>

          {/* 3) Måljustering – helt transparent */}
          <div className="rounded-2xl border border-sf-border bg-white p-4">
            <div className="text-sm font-semibold text-sf-text">Målsetting: hva gjør appen med kaloriene?</div>

            <div className="mt-2 space-y-2 text-sm text-sf-muted">
              <p>
                I profilen velger du mål. Appen bruker dette til å justere kalorimålet fra beregnet{" "}
                <span className="font-medium text-sf-text">TDEE</span>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">Vektreduksjon</div>
                  <div className="mt-1 text-lg font-semibold text-sf-text">−15%</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Moderat underskudd som er lettere å holde over tid – spesielt hvis du trener.
                  </div>
                </div>

                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">Vedlikeholde</div>
                  <div className="mt-1 text-lg font-semibold text-sf-text">0%</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Energi inn ≈ energi ut. Bra for stabilitet og prestasjon.
                  </div>
                </div>

                <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
                  <div className="text-xs text-sf-muted">Muskelvekst</div>
                  <div className="mt-1 text-lg font-semibold text-sf-text">+10%</div>
                  <div className="mt-1 text-xs text-sf-muted">
                    Lite overskudd + god styrketrening og nok protein.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-sf-border bg-white p-4 text-xs text-sf-muted">
                <span className="font-semibold text-sf-text">Kort sagt:</span> TDEE gir “grunnkartet”.
                Måljusteringen er “rattet” (−15% / 0% / +10%). Makroene er “motoren” (restitusjon, energi og helse).
              </div>
            </div>
          </div>

          {/* 4) Valgfritt: i dag-logg (hvis noe er registrert) */}
          {(totals.calories_kcal > 0 || totals.protein_g > 0 || totals.carbs_g > 0 || totals.fat_g > 0) && (
            <div className="rounded-2xl border border-sf-border bg-[#F7FBFB] p-4">
              <div className="text-sm font-semibold text-sf-text">I dag (registrert)</div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                  <div className="text-[11px] text-sf-muted">Energi</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">{totals.calories_kcal} kcal</div>
                </div>
                <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                  <div className="text-[11px] text-sf-muted">Protein</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">{totals.protein_g} g</div>
                </div>
                <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                  <div className="text-[11px] text-sf-muted">Karbo</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">{totals.carbs_g} g</div>
                </div>
                <div className="rounded-2xl border border-sf-border bg-white p-3 text-center">
                  <div className="text-[11px] text-sf-muted">Fett</div>
                  <div className="mt-1 text-sm font-semibold text-sf-text">{totals.fat_g} g</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-sf-muted">
                Ikke stress enkeltdager – se trend over 7–14 dager sammen med søvn, energi, trening og vektutvikling.
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-sf-muted">
            <span />
            <Link href="/nutrition/profile" className="underline hover:opacity-80">
              Juster mål i profilen
            </Link>
          </div>
        </div>
      </details>
    </section>
  );
}