"use client";

import Link from "next/link";

export default function Section3NutritionActions() {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="space-y-4">

        {/* 🍽 Logg dagens matinntak */}
        <Link
          href="/nutrition/today"
          className="
            flex items-center justify-center gap-2
            rounded-full bg-[#007C80]
            px-6 py-3
            text-sm font-medium text-white
            hover:opacity-90
          "
        >
          🍽 Logg dagens matinntak
        </Link>

        {/* ⚙️ Rediger kostholdsprofil */}
        <Link
          href="/nutrition/profile"
          className="
            flex items-center justify-center gap-2
            rounded-full border border-sf-border
            px-6 py-3
            text-sm font-medium text-sf-text
            hover:bg-sf-soft
          "
        >
          ⚙️ Rediger kostholdsprofil
        </Link>

      </div>
    </section>
  );
}