import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/serverAuth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Åpner Stripes Customer Portal for den innloggede kunden. Dette er
 * bevisst IKKE en egenbygget oppgraderings-/nedgraderings-/oppsigelses-UI —
 * Stripe Portal håndterer bytte mellom konfigurerte Prices og kansellering
 * uten bindingstid nativt, så lenge Portal-konfigurasjonen (gjøres i
 * Stripe Dashboard når priser er satt) tillater det. Det er derfor denne
 * ene ruten dekker "oppgradering/nedgradering, oppsigelse uten
 * bindingstid" uten at vi må bygge det selv.
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

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", auth.user.id)
      .single();
    if (error) throw error;

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Fant ingen betalingskonto å administrere ennå." },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.smertefri.no";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("billing/portal error:", e);
    return NextResponse.json({ error: "Kunne ikke åpne betalingsportalen." }, { status: 500 });
  }
}
