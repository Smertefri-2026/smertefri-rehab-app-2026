"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { hasCompletedOnboarding } from "@/lib/onboarding.api";

/**
 * Sender en kunde uten fullført kartlegging til /onboarding. Trenere og
 * admin berøres ikke. Sjekkes én gang per økt.
 *
 * Unntak: noen som registrerte seg for å SØKE som rehabtrener har rollen
 * 'client' inntil søknaden er godkjent (signup_intent = 'trainer', se
 * migrasjon 0021) — de skal til /trainer-application, aldri til kundens
 * kartlegging.
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

    hasCompletedOnboarding(userId)
      .then((done) => {
        if (!done) router.replace("/onboarding");
      })
      .catch(() => {
        /* nettverksfeil — ikke blokker appen */
      });
  }, [loading, userId, role, signupIntent, pathname, router]);

  return null;
}
