// src/app/(app)/dashboard/page.tsx
"use client";

import { useRole } from "@/providers/RoleProvider";
import AppPage from "@/components/layout/AppPage";

// DASHBOARD-SEKSJONER (NY, REN STRUKTUR)
import Section1Header from "./sections/Section1Header";
import Section2StatusAndNextSteps from "./sections/Section2StatusAndNextSteps";
import Section3QuickActions from "./sections/Section3QuickActions";
import Section4Tests from "./sections/Section4Tests";
import Section5Pain from "./sections/Section5Pain";
import Section6Nutrition from "./sections/Section6Nutrition";
import Section7AdminStats from "./sections/Section7AdminStats";
import Section8Analytics from "./sections/Section8Analytics";

export default function DashboardPage() {
  const { role } = useRole();

  return (
    <AppPage spacing="roomy">
      {/* 👋 HEADER + MEDLEMSKAP */}
      <Section1Header />

      {/* 🔔 STATUS + NESTE STEG */}
      <Section2StatusAndNextSteps />

      {/* ⚡ HURTIGHANDLINGER */}
      <Section3QuickActions />

      {/* 📊 TESTER */}
      <Section4Tests />

      {/* ❤️ SMERTE */}
      <Section5Pain />

      {/* 🍽 KOSTHOLD */}
      <Section6Nutrition />

      {/* 🛠 ADMIN */}
      {role === "admin" && (
        <>
          <Section7AdminStats />
          <Section8Analytics />
        </>
      )}
    </AppPage>
  );
}