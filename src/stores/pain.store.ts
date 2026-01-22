// /Users/oystein/smertefri-rehab-app-2026/src/stores/pain.store.ts
"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { PainEntry, PainPattern, PainQuality } from "@/types/pain";

type UpsertInput = {
  clientId: string;
  area_key: string;
  area_label: string;
  intensity: number;

  entry_date?: string; // YYYY-MM-DD (default i dag)

  note?: string;
  function_note?: string;

  quality?: PainQuality[];
  pattern?: PainPattern[];
  provokes?: string[];
  relieves?: string[];
};

type State = {
  entries: PainEntry[];
  loading: boolean;
  error: string | null;

  fetchForClient: (clientId: string) => Promise<void>;
  upsertDailyEntry: (input: UpsertInput) => Promise<void>;
  setActive: (id: string, is_active: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export const usePain = create<State>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  async fetchForClient(clientId: string) {
    // ✅ tidlig return – hindrer uuid-feil
    if (!clientId || !isUuid(clientId)) {
      set({ loading: false });
      return;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from("pain_entries")
      .select("*")
      .eq("client_id", clientId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({ loading: false, entries: (data ?? []) as PainEntry[] });
  },

  async upsertDailyEntry(input: UpsertInput) {
    set({ error: null });

    // ✅ guard
    if (!input.clientId || !isUuid(input.clientId)) {
      set({ error: "Ugyldig klient-ID." });
      return;
    }

    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (!uid) {
      set({ error: "Ikke innlogget." });
      return;
    }

    const entry_date = input.entry_date ?? todayISO();

    const payload: Record<string, any> = {
      client_id: input.clientId,
      area_key: input.area_key,
      area_label: input.area_label,
      intensity: input.intensity,
      entry_date,
      is_active: true,
      created_by: uid,

      note: input.note?.trim() ? input.note.trim() : null,
      function_note: input.function_note?.trim() ? input.function_note.trim() : null,

      quality: input.quality?.length ? input.quality : null,
      pattern: input.pattern?.length ? input.pattern : null,
      provokes: input.provokes?.length ? input.provokes : null,
      relieves: input.relieves?.length ? input.relieves : null,
    };

    // Krever unique (client_id, area_key, entry_date)
    const { error } = await supabase
      .from("pain_entries")
      .upsert(payload, { onConflict: "client_id,area_key,entry_date" });

    if (error) {
      set({ error: error.message });
      return;
    }

    await get().fetchForClient(input.clientId);
  },

  async setActive(id: string, is_active: boolean) {
    set({ error: null });

    if (!id) return;

    const { error } = await supabase.from("pain_entries").update({ is_active }).eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }

    const entry = get().entries.find((e) => e.id === id);
    if (entry) await get().fetchForClient(entry.client_id);
  },

  async remove(id: string) {
    set({ error: null });

    if (!id) return;

    const entry = get().entries.find((e) => e.id === id);

    const { error } = await supabase.from("pain_entries").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }

    if (entry) await get().fetchForClient(entry.client_id);
    else set({ entries: get().entries.filter((e) => e.id !== id) });
  },
}));