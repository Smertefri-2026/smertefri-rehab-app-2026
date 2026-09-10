"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { Button } from "@/ui/components/Button";
import DailyCheckinForm from "@/components/zone/DailyCheckinForm";
import ZoneToday from "@/components/zone/ZoneToday";
import ZoneHistoryStrip from "@/components/zone/ZoneHistoryStrip";
import {
  getRecentZones,
  getTodayCheckin,
  getTodayZone,
  type DailyCheckinRow,
  type ZoneHistoryRow,
} from "@/lib/zone.api";

export default function SonenPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [checkin, setCheckin] = useState<DailyCheckinRow | null>(null);
  const [zone, setZone] = useState<ZoneHistoryRow | null>(null);
  const [history, setHistory] = useState<ZoneHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [c, z, h] = await Promise.all([
        getTodayCheckin(userId),
        getTodayZone(userId),
        getRecentZones(userId, 14),
      ]);
      setCheckin(c);
      setZone(z);
      setHistory(h);
      setEditing(!c);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente Sonen");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (roleLoading) return;
    if (role && role !== "client") {
      router.replace("/dashboard");
      return;
    }
    load();
  }, [roleLoading, role, load, router]);

  if (roleLoading || role !== "client" || loading) {
    return (
      <AppPage title="Sonen">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Sonen"
      subtitle="Din daglige status — grønn, gul eller rød — regnet ut fra innsjekken din."
    >
      <div className="space-y-6">
        {error && <p className="text-sm text-danger-ink">{error}</p>}

        {editing ? (
          <DailyCheckinForm
            clientId={userId!}
            existing={checkin}
            onDone={() => {
              setEditing(false);
              load();
            }}
          />
        ) : (
          <>
            {zone && <ZoneToday zone={zone} />}
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Rediger dagens innsjekk
            </Button>
          </>
        )}

        <ZoneHistoryStrip zones={history} />
      </div>
    </AppPage>
  );
}
