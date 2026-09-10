"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Client } from "@/types/client";
import { fetchMyClients, fetchAllClients } from "@/lib/clients.api";
import { useRole } from "@/providers/RoleProvider";

type ClientsContextType = {
  clients: Client[];
  loading: boolean;
  error: string | null;

  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
};

const ClientsContext = createContext<ClientsContextType | null>(null);

/**
 * Én handling som endrer kunde-/tildelingsdata (godkjenn trener, tildel
 * trener, avslutt tildeling) dispatcher dette eventet slik at en allerede
 * montert liste refetcher — uten en full navigering/reload.
 */
export const CLIENTS_CHANGED_EVENT = "sf:clients-changed";

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const load = useCallback(async () => {
    if (!role || role === "client") {
      // Kunden har ingen kundeliste — ikke kall trener-/admin-oppslag.
      setClients([]);
      setLoading(false);
      return;
    }
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setLoading(true);
      const data = role === "admin" ? await fetchAllClients() : await fetchMyClients();
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Kunne ikke hente kunder");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (role !== "admin" && role !== "trainer") return;

    const onChanged = () => load();
    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };

    window.addEventListener(CLIENTS_CHANGED_EVENT, onChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener(CLIENTS_CHANGED_EVENT, onChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [role, load]);

  function getClientById(id: string) {
    return clients.find((c) => c.id === id);
  }

  return (
    <ClientsContext.Provider
      value={{ clients, loading, error, getClientById, refreshClients: load }}
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

/** Kall etter en handling som endrer kunde-/tildelingsdata. */
export function notifyClientsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLIENTS_CHANGED_EVENT));
  }
}
