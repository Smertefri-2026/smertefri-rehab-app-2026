import Seksjon1Hero from "@/app/(public)/frontpage/Seksjon/Seksjon1Hero";
import Seksjon2Kjenner from "@/app/(public)/frontpage/Seksjon/Seksjon2Kjenner";
import Seksjon3losning from "@/app/(public)/frontpage/Seksjon/Seksjon3løsning";
import Seksjon3Smerte from "@/app/(public)/frontpage/Seksjon/Seksjon3Smerte";
import Seksjon4Dashbord from "@/app/(public)/frontpage/Seksjon/Seksjon4Dashbord";
import Seksjon5Kosthold from "@/app/(public)/frontpage/Seksjon/Seksjon5Kosthold";
import Seksjon6Tester from "@/app/(public)/frontpage/Seksjon/Seksjon6Tester";
import Seksjon7Kalender from "@/app/(public)/frontpage/Seksjon/Seksjon7Kalender";
import Seksjon8Medlemskap from "@/app/(public)/frontpage/Seksjon/Seksjon8Medlemskap";
import Seksjon9Komigang from "@/app/(public)/frontpage/Seksjon/Seksjon9Komigang";
import Seksjon10FPriser from "@/app/(public)/frontpage/Seksjon/Seksjon10FPriser";
import Seksjon11Kontakt from "@/app/(public)/frontpage/Seksjon/Seksjon11Kontakt";

export default function HomePage() {
  return (
    <main id="top" className="w-full">
      <Seksjon1Hero />
      <Seksjon2Kjenner />
      <div id="slik-fungerer-det">
        <Seksjon3losning />
        <Seksjon3Smerte />
        <Seksjon4Dashbord />
        <Seksjon5Kosthold />
        <Seksjon6Tester />
        <Seksjon7Kalender />
      </div>
      <Seksjon8Medlemskap />
      <Seksjon9Komigang />
      <div id="priser">
        <Seksjon10FPriser />
      </div>
      <div id="kontakt">
        <Seksjon11Kontakt />
      </div>
    </main>
  );
}
