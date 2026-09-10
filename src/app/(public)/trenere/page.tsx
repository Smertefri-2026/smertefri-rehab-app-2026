import { redirect } from "next/navigation";

// Tidligere markedsplass-rekrutteringsside. Beholdt kun som redirect for
// gamle lenker/bokmerker.
export default function TrenereRedirect() {
  redirect("/bli-rehabtrener");
}
