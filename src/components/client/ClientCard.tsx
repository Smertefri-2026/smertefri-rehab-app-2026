"use client";

import Link from "next/link";
import { Calendar, HeartPulse, Activity, Utensils } from "lucide-react";
import { Client } from "@/types/client";

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

/* ---------------- TYPES ---------------- */

// UI-status som kan komme fra metrics-hooks (strings, ikke rigid union)
export type ClientCardStatus = {
  nextSession?: string | null;
  painLevel?: string | null;
  testStatus?: string | null;
  nutritionStatus?: string | null;
};

/* ---------------- COMPONENT ---------------- */

type Props = {
  client: Client;
  href?: string;
  status?: ClientCardStatus | null; // 👈 override (fra metrics)
};

export default function ClientCard({ client, href, status: statusProp }: Props) {
  // fallback til gammel client.status hvis du ikke sender inn prop
  const status = (statusProp ?? (client.status as any) ?? null) as ClientCardStatus | null;

  const age = calculateAge(client.birth_date);

  const initials = `${client.first_name?.[0] ?? ""}${client.last_name?.[0] ?? ""}`.toUpperCase();

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
            <p className="text-sm text-sf-muted">{age !== null ? `${age} år` : "—"} • {client.city ?? "—"}</p>
          </div>
        </div>

        {/* 📊 Status */}
        {status && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Calendar size={18} className="text-sf-primary" />
              <span className="text-sm">
                Neste time: <strong>{status.nextSession ?? "—"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <HeartPulse size={18} className="text-sf-primary" />
              <span className="text-sm">
                Smertenivå: <strong>{status.painLevel ?? "—"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Activity size={18} className="text-sf-primary" />
              <span className="text-sm">
                Tester: <strong>{status.testStatus ?? "—"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Utensils size={18} className="text-sf-primary" />
              <span className="text-sm">
                Kosthold: <strong>{status.nutritionStatus ?? "—"}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 🧠 Notat */}
        {client.note?.text && (
          <div className="rounded-xl border border-sf-border bg-white p-3">
            <p className="text-sm text-sf-muted">Kommentar:</p>
            <p className="text-sm">{client.note.text}</p>
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