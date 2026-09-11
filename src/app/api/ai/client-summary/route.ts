import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60 * 60 * 1000; // per time, per bruker

const CUSTOMER_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["headline", "summary", "next_step"],
};

const TRAINER_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    whats_changed: { type: "string" },
    patterns: { type: "string" },
    adherence_note: { type: "string" },
    zone_trapp_note: { type: "string" },
    considerations: { type: "array", items: { type: "string" } },
  },
  required: [
    "headline",
    "whats_changed",
    "patterns",
    "adherence_note",
    "zone_trapp_note",
    "considerations",
  ],
};

const SYSTEM_PROMPT = `Du er en beslutningsstøtte-assistent for et rehabiliteringsprogram (SmerteFri).
Du oppsummerer data som allerede finnes i systemet — du oppdager ingenting nytt og bestemmer ingenting.

ABSOLUTTE REGLER:
- Du stiller ALDRI en diagnose og trekker ALDRI medisinske konklusjoner.
- Du foreslår ALDRI konkrete endringer i program, belastning eller behandling — det er alltid rehabtrenerens avgjørelse.
- Du bruker aldri medisinsk fagspråk som antyder en tilstand (f.eks. "dette tyder på diskusprolaps"). Beskriv kun det dataene faktisk viser (trender, tall, mønstre).
- Hvis dataene er tynne eller usikre, si det rett ut i stedet for å gjette.
- Skriv varmt, konkret og på norsk (bokmål).
- Du skal aldri finne på tall eller hendelser som ikke er i dataene du får oppgitt.`;

type Audience = "customer" | "trainer";

