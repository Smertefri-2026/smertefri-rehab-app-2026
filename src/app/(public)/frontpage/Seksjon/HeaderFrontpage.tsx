// /Users/oystein/smertefri-rehab-app-2026/src/app/(public)/frontpage/Seksjon/HeaderFrontpage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type HeaderVariant = "frontpage" | "auth";

type Props = {
  variant?: HeaderVariant;
};

export default function HeaderFrontpage({ variant = "frontpage" }: Props) {
  const pathname = usePathname();
  const [isAppDomain, setIsAppDomain] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAppDomain(window.location.hostname.startsWith("app."));
    }
  }, []);

  // Lukk meny ved route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const goToFrontpage = () => {
    window.location.href = "https://smertefri.no";
  };

  const goToLogin = () => {
    window.location.href = "https://app.smertefri.no/login";
  };

  const isAuth = variant === "auth" || isAppDomain;

  // ✅ SKJUL på /trenere (så HeaderTrenere får stå alene)
  const isTrenereRoute = pathname?.startsWith("/trenere");
  if (!isAuth && isTrenereRoute) return null;

  const links = useMemo(
    () => [
      { href: "#smerte", label: "Smerte" },
      { href: "#kosthold", label: "Kosthold" },
      { href: "#tester", label: "Tester" },
      { href: "#priser", label: "Priser" },
      { href: "/trenere", label: "Trenere" },
      { href: "#kontakt", label: "Kontakt" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-sf-border">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* LOGO */}
        <button
          onClick={goToFrontpage}
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-montserrat-alternates)" }}
          aria-label="Gå til SmerteFri forsiden"
        >
          <span className="text-[#007C80]">Smerte</span>
          <span className="text-[#29A9D6]">Fri</span>
        </button>

        {/* MIDTMENY – kun desktop */}
        {!isAuth && (
          <nav className="hidden md:flex items-center gap-12 font-medium text-[#004F59]">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:opacity-80">
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {/* HØYRE: knapper */}
        <div className="flex items-center gap-3">
          {/* Mobil hamburger (kun marketing) */}
          {!isAuth && (
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-full border border-sf-border bg-white px-4 py-2 text-sm font-medium text-[#004F59]"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Lukk meny" : "Åpne meny"}
              aria-expanded={open}
            >
              {open ? "Lukk" : "Meny"}
            </button>
          )}

          {isAuth ? (
            <button
              onClick={goToFrontpage}
              className="rounded-full border-2 border-[#007C80] bg-white px-6 py-2.5 text-sm font-medium text-[#007C80]"
            >
              Til forsiden
            </button>
          ) : (
            <button
              onClick={goToLogin}
              className="hidden md:inline-flex rounded-full bg-[#007C80] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Logg inn
            </button>
          )}
        </div>
      </div>

      {/* Mobilmeny panel */}
      {!isAuth && open && (
        <div className="md:hidden border-t border-sf-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <nav className="flex flex-col gap-3 font-medium text-[#004F59]">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-2 hover:bg-sf-soft"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={goToLogin}
                className="mt-2 w-full rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Logg inn
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}