#!/usr/bin/env python3
"""
DEV-ONLY. Oppretter demo-brukere (kunde/trener/admin) i dev-Supabase.

Kjøres ALDRI mot produksjon:
  - guarden under nekter alt annet enn dev-prosjektet (lclsquqcongfnngtsgik)
  - passord og service-role-nøkkel leses fra miljøet, aldri hardkodet
  - demo-e-post er @demo.smertefri.no (ingen MX ⇒ kan ikke self-signup i prod)

Bruk:
  SF_SERVICE_KEY=...  SEED_PW_KUNDE=...  SEED_PW_TRENER=...  SEED_PW_ADMIN=... \\
    python3 scripts/seed-dev-users.py
"""
import json
import os
import sys
import urllib.request
import urllib.error

DEV_REF = "lclsquqcongfnngtsgik"
SF_URL = os.environ.get("SF_URL", f"https://{DEV_REF}.supabase.co")

if DEV_REF not in SF_URL:
    sys.exit(f"NEKTER: SF_URL ({SF_URL}) er ikke dev-prosjektet. Dette scriptet er kun for dev.")

SVC = os.environ.get("SF_SERVICE_KEY")
if not SVC:
    sys.exit("Mangler SF_SERVICE_KEY (service_role-nøkkel for dev-prosjektet).")

USERS = [
    ("kunde@demo.smertefri.no", os.environ.get("SEED_PW_KUNDE"), "client",
     {"first_name": "Demo", "last_name": "Kunde", "city": "Bergen", "birth_date": "1988-04-12"}),
    ("trener@demo.smertefri.no", os.environ.get("SEED_PW_TRENER"), "trainer",
     {"first_name": "Mari", "last_name": "Rehab", "city": "Oslo"}),
    ("admin@demo.smertefri.no", os.environ.get("SEED_PW_ADMIN"), "admin",
     {"first_name": "Demo", "last_name": "Admin"}),
]

H = {"apikey": SVC, "Authorization": f"Bearer {SVC}", "Content-Type": "application/json"}


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(f"{SF_URL}{path}", data=data, method=method)
    for k, v in H.items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def main():
    print(f"DEV seed → {SF_URL}\n")
    ids = {}
    for email, pw, role, profile in USERS:
        if not pw:
            sys.exit(f"Mangler passord-env for {email} (SEED_PW_*).")
        st, r = req("POST", "/auth/v1/admin/users",
                    {"email": email, "password": pw, "email_confirm": True})
        uid = r.get("id")
        if not uid:
            # finnes kanskje fra før
            st2, lst = req("GET", f"/auth/v1/admin/users?filter=email.eq.{email}")
            users = lst.get("users") or lst if isinstance(lst, list) else lst.get("users", [])
            uid = (users[0]["id"] if users else None)
        if not uid:
            print(f"  ⚠ {email}: {r}")
            continue
        ids[role] = uid
        req("PATCH", f"/rest/v1/profiles?id=eq.{uid}", {**profile, "role": role})
        print(f"  ✓ {email}  ({role})  {uid}")

    if "client" in ids and "trainer" in ids:
        req("POST", "/rest/v1/client_trainer_assignments",
            {"client_id": ids["client"], "trainer_id": ids["trainer"], "status": "active"})
        print("  ✓ kobling kunde ↔ trener")

    print("\nFerdig. Brukerne finnes kun i dev-Supabase.")


if __name__ == "__main__":
    main()
