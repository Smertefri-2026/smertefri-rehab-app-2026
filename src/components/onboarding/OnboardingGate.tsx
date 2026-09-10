"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { hasCompletedOnboarding } from "@/lib/onboarding.api";

/**
 * Sender en kunde uten fullført kartlegging til /onboarding. Trenere og
 * admin berøres ikke. Sjekkes én gang per økt.
 */
export default function OnboardingGate() {
  const { role, userId, loading } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (loading || !userId || role !== "client") return;
    if (checkedRef.current) return;
    if (pathname.startsWith("/onboarding")) return;

    checkedRef.current = true;
    hasCompletedOnboarding(userId)
      .then((done) => {
        if (!done) router.replace("/onboarding");
      })
      .catch(() => {
        /* nettverksfeil — ikke blokker appen */
      });
  }, [loading, userId, role, pathname, router]);

  return null;
}
