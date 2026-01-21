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
      <ClientCard client={client} />
<Section2ClientActions clientId={clientId} />
<Section3ClientOverview clientId={clientId} />
      <ClientDetails client={client} canEdit />
    </AppPage>
  );
}