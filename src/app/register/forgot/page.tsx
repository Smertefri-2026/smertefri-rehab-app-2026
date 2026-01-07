"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderFrontpage from "@/app/frontpage/Seksjon/HeaderFrontpage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <>
      {/* Header – auth variant */}
      <HeaderFrontpage variant="auth" />

      {/* PAGE */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-sf-soft to-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-sf-border bg-white p-8 shadow-xl text-center">
          
          {/* LOGO */}
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-montserrat-alternates)" }}
          >
            <span className="text-[#007C80]">Smerte</span>
            <span className="text-[#29A9D6]">Fri</span>
          </h1>

          {/* ICON */}
          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F3F6] text-3xl">
            🔐
          </div>

          {/* TITLE */}
          <h2 className="mt-6 text-xl font-semibold text-sf-text">
            Glemt passord
          </h2>

          {/* TEXT */}
          <p className="mt-3 text-sm text-sf-muted">
            Skriv inn e-postadressen din, så sender vi deg en lenke
            for å lage nytt passord.
          </p>

          {/* FORM */}
          <form className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-post"
              required
              className="w-full rounded-xl border border-sf-border bg-sf-soft px-4 py-3 text-base outline-none focus:border-[#007C80]"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-[#007C80] py-3 text-base font-medium text-white hover:opacity-90 transition"
              style={{ fontFamily: "var(--font-montserrat-alternates)" }}
            >
              Send reset-lenke
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-6 text-sm">
            <Link
              href="/login"
              className="font-medium text-[#007C80] hover:underline"
            >
              Tilbake til login
            </Link>
          </div>

          {/* HELP */}
          <p className="mt-6 text-xs text-sf-muted">
            Finner du ikke e-posten? Sjekk søppelpost eller prøv igjen senere.
          </p>
        </div>
      </main>
    </>
  );
}