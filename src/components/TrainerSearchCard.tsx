"use client";

import Link from "next/link";

export default function TrainerSearchCard({ trainer }: { trainer: any }) {
  const initials =
    (trainer.first_name?.[0] ?? "") + (trainer.last_name?.[0] ?? "");

  return (
    <Link
      href={`/trainers/${trainer.id}`}
      className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm hover:shadow-md transition block"
    >
      <div className="flex gap-4">

        {/* Avatar */}
        <div className="h-14 w-14 rounded-full bg-sf-soft overflow-hidden flex items-center justify-center font-semibold">
          {trainer.avatar_url ? (
            <img
              src={trainer.avatar_url}
              alt="Profilbilde"
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">
            {trainer.first_name} {trainer.last_name}
          </p>

          <p className="text-xs text-sf-muted">
            Rehab-trener {trainer.city ? `· ${trainer.city}` : ""}
          </p>

          {trainer.trainer_specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {trainer.trainer_specialties.map((s: string) => (
                <span
                  key={s}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}