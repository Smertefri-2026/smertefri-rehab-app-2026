# Deploy — nye SmerteFri

Nye SmerteFri bygges fortløpende rett på produksjonsdomenene. Det finnes
**ikke** et eget staging-domene.

| | |
|---|---|
| Offentlig nettside | `https://smertefri.no` |
| Innlogget app | `https://app.smertefri.no` |
| Vercel-prosjekt | `smertefri-ny-staging` (id `prj_7dmZvBLa0VsuaDUMif2sVuKuWlmP`) |
| Git-branch (kilde) | `feature/nye-smertefri` |
| Supabase | `smertefri-dev-sep-26` (`lclsquqcongfnngtsgik`) — navnet er historisk; org-planen er **Pro**, ikke gratis-tier |
| Vercels egen adresse | `smertefri-ny-staging.vercel.app` (kan stå) |

Hver `git push` til `feature/nye-smertefri` → automatisk produksjonsdeploy.
Begge domenene følger alltid siste grønne deploy fra den branchen.

## Hostname-routing (`src/middleware.ts`)

- `smertefri.no` / `www.smertefri.no` → offentlig side; `/login`, `/register/**`
  og app-stier redirectes til `app.smertefri.no`.
- `app.smertefri.no` → app; `/` → `/dashboard`, markedsføringsstier → `smertefri.no`.
- `*.vercel.app` og `localhost` → alt fra samme origin, ingen redirects.

Ingen andre domener er konfigurert. Middleware har ingen env-styrte
sekundærdomener.

## Environment variables (Vercel-prosjektet)

`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dev-prosjektet),
`OPENAI_API_KEY` / `OPENAI_MODEL`, `RESEND_API_KEY` / `LEADS_FROM_EMAIL` /
`LEADS_TO_EMAIL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`.
GA-variablene er ikke satt ennå.

## Supabase Auth (`smertefri-dev-sep-26`)

Authentication → URL Configuration:

- **Site URL**: `https://app.smertefri.no`
- **Redirect URLs**: `https://app.smertefri.no/**`, `http://localhost:3000/**`,
  `http://localhost:3020/**`
- `mailer_autoconfirm = false` (e-postbekreftelse påkrevd)

### Custom SMTP — satt (2026-09-11)

Custom SMTP via Resend er konfigurert (Authentication → SMTP Settings):

| Felt | Verdi |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API-nøkkel (`RESEND_API_KEY`) |
| Sender email | `no-reply@send.smertefri.no` (samme verifiserte domene som lead-e-post) |
| Sender name | `SmerteFri` |

`rate_limit_email_sent` satt til 30/time. Verifisert via Supabase sine egne
auth-logger: `user_confirmation_requested` (registrering) og
`user_recovery_requested` (glemt passord) fullfører uten feil mot en ekte
Resend-testadresse (`delivered@resend.dev`). Kunne ikke bekrefte siste steg
(faktisk innboks-levering) programmatisk — Resend-nøkkelen i bruk er
send-only og har ikke lesetilgang til sende-loggen. Anbefaling: gjør én
manuell registrering/reset med en ekte adresse du selv kan sjekke, før
løsningen åpnes for reelle brukere.

## Migrasjoner og typer

```
supabase db push --linked
supabase gen types typescript --project-id lclsquqcongfnngtsgik --schema public 2>/dev/null > src/types/database.types.ts
```

## Backup (sjekket 11.9.2026)

Daglige fysiske backups kjører og fullfører normalt (verifisert via
Management API — 3 av 3 siste dager OK). **PITR (point-in-time recovery)
er ikke slått på** — ved et problem midt på dagen kan dere kun gjenopprette
til forrige natts backup, ikke til et nøyaktig tidspunkt. Org-planen er Pro,
så PITR kan slås på uten planoppgradering — vurder det før reelle
betalende kunder.

Alle fremmednøkler til `profiles(id)` har eksplisitt `on delete
cascade`/`on delete set null` (migrasjon `20260911000023`), så en bruker
kan faktisk slettes helt (GDPR-forespørsel) uten manuell SQL-opprydding
først — verifisert direkte mot `pg_constraint`.
