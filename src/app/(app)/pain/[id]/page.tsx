// /Users/oystein/smertefri-rehab-app-2026/src/app/(app)/pain/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import { useClients } from "@/stores/clients.store";

import Section0PainHeader from "../sections/Section0PainHeader";
import Section1PainSelector from "../sections/Section1PainSelector";
import Section2PainActive from "../sections/Section2PainActive";
import Section3PainHistory from "../sections/Section3PainHistory";

type Area = { key: string; label: string };

export default function PainClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { role } = useRole();
  const { getClientById, loading } = useClients();
  const { id: clientId } = use(params);

  const [selected, setSelected] = useState<Area | null>(null);

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

  // 🔐 Kun admin/trener
  if (role !== "trainer" && role !== "admin") notFound();

  if (loading) {
    return (
      <main className="bg-[#F4FBFA]">
        <AppPage>
          <p className="p-4 text-sm text-sf-muted">Laster smerter …</p>
        </AppPage>
      </main>
    );
  }

  const client = getClientById(clientId);
  if (!client) notFound();

  return (
    <main className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <Section0PainHeader
            subtitle={`Smerter – ${client.first_name} ${client.last_name}`}
          />

          <Section1PainSelector
            areas={areas}
            selectedKey={selected?.key ?? null}
            onSelect={setSelected}
          />

          <Section2PainActive
            clientId={clientId}
            selectedArea={selected}
            onClearSelected={() => setSelected(null)}
            onPickArea={setSelected} // ✅ NY
          />

          <Section3PainHistory
            clientId={clientId}
            areaKey={selected?.key ?? null}
          />
        </div>
      </AppPage>
    </main>
  );
}