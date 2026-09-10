import Link from "next/link";
import { Wordmark } from "@/ui/brand/Wordmark";

const columns = [
  {
    title: "Produkt",
    links: [
      { href: "/#slik-fungerer-det", label: "Slik fungerer det" },
      { href: "/#priser", label: "Priser" },
      { href: "/#kontakt", label: "Kontakt" },
    ],
  },
  {
    title: "For fagfolk",
    links: [{ href: "/bli-rehabtrener", label: "Bli rehabtrener" }],
  },
  {
    title: "Juridisk",
    links: [
      { href: "/personvern", label: "Personvern" },
      { href: "/vilkar", label: "Vilkår" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto flex max-w-content flex-col gap-10 px-4 py-14 sm:flex-row sm:justify-between sm:px-6">
        <div className="max-w-xs">
          <Wordmark tone="on-dark" className="text-lg" />
          <p className="mt-3 text-[13px] leading-relaxed text-white/60">
            Et strukturert oppfølgingsverktøy for smertereduksjon, rehabilitering
            og trygg progresjon — med en tildelt rehabtrener som følger deg.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/60">
            Du eier alltid dine egne data (GDPR).
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                {col.title}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13.5px] text-white/70 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Konto</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/login" className="text-[13.5px] text-white/70 hover:text-white">
                  Logg inn
                </Link>
              </li>
              <li>
                <Link
                  href="/register/client"
                  className="text-[13.5px] text-white/70 hover:text-white"
                >
                  Opprett konto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-content px-4 py-5 text-[12px] text-white/40 sm:px-6">
          © {new Date().getFullYear()} SmerteFri
        </div>
      </div>
    </footer>
  );
}
