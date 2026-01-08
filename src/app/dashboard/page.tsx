"use client";

import { useRole } from "@/providers/RoleProvider";

import Section1Alerts from "./sections/Section1Alerts";
import Section2Tests from "./sections/Section2Tests";
import Section3Pain from "./sections/Section3Pain";
import Section4Nutrition from "./sections/Section4Nutrition";
import Section5AdminStats from "./sections/Section5AdminStats";
import Section6Analytics from "./sections/Section6Analytics";

export default function DashboardPage() {
  const { role } = useRole();

  return (
    <main className="min-h-screen bg-[#F4FBFA]">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10"> 

        {/* Felles – alle roller */}
        <Section1Alerts />
        <Section2Tests />
        <Section3Pain />
        <Section4Nutrition />

        {/* Kun admin */}
        {role === "admin" && (
          <>
            <Section5AdminStats />
            <Section6Analytics />
          </>
        )}
      </div>
    </main>
  );
}