"use client";

import { useState, useMemo } from "react";
import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import { Client } from "@/types/client";

export default function ClientsPage() {
  const [query, setQuery] = useState("");

  const clients: Client[] = [
    {
      id: "1",
      first_name: "Ola",
      last_name: "Nordmann",
      age: 42,
      city: "Drammen",
      status: { nextSession: "I morgen kl. 14:00" },
    },
    {
      id: "2",
      first_name: "Kari",
      last_name: "Hansen",
      age: 35,
      city: "Oslo",
      status: { nextSession: "Fredag kl. 10:30" },
    },
  ];

  const results = useMemo(() => {
    if (!query) return clients;
    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, clients]);

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

      </div>
    </main>
  );
}