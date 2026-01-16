"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ClientTestsPage({ params }: PageProps) {
  const { role } = useRole();
  const { getClientById, loading } = useClients();
  const { id } = use(params);

  if (role !== "trainer" && role !== "admin") notFound();

  if (loading) {
    return <p className="p-4 text-sm text-sf-muted">Laster tester …</p>;
  }

  const client = getClientById(id);
  if (!client) notFound();

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <h1 className="text-lg font-semibold">
          Tester – {client.first_name} {client.last_name}
        </h1>

        <p className="text-sm text-sf-muted">
          Her kommer testresultater og progresjon.
        </p>
      </div>
    </main>
  );
}