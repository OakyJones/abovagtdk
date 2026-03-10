import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not set" });
  }

  const info: Record<string, unknown> = {
    keyPrefix: key.substring(0, 7) + "...",
    keyLength: key.length,
    nodeVersion: process.version,
    stripeSDK: "20.4.1",
  };

  try {
    // Try without explicit apiVersion first
    const stripe = new Stripe(key, {
      maxNetworkRetries: 2,
      timeout: 15000,
    });
    const balance = await stripe.balance.retrieve();
    info.connection = "OK";
    info.currency = balance.available?.[0]?.currency;
  } catch (e: unknown) {
    const err = e as { type?: string; message?: string; code?: string };
    info.connection = "FAILED";
    info.errorType = err.type;
    info.errorMessage = err.message;
    info.errorCode = err.code;
  }

  try {
    // Try with explicit apiVersion
    const stripe2 = new Stripe(key, {
      apiVersion: "2026-02-25.clover" as unknown as Stripe.LatestApiVersion,
      maxNetworkRetries: 2,
      timeout: 15000,
    });
    const balance2 = await stripe2.balance.retrieve();
    info.connectionWithApiVersion = "OK";
    info.currency2 = balance2.available?.[0]?.currency;
  } catch (e: unknown) {
    const err = e as { type?: string; message?: string; code?: string };
    info.connectionWithApiVersion = "FAILED";
    info.errorType2 = err.type;
    info.errorMessage2 = err.message;
    info.errorCode2 = err.code;
  }

  return NextResponse.json(info);
}
