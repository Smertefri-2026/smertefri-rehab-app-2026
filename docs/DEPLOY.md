# Deploy — nye SmerteFri

Nye SmerteFri bygges fortløpende rett på produksjonsdomenene. Det finnes
**ikke** et eget staging-domene.

| | |
|---|---|
| Offentlig nettside | `https://smertefri.no` |
| Innlogget app | `https://app.smertefri.no` |
| Vercel-prosjekt | `smertefri-ny-staging` (id `prj_7dmZvBLa0VsuaDUMif2sVuKuWlmP`) |
| Git-branch (kilde) | `feature/nye-smertefri` |
| Supabase | `smertefri-dev-sep-26` (`lclsquqcongfnngtsgik`) — brukes inntil videre |
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

### Custom SMTP (må på plass før reelle brukere)

Default Supabase-SMTP er begrenset til noen få e-poster/time og gir dårlig
leveranse. Sett Custom SMTP (Authentication → SMTP Settings):

| Felt | Verdi |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API-nøkkel (`RESEND_API_KEY`) |
| Sender email | `no-reply@send.smertefri.no` (verifisert Resend-domene) |
| Sender name | `SmerteFri` |

Sett også `rate_limit_email_sent` til ~30. Verifiser at `send.smertefri.no`
har gyldige SPF/DKIM i Resend før du skrur på.

## Migrasjoner og typer

```
supabase db push --linked
supabase gen types typescript --project-id lclsquqcongfnngtsgik --schema public 2>/dev/null > src/types/database.types.ts
```
