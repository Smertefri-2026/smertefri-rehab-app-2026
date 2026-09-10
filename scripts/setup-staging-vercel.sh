#!/usr/bin/env bash
#
# Konfigurerer det NYE staging-Vercel-prosjektet (må opprettes i dashboardet
# først — token har ikke rett til å opprette prosjekter). Idempotent nok til
# å kjøres på nytt.
#
#   1. Opprett prosjekt i Vercel: New Project → importer repoet
#      "smertefri-rehab-app-2026" → gi det navnet under (STAGING_PROJECT).
#   2. Kjør:  bash scripts/setup-staging-vercel.sh
#
# Rører ALDRI produksjonsprosjektet (smertefri-rehab-app-2026).

set -euo pipefail
cd "$(dirname "$0")/.."

STAGING_PROJECT="${STAGING_PROJECT:-smertefri-ny-staging}"
PROD_PROJECT="smertefri-rehab-app-2026"
TEAM="team_pagXy92BCzFO1cCT1IUWL9pG"
BRANCH="feature/nye-smertefri"
API="https://api.vercel.com"

if [ "$STAGING_PROJECT" = "$PROD_PROJECT" ]; then
  echo "NEKTER: STAGING_PROJECT er lik produksjonsprosjektet." >&2
  exit 1
fi

VT="$(grep '^VERCEL_TOKEN=' .env.local | cut -d= -f2- | tr -d "\"'" | xargs)"
[ -n "$VT" ] || { echo "Fant ikke VERCEL_TOKEN i .env.local" >&2; exit 1; }

envval() { grep "^$1=" .env.local | head -1 | cut -d= -f2- | tr -d "\"'"; }

api() { # method path [json-body]
  local m="$1" p="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -sS -X "$m" -H "Authorization: Bearer $VT" -H "Content-Type: application/json" \
      "$API$p" -d "$body"
  else
    curl -sS -X "$m" -H "Authorization: Bearer $VT" "$API$p"
  fi
}

echo "→ Sjekker at «$STAGING_PROJECT» finnes …"
proj="$(api GET "/v9/projects/$STAGING_PROJECT?teamId=$TEAM")"
if echo "$proj" | grep -q '"code":"not_found"'; then
  echo "   Prosjektet finnes ikke enda. Opprett det i Vercel-dashbordet:" >&2
  echo "   New Project → Import «$PROD_PROJECT» → Project Name: $STAGING_PROJECT" >&2
  exit 1
fi
echo "   OK."

echo "→ Setter Production Branch = $BRANCH"
api PATCH "/v9/projects/$STAGING_PROJECT?teamId=$TEAM" \
  "{\"framework\":\"nextjs\",\"gitRepository\":{\"type\":\"github\",\"repo\":\"Smertefri-2026/$PROD_PROJECT\",\"productionBranch\":\"$BRANCH\"}}" \
  | grep -q '"error"' && echo "   ⚠ klarte ikke via API — sett den manuelt: Settings → Git → Production Branch → $BRANCH" || echo "   OK."

set_env() { # KEY VALUE
  local key="$1" val="$2"
  [ -n "$val" ] || { echo "   – hopper over $key (tom)"; return; }
  # slett ev. eksisterende med samme navn, så legg til på nytt
  ids="$(api GET "/v9/projects/$STAGING_PROJECT/env?teamId=$TEAM" \
    | python3 -c "import sys,json;print(' '.join(e['id'] for e in json.load(sys.stdin).get('envs',[]) if e['key']=='$key'))" 2>/dev/null || true)"
  for id in $ids; do api DELETE "/v9/projects/$STAGING_PROJECT/env/$id?teamId=$TEAM" >/dev/null; done
  out="$(api POST "/v10/projects/$STAGING_PROJECT/env?teamId=$TEAM" \
    "$(python3 -c "import json,sys;print(json.dumps({'key':'$key','value':sys.argv[1],'type':'encrypted','target':['production','preview']}))" "$val")")"
  echo "$out" | grep -q '"error"' && echo "   ⚠ $key: $out" || echo "   ✓ $key"
}

echo "→ Environment variables (dev-verdier — staging peker på smertefri-dev-sep-26)"
set_env NEXT_PUBLIC_SUPABASE_URL      "$(envval NEXT_PUBLIC_SUPABASE_URL)"
set_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$(envval NEXT_PUBLIC_SUPABASE_ANON_KEY)"
set_env OPENAI_API_KEY               "$(envval OPENAI_API_KEY)"
set_env OPENAI_MODEL                 "$(envval OPENAI_MODEL)"
set_env RESEND_API_KEY              "$(envval RESEND_API_KEY)"
set_env LEADS_FROM_EMAIL           "$(envval LEADS_FROM_EMAIL)"
set_env LEADS_TO_EMAIL             "$(envval LEADS_TO_EMAIL)"
set_env NEXT_PUBLIC_TURNSTILE_SITE_KEY "$(envval NEXT_PUBLIC_TURNSTILE_SITE_KEY)"
set_env TURNSTILE_SECRET_KEY         "$(envval TURNSTILE_SECRET_KEY)"
# GA utelates bevisst på staging (unngå å forurense prod-analytics).

echo "→ Domener"
for d in ny.smertefri.no app-ny.smertefri.no; do
  out="$(api POST "/v10/projects/$STAGING_PROJECT/domains?teamId=$TEAM" "{\"name\":\"$d\"}")"
  if echo "$out" | grep -q '"error"'; then
    echo "$out" | grep -q 'domain_already_in_use\|already exists' && echo "   ✓ $d (allerede lagt til)" || echo "   ⚠ $d: $out"
  else
    echo "   ✓ $d lagt til"
  fi
done

echo
echo "Ferdig med det API-et tillater. Gjenstående manuelt:"
echo "  • DNS hos smertefri.no-sonen:  ny CNAME cname.vercel-dns.com  /  app-ny CNAME cname.vercel-dns.com"
echo "  • Supabase (smertefri-dev-sep-26) → Auth → URL Configuration:"
echo "      Site URL: https://app-ny.smertefri.no"
echo "      Redirect URLs: https://app-ny.smertefri.no/**"
echo "  • Cloudflare Turnstile: legg ny.smertefri.no til i widgetens domeneliste"
echo "  • Utløs første deploy:  tom commit + push til $BRANCH, eller Redeploy i dashbordet"
