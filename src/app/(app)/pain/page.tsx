"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";

import Section0PainHeader from "./sections/Section0PainHeader";
import Section1PainSelector from "./sections/Section1PainSelector";
import Section2PainActive from "./sections/Section2PainActive";
import Section3PainHistory from "./sections/Section3PainHistory";

type Area = { key: string; label: string };

export default function PainPage() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Area | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setLoading(false);
        setClientId(null);
        return;
      }
      setClientId(uid);
      setLoading(false);
    })();
  }, []);

  const areas = useMemo<Area[]>(
    () => [
      { key: "neck", label: "Nakke" },
      { key: "shoulders", label: "Skuldre" },
      { key: "elbow", label: "Albue" },
      { key: "wrist", label: "Håndledd" },
      { key: "upper_back", label: "Øvre rygg" },
      { key: "back", label: "Rygg" },
      { key: "lower_back", label: "Nedre rygg" },
      { key: "hips", label: "Hofter" },
      { key: "knee", label: "Kne" },
      { key: "ankle_foot", label: "Ankel / Fot" },
    ],
    []
  );

  if (!loading && !clientId) notFound();

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <Section0PainHeader />

          <Section1PainSelector
            areas={areas}
            selectedKey={selected?.key ?? null}
            onSelect={setSelected}
          />

          <Section2PainActive
            clientId={clientId ?? ""}
            selectedArea={selected}
            onClearSelected={() => setSelected(null)}
          />

          <Section3PainHistory clientId={clientId ?? ""} />
        </div>
      </AppPage>
    </main>
  );
}