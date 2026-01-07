"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type HeaderVariant = "frontpage" | "auth";

type Props = {
  variant?: HeaderVariant;
};

export default function HeaderFrontpage({ variant = "frontpage" }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuth =
    variant === "auth" || pathname.startsWith("/login") || pathname.startsWith("/register");

  // 🔝 Gå til toppen på forsiden
  const goTop = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  // ✅ ALLTID relativ rute
  const loginUrl = "/login";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-sf-border">
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4">

          {/* LOGO */}
          <button
            onClick={goTop}
            className="text-3xl font-semibold tracking-tight cursor-pointer"
            style={{ fontFamily: "var(--font-montserrat-alternates)" }}
          >
            <span className="text-[#007C80]">Smerte</span>
            <span className="text-[#29A9D6]">Fri</span>
          </button>

          {/* MIDTMENY – KUN FORSIDE */}
          {!isAuth && (
            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 md:flex items-center gap-12 text-base font-medium text-[#004F59]"
              style={{ fontFamily: "var(--font-montserrat-alternates)" }}
            >
              <a href="#smerte">Smerte</a>
              <a href="#kosthold">Kosthold</a>
              <a href="#tester">Tester</a>
              <a href="#priser">Priser</a>
            </nav>
          )}

          {/* DESKTOP */}
          <div className="hidden md:block">
            {isAuth ? (
              <button
                onClick={goTop}
                className="rounded-full border-2 border-[#007C80] bg-white px-6 py-2.5 text-sm font-medium text-[#007C80]"
              >
                Til forsiden
              </button>
            ) : (
              <Link
                href={loginUrl}
                className="rounded-full bg-[#007C80] px-6 py-2.5 text-sm font-medium text-white"
              >
                Logg inn
              </Link>
            )}
          </div>

          {/* MOBIL */}
          {!isAuth ? (
            <button
              onClick={() => setOpen(p => !p)}
              className="md:hidden rounded-xl bg-sf-soft p-3 text-xl"
            >
              {open ? "✕" : "☰"}
            </button>
          ) : (
            <button
              onClick={goTop}
              className="md:hidden rounded-full border-2 border-[#007C80] bg-white px-4 py-2 text-sm"
            >
              Til forsiden
            </button>
          )}
        </div>
      </header>

      {/* MOBILMENY */}
      {!isAuth && open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative ml-auto h-full w-full max-w-sm bg-white">
            <nav className="flex flex-col items-center gap-10 py-14 text-xl">
              <a href="#smerte">Smerte</a>
              <a href="#kosthold">Kosthold</a>
              <a href="#tester">Tester</a>
              <a href="#priser">Priser</a>

              <Link
                href={loginUrl}
                className="mt-6 w-[85%] rounded-full bg-[#007C80] py-4 text-center text-white"
              >
                Logg inn
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}