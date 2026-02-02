"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import AppPage from "@/components/layout/AppPage";

import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import ClientCard from "@/components/client/ClientCard";
import Section2ClientActions from "../sections/Section2ClientActions";
import Section3ClientOverview from "../sections/Section3ClientOverview";
import ClientDetails from "@/components/client/ClientDetails";

import Section4ClientPainSummary from "../sections/Section4ClientPainSummary";
import Section5ClientTestsSummary from "../sections/Section5ClientTestsSummary";
import Section6ClientNutritionSummary from "../sections/Section6ClientNutritionSummary";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ClientDetailPage({ params }: PageProps) {
  const { role } = useRole();
  const { getClientById, loading } = useClients();

  const { id: clientId } = use(params);

  if (role !== "trainer" && role !== "admin") notFound();

  if (loading) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster kunde …</p>
      </AppPage>
    );
  }

  const client = getClientById(clientId);
  if (!client) notFound();

  return (
    <AppPage>
      <div className="space-y-6">
        <ClientCard client={client} />

        <Section2ClientActions clientId={clientId} />
        <Section3ClientOverview clientId={clientId} />

        {/* ✅ 3-kolonne “dashboard-grid” */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sf-muted">Status</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Section4ClientPainSummary clientId={clientId} />
            <Section5ClientTestsSummary clientId={clientId} />
            <Section6ClientNutritionSummary clientId={clientId} />
          </div>
        </section>

        <ClientDetails client={client} canEdit />
      </div>
    </AppPage>
  );
}