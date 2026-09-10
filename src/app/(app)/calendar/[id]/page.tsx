import { redirect } from "next/navigation";

/** Dyplenker til en enkeltbooking sendes til hovedkalenderen. */
export default function CalendarUserPage() {
  redirect("/calendar");
}