# Staging — «nye SmerteFri»

Staging kjører `feature/nye-smertefri` mot **dev-Supabase** (`smertefri-dev-sep-26`,
ref `lclsquqcongfnngtsgik`). Det er et eget miljø, helt adskilt fra produksjon.

| | Produksjon | Staging |
|---|---|---|
| Offentlig side | `smertefri.no` | `ny.smertefri.no` |
| App / innlogging | `app.smertefri.no` | `app-ny.smertefri.no` |
| Supabase | prod-prosjekt (egen) | `smertefri-dev-sep-26` |
| Git-branch | `main` | `feature/nye-smertefri` |
| Vercel-prosjekt | eksisterende (urørt) | eget, nytt (se under) |

**Produksjon røres ikke** før eksplisitt cutover-godkjenning: ikke endre
Production environment variables, ikke koble `smertefri.no`/`app.smertefri.no`
mot dev-Supabase, ikke deploy til prod-prosjektet.

## Hostname-routing

`src/middleware.ts` er miljø-drevet. Samme kodebase, hostname bestemmer:

- `ny.smertefri.no` → offentlig side, app-/auth-stier redirectes til `app-ny.smertefri.no`
- `app-ny.smertefri.no` → app; `/` → `/dashboard`, markedsføringsstier → `ny.smertefri.no`
- `*.vercel.app` og `localhost` → alt fra samme origin, ingen redirects

Staging og produksjon deler aldri sesjon (Supabase-sesjon ligger i `localStorage`
på app-domenet).

## Vercel — engangsoppsett

Prosjektet `smertefri-ny-staging` er opprettet i workspace-et «SmerteFri's
projects» (samme Hobby-konto som produksjon — eget prosjekt, ikke eget team).

Produksjonsbranch, env-variabler og domener settes med:

```
python3 scripts/setup-staging-vercel.py
```

Scriptet leser `VERCEL_TOKEN` fra `.env.local` og rører aldri
produksjonsprosjektet. Detaljene det setter:

1. **Production Branch** = `feature/nye-smertefri` → hver push til branchen
   blir en staging-deploy.
2. **Environment variables** (Production + Preview) fra `.env.local` — dev-verdier:

   | Variabel | Verdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lclsquqcongfnngtsgik.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon-key (fra `.env.local`) |
   | `OPENAI_API_KEY` / `OPENAI_MODEL` | som `.env.local` |
   | `RESEND_API_KEY` / `LEADS_FROM_EMAIL` / `LEADS_TO_EMAIL` | som `.env.local` (lead-e-post) |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | som `.env.local` — legg også `ny.smertefri.no` til i Turnstile-widgetens domeneliste |

   GA-variablene (`NEXT_PUBLIC_GA_ID`, `GA_*`) utelates bevisst på staging så
   testtrafikk ikke havner i prod-analytics.

3. **Domener**: `ny.smertefri.no` og `app-ny.smertefri.no` (scriptet legger dem til).

## DNS (hos den som hoster `smertefri.no`-sonen)

Legg til to poster — endrer ikke `smertefri.no` eller `app.smertefri.no`:

```
ny       CNAME   cname.vercel-dns.com.
app-ny   CNAME   cname.vercel-dns.com.
```

Vercel viser eksakt målverdi når domenet legges til; bruk den hvis den avviker.

## Supabase — dev-prosjektet (`smertefri-dev-sep-26`)

Authentication → URL Configuration:

- **Site URL**: `https://app-ny.smertefri.no`
- **Redirect URLs** (legg til): `https://app-ny.smertefri.no/**`,
  `http://localhost:3000/**`, `http://localhost:3020/**`
- Custom SMTP (Resend) anbefales for å unngå Supabas­es rate limit på e-post.

## Løpende drift

- Hver `git push` til `feature/nye-smertefri` → automatisk staging-deploy.
- Migrasjoner kjøres separat: `supabase db push --linked` (CLI er allerede
  koblet til dev-prosjektet).
- Databasetyper: `supabase gen types typescript --project-id lclsquqcongfnngtsgik --schema public 2>/dev/null > src/types/database.types.ts`
