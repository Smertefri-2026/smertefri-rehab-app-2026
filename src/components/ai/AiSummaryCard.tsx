"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/ui/components/Button";
import {
  generateClientSummary,
  type AiSummaryResult,
  type CustomerSummary,
  type TrainerSummary,
} from "@/lib/aiSummary.api";

type Props = {
  clientId: string;
  audience: "customer" | "trainer";
};

/**
 * KI-oppsummering — beslutningsstøtte, ikke en diagnose og ikke en
 * autonom handling. Genereres på forespørsel (ingen automatikk), og
 * anvender aldri noe selv: treneren/kunden leser og vurderer selv.
 */
export default function AiSummaryCard({ clientId, audience }: Props) {
  const [result, setResult] = useState<AiSummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await generateClientSummary(clientId, audience);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke generere oppsummering");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles size={15} className="text-primary-ink" />
          KI-oppsummering
        </h2>
        <Button size="sm" variant={result ? "secondary" : "primary"} onClick={generate} disabled={loading}>
          {loading ? (
            "Genererer …"
          ) : result ? (
            <>
              <RefreshCw size={13} /> Ny oppsummering
            </>
          ) : (
            "Generer oppsummering"
          )}
        </Button>
      </div>

      {!result && !loading && !error && (
        <p className="text-sm text-ink-soft">
          {audience === "customer"
            ? "Få en kort oppsummering av målet ditt, fremgangen og neste steg — basert på det du selv har logget."
            : "Generer en fersk oppsummering før oppfølging: hva har endret seg, mønstre, gjennomføring og Sonen/Trappen."}
        </p>
      )}

      {error && <p className="text-sm text-danger-ink">{error}</p>}

      {result && audience === "customer" && (
        <CustomerView summary={result.summary as CustomerSummary} generatedAt={result.generatedAt} />
      )}

      {result && audience === "trainer" && (
        <TrainerView summary={result.summary as TrainerSummary} generatedAt={result.generatedAt} />
      )}

      <p className="text-xs text-ink-faint">
        Basert på data allerede logget i SmerteFri. Ingen diagnose, og ingen endringer skjer
        automatisk — {audience === "customer" ? "avtal endringer med rehabtreneren din." : "du vurderer og bestemmer selv."}
      </p>
    </section>
  );
}

function GeneratedAt({ iso }: { iso: string }) {
  return (
    <p className="text-xs text-ink-faint">
      Generert {new Date(iso).toLocaleString("no-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
    </p>
  );
}

function CustomerView({ summary, generatedAt }: { summary: CustomerSummary; generatedAt: string }) {
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-ink">{summary.headline}</p>
      <p className="text-sm text-ink-soft whitespace-pre-wrap">{summary.summary}</p>
      <div className="rounded-md bg-primary-subtle p-3">
        <p className="text-[13px] font-semibold text-primary-ink">Neste steg</p>
        <p className="mt-1 text-sm text-ink">{summary.next_step}</p>
      </div>
      <GeneratedAt iso={generatedAt} />
    </div>
  );
}

function TrainerView({ summary, generatedAt }: { summary: TrainerSummary; generatedAt: string }) {
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-ink">{summary.headline}</p>

      <Row label="Hva har endret seg" text={summary.whats_changed} />
      <Row label="Mønstre" text={summary.patterns} />
      <Row label="Gjennomføring" text={summary.adherence_note} />
      <Row label="Sonen / Trappen" text={summary.zone_trapp_note} />

      {summary.considerations.length > 0 && (
        <div className="rounded-md bg-warning-subtle p-3">
          <p className="text-[13px] font-semibold text-warning-ink">Vurder før timen</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink">
            {summary.considerations.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      <GeneratedAt iso={generatedAt} />
    </div>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink-soft">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{text}</p>
    </div>
  );
}
