"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { getActiveTrainerIdForClient } from "@/lib/assignments.api";
import { getTrainerById } from "@/lib/trainers";
import type { Trainer } from "@/types/trainer";

import TrainerCard from "@/components/trainer/TrainerCard";
import TrainerDetails from "@/components/trainer/TrainerDetails";
import TrainerActions from "@/components/trainer/TrainerActions";

export default function MyTrainerPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();

  const [trainer, setTrainer] = useState<Trainer | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;

    if (role !== "client") {
      router.replace(role === "admin" ? "/trainers" : "/profile");
      return;
    }
    if (!userId) return;

    let alive = true;
    (async () => {
      try {
        const trainerId = await getActiveTrainerIdForClient(userId);
        const t = trainerId ? await getTrainerById(trainerId) : null;
        if (alive) setTrainer(t);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Kunne ikke hente din rehabtrener");
      }
    })();

    return () => {
      alive = false;
    };
  }, [roleLoading, role, userId, router]);

  if (roleLoading || role !== "client" || trainer === undefined) {
    return (
      <AppPage>
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  if (error) {
    return (
      <AppPage>
        <p className="text-sm text-danger-ink">{error}</p>
      </AppPage>
    );
  }

  return (
    <AppPage title="Min rehabtrener">
      {trainer ? (
        <div className="space-y-6">
          <TrainerCard trainer={trainer} />
          <TrainerActions trainerId={trainer.id} />
          <TrainerDetails trainer={trainer} canEdit={false} />
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-6 text-sm text-ink-soft shadow-card">
          <p>
            Du er ikke koblet med en rehabtrener akkurat nå. SmerteFri kobler deg
            med en ut fra kartleggingen din som en del av oppstarten — du får
            beskjed når hun eller han er på plass.
          </p>
          <p>
            Har du selv fagbakgrunn og vil bli rehabtrener hos oss?{" "}
            <Link href="/trainer-application" className="font-medium text-primary-ink hover:underline">
              Søk her
            </Link>
            .
          </p>
        </div>
      )}
    </AppPage>
  );
}
