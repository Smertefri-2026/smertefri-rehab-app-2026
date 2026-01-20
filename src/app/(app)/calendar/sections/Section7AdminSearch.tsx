// /src/app/(app)/calendar/sections/Section7AdminSearch.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Row = {
  id: string;
  role: "trainer" | "client";
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

function fullName(r: Partial<Row>) {
  const name = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim();
  return name || r.email || r.id;
}

function isUuidLike(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

type Props = {
  onPickTrainer: (trainerId: string) => void;
  onPickClient: (clientId: string) => void;

  activeTrainerId?: string | null;
  activeClientId?: string | null;

  // ✅ NYTT: vis navn i stedet for ID nederst
  activeTrainerLabel?: string | null;
  activeClientLabel?: string | null;
};

export default function Section7AdminSearch({
  onPickTrainer,
  onPickClient,
  activeTrainerId,
  activeClientId,
  activeTrainerLabel,
  activeClientLabel,
}: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setError(null);

      if (!trimmed || trimmed.length < 2) {
        setRows([]);
        return;
      }

      setLoading(true);
      try {
        const uuid = isUuidLike(trimmed);

        let query = supabase
          .from("profiles")
          .select("id, role, first_name, last_name, email")
          .in("role", ["trainer", "client"])
          .limit(25);

        if (uuid) {
          query = query.eq("id", trimmed);
        } else {
          const like = `%${trimmed}%`;
          query = query.or(
            `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!alive) return;
        setRows((data ?? []) as Row[]);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Kunne ikke søke");
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [trimmed]);

  const trainerHref = (id: string) => `/trainers/${id}`;
  const clientHref = (id: string) => `/clients/${id}`; // endre til "/clients" hvis du ikke har /clients/[id]

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-semibold">Søk</h3>
            <p className="text-sm text-sf-muted">
              Søk etter kunde eller trener og åpne deres kalender-kontekst.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Søk på navn, e-post eller ID"
                className="w-full rounded-full border border-sf-border bg-sf-soft px-4 py-2 text-sm outline-none"
              />
              <div className="mt-1 text-xs text-sf-muted">
                {loading
                  ? "Søker…"
                  : rows.length
                  ? `${rows.length} treff`
                  : trimmed.length >= 2
                  ? "Ingen treff"
                  : "Skriv minst 2 tegn"}
              </div>
            </div>
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <div className="rounded-xl border border-sf-border overflow-hidden">
            {rows.length === 0 ? (
              <div className="bg-sf-soft p-6 text-center text-sm text-sf-muted">
                Treffliste kommer her.
              </div>
            ) : (
              <ul className="divide-y divide-sf-border">
                {rows.map((r) => {
                  const active =
                    (r.role === "trainer" && activeTrainerId === r.id) ||
                    (r.role === "client" && activeClientId === r.id);

                  const href = r.role === "trainer" ? trainerHref(r.id) : clientHref(r.id);

                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (r.role === "trainer") onPickTrainer(r.id);
                          if (r.role === "client") onPickClient(r.id);
                        }}
                        className={`w-full text-left p-3 hover:bg-sf-soft flex items-center justify-between gap-3 ${
                          active ? "bg-sf-soft" : "bg-white"
                        }`}
                      >
                        <div className="min-w-0">
                          {/* ✅ Navn + lenke til kort */}
                          <div className="text-sm font-medium truncate">
                            <Link
                              href={href}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline"
                            >
                              {fullName(r)}
                            </Link>
                          </div>

                          <div className="text-xs text-sf-muted truncate">
                            {r.role === "trainer" ? "Trener" : "Kunde"} • {r.email ?? r.id}
                          </div>
                        </div>

                        <span className="text-xs rounded-full border border-sf-border px-3 py-1 shrink-0">
                          Velg
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ✅ Aktiv kontekst med NAVN (og klikkbar) */}
          <div className="text-xs text-sf-muted flex flex-wrap gap-2">
            <span>
              Aktiv trener:{" "}
              {activeTrainerId ? (
                <Link href={trainerHref(activeTrainerId)} className="font-medium hover:underline">
                  {activeTrainerLabel ?? activeTrainerId}
                </Link>
              ) : (
                <span className="font-medium">—</span>
              )}
            </span>

            <span>•</span>

            <span>
              Aktiv kunde:{" "}
              {activeClientId ? (
                <Link href={clientHref(activeClientId)} className="font-medium hover:underline">
                  {activeClientLabel ?? activeClientId}
                </Link>
              ) : (
                <span className="font-medium">—</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}