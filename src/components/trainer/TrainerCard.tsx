"use client";

import Link from "next/link";
import { Trainer } from "@/types/trainer";

/* ---------------- HELPERS ---------------- */

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age--;

  return age;
}

/* ---------------- COMPONENT ---------------- */

type Props = {
  trainer: Trainer;
  href?: string;
};

export default function TrainerCard({ trainer, href }: Props) {
  const age = calculateAge(trainer.birth_date);

  const initials =
    `${trainer.first_name?.[0] ?? ""}${trainer.last_name?.[0] ?? ""}`.toUpperCase();

  const content = (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">

        {/* 👤 Profilbilde / initialer */}
        <div className="h-14 w-14 rounded-full bg-sf-soft flex items-center justify-center overflow-hidden">
          {trainer.avatar_url ? (
            <img
              src={trainer.avatar_url}
              alt={`${trainer.first_name} ${trainer.last_name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-sf-primary">
              {initials || "—"}
            </span>
          )}
        </div>

        {/* 🧑‍🏫 Info */}
        <div>
          <p className="text-base font-semibold text-sf-text">
            {trainer.first_name} {trainer.last_name}
          </p>
          <p className="text-sm text-sf-muted">
            {age !== null ? `${age} år` : "—"} • {trainer.city ?? "—"}
          </p>
        </div>

      </div>
    </section>
  );

  return href ? (
    <Link href={href} className="block cursor-pointer">
      {content}
    </Link>
  ) : (
    content
  );
}