"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Client } from "@/types/client";
import { fetchMyClients } from "@/lib/clients.api";

type ClientsContextType = {
  clients: Client[];
  loading: boolean;
  error: string | null;

  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
};

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchMyClients();
      setClients(data);
    } catch (err: any) {
      setError(err?.message ?? "Kunne ikke hente kunder");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getClientById(id: string) {
    return clients.find((c) => c.id === id);
  }

  return (
    <ClientsContext.Provider
      value={{
        clients,
        loading,
        error,
        getClientById,
        refreshClients: load,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) {
    throw new Error("useClients må brukes innenfor ClientsProvider");
  }
  return ctx;
}