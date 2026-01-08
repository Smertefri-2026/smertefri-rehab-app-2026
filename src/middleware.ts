// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  const isLocalhost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");

  const isAppDomain = host.startsWith("app.");

  // 🚀 APP-DOMENE (kun prod)
  if (isAppDomain) {
    if (pathname === "/" || pathname.startsWith("/#")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🌍 MARKETING-DOMENE (kun prod, aldri localhost)
  if (!isAppDomain && !isLocalhost) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/clients")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};