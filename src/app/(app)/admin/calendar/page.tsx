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

type ProfileLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

const PAGE_SIZE = 10;

function short(ts?: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isoDaysAhead(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function fullName(p?: Partial<ProfileLite> | null) {
  const first = String(p?.first_name ?? "").trim();
  const last = String(p?.last_name ?? "").trim();
  const name = `${first} ${last}`.trim();
  return name || String(p?.email ?? "").trim() || "—";
}

export default function AdminCalendarPage() {
  const { role, loading: roleLoading } = useRole();
  const sp = useSearchParams();
  const missing = sp.get("missing") === "1";

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [namesById, setNamesById] = useState<Record<string, ProfileLite>>({});

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const title = missing ? "Admin – Kalender (mangler relasjon)" : "Admin – Kalender (30 dager)";
  const missingCount = useMemo(() => rows.filter((r) => !r.client_id || !r.trainer_id).length, [rows]);

  async function fetchNamesForBookings(bookings: BookingRow[], force = false) {
    // plukk ut ID-er som mangler i cache
    const ids = new Set<string>();
    for (const b of bookings) {
      if (b.client_id) ids.add(b.client_id);
      if (b.trainer_id) ids.add(b.trainer_id);
    }

    const want = Array.from(ids).filter((id) => force || !namesById[id]);
    if (want.length === 0) return;

    const { data: profs, error: pErr } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", want);

    if (pErr) throw pErr;

    const mapAdd: Record<string, ProfileLite> = {};
    for (const p of (profs ?? []) as any[]) {
      mapAdd[String(p.id)] = {
        id: String(p.id),
        first_name: p.first_name ?? null,
        last_name: p.last_name ?? null,
        email: p.email ?? null,
      };
    }

    setNamesById((prev) => ({ ...prev, ...mapAdd }));
  }

  async function loadPage(nextPage: number, mode: "replace" | "append") {
    const nowISO = new Date().toISOString();
    const to30 = isoDaysAhead(30);

    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from("bookings")
      .select("id, start_time, end_time, status, client_id, trainer_id, created_at")
      .neq("status", "cancelled")
      .gte("start_time", nowISO)
      .lte("start_time", to30)
      .order("start_time", { ascending: true })
      .range(from, to);

    if (missing) {
      q = q.or("client_id.is.null,trainer_id.is.null");
    }

    const { data, error } = await q;
    if (error) throw error;

    const bookings = (data ?? []) as BookingRow[];

    if (mode === "replace") setRows(bookings);
    else setRows((prev) => [...prev, ...bookings]);

    // dersom vi fikk færre enn PAGE_SIZE, finnes det ikke mer
    setHasMore(bookings.length === PAGE_SIZE);

    // hent navn kun for de nye bookingsene
    await fetchNamesForBookings(bookings);
  }

  // Reset ved filter-endring (?missing=1)
  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") return;

    let alive = true;
    setErr(null);
    setLoading(true);

    (async () => {
      try {
        // reset state
        setPage(0);
        setHasMore(true);
        setRows([]);
        // behold namesById (cache) – den er fin å gjenbruke

        await loadPage(0, "replace");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Ukjent feil");
        setRows([]);
        setHasMore(false);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roleLoading, missing]);

  async function onLoadMore() {
    if (loadingMore || loading || !hasMore) return;

    setLoadingMore(true);
    setErr(null);

    try {
      const next = page + 1;
      await loadPage(next, "append");
      setPage(next);
    } catch (e: any) {
      setErr(e?.message ?? "Ukjent feil");
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  if (roleLoading) return null;
  if (role !== "admin") return null;

  return (
    <AppPage>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-sf-muted">
            {missing
              ? `Viser bookinger der client_id eller trainer_id mangler. (${missingCount} funnet i lastede rader)`
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
          <div className="col-span-2">Kunde</div>
          <div className="col-span-2">Trener</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-sf-muted">Laster…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-sf-muted">Ingen bookinger i perioden.</div>
        ) : (
          rows.map((r) => {
            const clientObj = r.client_id ? namesById[r.client_id] : null;
            const trainerObj = r.trainer_id ? namesById[r.trainer_id] : null;

            const clientName = clientObj ? fullName(clientObj) : r.client_id ?? "—";
            const trainerName = trainerObj ? fullName(trainerObj) : r.trainer_id ?? "—";

            return (
              <div key={r.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-sf-border">
                <div className="col-span-3">{short(r.start_time)}</div>
                <div className="col-span-3">{short(r.end_time)}</div>
                <div className="col-span-2">{r.status ?? "—"}</div>

                <div className="col-span-2">
                  <div className="truncate">{clientName}</div>
                  {clientObj?.email ? (
                    <div className="mt-1 text-[11px] text-sf-muted truncate">{clientObj.email}</div>
                  ) : null}
                </div>

                <div className="col-span-2">
                  <div className="truncate">{trainerName}</div>
                  {trainerObj?.email ? (
                    <div className="mt-1 text-[11px] text-sf-muted truncate">{trainerObj.email}</div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: last mer */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-sf-muted">
          Viser {rows.length} booking{rows.length === 1 ? "" : "er"} {hasMore ? `(last flere…)` : `(ingen flere)`}
        </p>

        <button
          onClick={onLoadMore}
          disabled={loadingMore || loading || !hasMore}
          className="rounded-full border border-sf-border px-3 py-2 text-xs font-medium text-sf-muted hover:bg-sf-soft disabled:opacity-50"
        >
          {loadingMore ? "Laster…" : hasMore ? "Last mer" : "Ferdig"}
        </button>
      </div>
    </AppPage>
  );
}