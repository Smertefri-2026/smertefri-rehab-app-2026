"use client";

import { useEffect, useState } from "react";
import { getPublicTrainers } from "@/lib/trainers";
import Section2TrainerCard from "./sections/Section2TrainerCard";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicTrainers();
        setTrainers(data);
      } catch (e) {
        console.error("Kunne ikke hente trenere", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="bg-[#F4FBFA] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-xl font-semibold text-sf-text">
            Finn trener
          </h1>
          <p className="text-sm text-sf-muted">
            Velg en trener basert på kompetanse og behov.
          </p>
        </header>

        {/* LOADING */}
        {loading && (
          <p className="text-sm text-sf-muted">
            Laster trenere …
          </p>
        )}

        {/* TOMT */}
        {!loading && trainers.length === 0 && (
          <p className="text-sm text-sf-muted">
            Ingen trenere tilgjengelig akkurat nå.
          </p>
        )}

        {/* LISTE */}
        {!loading && trainers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainers.map((trainer) => (
              <Section2TrainerCard
                key={trainer.id}
                trainer={trainer}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}