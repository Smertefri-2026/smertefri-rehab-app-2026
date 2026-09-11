"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { hasCompletedOnboarding } from "@/lib/onboarding.api";
import { getMyTrainerApplication } from "@/lib/trainerApplications.api";

/**
 * Sender en kunde uten fullført kartlegging til /onboarding. Trenere og
 * admin berøres ikke. Sjekkes én gang per økt.
 *
 * Unntak, to uavhengige veier inn i "vil bli trener"-tilstanden — begge må
 * sjekkes, ikke bare den første:
 *  1) registrerte seg direkte som rehabtrener (signup_intent = 'trainer',
 *     migrasjon 0021) — rask sjekk, ingen database-kall.
 *  2) var allerede kunde og søkte som trener i etterkant via lenken i
 *     Profil/"Min rehabtrener" (trainer-application/page.tsx krever ikke
 *     signup_intent). Uten denne sjekken ville en slik søker blitt sendt
 *     til kundens kartlegging hver gang de navigerer, siden signup_intent
 *     fortsatt sier 'client' — nøyaktig feilen som ble rapportert.
 * Uansett status (til vurdering/godkjent/avslått) skal de til
 * /trainer-application, aldri inn i kundens kartlegging.
 */
export default function OnboardingGate() {
  const { role, userId, signupIntent, loading } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (loading || !userId || role !== "client") return;
    if (checkedRef.current) return;
    if (pathname.startsWith("/onboarding") || pathname.startsWith("/trainer-application")) return;

    checkedRef.current = true;

    if (signupIntent === "trainer") {
      router.replace("/trainer-application");
      return;
    }

    getMyTrainerApplication()
      .then((application) => {
        if (application) {
          router.replace("/trainer-application");
          return;
        }
        return hasCompletedOnboarding(userId).then((done) => {
          if (!done) router.replace("/onboarding");
        });
      })
      .catch(() => {
        /* nettverksfeil — ikke blokker appen */
      });
  }, [loading, userId, role, signupIntent, pathname, router]);

  return null;
}
