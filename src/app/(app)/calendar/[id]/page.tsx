"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Midlertidig side for /calendar/[id]
 * Brukes senere for admin / direkte åpning av kalender
 * Foreløpig redirecter vi trygt til hovedkalenderen
 */
export default function CalendarUserPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/calendar");
  }, [router]);

  return null;
}