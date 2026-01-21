"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import TrainerCard from "@/components/trainer/TrainerCard";
import Section1TrainerSearch from "./sections/Section1TrainerSearch";
import { useTrainers } from "@/stores/trainers.store";

export default function TrainersPage() {
  const pathname = usePathname();

  const { trainers, loading, error } = useTrainers();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const results = useMemo(() => {
    if (!query.trim()) return trainers;
    const q = query.toLowerCase();
    return trainers.filter((t) =>
      `${t.first_name} ${t.last_name} ${t.city ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, trainers]);

  if (loading) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster trenere…</p>
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
      <Section1TrainerSearch value={query} onChange={setQuery} />

      {/* 👥 Trener-kort */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            href={`/trainers/${trainer.id}`}
          />
        ))}
      </section>

      {/* 🚫 Ingen treff */}
      {results.length === 0 && (
        <p className="text-sm text-sf-muted">Ingen trenere matcher søket.</p>
      )}
    </AppPage>
  );
}