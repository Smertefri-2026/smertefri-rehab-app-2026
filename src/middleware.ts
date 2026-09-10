import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Domenearkitektur (kun i produksjon):
 *   smertefri.no      → offentlig nettside
 *   app.smertefri.no  → innlogging + hele appen («Min SmerteFri»)
 *
 * Lokalt og på preview-deploys serveres alt fra samme origin — ingen
 * redirects. AuthGuard beskytter app-sidene klientside uansett.
 */

const APP_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/sonen",
  "/trappen",
  "/program",
  "/calendar",
  "/clients",
  "/chat",
  "/pain",
  "/tests",
  "/nutrition",
  "/profile",
  "/settings",
  "/trainer",
  "/trainers",
  "/trainer-application",
  "/admin",
];

const AUTH_PREFIXES = ["/login", "/register"];

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;

  const isProdMarketing = host === "smertefri.no" || host === "www.smertefri.no";
  const isProdApp = host === "app.smertefri.no";

  // Preview / localhost / alt annet: rør ingenting.
  if (!isProdMarketing && !isProdApp) return NextResponse.next();

  const isAppPath = hasPrefix(pathname, APP_PREFIXES);
  const isAuthPath = hasPrefix(pathname, AUTH_PREFIXES);
  const isMarketingPath = !isAppPath && !isAuthPath;

  if (isProdApp) {
    // App-domenet: forsiden går rett inn i appen.
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Markedsføringssider hører hjemme på nettsiden.
    if (isMarketingPath) {
      return NextResponse.redirect(new URL(`https://smertefri.no${pathname}${search}`));
    }
    return NextResponse.next();
  }

  // isProdMarketing: app + innlogging hører hjemme på app-domenet.
  if (isAppPath || isAuthPath) {
    return NextResponse.redirect(new URL(`https://app.smertefri.no${pathname}${search}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|manifest.webmanifest|.*\\.).*)"],
};
