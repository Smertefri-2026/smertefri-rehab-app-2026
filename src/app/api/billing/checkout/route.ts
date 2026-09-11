import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  getStripe,
  isStripeConfigured,
  isOneOffPlan,
  isSubscriptionPlan,
  priceIdForPlan,
  type PlanKey,
} from "@/lib/stripe";

export const runtime = "nodejs";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Oppretter en Stripe Checkout-økt for enten et løpende abonnement
 * (Start/Fremgang/Vedlikehold) eller et engangskjøp (ekstra 25/50-min
 * konsultasjon). Ingen kronebeløp her — kun en `planKey` som slås opp mot
 * en Price-ID i miljøvariabler (se src/lib/stripe.ts). Svarer med en
 * tydelig feil, ikke et krasj, dersom Stripe/prisen ikke er satt opp ennå.
 */
export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Betaling er ikke satt opp ennå." },
        { status: 501 }
      );
    }

    const auth = await requireAuth(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!checkRateLimit(`billing-checkout:${auth.user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "For mange forespørsler. Prøv igjen om litt." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const planKey = String(body?.planKey ?? "") as PlanKey;
    const bookingId = body?.bookingId ? String(body.bookingId) : null;

    if (!isSubscriptionPlan(planKey) && !isOneOffPlan(planKey)) {
      return NextResponse.json({ error: "Ukjent planKey." }, { status: 400 });
    }

    const priceId = priceIdForPlan(planKey);
    if (!priceId) {
      return NextResponse.json(
        { error: `Ingen Stripe-pris satt for "${planKey}" ennå.` },
        { status: 501 }
      );
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, first_name, last_name")
      .eq("id", auth.user.id)
      .single();
    if (profileErr) throw profileErr;

    const stripe = getStripe();

    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
      const customer = await stripe.customers.create({
        email: profile?.email ?? auth.user.email ?? undefined,
        name: name || undefined,
        metadata: { smertefri_client_id: auth.user.id },
      });
      customerId = customer.id;

      // Skriv tilbake stripe_customer_id som brukeren selv (RLS-eid rad).
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", auth.user.id);
      if (updateErr) throw updateErr;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.smertefri.no";
    const mode = isSubscriptionPlan(planKey) ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/profile?betaling=ok`,
      cancel_url: `${appUrl}/profile?betaling=avbrutt`,
      metadata: {
        smertefri_client_id: auth.user.id,
        plan_key: planKey,
        booking_id: bookingId ?? "",
      },
      subscription_data:
        mode === "subscription"
          ? { metadata: { smertefri_client_id: auth.user.id, plan_key: planKey } }
          : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("billing/checkout error:", e);
    return NextResponse.json({ error: "Kunne ikke starte betaling." }, { status: 500 });
  }
}
