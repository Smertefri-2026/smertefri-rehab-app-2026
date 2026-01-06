// src/app/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HeaderFrontpage from "@/app/(marketing)/frontpage/Seksjon/HeaderFrontpage";
import SeksjonFooter from "@/app/(marketing)/frontpage/Seksjon/SeksjonFooter";

import Seksjon1Hero from "@/app/(marketing)/frontpage/Seksjon/Seksjon1Hero";
import Seksjon2Kjenner from "@/app/(marketing)/frontpage/Seksjon/Seksjon2Kjenner";
import Seksjon3løsning from "@/app/(marketing)/frontpage/Seksjon/Seksjon3løsning";
import Seksjon4Dashbord from "@/app/(marketing)/frontpage/Seksjon/Seksjon4Dashbord";
import Seksjon5Kosthold from "@/app/(marketing)/frontpage/Seksjon/Seksjon5Kosthold";
import Seksjon6Tester from "@/app/(marketing)/frontpage/Seksjon/Seksjon6Tester";
import Seksjon7Kalender from "@/app/(marketing)/frontpage/Seksjon/Seksjon7Kalender";
import Seksjon8Medlemskap from "@/app/(marketing)/frontpage/Seksjon/Seksjon8Medlemskap";
import Seksjon9Komigang from "@/app/(marketing)/frontpage/Seksjon/Seksjon9Komigang";
import Seksjon10FPriser from "@/app/(marketing)/frontpage/Seksjon/Seksjon10FPriser";
export default function HomePage() {
  return (
    <>
      <HeaderFrontpage />
      <main id="top" className="w-full">
        <Seksjon1Hero />
        <Seksjon2Kjenner />
        <Seksjon3løsning />
        <Seksjon4Dashbord />
        <Seksjon5Kosthold />
        <Seksjon6Tester />
        <Seksjon7Kalender />
        <Seksjon8Medlemskap />
        <Seksjon9Komigang />
        <Seksjon10FPriser />
      </main>
      <SeksjonFooter />
    </>
  );
}