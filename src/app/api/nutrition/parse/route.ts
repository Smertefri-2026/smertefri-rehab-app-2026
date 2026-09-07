import OpenAI from "openai";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const MAX_TEXT_LENGTH = 500;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60 * 60 * 1000; // per hour, per user

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!checkRateLimit(`nutrition-parse:${auth.user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "For mange forespørsler. Prøv igjen om litt." },
        { status: 429 }
      );
    }

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Mangler tekst" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Teksten er for lang (maks ${MAX_TEXT_LENGTH} tegn)` },
        { status: 400 }
      );
    }

    const resp = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Du er en ernæringsassistent. Estimer makroer i gram og kcal. Svar KUN i JSON iht schema.",
        },
        { role: "user", content: text },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "meal_macros",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              protein_g: { type: "number" },
              fat_g: { type: "number" },
              carbs_g: { type: "number" },
              calories_kcal: { type: "number" },
              confidence: { type: "number" },
              assumption: { type: "string" },
            },
            required: [
              "protein_g",
              "fat_g",
              "carbs_g",
              "calories_kcal",
              "confidence",
              "assumption",
            ],
          },
        },
      },
    });

    const jsonText = resp.output_text?.trim() || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("nutrition/parse error:", e);
    return NextResponse.json({ error: "Kunne ikke beregne makroer" }, { status: 500 });
  }
}