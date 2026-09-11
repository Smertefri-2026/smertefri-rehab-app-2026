// Klientwrapper for /api/ai/client-summary. Selve KI-logikken (prompt,
// datainnsamling, autorisasjon) ligger server-side — se route.ts. Denne
// filen sender bare forespørselen med brukerens egen sesjon.
import { supabase } from "@/lib/supabaseClient";

export type CustomerSummary = {
  headline: string;
  summary: string;
  next_step: string;
};

export type TrainerSummary = {
  headline: string;
  whats_changed: string;
  patterns: string;
  adherence_note: string;
  zone_trapp_note: string;
  considerations: string[];
};

export type AiSummaryResult =
  | { audience: "customer"; summary: CustomerSummary; generatedAt: string }
  | { audience: "trainer"; summary: TrainerSummary; generatedAt: string };

export async function generateClientSummary(
  clientId: string,
  audience: "customer" | "trainer"
): Promise<AiSummaryResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Ikke innlogget");

  const res = await fetch("/api/ai/client-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ clientId, audience }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "Kunne ikke generere oppsummering");
  return json as AiSummaryResult;
}
