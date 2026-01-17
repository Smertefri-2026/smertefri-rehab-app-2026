"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Trainer } from "@/types/trainer";
import { getPublicTrainers } from "@/lib/trainers";
import { useRole } from "@/providers/RoleProvider";

type TrainersContextType = {
  trainers: Trainer[];
  loading: boolean;
  error: string | null;

  getTrainerById: (id: string) => Trainer | undefined;
  refreshTrainers: () => Promise<void>;
};

const TrainersContext = createContext<TrainersContextType | null>(null);

export function TrainersProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);

      // 🔐 Foreløpig samme liste for admin/trener/kunde
      // (kan differensieres senere uten å endre UI)
      const data = await getPublicTrainers();
      setTrainers(data);
    } catch (err: any) {
      setError(err?.message ?? "Kunne ikke hente trenere");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role) load();
  }, [role]);

  function getTrainerById(id: string) {
    return trainers.find((t) => t.id === id);
  }

  return (
    <TrainersContext.Provider
      value={{
        trainers,
        loading,
        error,
        getTrainerById,
        refreshTrainers: load,
      }}
    >
      {children}
    </TrainersContext.Provider>
  );
}

export function useTrainers() {
  const ctx = useContext(TrainersContext);
  if (!ctx) {
    throw new Error("useTrainers må brukes innenfor TrainersProvider");
  }
  return ctx;
}