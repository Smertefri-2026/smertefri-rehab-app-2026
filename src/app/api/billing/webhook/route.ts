import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getStripe, isStripeConfigured, planKeyForPriceId } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe kaller denne direkte — ingen brukersesjon, så RLS/auth.uid() kan
 * ikke autorisere skrivingen. Bevisst, smal unntak fra "ingen service-role
 * klient noe sted" (samme begrunnelse som record_order_from_webhook i
 * 0009_payments.sql): signaturen verifiseres FØRST, og databasesiden er
 * i tillegg låst til service_role via `revoke execute ... from public,
 * anon, authenticated` på begge RPC-ene denne ruten kaller.
 *
 * SUPABASE_SERVICE_ROLE_KEY og STRIPE_WEBHOOK_SECRET er ikke satt i Vercel
 * ennå — begge må legges til når Stripe faktisk kobles til.
 */

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY er ikke satt.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

async function handleSubscriptionEvent(sub: Stripe.Subscription) {
  const clientId = sub.metadata?.smertefri_client_id;
  if (!clientId) {
    console.warn("billing/webhook: abonnement uten smertefri_client_id-metadata", sub.id);
    return;
  }

  const price = sub.items.data[0]?.price;
  const priceId = price?.id ?? "";
  const planKey = (sub.metadata?.plan_key as string) || planKeyForPriceId(priceId) || "ukjent";
  const currentPeriodEnd = sub.items.data[0]?.current_period_end
    ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
    : null;

  const supabase = adminClient();
  const { error } = await supabase.rpc("upsert_subscription_from_webhook", {
    p_client_id: clientId,
    p_stripe_customer_id: String(sub.customer),
    p_stripe_subscription_id: sub.id,
    p_stripe_price_id: priceId,
    p_plan_key: planKey,
    p_status: sub.status,
    p_current_period_end: currentPeriodEnd,
    p_cancel_at_period_end: sub.cancel_at_period_end,
  });
  if (error) throw error;
}

async function handleOneOffCheckout(session: Stripe.Checkout.Session) {
  const clientId = session.metadata?.smertefri_client_id;
  const planKey = session.metadata?.plan_key;
  if (!clientId || !planKey) return;

  const bookingId = session.metadata?.booking_id || null;
  const amountOre = session.amount_total ?? null;

  const supabase = adminClient();
  const { error } = await supabase.rpc("record_order_from_webhook", {
    p_client_id: clientId,
    p_product_type: "trainer_session",
    p_stripe_checkout_session_id: session.id,
    p_stripe_payment_intent_id: String(session.payment_intent ?? ""),
    p_amount_ore: amountOre,
    p_status: "paid",
  });
  if (error) throw error;

  if (bookingId) {
    // Beste-innsats kobling til økten betalingen gjelder — feiler ikke
    // hele webhooken dersom bookingen av en eller annen grunn er borte.
    await supabase
      .from("orders")
      .update({ related_booking_id: bookingId })
      .eq("stripe_checkout_session_id", session.id);
  }
}

export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Betaling er ikke satt opp ennå." }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Mangler stripe-signature." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("billing/webhook: ugyldig signatur", e);
    return NextResponse.json({ error: "Ugyldig signatur." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await handleOneOffCheckout(session);
        }
        // mode === "subscription": abonnement-tilstanden fanges av
        // customer.subscription.* over — unngår å skrive samme rad to veier.
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("billing/webhook: feil under behandling av", event.type, e);
    return NextResponse.json({ error: "Intern feil under behandling." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
