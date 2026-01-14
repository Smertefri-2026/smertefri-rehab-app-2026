"use client";

import Link from "next/link";
import { selectTrainer } from "@/lib/profile";

export default function Section2TrainerCard({
  trainer,
}: {
  trainer: {
    id: string;
    first_name: string;
    last_name: string;
    city?: string;
    avatar_url?: string | null;
    trainer_bio?: string | null;
    trainer_specialties?: string[];
  };
}) {
  async function handleSelectTrainer() {
    try {
      await selectTrainer(trainer.id);
      window.location.href = "/profile";
    } catch (e: any) {
      console.error("Kunne ikke velge trener", e);
      alert(e?.message ?? "Kunne ikke velge trener");
    }
  }

  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-sf-soft flex items-center justify-center overflow-hidden">
            {trainer.avatar_url ? (
              <img
                src={trainer.avatar_url}
                alt={trainer.first_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {trainer.first_name[0]}
                {trainer.last_name[0]}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-base font-semibold">
              {trainer.first_name} {trainer.last_name}
            </p>
            <p className="text-sm text-sf-muted">
              {trainer.city ?? ""}
            </p>
          </div>
        </div>

        {trainer.trainer_bio && (
          <p className="text-sm text-sf-text line-clamp-4">
            {trainer.trainer_bio}
          </p>
        )}

        {trainer.trainer_specialties?.length ? (
          <div className="flex flex-wrap gap-2">
            {trainer.trainer_specialties.map((s) => (
              <span
                key={s}
                className="rounded-full bg-sf-soft px-3 py-1 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2 pt-2">
          <Link
            href={`/trainers/${trainer.id}`}
            className="rounded-lg border px-4 py-2 text-xs"
          >
            Se profil
          </Link>

          <button
            onClick={handleSelectTrainer}
            className="rounded-lg bg-sf-primary px-4 py-2 text-xs text-white"
          >
            Velg trener
          </button>
        </div>
      </div>
    </section>
  );
}