// /src/app/(app)/calendar/hooks/useAdminContext.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Perspective = "trainer" | "client";

type Picked = {
  type: Perspective;
  id: string;
  label?: string;
};

function fullName(p?: { first_name?: string | null; last_name?: string | null; email?: string | null }) {
  const name = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
  return name || p?.email || "—";
}

export function useAdminContext(role: string | null) {
  const [selected, setSelected] = useState<Picked | null>(null);

  // Når admin velger en KUNDE må vi slå opp trainer_id for å få availability + booking riktig
  const [contextTrainerId, setContextTrainerId] = useState<string | null>(null);
  const [contextClientId, setContextClientId] = useState<string | null>(null);

  const [trainerName, setTrainerName] = useState<string | undefined>(undefined);
  const [clientNamesById, setClientNamesById] = useState<Record<string, string>>({});

  const perspective: Perspective = selected?.type ?? "trainer";

  const headerLabel = useMemo(() => {
    if (!selected) return "Admin: Velg en trener eller kunde (søk under).";
    if (selected.type === "trainer") return `Admin viser: Trener-kalender (${selected.label ?? selected.id})`;
    return `Admin viser: Kunde-kalender (${selected.label ?? selected.id})`;
  }, [selected]);

  const clear = () => {
    setSelected(null);
    setContextTrainerId(null);
    setContextClientId(null);
    setTrainerName(undefined);
    setClientNamesById({});
  };

  const pickTrainer = async (trainerId: string) => {
    setSelected({ type: "trainer", id: trainerId });
  };

  const pickClient = async (clientId: string) => {
    setSelected({ type: "client", id: clientId });
  };

  // Når "selected" endrer seg: hent nødvendig kontekst
  useEffect(() => {
    if (role !== "admin") return;
    if (!selected) return;

    let cancelled = false;

    (async () => {
      try {
        // Reset
        setTrainerName(undefined);
        setClientNamesById({});

        if (selected.type === "trainer") {
          // Trainer-kontekst: trenerId = valgt id
          setContextTrainerId(selected.id);
          setContextClientId(null);

          // Hent trenernavn (for header / evt.)
          const { data: t } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", selected.id)
            .single();

          if (!cancelled) {
            setSelected((prev) => (prev ? { ...prev, label: fullName(t ?? {}) } : prev));
          }

          // Hent kundene til trener → navn i kalender når admin ser "trainer-perspektiv"
          const { data: clients } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("role", "client")
            .eq("trainer_id", selected.id);

          const map: Record<string, string> = {};
          for (const c of (clients ?? []) as any[]) {
            const n = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
            map[c.id] = n || "Kunde";
          }
          if (!cancelled) setClientNamesById(map);

          return;
        }

        // Kunde-kontekst: vi må slå opp kundens trainer_id
        setContextClientId(selected.id);

        const { data: c } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, trainer_id")
          .eq("id", selected.id)
          .single();

        if (!cancelled) {
          setSelected((prev) => (prev ? { ...prev, label: fullName(c ?? {}) } : prev));
        }

        const trainerId = (c as any)?.trainer_id ?? null;
        if (!cancelled) setContextTrainerId(trainerId);

        if (trainerId) {
          const { data: t } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", trainerId)
            .single();

          if (!cancelled) setTrainerName(fullName(t ?? {}));
        } else {
          if (!cancelled) setTrainerName(undefined);
        }
      } catch (e) {
        // ikke kræsje UI – bare reset litt
        if (!cancelled) {
          setTrainerName(undefined);
          setClientNamesById({});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, selected]);

  return {
    selected,
    perspective,
    headerLabel,

    contextTrainerId,
    contextClientId,

    trainerName,
    clientNamesById,

    pickTrainer,
    pickClient,
    clear,
  };
}