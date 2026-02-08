// src/app/(public)/trenere/Seksjon/Seksjon4HvemKanBliMed.tsx
export default function Seksjon4HvemKanBliMed() {
  return (
    <section id="hvem" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Hvem kan bli med i SmerteFri?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            SmerteFri er laget for å bygge et faglig sterkt rehab-miljø. Derfor har vi
            tydelige kvalitetskrav.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/5 bg-emerald-50 p-6 shadow-sm">
            <div className="text-sm font-semibold text-emerald-900">Krav</div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>Minimum PT-utdanning</li>
              <li>Rehab Trainer-kurs (fullført eller pågående)</li>
             <li>Kostholdsveileder-kurs (fullført eller pågående)</li>
              <li>Ønske om å jobbe med smerte, kosthold og rehabilitering</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">Passer spesielt godt for</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "PT-er som vil spesialisere seg i rehab og smerte",
                "Rehab-trenere som vil ha et strukturert system i hverdagen",
                "Studenter i fysio/osteo som allerede har PT + rehab",
                "Trenere som vil bidra faglig og/eller med film",
              ].map((x) => (
                <div
                  key={x}
                  className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"
                >
                  {x}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold">Presisering:</span> For “vanlig PT-drift” finnes det allerede
              gode systemer. SmerteFri er spesiallaget for rehab – med fokus på trygg progresjon,
              smerteforståelse og målbar utvikling.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}