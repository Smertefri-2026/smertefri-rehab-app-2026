import Stripe from "stripe";

/**
 * Server-only Stripe-klient. Ingen priser er hardkodet noe sted i denne
 * filen — Price-ID-er kommer fra miljøvariabler (se PLAN_PRICE_ENV) slik at
 * prisretningen kan endres i Stripe/Vercel uten en kodeendring.
 *
 * STRIPE_SECRET_KEY er ikke satt ennå (ingen Stripe-konto koblet). Rutene
 * som bruker denne sjekker isStripeConfigured() først og svarer med en
 * tydelig "ikke satt opp ennå"-feil i stedet for å krasje.
 */

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY er ikke satt — betaling er ikke konfigurert ennå.");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return cached;
}

/**
 * Arbeidsnavn → miljøvariabel for Stripe Price-ID. Alle er valgfrie inntil
 * en reell pris er opprettet i Stripe og satt i Vercel — en manglende
 * verdi gir en tydelig feil i /api/billing/checkout, ikke et krasj.
 *
 * "extra25"/"extra50" er engangskjøp (ekstra konsultasjon utover det som
 * er inkludert); resten er løpende abonnement.
 */
export const PLAN_PRICE_ENV = {
  start: "STRIPE_PRICE_START",
  fremgang: "STRIPE_PRICE_FREMGANG",
  vedlikehold: "STRIPE_PRICE_VEDLIKEHOLD",
  extra25: "STRIPE_PRICE_EXTRA_25",
  extra50: "STRIPE_PRICE_EXTRA_50",
} as const;

export type PlanKey = keyof typeof PLAN_PRICE_ENV;

const SUBSCRIPTION_PLANS: readonly PlanKey[] = ["start", "fremgang", "vedlikehold"];
const ONE_OFF_PLANS: readonly PlanKey[] = ["extra25", "extra50"];

export function isSubscriptionPlan(key: string): key is PlanKey {
  return (SUBSCRIPTION_PLANS as readonly string[]).includes(key);
}

export function isOneOffPlan(key: string): key is PlanKey {
  return (ONE_OFF_PLANS as readonly string[]).includes(key);
}

export function priceIdForPlan(key: PlanKey): string | null {
  return process.env[PLAN_PRICE_ENV[key]] || null;
}

/** Reverse lookup brukt av webhooken: Stripe price-ID → vårt arbeidsnavn. */
export function planKeyForPriceId(priceId: string): PlanKey | null {
  for (const key of Object.keys(PLAN_PRICE_ENV) as PlanKey[]) {
    if (priceIdForPlan(key) === priceId) return key;
  }
  return null;
}
