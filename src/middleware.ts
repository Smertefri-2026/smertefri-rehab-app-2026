import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Domenearkitektur — samme kodebase, hostname-basert routing:
 *
 *   smertefri.no       → offentlig nettside
 *   app.smertefri.no   → innlogging + hele appen («Min SmerteFri»)
 *
 * Preview-deploys (*.vercel.app) og localhost serveres fra samme origin —
 * ingen redirects. AuthGuard beskytter app-sidene klientside uansett.
 */

const APP_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/kartlegging",
  "/min-plan",
  "/sonen",
  "/trappen",
  "/program",
  "/fremgang",
  "/oppfolging",
  "/calendar",
  "/clients",
  "/chat",
  "/pain",
  "/tests",
  "/nutrition",
  "/profile",
  "/trainer",
  "/trainers",
  "/trainer-application",
  "/admin",
];

const AUTH_PREFIXES = ["/login", "/register"];

const MARKETING_HOSTS = ["smertefri.no", "www.smertefri.no"];
const APP_HOST = "app.smertefri.no";

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;

  const isMarketingHost = MARKETING_HOSTS.includes(host);
  const isAppHost = host === APP_HOST;

  // Preview / localhost / alt annet: rør ingenting.
  if (!isMarketingHost && !isAppHost) return NextResponse.next();

  const isAppPath = hasPrefix(pathname, APP_PREFIXES);
  const isAuthPath = hasPrefix(pathname, AUTH_PREFIXES);
  const isMarketingPath = !isAppPath && !isAuthPath;

  if (isAppHost) {
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

  // Marketing-host: app + innlogging hører hjemme på app-domenet.
  if (isAppPath || isAuthPath) {
    return NextResponse.redirect(new URL(`https://${APP_HOST}${pathname}${search}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|manifest.webmanifest|.*\\.).*)"],
};
