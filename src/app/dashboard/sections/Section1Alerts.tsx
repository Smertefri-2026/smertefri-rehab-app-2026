"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// import { useRole } from "@/providers/RoleProvider"; // ← aktiveres senere

type Role = "client" | "trainer" | "admin";

export default function Section1Alerts() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // 1️⃣ Hent auth-bruker
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setLoading(false);
          return;
        }

        setEmail(user.email ?? null);

        // 2️⃣ Hent profil (rolle + ev. email)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.warn("Profile fetch error:", profileError);
        }

        if (profile?.email) {
          setEmail(profile.email);
        }

        if (profile?.role) {
          setRole(profile.role as Role);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Laster dashboard…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Innlogget bruker
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          {email ?? "Ukjent bruker"}
        </h2>

        <p className="text-sm text-slate-700">
          Rolle:{" "}
          <span className="font-medium text-[#007C80]">
            {role ?? "ukjent"}
          </span>
        </p>

        <p className="mt-2 text-xs text-slate-500 italic">
          Midlertidig visning for verifisering av innlogging og roller.
        </p>
      </div>
    </section>
  );
}