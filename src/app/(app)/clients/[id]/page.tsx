"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import ClientCard from "@/components/client/ClientCard";
import ClientActions from "@/components/client/ClientActions";
import ClientOverview from "@/components/client/ClientOverview";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ClientDetailPage({ params }: PageProps) {
  const { role } = useRole();
  const { getClientById, loading } = useClients();

  // ✅ Next 15+
  const { id: clientId } = use(params);

  // 🔐 Rollebeskyttelse
  if (role !== "trainer" && role !== "admin") {
    notFound();
  }

  if (loading) {
    return (
      <main className="bg-[#F4FBFA]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-sm text-sf-muted">Laster kunde …</p>
        </div>
      </main>
    );
  }

  const client = getClientById(clientId);

  // 🚫 Ingen tilgang / feil ID
  if (!client) {
    notFound();
  }

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <ClientCard client={client} />
        <ClientActions clientId={clientId} />
        <ClientOverview clientId={clientId} />
      </div>
    </main>
  );
}