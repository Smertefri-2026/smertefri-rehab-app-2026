// src/app/(public)/trenere/Seksjon/HeaderTrenere.tsx
"use client";

const NAV = [
  { href: "#hva", label: "Hva er SmerteFri?" },
  { href: "#status", label: "Status v1.0" },
  { href: "#hvem", label: "Hvem kan bli med" },
  { href: "#filmer", label: "Filmer & royalty" },
  { href: "#faq", label: "FAQ" },
  { href: "#bli-med", label: "Kontakt" },
];

export default function HeaderTrenere() {
  const goFrontpage = () => (window.location.href = "https://smertefri.no");
  const goTrenere = () => (window.location.href = "https://smertefri.no/trenere");
  const goLogin = () => (window.location.href = "https://app.smertefri.no/login");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sf-border bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* VENSTRE: Logo + Trenere-pille tett sammen */}
        <div className="flex items-center gap-3">
          <button
            onClick={goFrontpage}
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-montserrat-alternates)" }}
            aria-label="Gå til SmerteFri forsiden"
          >
            <span className="text-[#007C80]">Smerte</span>
            <span className="text-[#29A9D6]">Fri</span>
          </button>

          <button
            onClick={goTrenere}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            aria-label="Gå til Trenere"
          >
            Trenere
          </button>
        </div>

        {/* MIDT: intern meny (kun desktop) */}
        <nav className="hidden md:flex items-center gap-10 font-medium text-[#004F59]">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:opacity-80">
              {n.label}
            </a>
          ))}
        </nav>

        {/* HØYRE: Logg inn */}
        <button
          onClick={goLogin}
          className="rounded-full bg-[#007C80] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Logg inn
        </button>
      </div>
    </header>
  );
}