function buildUserPrompt(audience: Audience, data: Record<string, unknown>) {
  const scope =
    audience === "customer"
      ? `Skriv en KORT, lett forståelig oppsummering til KUNDEN selv. Fokuser på mål, fremgang og ett konkret neste steg. Ingen diagnostisering, ingen fagsjargong.`
      : `Skriv en mer detaljert oppsummering til REHABTRENEREN, til bruk før en oppfølgingstime. Fokuser på hva som har endret seg siden sist, relevante mønstre, gjennomføringsgrad (adherence), Sonen/Trappen-signaler, og punkter treneren bør vurdere (ikke instruksjoner — vurderinger/spørsmål treneren selv tar stilling til).`;

  return `${scope}\n\nData (JSON, hentet direkte fra systemet):\n${JSON.stringify(data)}`;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!checkRateLimit(`ai-client-summary:${auth.user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "For mange forespørsler. Prøv igjen om litt." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const clientId = String(body?.clientId ?? "");
    const audience: Audience = body?.audience === "trainer" ? "trainer" : "customer";

    if (!clientId) {
      return NextResponse.json({ error: "Mangler clientId" }, { status: 400 });
    }

    // Autorisasjon: kunde ser kun sin egen; trener/admin ser tildelte kunder.
    if (audience === "customer") {
      if (clientId !== auth.user.id && auth.user.role !== "admin") {
        return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
      }
    } else {
      if (auth.user.role !== "trainer" && auth.user.role !== "admin") {
        return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
      }
    }

    // Kjør alle spørringer som DENNE brukeren (ikke service-role) — RLS
    // håndhever i praksis autorisasjonen på nytt, som et ekstra lag.
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    if (audience === "trainer" && auth.user.role === "trainer") {
      const { data: assignment } = await supabase
        .from("client_trainer_assignments")
        .select("id")
        .eq("client_id", clientId)
        .eq("trainer_id", auth.user.id)
        .eq("status", "active")
        .maybeSingle();
      if (!assignment) {
        return NextResponse.json({ error: "Ikke tildelt denne kunden" }, { status: 403 });
      }
    }

    const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);

    const [
      onboardingRes,
      zoneRes,
      painRes,
      trappRes,
      trappHistoryRes,
      completionsRes,
      assignmentRes,
      calibratorRes,
    ] = await Promise.all([
      supabase
        .from("onboarding_assessments")
        .select(
          "goal, problem_area, problem_duration, activity_level, sleep_quality, stress_level, fear_of_movement_score, calibration_profile, completed_at"
        )
        .eq("client_id", clientId)
        .not("completed_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("zone_history")
        .select("zone_date, zone, computed_reason, trainer_overridden")
        .eq("client_id", clientId)
        .gte("zone_date", since30)
        .order("zone_date", { ascending: false }),
      supabase
        .from("pain_entries")
        .select("entry_date, intensity")
        .eq("client_id", clientId)
        .gte("entry_date", since30)
        .order("entry_date", { ascending: false }),
      supabase
        .from("trapp_state")
        .select("current_stage, is_maintenance_mode, entered_stage_at")
        .eq("client_id", clientId)
        .maybeSingle(),
      supabase
        .from("trapp_stage_history")
        .select("from_stage, to_stage, reason, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("workout_completions")
        .select("completion_date, status, rpe, pain_during")
        .eq("client_id", clientId)
        .gte("completion_date", since14)
        .order("completion_date", { ascending: false }),
      supabase
        .from("program_assignments")
        .select("id, program_id, current_day_index, status, program:programs(name)")
        .eq("client_id", clientId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("calibrator_events")
        .select("suggestion_kind, headline, reasoning, trainer_decision, trainer_note, decided_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const zoneRows = zoneRes.data ?? [];
    const zoneCounts = zoneRows.reduce(
      (acc, r) => {
        acc[r.zone as "green" | "yellow" | "red"]++;
        return acc;
      },
      { green: 0, yellow: 0, red: 0 }
    );

    const completions = completionsRes.data ?? [];
    const adherence = {
      loggedDays: completions.length,
      completedCount: completions.filter((c) => c.status === "ja").length,
      partialCount: completions.filter((c) => c.status === "delvis").length,
      missedCount: completions.filter((c) => c.status === "nei").length,
      windowDays: 14,
    };

    const data = {
      kartlegging: onboardingRes.data
        ? {
            mål: onboardingRes.data.goal,
            hovedplage: onboardingRes.data.problem_area,
            varighet: onboardingRes.data.problem_duration,
            aktivitetsnivå: onboardingRes.data.activity_level,
            søvn: onboardingRes.data.sleep_quality,
            stress: onboardingRes.data.stress_level,
            fryktForBevegelse: onboardingRes.data.fear_of_movement_score,
            kalibreringsprofil: onboardingRes.data.calibration_profile,
          }
        : null,
      sonen_siste_30_dager: {
        antall_grønn: zoneCounts.green,
        antall_gul: zoneCounts.yellow,
        antall_rød: zoneCounts.red,
        siste_5: zoneRows.slice(0, 5).map((r) => ({
          dato: r.zone_date,
          sone: r.zone,
          begrunnelse: r.computed_reason,
        })),
      },
      smerte_siste_30_dager: (painRes.data ?? []).map((r) => ({ dato: r.entry_date, intensitet: r.intensity })),
      trappen: trappRes.data
        ? {
            nåværende_trinn: trappRes.data.current_stage,
            vedlikeholdsmodus: trappRes.data.is_maintenance_mode,
            siste_overganger: (trappHistoryRes.data ?? []).map((h) => ({
              fra: h.from_stage,
              til: h.to_stage,
              begrunnelse: h.reason,
              dato: h.created_at,
            })),
          }
        : null,
      program: assignmentRes.data
        ? {
            navn:
              (assignmentRes.data as unknown as { program?: { name?: string } }).program?.name ?? null,
            dagens_dag: assignmentRes.data.current_day_index,
          }
        : null,
      gjennomføring_siste_14_dager: adherence,
      kalibrator_forslag_siste: (calibratorRes.data ?? []).map((c) => ({
        type: c.suggestion_kind,
        forslag: c.headline,
        begrunnelse: c.reasoning,
        trener_avgjørelse: c.trainer_decision,
        trener_notat: c.trainer_note,
      })),
    };

    const schema = audience === "customer" ? CUSTOMER_SCHEMA : TRAINER_SCHEMA;
    const schemaName = audience === "customer" ? "customer_summary" : "trainer_summary";

    const resp = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(audience, data) },
      ],
      text: {
        format: { type: "json_schema", name: schemaName, strict: true, schema },
      },
    });

    const jsonText = resp.output_text?.trim() || "{}";
    const parsed = JSON.parse(jsonText);

    return NextResponse.json({ audience, summary: parsed, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("ai/client-summary error:", e);
    return NextResponse.json({ error: "Kunne ikke generere oppsummering" }, { status: 500 });
  }
}
