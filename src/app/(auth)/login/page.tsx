"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import InstallPWAButton from "@/components/pwa/InstallPWAButton";
import { Field, Input } from "@/ui/components/Field";
import { Button } from "@/ui/components/Button";

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

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError("Feil e-post eller passord");
      return;
    }

    setLoading(false);
    router.replace("/dashboard");
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-card">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-ink">Logg inn</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Din rehabtrener, progresjonen din og struktur på ett sted.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="E-post">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Passord">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-14"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-primary-ink"
            >
              {showPassword ? "Skjul" : "Vis"}
            </button>
          </div>
        </Field>

        {error && <p className="text-center text-sm text-danger-ink">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logger inn…" : "Logg inn"}
        </Button>

        <InstallPWAButton />
      </form>

      <div className="mt-6 space-y-4 text-center text-sm">
        <Link href="/register/forgot" className="text-primary-ink hover:underline">
          Glemt passord?
        </Link>

        <div className="space-y-1">
          <p className="text-ink-soft">Ny bruker?</p>
          <Link href="/register/client" className="block font-medium text-primary-ink hover:underline">
            Opprett konto som kunde
          </Link>
          <Link
            href="/register/trainer"
            className="block text-ink-faint transition-colors hover:text-primary-ink"
          >
            Søk om å bli rehabtrener
          </Link>
        </div>
      </div>
    </div>
  );
}
