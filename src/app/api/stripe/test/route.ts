import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not set" });
  }

  const trimmedKey = key.trim();
  const info: Record<string, unknown> = {
    keyPrefix: trimmedKey.substring(0, 10) + "...",
    keyLength: trimmedKey.length,
    rawKeyLength: key.length,
    hasWhitespace: key !== trimmedKey,
    keyEndsWithNewline: key.endsWith("\n") || key.endsWith("\r"),
    nodeVersion: process.version,
  };

  // Test 1: Raw fetch to Stripe API (bypass SDK entirely)
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
      },
    });
    const data = await res.json();
    info.rawFetchStatus = res.status;
    info.rawFetchOk = res.ok;
    if (res.ok) {
      info.rawFetchCurrency = data.available?.[0]?.currency;
    } else {
      info.rawFetchError = data.error?.message;
    }
  } catch (e: unknown) {
    const err = e as { message?: string };
    info.rawFetchStatus = "EXCEPTION";
    info.rawFetchError = err.message;
  }

  // Test 2: Stripe SDK with fetch client
  try {
    const stripe = new Stripe(trimmedKey, {
      maxNetworkRetries: 1,
      timeout: 10000,
      httpClient: Stripe.createFetchHttpClient(),
    });
    const balance = await stripe.balance.retrieve();
    info.sdkFetch = "OK";
    info.sdkCurrency = balance.available?.[0]?.currency;
  } catch (e: unknown) {
    const err = e as { type?: string; message?: string };
    info.sdkFetch = "FAILED";
    info.sdkFetchError = err.message;
    info.sdkFetchType = err.type;
  }

  return NextResponse.json(info);
}
