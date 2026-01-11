"use client";

import {
  TrendingUp,
  LineChart,
  BarChart3,
  Timer,
  Activity,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section8Analytics() {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Analyse & innsikt
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PROGRESJON */}
        <DashboardCard
          title="Progresjon over tid"
          icon={<TrendingUp size={18} />}
        >
          <p>Endring i tester og smerte</p>
          <p className="text-sf-muted">
            Måles per bruker og per periode
          </p>
        </DashboardCard>

        {/* ENGASJEMENT */}
        <DashboardCard
          title="Brukerengasjement"
          icon={<Activity size={18} />}
        >
          <p>Aktive dager og handlinger</p>
          <p className="text-sf-muted">
            Kalender · tester · registreringer
          </p>
        </DashboardCard>

        {/* TID I SYSTEMET */}
        <DashboardCard
          title="Tid i rehabilitering"
          icon={<Timer size={18} />}
        >
          <p>Varighet per løp</p>
          <p className="text-sf-muted">
            Fra oppstart til mål
          </p>
        </DashboardCard>

        {/* RAPPORTERING */}
        <DashboardCard
          title="Rapporter"
          icon={<LineChart size={18} />}
        >
          <p>Eksport og oversikter</p>
          <p className="text-sf-muted">
            PDF / CSV (kommer senere)
          </p>
        </DashboardCard>

        {/* TRENDS */}
        <DashboardCard
          title="Plattform-trender"
          icon={<BarChart3 size={18} />}
          variant="info"
        >
          <p>Populære tiltak og mønstre</p>
          <p className="text-sf-muted">
            Basert på anonymiserte data
          </p>
        </DashboardCard>
      </div>

      <p className="text-xs text-sf-muted">
        Analysemodulen vil bygges ut med grafer, filtre og tidslinjer.
      </p>
    </section>
  );
}