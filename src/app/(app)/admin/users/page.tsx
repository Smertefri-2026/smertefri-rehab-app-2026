"use client";

import { useEffect, useMemo, useState } from "react";
import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/providers/RoleProvider";
import { getActiveTrainerIdMapForClients } from "@/lib/assignments.api";
import { adminSetUserRole, type UserRole } from "@/lib/adminUsers.api";

type Role = "client" | "trainer" | "admin" | "all";

type Row = {
  id: string;
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  trainer_id?: string | null;
  created_at?: string | null;
  email?: string | null; // valgfritt hvis du vil bruke det i label
};

type ProfileLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

function fullName(r: { first_name?: string | null; last_name?: string | null; email?: string | null; id?: string }) {
  const n = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
  return n || r.email || r.id || "—";
}

const ROLE_LABEL: Record<UserRole, string> = {
  client: "Kunde",
  trainer: "Rehabtrener",
  admin: "Admin",
};

export default function AdminUsersPage() {
  const { role, loading: roleLoading } = useRole();

  const [rows, setRows] = useState<Row[]>([]);
  const [trainerById, setTrainerById] = useState<Record<string, ProfileLite>>({});
  const [clientCountByTrainerId, setClientCountByTrainerId] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [changingId, setChangingId] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);

  async function handleRoleChange(target: Row, newRole: UserRole) {
    const currentRole = (target.role ?? "client") as UserRole;
    if (newRole === currentRole) return;

    const name = fullName(target);
    const confirmed = window.confirm(
      `Endre rolle for ${name} fra "${ROLE_LABEL[currentRole] ?? target.role}" til "${ROLE_LABEL[newRole]}"?\n\n` +
        (newRole === "trainer"
          ? "Brukeren får trenertilgang med én gang og en tom trenerprofil opprettes hvis den ikke finnes."
          : currentRole === "trainer"
          ? "Trenerprofilen og historiske kundetildelinger beholdes uendret — de slettes ikke."
          : "")
    );
    if (!confirmed) return;

    setChangingId(target.id);
    setRoleErr(null);
    try {
      await adminSetUserRole(target.id, newRole);
      setRows((prev) => prev.map((r) => (r.id === target.id ? { ...r, role: newRole } : r)));
    } catch (e) {
      setRoleErr(e instanceof Error ? e.message : "Kunne ikke endre rolle");
    } finally {
      setChangingId(null);
    }
  }

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
        // 1) Hent alle profiles (trainer_id er ikke lenger en kolonne her —
        //    relasjonen slås opp separat via client_trainer_assignments)
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, city, created_at, email")
          .order("created_at", { ascending: false })
          .limit(500);

        if (!alive) return;
        if (error) throw error;

        const rawList = data ?? [];

        // 2) Slå opp aktiv trener per klient
        const clientIds = rawList.filter((r) => r.role === "client").map((r) => r.id);
        const trainerIdByClient = await getActiveTrainerIdMapForClients(clientIds);

        const list: Row[] = rawList.map((r) => ({
          ...r,
          trainer_id: r.role === "client" ? trainerIdByClient[r.id] ?? null : null,
        }));

        if (!alive) return;
        setRows(list);

        // 3) Bygg liste av trainer_id som finnes hos klienter
        const trainerIds = Array.from(new Set(Object.values(trainerIdByClient)));

        // 4) Bygg count kunder per trainer_id (for "Kunder"-kolonnen)
        const counts: Record<string, number> = {};
        for (const trainerId of Object.values(trainerIdByClient)) {
          counts[trainerId] = (counts[trainerId] ?? 0) + 1;
        }
        setClientCountByTrainerId(counts);

        // 5) Hent trenerprofiler og lag map
        if (trainerIds.length === 0) {
          setTrainerById({});
          return;
        }

        const { data: tProfs, error: tErr } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", trainerIds);

        if (!alive) return;
        if (tErr) throw tErr;

        const map: Record<string, ProfileLite> = {};
        for (const p of (tProfs ?? []) as any[]) {
          map[String(p.id)] = {
            id: String(p.id),
            first_name: p.first_name ?? null,
            last_name: p.last_name ?? null,
            email: p.email ?? null,
          };
        }
        setTrainerById(map);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Ukjent feil");
        setRows([]);
        setTrainerById({});
        setClientCountByTrainerId({});
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
        const trainerName =
          r.trainer_id && trainerById[r.trainer_id] ? fullName(trainerById[r.trainer_id]) : "";
        const hay = `${fullName(r)} ${r.city ?? ""} ${trainerName} ${r.id}`.toLowerCase();
        return hay.includes(query);
      });
    }

    return list;
  }, [rows, q, roleFilter, trainerById]);

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
            placeholder="Søk navn, by, trener eller ID…"
            className="w-full sm:w-72 rounded-xl border border-sf-border bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Feil: {err}
        </div>
      ) : null}

      {roleErr ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Kunne ikke endre rolle: {roleErr}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-sf-border overflow-hidden">
        <div className="grid grid-cols-12 bg-sf-soft px-4 py-2 text-xs font-medium text-sf-muted">
          <div className="col-span-4">Navn</div>
          <div className="col-span-2">Rolle</div>
          <div className="col-span-2">By</div>
          <div className="col-span-2">Trener</div>
          <div className="col-span-2">Kunder</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-sf-muted">Laster…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-sf-muted">Ingen treff.</div>
        ) : (
          filtered.map((r) => {
            const trainerObj = r.trainer_id ? trainerById[r.trainer_id] : null;
            const trainerName = trainerObj ? fullName(trainerObj) : r.trainer_id ? r.trainer_id.slice(0, 8) : "—";

            const kunder =
              (r.role ?? "") === "trainer"
                ? (clientCountByTrainerId[r.id] ?? 0)
                : "—";

            return (
              <div key={r.id} className="grid grid-cols-12 px-4 py-3 text-sm border-t border-sf-border">
                <div className="col-span-4">{fullName(r)}</div>
                <div className="col-span-2">
                  <select
                    value={(r.role as UserRole) ?? "client"}
                    disabled={changingId === r.id}
                    onChange={(e) => handleRoleChange(r, e.target.value as UserRole)}
                    className="w-full rounded-md border border-sf-border bg-white px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="client">Kunde</option>
                    <option value="trainer">Rehabtrener</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-span-2">{r.city ?? "—"}</div>

                <div className="col-span-2">
                  {(r.role ?? "") === "client" ? (
                    <div className="truncate">{trainerName}</div>
                  ) : (
                    <span className="text-sf-muted">—</span>
                  )}
                </div>

                <div className="col-span-2">
                  {(r.role ?? "") === "trainer" ? (
                    <span className="font-medium">{kunder}</span>
                  ) : (
                    <span className="text-sf-muted">—</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppPage>
  );
}