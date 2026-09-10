"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import { getActiveTrainerIdForClient } from "@/lib/assignments.api";
import { getTrainerById } from "@/lib/trainers";
import type { Trainer } from "@/types/trainer";

export default function SectionMyTrainer() {
  const { role, userId } = useRole();
  const [trainer, setTrainer] = useState<Trainer | null | undefined>(undefined);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;
    (async () => {
      try {
        const id = await getActiveTrainerIdForClient(userId);
        const t = id ? await getTrainerById(id) : null;
        if (alive) setTrainer(t);
      } catch {
        if (alive) setTrainer(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || trainer === undefined) return null;

  const name = trainer ? `${trainer.first_name ?? ""} ${trainer.last_name ?? ""}`.trim() : "";
  const initials = trainer
    ? `${trainer.first_name?.[0] ?? ""}${trainer.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <Link
      href="/trainer"
      className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-alt text-sm font-semibold text-ink-soft">
        {trainer?.avatar_url ? (
          <img src={trainer.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initials || "?"
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-soft">Din rehabtrener</p>
        <p className="truncate text-sm text-ink">
          {trainer ? name || "Rehabtrener" : "Ikke tildelt ennå"}
        </p>
      </div>
    </Link>
  );
}
