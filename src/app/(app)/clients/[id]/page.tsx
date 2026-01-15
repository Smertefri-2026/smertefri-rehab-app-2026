"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { useRole } from "@/providers/RoleProvider";

import ClientCard from "@/components/client/ClientCard";
import ClientActions from "@/components/client/ClientActions";
import ClientOverview from "@/components/client/ClientOverview";

import { Client } from "@/types/client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ClientDetailPage({ params }: PageProps) {
  const { role } = useRole();

  // ✅ RIKTIG i Next 15+
  const { id: clientId } = use(params);

  if (role !== "trainer" && role !== "admin") {
    notFound();
  }

  // 🔧 DUMMY – erstattes med Supabase
  const client: Client = {
    id: clientId,
    first_name: "Ola",
    last_name: "Nordmann",
    age: 42,
    city: "Drammen",
    status: {
      nextSession: "I morgen kl. 14:00",
      painLevel: "Moderat",
      testStatus: "Stabil fremgang",
      nutritionStatus: "Logget i dag",
    },
    note: {
      text: "Fokus på rygg og hofte. God fremgang siste 4 uker.",
    },
  };

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