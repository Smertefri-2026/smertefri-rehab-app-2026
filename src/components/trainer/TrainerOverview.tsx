"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  User,
  ChevronRight,
} from "lucide-react";

type Props = {
  trainerId: string;
};

export default function TrainerOverview({ trainerId }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-sf-muted">
        Treneroversikt
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* 📅 Kalender */}
        <Link
          href={`/calendar?trainer=${trainerId}`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" />
            <div>
              <p className="text-sm font-medium">Kalender</p>
              <p className="text-xs text-sf-muted">
                Se og administrer timer
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>

        {/* 👥 Kunder */}
        <Link
          href={`/trainers/${trainerId}#clients`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <Users className="text-green-500" />
            <div>
              <p className="text-sm font-medium">Kunder</p>
              <p className="text-xs text-sf-muted">
                Oversikt over tilknyttede kunder
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>

        {/* 👤 Profil */}
        <Link
          href={`/trainers/${trainerId}`}
          className="flex items-center justify-between rounded-xl border border-sf-border p-4 transition hover:bg-sf-soft"
        >
          <div className="flex items-center gap-3">
            <User className="text-sf-primary" />
            <div>
              <p className="text-sm font-medium">Profil</p>
              <p className="text-xs text-sf-muted">
                Se og rediger trenerprofil
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sf-muted" />
        </Link>

      </div>
    </section>
  );
}