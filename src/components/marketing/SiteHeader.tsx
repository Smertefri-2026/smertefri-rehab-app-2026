"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Wordmark } from "@/ui/brand/Wordmark";

/**
 * Offentlig nettside-header. Stabil meny — endres aldri basert på interne
 * forhold (om vi har trenere, hvilke funksjoner som er ferdige osv.).
 */
const navItems = [
  { href: "/#slik-fungerer-det", label: "Slik fungerer det" },
  { href: "/#priser", label: "Priser" },
  { href: "/#kontakt", label: "Kontakt" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Relative lenker — på smertefri.no sender middleware disse videre til
  // app.smertefri.no. Lokalt/preview serveres alt fra samme origin.
  const loginHref = "/login";
  const startHref = "/register/client";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="relative mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} aria-label="SmerteFri – forsiden">
          <Wordmark className="text-xl" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium text-ink-soft hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={loginHref}
            className="text-[13.5px] font-semibold text-ink-soft hover:text-ink"
          >
            Logg inn
          </a>
          <a
            href={startHref}
            className="hidden rounded-md bg-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-primary-ink md:inline-flex"
          >
            Kom i gang
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft hover:bg-surface-alt md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {open && (
          <div
            id={menuId}
            className="absolute inset-x-0 top-full border-t border-border bg-surface px-4 py-4 sm:px-6 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-[14.5px] font-medium text-ink-soft hover:bg-surface-alt hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <a
              href={startHref}
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-ink"
            >
              Kom i gang
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
