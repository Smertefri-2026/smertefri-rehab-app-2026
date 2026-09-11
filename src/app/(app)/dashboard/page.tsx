// src/app/(app)/dashboard/page.tsx
"use client";

import { useRole } from "@/providers/RoleProvider";
import AppPage from "@/components/layout/AppPage";

// DASHBOARD-SEKSJONER
import Section1Header from "./sections/Section1Header";
import SectionZoneToday from "./sections/SectionZoneToday";
import SectionTrapp from "./sections/SectionTrapp";
import SectionProgram from "./sections/SectionProgram";
import SectionProgress from "./sections/SectionProgress";
import SectionMyTrainer from "./sections/SectionMyTrainer";
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

  if (role === "client") {
    // Kundens samleside: det hun faktisk trenger i dag, i prioritert
    // rekkefølge — ikke en vegg av kort. Trappen (fulle 5 trinn), full
    // fremgang, og smerte-/test-/kostholdskortene er ikke fjernet, bare
    // ikke duplisert her — de har egne sider (Min plan, Fremgang) og nås
    // via Snarveier under.
    return (
      <AppPage spacing="roomy">
        <Section1Header />
        <SectionZoneToday />
        <SectionProgram />
        <SectionMyTrainer />
        <SectionProgress />
        <Section2StatusAndNextSteps />
        <Section3QuickActions />
      </AppPage>
    );
  }

  return (
    <AppPage spacing="roomy">
      <Section1Header />
      <SectionZoneToday />
      <SectionTrapp />
      <SectionProgram />
      <SectionProgress />
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