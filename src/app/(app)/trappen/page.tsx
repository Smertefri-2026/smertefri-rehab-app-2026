import { redirect } from "next/navigation";

/** Trappen bor nå inne i «Min plan». Behold ruten for gamle lenker/bokmerker. */
export default function TrappenRedirect() {
  redirect("/min-plan#trappen");
}
