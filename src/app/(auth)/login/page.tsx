"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setLoading(false);
      setError("Feil e-post eller passord");
      return;
    }

    // 🌍 Miljø-basert redirect (lokalt vs prod)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    setLoading(false);
    router.replace(`${appUrl}/dashboard`);
  };

  return (
    <>

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-sf-soft to-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-sf-border bg-white p-8 shadow-xl">

          {/* HEADER */}
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-sf-muted">
              Velkommen til
            </p>

            <h1
              className="mt-1 text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-montserrat-alternates)" }}
            >
              <span className="text-[#007C80]">Smerte</span>
              <span className="text-[#29A9D6]">Fri</span>
            </h1>

            <p className="mt-3 text-sm text-sf-muted">
              Norges første portal bygget for rehab-trenere og mennesker – med og uten smerter.
            </p>

            <p className="mt-2 text-xs text-sf-muted">
              Finn riktig rehab-trener, følg progresjon og få struktur på ett sted.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-sf-border bg-sf-soft px-4 py-3 outline-none focus:border-[#007C80]"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Passord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-sf-border bg-sf-soft px-4 py-3 pr-16 outline-none focus:border-[#007C80]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#007C80]"
              >
                {showPassword ? "Skjul" : "Vis"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#007C80] py-3 font-medium text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-6 text-center text-sm">
            <Link
              href="/register/forgot"
              className="text-[#007C80] hover:underline"
            >
              Glemt passord?
            </Link>

            <div className="mt-4 space-y-1 text-center">
              <p className="text-sf-muted">Ny bruker?</p>

              <Link
                href="/register/client"
                className="block font-medium text-[#007C80] hover:underline"
              >
                Registrer deg som kunde
              </Link>

              <Link
                href="/register/trainer"
                className="block text-sm text-sf-muted hover:text-[#007C80] transition"
              >
                Registrer deg som trener
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}