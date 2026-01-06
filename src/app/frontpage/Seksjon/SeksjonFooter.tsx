// src/app/frontpage/Seksjon/SeksjonFooter.tsx

export default function SeksjonFooter() {
  return (
    <footer className="bg-[#1F3F44] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Logo + tekst */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">
              SmerteFri
            </h3>
            <p className="max-w-sm text-sm text-white/80 leading-relaxed">
              En helhetlig helseplattform for smertereduksjon,
              rehabilitering og trygg progresjon – bygget for
              vanlige folk, til eliteutøvere.
            </p>
          </div>

          {/* Informasjon */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#7FE3B0]">
              Informasjon
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-white transition">
                  Personvernerklæring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Vilkår og betingelser
                </a>
              </li>
            </ul>
          </div>

          {/* Trygghet */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#7FE3B0]">
              Trygghet
            </h4>
            <p className="max-w-sm text-sm text-white/80 leading-relaxed">
              All oppfølging i SmerteFri skjer i tråd med
              gjeldende regelverk for personvern (GDPR).
              <br />
              Du eier alltid dine egne data.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SmerteFri. Alle rettigheter reservert.</p>
          <p>Utviklet for trygg rehabilitering og bedre livskvalitet.</p>
        </div>
      </div>
    </footer>
  );
}