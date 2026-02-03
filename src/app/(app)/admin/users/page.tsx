"use client";

import { useEffect, useMemo, useState } from "react";
import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";

type Role = "client" | "trainer" | "admin" | "all";

type Row = {
  id: string;
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  trainer_id?: string | null;
  created_at?: string | null;
};

function fullName(r: Row) {
  const n = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
  return n || "—";
}

export default function AdminUsersPage() {
  const { role, loading: roleLoading } = useRole();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("all");

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") return;

    let alive = true;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, city, trainer_id, created_at")
          .order("created_at", { ascending: false })
          .limit(500);

        if (!alive) return;
        if (error) throw error;

        setRows((data ?? []) as Row[]);
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
  }, [role, roleLoading]);

  if (roleLoading) return null;
  if (role !== "admin") return null;

  const filtered = useMemo(() => {
    let list = rows;

    if (roleFilter !== "all") {
      list = list.filter((r) => (r.role ?? "") === roleFilter);
    }

    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((r) => {
        const hay = `${fullName(r)} ${r.city ?? ""} ${r.id}`.toLowerCase();
        return hay.includes(query);
      });
    }

    return list;
  }, [rows, q, roleFilter]);

  return (
    <AppPage>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Admin – Brukere</h1>
          <p className="text-sm text-sf-muted">En enkel oversikt med filter og søk.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role)}
            className="rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
          >
            <option value="all">Alle roller</option>
            <option value="client">Klient</option>
            <option value="trainer">Trener</option>
            <option value="admin">Admin</option>
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk navn, by eller ID…"
            className="w-full sm:w-72 rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Feil: {err}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-sf-border overflow-hidden">
        <div className="grid grid-cols-12 bg-sf-soft px-4 py-2 text-xs font-medium text-sf-muted">
          <div className="col-span-4">Navn</div>
          <div className="col-span-2">Rolle</div>
          <div className="col-span-2">By</div>
          <div className="col-span-2">Trainer ID</div>
          <div className="col-span-2">User ID</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-sf-muted">Laster…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-sf-muted">Ingen treff.</div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-sf-border">
              <div className="col-span-4">{fullName(r)}</div>
              <div className="col-span-2">{r.role ?? "—"}</div>
              <div className="col-span-2">{r.city ?? "—"}</div>
              <div className="col-span-2">{r.trainer_id ?? "—"}</div>
              <div className="col-span-2 font-mono text-xs">{r.id}</div>
            </div>
          ))
        )}
      </div>
    </AppPage>
  );
}