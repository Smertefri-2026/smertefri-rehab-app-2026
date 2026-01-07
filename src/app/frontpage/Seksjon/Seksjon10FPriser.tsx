// src/app/frontpage/Seksjon/Seksjon10FPriser.tsx

export default function Seksjon10FPriser() {
  return (
    <section
      id="priser"
      className="relative w-full bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Overtekst */}
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-[#007C80] mb-4">
          Medlemskap & oppfølging
        </p>

        {/* Tittel */}
        <h2 className="text-center text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
          Du investerer i{" "}
          <span className="text-[#007C80]">faglig kvalitet</span> – ikke tilfeldige løsninger
        </h2>

        {/* Ingress */}
        <p className="mx-auto max-w-2xl text-center text-slate-600 mb-16">
          SmerteFri er en portal som kobler deg med kompetente rehab-trenere.
          Prisene gjenspeiler trygg progresjon, personlig oppfølging og et system
          bygget for faktisk fremgang – ikke volum og hastverk.
        </p>

        {/* Kort */}
        <div className="grid gap-8 md:grid-cols-3">

          {/* Kort 1 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Kort rehab-veiledning
            </h3>

            <p className="text-slate-600 mb-6">
              For deg som trenger små justeringer, avklaringer og trygg retning videre.
            </p>

            <p className="text-3xl font-semibold text-slate-900 mb-1">
              fra 450,-
            </p>
            <p className="text-sm text-slate-500 mb-6">15 minutter</p>

            <ul className="space-y-3 text-sm text-slate-700">
              <li>✓ Smertejustering og veiledning</li>
              <li>✓ Trygg progresjon uten overtenking</li>
              <li>✓ Passer godt som supplement i et løp</li>
            </ul>
          </div>

          {/* Kort 2 – mest brukt */}
          <div className="relative rounded-2xl border-2 border-[#007C80] bg-white p-8 shadow-md">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#007C80] px-4 py-1 text-xs font-semibold text-white">
              Mest brukt
            </span>

            <h3 className="text-lg font-semibold mb-2">
              Rehab-intro & progresjon
            </h3>

            <p className="text-slate-600 mb-6">
              Den beste starten for de fleste – struktur, trygghet og retning.
            </p>

            <p className="text-3xl font-semibold text-slate-900 mb-1">
              fra 800,-
            </p>
            <p className="text-sm text-slate-500 mb-6">25 minutter</p>

            <ul className="space-y-3 text-sm text-slate-700">
              <li>✓ Tester og målinger</li>
              <li>✓ Strukturert rehab-opplegg</li>
              <li>✓ Kosthold som støtter restitusjon</li>
            </ul>
          </div>

          {/* Kort 3 */}
          <div className="rounded-2xl border border-sf-border bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Full rehab-time
            </h3>

            <p className="text-slate-600 mb-6">
              For deg som ønsker helhetlig oppfølging og dypere arbeid.
            </p>

            <p className="text-3xl font-semibold text-slate-900 mb-1">
              fra 1 300,-
            </p>
            <p className="text-sm text-slate-500 mb-6">50 minutter</p>

            <ul className="space-y-3 text-sm text-slate-700">
              <li>✓ Grundig smertekartlegging</li>
              <li>✓ Tester, progresjon og justering</li>
              <li>✓ Trenings- og kostholdsstrategi</li>
            </ul>
          </div>
        </div>

        {/* Fotnote */}
        <p className="mt-12 text-center text-sm text-slate-500 italic">
          SmerteFri er en portal – ikke et kjedekonsept.
          Pris og oppfølging kan variere mellom trenere, kompetanse og behov.
          Du velger selv tempo, nivå og samarbeid.
        </p>

      </div>
    </section>
  );
}