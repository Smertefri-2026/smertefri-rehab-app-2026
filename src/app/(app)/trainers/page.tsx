"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import TrainerCard from "@/components/trainer/TrainerCard";
import Section1TrainerSearch from "./sections/Section1TrainerSearch";
import Section2PendingApplications from "./sections/Section2PendingApplications";
import { useRole } from "@/providers/RoleProvider";
import { getAllTrainersForAdmin } from "@/lib/trainers";
import type { Trainer } from "@/types/trainer";

export default function TrainersPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getAllTrainersForAdmin()
      .then(setTrainers)
      .catch((e) => setError(e?.message ?? "Kunne ikke hente trenere"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!roleLoading && role === "admin") load();
  }, [roleLoading, role, load]);

  // Dette er nå kun et admin-verktøy for å administrere rehabtrenere — ikke
  // en markedsplass en kunde eller trener browser. Kunder har sin egen side
  // ("Min rehabtrener"); trenere trenger ikke bla i andre trenere.
  useEffect(() => {
    if (roleLoading) return;
    if (role === "client") router.replace("/trainer");
    else if (role === "trainer") router.replace("/profile");
  }, [roleLoading, role, router]);

  const results = useMemo(() => {
    if (!query.trim()) return trainers;
    const q = query.toLowerCase();
    return trainers.filter((t) =>
      `${t.first_name} ${t.last_name} ${t.city ?? ""}`.toLowerCase().includes(q)
    );
  }, [query, trainers]);

  if (roleLoading || role !== "admin") return null;

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
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Rehabtrenere</h1>
          <p className="text-sm text-sf-muted">
            Godkjente rehabtrenere. Kunder velger ikke selv — SmerteFri tildeler.
          </p>
        </div>

        <Section2PendingApplications onApplicationReviewed={load} />

        <Section1TrainerSearch value={query} onChange={setQuery} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} href={`/trainers/${trainer.id}`} />
          ))}
        </section>

        {results.length === 0 && (
          <p className="text-sm text-sf-muted">Ingen trenere matcher søket.</p>
        )}
      </div>
    </AppPage>
  );
}
