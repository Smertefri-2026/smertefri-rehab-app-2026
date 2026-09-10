import Link from "next/link";

const steps = [
  {
    n: "Steg 1",
    title: "Opprett konto",
    body: "Registrer deg og svar på en kort kartlegging av smerte, kapasitet og hverdag.",
  },
  {
    n: "Steg 2",
    title: "Få tildelt rehabtrener",
    body: "SmerteFri kobler deg med en godkjent rehabtrener som legger et strukturert løp.",
  },
  {
    n: "Steg 3",
    title: "Skap trygg progresjon",
    body: "Følg utviklingen over tid — med tydelige rammer og en trener som justerer underveis.",
  },
];

export default function Seksjon9Komigang() {
  return (
    <section id="kom-i-gang" className="border-t border-border bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-content px-4 text-center sm:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          Kom i gang
        </p>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Et rehabiliteringsløp <span className="text-primary">bygget rundt deg</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
          Uansett hvor du starter, starter vi der du er — med struktur, kontinuitet og
          faglig oppfølging.
        </p>

        <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-page p-6 shadow-card">
              <p className="text-sm font-semibold text-primary">{s.n}</p>
              <h3 className="mb-2 mt-2 text-base font-semibold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register/client"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-ink"
          >
            Kom i gang
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-border-strong bg-surface px-8 py-3 text-sm font-semibold text-ink hover:bg-surface-alt"
          >
            Logg inn
          </Link>
        </div>

        <p className="mt-8 text-sm text-ink-faint">
          Er du fysioterapeut eller PT?{" "}
          <Link href="/bli-rehabtrener" className="font-medium text-primary-ink hover:underline">
            Bli rehabtrener hos SmerteFri
          </Link>
        </p>
      </div>
    </section>
  );
}
