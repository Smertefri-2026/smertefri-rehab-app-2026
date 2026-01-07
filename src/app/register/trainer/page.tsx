"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HeaderFrontpage from "@/app/frontpage/Seksjon/HeaderFrontpage";

export default function RegisterTrainerPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = useMemo(() => {
    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [password, confirmPassword]);

  const showMatchHint = confirmPassword.length > 0 || password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("Passordene er ikke like");
      return;
    }

    setLoading(true);

    // ✅ Opprett bruker i Supabase Auth
    // Rollen sendes som metadata og håndteres av trigger i databasen
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/register/email-sent`,
        data: {
          role: "trainer",
        },
      },
    });

    setLoading(false);

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Kunne ikke registrere trener");
      return;
    }

    // ✅ Ingen manuell insert i profiles
    router.push("/register/email-sent");
  };

  return (
    <>
      <HeaderFrontpage variant="auth" />

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-sf-soft to-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-sf-border bg-white p-8 shadow-xl">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-montserrat-alternates)" }}
            >
              <span className="text-[#007C80]">Smerte</span>
              <span className="text-[#29A9D6]">Fri</span>
            </h1>

            <p className="mt-3 text-lg font-medium text-sf-text">
              Registrer deg som trener
            </p>

            {/* VISJON */}
            <p className="mt-3 text-sm text-sf-muted leading-relaxed">
              Som trener er du med på å skape et system som først hjelper mennesker
              ut av smerte – og deretter trygt videre til et sterkere, mer
              funksjonelt liv.
              <br />
              <br />
              <strong>SmerteFri bygges som et fagmiljø i vekst.</strong>
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-sf-border bg-sf-soft px-4 py-3 outline-none focus:border-[#007C80]"
            />

            {/* PASSORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Passord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-sf-border bg-sf-soft px-4 py-3 pr-16 outline-none focus:border-[#007C80]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#007C80]"
              >
                {showPassword ? "Skjul" : "Vis"}
              </button>
            </div>

            {/* BEKREFT PASSORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Bekreft passord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl bg-sf-soft px-4 py-3 pr-16 border outline-none focus:border-[#007C80]
                  ${
                    confirmPassword.length === 0
                      ? "border-sf-border"
                      : passwordsMatch
                      ? "border-green-500"
                      : "border-red-500"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#007C80]"
              >
                {showConfirmPassword ? "Skjul" : "Vis"}
              </button>
            </div>

            {showMatchHint && confirmPassword.length > 0 && (
              <p
                className={`text-sm ${
                  passwordsMatch ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordsMatch
                  ? "Passordene er like"
                  : "Passordene er ikke like"}
              </p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!passwordsMatch || loading}
              className="w-full rounded-full bg-[#007C80] py-3 font-medium text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Registrerer…" : "Registrer trener"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 text-center text-sm">
            <p className="text-sf-muted">Allerede registrert?</p>
            <Link
              href="/login"
              className="font-medium text-[#007C80] hover:underline"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}