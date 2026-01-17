"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

import TrainerCard from "@/components/trainer/TrainerCard";
import Section1TrainerSearch from "./sections/Section1TrainerSearch";
import { useTrainers } from "@/stores/trainers.store";

export default function TrainersPage() {
  const pathname = usePathname();

  const { trainers, loading, error } = useTrainers();
  const [query, setQuery] = useState("");

  /**
   * 🔄 Reset søk når brukeren navigerer hit igjen
   */
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  /**
   * 🔍 Filtrer trenere basert på søk
   */
  const results = useMemo(() => {
    if (!query.trim()) return trainers;

    const q = query.toLowerCase();

    return trainers.filter((t) =>
      `${t.first_name} ${t.last_name} ${t.city ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, trainers]);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <p className="p-4 text-sm text-sf-muted">
        Laster trenere…
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
        <Section1TrainerSearch
          value={query}
          onChange={setQuery}
        />

        {/* 👥 Trener-kort */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-sm text-sf-muted">
            Ingen trenere matcher søket.
          </p>
        )}

      </div>
    </main>
  );
}