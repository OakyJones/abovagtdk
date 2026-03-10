import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
    }

    // Generate a session token deterministically from the password
    // so middleware can validate without DB lookup
    const token =
      process.env.ADMIN_SESSION_TOKEN ||
      crypto.createHash("sha256").update(password + "-abovagt-admin").digest("hex");

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server fejl" }, { status: 500 });
  }
}
