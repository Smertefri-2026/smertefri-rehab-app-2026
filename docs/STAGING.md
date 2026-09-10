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

## Vercel — engangsoppsett (nytt prosjekt)

1. **Nytt prosjekt** i Vercel fra GitHub-repoet `Smertefri-2026/smertefri-rehab-app-2026`.
   Navn f.eks. `smertefri-ny-staging`. Framework: Next.js (auto).
2. **Production Branch** = `feature/nye-smertefri`
   (Settings → Git → Production Branch). Da blir hver push til den branchen en
   deploy av staging-prosjektet.
3. **Environment variables** (Settings → Environment Variables) — sett for
   *Production* (og gjerne Preview) i staging-prosjektet. Verdiene er dev-verdiene
   fra lokal `.env.local`:

   | Variabel | Verdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lclsquqcongfnngtsgik.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon-key (fra `.env.local`) |
   | `OPENAI_API_KEY` | som `.env.local` |
   | `OPENAI_MODEL` | som `.env.local` |
   | `NEXT_PUBLIC_GA_ID` | egen staging-property, eller la stå tom for å skru av GA |
   | `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` / `GA4_PROPERTY_ID` | valgfritt på staging |
   | `RESEND_API_KEY` | som `.env.local` (lead-e-post) |
   | `LEADS_FROM_EMAIL` / `LEADS_TO_EMAIL` | som `.env.local` |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | som `.env.local` — men legg `ny.smertefri.no` til i Turnstile-widgetens domeneliste |

4. **Domener** (Settings → Domains): legg til `ny.smertefri.no` og
   `app-ny.smertefri.no`.

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
