"use client";

import Link from "next/link";
import { User, Calendar, HeartPulse, Activity, Utensils } from "lucide-react";
import { Client } from "@/types/client";

type Props = {
  client: Client;
  href?: string;
};

export default function ClientCard({ client, href }: Props) {
  const status = client.status;

  const content = (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="space-y-4">

        {/* 🧍 Kundeinfo */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sf-soft">
            <User className="text-sf-primary" />
          </div>

          <div>
            <p className="text-base font-semibold text-sf-text">
              {client.first_name} {client.last_name}
            </p>
            <p className="text-sm text-sf-muted">
              {client.age} år • {client.city}
            </p>
          </div>
        </div>

        {/* 📊 Status */}
        {status && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Calendar size={18} className="text-sf-primary" />
              <span className="text-sm">
                Neste time: <strong>{status.nextSession}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <HeartPulse size={18} className="text-sf-primary" />
              <span className="text-sm">
                Smertenivå: <strong>{status.painLevel}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Activity size={18} className="text-sf-primary" />
              <span className="text-sm">
                Tester: <strong>{status.testStatus}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-sf-soft p-3">
              <Utensils size={18} className="text-sf-primary" />
              <span className="text-sm">
                Kosthold: <strong>{status.nutritionStatus}</strong>
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