"use client";

import AppPage from "@/components/layout/AppPage";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import Section2NutritionGraph from "../sections/Section2NutritionGraph";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ClientNutritionPage({ params }: PageProps) {
  const router = useRouter();
  const { role } = useRole();
  const { getClientById, loading } = useClients();
  const { id } = use(params);

  if (role !== "trainer" && role !== "admin") notFound();

  if (loading) {
    return (
      <AppPage title="Kosthold">
        <div className="text-sm text-sf-muted">Laster kosthold …</div>
      </AppPage>
    );
  }

  const client = getClientById(id);
  if (!client) notFound();

  return (
    <AppPage
      title={`Kosthold – ${client.first_name} ${client.last_name}`}
      subtitle="Oversikt, trend og dagsbehov (hentes fra database)."
      actionsAlign="left"
      actions={
        <button
          type="button"
          onClick={() => router.push(`/clients/${id}`)}
          className="rounded-full border border-sf-border bg-white px-4 py-2 text-sm font-medium text-sf-text hover:bg-sf-soft"
        >
          ← Tilbake
        </button>
      }
    >
      <div className="space-y-6">
        {/* ✅ Kundens graf (Supabase) */}
        <Section2NutritionGraph userId={id} />
      </div>
    </AppPage>
  );
}