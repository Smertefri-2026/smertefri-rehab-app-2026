"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import ClientCard from "@/components/client/ClientCard";
import Section1ClientSearch from "./sections/Section1ClientSearch";
import { useClients } from "@/stores/clients.store";

type FilterKey =
  | "all"
  | "baseline-missing"
  | "inactive-tests"
  | "negative-progress"
  | "positive-progress";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "baseline-missing", label: "Mangler baseline" },
  { key: "inactive-tests", label: "Inaktiv 30+ dager" },
  { key: "negative-progress", label: "Negativ progresjon" },
  { key: "positive-progress", label: "Positiv progresjon" },
];

export default function ClientsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { clients, loading, error } = useClients();

  const urlFilter = (searchParams.get("filter") ?? "all") as FilterKey;
  const activeFilter: FilterKey = FILTERS.some((f) => f.key === urlFilter) ? urlFilter : "all";

  const [query, setQuery] = useState("");

  // Reset søk når man bytter side (samme som før)
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  function setFilter(next: FilterKey) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "all") sp.delete("filter");
    else sp.set("filter", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  const searched = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.city ?? ""}`.toLowerCase().includes(q)
    );
  }, [query, clients]);

  // ✅ Placeholder for filter-logikk (kobles på senere med ekte testdata)
  const results = useMemo(() => {
    if (activeFilter === "all") return searched;

    // Foreløpig: vi viser fortsatt alle (etter søk), men beholder filter i UI/URL.
    // Neste steg: her kobler vi på real data (baseline-missing osv).
    return searched;
  }, [searched, activeFilter]);

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

      {/* 🏷️ Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = f.key === activeFilter;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                active
                  ? "border-[#007C80] bg-[#E6F3F6] text-[#007C80]"
                  : "border-sf-border bg-white text-sf-muted hover:bg-sf-soft",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 👥 Kunde-kort */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((client) => (
          <ClientCard key={client.id} client={client} href={`/clients/${client.id}`} />
        ))}
      </section>

      {/* 🚫 Ingen treff */}
      {results.length === 0 && (
        <p className="text-sm text-sf-muted mt-4">Ingen kunder matcher søket.</p>
      )}
    </AppPage>
  );
}