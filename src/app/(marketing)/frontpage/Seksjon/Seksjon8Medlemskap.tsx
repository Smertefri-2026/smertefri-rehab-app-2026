// src/app/frontpage/Seksjon/Seksjon8Medlemskap.tsx

export default function Seksjon8Medlemskap() {
  return (
    <section
      id="medlemskap"
      className="relative w-full bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* TOPPTEKST */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            PORTAL & MEDLEMSKAP
          </span>

          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Hvem passer{" "}
            <span className="text-[#007C80]">SmerteFri</span> for?
          </h2>

          <p className="mt-6 text-lg text-slate-700">
            SmerteFri er en nasjonal portal som kobler mennesker med smerter
            sammen med rehab-trenere i ett felles system – uansett nivå,
            bakgrunn eller utgangspunkt.
          </p>

          <p className="mt-4 font-medium text-slate-800">
            Du trenger ikke være i form.  
            Du trenger bare et trygt sted å starte.
          </p>
        </div>

        {/* KORT */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Kort 1 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              For deg med smerter
            </h3>

            <p className="mt-4 text-slate-700">
              Du har smerter i rygg, nakke, skuldre eller knær – og savner
              et system som tar deg på alvor og ser helheten.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>✓ Kroniske eller tilbakevendende smerter</li>
              <li>✓ Utrygghet rundt trening og belastning</li>
              <li>✓ Behov for struktur og trygg progresjon</li>
            </ul>
          </div>

          {/* Kort 2 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              For deg i rehabilitering
            </h3>

            <p className="mt-4 text-slate-700">
              Du er på vei tilbake etter skade, operasjon eller langvarige
              plager – og trenger kontinuitet, oppfølging og oversikt.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>✓ Samarbeid med rehab-trener</li>
              <li>✓ Tester som dokumenterer fremgang</li>
              <li>✓ Felles system for deg og treneren</li>
            </ul>
          </div>

          {/* Kort 3 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              For deg som vil fungere bedre
            </h3>

            <p className="mt-4 text-slate-700">
              Du ønsker en kropp som fungerer i hverdagen – på jobb,
              hjemme og i livet – uten stress, press eller treningshysteri.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>✓ Mer overskudd og stabilitet</li>
              <li>✓ Mindre usikkerhet rundt helse</li>
              <li>✓ En plan du faktisk klarer å følge</li>
            </ul>
          </div>
        </div>

        {/* BUNNTEKST */}
        <p className="mt-16 text-center text-sm italic text-slate-500">
          SmerteFri er ikke en quick-fix – det er et fagmiljø bygget rundt
          mennesker.
        </p>
      </div>
    </section>
  );
} 