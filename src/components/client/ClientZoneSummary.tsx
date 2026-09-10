"use client";

import { useEffect, useState } from "react";
import { ZoneBadge } from "@/ui/components/ZoneBadge";
import ZoneHistoryStrip from "@/components/zone/ZoneHistoryStrip";
import { CALIBRATION_LABEL, type CalibrationProfile } from "@/lib/onboarding/calibration";
import { getRecentZones, type ZoneHistoryRow } from "@/lib/zone.api";
import { supabase } from "@/lib/supabaseClient";

/** Rehabtrener/admin: kundens Sonen-status og kalibreringsprofil. */
export default function ClientZoneSummary({ clientId }: { clientId: string }) {
  const [zones, setZones] = useState<ZoneHistoryRow[]>([]);
  const [profile, setProfile] = useState<CalibrationProfile | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [z, ob] = await Promise.all([
          getRecentZones(clientId, 14),
          supabase
            .from("onboarding_assessments")
            .select("calibration_profile, goal")
            .eq("client_id", clientId)
            .not("completed_at", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        if (!alive) return;
        setZones(z);
        setProfile((ob.data?.calibration_profile as CalibrationProfile) ?? null);
        setGoal(ob.data?.goal ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [clientId]);

  if (loading) return null;

  const today = zones[0];

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Sonen</h2>
        {today ? (
          <ZoneBadge zone={today.zone} />
        ) : (
          <span className="text-xs text-ink-faint">Ingen innsjekk ennå</span>
        )}
      </div>

      {today && <p className="text-sm text-ink-soft">{today.computed_reason}</p>}

      {goal && (
        <p className="text-sm text-ink">
          <span className="text-ink-faint">Mål: </span>
          {goal}
        </p>
      )}

      {profile && (
        <p className="text-xs text-ink-faint">
          Kalibreringsprofil: <span className="font-medium text-ink-soft">{CALIBRATION_LABEL[profile]}</span>
        </p>
      )}

      {zones.length > 0 && <ZoneHistoryStrip zones={zones} bare />}
    </section>
  );
}
