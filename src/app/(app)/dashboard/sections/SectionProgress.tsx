"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import Sparkline from "@/components/progress/Sparkline";
import { getPainTrend, type PainPoint } from "@/lib/progress.api";

export default function SectionProgress() {
  const { role, userId } = useRole();
  const [pain, setPain] = useState<PainPoint[] | null>(null);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;
    getPainTrend(userId, 30)
      .then((p) => alive && setPain(p))
      .catch(() => alive && setPain([]));
    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || !pain || pain.length < 2) return null;

  return (
    <Link
      href="/fremgang"
      className="block rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
    >
      <h2 className="mb-3 text-sm font-semibold text-ink-soft">Fremgang · smerte siste 30 dager</h2>
      <Sparkline points={pain} height={56} />
    </Link>
  );
}
