// src/app/(public)/trenere/Seksjon/Seksjon5Filmer.tsx
import Image from "next/image";

export default function Seksjon5Filmer() {
  return (
    <section id="filmer" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Filmer, fag og royalty – neste fase i SmerteFri
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Neste store satsing er et{" "}
              <span className="font-semibold">kvalitetssikret videobibliotek</span>{" "}
              med rehab-øvelser og forklaringer – både for kunder som har trener, og for nye brukere
              som ikke har valgt trener enda.
            </p>

            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Slik bygger vi innholdet</div>
              <p className="mt-2 text-sm text-slate-700">
                Vi starter med strukturerte filmpakker:{" "}
                <span className="font-semibold">10 filmer per kroppsdel</span>{" "}
                (f.eks. nakke, skulder, rygg, hofte, kne).
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Introduksjon: smerteforståelse + trygghet</li>
                <li>Øvelser: progresjon fra lett til mer krevende</li>
                <li>Vanlige feil + justeringer</li>
              </ul>
            </div>

            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Hvorfor vi starter strukturert</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Dette er nytt. Hvis SmerteFri på sikt skal kunne bli relevant for fremtidig
                “trening på resept”, må innholdet være faglig konsistent, dokumenterbart og lett å følge.
                Derfor styrer vi struktur og kvalitet i starten – og åpner mer opp etter hvert.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-black/5 bg-emerald-50 p-6 shadow-sm">
              <div className="text-sm font-semibold text-emerald-900">Royalty-modellen</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                Målet er en modell litt som Spotify: brukere betaler månedlig, og inntekten fordeles mellom
                SmerteFri (drift/utvikling) og trenere som har bidratt med filmer (royalty basert på visninger).
              </p>
              <p className="mt-3 text-sm text-slate-800">
                🎁 <span className="font-semibold">Betagruppe-fordel:</span> Filmpakker til kostpris i oppstartsfasen.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#bli-med"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Meld interesse – filmer
                </a>
             
              </div>
            </div>
          </div>

          {/* HØYRE – MOBILBILDE (samme mønster som kundesiden) */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex justify-center">
              <div className="h-[440px] w-[340px] rounded-full bg-emerald-600/12 blur-[85px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Image
                src="/PTSmerte.png"
                alt="SmerteFri – filmer og bibliotek"
                width={200}
                height={410}
                className="relative z-10"
              />
              <div className="mt-3 text-center text-sm text-slate-600">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}