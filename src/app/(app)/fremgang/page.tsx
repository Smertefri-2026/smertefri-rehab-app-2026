"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AppPage from "@/components/layout/AppPage";
import { useRole } from "@/providers/RoleProvider";
import ProgressOverview from "@/components/progress/ProgressOverview";

export default function FremgangPage() {
  const router = useRouter();
  const { role, userId, loading } = useRole();

  useEffect(() => {
    if (!loading && role && role !== "client") router.replace("/dashboard");
  }, [loading, role, router]);

  if (loading || role !== "client" || !userId) {
    return (
      <AppPage title="Fremgang">
        <p className="text-sm text-ink-soft">Laster …</p>
      </AppPage>
    );
  }

  return (
    <AppPage title="Fremgang" subtitle="Hvordan det har gått over tid — smerte, soner, gjennomføring og milepæler.">
      <ProgressOverview clientId={userId} />
    </AppPage>
  );
}
