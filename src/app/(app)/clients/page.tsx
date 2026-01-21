"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import { useClients } from "@/stores/clients.store";

export default function ClientsPage() {
  const pathname = usePathname();
  const { clients, loading, error } = useClients();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const results = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, clients]);

  if (loading) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster kunder…</p>
      </AppPage>
    );
  }

  if (error) {
    return (
      <AppPage>
        <p className="text-sm text-red-600">{error}</p>
      </AppPage>
    );
  }

  return (
    <AppPage>
      {/* 🔍 Søk */}
      <Section1ClientSearch value={query} onChange={setQuery} />

      {/* 👥 Kunde-kort */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            href={`/clients/${client.id}`}
          />
        ))}
      </section>

      {/* 🚫 Ingen treff */}
      {results.length === 0 && (
        <p className="text-sm text-sf-muted">Ingen kunder matcher søket.</p>
      )}
    </AppPage>
  );
}