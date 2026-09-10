import { redirect } from "next/navigation";

/** Programmet bor nå inne i «Min plan». Behold ruten for gamle lenker/bokmerker. */
export default function ProgramRedirect() {
  redirect("/min-plan#program");
}
