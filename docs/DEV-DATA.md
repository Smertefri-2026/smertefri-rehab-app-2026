# Dev- og testdata

Appen kjører på `smertefri.no` / `app.smertefri.no` mot **dev-Supabase**
(`smertefri-dev-sep-26` / `lclsquqcongfnngtsgik`) inntil videre. Produksjon får
et eget Supabase-prosjekt senere.

## Prinsipp

| | Nå (dev-Supabase) | Framtidig produksjon |
|---|---|---|
| Demo-brukere | ja (se under) | nei — opprettes aldri |
| Innhold (øvelser/programmer) | ja | ja — samme, via migrasjon `20260910000017` |

- **Demo-brukere ligger IKKE i noen migrasjon.** Migrasjoner kjøres likt i alle
  miljøer; brukere opprettes med `scripts/seed-dev-users.py`, som nekter å kjøre
  mot noe annet enn dev-prosjektet.
- **Demo-e-post er `@example.com`** (RFC 7505 null-MX). Ingen e-post sendes dit,
  ingen bounces, og domenet kan ikke brukes til self-signup.
- **Ingen passord, service-nøkler eller tokens i repoet.** Scriptene leser alt
  fra miljøet. `.env*` er git-ignorert.
- Øvelses-/programbiblioteket (`20260910000017_seed_exercise_library.sql`) er
  reelt produktinnhold og skal til produksjon — ikke testdata.

## Demo-brukere (kun dev)

| Rolle | E-post |
|---|---|
| Kunde | `kunde@example.com` |
| Rehabtrener | `trener@example.com` |
| Admin | `admin@example.com` |

Passord deles utenfor repoet. Re-seed:

```
SF_SERVICE_KEY=…  SEED_PW_KUNDE=…  SEED_PW_TRENER=…  SEED_PW_ADMIN=… \
  python3 scripts/seed-dev-users.py
```

Eldre `sf-test-*@example.com`-brukere fra tidligere testing kan stå — samme
null-MX-domene, ingen bounce-risiko.

## E-postutsending

Auth-e-post (bekreftelse, passord-reset) går inntil videre gjennom Supabases
default-SMTP. Før løsningen åpnes for reelle brukere: sett Custom SMTP via
Resend — se `docs/DEPLOY.md`. Da rammes ikke avsenderomdømmet av testadresser,
og feiladresser håndteres av Resend.

## Ved production-cutover

Nytt Supabase-prosjekt → kjør migrasjonene (inkl. innholds-seed) → **ikke** kjør
`seed-dev-users.py`. Produksjon starter uten demo-brukere.
