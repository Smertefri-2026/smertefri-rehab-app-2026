import type { Metadata } from "next";
import Section from "@/ui/layout/Section";

export const metadata: Metadata = {
  title: "Bli rehabtrener",
  description:
    "Søk om å bli rehabtrener hos SmerteFri. Alle godkjennes manuelt. Du får tildelt kunder og et strukturert oppfølgingsverktøy.",
};

const steps = [
  {
    n: "1",
    title: "Opprett konto og søk",
    body: "Registrer deg og fyll inn utdanning, sertifiseringer og erfaring. Søknaden sender du inne i verktøyet etter innlogging.",
  },
  {
    n: "2",
    title: "Vi vurderer søknaden",
    body: "Et menneske hos SmerteFri går gjennom hver søknad manuelt. Ingen blir bookbar automatisk.",
  },
  {
    n: "3",
    title: "Du får tildelt kunder",
    body: "SmerteFri kobler kunder til deg — du velger ikke selv hvem du tar inn, og setter ikke egne priser. Du får kun tilgang til dine tildelte kunders data.",
  },
  {
    n: "4",
    title: "Du følger opp i verktøyet",
    body: "Smerte- og testhistorikk, kalender, meldinger og programoppfølging på ett sted, med tydelige varsler om hvem som trenger deg.",
  },
];

export default function BliRehabtrenerPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-20">
        <div className="max-w-prose">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            For fagfolk
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
            Bli rehabtrener hos SmerteFri
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            SmerteFri er et strukturert oppfølgingsverktøy for rehabtrener og kunde
            — ikke en åpen markedsplass. Vi godkjenner alle rehabtrenere manuelt og
            tildeler kundene.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/register/trainer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-primary-ink"
            >
              Opprett konto
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-border-strong bg-surface px-[18px] py-2.5 text-sm font-semibold text-ink hover:bg-surface-alt"
            >
              Logg inn
            </a>
          </div>
        </div>
      </Section>

      <Section className="border-t border-border bg-surface py-16 sm:py-20">
        <h2 className="text-2xl font-semibold text-ink">Slik blir du rehabtrener</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-page p-5 shadow-card">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary-ink">
                {s.n}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-16 sm:py-20">
        <div className="max-w-prose rounded-lg border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-semibold text-ink">Hvem passer det for?</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li>Fysioterapeuter, PT-er og andre med relevant fagbakgrunn innen rehabilitering og trening.</li>
            <li>Du som vil jobbe strukturert med smertepasienter over tid, ikke levere enkelttimer.</li>
            <li>Du som er komfortabel med at SmerteFri styrer tildeling og rammene rundt oppfølgingen.</li>
          </ul>
          <div className="mt-6">
            <a
              href="/register/trainer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-primary-ink"
            >
              Opprett konto og søk
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
