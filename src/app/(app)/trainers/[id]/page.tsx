"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useTrainers } from "@/stores/trainers.store";

import TrainerCard from "@/components/trainer/TrainerCard";
import TrainerDetails from "@/components/trainer/TrainerDetails";
import TrainerClients from "@/components/trainer/TrainerClients";

import TrainerActions from "@/components/trainer/TrainerActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TrainerDetailPage({ params }: PageProps) {
  const { role } = useRole();
  const { getTrainerById, loading } = useTrainers();

  const { id: trainerId } = use(params);

  if (role !== "admin") notFound();

  if (loading) {
    return (
      <AppPage>
        <p className="text-sm text-sf-muted">Laster trener …</p>
      </AppPage>
    );
  }

  const trainer = getTrainerById(trainerId);
  if (!trainer) notFound();

  return (
    <AppPage>
      <TrainerCard trainer={trainer} />

<TrainerActions trainerId={trainerId} />

      <TrainerDetails trainer={trainer} canEdit />

      <TrainerClients trainerId={trainerId} />
    </AppPage>
  );
}