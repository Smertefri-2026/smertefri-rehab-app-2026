// src/app/(app)/clients/sections/Section3ClientOverview.tsx
"use client";

import Link from "next/link";
import { HeartPulse, Activity, Utensils, ChevronRight } from "lucide-react";

type Props = {
  clientId: string;
};

export default function Section3ClientOverview({ clientId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-sf-muted">Kundeoversikt</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href={`/pain/${clientId}`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <HeartPulse className="text-red-500" />
            <div>
              <p className="text-sm font-medium">Smerter</p>
              <p className="text-xs text-sf-muted">Sist oppdatert: i dag</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>

        <Link
href={`/tests/${clientId}`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <Activity className="text-blue-500" />
            <div>
              <p className="text-sm font-medium">Tester</p>
              <p className="text-xs text-sf-muted">Fremgang registrert</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>

        <Link
          href={`/nutrition/${clientId}`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <Utensils className="text-green-500" />
            <div>
              <p className="text-sm font-medium">Kosthold</p>
              <p className="text-xs text-sf-muted">Dagens inntak logget</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>
      </div>
    </section>
  );
}