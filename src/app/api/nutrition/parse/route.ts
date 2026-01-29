import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Mangler tekst" }, { status: 400 });
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
    return NextResponse.json(
      { error: e?.message ?? "Serverfeil" },
      { status: 500 }
    );
  }
}