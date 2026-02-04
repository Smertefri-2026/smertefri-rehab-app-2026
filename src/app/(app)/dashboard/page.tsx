// src/app/(app)/dashboard/page.tsx
"use client";

import { useRole } from "@/providers/RoleProvider";
import AppPage from "@/components/layout/AppPage";

// DASHBOARD-SEKSJONER
import Section1Header from "./sections/Section1Header";
import Section2StatusAndNextSteps from "./sections/Section2StatusAndNextSteps";
import Section3QuickActions from "./sections/Section3QuickActions";
import Section4Pain from "./sections/Section4Pain";
import Section5Tests from "./sections/Section5Tests";
import Section6Nutrition from "./sections/Section6Nutrition";

import Section7AdminStats from "./sections/Section7AdminStats";
import Section7AppAnalytics from "./sections/Section7AppAnalytics";
import Section8Analytics from "./sections/Section8Analytics";

export default function DashboardPage() {
  const { role } = useRole();

  return (
    <AppPage spacing="roomy">
      <Section1Header />
      <Section2StatusAndNextSteps />
      <Section3QuickActions />
      <Section4Pain />
      <Section5Tests />
      <Section6Nutrition />

      {role === "admin" && (
        <>
          <Section7AdminStats />
          <Section7AppAnalytics />
          <Section8Analytics />
        </>
      )}
    </AppPage>
  );
}