"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import { useClients } from "@/stores/clients.store";

export default function ClientsPage() {
  const pathname = usePathname();

  const { clients, loading, error } = useClients();
  const [query, setQuery] = useState("");

  /**
   * 🔄 Reset søk når brukeren navigerer hit igjen
   * (viktig for desktop-sidebar)
   */
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  /**
   * 🔍 Filtrer kunder basert på søk
   */
  const results = useMemo(() => {
    if (!query.trim()) return clients;

    const q = query.toLowerCase();

    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, clients]);

  /* ---------------- STATES ---------------- */

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

  /* ---------------- RENDER ---------------- */

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* 🔍 Søk */}
        <Section1ClientSearch
          value={query}
          onChange={setQuery}
        />

        {/* 👥 Kunde-kort */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-sm text-sf-muted">
            Ingen kunder matcher søket.
          </p>
        )}

      </div>
    </main>
  );
}