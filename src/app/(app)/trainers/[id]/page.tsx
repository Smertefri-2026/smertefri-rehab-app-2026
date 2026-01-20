// /src/app/(app)/trainers/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { useRole } from "@/providers/RoleProvider";
import { useTrainers } from "@/stores/trainers.store";

import TrainerCard from "@/components/trainer/TrainerCard";
import TrainerDetails from "@/components/trainer/TrainerDetails";
import TrainerClients from "@/components/trainer/TrainerClients";

// ✅ NY: actions-seksjonen som har riktige linker (chat + calendar med trainerId)
import Section3TrainerActions from "../sections/Section3TrainerActions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function TrainerDetailPage({ params }: PageProps) {
  const { role } = useRole();
  const { getTrainerById, loading } = useTrainers();

  // ✅ Next 15+
  const { id: trainerId } = use(params);

  // 🔐 Kun admin har tilgang
  if (role !== "admin") {
    notFound();
  }

  if (loading) {
    return (
      <main className="bg-[#F4FBFA]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-sm text-sf-muted">Laster trener …</p>
        </div>
      </main>
    );
  }

  const trainer = getTrainerById(trainerId);

  // 🚫 Feil ID / ingen tilgang
  if (!trainer) {
    notFound();
  }

  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* 1️⃣ Toppkort */}
        <TrainerCard trainer={trainer} />

        {/* 2️⃣ Handlinger */}
        <Section3TrainerActions trainerId={trainerId} />

        {/* 4️⃣ Detaljer */}
        <TrainerDetails trainer={trainer} canEdit />

        {/* 5️⃣ Kunder knyttet til trener */}
        <TrainerClients trainerId={trainerId} />
      </div>
    </main>
  );
}