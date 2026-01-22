// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import AppPage from "@/components/layout/AppPage";
import { supabase } from "@/lib/supabaseClient";

import { PAIN_AREAS, type PainArea } from "./painAreas";

import Section0PainHeader from "./sections/Section0PainHeader";
import Section1PainSelector from "./sections/Section1PainSelector";
import Section2PainActive from "./sections/Section2PainActive";
import Section3PainHistory from "./sections/Section3PainHistory";

export default function PainPage() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<PainArea | null>(null);

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

  if (!loading && !clientId) notFound();

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <Section0PainHeader />

          <Section1PainSelector
            areas={PAIN_AREAS}
            selectedKey={selected?.key ?? null}
            onSelect={setSelected}
          />

          <Section2PainActive
            clientId={clientId ?? ""}
            selectedArea={selected}
            onClearSelected={() => setSelected(null)}
            onPickArea={setSelected}
          />

          <Section3PainHistory
            clientId={clientId ?? ""}
            areaKey={selected?.key ?? null}
          />
        </div>
      </AppPage>
    </main>
  );
}