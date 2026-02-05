// /Users/oystein/smertefri-rehab-app-2026/src/components/client/ClientCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Client } from "@/types/client";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- HELPERS ---------------- */

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;

  const parts = birthDate.split("T")[0].split("-");
  if (parts.length !== 3) return null;

  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return null;

  const today = new Date();
  let age = today.getFullYear() - y;

  const month = today.getMonth() + 1;
  const day = today.getDate();

  const hasHadBirthdayThisYear = month > m || (month === m && day >= d);
  if (!hasHadBirthdayThisYear) age--;

  return age;
}

function formatDateNo(d: Date) {
  const weekday = d.toLocaleDateString("no-NO", { weekday: "long" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dd}.${mm}`;
}

function formatTimeHHMM(d: Date) {
  return d.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function prettyDateTime(ts: string | null | undefined) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return `${formatDateNo(d)} · ${formatTimeHHMM(d)}`;
}

function isPlaceholder(v: string) {
  const s = String(v ?? "").trim().toLowerCase();
  return !s || s === "mangler" || s === "har" || s === "—" || s === "har ikke";
}

/* ---------------- TYPES ---------------- */

export type ClientCardStatus = {
  nextSession?: string | null;
  painLevel?: string | null;
  testStatus?: string | null;
  nutritionStatus?: string | null;
};

type Props = {
  client: Client;
  href?: string;
  status?: ClientCardStatus | null;
};

/* ---------------- COMPONENT ---------------- */

export default function ClientCard({ client, href, status: statusProp }: Props) {
  const age = calculateAge((client as any).birth_date ?? (client as any).birthDate ?? client.birth_date);
  const initials = `${client.first_name?.[0] ?? ""}${client.last_name?.[0] ?? ""}`.toUpperCase();

  // Lokal state for detaljsiden (der vi ikke har status fra ClientsPage)
  const [nextFromDb, setNextFromDb] = useState<string | null>(null);

  // Bare fetch når kortet brukes "standalone" (typisk detaljsiden)
  const shouldFetchNext = !href && isPlaceholder(String(statusProp?.nextSession ?? ""));

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!shouldFetchNext) return;

      try {
        const nowISO = new Date().toISOString();

        const { data, error } = await supabase
          .from("bookings")
          .select("start_time,status")
          .eq("client_id", client.id)
          .neq("status", "cancelled")
          .gte("start_time", nowISO)
          .order("start_time", { ascending: true })
          .limit(1);

        if (error) throw error;

        const row = (data ?? [])[0] as any;
        const label = prettyDateTime(row?.start_time ?? null);

        if (!alive) return;
        setNextFromDb(label ?? null);
      } catch (e) {
        if (!alive) return;
        setNextFromDb(null);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [shouldFetchNext, client.id]);

  const nextLabel = useMemo(() => {
    const raw = String(statusProp?.nextSession ?? "").trim();

    // Hvis statusProp har pen dato-tekst, bruk den
    if (raw && !isPlaceholder(raw)) {
      // Hvis den er ISO, prettify
      const isoLabel = prettyDateTime(raw);
      return isoLabel ?? raw;
    }

    // På detaljsiden: bruk DB-resultat hvis vi har det
    if (nextFromDb) return nextFromDb;

    return "Mangler";
  }, [statusProp?.nextSession, nextFromDb]);

  const content = (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="space-y-4">
        {/* 👤 Kundeinfo */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-sf-soft flex items-center justify-center overflow-hidden">
            {client.avatar_url ? (
              <img
                src={client.avatar_url}
                alt={`${client.first_name} ${client.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-sf-primary">{initials || "—"}</span>
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-sf-text">
              {client.first_name} {client.last_name}
            </p>
            <p className="text-sm text-sf-muted">
              {age !== null ? `${age} år` : "—"} • {client.city ?? "—"}
            </p>
          </div>
        </div>

        {/* 📅 Neste time */}
        <div className="grid grid-cols-1">
          <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
            <CalendarClock size={18} className="text-sf-primary" />
            <span className="text-sm">
              Neste time: <strong>{nextLabel}</strong>
            </span>
          </div>
        </div>

        {/* 🧠 Notat */}
        {(client as any)?.note?.text && (
          <div className="rounded-xl border border-sf-border bg-white p-3">
            <p className="text-sm text-sf-muted">Kommentar:</p>
            <p className="text-sm">{(client as any).note.text}</p>
          </div>
        )}
      </div>
    </section>
  );

  return href ? (
    <Link href={href} className="block cursor-pointer">
      {content}
    </Link>
  ) : (
    content
  );
}