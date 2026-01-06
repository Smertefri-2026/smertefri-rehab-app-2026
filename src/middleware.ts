// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // 🚀 APP-DOMENE
  if (host.startsWith("app.")) {
    // Root → login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Blokker marketing-sider på app-domene
    if (pathname.startsWith("/#") || pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🌍 MARKETING-DOMENE
  if (!host.startsWith("app.")) {
    // Ingen tilgang til /dashboard osv
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