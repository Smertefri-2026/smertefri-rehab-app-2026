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
        <p className="text-sm text-sf-muted">Laster …</p>
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
          <h1 className="text-lg font-semibold">Min rehabtrener</h1>
          {!trainer && (
            <p className="text-sm text-sf-muted">
              Du har ikke fått tildelt en rehabtrener ennå.
            </p>
          )}
        </div>

        {trainer ? (
          <>
            <TrainerCard trainer={trainer} />
            <TrainerActions trainerId={trainer.id} />
            <TrainerDetails trainer={trainer} canEdit={false} />
          </>
        ) : (
          <div className="rounded-2xl border border-sf-border bg-white p-6 text-sm text-sf-muted space-y-3">
            <p>
              SmerteFri tildeler deg en rehabtrener basert på kartleggingen din. Du
              får beskjed så snart dette er klart.
            </p>
            <p>
              Har du fagbakgrunn og ønsker selv å bli rehabtrener hos oss?{" "}
              <Link href="/trainer-application" className="text-sf-primary underline">
                Søk her
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </AppPage>
  );
}
