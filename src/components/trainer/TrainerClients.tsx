"use client";

import { useMemo, useState } from "react";
import ClientCard from "@/components/client/ClientCard";
import { useClients } from "@/stores/clients.store";

type Props = {
  trainerId: string;
};

export default function TrainerClients({ trainerId }: Props) {
  const { clients, loading } = useClients();
  const [query, setQuery] = useState("");

  // 🔗 Filtrer kunder knyttet til trener
  const trainerClients = useMemo(() => {
    return clients.filter(
      (c) => c.trainer_id === trainerId
    );
  }, [clients, trainerId]);

  // 🔍 Søk i trenerens kunder
  const results = useMemo(() => {
    if (!query.trim()) return trainerClients;

    const q = query.toLowerCase();

    return trainerClients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, trainerClients]);

  if (loading) {
    return (
      <p className="text-sm text-sf-muted">
        Laster kunder …
      </p>
    );
  }

  return (
    <section
      id="clients"
      className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm space-y-4"
    >
      {/* 🏷 Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-sf-muted">
          Kunder tilknyttet trener ({results.length})
        </h3>

        {/* 🔍 Søk */}
        <input
          type="text"
          placeholder="Søk i kunder…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full sm:w-64
            rounded-lg border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-sf-primary
          "
        />
      </div>

      {/* 🚫 Ingen kunder */}
      {trainerClients.length === 0 && (
        <p className="text-sm text-sf-muted">
          Ingen kunder er knyttet til denne treneren.
        </p>
      )}

      {/* 🚫 Ingen treff */}
      {trainerClients.length > 0 && results.length === 0 && (
        <p className="text-sm text-sf-muted">
          Ingen kunder matcher søket.
        </p>
      )}

      {/* 👥 Kundekort */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              href={`/clients/${client.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}