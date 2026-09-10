import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Domenearkitektur — samme kodebase, hostname-basert routing:
 *
 *   Produksjon:  smertefri.no       → offentlig nettside
 *                app.smertefri.no   → innlogging + hele appen
 *
 *   Staging:     ny.smertefri.no    → offentlig nettside (staging)
 *                app-ny.smertefri.no → innlogging + app (staging)
 *
 * Preview-deploys (*.vercel.app) og localhost serveres fra samme origin —
 * ingen redirects. AuthGuard beskytter app-sidene klientside uansett.
 *
 * Staging og produksjon er separate miljøer: staging peker på dev-Supabase
 * (smertefri-dev-sep-26), produksjon på sin egen. De deler aldri sesjon.
 */

const APP_PREFIXES = [
  "/dashboard",
  "/onboarding",
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
  "/settings",
  "/trainer",
  "/trainers",
  "/trainer-application",
  "/admin",
];

const AUTH_PREFIXES = ["/login", "/register"];

/** host-par per miljø: marketing-host ↔ app-host. */
const ENVIRONMENTS = [
  { marketing: "smertefri.no", marketingAliases: ["www.smertefri.no"], app: "app.smertefri.no" },
  { marketing: "ny.smertefri.no", marketingAliases: [], app: "app-ny.smertefri.no" },
] as const;

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;

  const env = ENVIRONMENTS.find(
    (e) => e.marketing === host || e.app === host || (e.marketingAliases as readonly string[]).includes(host)
  );

  // Preview / localhost / alt annet: rør ingenting.
  if (!env) return NextResponse.next();

  const isAppHost = host === env.app;
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
      return NextResponse.redirect(new URL(`https://${env.marketing}${pathname}${search}`));
    }
    return NextResponse.next();
  }

  // Marketing-host: app + innlogging hører hjemme på app-domenet.
  if (isAppPath || isAuthPath) {
    return NextResponse.redirect(new URL(`https://${env.app}${pathname}${search}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|manifest.webmanifest|.*\\.).*)"],
};
