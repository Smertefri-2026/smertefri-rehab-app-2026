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
 *
 * Et valgfritt sekundært miljø kan defineres via env-variablene
 * STAGING_MARKETING_HOST / STAGING_APP_HOST (settes kun på den aktuelle
 * deployen). Produktkoden inneholder ingen faste sekundærdomener.
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
  "/trainer",
  "/trainers",
  "/trainer-application",
  "/admin",
];

const AUTH_PREFIXES = ["/login", "/register"];

type HostEnv = { marketing: string; marketingAliases: string[]; app: string };

/** host-par per miljø: marketing-host ↔ app-host. */
const ENVIRONMENTS: HostEnv[] = [
  { marketing: "smertefri.no", marketingAliases: ["www.smertefri.no"], app: "app.smertefri.no" },
];

const stagingMarketing = process.env.STAGING_MARKETING_HOST?.toLowerCase();
const stagingApp = process.env.STAGING_APP_HOST?.toLowerCase();
if (stagingMarketing && stagingApp) {
  ENVIRONMENTS.push({ marketing: stagingMarketing, marketingAliases: [], app: stagingApp });
}

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;

  const env = ENVIRONMENTS.find(
    (e) => e.marketing === host || e.app === host || e.marketingAliases.includes(host)
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
