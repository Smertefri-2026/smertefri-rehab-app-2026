// src/app/(app)/profile/page.tsx
"use client";

import AppPage from "@/components/layout/AppPage";

import Section1Personal from "./sections/Section1Personal";
import Section2Address from "./sections/Section2Address";
import Section3Role from "./sections/Section3Role";
import Section4Billing from "./sections/Section4Billing";
import Section5Security from "./sections/Section5Security";
import Section6DeleteAccount from "./sections/Section6DeleteAccount";

export default function ProfilePage() {
  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <Section1Personal />
          <Section2Address />
          <Section3Role />
          <Section4Billing />
          <Section5Security />
          <Section6DeleteAccount />
        </div>
      </AppPage>
    </div>
  );
}