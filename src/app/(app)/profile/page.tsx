"use client";

import Section1Personal from "./sections/Section1Personal";
import Section2Address from "./sections/Section2Address";
import Section3Role from "./sections/Section3Role";
import Section4Billing from "./sections/Section4Billing";
import Section5Security from "./sections/Section5Security";
import Section6DeleteAccount from "./sections/Section6DeleteAccount";

export default function ProfilePage() {
  return (
    <main className="bg-[#F4FBFA]">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <Section1Personal />
        <Section2Address />
        <Section3Role />
        <Section4Billing />
        <Section5Security />
        <Section6DeleteAccount />
      </div>
    </main>
  );
}