"use client";

import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section7AdminStats() {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Administrasjon – oversikt
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AKTIVE BRUKERE */}
        <DashboardCard
          title="Aktive brukere"
          icon={<Users size={18} />}
        >
          <p>Totalt på plattformen</p>
          <p className="text-sf-muted">
            Tall vises når data er tilgjengelig
          </p>
        </DashboardCard>

        {/* TRENERE */}
        <DashboardCard
          title="Rehab-trenere"
          icon={<UserCheck size={18} />}
        >
          <p>Godkjente trenere</p>
          <p className="text-sf-muted">
            Aktiv status krever full profil
          </p>
        </DashboardCard>

        {/* BOOKINGER */}
        <DashboardCard
          title="Avtaler i systemet"
          icon={<Calendar size={18} />}
        >
          <p>Kommende og historiske avtaler</p>
          <p className="text-sf-muted">
            Ingen filtrering aktiv
          </p>
        </DashboardCard>

        {/* AKTIVITET */}
        <DashboardCard
          title="Plattformaktivitet"
          icon={<Activity size={18} />}
        >
          <p>Tester, smerter og oppdateringer</p>
          <p className="text-sf-muted">
            Samlet aktivitetsnivå
          </p>
        </DashboardCard>

        {/* VARSLER */}
        <DashboardCard
          title="Systemvarsler"
          icon={<AlertCircle size={18} />}
          variant="info"
        >
          <p>Ingen kritiske varsler</p>
          <p className="text-sf-muted">
            Systemet fungerer normalt
          </p>
        </DashboardCard>
      </div>

      <p className="text-xs text-sf-muted">
        Denne oversikten vil utvides med filtre, historikk og varsler.
      </p>
    </section>
  );
}