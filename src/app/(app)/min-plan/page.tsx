"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Activity, Utensils, Gauge, ClipboardEdit } from "lucide-react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { ZoneBadge } from "@/ui/components/ZoneBadge";
import ZoneHistoryStrip from "@/components/zone/ZoneHistoryStrip";
import ProgramView from "@/components/plan/ProgramView";
import TrappenView from "@/components/plan/TrappenView";
import {
  getRecentZones,
  getTodayCheckin,
  getTodayZone,
  type ZoneHistoryRow,
} from "@/lib/zone.api";

const SUBNAV = [
  { id: "program", label: "Program" },
  { id: "trappen", label: "Trappen" },
  { id: "logg", label: "Logg" },
] as const;

export default function MinPlanPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [zone, setZone] = useState<ZoneHistoryRow | null>(null);
  const [hasCheckin, setHasCheckin] = useState<boolean | null>(null);
  const [history, setHistory] = useState<ZoneHistoryRow[]>([]);

  useEffect(() => {
    if (roleLoading) return;
    if (role && role !== "client") {
      router.replace("/dashboard");
      return;
    }
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const [z, c, h] = await Promise.all([
          getTodayZone(userId),
          getTodayCheckin(userId),
          getRecentZones(userId, 14),
        ]);
        if (!alive) return;
        setZone(z);
        setHasCheckin(!!c);
        setHistory(h);
      } catch {
        if (alive) setHasCheckin(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [roleLoading, role, userId, router]);

  if (roleLoading || role !== "client") {
    return (
      <AppPage title="Min plan">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Min plan"
      subtitle="Programmet ditt, hvor du er i Trappen, og loggen som holder alt oppdatert."
    >
      <div className="space-y-8">
        {/* I dag: Sonen-status + snarvei til innsjekk */}
        <Link
          href="/sonen"
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-soft">Sonen din i dag</p>
            <p className="mt-1 truncate text-sm text-ink">
              {hasCheckin === null
                ? "Henter status …"
                : zone
                ? zone.computed_reason
                : "Du har ikke gjort dagens innsjekk enda — 30 sekunder."}
            </p>
          </div>
          {zone ? (
            <ZoneBadge zone={zone.zone} />
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary-ink">
              <Gauge size={14} /> Sjekk inn
            </span>
          )}
        </Link>

        {/* Sub-navigasjon */}
        <nav className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-page/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {SUBNAV.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition hover:bg-surface hover:text-ink"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <section id="program" className="scroll-mt-20 space-y-4">
          <h2 className="text-base font-semibold text-ink">Program</h2>
          <ProgramView />
        </section>

        <section id="trappen" className="scroll-mt-20 space-y-4">
          <h2 className="text-base font-semibold text-ink">Trappen</h2>
          <p className="text-sm text-ink-soft">Reisen fra ro til frihet — ett trinn av gangen.</p>
          <TrappenView />
        </section>

        <section id="logg" className="scroll-mt-20 space-y-4">
          <h2 className="text-base font-semibold text-ink">Logg og historikk</h2>

          <ZoneHistoryStrip zones={history} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/pain"
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm font-medium text-ink shadow-card transition hover:shadow-pop"
            >
              <HeartPulse size={18} className="text-ink-faint" /> Smerteregistrering
            </Link>
            <Link
              href="/tests"
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm font-medium text-ink shadow-card transition hover:shadow-pop"
            >
              <Activity size={18} className="text-ink-faint" /> Tester
            </Link>
            <Link
              href="/nutrition"
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm font-medium text-ink shadow-card transition hover:shadow-pop"
            >
              <Utensils size={18} className="text-ink-faint" /> Kosthold
            </Link>
            <Link
              href="/kartlegging"
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm font-medium text-ink shadow-card transition hover:shadow-pop"
            >
              <ClipboardEdit size={18} className="text-ink-faint" /> Min kartlegging
            </Link>
          </div>
        </section>
      </div>
    </AppPage>
  );
}
