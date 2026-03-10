import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/((?!login|logout).*)"],
};
