"use client";

import { HeartPulse } from "lucide-react";

export default function Section0PainHeader({
  subtitle,
}: {
  subtitle?: string;
}) {
  return (
    <section className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F3F6] text-[#007C80]">
          <HeartPulse size={20} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-sf-text">
            {subtitle ?? "Smerter"}
          </h1>
          <p className="text-sm text-sf-muted">
            Logg smerteområde og intensitet (0–10) – og følg utviklingen over tid
          </p>
        </div>
      </div>
    </section>
  );
}