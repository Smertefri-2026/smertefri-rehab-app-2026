// src/app/frontpage/Seksjon/Seksjon3Løsning.tsx

export default function Seksjon3Løsning() {
  return (
    <section
      id="løsningen"
      className="relative w-full bg-[#F4FBFA]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24">
        
        {/* Eyebrow */}
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-[#007C80]">
          Løsningen
        </p>

        {/* Headline */}
        <h2 className="max-w-4xl text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
          En helhetlig modell – bygget for mennesker,
          <span className="block text-[#007C80]">
            og fagpersonene som følger dem over tid
          </span>
        </h2>

        {/* Ingress */}
        <p className="mt-6 max-w-3xl text-lg text-slate-700">
          SmerteFri er bygget på moderne smertevitenskap og praktisk erfaring.
          Plattformen gir rehab-trenere og brukere et felles rammeverk for å
          forstå smerte, bygge kapasitet og dokumentere fremgang – strukturert,
          trygt og over tid.
        </p>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sf-border">
            <h3 className="mb-3 text-lg font-semibold">
              1. Forstå smerte
            </h3>
            <p className="text-sm text-slate-700">
              Smerte er ikke farlig i seg selv – men den må forstås.
              Vi følger utviklingen over tid, ikke bare hvor det gjør vondt i dag.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sf-border">
            <h3 className="mb-3 text-lg font-semibold">
              2. Trygg progresjon
            </h3>
            <p className="text-sm text-slate-700">
              Trening innenfor trygge rammer, tilpasset individet.
              Progresjon bygges gradvis – med støtte fra fagperson, ikke press.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sf-border">
            <h3 className="mb-3 text-lg font-semibold">
              3. Tester som gir mening
            </h3>
            <p className="text-sm text-slate-700">
              Standardiserte tester gir konkrete målinger på fremgang.
              Tallene brukes som dialogverktøy – ikke som prestasjonskrav.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sf-border">
            <h3 className="mb-3 text-lg font-semibold">
              4. Kosthold som støtter prosessen
            </h3>
            <p className="text-sm text-slate-700">
              Praktisk kostholdsfokus som støtter restitusjon og energi.
              Ikke dietter – men løsninger som fungerer i hverdagen.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}