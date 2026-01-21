// src/app/(app)/calendar/[id]/page.tsx

import { redirect } from "next/navigation";

/**
 * Midlertidig side for /calendar/[id]
 * Brukes senere for admin / direkte åpning av kalender
 * Foreløpig redirecter vi til hovedkalenderen
 */
export default function CalendarUserPage() {
  redirect("/calendar");
}