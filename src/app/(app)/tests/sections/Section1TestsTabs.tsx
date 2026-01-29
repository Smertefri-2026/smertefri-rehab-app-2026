// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/tests/sections/Section1TestsTabs.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Section1TestsTabs() {
  const [open, setOpen] = useState(false);

  // Sørger for at label stemmer også hvis browseren gjenåpner details automatisk
  useEffect(() => {
    const el = document.getElementById("sf-tests-details") as HTMLDetailsElement | null;
    if (el) setOpen(el.open);
  }, []);

  return (
    <section className="w-full">
      <details
        id="sf-tests-details"
        className="group rounded-2xl border border-sf-border bg-white shadow-sm"
        onToggle={(e) => {
          const d = e.currentTarget as HTMLDetailsElement;
          setOpen(d.open);
        }}
      >
        {/* HEADER (alltid synlig) */}
        <summary className="list-none cursor-pointer p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-sf-text truncate">
              4-minutters tester + 1RM
            </div>
            <div className="text-xs text-sf-muted truncate">
              Baseline → progresjon. Enkelt, ærlig og lett å gjenta.
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

        {/* INNHOLD (default lukket) */}
        <div className="px-4 pb-4 space-y-4">
          {/* Intro */}
          <div className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4">
            <div className="text-sm font-semibold text-sf-text">Hvordan testene fungerer</div>

            <div className="mt-2 space-y-2 text-sm text-sf-muted">
              <p>
                Du konkurrerer ikke mot andre – bare deg selv. Første gang du tester blir{" "}
                <span className="font-medium text-sf-text">baseline</span>. Alle senere tester
                sammenlignes med baseline, så du ser progresjon når du trener jevnt, sover og spiser
                bra.
              </p>

              <p>
                Vi bruker{" "}
                <span className="font-medium text-sf-text">4-minutters tester</span> for å få en
                enkel og repeterbar måling av arbeidskapasitet (kropp + kondis). I tillegg måler vi{" "}
                <span className="font-medium text-sf-text">1RM</span> for å få et tydelig bilde av
                maksimal styrke.
              </p>

              <p className="text-xs text-sf-muted">
                PS: Mange kjenner “4×4” som intervalløkter (4 min hardt + 3 min rolig × 4). Hos oss
                brukes 4-min som testformat. I kondis-delen har vi også en “vår 4×4-variant” fordi du
                kan teste 4 minutter på 4 ulike apparater (mølle, sykkel, roing, ski).
              </p>
            </div>
          </div>

          {/* Test-bokser */}
          <div className="grid gap-3 lg:grid-cols-3">
            {/* EGENVEKT */}
            <div className="rounded-2xl border border-sf-border bg-white p-4">
              <div className="text-sm font-semibold text-sf-text">Egenvekt (4 min)</div>
              <div className="mt-2 text-sm text-sf-muted space-y-2">
                <p>
                  Måler <span className="text-sf-text font-medium">styrkeutholdenhet</span> og
                  arbeidskapasitet med egen kroppsvekt:{" "}
                  <span className="text-sf-text font-medium">
                    knebøy → armhevinger → situps → planke
                  </span>
                  .
                </p>
                <p className="text-xs text-sf-muted">
                  <span className="text-sf-text font-medium">Planke:</span> Målet er total “tid i planke”
                  innenfor 4 minutter – og/eller antall pauser (kne/hele kroppen i bakken). Den følelsen
                  når du går fra “mange pauser” til “0 pauser” er helt rå.
                </p>
                <p>
                  Denne testen er ofte veldig “ærlig” på{" "}
                  <span className="text-sf-text font-medium">søvn, stress og kontinuitet</span> –
                  små endringer i hverdagen gir ofte utslag.
                </p>
              </div>
            </div>

            {/* STYRKE */}
            <div className="rounded-2xl border border-sf-border bg-white p-4">
              <div className="text-sm font-semibold text-sf-text">Styrke (1RM)</div>
              <div className="mt-2 text-sm text-sf-muted space-y-2">
                <p>
                  Måler <span className="text-sf-text font-medium">maksstyrke</span> (1RM) i baseøvelser:
                  <span className="text-sf-text font-medium"> knebøy → markløft → benkpress</span>.
                </p>
                <p className="text-xs text-sf-muted">
                  <span className="text-sf-text font-medium">Hva er 1RM?</span> 1RM betyr “én repetisjon maks”
                  – den tyngste vekten du kan løfte én gang med god teknikk. (Mange bruker også estimat hvis
                  man ikke vil løfte helt maks.)
                </p>
              </div>
            </div>

            {/* KONDIS */}
            <div className="rounded-2xl border border-sf-border bg-white p-4">
              <div className="text-sm font-semibold text-sf-text">Kondis (4 min)</div>
              <div className="mt-2 text-sm text-sf-muted space-y-2">
                <p>
                  Måler utholdenhet som distanse på 4 minutter (mølle, sykkel, roing, ski). Dette sier mye om{" "}
                  <span className="text-sf-text font-medium">arbeidskapasitet</span> og hvor godt du tåler
                  belastning.
                </p>
                <p>
                  Kondis er ofte “motoren” som gjør at du lykkes bedre på resten: bedre oksygenopptak og
                  arbeidskapasitet kan gi{" "}
                  <span className="text-sf-text font-medium">bedre restitusjon</span>, mer energi i øktene og
                  høyere total treningskvalitet.
                </p>
                <p className="text-xs text-sf-muted">
                  Tips: Vil du trene klassisk 4×4? Kjør 4 min hardt + ca 3 min rolig × 4 på favorittapparatet ditt.
                  Test derimot på en dag du føler deg “normal” – ikke bare de dagene du er superfresh.
                </p>
              </div>
            </div>
          </div>

          {/* Standardisering / tips */}
          <div className="rounded-2xl border border-sf-border bg-white p-4">
            <div className="text-sm font-semibold text-sf-text">Tips for rettferdig sammenligning</div>
            <ul className="mt-2 space-y-2 text-sm text-sf-muted list-disc pl-5">
              <li>
                Hold testene så like som mulig:{" "}
                <span className="text-sf-text font-medium">samme øvelser, samme rekkefølge, samme oppvarming</span>.
              </li>
              <li>
                Test gjerne omtrent <span className="text-sf-text font-medium">samme tid på døgnet</span> og med{" "}
                <span className="text-sf-text font-medium">lignende matinntak</span> (f.eks. “lett måltid 1–2 t før”
                eller “alltid etter jobb”).
              </li>
              <li>
                Notér mentalt “dagen”: søvn, stress, smerte, dagsform – så tolker du tallene mer riktig.
              </li>
              <li>
                Ikke jag maks hver gang. Målet er <span className="text-sf-text font-medium">repeterbarhet</span>, ikke
                å “vinne testen”.
              </li>
            </ul>
          </div>

          {/* Les mer / forskning */}
          <div className="rounded-2xl border border-sf-border bg-[#F9FEFD] p-4">
            <div className="text-sm font-semibold text-sf-text">Les mer (forskning)</div>

            <div className="mt-2 space-y-2 text-sm text-sf-muted">
              <p>
                For mange som er utrente, har smerter eller kommer fra et lavt aktivitetsnivå er det ekstra viktig å vite
                at intensiv trening kan være trygt når det gjennomføres smart og tilpasset.
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Norsk hjerterehab / sikkerhet ved høy intensitet (CHD):{" "}
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/22879367/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    PubMed (Rognmo m.fl.)
                  </a>
                </li>
                <li>
                  HIIT vs moderat trening (meta-analyse, bl.a. VO₂peak):{" "}
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/24144531/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    PubMed
                  </a>
                </li>
                <li>
                  Norsk, lettlest forklaring av 4×4-konseptet (NTNU/SINTEF):{" "}
                  <a
                    href="https://gemini.no/2024/04/4x4-trening-populaer-og-omdiskutert/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    Gemini.no
                  </a>
                </li>
              </ul>

              <p className="text-xs text-sf-muted">
                Vil du vite mer om forsking, kontakt din trener, følg med her eller på vår hjemmeside smertefri.no
              </p>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}