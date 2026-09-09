"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { getTrainerById } from "@/lib/trainers";
import type { Trainer } from "@/types/trainer";

import TrainerCard from "@/components/trainer/TrainerCard";
import TrainerDetails from "@/components/trainer/TrainerDetails";
import TrainerClients from "@/components/trainer/TrainerClients";
import TrainerActions from "@/components/trainer/TrainerActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();
  const { id: trainerId } = use(params);

  const [trainer, setTrainer] = useState<Trainer | null | undefined>(undefined);

  const load = useCallback(() => {
    getTrainerById(trainerId)
      .then(setTrainer)
      .catch((e) => {
        console.error("Kunne ikke hente trener:", e);
        setTrainer(null);
      });
  }, [trainerId]);

  useEffect(() => {
    load();
  }, [load]);

  // Klienter velger ikke trener i en markedsplass — de har sin egen side.
  useEffect(() => {
    if (!roleLoading && role === "client") {
      router.replace("/trainer");
    }
  }, [roleLoading, role, router]);

  if (roleLoading || !role || trainer === undefined) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster trener …</p>
      </AppPage>
    );
  }

  if (role === "client") return null; // redirecter over
  if (trainer === null) notFound();

  const isAdmin = role === "admin";
  const isTrainerSelf = role === "trainer" && userId === trainerId;

  const canEdit = isAdmin || isTrainerSelf;
  const canSeeClients = isAdmin || isTrainerSelf;

  return (
    <AppPage>
      <TrainerCard trainer={trainer} />
      <TrainerActions trainerId={trainerId} />
      <TrainerDetails trainer={trainer} canEdit={canEdit} onSaved={load} />

      {canSeeClients && <TrainerClients trainerId={trainerId} />}
    </AppPage>
  );
}
