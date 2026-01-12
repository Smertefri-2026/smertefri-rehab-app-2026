"use client";

import { useRole } from "@/providers/RoleProvider";
import {
  AlertTriangle,
  CreditCard,
  CalendarClock,
  User,
  Users,
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

export default function Section2StatusAndNextSteps() {
  const { role } = useRole();

  /* --------------------------------
     🔧 DUMMY STATUS (kun for nå)
     → erstattes senere med ekte data
  -------------------------------- */

  const status = {
    // Felles
    clientCardIncomplete: true,
    trainerCardIncomplete: true,

    // Kunde
    client: {
      paymentMissing: true,
      noUpcomingSession: true,
    },

    // Trener
    trainer: {
      freeCapacity: true,
      clientsWithoutSessions: 3,
    },

    // Admin
    admin: {
      clientsWithIncompleteCards: 4,
      trainersWithIncompleteCards: 2,
      usersWithoutPayment: 12,
    },
  };

  /* --------------------------------
     HJELPER: finnes det varsler?
  -------------------------------- */

  const hasClientIssues =
    status.clientCardIncomplete ||
    status.client.paymentMissing ||
    status.client.noUpcomingSession;

  const hasTrainerIssues =
    status.trainerCardIncomplete ||
    status.trainer.freeCapacity ||
    status.trainer.clientsWithoutSessions > 0;

  const hasAdminIssues =
    status.admin.clientsWithIncompleteCards > 0 ||
    status.admin.trainersWithIncompleteCards > 0 ||
    status.admin.usersWithoutPayment > 0;

  const shouldRender =
    (role === "client" && hasClientIssues) ||
    (role === "trainer" && hasTrainerIssues) ||
    (role === "admin" && hasAdminIssues);

  if (!shouldRender) return null;

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Varsler & mangler
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* ================== KUNDE ================== */}
        {role === "client" && status.clientCardIncomplete && (
          <DashboardCard
            title="Kundekort ikke fullført"
            icon={<User size={18} />}
            variant="warning"
          >
            <p>Vi mangler viktig informasjon.</p>
            <p className="text-sm text-sf-muted">
              Fullfør smerte, tester og kosthold.
            </p>
          </DashboardCard>
        )}

        {role === "client" && status.client.paymentMissing && (
          <DashboardCard
            title="Ingen aktiv betaling"
            icon={<CreditCard size={18} />}
            variant="danger"
          >
            <p>Tilgangen kan bli begrenset.</p>
            <p className="text-sm text-sf-muted">
              Registrer betalingsmetode.
            </p>
          </DashboardCard>
        )}

        {role === "client" && status.client.noUpcomingSession && (
          <DashboardCard
            title="Ingen kommende avtale"
            icon={<CalendarClock size={18} />}
            variant="info"
          >
            <p>Fast oppfølging gir bedre progresjon.</p>
            <p className="text-sm text-sf-muted">
              Book time med trener.
            </p>
          </DashboardCard>
        )}

        {/* ================== TRENER ================== */}
        {role === "trainer" && status.trainerCardIncomplete && (
          <DashboardCard
            title="Trenerprofil ikke fullført"
            icon={<Users size={18} />}
            variant="warning"
          >
            <p>Profilen din vises for kunder.</p>
            <p className="text-sm text-sf-muted">
              Fyll ut trenerkortet for bedre synlighet.
            </p>
          </DashboardCard>
        )}

        {role === "trainer" && status.trainer.freeCapacity && (
          <DashboardCard
            title="Ledig kapasitet"
            icon={<CalendarClock size={18} />}
            variant="info"
          >
            <p>Du har åpne tider.</p>
            <p className="text-sm text-sf-muted">
              Gjør deg tilgjengelig for flere kunder.
            </p>
          </DashboardCard>
        )}

        {role === "trainer" &&
          status.trainer.clientsWithoutSessions > 0 && (
            <DashboardCard
              title="Klienter uten avtale"
              icon={<AlertTriangle size={18} />}
              variant="warning"
            >
              <p>
                {status.trainer.clientsWithoutSessions} klienter mangler
                kommende økt.
              </p>
              <p className="text-sm text-sf-muted">
                Vurder oppfølging.
              </p>
            </DashboardCard>
          )}

        {/* ================== ADMIN ================== */}
        {role === "admin" &&
          status.admin.clientsWithIncompleteCards > 0 && (
            <DashboardCard
              title="Ufullstendige kundekort"
              icon={<User size={18} />}
              variant="warning"
            >
              <p>
                {status.admin.clientsWithIncompleteCards} kunder mangler
                fullstendig kort.
              </p>
              <p className="text-sm text-sf-muted">
                Følg opp for kvalitet.
              </p>
            </DashboardCard>
          )}

        {role === "admin" &&
          status.admin.trainersWithIncompleteCards > 0 && (
            <DashboardCard
              title="Ufullstendige trenerkort"
              icon={<Users size={18} />}
              variant="warning"
            >
              <p>
                {status.admin.trainersWithIncompleteCards} trenere mangler
                fullført profil.
              </p>
              <p className="text-sm text-sf-muted">
                Påvirker kundetillit.
              </p>
            </DashboardCard>
          )}

        {role === "admin" &&
          status.admin.usersWithoutPayment > 0 && (
            <DashboardCard
              title="Manglende betalinger"
              icon={<CreditCard size={18} />}
              variant="danger"
            >
              <p>
                {status.admin.usersWithoutPayment} brukere mangler
                betaling.
              </p>
              <p className="text-sm text-sf-muted">
                Gå til betalingsoversikt.
              </p>
            </DashboardCard>
          )}

      </div>
    </section>
  );
}