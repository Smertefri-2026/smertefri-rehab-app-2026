"use client";

import { useState, useMemo } from "react";
import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import { useClients } from "@/stores/clients.store";

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const { clients, loading, error } = useClients();

  const results = useMemo(() => {
    if (!query) return clients;

    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, clients]);

  if (loading) {
    return (
      <p className="p-4 text-sm text-sf-muted">
        Laster kunder…
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-4 text-sm text-red-600">
        {error}
      </p>
    );
  }

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        <Section1ClientSearch value={query} onChange={setQuery} />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              href={`/clients/${client.id}`}
            />
          ))}
        </section>

        {results.length === 0 && (
          <p className="text-sm text-sf-muted">
            Ingen kunder matcher søket.
          </p>
        )}

      </div>
    </main>
  );
}