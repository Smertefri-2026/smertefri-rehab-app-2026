// src/app/(public)/trenere/Seksjon/Seksjon2HvaEr.tsx
export default function Seksjon2HvaEr() {
  return (
    <section id="hva" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Hva er SmerteFri – i praksis?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            SmerteFri er først og fremst et <span className="font-semibold">oppfølgingsverktøy</span>{" "}
            for deg som rehab-trener og kundene dine. Kjernen er relasjonen{" "}
            <span className="font-semibold">trener + kunde</span>, med struktur som gjør det enklere
            å jobbe med smerte, progresjon og trygg trening over tid.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            Samtidig bygger vi grunnlaget for fase 2: et videobibliotek for mennesker som{" "}
            <span className="font-semibold">ikke har valgt trener enda</span>, men som ønsker å betale
            en månedlig sum for å komme i gang med kvalitetssikrede rehab-videoer og en trygg struktur.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-emerald-50 p-6 shadow-sm">
            <div className="text-sm font-semibold text-emerald-900">Spor 1 (nå)</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">Trener + kunde</div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Oppfølging og struktur i hverdagen</li>
              <li>Smerte, tester, progresjon og dialog</li>
              <li>Trygghet for kunden – kontroll for trener</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Spor 2 (kommer)</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">Videobibliotek</div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>For nye brukere uten valgt trener</li>
              <li>Som “inngang” til rehab-trener</li>
              <li>Mulighet for royalty til trenere som bidrar med filmer</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}