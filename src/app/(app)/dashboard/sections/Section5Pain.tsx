"use client";

import { useRole } from "@/providers/RoleProvider";
import {
  HeartPulse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import Link from "next/link";

export default function Section5Pain() {
  const { role } = useRole();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Smerte & helselogg
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ======================= KUNDE ======================= */}
        {role === "client" && (
          <>
            <DashboardCard title="Aktive smerteområder" icon={<HeartPulse size={18} />}>
              <p className="text-lg font-semibold">2 områder</p>
              <p className="text-xs text-sf-muted">
                Håndledd og nakke
              </p>
            </DashboardCard>

            <DashboardCard
              title="Snitt smerteintensitet"
              icon={<TrendingDown size={18} />}
              variant="info"
            >
              <p className="text-lg font-semibold">5.5 / 10</p>
              <p className="text-xs text-sf-muted">
                ↓ Svakt forbedret siste 14 dager
              </p>
            </DashboardCard>

            <DashboardCard
              title="Oppdater smerte"
              icon={<HeartPulse size={18} />}
            >
              <p className="text-sm text-sf-muted">
                Hold oversikt over smerteutviklingen din.
              </p>

              <Link
                href="/pain"
                className="btn-primary mt-3"
              >
                Åpne smertejournal
              </Link>
            </DashboardCard>
          </>
        )}

        {/* ======================= TRENER ======================= */}
        {role === "trainer" && (
          <>
            <DashboardCard
              title="Høy smerte"
              icon={<AlertTriangle size={18} />}
              variant="danger"
            >
              <p>2 klienter rapporterer smerte ≥ 7.</p>
              <button className="btn-secondary mt-3">
                Se klienter
              </button>
            </DashboardCard>

            <DashboardCard
              title="Økende smerte"
              icon={<TrendingUp size={18} />}
              variant="warning"
            >
              <p>3 klienter har økende smerte siste 7 dager.</p>
              <button className="btn-secondary mt-3">
                Følg opp
              </button>
            </DashboardCard>

            <DashboardCard
              title="Ingen oppdatering"
              icon={<Users size={18} />}
            >
              <p>4 klienter har ikke oppdatert smerte på 10+ dager.</p>
              <button className="btn-secondary mt-3">
                Send påminnelse
              </button>
            </DashboardCard>
          </>
        )}

        {/* ======================= ADMIN ======================= */}
        {role === "admin" && (
          <>
            <DashboardCard title="Gjennomsnittlig smerte" icon={<HeartPulse size={18} />}>
              <p className="text-lg font-semibold">4.9 / 10</p>
              <p className="text-xs text-sf-muted">
                Basert på aktive brukere
              </p>
            </DashboardCard>

            <DashboardCard
              title="Høy smerte (system)"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>11 % av kunder rapporterer smerte ≥ 7.</p>
            </DashboardCard>

            <DashboardCard
              title="Manglende rapportering"
              icon={<Users size={18} />}
              variant="danger"
            >
              <p>19 % har ikke oppdatert smerte siste 14 dager.</p>
            </DashboardCard>
          </>
        )}
      </div>
    </section>
  );
}