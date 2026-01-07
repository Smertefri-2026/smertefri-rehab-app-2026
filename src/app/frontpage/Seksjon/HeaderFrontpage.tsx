"use client";

import { useEffect, useState } from "react";

type HeaderVariant = "frontpage" | "auth";

type Props = {
  variant?: HeaderVariant;
};

export default function HeaderFrontpage({ variant = "frontpage" }: Props) {
  const [isAppDomain, setIsAppDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAppDomain(window.location.hostname.startsWith("app."));
    }
  }, []);

  const goToFrontpage = () => {
    window.location.href = "https://smertefri.no";
  };

  const goToLogin = () => {
    window.location.href = "https://app.smertefri.no/login";
  };

  const isAuth = variant === "auth" || isAppDomain;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-sf-border">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">

        {/* LOGO */}
        <button
          onClick={goToFrontpage}
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-montserrat-alternates)" }}
        >
          <span className="text-[#007C80]">Smerte</span>
          <span className="text-[#29A9D6]">Fri</span>
        </button>

        {/* MIDTMENY – kun marketing */}
        {!isAuth && (
          <nav className="hidden md:flex items-center gap-12 font-medium text-[#004F59]">
            <a href="#smerte">Smerte</a>
            <a href="#kosthold">Kosthold</a>
            <a href="#tester">Tester</a>
            <a href="#priser">Priser</a>
          </nav>
        )}

        {/* HØYRE KNAPP */}
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
            className="rounded-full bg-[#007C80] px-6 py-2.5 text-sm font-medium text-white"
          >
            Logg inn
          </button>
        )}
      </div>
    </header>
  );
}