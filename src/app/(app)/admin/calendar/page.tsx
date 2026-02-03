"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

type BookingRow = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  client_id?: string | null;
  trainer_id?: string | null;
  created_at?: string | null;
};

function short(ts?: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("no-NO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isoDaysAhead(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export default function AdminCalendarPage() {
  const { role, loading: roleLoading } = useRole();
  const sp = useSearchParams();

  const missing = sp.get("missing") === "1";

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") return;

    let alive = true;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const nowISO = new Date().toISOString();
        const to30 = isoDaysAhead(30);

        let q = supabase
          .from("bookings")
          .select("id, start_time, end_time, status, client_id, trainer_id, created_at")
          .neq("status", "cancelled")
          .gte("start_time", nowISO)
          .lte("start_time", to30)
          .order("start_time", { ascending: true })
          .limit(500);

        if (missing) {
          q = q.or("client_id.is.null,trainer_id.is.null");
        }

        const { data, error } = await q;
        if (error) throw error;

        if (!alive) return;
        setRows((data ?? []) as BookingRow[]);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Ukjent feil");
        setRows([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, roleLoading, missing]);

  if (roleLoading) return null;
  if (role !== "admin") return null;

  const title = missing ? "Admin – Kalender (mangler relasjon)" : "Admin – Kalender (30 dager)";

  const missingCount = useMemo(
    () => rows.filter((r) => !r.client_id || !r.trainer_id).length,
    [rows]
  );

  return (
    <AppPage>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-sf-muted">
            {missing
              ? `Viser bookinger der client_id eller trainer_id mangler. (${missingCount} funnet)`
              : "Viser kommende bookinger (ikke cancelled) de neste 30 dagene."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/calendar"
            className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          >
            Normal
          </a>
          <a
            href="/admin/calendar?missing=1"
            className="rounded-full border border-sf-border px-3 py-1 text-xs font-medium text-sf-muted hover:bg-sf-soft"
          >
            Mangler relasjon
          </a>
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Feil: {err}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-sf-border overflow-hidden">
        <div className="grid grid-cols-12 bg-sf-soft px-4 py-2 text-xs font-medium text-sf-muted">
          <div className="col-span-3">Start</div>
          <div className="col-span-3">Slutt</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Client</div>
          <div className="col-span-2">Trainer</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-sf-muted">Laster…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-sf-muted">Ingen bookinger i perioden.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-sf-border">
              <div className="col-span-3">{short(r.start_time)}</div>
              <div className="col-span-3">{short(r.end_time)}</div>
              <div className="col-span-2">{r.status ?? "—"}</div>
              <div className="col-span-2 font-mono text-xs">{r.client_id ?? "—"}</div>
              <div className="col-span-2 font-mono text-xs">{r.trainer_id ?? "—"}</div>
            </div>
          ))
        )}
      </div>
    </AppPage>
  );
}