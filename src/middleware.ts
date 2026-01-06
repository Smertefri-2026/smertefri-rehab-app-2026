import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  // Kun root, kun app-subdomene
if (req.nextUrl.pathname === "/" && host.startsWith("app.")) {
  return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};