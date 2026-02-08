// src/app/frontpage/Seksjon/Seksjon2Kjenner.tsx

export default function Seksjon2Kjenner() {
  return (
    <section
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Overline */}
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          Kjenner du deg igjen?
        </p>

        {/* Heading */}
        <h2 className="max-w-4xl text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
          De fleste lever med smerter –{" "}
          <span className="text-[#007C80]">
            ikke fordi kroppen er ødelagt
          </span>
          , men fordi ingen har lært dem å forstå den.
        </h2>

        {/* Ingress – lett justert */}
        <p className="mt-6 max-w-3xl text-lg text-slate-700">
          Rygg, nakke, skuldre, hofter eller knær. Du har kanskje prøvd
          fysioterapi, personlig trener, hvile eller øvelser fra YouTube –
          ofte uten en helhetlig plan eller langsiktig oppfølging.
        </p>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-slate-900">
              🔁 Samme sirkel – igjen og igjen
            </h3>
            <p className="text-slate-700">
              Du får lindring i perioder, men smerten kommer tilbake.
              Uten felles struktur blir tiltakene fragmenterte.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-slate-900">
              ❓ Motstridende råd
            </h3>
            <p className="text-slate-700">
              Én fagperson sier «styrk», en annen sier «unngå belastning».
              Resultatet er usikkerhet – ikke fremgang.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-slate-900">
              📉 Ingen tydelig fremgang
            </h3>
            <p className="text-slate-700">
              Du gjør øvelser, men mangler målinger, tester og oversikt.
              Da er det umulig å vite hva som faktisk fungerer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-slate-900">
              😕 Ansvar uten støtte
            </h3>
            <p className="text-slate-700">
              Når oppfølgingen stopper, blir alt ditt ansvar alene.
              Mange gir opp – ikke fordi de mangler vilje, men fordi systemet mangler.
            </p>
          </div>
        </div>

        {/* Bottom statement – styrket */}
        <div className="mt-16 max-w-3xl">
          <h3 className="text-xl font-semibold text-slate-900">
            Det er ikke kroppen din som er problemet.
          </h3>
          <p className="mt-3 text-slate-700">
            Problemet er mangelen på helhet, struktur og kontinuitet mellom
            mennesker og fagpersoner.  
            SmerteFri er bygget for å samle dette i én plattform.
          </p>
        </div>
      </div>
    </section>
  );
}