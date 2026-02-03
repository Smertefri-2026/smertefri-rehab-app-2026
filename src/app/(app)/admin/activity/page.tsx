"use client";

import { useEffect, useState } from "react";
import AppPage from "@/components/layout/AppPage";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Activity } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function countRows(table: string, apply?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export default function AdminActivityPage() {
  const { role, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [tests, setTests] = useState(0);
  const [pain, setPain] = useState(0);
  const [nutrition, setNutrition] = useState(0);
  const [bookings, setBookings] = useState(0);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") return;

    let alive = true;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const from7 = isoDaysAgo(7);

        const [t, p, n, b] = await Promise.all([
          countRows("test_sessions", (q) => q.gte("created_at", from7)),
          // ⚠️ bytt tabellnavn hvis ikke pain_entries
          countRows("pain_entries", (q) => q.gte("created_at", from7)),
          countRows("nutrition_days", (q) => q.gte("updated_at", from7)),
          countRows("bookings", (q) => q.gte("created_at", from7)),
        ]);

        if (!alive) return;
        setTests(t);
        setPain(p);
        setNutrition(n);
        setBookings(b);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Ukjent feil");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, roleLoading]);

  if (roleLoading) return null;
  if (role !== "admin") return null;

  const total = tests + pain + nutrition + bookings;

  return (
    <AppPage>
      <h1 className="text-lg font-semibold">Admin – Aktivitet</h1>
      <p className="text-sm text-sf-muted">Oppsummering av aktiviteten siste 7 dager.</p>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Feil: {err}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total aktivitet" icon={<Activity size={18} />} status={loading ? "…" : String(total)}>
          <p className="text-sm text-sf-muted">Sum av nye/oppdaterte rader.</p>
        </DashboardCard>

        <DashboardCard title="Tester" icon={<Activity size={18} />} status={loading ? "…" : String(tests)}>
          <p className="text-sm text-sf-muted">test_sessions siste 7 dager</p>
        </DashboardCard>

        <DashboardCard title="Smerte" icon={<Activity size={18} />} status={loading ? "…" : String(pain)}>
          <p className="text-sm text-sf-muted">pain_entries siste 7 dager</p>
        </DashboardCard>

        <DashboardCard title="Kosthold" icon={<Activity size={18} />} status={loading ? "…" : String(nutrition)}>
          <p className="text-sm text-sf-muted">nutrition_days oppdatert siste 7 dager</p>
        </DashboardCard>
      </div>
    </AppPage>
  );
}