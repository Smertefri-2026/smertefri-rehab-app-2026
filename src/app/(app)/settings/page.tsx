// src/app/(app)/settings/page.tsx
"use client";

import AppPage from "@/components/layout/AppPage";

import Section1SettingsHeader from "./sections/Section1SettingsHeader";
import Section2SystemStatus from "./sections/Section2SystemStatus";
import Section3UserManagement from "./sections/Section3UserManagement";
import Section4SecurityAndAccess from "./sections/Section4SecurityAndAccess";
import Section5Integrations from "./sections/Section5Integrations";
import Section6BillingAndPlans from "./sections/Section6BillingAndPlans";
import Section7DangerZone from "./sections/Section7DangerZone";

export default function SettingsPage() {
  return (
    <div className="bg-page min-h-screen">
      <AppPage>
        <div className="space-y-8">
          {/* ⚙️ Header */}
          <Section1SettingsHeader />

          {/* 🖥 Systemstatus */}
          <Section2SystemStatus />

          {/* 👥 Brukeradministrasjon */}
          <Section3UserManagement />

          {/* 🔐 Sikkerhet & tilgang */}
          <Section4SecurityAndAccess />

          {/* 🔌 Integrasjoner */}
          <Section5Integrations />

          {/* 💳 Abonnement & betaling */}
          <Section6BillingAndPlans />

          {/* ⚠️ Danger zone */}
          <Section7DangerZone />
        </div>
      </AppPage>
    </div>
  );
}