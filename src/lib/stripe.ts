// TODO: Skift til live Stripe credentials ved lancering
// Verificer at STRIPE_SECRET_KEY starter med sk_test_ og
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starter med pk_test_

import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY!.trim();
  if (!key.startsWith("sk_test_")) {
    console.warn("⚠️ STRIPE_SECRET_KEY er IKKE en test-nøgle! Skift til sk_test_ indtil lancering.");
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    maxNetworkRetries: 3,
    timeout: 20000,
    httpClient: Stripe.createFetchHttpClient(),
  });
}
