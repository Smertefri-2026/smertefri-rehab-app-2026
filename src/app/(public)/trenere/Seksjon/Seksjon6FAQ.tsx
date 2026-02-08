// src/app/(public)/trenere/Seksjon/Seksjon6FAQ.tsx
"use client";

import { useState } from "react";

type Item = { q: string; a: string };

const FAQ: Item[] = [
  {
    q: "Er SmerteFri et bibliotek som Skadefri?",
    a: "Nei. SmerteFri er først og fremst et oppfølgingsverktøy for trener + kunde. Videobibliotek kommer som fase 2.",
  },
  {
    q: "Er dette en erstatning for ExorLive?",
    a: "Ikke i dag. SmerteFri er laget for rehab-oppfølging, struktur og progresjon. Mer avansert programbygging er planlagt i V2.",
  },
  {
    q: "Må jeg ha mange kunder for å være med?",
    a: "Nei. Du kan delta i betagruppen og bidra faglig, med eller uten aktive kunder.",
  },
  {
    q: "Kan jeg bruke SmerteFri sammen med andre verktøy?",
    a: "Ja. Mange bruker SmerteFri som navet i oppfølgingen, og andre verktøy ved behov.",
  },
  {
    q: "Hva inngår i filmingen?",
    a: "Strukturerte filmpakker (10 filmer per kroppsdel) med tydelig plan og kvalitetssikring. Du kan bidra faglig og/eller foran kamera.",
  },
  {
    q: "Hvem eier filmene?",
    a: "Vi lager en tydelig avtale før publisering. Målet er ryddige rettigheter og en rettferdig royalty-modell.",
  },
  {
    q: "Hva koster det?",
    a: "I betaperioden er målet å gjøre dette tilgjengelig og samtidig bygge en bærekraftig modell. Betagruppen får fordeler. Priser besluttes i dialog med teamet.",
  },
  {
    q: "Når kommer V2?",
    a: "Når vi har nok erfaring og data fra betatestingen til å låse standarder og bygge en mer skalerbar plattform.",
  },
];

function cn(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

export default function Seksjon6FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            FAQ
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Her er svar på de vanligste spørsmålene vi får akkurat nå.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQ.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                >
                  <span className="text-base font-semibold text-slate-900">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-700",
                      open ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                    )}
                    aria-hidden
                  >
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}