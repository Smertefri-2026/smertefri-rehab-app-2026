import Link from "next/link";

export default function Seksjon1Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-gradient-to-br from-primary-subtle via-page to-page">
      <div className="mx-auto max-w-content px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink-soft shadow-card">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Helhetlig rehab · smerte · kosthold · funksjon
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl lg:text-6xl">
              Bli smertefri <span className="text-primary">– og</span>
              <br />
              <span className="text-primary">lær kroppen å fungere igjen</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              SmerteFri er et strukturert oppfølgingsverktøy for smertereduksjon og
              rehabilitering. Du får en tildelt rehabtrener som følger deg trygt ut
              av smerte — og videre til et sterkere, mer funksjonelt liv.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register/client"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-ink"
              >
                Kom i gang
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-border-strong bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-surface-alt"
              >
                Logg inn
              </Link>
            </div>

            <p className="mt-6 text-sm text-ink-faint">
              Bygget sammen med rehabtrenere · strukturert progresjon · full oversikt
              uten stress
            </p>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-pop sm:p-8">
              <h3 className="mb-6 text-base font-semibold text-ink">Min SmerteFri – oversikt</h3>

              <div className="space-y-3">
                <div className="rounded-md border border-border px-4 py-3 text-sm text-ink-soft">
                  Neste økt: <strong className="text-ink">torsdag 11:00</strong>
                </div>
                <div className="rounded-md border border-border px-4 py-3 text-sm text-ink-soft">
                  Smerte: <strong className="text-success-ink">på vei ned</strong>
                </div>
                <div className="rounded-md border border-border px-4 py-3 text-sm text-ink-soft">
                  Tester, kosthold og kalender samlet på ett sted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
