"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import TrappLadder from "@/components/trapp/TrappLadder";
import { TRAPP_STAGES } from "@/lib/trapp/stages";
import { getTrappState, type TrappStateRow } from "@/lib/trapp.api";

export default function SectionTrapp() {
  const { role, userId } = useRole();
  const [state, setState] = useState<TrappStateRow | null | undefined>(undefined);

  useEffect(() => {
    if (role !== "client" || !userId) return;
    let alive = true;
    getTrappState(userId)
      .then((s) => alive && setState(s))
      .catch(() => alive && setState(null));
    return () => {
      alive = false;
    };
  }, [role, userId]);

  if (role !== "client" || state === undefined || !state) return null;

  const info = TRAPP_STAGES[state.current_stage];

  return (
    <Link
      href="/trappen"
      className="block rounded-lg border border-border bg-surface p-5 shadow-card transition hover:shadow-pop"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-soft">Din Trapp</h2>
        <span className="text-xs text-ink-faint">
          Trinn {info.index + 1} av 5 · {info.label}
        </span>
      </div>
      <div className="mt-3">
        <TrappLadder current={state.current_stage} />
      </div>
      <p className="mt-3 text-sm text-ink-soft">{info.goal}</p>
    </Link>
  );
}
