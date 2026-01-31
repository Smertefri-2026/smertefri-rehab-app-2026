// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/nutrition/sections/Section3NutritionActions.tsx

"use client";

import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";

export default function Section3NutritionActions() {
  const { role } = useRole();

  // Kun kunder skal se actions
  if (role !== "client") return null;

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-3">
      <Link
        href="/nutrition/today"
        className="flex items-center justify-center gap-2 rounded-full bg-[#007C80] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        🍽 Logg i dag
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/nutrition/profile"
          className="flex items-center justify-center gap-2 rounded-full border border-sf-border bg-white px-4 py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft"
        >
          ⚙️ Grunnlag Profil
        </Link>

        <Link
          href="/nutrition/history"
          className="flex items-center justify-center gap-2 rounded-full border border-sf-border bg-white px-4 py-2.5 text-sm font-medium text-sf-text hover:bg-sf-soft"
        >
          📊 Historikk
        </Link>
      </div>
    </section>
  );
}