import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;

  // 👉 app.smertefri.no skal alltid starte på login
  if (
    host === "app.smertefri.no" &&
    pathname === "/"
  ) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};