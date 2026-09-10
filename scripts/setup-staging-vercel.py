#!/usr/bin/env python3
"""
Konfigurerer staging-Vercel-prosjektet «smertefri-ny-staging»:
  - Production Branch = feature/nye-smertefri
  - environment variables (dev-verdier fra .env.local)
  - domener ny.smertefri.no + app-ny.smertefri.no

Prosjektet må være opprettet i Vercel-dashbordet først (token kan ikke
opprette prosjekter). Rører ALDRI produksjonsprosjektet.

    python3 scripts/setup-staging-vercel.py

Idempotent: kan kjøres på nytt.
"""
import json
import os
import sys
import urllib.request
import urllib.error

STAGING_PROJECT = os.environ.get("STAGING_PROJECT", "smertefri-ny-staging")
PROD_PROJECT = "smertefri-rehab-app-2026"
GITHUB_REPO = "Smertefri-2026/smertefri-rehab-app-2026"
BRANCH = "feature/nye-smertefri"
DOMAINS = ["ny.smertefri.no", "app-ny.smertefri.no"]
API = "https://api.vercel.com"

# dev-verdier — staging peker på smertefri-dev-sep-26. GA utelates bevisst.
ENV_KEYS = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "RESEND_API_KEY",
    "LEADS_FROM_EMAIL",
    "LEADS_TO_EMAIL",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
]
ENV_TARGETS = ["production", "preview"]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_env_local():
    out = {}
    with open(os.path.join(ROOT, ".env.local"), encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def main():
    env = read_env_local()
    token = env.get("VERCEL_TOKEN")
    if not token:
        sys.exit("Fant ikke VERCEL_TOKEN i .env.local")

    if STAGING_PROJECT == PROD_PROJECT:
        sys.exit("NEKTER: STAGING_PROJECT er lik produksjonsprosjektet.")

    def call(method, path, body=None):
        url = f"{API}{path}"
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Bearer {token}")
        if data:
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req) as resp:
                raw = resp.read().decode()
                return resp.status, (json.loads(raw) if raw else {})
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            try:
                return e.code, json.loads(raw)
            except Exception:
                return e.code, {"raw": raw}

    # account/team-id
    st, me = call("GET", "/v2/user")
    team_id = me.get("user", {}).get("defaultTeamId")
    q = f"?teamId={team_id}" if team_id else ""

    # 0) prosjektet må finnes
    st, proj = call("GET", f"/v9/projects/{STAGING_PROJECT}{q}")
    if st != 200:
        sys.exit(
            f"Prosjektet «{STAGING_PROJECT}» finnes ikke ({proj.get('error')}).\n"
            f"Opprett det i Vercel: New Project → importer {GITHUB_REPO}."
        )
    print(f"→ Prosjekt: {STAGING_PROJECT}  (account {proj.get('accountId')})")

    # 1) production branch
    st, r = call("PATCH", f"/v10/projects/{STAGING_PROJECT}/branch{q}", {"branch": BRANCH})
    st2, check = call("GET", f"/v9/projects/{STAGING_PROJECT}{q}")
    if check.get("link", {}).get("productionBranch") == BRANCH:
        print(f"→ Production Branch = {BRANCH}  ✓")
    else:
        print(
            f"→ Production Branch: klarte ikke via API (status {st}).\n"
            f"   Sett manuelt: Settings → Git → Production Branch → {BRANCH}"
        )

    # 2) env vars
    print("→ Environment variables")
    st, existing = call("GET", f"/v9/projects/{STAGING_PROJECT}/env{q}")
    by_key = {}
    for e in existing.get("envs", []):
        by_key.setdefault(e["key"], []).append(e["id"])

    for key in ENV_KEYS:
        val = env.get(key)
        if not val:
            print(f"   – {key}: mangler i .env.local, hopper over")
            continue
        for eid in by_key.get(key, []):
            call("DELETE", f"/v9/projects/{STAGING_PROJECT}/env/{eid}{q}")
        st, r = call(
            "POST",
            f"/v10/projects/{STAGING_PROJECT}/env{q}",
            {"key": key, "value": val, "type": "encrypted", "target": ENV_TARGETS},
        )
        print(f"   {'✓' if st in (200, 201) else '⚠ ' + str(r.get('error'))} {key}")

    # 3) domener
    print("→ Domener")
    for d in DOMAINS:
        st, r = call("POST", f"/v10/projects/{STAGING_PROJECT}/domains{q}", {"name": d})
        if st in (200, 201):
            print(f"   ✓ {d} lagt til")
        elif r.get("error", {}).get("code") in ("domain_already_in_use", "domain_taken"):
            print(f"   ✓ {d} (allerede tilkoblet)")
        else:
            print(f"   ⚠ {d}: {r.get('error')}")

    print()
    print("Gjenstående manuelt (utenfor Vercel):")
    print("  • DNS i smertefri.no-sonen:")
    print("      ny       CNAME  cname.vercel-dns.com.")
    print("      app-ny   CNAME  cname.vercel-dns.com.")
    print("  • Supabase smertefri-dev-sep-26 → Auth → URL Configuration:")
    print("      Site URL:      https://app-ny.smertefri.no")
    print("      Redirect URLs: https://app-ny.smertefri.no/**")
    print("  • Cloudflare Turnstile: legg ny.smertefri.no til i widgetens domeneliste")


if __name__ == "__main__":
    main()
