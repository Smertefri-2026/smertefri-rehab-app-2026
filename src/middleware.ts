import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // 🔒 Kun redirect på ROOT
  if (pathname === "/" && host.startsWith("app.")) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

// 👇 VIKTIG: matcher må være bred
export const config = {
  matcher: ["/", "/:path*"],
};